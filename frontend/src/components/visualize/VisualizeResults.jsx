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
  onBeforeNavigateToPatient360,
  activeProfileFilterCount = 0,
  onResetProfileFilters
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

  const [filterText, setFilterText] = useState('');

  const filteredTableRows = useMemo(() => {
    if (!filterText.trim()) return tableRows;
    const query = filterText.toLowerCase().trim();
    return tableRows.filter((r) => {
      const indLabel = String(r.indicatorLabel || '').toLowerCase();
      const facLabel = String(r.facilityLabel || r.scopeLabel || '').toLowerCase();
      const perLabel = String(r.periodLabel || '').toLowerCase();
      return indLabel.includes(query) || facLabel.includes(query) || perLabel.includes(query);
    });
  }, [tableRows, filterText]);

  const kpiSummaryStats = useMemo(() => {
    if (!results.length) return null;
    let totalSum = 0;
    let maxVal = -1;
    let maxLabel = '';

    results.forEach((r) => {
      const val = Number(r.total || 0);
      totalSum += val;
      if (val > maxVal) {
        maxVal = val;
        maxLabel = r.indicatorLabel || r.indicatorId || '';
      }
    });

    const uniquePeriods = new Set(results.map((r) => r.periodLabel || r.periodKey)).size;
    const uniqueFacilities = new Set(results.map((r) => r.facilityLabel || r.siteCode)).size;

    return {
      totalSum,
      maxVal,
      maxLabel,
      rowCount: results.length,
      periodCount: uniquePeriods,
      facilityCount: uniqueFacilities
    };
  }, [results]);

  if (!results.length || (view === 'table' && !filteredTableRows.length)) {
    return (
      <VizEmpty
        activeFilterCount={activeProfileFilterCount}
        onResetFilters={onResetProfileFilters}
      >
        {activeProfileFilterCount > 0
          ? `ពុំមានទិន្នន័យស្របតាមតម្រងប្រជាសាស្ត្រ/Profile ដែលបានជ្រើសរើសឡើយ។ សូមចុចប៊ូតុង "សម្អាតតម្រងទាំងអស់" ដើម្បីមើលទិន្នន័យដើមឡើងវិញ។`
          : VIZ_KH.empty}
      </VizEmpty>
    );
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
        <div className="px-4 py-2 border-b border-border/80 bg-muted/5 flex flex-col gap-0.5 select-text">
          <h3 className="text-xs font-bold text-foreground tracking-wide">{tableTitle}</h3>
          {tableSubtitle && (
            <p className="text-[10px] text-muted-foreground">{tableSubtitle}</p>
          )}
        </div>
      )}

      {/* Dynamic Results Header & Live Search Bar */}
      <div className="px-3.5 py-2 border-b border-border/80 bg-muted/15 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {kpiSummaryStats && (
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="flex items-center gap-1.5 bg-primary/10 text-foreground px-2 py-0.5 border border-primary/20 font-bold rounded-none">
                {kpiSummaryStats.totalSum.toLocaleString()} សរុបអ្នកជំងឺ (Total)
              </span>
              <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 border border-border/60 text-muted-foreground rounded-none">
                {filteredTableRows.length} / {kpiSummaryStats.rowCount} ជួរ (Rows)
              </span>
              {kpiSummaryStats.facilityCount > 1 && (
                <span className="flex items-center gap-1 bg-violet-500/10 text-violet-300 px-2 py-0.5 border border-violet-500/20 font-bold rounded-none">
                  {kpiSummaryStats.facilityCount} មណ្ឌល (Sites)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Live Search Input */}
        <div className="relative flex items-center min-w-[210px] max-w-[300px]">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះ/សូចនាករ/ត្រីមាស..."
            className="w-full bg-background border border-border/80 rounded-none px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
          />
          {filterText && (
            <button
              type="button"
              onClick={() => setFilterText('')}
              className="absolute right-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <Patient360DataTable
        columns={columns}
        rows={filteredTableRows}
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
