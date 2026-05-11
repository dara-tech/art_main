const express = require('express');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { ScriptReportService } = require('../services/scriptReportService');
const infantReportService = require('../services/infantReportService');
const pnttReportService = require('../services/pnttReportService');
const { siteDatabaseManager } = require('../config/siteDatabase');
const {
  buildCacheKey,
  getCache,
  inferSiteLevel,
  mergeSectionRows,
  resolveFacilityCodesByHierarchy,
  setCache
} = require('../utils/reportAggregation');

const router = express.Router();

const infantService = new ScriptReportService({
  aggregateDir: path.resolve(__dirname, '../../queries/INFANT_AGGREGATE_SCRIPTS'),
  detailDir: path.resolve(__dirname, '../../queries/INFANT_DETAIL_SCRIPTS')
});

const pnttService = new ScriptReportService({
  aggregateDir: path.resolve(__dirname, '../../queries/PNTT_AGGREGATE_SCRIPTS'),
  detailDir: path.resolve(__dirname, '../../queries/PNTT_DETAIL_SCRIPTS')
});

function buildParams(query) {
  return {
    StartDate: query.startDate || '2025-01-01',
    EndDate: query.endDate || '2025-03-31',
    PreviousEndDate: query.previousEndDate || '2024-12-31'
  };
}

function requireSite(req, res, options = {}) {
  const siteCode = String(req.query.siteCode || '').trim();
  const allowAll = Boolean(options.allowAll);
  if (!siteCode || (!allowAll && siteCode.toLowerCase() === 'all')) {
    res.status(400).json({ success: false, error: 'siteCode is required' });
    return null;
  }
  return siteCode;
}

async function resolveAggregateContext(req, siteCode) {
  const sites = await siteDatabaseManager.getAllSitesForManagement();
  const selected = sites.find((s) => String(s.code) === String(siteCode));
  const siteLevel = String(req.query.siteLevel || inferSiteLevel(siteCode, selected)).toLowerCase();
  const resolvedSiteCodes = resolveFacilityCodesByHierarchy(sites, siteCode, siteLevel);
  return { siteLevel, resolvedSiteCodes };
}

router.get('/infant-report', authenticateToken, async (req, res) => {
  try {
    const allowAll = String(req.query.siteLevel || '').toLowerCase() === 'country';
    const siteCode = requireSite(req, res, { allowAll });
    if (!siteCode) return;
    const params = {
      startDate: req.query.startDate || '2025-01-01',
      endDate: req.query.endDate || '2025-03-31',
      previousEndDate: req.query.previousEndDate || '2024-12-31'
    };
    const { siteLevel, resolvedSiteCodes } = await resolveAggregateContext(req, siteCode);
    const cacheKey = buildCacheKey('infant-report', { siteCode, siteLevel, ...params });
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const startedAt = Date.now();
    if (siteLevel === 'country') {
      const result = await infantReportService.getReportData('all', params);
      const payload = {
        ...result,
        durationMs: Date.now() - startedAt,
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
      const result = await infantReportService.getReportData(siteCode, params);
      const payload = {
        ...result,
        durationMs: Date.now() - startedAt,
        metadata: {
          siteLevel,
          aggregated: false,
          aggregateSupported: true,
          childCount: 1,
          resolvedSiteCodes: [siteCode]
        }
      };
      setCache(cacheKey, payload);
      return res.json(payload);
    }

    if (!resolvedSiteCodes.length) {
      return res.json({
        success: true,
        data: [],
        durationMs: Date.now() - startedAt,
        metadata: { siteLevel, aggregated: true, aggregateSupported: true, childCount: 0, resolvedSiteCodes: [] }
      });
    }

    const settled = await Promise.allSettled(
      resolvedSiteCodes.map((childCode) => infantReportService.getReportData(childCode, params))
    );
    const merged = mergeSectionRows(
      settled
        .filter((r) => r.status === 'fulfilled')
        .map((r) => (Array.isArray(r.value?.data) ? r.value.data : []))
    );
    const payload = {
      success: true,
      data: merged,
      durationMs: Date.now() - startedAt,
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

router.get('/infant-report/details', authenticateToken, async (req, res) => {
  try {
    const allowAll = String(req.query.siteLevel || '').toLowerCase() === 'country';
    const siteCode = requireSite(req, res, { allowAll });
    if (!siteCode) return;
    const scriptId = String(req.query.scriptId || '').trim();
    if (!scriptId) return res.status(400).json({ success: false, error: 'scriptId is required', data: [] });
    const result = await infantReportService.runDetailScript(siteCode, scriptId, {
      startDate: req.query.startDate || '2025-01-01',
      endDate: req.query.endDate || '2025-03-31',
      previousEndDate: req.query.previousEndDate || '2024-12-31'
    });
    if (result.error) return res.status(400).json({ success: false, error: result.error, data: [] });
    res.json({ success: true, data: result.rows || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pntt-report', authenticateToken, async (req, res) => {
  try {
    const allowAll = String(req.query.siteLevel || '').toLowerCase() === 'country';
    const siteCode = requireSite(req, res, { allowAll });
    if (!siteCode) return;
    const params = {
      startDate: req.query.startDate || '2025-01-01',
      endDate: req.query.endDate || '2025-03-31',
      previousEndDate: req.query.previousEndDate || '2024-12-31'
    };
    const { siteLevel, resolvedSiteCodes } = await resolveAggregateContext(req, siteCode);
    const cacheKey = buildCacheKey('pntt-report', { siteCode, siteLevel, ...params });
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const startedAt = Date.now();
    if (siteLevel === 'country') {
      const result = await pnttReportService.getReportData('all', params);
      const payload = {
        ...result,
        durationMs: Date.now() - startedAt,
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
      const result = await pnttReportService.getReportData(siteCode, params);
      const payload = {
        ...result,
        durationMs: Date.now() - startedAt,
        metadata: {
          siteLevel,
          aggregated: false,
          aggregateSupported: true,
          childCount: 1,
          resolvedSiteCodes: [siteCode]
        }
      };
      setCache(cacheKey, payload);
      return res.json(payload);
    }

    if (!resolvedSiteCodes.length) {
      return res.json({
        success: true,
        data: [],
        durationMs: Date.now() - startedAt,
        metadata: { siteLevel, aggregated: true, aggregateSupported: true, childCount: 0, resolvedSiteCodes: [] }
      });
    }

    const settled = await Promise.allSettled(
      resolvedSiteCodes.map((childCode) => pnttReportService.getReportData(childCode, params))
    );
    const merged = mergeSectionRows(
      settled
        .filter((r) => r.status === 'fulfilled')
        .map((r) => (Array.isArray(r.value?.data) ? r.value.data : []))
    );
    const payload = {
      success: true,
      data: merged,
      durationMs: Date.now() - startedAt,
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

router.get('/pntt-report/details', authenticateToken, async (req, res) => {
  try {
    const allowAll = String(req.query.siteLevel || '').toLowerCase() === 'country';
    const siteCode = requireSite(req, res, { allowAll });
    if (!siteCode) return;
    const scriptId = String(req.query.scriptId || '').trim();
    if (!scriptId) return res.status(400).json({ success: false, error: 'scriptId is required', data: [] });
    const result = await pnttReportService.runDetailScript(siteCode, scriptId, {
      startDate: req.query.startDate || '2025-01-01',
      endDate: req.query.endDate || '2025-03-31',
      previousEndDate: req.query.previousEndDate || '2024-12-31'
    });
    if (result.error) return res.status(400).json({ success: false, error: result.error, data: [] });
    res.json({ success: true, data: result.rows || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
