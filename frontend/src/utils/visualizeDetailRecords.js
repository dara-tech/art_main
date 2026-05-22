import { infantReportApi, pnttReportApi, reportingApi } from '../services/reportingApi';
import {
  filterDetailRowsClient,
  normalizeDetailRecord,
  paginateDetailRowsClient
} from './indicatorDetailRecords';

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

  const { siteCode: pageSite, siteLevel: pageLevel, scopeMode } = pageContext;
  let siteCode = pageSite;
  let siteLevel = pageLevel;
  if (raw.facilityCode) {
    siteCode = raw.facilityCode;
    siteLevel = 'facility';
  } else if (scopeMode === 'compare' && pageContext.compareSiteCodes?.length === 1) {
    siteCode = pageContext.compareSiteCodes[0];
    siteLevel = 'facility';
  }

  return {
    siteCode,
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
  search = ''
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
    const filtered = filterDetailRowsClient(all, search);
    const paged = paginateDetailRowsClient(filtered, { page, limit });
    return { rows: paged.data, pagination: paged.pagination, serverPaged: false };
  }

  if (program === 'pntt') {
    const res = await pnttReportApi.getPnttReportDetails({
      ...base,
      scriptId: detailScriptId
    });
    const all = (Array.isArray(res?.data) ? res.data : []).map(normalizeDetailRecord);
    const filtered = filterDetailRowsClient(all, search);
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
