import { chartFullLabel } from './visualizeChartData';

function fmtNum(n) {
  return Number(n).toLocaleString('km-KH');
}

/** Resolve one result row for a clicked chart point. */
export function findResultForChartPoint(results = [], { compareMode, row, seriesId }) {
  if (!row?.periodKey || !seriesId) return null;
  const periodKey = row.periodKey;
  const indicatorId = row.indicatorId || (compareMode ? null : seriesId);

  if (compareMode) {
    const facilityCode = seriesId;
    const ind = indicatorId || results.find((r) => r.periodKey === periodKey && r.facilityCode === facilityCode)?.indicatorId;
    return (
      results.find(
        (r) =>
          !r.error &&
          r.periodKey === periodKey &&
          r.facilityCode === facilityCode &&
          (ind ? r.indicatorId === ind : true)
      ) || null
    );
  }

  return (
    results.find((r) => !r.error && r.periodKey === periodKey && r.indicatorId === seriesId) || null
  );
}

function catalogEntry(catalog, indicatorId) {
  return catalog.find((c) => c.id === indicatorId) || null;
}

export function buildChartPointDetail(result, catalog = [], { compareMode, seriesLabel, xLabel, value }) {
  if (!result) {
    return {
      title: xLabel || '—',
      rows: [],
      raw: null,
      hasPatientList: false
    };
  }

  const entry = catalogEntry(catalog, result.indicatorId);

  const rows = [
    { id: 'period', labelKey: 'period', value: result.periodLabel || result.periodKey },
    {
      id: 'indicator',
      labelKey: 'indicator',
      value: chartFullLabel(result.indicatorId, result.indicator, catalog)
    },
    { id: 'total', labelKey: 'total', value: fmtNum(value ?? result.total), highlight: true }
  ];

  if (compareMode || result.facilityCode) {
    rows.splice(1, 0, {
      id: 'facility',
      labelKey: 'facility',
      value: result.facilityLabel || result.facilityCode || seriesLabel || '—'
    });
  } else if (result.scopeLabel) {
    rows.splice(1, 0, {
      id: 'scope',
      labelKey: 'scope',
      value: result.scopeLabel
    });
  }

  if (result.hasBreakdown) {
    rows.push(
      { id: 'male014', labelKey: 'male014', value: fmtNum(result.male014) },
      { id: 'female014', labelKey: 'female014', value: fmtNum(result.female014) },
      { id: 'maleOver14', labelKey: 'maleOver14', value: fmtNum(result.maleOver14) },
      { id: 'femaleOver14', labelKey: 'femaleOver14', value: fmtNum(result.femaleOver14) }
    );
  }

  const titleParts = [xLabel, seriesLabel].filter(Boolean);
  return {
    title: titleParts.length ? titleParts.join(' · ') : rows[0]?.value,
    rows,
    raw: result,
    hasPatientList: Boolean(entry?.hasDetails && entry?.detailScriptId),
    indicatorId: result.indicatorId,
    program: entry?.program || result.program
  };
}
