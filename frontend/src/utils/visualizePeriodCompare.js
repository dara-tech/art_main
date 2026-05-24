import { periodSortKey } from './visualizeChartData';

/** Stable key for matching the same patient across two period lists. */
export function patientRowKey(row = {}) {
  const cid = row.clinicid ?? row.ClinicID ?? row.clinic_id;
  if (cid != null && String(cid).trim() !== '') {
    return `cid:${String(cid).trim().toLowerCase()}`;
  }
  const art = row.art_number ?? row.Artnum ?? row.ART;
  if (art != null && String(art).trim() !== '') {
    return `art:${String(art).trim()}`;
  }
  return null;
}

export function comparePatientLists(rowsA = [], rowsB = []) {
  const mapA = new Map();
  const mapB = new Map();
  rowsA.forEach((row) => {
    const k = patientRowKey(row);
    if (k && !mapA.has(k)) mapA.set(k, row);
  });
  rowsB.forEach((row) => {
    const k = patientRowKey(row);
    if (k && !mapB.has(k)) mapB.set(k, row);
  });

  const onlyInPeriodA = [];
  const onlyInPeriodB = [];
  const inBoth = [];

  for (const [k, rowA] of mapA) {
    if (mapB.has(k)) {
      inBoth.push({ key: k, periodA: rowA, periodB: mapB.get(k) });
    } else {
      onlyInPeriodA.push(rowA);
    }
  }
  for (const [k, rowB] of mapB) {
    if (!mapA.has(k)) onlyInPeriodB.push(rowB);
  }

  return {
    onlyInPeriodA,
    onlyInPeriodB,
    inBoth,
    countA: mapA.size,
    countB: mapB.size,
    countOnlyA: onlyInPeriodA.length,
    countOnlyB: onlyInPeriodB.length,
    countBoth: inBoth.length
  };
}

function matchingResults(results = [], raw = {}) {
  if (!raw?.indicatorId) return [];
  const indicatorId = raw.indicatorId;
  const facilityCode = raw.facilityCode || null;
  return results.filter(
    (r) =>
      !r.error &&
      r.indicatorId === indicatorId &&
      (!facilityCode || r.facilityCode === facilityCode)
  );
}

/** All periods with result data for this indicator (both A and B pickers). */
export function listAllComparePeriodOptions(periods = [], results = [], raw = {}) {
  const matches = matchingResults(results, raw);
  if (!matches.length) return [];

  const keysInResults = new Set(matches.map((r) => r.periodKey).filter(Boolean));
  const fromConfigured = periods
    .filter((p) => p.key && keysInResults.has(p.key))
    .sort((a, b) => periodSortKey(a.key) - periodSortKey(b.key))
    .map((p) => ({ key: p.key, label: p.label || p.key }));

  if (fromConfigured.length) return fromConfigured;

  const seen = new Set();
  return matches
    .sort((a, b) => periodSortKey(a.periodKey) - periodSortKey(b.periodKey))
    .filter((r) => {
      if (!r.periodKey || seen.has(r.periodKey)) return false;
      seen.add(r.periodKey);
      return true;
    })
    .map((r) => ({ key: r.periodKey, label: r.periodLabel || r.periodKey }));
}

/** @deprecated use listAllComparePeriodOptions */
export function listComparePeriodOptions(periods, results, raw, currentPeriodKey) {
  return listAllComparePeriodOptions(periods, results, raw).filter((p) => p.key !== currentPeriodKey);
}

/** Default A/B pair: prefer clicked period as A, previous quarter as B. */
export function defaultComparePeriodPair(allOptions = [], preferredA = '', preferredB = '') {
  if (!allOptions.length) return { periodA: '', periodB: '' };
  if (allOptions.length === 1) {
    return { periodA: allOptions[0].key, periodB: allOptions[0].key };
  }

  const sorted = [...allOptions].sort((a, b) => periodSortKey(a.key) - periodSortKey(b.key));
  let periodA =
    preferredA && sorted.some((p) => p.key === preferredA) ? preferredA : sorted[sorted.length - 1].key;

  if (preferredB && preferredB !== periodA && sorted.some((p) => p.key === preferredB)) {
    return { periodA, periodB: preferredB };
  }

  const idxA = sorted.findIndex((p) => p.key === periodA);
  const periodB = idxA > 0 ? sorted[idxA - 1].key : sorted.find((p) => p.key !== periodA)?.key || sorted[0].key;

  return { periodA, periodB };
}

