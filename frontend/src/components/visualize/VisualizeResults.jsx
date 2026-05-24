import { useMemo } from 'react';
import { VIZ_KH } from '../../pages/visualizeKh';
import { VizEmpty } from './visualizeUi';
import { buildVisualizeTableModel } from '../../utils/visualizeResultsTable';
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
  sites = [],
  periods = [],
  onNavigateToPatient360,
  onBeforeNavigateToPatient360
}) {
  const { columns: tableCols, rows: tableRows } = useMemo(
    () => buildVisualizeTableModel(results, catalog, scopeMode),
    [results, catalog, scopeMode]
  );

  const columns = useMemo(
    () =>
      tableCols.map((c) => ({
        id: c.id,
        label: VIZ_KH[c.labelKey] || c.id,
        width:
          c.id === 'periodLabel'
            ? 88
            : c.id === 'facilityLabel'
              ? 140
              : c.id === 'scopeLabel'
                ? 120
                : c.id === 'indicatorLabel'
                  ? 180
                  : 56,
        align: c.id === 'indicatorLabel' || c.id === 'periodLabel' || c.id === 'facilityLabel' || c.id === 'scopeLabel' ? undefined : 'right',
        mono: c.id !== 'indicatorLabel' && c.id !== 'periodLabel' && c.id !== 'facilityLabel' && c.id !== 'scopeLabel',
        getValue: (r) => r[c.id]
      })),
    [tableCols]
  );

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
          sites={sites}
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
