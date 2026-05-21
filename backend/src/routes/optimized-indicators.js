const express = require('express');
const indicatorsService = require('../services/indicatorsService');
const { authenticateToken } = require('../middleware/auth');
const { siteDatabaseManager } = require('../config/siteDatabase');
const {
  buildCacheKey,
  getCache,
  inferSiteLevel,
  isFacilitySite,
  mergeIndicatorRows,
  resolveFacilityCodesByHierarchy,
  setCache
} = require('../utils/reportAggregation');
const { enforceSiteAccess } = require('../utils/siteAccess');

const router = express.Router();

function refreshIndicatorQueries() {
  if (process.env.NODE_ENV !== 'production') {
    indicatorsService.reload();
  }
}

function requireSiteCode(req, res, options = {}) {
  const siteCode = String(req.query.siteCode || '').trim();
  const allowAll = Boolean(options.allowAll);
  if (!siteCode || (!allowAll && siteCode.toLowerCase() === 'all')) {
    res.status(400).json({ success: false, error: 'siteCode is required and must be a single site' });
    return null;
  }
  return siteCode;
}

function queryParams(req) {
  return {
    StartDate: req.query.startDate || '2025-01-01',
    EndDate: req.query.endDate || '2025-03-31',
    PreviousEndDate: req.query.previousEndDate || '2024-12-31',
    dead_code: 1,
    lost_code: 0,
    transfer_in_code: 1,
    transfer_out_code: 3,
    mmd_eligible_code: 0,
    mmd_drug_quantity: 60,
    vl_suppression_threshold: 1000,
    tld_regimen_formula: '3TC + DTG + TDF',
    tpt_drug_list: "'Isoniazid','3HP','6H'",
    ReengageDays: 28,
    GraceDays: 14
  };
}

async function resolveAggregateContext(req) {
  const siteCode = String(req.query.siteCode || '').trim();
  const sites = await siteDatabaseManager.getAllSitesForManagement();
  const selected = sites.find((s) => String(s.code) === siteCode);
  const siteLevel = String(req.query.siteLevel || inferSiteLevel(siteCode, selected)).toLowerCase();
  const resolvedSiteCodes = resolveFacilityCodesByHierarchy(sites, siteCode, siteLevel);
  return { siteCode, siteLevel, resolvedSiteCodes };
}

async function requireSiteAccessContext(req, res, options = {}) {
  const allowAll = Boolean(options.allowAll);
  const siteCode = requireSiteCode(req, res, { allowAll });
  if (!siteCode) return null;
  const ctx = await resolveAggregateContext(req);
  const codesToCheck =
    ctx.siteLevel === 'facility'
      ? [ctx.siteCode]
      : ctx.resolvedSiteCodes.length > 0
        ? ctx.resolvedSiteCodes
        : [ctx.siteCode];
  if (!enforceSiteAccess(req, res, ctx.siteCode, { allowAll, resolvedSiteCodes: codesToCheck })) {
    return null;
  }
  return ctx;
}

