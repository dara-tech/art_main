import { useCallback, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { VIZ_KH } from '../../pages/visualizeKh';
import { VizEmpty } from './visualizeUi';
import { buildVisualizeTableModel } from '../../utils/visualizeResultsTable';
import { buildVisualizeResultsClipboardText } from '../../utils/visualizeClipboard';
import { buildChartPointDetail } from '../../utils/visualizeChartDetail';
import VisualizeChartDetailModal from './VisualizeChartDetailModal';
import Patient360DataTable from '../patient360/Patient360DataTable';
import VisualizeChart from './VisualizeChart';

export default function VisualizeResults({
  results = [],
  loading = false,
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

  const [modalDetail, setModalDetail] = useState(null);

  const handleCellClick = useCallback(
    (r, colId) => {
      const rawResult = r?._raw || r;
      if (!rawResult || !rawResult.indicatorId) return;

      const detailObj = buildChartPointDetail(rawResult, catalog, {
        compareMode: scopeMode === 'compare',
        seriesLabel: rawResult.facilityLabel || rawResult.scopeLabel,
        xLabel: rawResult.periodLabel,
        value: rawResult.total
      });

      let filterId = null;
      if (colId === 'male014') filterId = 'male014';
      if (colId === 'female014') filterId = 'female014';
      if (colId === 'maleOver14') filterId = 'maleOver14';
      if (colId === 'femaleOver14') filterId = 'femaleOver14';

      if (detailObj) {
        detailObj.initialDemoFilter = filterId;
        setModalDetail(detailObj);
      }
    },
    [catalog, scopeMode]
  );

  const columns = useMemo(
    () =>
      tableCols.map((c) => {
        const isNumeric = c.id !== 'indicatorLabel' && c.id !== 'periodLabel' && c.id !== 'facilityLabel' && c.id !== 'scopeLabel';
        return {
          id: c.id,
          label: VIZ_KH[c.labelKey] || c.id,
          width:
            c.id === 'periodLabel'
              ? 80
              : c.id === 'facilityLabel'
                ? 150
                : c.id === 'scopeLabel'
                  ? 120
                  : c.id === 'indicatorLabel'
                    ? 220
                    : 68,
          align: isNumeric ? 'right' : undefined,
          mono: isNumeric,
          renderCell: (r) => {
            const val = r[c.id];
            if (val == null || val === '' || val === '—') return '—';

            let displayVal = val;
            if (isNumeric) {
              const separator = chartSettings?.digitSeparator || 'space';
              if (separator !== 'none') {
                const sep = separator === 'comma' ? ',' : ' ';
                displayVal = String(val).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
              }
            }

            const isZero = String(val).trim() === '0';

            return (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCellClick(r, c.id);
                }}
                className={cn(
                  'w-full text-left transition-all duration-150 cursor-pointer outline-none focus:outline-none select-none rounded px-1.5 py-0.5',
                  isNumeric
                    ? isZero
                      ? 'text-right text-muted-foreground/35 hover:text-muted-foreground hover:bg-muted/20 font-medium'
                      : 'text-right font-bold text-foreground hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-500/10'
                    : 'hover:text-teal-600 dark:hover:text-teal-400 font-medium hover:bg-muted/20'
                )}
                title={`Click to view patient details for ${c.id}`}
              >
                {displayVal}
              </button>
            );
          }
        };
      }),
    [tableCols, chartSettings?.digitSeparator, handleCellClick]
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
          loading={loading}
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

      {modalDetail && (
        <VisualizeChartDetailModal
          open={Boolean(modalDetail)}
          detail={modalDetail}
          onClose={() => setModalDetail(null)}
          results={results}
          catalog={catalog}
          periods={periods}
          pageContext={{ siteCode, siteLevel, compareSiteCodes, sites }}
          onNavigateToPatient360={onNavigateToPatient360}
          onBeforeNavigateToPatient360={onBeforeNavigateToPatient360}
        />
      )}
    </div>
  );
}
