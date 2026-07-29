const express = require('express');
const indicatorsService = require('../services/indicatorsService');
const { authenticateToken } = require('../middleware/auth');
const { siteDatabaseManager } = require('../config/siteDatabase');
const { runPool } = require('../utils/asyncPool');
const {
  buildCacheKey,
  getCache,
  inferSiteLevel,
  isFacilitySite,
  mergeIndicatorRows,
  resolveFacilityCodesByHierarchy,
  setCache,
  sumNumericFields
} = require('../utils/reportAggregation');
const { enforceSiteAccess } = require('../utils/siteAccess');

/**
 * Indicator 9 is computed: sum of 9.1 (Dead) + 9.2 (LTFU) + 9.3 (Transfer-out).
 * SQL file stems: 09.1_dead, 09.2_lost_to_followup, 09.3_transfer_out.
 */
const INDICATOR_9_LABEL = '9. Number of patients who left the service';
const LEFT_SERVICE_STEMS = ['09.1_dead', '09.2_lost_to_followup', '09.3_transfer_out'];
const NUMERIC_FIELDS = ['TOTAL', 'Male_0_14', 'Female_0_14', 'Male_over_14', 'Female_over_14'];

function buildIndicator9Row(dataArray) {
  const row = { Indicator: INDICATOR_9_LABEL };
  for (const field of NUMERIC_FIELDS) row[field] = 0;
  let found = false;
  for (const stem of LEFT_SERVICE_STEMS) {
    const r = dataArray.find((d) => {
      const ind = String(d?.Indicator || '');
      if (stem === '09.1_dead') return ind.startsWith('9.1') || ind.startsWith('8.2') || /dead/i.test(ind);
      if (stem === '09.2_lost_to_followup') return ind.startsWith('9.2') || ind.startsWith('8.3') || /LTFU|lost to follow/i.test(ind);
      if (stem === '09.3_transfer_out') return ind.startsWith('9.3') || ind.startsWith('8.4') || /transfer.?out/i.test(ind);
      return false;
    });
    if (r) {
      found = true;
      for (const field of NUMERIC_FIELDS) row[field] = (row[field] || 0) + Number(r[field] || 0);
    }
  }
  return found ? row : null;
}

function injectIndicator9(dataArray) {
  if (!Array.isArray(dataArray)) return dataArray;
  const alreadyHas = dataArray.some((r) => String(r?.Indicator || '').startsWith('9. Number of patients who left'));
  if (alreadyHas) return dataArray;
  const row = buildIndicator9Row(dataArray);
  if (!row) return dataArray;
  return [...dataArray, row];
}

const router = express.Router();

const STREAM_INDICATOR_CONCURRENCY = Number(process.env.STREAM_INDICATOR_CONCURRENCY || 2);
const SITE_BATCH_CONCURRENCY = Number(process.env.SITE_BATCH_CONCURRENCY || 2);