/** Build raw drill-down payload for another period (same indicator / site). */
export function resolveResultRawForPeriod(results = [], baseRaw = {}, periodKey) {
  if (!baseRaw?.indicatorId || !periodKey) return null;
  const hit = results.find(
    (r) =>
      !r.error &&
      r.periodKey === periodKey &&
      r.indicatorId === baseRaw.indicatorId &&
      (baseRaw.facilityCode ? r.facilityCode === baseRaw.facilityCode : true)
  );
  if (!hit) return { ...baseRaw, periodKey };
  return {
    ...baseRaw,
    ...hit,
    periodKey: hit.periodKey,
    periodLabel: hit.periodLabel,
    startDate: hit.startDate,
    endDate: hit.endDate,
    previousEndDate: hit.previousEndDate
  };
}

export function periodLabelForKey(periods = [], periodKey) {
  const hit = periods.find((p) => p.key === periodKey);
  return hit?.label || periodKey || '—';
}

export const TPT_START_INDICATOR_ID = '10.4_tpt_start';

export function isTptCompleteIndicator(indicatorId) {
  return /10\.5|tpt_complete/i.test(String(indicatorId || ''));
}

export function indexRowsByPatientKey(rows = []) {
  const map = new Map();
  for (const row of rows) {
    const k = patientRowKey(row);
    if (k && !map.has(k)) map.set(k, row);
  }
  return map;
}

function patientStatusLabel(row, labels) {
  if (!row) return labels.chartComparePatientStatusActive;
  return String(row.patient_status_label || row.Status || '').trim() || labels.chartComparePatientStatusActive;
}

function patientStatusDate(row) {
  if (!row) return '—';
  const d = row.patient_status_date ?? row.patientStatusDa;
  return d ? String(d).slice(0, 10) : '—';
}

function classifyPatientExitKind(statusRow) {
  const code = Number(statusRow?.patient_status_code);
  const label = String(statusRow?.patient_status_label || '').toLowerCase();
  if (code === 1 || label.includes('dead')) return 'dead';
  if (code === 0 || label.includes('ltfu') || label.includes('lost')) return 'ltfu';
  if (code === 3 || label.includes('transfer')) return 'transfer';
  return 'active';
}

function attachPatientStatusFields({ statusOlderRow, statusNewerRow, role, labels }) {
  const complete105 = labels.chartCompareStatus105Complete;
  const notIn105 = '—';

  if (role === 'dropped') {
    return {
      compare_in_105_older: complete105,
      compare_in_105_newer: notIn105,
      compare_patient_status_older: patientStatusLabel(statusOlderRow, labels),
      compare_patient_status_newer: patientStatusLabel(statusNewerRow, labels),
      compare_patient_status_date_older: patientStatusDate(statusOlderRow),
      compare_patient_status_date_newer: patientStatusDate(statusNewerRow)
    };
  }

  return {
    compare_in_105_older: notIn105,
    compare_in_105_newer: complete105,
    compare_patient_status_older: patientStatusLabel(statusOlderRow, labels),
    compare_patient_status_newer: patientStatusLabel(statusNewerRow, labels),
    compare_patient_status_date_older: patientStatusDate(statusOlderRow),
    compare_patient_status_date_newer: patientStatusDate(statusNewerRow)
  };
}

