/**
 * analyticsEtlService.js
 *
 * Pre-aggregates indicator data from all facility sites and writes results into
 * the analytics_indicator_summary table inside main_dbs.
 *
 * SAFETY:  This service is 100% READ-ONLY on all clinical tables.
 *          It only WRITES to analytics_* tables which are owned by this service.
 *          It never modifies tblpatient, tblart, tblstatus, or any existing table.
 */

const { getWarehouseSequelize } = require('../config/warehouseDatabase');
const indicatorsService = require('./indicatorsService');
const { siteDatabaseManager } = require('../config/siteDatabase');
const { runPool } = require('../utils/asyncPool');

const ETL_CONCURRENCY = Number(process.env.ETL_CONCURRENCY || 2);

let etlProgress = {
  active: false,
  completedSites: 0,
  totalSites: 0,
  processedRows: 0,
  lastProcessedSite: '',
  startedAt: null,
  // Multi-period fields
  currentPeriodLabel: '',
  totalPeriods: 0,
  completedPeriods: 0
};

function getEtlProgress() {
  return etlProgress;
}

// ─── Schema bootstrap ─────────────────────────────────────────────────────────

/**
 * Create analytics tables inside main_dbs if they don't exist.
 * Uses CREATE TABLE IF NOT EXISTS — 100% safe to run multiple times.
 */
async function ensureAnalyticsTables() {
  await getWarehouseSequelize().query(`
    CREATE TABLE IF NOT EXISTS analytics_indicator_summary (
      id              BIGINT AUTO_INCREMENT PRIMARY KEY,
      period_type     VARCHAR(10)   NOT NULL COMMENT 'quarter | month | year | day',
      period_label    VARCHAR(20)   NOT NULL COMMENT '2025-Q1 | 2025-01 | 2025',
      start_date      DATE          NOT NULL,
      end_date        DATE          NOT NULL,
      province_id     VARCHAR(10)   NULL,
      province_name   VARCHAR(100)  NULL,
      site_code       VARCHAR(20)   NOT NULL,
      site_name       VARCHAR(150)  NULL,
      indicator       VARCHAR(200)  NOT NULL,
      male_0_14       INT           NOT NULL DEFAULT 0,
      female_0_14     INT           NOT NULL DEFAULT 0,
      male_over_14    INT           NOT NULL DEFAULT 0,
      female_over_14  INT           NOT NULL DEFAULT 0,
      created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
      updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      UNIQUE KEY uq_summary (period_type, period_label, site_code, indicator(100)),
      INDEX idx_period    (period_type, period_label),
      INDEX idx_province  (province_id),
      INDEX idx_site      (site_code),
      INDEX idx_indicator (indicator(50))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Pre-aggregated indicator warehouse — populated by ETL only'
  `);

  await getWarehouseSequelize().query(`
    CREATE TABLE IF NOT EXISTS analytics_etl_log (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      period_label  VARCHAR(20)   NOT NULL,
      period_type   VARCHAR(10)   NOT NULL,
      start_date    DATE          NOT NULL,
      end_date      DATE          NOT NULL,
      site_count    INT           DEFAULT 0,
      row_count     INT           DEFAULT 0,
      duration_ms   INT           DEFAULT 0,
      status        VARCHAR(20)   DEFAULT 'running' COMMENT 'running | success | failed',
      error_msg     TEXT          NULL,
      triggered_by  VARCHAR(50)   NULL COMMENT 'cron | manual | system',
      started_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
      finished_at   TIMESTAMP     NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ETL run history'
  `);
}

// ─── Period helpers ───────────────────────────────────────────────────────────

function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildPeriod(periodType, year, quarter, month) {
  let start, end, label;
  if (periodType === 'quarter') {
    const q = Number(quarter);
    const startMonth = (q - 1) * 3;
    start = new Date(Number(year), startMonth, 1);
    end = new Date(Number(year), startMonth + 3, 0);
    label = `${year}-Q${q}`;
  } else if (periodType === 'month') {
    const [y, m] = String(month).split('-').map(Number);
    start = new Date(y, m - 1, 1);
    end = new Date(y, m, 0);
    label = String(month);
  } else {
    // year
    start = new Date(Number(year), 0, 1);
    end = new Date(Number(year), 11, 31);
    label = String(year);
  }
  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  return {
    periodType,
    startDate: fmt(start),
    endDate: fmt(end),
    previousEndDate: fmt(previousEnd),
    label
  };
}

