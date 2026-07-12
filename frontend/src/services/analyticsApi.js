/**
 * analyticsApi.js
 * Frontend API client for the analytics warehouse endpoints.
 * All reads come from pre-aggregated tables — fast, no clinical DB load.
 */

import api from './api';

const BASE = '/apiv1/analytics';

function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  return q.toString() ? `?${q.toString()}` : '';
}

/**
 * Check warehouse status for a given period.
 * Returns { lastRefreshed, hasData, etlRunning, recentHistory }
 */
export async function getAnalyticsStatus({ periodType, year, quarter, month } = {}) {
  const qs = buildQuery({ periodType, year, quarter, month });
  const { data } = await api.get(`${BASE}/status${qs}`);
  return data;
}

/**
 * Get all synced periods from the warehouse.
 * Returns { success: true, data: ['2025-Q1', '2025-M01', '2025-Y'] }
 */
export async function getSyncedPeriods() {
  const { data } = await api.get(`${BASE}/synced-periods`);
  if (data?.success && Array.isArray(data.data)) {
    data.data = data.data.map(label => {
      if (/^\d{4}$/.test(label)) return `${label}-Y`;
      const m = label.match(/^(\d{4})-(\d{2})$/);
      if (m) return `${m[1]}-M${m[2]}`;
      return label;
    });
  }
  return data;
}

/**
 * Country-level rollup — all indicators summed across all sites.
 * Returns { data: [...rows], meta: { periodLabel, lastRefreshed } }
 */
export async function getCountryAnalytics({ periodType, year, quarter, month } = {}) {
  const qs = buildQuery({ periodType, year, quarter, month });
  const { data } = await api.get(`${BASE}/country${qs}`);
  return data;
}

/**
 * Province-level rollup — indicators per province.
 * Returns { data: [...rows], meta }
 */
export async function getProvinceAnalytics({ periodType, year, quarter, month } = {}) {
  const qs = buildQuery({ periodType, year, quarter, month });
  const { data } = await api.get(`${BASE}/province${qs}`);
  return data;
}

/**
 * Site-level detail from warehouse — filter by province or site.
 * Returns { data: [...rows], meta }
 */
export async function getAnalyticsSummary({ periodType, year, quarter, month, provinceId, siteCode } = {}) {
  const qs = buildQuery({ periodType, year, quarter, month, provinceId, siteCode });
  const { data } = await api.get(`${BASE}/summary${qs}`);
  return data;
}

/**
 * ETL run history.
 */
export async function getEtlHistory({ limit = 20 } = {}) {
  const { data } = await api.get(`${BASE}/etl-history?limit=${limit}`);
  return data;
}

/**
 * Get all facility sites and their sync status for a given period.
 */
export async function getSitesSyncStatus({ periodType, year, quarter, month } = {}) {
  const qs = buildQuery({ periodType, year, quarter, month });
  const { data } = await api.get(`${BASE}/sites-status${qs}`);
  return data;
}

/**
 * Trigger ETL refresh.
 * - If `periods` array is supplied (e.g. ['2025-Q1','2025-Q2','2025-Y']),
 *   the server runs multi-period ETL sequentially. Year keys are auto-expanded
 * Fetch list of all available indicators from the system
 */
export async function getIndicatorReference() {
  const { data } = await api.get('/apiv1/indicators-optimized/query-reference');
  return data;
}

/**
 * Trigger ETL refresh
 * payload can include periodType, year, quarter, month, periods (array), indicators (array)
 */
export async function triggerAnalyticsRefresh(payload) {
  const { data } = await api.post(`${BASE}/refresh`, payload);
  return data;
}

/**
 * Clear analytics data from warehouse.
 * If clearAll is true, truncates the table.
 * Otherwise, clears the specified period.
 */
export async function clearAnalyticsData({ periodType, year, quarter, month, clearAll, indicator } = {}) {
  const { data } = await api.post(`${BASE}/clear`, { periodType, year, quarter, month, clearAll, indicator });
  return data;
}