function fillLabels(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

/** Drop reason from tbl*patientstatus only (newer quarter EndDate). */
export function inferDropReasonFromPatientStatus({ statusAtNewer, newerPeriodLabel, labels }) {
  const label = patientStatusLabel(statusAtNewer, labels);
  if (label === labels.chartComparePatientStatusActive) {
    return fillLabels(labels.chartCompareReasonActiveNotIn105, { period: newerPeriodLabel });
  }
  return fillLabels(labels.chartCompareReasonPatientStatus, {
    period: newerPeriodLabel,
    status: label
  });
}

export function inferAddReasonFromPatientStatus({ statusAtOlder, newerPeriodLabel, labels }) {
  const label = patientStatusLabel(statusAtOlder, labels);
  return fillLabels(labels.chartCompareReasonNewComplete, { period: newerPeriodLabel, prior: label });
}

export function countDropReasonKinds(rows = []) {
  let dead = 0;
  let ltfu = 0;
  let transfer = 0;
  let active = 0;
  for (const row of rows) {
    const kind = row.compare_reason_kind || 'active';
    if (kind === 'dead') dead += 1;
    else if (kind === 'ltfu') ltfu += 1;
    else if (kind === 'transfer') transfer += 1;
    else active += 1;
  }
  return { dead, ltfu, transfer, active };
}

function summarizeDropReasons(rows = [], labels) {
  const { dead, ltfu, transfer, active } = countDropReasonKinds(rows);
  const parts = [];
  if (dead) parts.push(fillLabels(labels.chartCompareReasonSummaryDead, { n: dead }));
  if (ltfu) parts.push(fillLabels(labels.chartCompareReasonSummaryLtfu, { n: ltfu }));
  if (transfer) parts.push(fillLabels(labels.chartCompareReasonSummaryTransfer, { n: transfer }));
  if (active) parts.push(fillLabels(labels.chartCompareReasonSummaryActive, { n: active }));
  return parts.join(' · ');
}

/** Older vs newer period for drop/add semantics (not UI A/B order). */
export function resolveCompareChronology(periodAKey, periodBKey, periods = []) {
  const aNewer = periodSortKey(periodAKey) > periodSortKey(periodBKey);
  const olderKey = aNewer ? periodBKey : periodAKey;
  const newerKey = aNewer ? periodAKey : periodBKey;
  return {
    aIsNewer: aNewer,
    olderKey,
    newerKey,
    olderLabel: periodLabelForKey(periods, olderKey) || olderKey,
    newerLabel: periodLabelForKey(periods, newerKey) || newerKey
  };
}

/** Complete at older period, missing from newer complete list (explains decrease). */
export function splitCompareByChronology(compareResult, chronology) {
  const { aIsNewer } = chronology;
  const dropped = aIsNewer ? compareResult.onlyInPeriodB : compareResult.onlyInPeriodA;
  const added = aIsNewer ? compareResult.onlyInPeriodA : compareResult.onlyInPeriodB;
  return { dropped, added };
}

/**
 * Was 10.5-complete at older quarter; reason from patientstatus at newer EndDate only.
 */
export function inferTptDropReason(args) {
  return inferDropReasonFromPatientStatus({
    statusAtNewer: args.statusAtNewer,
    newerPeriodLabel: args.newerPeriodLabel,
    labels: args.labels
  });
}

export function inferTptAddReason(args) {
  return inferAddReasonFromPatientStatus({
    statusAtOlder: args.statusAtOlder,
    newerPeriodLabel: args.newerPeriodLabel,
    labels: args.labels
  });
}

/** Attach patient exit status (patientstatus) + compare fields for TPT 10.5 diff. */
export async function enrichCompareWithTptReasons({
  compareResult,
  results,
  baseRaw,
  periodAKey,
  periodBKey,
  periods = [],
  pageContext = {},
  fetchAllPatientStatus,
  labels
}) {
  const chronology = resolveCompareChronology(periodAKey, periodBKey, periods);
  const { dropped: droppedRaw, added: addedRaw } = splitCompareByChronology(compareResult, chronology);

  const rawOlder = resolveResultRawForPeriod(results, baseRaw, chronology.olderKey);
  const rawNewer = resolveResultRawForPeriod(results, baseRaw, chronology.newerKey);
  const [statusOlderRows, statusNewerRows] = await Promise.all([
    fetchAllPatientStatus({ raw: rawOlder, pageContext, periods }),
    fetchAllPatientStatus({ raw: rawNewer, pageContext, periods })
  ]);

  const statusOlder = indexRowsByPatientKey(statusOlderRows);
  const statusNewer = indexRowsByPatientKey(statusNewerRows);

  const dropped = droppedRaw.map((rowAtOlderComplete) => {
    const key = patientRowKey(rowAtOlderComplete);
    const statusOlderRow = statusOlder.get(key);
    const statusNewerRow = statusNewer.get(key);
    const compare_reason_kind = classifyPatientExitKind(statusNewerRow);

    return {
      ...rowAtOlderComplete,
      ...attachPatientStatusFields({
        statusOlderRow,
        statusNewerRow,
        role: 'dropped',
        labels
      }),
      compare_reason_kind,
      compare_reason: inferDropReasonFromPatientStatus({
        statusAtNewer: statusNewerRow,
        newerPeriodLabel: chronology.newerLabel,
        labels
      })
    };
  });

  const added = addedRaw.map((rowAtNewerComplete) => {
    const key = patientRowKey(rowAtNewerComplete);
    const statusOlderRow = statusOlder.get(key);
    const statusNewerRow = statusNewer.get(key);
    return {
      ...rowAtNewerComplete,
      ...attachPatientStatusFields({
        statusOlderRow,
        statusNewerRow,
        role: 'added',
        labels
      }),
      compare_reason: inferAddReasonFromPatientStatus({
        statusAtOlder: statusOlderRow,
        newerPeriodLabel: chronology.newerLabel,
        labels
      })
    };
  });

  const dropReasonCounts = countDropReasonKinds(dropped);

  return {
    ...compareResult,
    chronology,
    dropped,
    added,
    dropReasonCounts,
    dropReasonSummary: summarizeDropReasons(dropped, labels)
  };
}
