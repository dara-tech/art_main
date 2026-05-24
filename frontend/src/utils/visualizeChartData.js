import { labelForIndicatorId } from '../constants/indicatorLabels';

export const VIZ_CHART_COLORS = [
  'oklch(0.5 0.13 46)',
  'oklch(0.44 0.09 252)',
  'oklch(0.46 0.11 18)',
  'oklch(0.52 0.09 165)',
  'oklch(0.48 0.1 280)',
  'oklch(0.55 0.11 75)',
  'oklch(0.5 0.08 220)',
  'oklch(0.42 0.02 58)'
];

export function periodSortKey(periodKey) {
  const k = String(periodKey);
  const quarter = k.match(/^(\d{4})-Q(\d)$/i);
  if (quarter) return Number(quarter[1]) * 100 + Number(quarter[2]);
  const month = k.match(/^(\d{4})-M(\d{2})$/i);
  if (month) return Number(month[1]) * 100 + Number(month[2]);
  const year = k.match(/^(\d{4})-Y$/i);
  if (year) return Number(year[1]) * 100;
  return 0;
}

/** Human-readable period for chart X axis when periodLabel is missing. */
export function formatPeriodAxisLabel(periodKey, periodLabel) {
  if (periodLabel) return String(periodLabel);
  const k = String(periodKey || '');
  const quarter = k.match(/^(\d{4})-Q(\d)$/i);
  if (quarter) return `Q${quarter[2]} ${quarter[1]}`;
  const month = k.match(/^(\d{4})-M(\d{2})$/i);
  if (month) return `${month[2]}/${month[1]}`;
  const year = k.match(/^(\d{4})-Y$/i);
  if (year) return year[1];
  return k;
}

function catalogLabelFor(catalog, indicatorId) {
  if (!Array.isArray(catalog) || !indicatorId) return null;
  const hit = catalog.find((c) => c.id === indicatorId);
  return hit?.label || null;
}

/** Full Khmer title for tooltips / chart header. */
export function chartFullLabel(indicatorId, indicatorName, catalog) {
  const fromCatalog = catalogLabelFor(catalog, indicatorId);
  if (fromCatalog) return fromCatalog;
  if (indicatorName && /[\u1780-\u17FF]/.test(String(indicatorName))) return indicatorName;
  return labelForIndicatorId(indicatorId, indicatorName);
}

/** Compact legend: "10.8 · VL បង្កាប់" */
export function chartLegendLabel(indicatorId, indicatorName, catalog) {
  const full = chartFullLabel(indicatorId, indicatorName, catalog);
  const num = full.match(/^(\d+(?:\.\d+)*)/)?.[1];
  const kh = full.replace(/^\d+(?:\.\d+)*\.?\s*/, '').trim();
  if (num && kh) return `${num} · ${kh}`;
  return full.length > 36 ? `${full.slice(0, 34)}…` : full;
}

function sortPeriodKeys(keys) {
  return [...keys].sort((a, b) => periodSortKey(a) - periodSortKey(b));
}

/** Leading indicator number from label/chapter/id (e.g. "10.8", "5.1.1", "18"). */
export function parseIndicatorNum(indicatorId, label, chapter) {
  const text = String(label || '');
  const fromLabel = text.match(/^(\d+(?:\.\d+)*)/)?.[1];
  if (fromLabel) return fromLabel;
  const ch = String(chapter || '').trim();
  if (/^\d+(?:\.\d+)*$/.test(ch)) return ch;
  const id = String(indicatorId || '').replace(/^(infant|pntt):/, '');
  const fromId = id.match(/^(\d+)/)?.[1];
  return fromId || '';
}

