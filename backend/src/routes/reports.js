const express = require('express');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { ScriptReportService } = require('../services/scriptReportService');
const infantReportService = require('../services/infantReportService');
const pnttReportService = require('../services/pnttReportService');
const { siteDatabaseManager } = require('../config/siteDatabase');
const {
  buildCacheKey,
  detailRowDedupeKey,
  getCache,
  inferSiteLevel,
  isFacilitySite,
  mergeSectionRows,
  resolveFacilityCodesByHierarchy,
  setCache
} = require('../utils/reportAggregation');
const { runPool } = require('../utils/asyncPool');

const SITE_BATCH_CONCURRENCY = Number(process.env.SITE_BATCH_CONCURRENCY || 2);

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

/**
 * Country/province (multi-facility rollup) → run detail per facility and merge, with site_code.
 */
async function runMergedReportDetail(runDetailScript, siteCode, siteLevel, scriptId, dateParams) {
  const sites = await siteDatabaseManager.getAllSitesForManagement();
  const selected = sites.find((s) => String(s.code) === String(siteCode));
  const level = String(
    siteLevel != null && siteLevel !== '' ? siteLevel : inferSiteLevel(siteCode, selected)
  ).toLowerCase();

  const resolvedCodes =
    level === 'country'
      ? (() => {
          const viaHierarchy = resolveFacilityCodesByHierarchy(sites, siteCode, 'country');
          if (viaHierarchy.length) return viaHierarchy;
          return sites.filter(isFacilitySite).map((s) => String(s.code));
        })()
      : resolveFacilityCodesByHierarchy(sites, siteCode, level);

  if (!resolvedCodes.length) {
    return { rows: [], error: null };
  }
  if (resolvedCodes.length === 1) {
    const single = await runDetailScript(resolvedCodes[0], scriptId, dateParams);
    if (single.error) return single;
    return {
      rows: (single.rows || []).map((row) => ({ ...row, site_code: row?.site_code ?? resolvedCodes[0] })),
      error: null
    };
  }

  const byKey = new Map();
  const errors = [];
  for (const code of resolvedCodes) {
    const result = await runDetailScript(code, scriptId, dateParams);
    if (result.error) {
      errors.push(result.error);
      continue;
    }
    for (const row of result.rows || []) {
      const rowWithSite = { ...row, site_code: row?.site_code ?? code };
      const k = detailRowDedupeKey(rowWithSite);
      if (k == null) {
        byKey.set(`row:${byKey.size}`, rowWithSite);
      } else if (!byKey.has(k)) {
        byKey.set(k, rowWithSite);
      }
    }
  }
  if (!byKey.size && errors.length) {
    return { rows: [], error: errors[0] };
  }
  return { rows: Array.from(byKey.values()), error: null };
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

    const batchResults = await runPool(resolvedSiteCodes, SITE_BATCH_CONCURRENCY, async (childCode) => {
      try {
        const value = await infantReportService.getReportData(childCode, params);
        return { ok: true, value };
      } catch (error) {
        return { ok: false, error };
      }
    });
    const merged = mergeSectionRows(
      batchResults.filter((r) => r.ok).map((r) => (Array.isArray(r.value?.data) ? r.value.data : []))
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

/** NDJSON section stream — country or facility only (same scope as single-site DB queries). */
router.get('/infant-report/stream', authenticateToken, async (req, res) => {
  try {
    const allowAll = String(req.query.siteLevel || '').toLowerCase() === 'country';
    const siteCode = requireSite(req, res, { allowAll });
    if (!siteCode) return;
    const { siteLevel } = await resolveAggregateContext(req, siteCode);
    if (siteLevel !== 'country' && siteLevel !== 'facility') {
      return res.status(400).json({
        success: false,
        error: 'Streaming is only available for country or facility scope.'
      });
    }
    const params = {
      startDate: req.query.startDate || '2025-01-01',
      endDate: req.query.endDate || '2025-03-31',
      previousEndDate: req.query.previousEndDate || '2024-12-31'
    };
    const dbSite = siteLevel === 'country' ? 'all' : siteCode;
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    await infantReportService.streamReportToResponse(res, dbSite, params);
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      try {
        res.write(`${JSON.stringify({ type: 'error', error: error.message })}\n`);
        res.end();
      } catch {
        /* ignore */
      }
    }
  }
});

router.get('/infant-report/details', authenticateToken, async (req, res) => {
  try {
    const allowAll = String(req.query.siteLevel || '').toLowerCase() === 'country';
    const siteCode = requireSite(req, res, { allowAll });
    if (!siteCode) return;
    const scriptId = String(req.query.scriptId || '').trim();
    if (!scriptId) return res.status(400).json({ success: false, error: 'scriptId is required', data: [] });
    const dateParams = {
      startDate: req.query.startDate || '2025-01-01',
      endDate: req.query.endDate || '2025-03-31',
      previousEndDate: req.query.previousEndDate || '2024-12-31'
    };
    const siteLevel = String(req.query.siteLevel || '').trim();
    const result = await runMergedReportDetail(
      infantReportService.runDetailScript.bind(infantReportService),
      siteCode,
      siteLevel,
      scriptId,
      dateParams
    );
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

    const batchResults = await runPool(resolvedSiteCodes, SITE_BATCH_CONCURRENCY, async (childCode) => {
      try {
        const value = await pnttReportService.getReportData(childCode, params);
        return { ok: true, value };
      } catch (error) {
        return { ok: false, error };
      }
    });
    const merged = mergeSectionRows(
      batchResults.filter((r) => r.ok).map((r) => (Array.isArray(r.value?.data) ? r.value.data : []))
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

router.get('/pntt-report/stream', authenticateToken, async (req, res) => {
  try {
    const allowAll = String(req.query.siteLevel || '').toLowerCase() === 'country';
    const siteCode = requireSite(req, res, { allowAll });
    if (!siteCode) return;
    const { siteLevel } = await resolveAggregateContext(req, siteCode);
    if (siteLevel !== 'country' && siteLevel !== 'facility') {
      return res.status(400).json({
        success: false,
        error: 'Streaming is only available for country or facility scope.'
      });
    }
    const params = {
      startDate: req.query.startDate || '2025-01-01',
      endDate: req.query.endDate || '2025-03-31',
      previousEndDate: req.query.previousEndDate || '2024-12-31'
    };
    const dbSite = siteLevel === 'country' ? 'all' : siteCode;
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    await pnttReportService.streamReportToResponse(res, dbSite, params);
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      try {
        res.write(`${JSON.stringify({ type: 'error', error: error.message })}\n`);
        res.end();
      } catch {
        /* ignore */
      }
    }
  }
});

router.get('/pntt-report/details', authenticateToken, async (req, res) => {
  try {
    const allowAll = String(req.query.siteLevel || '').toLowerCase() === 'country';
    const siteCode = requireSite(req, res, { allowAll });
    if (!siteCode) return;
    const scriptId = String(req.query.scriptId || '').trim();
    if (!scriptId) return res.status(400).json({ success: false, error: 'scriptId is required', data: [] });
    const dateParams = {
      startDate: req.query.startDate || '2025-01-01',
      endDate: req.query.endDate || '2025-03-31',
      previousEndDate: req.query.previousEndDate || '2024-12-31'
    };
    const siteLevel = String(req.query.siteLevel || '').trim();
    const result = await runMergedReportDetail(
      pnttReportService.runDetailScript.bind(pnttReportService),
      siteCode,
      siteLevel,
      scriptId,
      dateParams
    );
    if (result.error) return res.status(400).json({ success: false, error: result.error, data: [] });
    res.json({ success: true, data: result.rows || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