// ─── ETL log helpers ──────────────────────────────────────────────────────────

async function createEtlLog({ periodLabel, periodType, startDate, endDate, triggeredBy }) {
  const [result] = await getWarehouseSequelize().query(
    `INSERT INTO analytics_etl_log
       (period_label, period_type, start_date, end_date, status, triggered_by)
     VALUES (:periodLabel, :periodType, :startDate, :endDate, 'running', :triggeredBy)`,
    { replacements: { periodLabel, periodType, startDate, endDate, triggeredBy } }
  );
  return result.insertId || result;
}

async function updateEtlLog(id, { status, siteCount, rowCount, durationMs, errorMsg }) {
  await getWarehouseSequelize().query(
    `UPDATE analytics_etl_log
     SET status = :status,
         site_count = :siteCount,
         row_count = :rowCount,
         duration_ms = :durationMs,
         error_msg = :errorMsg,
         finished_at = NOW()
     WHERE id = :id`,
    {
      replacements: {
        id,
        status,
        siteCount: siteCount || 0,
        rowCount: rowCount || 0,
        durationMs: durationMs || 0,
        errorMsg: errorMsg || null
      }
    }
  );
}

// ─── Core ETL logic ───────────────────────────────────────────────────────────

/**
 * Upsert a single indicator row for one site into the warehouse.
 * Uses INSERT ... ON DUPLICATE KEY UPDATE — never overwrites clinical data.
 */
async function upsertSummaryRow({ periodType, periodLabel, startDate, endDate, provinceId, provinceName, siteCode, siteName, indicator, male014, female014, maleOver14, femaleOver14 }) {
  await getWarehouseSequelize().query(
    `INSERT INTO analytics_indicator_summary
       (period_type, period_label, start_date, end_date,
        province_id, province_name, site_code, site_name,
        indicator, male_0_14, female_0_14, male_over_14, female_over_14)
     VALUES
       (:periodType, :periodLabel, :startDate, :endDate,
        :provinceId, :provinceName, :siteCode, :siteName,
        :indicator, :male014, :female014, :maleOver14, :femaleOver14)
     ON DUPLICATE KEY UPDATE
       province_id    = VALUES(province_id),
       province_name  = VALUES(province_name),
       site_name      = VALUES(site_name),
       male_0_14      = VALUES(male_0_14),
       female_0_14    = VALUES(female_0_14),
       male_over_14   = VALUES(male_over_14),
       female_over_14 = VALUES(female_over_14),
       updated_at     = NOW()`,
    {
      replacements: {
        periodType, periodLabel, startDate, endDate,
        provinceId: provinceId || null,
        provinceName: provinceName || null,
        siteCode,
        siteName: siteName || null,
        indicator,
        male014: male014 || 0,
        female014: female014 || 0,
        maleOver14: maleOver14 || 0,
        femaleOver14: femaleOver14 || 0
      }
    }
  );
}