function comparePickerItems(a, b) {
  const ka = indicatorSortKey(a.id, a.label);
  const kb = indicatorSortKey(b.id, b.label);
  const len = Math.max(ka.length, kb.length);
  for (let i = 0; i < len; i += 1) {
    const diff = (ka[i] ?? 0) - (kb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/**
 * Group picker items by main section (5, 10, 8…) so sub-rows stay together.
 * Returns [{ key, parent, children }] sorted by section number.
 */
export function buildIndicatorPickerGroups(items = []) {
  const byParent = new Map();
  const unnumbered = [];

  for (const item of items) {
    const num = parseIndicatorNum(item.id, item.label, item.chapter);
    if (!num) {
      unnumbered.push(item);
      continue;
    }
    const parentKey = num.split('.')[0];
    if (!byParent.has(parentKey)) byParent.set(parentKey, []);
    byParent.get(parentKey).push({ ...item, _num: num });
  }

  const groups = [...byParent.keys()]
    .sort((a, b) => Number(a) - Number(b))
    .map((parentKey) => {
      const members = [...byParent.get(parentKey)].sort(comparePickerItems);
      const parent = members.find((m) => m._num === parentKey) || null;
      const children = members.filter((m) => m._num !== parentKey);
      if (!children.length) {
        return { key: parentKey, parent: members[0] || null, children: [] };
      }
      return { key: parentKey, parent, children };
    });

  for (const item of unnumbered.sort((a, b) => String(a.label).localeCompare(String(b.label)))) {
    groups.push({ key: item.id, parent: item, children: [] });
  }

  return groups;
}

/** Sort indicators 1, 2, … 10.14 (not by total). */
export function indicatorSortKey(indicatorId, indicatorName, catalog) {
  const label = chartFullLabel(indicatorId, indicatorName, catalog);
  const m = label.match(/^(\d+(?:\.\d+)*)/);
  if (!m) return [9999, label];
  return m[1].split('.').map((n) => Number(n));
}

function compareIndicators(a, b) {
  const ka = indicatorSortKey(a.indicatorId, a.fullName);
  const kb = indicatorSortKey(b.indicatorId, b.fullName);
  const len = Math.max(ka.length, kb.length);
  for (let i = 0; i < len; i += 1) {
    const diff = (ka[i] ?? 0) - (kb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** Unique indicators from results, ordered by max total desc. */
export function listIndicatorsFromResults(results = [], catalog = []) {
  const map = new Map();
  for (const r of results) {
    if (r.error) continue;
    const prev = map.get(r.indicatorId);
    const total = Number(r.total) || 0;
    if (!prev) {
      map.set(r.indicatorId, {
        id: r.indicatorId,
        label: chartLegendLabel(r.indicatorId, r.indicator, catalog),
        fullLabel: chartFullLabel(r.indicatorId, r.indicator, catalog),
        maxTotal: total
      });
    } else {
      prev.maxTotal = Math.max(prev.maxTotal, total);
    }
  }
  return [...map.values()].sort((a, b) => b.maxTotal - a.maxTotal);
}

function seriesDataKey(indicatorId) {
  return `s_${String(indicatorId).replace(/[^a-zA-Z0-9]/g, '_')}`;
}

/** Results include per-facility rows (table column, detail context). */
export function isCompareResults(results = []) {
  return results.some((r) => r.facilityCode && !r.error);
}

/** Distinct facility codes in result rows. */
export function countDistinctFacilities(results = []) {
  const codes = new Set();
  for (const r of results) {
    if (!r.error && r.facilityCode) codes.add(String(r.facilityCode).trim());
  }
  return codes.size;
}

/** Chart series should be facilities (colors per site), not indicators. */
export function isMultiFacilityCompare(results = []) {
  return countDistinctFacilities(results) > 1;
}

/** Compare mode: series = facilities; X = period (one indicator) or period × indicator (many). */
export function buildFacilityCompareTrendData(results = [], indicatorIds = [], catalog = []) {
  const ids = (Array.isArray(indicatorIds) ? indicatorIds : indicatorIds ? [indicatorIds] : []).filter(
    Boolean
  );
  if (!ids.length) return { data: [], series: [], xDataKey: 'period' };

  const facilityMeta = new Map();
  for (const r of results) {
    if (r.error || !r.facilityCode || !ids.includes(r.indicatorId)) continue;
    if (!facilityMeta.has(r.facilityCode)) {
      facilityMeta.set(r.facilityCode, {
        id: r.facilityCode,
        label: r.facilityLabel || r.facilityCode,
        dataKey: `f_${String(r.facilityCode).replace(/[^a-zA-Z0-9]/g, '_')}`
      });
    }
  }

  const seriesMeta = [...facilityMeta.values()].map((s, i) => ({
    ...s,
    fullLabel: s.label,
    color: VIZ_CHART_COLORS[i % VIZ_CHART_COLORS.length]
  }));

  const multiIndicator = ids.length > 1;
  const rowMap = new Map();

  for (const r of results) {
    if (r.error || !r.facilityCode || !ids.includes(r.indicatorId)) continue;
    const period = formatPeriodAxisLabel(r.periodKey, r.periodLabel);
    const rowKey = multiIndicator ? `${r.periodKey}\0${r.indicatorId}` : r.periodKey;
    if (!rowMap.has(rowKey)) {
      rowMap.set(rowKey, {
        periodKey: r.periodKey,
        period,
        indicatorId: r.indicatorId,
        xLabel: multiIndicator
          ? `${period} · ${chartLegendLabel(r.indicatorId, r.indicator, catalog)}`
          : period
      });
    }
  }

  const sortedRows = [...rowMap.values()].sort((a, b) => {
    const pd = periodSortKey(a.periodKey) - periodSortKey(b.periodKey);
    if (pd !== 0) return pd;
    return compareIndicators(
      { indicatorId: a.indicatorId, fullName: '' },
      { indicatorId: b.indicatorId, fullName: '' }
    );
  });

  const data = sortedRows.map((row) => {
    const out = { ...row };
    for (const s of seriesMeta) {
      const hit = results.find(
        (x) =>
          x.periodKey === row.periodKey &&
          x.indicatorId === row.indicatorId &&
          x.facilityCode === s.id &&
          !x.error
      );
      out[s.dataKey] = hit ? Number(hit.total) || 0 : 0;
    }
    return out;
  });

  return { data, series: seriesMeta, xDataKey: multiIndicator ? 'xLabel' : 'period' };
}

/** Multi-indicator trend: one row per period, one series per selected indicator. */
export function buildMultiTrendData(results = [], indicatorIds = [], catalog = []) {
  const ids = (indicatorIds || []).filter(Boolean);
  if (!ids.length) return { data: [], series: [] };

  const periodLabels = new Map();
  const seriesMeta = [];

  for (const id of ids) {
    const sample = results.find((r) => !r.error && r.indicatorId === id);
    seriesMeta.push({
      id,
      dataKey: seriesDataKey(id),
      label: chartLegendLabel(id, sample?.indicator, catalog),
      fullLabel: chartFullLabel(id, sample?.indicator, catalog),
      color: VIZ_CHART_COLORS[seriesMeta.length % VIZ_CHART_COLORS.length]
    });
  }

  for (const r of results) {
    if (r.error || !ids.includes(r.indicatorId)) continue;
    periodLabels.set(r.periodKey, formatPeriodAxisLabel(r.periodKey, r.periodLabel));
  }

  const keys = sortPeriodKeys([...periodLabels.keys()]);
  const data = keys.map((pk) => {
    const periodLabel = periodLabels.get(pk) || formatPeriodAxisLabel(pk);
    const row = { periodKey: pk, period: periodLabel, xLabel: periodLabel };
    for (const s of seriesMeta) {
      const hit = results.find((x) => x.periodKey === pk && x.indicatorId === s.id && !x.error);
      row[s.dataKey] = hit ? Number(hit.total) || 0 : 0;
    }
    return row;
  });

  return { data, series: seriesMeta };
}

/** One row per period (chronological) for a single indicator. */
export function buildTrendData(results = [], indicatorId) {
  if (!indicatorId) return { data: [], periods: [] };
  const periodLabels = new Map();
  const values = new Map();

  for (const r of results) {
    if (r.error || r.indicatorId !== indicatorId) continue;
    periodLabels.set(r.periodKey, formatPeriodAxisLabel(r.periodKey, r.periodLabel));
    values.set(r.periodKey, Number(r.total) || 0);
  }

  const keys = sortPeriodKeys([...periodLabels.keys()]);
  const data = keys.map((pk) => ({
    periodKey: pk,
    period: periodLabels.get(pk),
    total: values.get(pk) ?? 0
  }));

  return { data, periods: keys };
}

/** KPI cards: value + change vs previous quarter. */
export function buildTrendKpis(trendData = []) {
  return trendData.map((row, i) => {
    const prev = i > 0 ? trendData[i - 1].total : null;
    const delta = prev != null ? row.total - prev : null;
    const pct =
      prev != null && prev > 0 ? Math.round(((row.total - prev) / prev) * 1000) / 10 : null;
    return { ...row, delta, pct };
  });
}

/** Latest period: all indicators from the run (includes zeros). */
export function buildSnapshotData(results = [], indicatorIds = null, catalog = [], { compareMode = false } = {}) {
  const periodKeys = new Set();
  for (const r of results) {
    if (!r.error) periodKeys.add(r.periodKey);
  }
  const sorted = sortPeriodKeys([...periodKeys]);
  const latestKey = sorted[sorted.length - 1];
  if (!latestKey) return { periodLabel: '', data: [] };

  const allIds = listIndicatorsFromResults(results, catalog).map((i) => i.id);
  const ids =
    Array.isArray(indicatorIds) && indicatorIds.length
      ? indicatorIds.filter((id) => allIds.includes(id))
      : allIds;

  const compare = isMultiFacilityCompare(results);
  if (compare) {
    const chartIds = ids.length ? ids : allIds;
    const periodLabel =
      results.find((r) => r.periodKey === latestKey)?.periodLabel || latestKey;

    if (chartIds.length > 1) {
      const byFacility = new Map();
      for (const r of results) {
        if (r.error || r.periodKey !== latestKey || !r.facilityCode || !chartIds.includes(r.indicatorId)) {
          continue;
        }
        const fc = r.facilityCode;
        if (!byFacility.has(fc)) {
          byFacility.set(fc, {
            facilityCode: fc,
            facilityLabel: r.facilityLabel || fc,
            rows: []
          });
        }
        byFacility.get(fc).rows.push({
          indicatorId: r.indicatorId,
          name: chartLegendLabel(r.indicatorId, r.indicator, catalog),
          fullName: chartFullLabel(r.indicatorId, r.indicator, catalog),
          total: Number(r.total) || 0
        });
      }
      const grouped = [...byFacility.values()]
        .sort((a, b) => String(a.facilityCode).localeCompare(String(b.facilityCode)))
        .map((g) => ({
          ...g,
          rows: g.rows.sort((a, b) =>
            compareIndicators(
              { indicatorId: a.indicatorId, fullName: a.fullName },
              { indicatorId: b.indicatorId, fullName: b.fullName }
            )
          )
        }));
      const maxTotal = Math.max(1, ...grouped.flatMap((g) => g.rows.map((row) => row.total)));
      return {
        periodKey: latestKey,
        periodLabel,
        data: [],
        layout: 'compareGrouped',
        grouped,
        maxTotal
      };
    }

    const rows = [];
    for (const r of results) {
      if (r.error || r.periodKey !== latestKey || !r.facilityCode || !chartIds.includes(r.indicatorId)) {
        continue;
      }
      const fac = r.facilityLabel || r.facilityCode;
      rows.push({
        indicatorId: r.indicatorId,
        facilityCode: r.facilityCode,
        name: fac,
        fullName: fac,
        total: Number(r.total) || 0
      });
    }
    rows.sort((a, b) => b.total - a.total);
    return { periodKey: latestKey, periodLabel, data: rows, layout: 'compareFacilities' };
  }

  const latestById = new Map();
  for (const r of results) {
    if (r.error || r.periodKey !== latestKey) continue;
    latestById.set(r.indicatorId, r);
  }

  const rows = ids.map((indicatorId) => {
    const hit = latestById.get(indicatorId);
    return {
      indicatorId,
      name: chartLegendLabel(indicatorId, hit?.indicator, catalog),
      fullName: chartFullLabel(indicatorId, hit?.indicator, catalog),
      total: hit ? Number(hit.total) || 0 : 0
    };
  });

  rows.sort(compareIndicators);

  const periodLabel =
    results.find((r) => r.periodKey === latestKey)?.periodLabel || latestKey;

  return {
    periodKey: latestKey,
    periodLabel,
    data: rows,
    layout: 'byIndicator'
  };
}

/** Demographics for one indicator across periods (not summed across indicators). */
export function buildDemographicsForIndicator(results = [], indicatorId) {
  if (!indicatorId) return [];
  const map = new Map();
  const order = [];

  for (const r of results) {
    if (r.error || r.indicatorId !== indicatorId || !r.hasBreakdown) continue;
    if (!map.has(r.periodKey)) {
      map.set(r.periodKey, {
        period: formatPeriodAxisLabel(r.periodKey, r.periodLabel),
        male014: 0,
        female014: 0,
        maleOver14: 0,
        femaleOver14: 0,
        total: 0
      });
      order.push(r.periodKey);
    }
    const row = map.get(r.periodKey);
    row.male014 = Number(r.male014) || 0;
    row.female014 = Number(r.female014) || 0;
    row.maleOver14 = Number(r.maleOver14) || 0;
    row.femaleOver14 = Number(r.femaleOver14) || 0;
    row.total = row.male014 + row.female014 + row.maleOver14 + row.femaleOver14;
  }

  return sortPeriodKeys(order).map((k) => map.get(k));
}

export function hasDemographicChartData(results = [], indicatorId) {
  return results.some((r) => !r.error && r.indicatorId === indicatorId && r.hasBreakdown);
}