router.get('/all', authenticateToken, async (req, res) => {
  try {
    refreshIndicatorQueries();
    const allowAll = String(req.query.siteLevel || '').toLowerCase() === 'country';
    const ctx = await requireSiteAccessContext(req, res, { allowAll });
    if (!ctx) return;
    const { siteCode, siteLevel, resolvedSiteCodes } = ctx;
    const params = queryParams(req);
    if (siteLevel === 'country') {
      const cacheKey = buildCacheKey('indicators-all', { ...params, siteCode: 'all', siteLevel });
      const cached = getCache(cacheKey);
      if (cached) return res.json(cached);
      const result = await indicatorsService.executeAll('all', params);
      const payload = {
        ...result,
        metadata: {
          siteLevel,
          aggregated: true,
          aggregateSupported: true,
          childCount: resolvedSiteCodes.length,
          resolvedSiteCodes
        }
      };
      setCache(cacheKey, payload);
      return res.json(payload);
    }
    if (siteLevel === 'facility') {
      const result = await indicatorsService.executeAll(siteCode, params);
      return res.json({
        ...result,
        metadata: {
          siteLevel,
          aggregated: false,
          aggregateSupported: true,
          childCount: 1,
          resolvedSiteCodes: [siteCode]
        }
      });
    }

    const cacheKey = buildCacheKey('indicators-all', { ...params, siteCode, siteLevel });
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    if (!resolvedSiteCodes.length) {
      return res.json({
        success: true,
        data: [],
        metadata: {
          siteLevel,
          aggregated: true,
          aggregateSupported: true,
          childCount: 0,
          resolvedSiteCodes: []
        }
      });
    }

    const settled = await Promise.allSettled(
      resolvedSiteCodes.map((childCode) => indicatorsService.executeAll(childCode, params))
    );
    const merged = mergeIndicatorRows(
      settled
        .filter((r) => r.status === 'fulfilled')
        .map((r) => (Array.isArray(r.value?.data) ? r.value.data : []))
    );
    const payload = {
      success: true,
      data: merged,
      metadata: {
        siteLevel,
        aggregated: true,
        aggregateSupported: true,
        childCount: resolvedSiteCodes.length,
        resolvedSiteCodes
      }
    };
    setCache(cacheKey, payload);
    res.json(payload);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/all/stream', authenticateToken, async (req, res) => {
  try {
    refreshIndicatorQueries();
    const allowAll = String(req.query.siteLevel || '').toLowerCase() === 'country';
    const ctx = await requireSiteAccessContext(req, res, { allowAll });
    if (!ctx) return;
    const { siteCode, siteLevel } = ctx;
    if (siteLevel !== 'facility' && siteLevel !== 'country') {
      return res.status(400).json({
        success: false,
        error: 'Streaming aggregate is supported for facility/country only',
        metadata: {
          siteLevel,
          aggregateSupported: false
        }
      });
    }
    const runSiteCode = siteLevel === 'country' ? 'all' : siteCode;

    const params = queryParams(req);
    const ids = Array.from(indicatorsService.queries.keys()).sort();
    const startedAt = Date.now();

    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    let completed = 0;
    const total = ids.length;
    res.write(`${JSON.stringify({ type: 'start', total, timestamp: new Date().toISOString() })}\n`);

    await Promise.all(
      ids.map(async (id) => {
        try {
          const row = await indicatorsService.executeOne(runSiteCode, id, params);
          completed += 1;
          res.write(
            `${JSON.stringify({
              type: 'indicator',
              indicatorId: id,
              completed,
              total,
              data: row
            })}\n`
          );
        } catch (error) {
          completed += 1;
          res.write(
            `${JSON.stringify({
              type: 'indicator_error',
              indicatorId: id,
              completed,
              total,
              error: error.message
            })}\n`
          );
        }
      })
    );

    res.write(
      `${JSON.stringify({
        type: 'done',
        total,
        completed,
        durationMs: Date.now() - startedAt
      })}\n`
    );
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/query-reference', authenticateToken, async (req, res) => {
  try {
    const params = queryParams(req);
    const data = indicatorsService.getQueryReference(params);
    res.json({
      success: true,
      paramsUsed: params,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/details/:indicatorId', authenticateToken, async (req, res) => {
  try {
    const allowAll = String(req.query.siteLevel || '').toLowerCase() === 'country';
    const ctx = await requireSiteAccessContext(req, res, { allowAll });
    if (!ctx) return;
    refreshIndicatorQueries();
    const { siteCode, siteLevel } = ctx;
    const sites = await siteDatabaseManager.getAllSitesForManagement();
    const detailOptions = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      ageGroup: req.query.ageGroup,
      gender: req.query.gender
    };
    const params = queryParams(req);
    const indicatorId = req.params.indicatorId;

    let result;
    if (siteLevel === 'country') {
      const countryCodes = resolveFacilityCodesByHierarchy(sites, siteCode, 'country');
      const fallbackAllFacilities = sites.filter(isFacilitySite).map((s) => String(s.code));
      const codes = countryCodes.length > 0 ? countryCodes : fallbackAllFacilities;
      if (codes.length > 0) {
        result = await indicatorsService.executeDetailsMerged(codes, indicatorId, params, detailOptions);
      } else {
        result = await indicatorsService.executeDetails('all', indicatorId, params, detailOptions);
      }
    } else {
      const resolved = resolveFacilityCodesByHierarchy(sites, siteCode, siteLevel);
      const codes = resolved.length > 0 ? resolved : [siteCode];
      if (codes.length === 1) {
        result = await indicatorsService.executeDetails(codes[0], indicatorId, params, detailOptions);
      } else {
        result = await indicatorsService.executeDetailsMerged(codes, indicatorId, params, detailOptions);
      }
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:indicatorId', authenticateToken, async (req, res) => {
  try {
    const siteCode = requireSiteCode(req, res);
    if (!siteCode) return;
    if (!enforceSiteAccess(req, res, siteCode, { resolvedSiteCodes: [siteCode] })) return;
    refreshIndicatorQueries();
    const result = await indicatorsService.executeOne(siteCode, req.params.indicatorId, queryParams(req));
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
