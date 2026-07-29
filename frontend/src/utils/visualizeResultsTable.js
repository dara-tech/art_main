import { chartFullLabel } from './visualizeChartData';
import { VIZ_KH } from '../pages/visualizeKh';

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
    _raw: r,
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

  if (results.length > 0) {
    let sumTotal = 0;
    let sumMale014 = 0;
    let sumFemale014 = 0;
    let sumMaleOver14 = 0;
    let sumFemaleOver14 = 0;
    let sumAge014 = 0;
    let sumAge15plus = 0;

    let anyHasBreakdown = false;
    let anyHasTotal = false;

    for (const r of results) {
      if (!r.error) {
        anyHasTotal = true;
        if (r.total !== undefined && r.total !== null) {
          sumTotal += r.total;
        }
        if (r.hasBreakdown) {
          anyHasBreakdown = true;
          sumMale014 += r.male014 ?? 0;
          sumFemale014 += r.female014 ?? 0;
          sumMaleOver14 += r.maleOver14 ?? 0;
          sumFemaleOver14 += r.femaleOver14 ?? 0;
          sumAge014 += r.age014 ?? 0;
          sumAge15plus += r.age15plus ?? 0;
        }
      }
    }

    if (anyHasTotal) {
      const firstRaw = results[0] || {};
      rows.push({
        _key: 'grand-total',
        isTotal: true,
        _raw: {
          ...firstRaw,
          facilityCode: 'all',
          facilityLabel: VIZ_KH.grandTotal || 'សរុបរួម',
          scopeLabel: 'Cambodia',
          total: sumTotal,
          male014: sumMale014,
          female014: sumFemale014,
          maleOver14: sumMaleOver14,
          femaleOver14: sumFemaleOver14,
          hasBreakdown: anyHasBreakdown
        },
        periodLabel: VIZ_KH.grandTotal || 'សរុបរួម',
        facilityLabel: '—',
        scopeLabel: '—',
        indicatorLabel: '—',
        total: String(sumTotal),
        male014: anyHasBreakdown ? String(sumMale014) : '—',
        female014: anyHasBreakdown ? String(sumFemale014) : '—',
        maleOver14: anyHasBreakdown ? String(sumMaleOver14) : '—',
        femaleOver14: anyHasBreakdown ? String(sumFemaleOver14) : '—',
        age014: anyHasBreakdown ? String(sumAge014) : '—',
        age15plus: anyHasBreakdown ? String(sumAge15plus) : '—'
      });
    }
  }

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
