/**
 * analytics.js — Express route
 *
 * All endpoints are READ from the analytics warehouse (analytics_indicator_summary).
 * The POST /refresh endpoint triggers an ETL write — but only to analytics_* tables.
 *
 * Zero changes to any existing route. Mounted at /apiv1/analytics in server.js.
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  runEtl,
  runEtlMulti,
  querySummary,
  queryCountryRollup,
  queryProvinceRollup,
  getEtlHistory,
  getLastRefreshed,
  ensureAnalyticsTables,
  getEtlProgress,
  getSitesSyncStatus,
  clearPeriodAnalytics,
  truncateAnalyticsTable,
  getSyncedPeriods
} = require('../services/analyticsEtlService');

const router = express.Router();

// Track in-progress ETL to prevent duplicate runs
let etlRunning = false;

// ─── Utility ──────────────────────────────────────────────────────────────────

function parsePeriodQuery(query) {
  const periodType = String(query.periodType || 'quarter').toLowerCase();
  const year = String(query.year || new Date().getFullYear());
  const quarter = String(query.quarter || Math.floor(new Date().getMonth() / 3) + 1);
  const month = String(query.month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);

  // Derive period label for queries
  let periodLabel;
  if (periodType === 'quarter') periodLabel = `${year}-Q${quarter}`;
  else if (periodType === 'month') periodLabel = month;
  else periodLabel = year;

  return { periodType, year, quarter, month, periodLabel };
}

// ─── GET /apiv1/analytics/status ─────────────────────────────────────────────
// Check whether warehouse has data for a period + when it was last refreshed.

router.get('/status', authenticateToken, async (req, res) => {
  try {
    const { periodLabel, periodType } = parsePeriodQuery(req.query);
    await ensureAnalyticsTables();

    const lastRefreshed = await getLastRefreshed(periodLabel);
    const history = await getEtlHistory({ limit: 5 });
    const progress = getEtlProgress();

    res.json({
      success: true,
      periodLabel,
      periodType,
      lastRefreshed,
      hasData: Boolean(lastRefreshed),
      etlRunning,
      etlProgress: progress,
      recentHistory: history
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── GET /apiv1/analytics/synced-periods ───────────────────────────────────────────
// Get a flat array of all period keys that have at least one record in the warehouse.

router.get('/synced-periods', authenticateToken, async (req, res) => {
  try {
    const periods = await getSyncedPeriods();
    res.json({
      success: true,
      data: periods
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── GET /apiv1/analytics/sites-status ────────────────────────────────────────
// Get all facility sites and their sync status in analytics warehouse for a given period.

router.get('/sites-status', authenticateToken, async (req, res) => {
  try {
    const { periodLabel } = parsePeriodQuery(req.query);
    const sitesStatus = await getSitesSyncStatus(periodLabel);
    
    res.json({
      success: true,
      periodLabel,
      data: sitesStatus
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── GET /apiv1/analytics/country ─────────────────────────────────────────────
// Country-level rollup — extremely fast (reads warehouse, not clinical tables).

router.get('/country', authenticateToken, async (req, res) => {
  try {
    const { periodLabel, periodType } = parsePeriodQuery(req.query);
    const rows = await queryCountryRollup({ periodLabel, periodType });
    const lastRefreshed = await getLastRefreshed(periodLabel);

    res.json({
      success: true,
      data: rows,
      meta: {
        periodLabel,
        periodType,
        lastRefreshed,
        rowCount: rows.length
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── GET /apiv1/analytics/province ────────────────────────────────────────────
// Province-level rollup per indicator.

router.get('/province', authenticateToken, async (req, res) => {
  try {
    const { periodLabel, periodType } = parsePeriodQuery(req.query);
    const rows = await queryProvinceRollup({ periodLabel, periodType });
    const lastRefreshed = await getLastRefreshed(periodLabel);

    res.json({
      success: true,
      data: rows,
      meta: {
        periodLabel,
        periodType,
        lastRefreshed,
        rowCount: rows.length
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── GET /apiv1/analytics/summary ─────────────────────────────────────────────
// Flexible query: filter by province, site, period.

router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { periodLabel, periodType } = parsePeriodQuery(req.query);
    const provinceId = String(req.query.provinceId || '').trim() || undefined;
    const siteCode = String(req.query.siteCode || '').trim() || undefined;

    const rows = await querySummary({ periodLabel, periodType, provinceId, siteCode });

    res.json({
      success: true,
      data: rows,
      meta: { periodLabel, periodType, provinceId, siteCode, rowCount: rows.length }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── GET /apiv1/analytics/etl-history ─────────────────────────────────────────
// Return recent ETL run log.

router.get('/etl-history', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const history = await getEtlHistory({ limit });
    res.json({ success: true, data: history });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── POST /apiv1/analytics/refresh ────────────────────────────────────────────
// Trigger ETL for a given period or multiple periods.
// Supports `periods` array (e.g. ["2025-Q1","2025-Q2"]) for batch sync.
// Year keys like "2025-Y" are automatically expanded to Q1-Q4 by runEtlMulti.
// Prevents duplicate concurrent runs.

router.post('/refresh', authenticateToken, async (req, res) => {
  if (etlRunning) {
    return res.status(409).json({
      success: false,
      error: 'ETL is already running. Please wait for it to finish.'
    });
  }

  const body = req.body || req.query;
  const periods = Array.isArray(body.periods) ? body.periods : null;
  const indicators = Array.isArray(body.indicators) ? body.indicators : [];
  const siteCodes = Array.isArray(body.siteCodes) ? body.siteCodes : (body.siteCode ? [body.siteCode] : []);

  if (periods && periods.length > 0) {
    // ── Multi-period batch sync ──────────────────────────────────────
    res.json({
      success: true,
      message: `ETL started for ${periods.length} period(s): ${periods.slice(0, 4).join(', ')}${periods.length > 4 ? '...' : ''}. Check /analytics/status for progress.`,
      periods,
      siteCodes: siteCodes.length > 0 ? siteCodes : 'all'
    });

    etlRunning = true;
    runEtlMulti({ periodKeys: periods, triggeredBy: 'manual', indicators, siteCodes })
      .then((result) => {
        console.log(`[Analytics] Multi ETL completed: ${result.totalRows} rows across ${result.results.length} periods`);
      })
      .catch((e) => {
        console.error(`[Analytics] Multi ETL failed: ${e.message}`);
      })
      .finally(() => {
        etlRunning = false;
      });
  } else {
    // ── Single-period sync ───────────────────────────────────────────
    const { periodType, year, quarter, month, periodLabel } = parsePeriodQuery(body);

    if (periodType === 'year') {
      // ── Year → expand to Q1 + Q2 + Q3 + Q4 ─────────────────────────
      // Always store year data as four quarterly records so the warehouse
      // can be queried per-quarter. Never write a single full-year row.
      const quarterKeys = [`${year}-Q1`, `${year}-Q2`, `${year}-Q3`, `${year}-Q4`];

      res.json({
        success: true,
        message: `Year ${year} expanded to 4 quarters: ${quarterKeys.join(', ')}. ETL started. Check /analytics/status for progress.`,
        periods: quarterKeys,
        periodType: 'quarter',
        siteCodes: siteCodes.length > 0 ? siteCodes : 'all'
      });

      etlRunning = true;
      runEtlMulti({ periodKeys: quarterKeys, triggeredBy: 'manual', indicators, siteCodes })
        .then((result) => {
          console.log(`[Analytics] Year ETL (${year}) completed: ${result.totalRows} rows across ${result.results.length} quarters`);
        })
        .catch((e) => {
          console.error(`[Analytics] Year ETL (${year}) failed: ${e.message}`);
        })
        .finally(() => {
          etlRunning = false;
        });

    } else {
      // ── Quarter / month ──────────────────────────────────────────────
      res.json({
        success: true,
        message: `ETL started for ${periodLabel}. Check /analytics/status for progress.`,
        periodLabel,
        periodType,
        siteCodes: siteCodes.length > 0 ? siteCodes : 'all'
      });

      etlRunning = true;
      runEtl({ periodType, year, quarter, month, triggeredBy: 'manual', indicators, siteCodes })
        .then((result) => {
          console.log(`[Analytics] ETL completed: ${result.rowCount} rows for ${result.periodLabel}`);
        })
        .catch((e) => {
          console.error(`[Analytics] ETL failed: ${e.message}`);
        })
        .finally(() => {
          etlRunning = false;
        });
    }
  }
});

// ─── POST /apiv1/analytics/clear ─────────────────────────────────────────────
// Clear analytic data for a specific period or truncate the entire summary table.
router.post('/clear', authenticateToken, async (req, res) => {
  try {
    const { clearAll } = req.body || req.query || {};
    const isClearAll = clearAll === true || clearAll === 'true' || clearAll === 1 || clearAll === '1';

    if (isClearAll) {
      await truncateAnalyticsTable();
      return res.json({
        success: true,
        message: 'Successfully cleared all analytics data from the warehouse.'
      });
    } else {
      const { periodLabel, periodType } = parsePeriodQuery(req.body || req.query);
      const { indicator, siteCode } = req.body || req.query || {};
      
      await clearPeriodAnalytics({ periodLabel, periodType, indicator, siteCode });
      
      let msg = `Successfully cleared analytics data for ${periodLabel}.`;
      if (indicator && siteCode) msg = `Successfully cleared analytics data for indicator "${indicator}" at site "${siteCode}" in ${periodLabel}.`;
      else if (indicator) msg = `Successfully cleared analytics data for indicator "${indicator}" in ${periodLabel}.`;
      else if (siteCode) msg = `Successfully cleared analytics data for site "${siteCode}" in ${periodLabel}.`;

      return res.json({
        success: true,
        message: msg,
        periodLabel,
        periodType,
        indicator,
        siteCode
      });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
