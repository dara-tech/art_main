import { useMemo } from 'react';
import { VIZ_KH } from '../../pages/visualizeKh';
import { VizEmpty } from './visualizeUi';
import { chartFullLabel } from '../../utils/visualizeChartData';
import Patient360DataTable from '../patient360/Patient360DataTable';
import VisualizeChart from './VisualizeChart';

export default function VisualizeResults({
  results = [],
  view = 'table',
  chartPanel = 'trend',
  chartVariant = 'bar',
  chartIndicatorIds = [],
  chartSettings,
  catalog = [],
  scopeMode = 'rollup',
  siteCode = '',
  siteLevel = 'facility',
  compareSiteCodes = [],
  periods = [],
  onNavigateToPatient360,
  onBeforeNavigateToPatient360
}) {
  const showFacilityCol = scopeMode === 'compare' || results.some((r) => r.facilityCode);
  const showScopeCol = results.some((r) => r.scopeLabel && r.aggregated);
  const fmtDemo = (r, value) => {
    if (r.error) return '—';
    if (!r.hasBreakdown) return '—';
    return value ?? 0;
  };

  const tableRows = useMemo(
    () =>
      results.map((r, idx) => ({
        _key: idx,
        periodLabel: r.periodLabel || r.periodKey,
        facilityLabel: r.facilityLabel || r.facilityCode || (r.aggregated ? r.scopeLabel : '') || '—',
        scopeLabel: r.scopeLabel || '—',
        indicatorLabel: chartFullLabel(r.indicatorId, r.indicator, catalog),
        total: r.error ? `— (${r.error})` : r.total ?? 0,
        male014: fmtDemo(r, r.male014),
        female014: fmtDemo(r, r.female014),
        maleOver14: fmtDemo(r, r.maleOver14),
        femaleOver14: fmtDemo(r, r.femaleOver14),
        age014: fmtDemo(r, r.age014),
        age15plus: fmtDemo(r, r.age15plus)
      })),
    [results, catalog]
  );

  const columns = [
    { id: 'periodLabel', label: VIZ_KH.period, width: 88, getValue: (r) => r.periodLabel },
    ...(showFacilityCol
      ? [{ id: 'facilityLabel', label: VIZ_KH.facilityColumn, width: 140, getValue: (r) => r.facilityLabel }]
      : []),
    ...(showScopeCol && !showFacilityCol
      ? [{ id: 'scopeLabel', label: VIZ_KH.scopeColumn, width: 120, getValue: (r) => r.scopeLabel }]
      : []),
    { id: 'indicatorLabel', label: VIZ_KH.indicator, width: 180, getValue: (r) => r.indicatorLabel },
    { id: 'total', label: VIZ_KH.total, width: 64, align: 'right', mono: true, getValue: (r) => String(r.total) },
    { id: 'male014', label: VIZ_KH.male014, width: 56, align: 'right', mono: true, getValue: (r) => String(r.male014) },
    { id: 'female014', label: VIZ_KH.female014, width: 56, align: 'right', mono: true, getValue: (r) => String(r.female014) },
    { id: 'maleOver14', label: VIZ_KH.maleOver14, width: 56, align: 'right', mono: true, getValue: (r) => String(r.maleOver14) },
    {
      id: 'femaleOver14',
      label: VIZ_KH.femaleOver14,
      width: 56,
      align: 'right',
      mono: true,
      getValue: (r) => String(r.femaleOver14)
    },
    { id: 'age014', label: VIZ_KH.age014, width: 48, align: 'right', mono: true, getValue: (r) => String(r.age014) },
    { id: 'age15plus', label: VIZ_KH.age15plus, width: 48, align: 'right', mono: true, getValue: (r) => String(r.age15plus) }
  ];

  if (!results.length) {
    return <VizEmpty>{VIZ_KH.empty}</VizEmpty>;
  }

  if (view === 'chart') {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <VisualizeChart
          results={results}
          panel={chartPanel}
          variant={chartVariant}
          chartIndicatorIds={chartIndicatorIds}
          chartSettings={chartSettings}
          catalog={catalog}
          scopeMode={scopeMode}
          siteCode={siteCode}
          siteLevel={siteLevel}
          compareSiteCodes={compareSiteCodes}
          periods={periods}
          onNavigateToPatient360={onNavigateToPatient360}
          onBeforeNavigateToPatient360={onBeforeNavigateToPatient360}
        />
      </div>
    );
  }

  return (
    <Patient360DataTable
      columns={columns}
      rows={tableRows}
      getRowKey={(r) => r._key}
      scrollBody
      fillHeight
      emptyMessage={VIZ_KH.noResults}
      className="min-h-0 flex-1"
    />
  );
}