const INDICATOR_DEFAULT_PARAMS = {
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

/**
 * Run ETL for one facility site and one period.
 * Returns number of rows upserted.
 */
async function processSite(site, periodParams) {
  const { startDate, endDate, previousEndDate, label, periodType } = periodParams;
  const params = {
    StartDate: startDate,
    EndDate: endDate,
    PreviousEndDate: previousEndDate,
    ...INDICATOR_DEFAULT_PARAMS
  };

  let result;
  try {
    result = await indicatorsService.executeAll(String(site.code), params);
  } catch (e) {
    // Site query failed — skip gracefully, don't break the ETL run
    console.warn(`[ETL] Site ${site.code} failed: ${e.message}`);
    return 0;
  }

  const rows = Array.isArray(result?.data) ? result.data : [];
  let upserted = 0;

  for (const row of rows) {
    const indicator = String(row?.Indicator || '').trim();
    if (!indicator) continue;

    try {
      await upsertSummaryRow({
        periodType,
        periodLabel: label,
        startDate,
        endDate,
        provinceId: String(site.province_id || ''),
        provinceName: String(site.province || ''),
        siteCode: String(site.code),
        siteName: String(site.name || ''),
        indicator,
        male014: Number(row?.Male_0_14 ?? 0),
        female014: Number(row?.Female_0_14 ?? 0),
        maleOver14: Number(row?.Male_over_14 ?? 0),
        femaleOver14: Number(row?.Female_over_14 ?? 0)
      });
      upserted++;
    } catch (e) {
      console.warn(`[ETL] Upsert failed for site ${site.code} / ${indicator}: ${e.message}`);
    }
  }

  return upserted;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Run a full ETL pass for a given period.
 *
 * @param {object} options
 * @param {'quarter'|'month'|'year'} options.periodType
 * @param {string|number}            options.year
 * @param {string|number}            [options.quarter]   required for periodType='quarter'
 * @param {string}                   [options.month]     required for periodType='month' (e.g. '2025-01')
 * @param {'cron'|'manual'|'system'} [options.triggeredBy]
 * @returns {Promise<{success, rowCount, siteCount, durationMs, logId}>}
 */
async function runEtl({ periodType = 'quarter', year, quarter, month, triggeredBy = 'manual' } = {}) {
  await ensureAnalyticsTables();

  // Reload SQL queries from disk so any newly added indicator files are included
  // without needing a full server restart.
  indicatorsService.reload();

  const periodParams = buildPeriod(periodType, year, quarter, month);
  const { startDate, endDate, label } = periodParams;

  const logId = await createEtlLog({
    periodLabel: label,
    periodType,
    startDate,
    endDate,
    triggeredBy
  });

  const startedAt = Date.now();
  let totalRows = 0;
  let errorMsg = null;

  try {
    const allSites = await siteDatabaseManager.getAllSitesForManagement();
    // Only process leaf/facility sites (code length >= 4 digits typically)
    const facilitySites = allSites.filter((s) => {
      const digits = String(s.code || '').replace(/\D/g, '');
      return digits.length >= 4;
    });

    console.log(`[ETL] Starting ETL for ${label} — ${facilitySites.length} facility sites`);

    etlProgress = {
      active: true,
      completedSites: 0,
      totalSites: facilitySites.length,
      processedRows: 0,
      lastProcessedSite: 'Initializing...',
      startedAt: Date.now(),
      currentPeriodLabel: label,
      totalPeriods: etlProgress.totalPeriods || 1,
      completedPeriods: etlProgress.completedPeriods || 0
    };

    const results = await runPool(facilitySites, ETL_CONCURRENCY, async (site) => {
      const count = await processSite(site, periodParams);
      etlProgress.completedSites++;
      etlProgress.processedRows += count;
      etlProgress.lastProcessedSite = site.name || site.code;
      return count;
    });

    totalRows = results.reduce((sum, n) => sum + (n || 0), 0);

    await updateEtlLog(logId, {
      status: 'success',
      siteCount: facilitySites.length,
      rowCount: totalRows,
      durationMs: Date.now() - startedAt
    });

    etlProgress.active = false;

    console.log(`[ETL] Done — ${totalRows} rows upserted in ${Date.now() - startedAt}ms`);

    return {
      success: true,
      logId,
      periodLabel: label,
      siteCount: facilitySites.length,
      rowCount: totalRows,
      durationMs: Date.now() - startedAt
    };
  } catch (e) {
    etlProgress.active = false;
    errorMsg = e.message || String(e);
    await updateEtlLog(logId, {
      status: 'failed',
      siteCount: 0,
      rowCount: totalRows,
      durationMs: Date.now() - startedAt,
      errorMsg
    });
    throw e;
  }
}

/**
 * Run ETL for multiple periods (e.g. all quarters of selected years) sequentially.
 *
 * @param {object} options
 * @param {string[]} options.periodKeys   Array of period keys like ['2025-Q1','2025-Q2','2024-Q4']
 *                                        Year keys like '2025-Y' are automatically expanded to Q1-Q4.
 * @param {'cron'|'manual'|'system'} [options.triggeredBy]
 * @returns {Promise<{success, totalRows, results}>}
 */
async function runEtlMulti({ periodKeys = [], triggeredBy = 'manual' } = {}) {
  // Expand year keys into quarter keys
  const expandedKeys = [];
  for (const key of periodKeys) {
    const yearMatch = String(key).match(/^(\d{4})-Y$/);
    if (yearMatch) {
      const y = yearMatch[1];
      expandedKeys.push(`${y}-Q1`, `${y}-Q2`, `${y}-Q3`, `${y}-Q4`);
    } else {
      expandedKeys.push(key);
    }
  }

  // Deduplicate while preserving order
  const unique = [...new Set(expandedKeys)];

  // Seed the shared progress with total period count
  etlProgress = {
    active: true,
    completedSites: 0,
    totalSites: 0,
    processedRows: 0,
    lastProcessedSite: 'Starting...',
    startedAt: Date.now(),
    currentPeriodLabel: unique[0] || '',
    totalPeriods: unique.length,
    completedPeriods: 0
  };

  let grandTotal = 0;
  const results = [];

  for (const key of unique) {
    let periodType, year, quarter, month;

    const quarterMatch = key.match(/^(\d{4})-Q([1-4])$/);
    const monthMatch  = key.match(/^(\d{4})-M(\d{2})$/);
    const yearMatch2  = key.match(/^(\d{4})-Y$/);

    if (quarterMatch) {
      periodType = 'quarter'; year = quarterMatch[1]; quarter = quarterMatch[2];
    } else if (monthMatch) {
      periodType = 'month'; year = monthMatch[1]; month = `${monthMatch[1]}-${monthMatch[2]}`;
    } else if (yearMatch2) {
      periodType = 'year'; year = yearMatch2[1];
    } else {
      console.warn(`[ETL Multi] Unknown key format: ${key} — skipping`);
      continue;
    }

    // Reset per-period progress fields before each run
    etlProgress.completedPeriods = results.length;
    etlProgress.currentPeriodLabel = key;
    etlProgress.completedSites = 0;
    etlProgress.processedRows = grandTotal;
    etlProgress.lastProcessedSite = 'Initializing...';

    try {
      const result = await runEtl({ periodType, year, quarter, month, triggeredBy });
      grandTotal += result.rowCount || 0;
      results.push({ key, success: true, rowCount: result.rowCount });
    } catch (e) {
      console.error(`[ETL Multi] Failed for ${key}: ${e.message}`);
      results.push({ key, success: false, error: e.message });
    }
  }

  etlProgress.active = false;
  etlProgress.completedPeriods = unique.length;

  return { success: true, totalRows: grandTotal, results };
}

/**
 * Classifier to determine yearly rollup aggregation rules.
 */
function getIndicatorRollupType(indicatorName) {
  const name = String(indicatorName || '').trim();
  const match = name.match(/^(\d+(?:\.\d+)*)/);
  if (match) {
    const num = match[1];
    if (num === '1' || num === '2') return 'FIRST';
    
    const parts = num.split('.');
    const mainNum = parts[0];
    if (mainNum === '10') return 'LATEST';
    if (mainNum === '11') {
      const subNum = parts[1];
      if (!subNum) return 'LATEST';
      const subVal = Number(subNum);
      if (subVal >= 1 && subVal <= 8) return 'LATEST';
      return 'SUM';
    }
  }
  return 'SUM';
}

/**
 * Roll up quarterly records for a year.
 */
function aggregateQuartersForYear(rows, year, groupKeys = ['indicator']) {
  const grouped = {};
  
  for (const row of rows) {
    const gKey = groupKeys.map(k => String(row[k] || '')).join('::');
    if (!grouped[gKey]) {
      grouped[gKey] = [];
    }
    grouped[gKey].push(row);
  }
  
  const result = [];
  const start_date = `${year}-01-01`;
  const end_date = `${year}-12-31`;
  
  for (const gKey in grouped) {
    const groupRows = grouped[gKey];
    
    // Sort ascending by quarter label
    groupRows.sort((a, b) => {
      const qA = String(a.period_label || '');
      const qB = String(b.period_label || '');
      return qA.localeCompare(qB);
    });
    
    const firstRow = groupRows[0];
    const latestRow = groupRows[groupRows.length - 1];
    const indicatorName = latestRow.Indicator || latestRow.indicator;
    const rollupType = getIndicatorRollupType(indicatorName);
    
    const aggRow = { ...latestRow };
    aggRow.period_type = 'year';
    aggRow.period_label = String(year);
    aggRow.start_date = start_date;
    aggRow.end_date = end_date;
    
    if (rollupType === 'SUM') {
      aggRow.Male_0_14 = 0;
      aggRow.Female_0_14 = 0;
      aggRow.Male_over_14 = 0;
      aggRow.Female_over_14 = 0;
      if (aggRow.TOTAL !== undefined) aggRow.TOTAL = 0;
      
      let maxSiteCount = 0;
      for (const r of groupRows) {
        aggRow.Male_0_14 += Number(r.Male_0_14 || r.male_0_14 || 0);
        aggRow.Female_0_14 += Number(r.Female_0_14 || r.female_0_14 || 0);
        aggRow.Male_over_14 += Number(r.Male_over_14 || r.male_over_14 || 0);
        aggRow.Female_over_14 += Number(r.Female_over_14 || r.female_over_14 || 0);
        if (aggRow.TOTAL !== undefined) {
          aggRow.TOTAL += Number(r.TOTAL || r.total || 0);
        }
        if (r.site_count !== undefined) {
          maxSiteCount = Math.max(maxSiteCount, Number(r.site_count || 0));
        }
      }
      if (aggRow.site_count !== undefined) {
        aggRow.site_count = maxSiteCount;
      }
    } else if (rollupType === 'FIRST') {
      aggRow.Male_0_14 = Number(firstRow.Male_0_14 || firstRow.male_0_14 || 0);
      aggRow.Female_0_14 = Number(firstRow.Female_0_14 || firstRow.female_0_14 || 0);
      aggRow.Male_over_14 = Number(firstRow.Male_over_14 || firstRow.male_over_14 || 0);
      aggRow.Female_over_14 = Number(firstRow.Female_over_14 || firstRow.female_over_14 || 0);
      if (aggRow.TOTAL !== undefined) {
        aggRow.TOTAL = Number(firstRow.TOTAL || firstRow.total || 0);
      }
      if (aggRow.site_count !== undefined) {
        aggRow.site_count = Number(firstRow.site_count || 0);
      }
    } else {
      aggRow.Male_0_14 = Number(latestRow.Male_0_14 || latestRow.male_0_14 || 0);
      aggRow.Female_0_14 = Number(latestRow.Female_0_14 || latestRow.female_0_14 || 0);
      aggRow.Male_over_14 = Number(latestRow.Male_over_14 || latestRow.male_over_14 || 0);
      aggRow.Female_over_14 = Number(latestRow.Female_over_14 || latestRow.female_over_14 || 0);
      if (aggRow.TOTAL !== undefined) {
        aggRow.TOTAL = Number(latestRow.TOTAL || latestRow.total || 0);
      }
      if (aggRow.site_count !== undefined) {
        aggRow.site_count = Number(latestRow.site_count || 0);
      }
    }
    
    result.push(aggRow);
  }
  
  return result;
}

/**
 * Query the pre-aggregated warehouse — FAST, no clinical table access.
 *
 * @param {object} options
 * @param {string} options.periodLabel  e.g. '2025-Q1'
 * @param {string} [options.periodType]
 * @param {string} [options.provinceId]  filter to one province
 * @param {string} [options.siteCode]    filter to one site
 * @returns {Promise<Array>}
 */
async function querySummary({ periodLabel, periodType, provinceId, siteCode } = {}) {
  await ensureAnalyticsTables();

  const conditions = ['1=1'];
  const replacements = {};

  if (periodType === 'year') {
    const year = periodLabel;
    conditions.push("period_type = 'quarter'");
    conditions.push("period_label IN (:q1, :q2, :q3, :q4)");
    replacements.q1 = `${year}-Q1`;
    replacements.q2 = `${year}-Q2`;
    replacements.q3 = `${year}-Q3`;
    replacements.q4 = `${year}-Q4`;
  } else {
    if (periodLabel) {
      conditions.push('period_label = :periodLabel');
      replacements.periodLabel = periodLabel;
    }
    if (periodType) {
      conditions.push('period_type = :periodType');
      replacements.periodType = periodType;
    }
  }
  
  if (provinceId) {
    conditions.push('province_id = :provinceId');
    replacements.provinceId = provinceId;
  }
  if (siteCode) {
    conditions.push('site_code = :siteCode');
    replacements.siteCode = siteCode;
  }

  const sql = `
    SELECT
      period_type, period_label, start_date, end_date,
      province_id, province_name,
      site_code, site_name,
      indicator AS Indicator,
      SUM(male_0_14) AS Male_0_14,
      SUM(female_0_14) AS Female_0_14,
      SUM(male_over_14) AS Male_over_14,
      SUM(female_over_14) AS Female_over_14,
      SUM(male_0_14 + female_0_14 + male_over_14 + female_over_14) AS TOTAL
    FROM analytics_indicator_summary
    WHERE ${conditions.join(' AND ')}
    GROUP BY period_type, period_label, start_date, end_date,
             province_id, province_name, site_code, site_name, indicator
    ORDER BY province_name, site_name, indicator
  `;

  const rows = await getWarehouseSequelize().query(sql, { replacements, type: getWarehouseSequelize().QueryTypes.SELECT });
  if (periodType === 'year') {
    return aggregateQuartersForYear(rows, periodLabel, ['site_code', 'Indicator']);
  }
  return rows;
}

/**
 * Query country-level rollup (all provinces, all sites summed per indicator).
 */
async function queryCountryRollup({ periodLabel, periodType } = {}) {
  await ensureAnalyticsTables();

  const conditions = ['1=1'];
  const replacements = {};

  if (periodType === 'year') {
    const year = periodLabel;
    conditions.push("period_type = 'quarter'");
    conditions.push("period_label IN (:q1, :q2, :q3, :q4)");
    replacements.q1 = `${year}-Q1`;
    replacements.q2 = `${year}-Q2`;
    replacements.q3 = `${year}-Q3`;
    replacements.q4 = `${year}-Q4`;
  } else {
    if (periodLabel) {
      conditions.push('period_label = :periodLabel');
      replacements.periodLabel = periodLabel;
    }
    if (periodType) {
      conditions.push('period_type = :periodType');
      replacements.periodType = periodType;
    }
  }

  const sql = `
    SELECT
      period_type, period_label, start_date, end_date,
      indicator,
      SUM(male_0_14)      AS Male_0_14,
      SUM(female_0_14)    AS Female_0_14,
      SUM(male_over_14)   AS Male_over_14,
      SUM(female_over_14) AS Female_over_14,
      COUNT(DISTINCT site_code) AS site_count,
      MAX(updated_at) AS last_updated
    FROM analytics_indicator_summary
    WHERE ${conditions.join(' AND ')}
    GROUP BY period_type, period_label, start_date, end_date, indicator
    ORDER BY indicator
  `;

  const rows = await getWarehouseSequelize().query(sql, { replacements, type: getWarehouseSequelize().QueryTypes.SELECT });
  if (periodType === 'year') {
    return aggregateQuartersForYear(rows, periodLabel, ['indicator']);
  }
  return rows;
}

/**
 * Query province-level rollup (each province summed per indicator).
 */
async function queryProvinceRollup({ periodLabel, periodType } = {}) {
  await ensureAnalyticsTables();

  const conditions = ['1=1'];
  const replacements = {};

  if (periodType === 'year') {
    const year = periodLabel;
    conditions.push("period_type = 'quarter'");
    conditions.push("period_label IN (:q1, :q2, :q3, :q4)");
    replacements.q1 = `${year}-Q1`;
    replacements.q2 = `${year}-Q2`;
    replacements.q3 = `${year}-Q3`;
    replacements.q4 = `${year}-Q4`;
  } else {
    if (periodLabel) {
      conditions.push('period_label = :periodLabel');
      replacements.periodLabel = periodLabel;
    }
    if (periodType) {
      conditions.push('period_type = :periodType');
      replacements.periodType = periodType;
    }
  }

  const sql = `
    SELECT
      period_type, period_label,
      province_id, province_name,
      indicator,
      SUM(male_0_14)      AS Male_0_14,
      SUM(female_0_14)    AS Female_0_14,
      SUM(male_over_14)   AS Male_over_14,
      SUM(female_over_14) AS Female_over_14,
      COUNT(DISTINCT site_code) AS site_count
    FROM analytics_indicator_summary
    WHERE ${conditions.join(' AND ')}
    GROUP BY period_type, period_label, province_id, province_name, indicator
    ORDER BY province_name, indicator
  `;

  const rows = await getWarehouseSequelize().query(sql, { replacements, type: getWarehouseSequelize().QueryTypes.SELECT });
  if (periodType === 'year') {
    return aggregateQuartersForYear(rows, periodLabel, ['province_id', 'indicator']);
  }
  return rows;
}

/**
 * Get ETL run history (most recent first).
 */
async function getEtlHistory({ limit = 20 } = {}) {
  await ensureAnalyticsTables();
  return getWarehouseSequelize().query(
    `SELECT * FROM analytics_etl_log ORDER BY started_at DESC LIMIT :limit`,
    { replacements: { limit }, type: getWarehouseSequelize().QueryTypes.SELECT }
  );
}

/**
 * Get the latest successful ETL run for a given period label.
 */
async function getLastRefreshed(periodLabel) {
  await ensureAnalyticsTables();
  let rows;
  if (/^\d{4}$/.test(String(periodLabel))) {
    const year = periodLabel;
    rows = await getWarehouseSequelize().query(
      `SELECT finished_at FROM analytics_etl_log
       WHERE period_label IN (:q1, :q2, :q3, :q4) AND status = 'success'
       ORDER BY finished_at DESC LIMIT 1`,
      {
        replacements: {
          q1: `${year}-Q1`,
          q2: `${year}-Q2`,
          q3: `${year}-Q3`,
          q4: `${year}-Q4`
        },
        type: getWarehouseSequelize().QueryTypes.SELECT
      }
    );
  } else {
    rows = await getWarehouseSequelize().query(
      `SELECT finished_at FROM analytics_etl_log
       WHERE period_label = :periodLabel AND status = 'success'
       ORDER BY finished_at DESC LIMIT 1`,
      { replacements: { periodLabel }, type: getWarehouseSequelize().QueryTypes.SELECT }
    );
  }
  return rows[0]?.finished_at || null;
}

async function clearPeriodAnalytics({ periodLabel, periodType }) {
  await ensureAnalyticsTables();
  await getWarehouseSequelize().query(
    `DELETE FROM analytics_indicator_summary WHERE period_label = :periodLabel AND period_type = :periodType`,
    { replacements: { periodLabel, periodType } }
  );
}

async function truncateAnalyticsTable() {
  await ensureAnalyticsTables();
  await getWarehouseSequelize().query(`TRUNCATE TABLE analytics_indicator_summary`);
}

module.exports = {
  ensureAnalyticsTables,
  runEtl,
  runEtlMulti,
  querySummary,
  queryCountryRollup,
  queryProvinceRollup,
  getEtlHistory,
  getLastRefreshed,
  getEtlProgress,
  clearPeriodAnalytics,
  truncateAnalyticsTable
};
