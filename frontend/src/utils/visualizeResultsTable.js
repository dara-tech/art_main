import { chartFullLabel } from './visualizeChartData';

function fmtDemo(r, value) {
  if (r.error) return '—';
  if (!r.hasBreakdown) return '—';
  return value ?? 0;
}

/** Table columns + rows for visualize results (table view and clipboard export). */
export function buildVisualizeTableModel(results = [], catalog = [], scopeMode = 'rollup') {
  const showFacilityCol = scopeMode === 'compare' || results.some((r) => r.facilityCode);
  const showScopeCol = results.some((r) => r.scopeLabel && r.aggregated);

  const rows = results.map((r, idx) => ({
    _key: idx,
    periodLabel: r.periodLabel || r.periodKey,
    facilityLabel: r.facilityLabel || r.facilityCode || (r.aggregated ? r.scopeLabel : '') || '—',
    scopeLabel: r.scopeLabel || '—',
    indicatorLabel: chartFullLabel(r.indicatorId, r.indicator, catalog),
    total: r.error ? `— (${r.error})` : String(r.total ?? 0),
    male014: String(fmtDemo(r, r.male014)),
    female014: String(fmtDemo(r, r.female014)),
    maleOver14: String(fmtDemo(r, r.maleOver14)),
    femaleOver14: String(fmtDemo(r, r.femaleOver14)),
    age014: String(fmtDemo(r, r.age014)),
    age15plus: String(fmtDemo(r, r.age15plus))
  }));

  const columns = [
    { id: 'periodLabel', labelKey: 'period' },
    ...(showFacilityCol ? [{ id: 'facilityLabel', labelKey: 'facilityColumn' }] : []),
    ...(showScopeCol && !showFacilityCol ? [{ id: 'scopeLabel', labelKey: 'scopeColumn' }] : []),
    { id: 'indicatorLabel', labelKey: 'indicator' },
    { id: 'total', labelKey: 'total' },
    { id: 'male014', labelKey: 'male014' },
    { id: 'female014', labelKey: 'female014' },
    { id: 'maleOver14', labelKey: 'maleOver14' },
    { id: 'femaleOver14', labelKey: 'femaleOver14' },
    { id: 'age014', labelKey: 'age014' },
    { id: 'age15plus', labelKey: 'age15plus' }
  ];

  return { columns, rows, showFacilityCol, showScopeCol };
}