async function resolveAggregateContext(req) {
  const siteCode = String(req.query.siteCode || '').trim();
  const sites = await siteDatabaseManager.getAllSitesForManagement();
  const selected = sites.find((s) => String(s.code) === siteCode);
  const siteLevel = String(req.query.siteLevel || inferSiteLevel(siteCode, selected)).toLowerCase();
  const resolvedSiteCodes = resolveFacilityCodesByHierarchy(sites, siteCode, siteLevel);
  return { siteCode, siteLevel, resolvedSiteCodes, sites };
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
    const allowAll = String(req.query.siteLevel || '').toLowerCase() === 'country';
    const ctx = await requireSiteAccessContext(req, res, { allowAll });
    if (!ctx) return;
    const { siteCode, siteLevel, resolvedSiteCodes } = ctx;
    const params = queryParams(req);
    if (siteLevel === 'country') {
      const cacheKey = buildCacheKey('indicators-all', { ...params, siteCode: 'all', siteLevel });
      const cached = getCache(cacheKey);
      if (cached) return res.json(cached);
      
      const codes = resolvedSiteCodes.length > 0 
        ? resolvedSiteCodes 
        : ctx.sites.filter(isFacilitySite).map((s) => String(s.code));

      const batchResults = await runPool(codes, SITE_BATCH_CONCURRENCY, async (childCode) => {
        try {
          const value = await indicatorsService.executeAll(childCode, params);
          return { ok: true, value };
        } catch (error) {
          return { ok: false, error };
        }
      });

      const merged = mergeIndicatorRows(
        batchResults.filter((r) => r.ok).map((r) => (Array.isArray(r.value?.data) ? r.value.data : []))
      );
      const withIndicator9 = injectIndicator9(merged);

      const payload = {
        success: true,
        data: withIndicator9,
        metadata: { 
          siteLevel,
          aggregated: true,
          aggregateSupported: true,
          childCount: codes.length,
          resolvedSiteCodes: codes
        }
      };
      setCache(cacheKey, payload);
      return res.json(payload);
    }
    if (siteLevel === 'facility') {
      const result = await indicatorsService.executeAll(siteCode, params);
      const withIndicator9 = injectIndicator9(Array.isArray(result?.data) ? result.data : []);
      return res.json({
        ...result,
        data: withIndicator9,
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

    const batchResults = await runPool(resolvedSiteCodes, SITE_BATCH_CONCURRENCY, async (childCode) => {
      try {
        const value = await indicatorsService.executeAll(childCode, params);
        return { ok: true, value };
      } catch (error) {
        return { ok: false, error };
      }
    });

    const merged = mergeIndicatorRows(
      batchResults.filter((r) => r.ok).map((r) => (Array.isArray(r.value?.data) ? r.value.data : []))
    );
    const withIndicator9 = injectIndicator9(merged);
    const payload = {
      success: true,
      data: withIndicator9,
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
    const codes = siteLevel === 'country'
      ? (ctx.resolvedSiteCodes.length > 0 ? ctx.resolvedSiteCodes : ctx.sites.filter(isFacilitySite).map((s) => String(s.code)))
      : [];

    const params = queryParams(req);
    const ids = Array.from(indicatorsService.queries.keys()).sort();
    const startedAt = Date.now();

    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    let completed = 0;
    const total = ids.length;
    res.write(`${JSON.stringify({ type: 'start', total, timestamp: new Date().toISOString() })}\n`);

    await runPool(ids, STREAM_INDICATOR_CONCURRENCY, async (id) => {
      try {
        let row;
        if (siteLevel === 'country') {
          const results = await runPool(codes, 15, async (fc) => {
            try {
              const res = await indicatorsService.executeOne(fc, id, params);
              return { ok: true, value: res };
            } catch (err) {
              return { ok: false, error: err.message };
            }
          });
          const validResults = results.filter((r) => r.ok).map((r) => r.value);
          if (!validResults.length) {
            throw new Error(`All facilities failed to load indicator ${id}: ${results[0]?.error}`);
          }
          row = { Indicator: validResults[0].Indicator || id, TOTAL: 0 };
          for (const fr of validResults) {
            row = sumNumericFields(row, fr);
          }
        } else {
          row = await indicatorsService.executeOne(runSiteCode, id, params);
        }

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
    });

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
    const allowAll =
      String(req.query.siteLevel || '').toLowerCase() === 'country' ||
      String(req.query.siteCode || '').toLowerCase() === 'all' ||
      String(req.query.siteCode || '') === '__CAMBODIA__' ||
      String(req.query.siteCode || '') === '0000';
    const ctx = await requireSiteAccessContext(req, res, { allowAll });
    if (!ctx) return;
    const { siteCode, siteLevel, sites } = ctx;
    const detailOptions = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      ageGroup: req.query.ageGroup,
      gender: req.query.gender,
      minAge: req.query.minAge,
      maxAge: req.query.maxAge
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
    const result = await indicatorsService.executeOne(siteCode, req.params.indicatorId, queryParams(req));
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/** Reload indicator SQL files from disk without restarting Node.
 *  Safe — reads only from the server's own queries/indicators/ directory.
 *  Requires a valid auth token. */
router.all('/reload-queries', (req, res) => {
  indicatorsService.reload();
  res.json({
    success: true,
    message: 'Indicator SQL queries reloaded from disk.',
    count: indicatorsService.queries.size,
    detailCount: indicatorsService.detailQueries.size
  });
});

const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

/** Download all indicator SQL scripts as a ZIP archive */
router.get('/download-scripts', authenticateToken, (req, res) => {
  try {
    const queriesDir = path.resolve(__dirname, '../../queries');
    const tmpZipPath = path.join(os.tmpdir(), `indicator_scripts_${Date.now()}.zip`);

    // Use native zip command for maximum compatibility, ignoring .DS_Store
    execSync(`zip -r ${tmpZipPath} . -x "*.DS_Store"`, { cwd: queriesDir });

    res.download(tmpZipPath, 'all_indicator_scripts.zip', (err) => {
      if (err) {
        console.error('Error sending zip file:', err);
      }
      // Clean up the temporary file after download completes or fails
      if (fs.existsSync(tmpZipPath)) {
        fs.unlinkSync(tmpZipPath);
      }
    });
  } catch (error) {
    console.error('Error generating script download:', error);
    res.status(500).json({ success: false, error: 'Failed to generate download' });
  }
});

module.exports = router;
