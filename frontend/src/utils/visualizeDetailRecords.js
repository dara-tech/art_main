import { infantReportApi, pnttReportApi, reportingApi } from '../services/reportingApi';
import {
  filterDetailRowsClient,
  normalizeDetailRecord,
  paginateDetailRowsClient
} from './indicatorDetailRecords';
import { resolveDetailSiteParams } from './siteSelection';

export const VISUALIZE_COMPARE_PAGE_SIZE = 500;
export const VISUALIZE_COMPARE_MAX_ROWS = 25000;

export function periodDatesFromList(periods = [], periodKey) {
  const hit = periods.find((p) => p.key === periodKey);
  if (!hit) return null;
  return {
    startDate: hit.startDate,
    endDate: hit.endDate,
    previousEndDate: hit.previousEndDate
  };
}

/** Site + period params for detail SQL (compare uses clicked facility). */
export function buildVisualizeDetailRequest(raw, pageContext = {}, periods = []) {
  if (!raw?.indicatorId) return null;
  const dates =
    raw.startDate && raw.endDate && raw.previousEndDate
      ? {
          startDate: raw.startDate,
          endDate: raw.endDate,
          previousEndDate: raw.previousEndDate
        }
      : periodDatesFromList(periods, raw.periodKey);
  if (!dates) return null;

  const { siteCode: pageSite, siteLevel: pageLevel, scopeMode, sites = [] } = pageContext;
  let siteCode = pageSite;
  if (raw.facilityCode) {
    siteCode = raw.facilityCode;
  } else if (scopeMode === 'compare' && pageContext.compareSiteCodes?.length === 1) {
    siteCode = pageContext.compareSiteCodes[0];
  }

  const { siteCode: resolvedCode, siteLevel } = resolveDetailSiteParams(
    siteCode,
    raw.facilityCode ? undefined : pageLevel,
    sites
  );

  return {
    siteCode: resolvedCode,
    siteLevel,
    ...dates
  };
}

function catalogEntryFor(catalog = [], indicatorId) {
  return catalog.find((c) => c.id === indicatorId) || null;
}

export async function fetchVisualizePatientRecords({
  raw,
  catalog = [],
  pageContext = {},
  periods = [],
  page = 1,
  limit = 25,
  search = '',
  minAge = '',
  maxAge = '',
  gender = '',
  ageGroup = ''
}) {
  const base = buildVisualizeDetailRequest(raw, pageContext, periods);
  const entry = catalogEntryFor(catalog, raw?.indicatorId);
  const program = entry?.program || raw?.program || 'adult-child';
  const detailScriptId = entry?.detailScriptId || null;

  if (!base?.siteCode || !detailScriptId) {
    return { rows: [], pagination: { page: 1, limit, totalCount: 0, totalPages: 1, hasNext: false, hasPrev: false } };
  }

  if (program === 'infant') {
    const res = await infantReportApi.getInfantReportDetails({
      ...base,
      scriptId: detailScriptId
    });
    const all = (Array.isArray(res?.data) ? res.data : []).map(normalizeDetailRecord);
    const filtered = filterDetailRowsClient(all, search, { gender, minAge, maxAge });
    const paged = paginateDetailRowsClient(filtered, { page, limit });
    return { rows: paged.data, pagination: paged.pagination, serverPaged: false };
  }

  if (program === 'pntt') {
    const res = await pnttReportApi.getPnttReportDetails({
      ...base,
      scriptId: detailScriptId
    });
    const all = (Array.isArray(res?.data) ? res.data : []).map(normalizeDetailRecord);
    const filtered = filterDetailRowsClient(all, search, { gender, minAge, maxAge });
    const paged = paginateDetailRowsClient(filtered, { page, limit });
    return { rows: paged.data, pagination: paged.pagination, serverPaged: false };
  }

  const params = {
    ...base,
    page,
    limit
  };
  const q = String(search || '').trim();
  if (q) params.search = q;

  const minA = String(minAge || '').trim();
  const maxA = String(maxAge || '').trim();
  const gen = String(gender || '').trim();
  const ageG = String(ageGroup || '').trim();
  if (minA) params.minAge = minA;
  if (maxA) params.maxAge = maxA;
  if (gen) params.gender = gen;
  if (ageG) params.ageGroup = ageG;

  const response = await reportingApi.getIndicatorDetails(detailScriptId, params);
  const list = Array.isArray(response?.data) ? response.data : [];
  const rows = list.map(normalizeDetailRecord);
  const pagination = response?.pagination || {
    page,
    limit,
    totalCount: rows.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  };
  return { rows, pagination, serverPaged: true };
}

export const VISUALIZE_PATIENT_STATUS_SCRIPT = 'viz_compare_patient_status';

/** Latest exit status per ART patient at period EndDate (tbl*patientstatus). */
export async function fetchAllPatientStatusSnapshot({
  raw,
  pageContext = {},
  periods = [],
  onProgress
}) {
  const base = buildVisualizeDetailRequest(raw, pageContext, periods);
  if (!base?.siteCode) return [];

  const limit = VISUALIZE_COMPARE_PAGE_SIZE;
  const params = { ...base, page: 1, limit };
  const response = await reportingApi.getIndicatorDetails(VISUALIZE_PATIENT_STATUS_SCRIPT, params);
  const list = Array.isArray(response?.data) ? response.data : [];
  let all = list.map(normalizeDetailRecord);
  const totalPages = Math.min(
    Number(response?.pagination?.totalPages ?? 1),
    Math.ceil(VISUALIZE_COMPARE_MAX_ROWS / limit)
  );
  const totalCount = Number(response?.pagination?.totalCount ?? all.length);
  onProgress?.({ loaded: all.length, total: totalCount });

  for (let page = 2; page <= totalPages && all.length < VISUALIZE_COMPARE_MAX_ROWS; page += 1) {
    const next = await reportingApi.getIndicatorDetails(VISUALIZE_PATIENT_STATUS_SCRIPT, {
      ...base,
      page,
      limit
    });
    const chunk = Array.isArray(next?.data) ? next.data : [];
    all = all.concat(chunk.map(normalizeDetailRecord));
    onProgress?.({ loaded: all.length, total: totalCount });
  }

  return all;
}

/** Load full patient list for period compare (paginates server-side detail API). */
export async function fetchAllVisualizePatientRecords({
  raw,
  catalog = [],
  pageContext = {},
  periods = [],
  onProgress
}) {
  const limit = VISUALIZE_COMPARE_PAGE_SIZE;
  const first = await fetchVisualizePatientRecords({
    raw,
    catalog,
    pageContext,
    periods,
    page: 1,
    limit,
    search: ''
  });

  if (!first.serverPaged) {
    onProgress?.({ loaded: first.rows.length, total: first.rows.length });
    return first.rows;
  }

  const all = [...first.rows];
  const totalPages = Math.min(
    Number(first.pagination?.totalPages ?? 1),
    Math.ceil(VISUALIZE_COMPARE_MAX_ROWS / limit)
  );
  const totalCount = Number(first.pagination?.totalCount ?? all.length);
  onProgress?.({ loaded: all.length, total: totalCount });

  for (let page = 2; page <= totalPages && all.length < VISUALIZE_COMPARE_MAX_ROWS; page += 1) {
    const next = await fetchVisualizePatientRecords({
      raw,
      catalog,
      pageContext,
      periods,
      page,
      limit,
      search: ''
    });
    all.push(...next.rows);
    onProgress?.({ loaded: all.length, total: totalCount });
  }

  return all;
}
