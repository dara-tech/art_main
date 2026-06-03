import { useCallback, useMemo } from 'react';
import { VIZ_KH } from '../../pages/visualizeKh';
import { VizEmpty } from './visualizeUi';
import { buildVisualizeTableModel } from '../../utils/visualizeResultsTable';
import { buildVisualizeResultsClipboardText } from '../../utils/visualizeClipboard';
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

  const tableClipboardText = useMemo(
    () => buildVisualizeResultsClipboardText(results, catalog, scopeMode, VIZ_KH),
    [results, catalog, scopeMode]
  );

  /** Chart view: Ctrl+C / copy must paste the detail table (CSV), not SVG/chart image. */
  const handleChartAreaCopy = useCallback(
    (e) => {
      if (view !== 'chart' || !tableClipboardText) return;
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest('input, textarea, [contenteditable="true"], [data-allow-native-copy]')) return;
      e.preventDefault();
      e.clipboardData?.clearData();
      e.clipboardData?.setData('text/plain', tableClipboardText);
    },
    [view, tableClipboardText]
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
        getValue: (r) => {
          const val = r[c.id];
          const isNumeric = c.id !== 'indicatorLabel' && c.id !== 'periodLabel' && c.id !== 'facilityLabel' && c.id !== 'scopeLabel';
          if (isNumeric && val != null && val !== '' && val !== '—') {
            const separator = chartSettings?.digitSeparator || 'space';
            if (separator === 'none') return val;
            const sep = separator === 'comma' ? ',' : ' ';
            return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
          }
          return val;
        }
      })),
    [tableCols, chartSettings?.digitSeparator]
  );

  if (!results.length) {
    return <VizEmpty>{VIZ_KH.empty}</VizEmpty>;
  }

  if (view === 'chart') {
    return (
      <div
        className="flex min-h-0 min-w-0 flex-1 select-none flex-col"
        onCopy={handleChartAreaCopy}
      >
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

  const tableTitle = chartSettings?.tableTitle;
  const tableSubtitle = chartSettings?.tableSubtitle;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {tableTitle && (
        <div className="px-5 py-3 border-b border-border/80 bg-muted/5 flex flex-col gap-0.5 select-text">
          <h3 className="text-xs font-bold text-foreground tracking-wide">{tableTitle}</h3>
          {tableSubtitle && (
            <p className="text-[10px] text-muted-foreground">{tableSubtitle}</p>
          )}
        </div>
      )}
      <Patient360DataTable
        columns={columns}
        rows={tableRows}
        getRowKey={(r) => r._key}
        scrollBody
        fillHeight
        emptyMessage={VIZ_KH.noResults}
        className="min-h-0 flex-1"
        density={chartSettings?.displayDensity || 'normal'}
        fontSize={chartSettings?.tableFontSize || 'normal'}
        stickyHeader={chartSettings?.fixColumnHeaders !== false}
        fixRowHeaders={Boolean(chartSettings?.fixRowHeaders)}
      />
    </div>
  );
}
