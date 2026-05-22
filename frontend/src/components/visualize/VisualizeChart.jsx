import { useCallback, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { cn } from '@/lib/utils';
import { P360_TABLE_TEXT } from '../layout/appNavStyles';
import { VIZ_KH } from '../../pages/visualizeKh';
import {
  buildDemographicsForIndicator,
  buildFacilityCompareTrendData,
  buildMultiTrendData,
  buildSnapshotData,
  buildTrendKpis,
  chartFullLabel,
  isCompareResults,
  VIZ_CHART_COLORS
} from '../../utils/visualizeChartData';
import {
  applySeriesColors,
  DEFAULT_CHART_SETTINGS,
  resolveSeriesColor,
  resolveXAxisLayout,
  resolveYAxisDomain,
  trendLineDataKey,
  withTrendLineOverlay
} from '../../utils/visualizeChartSettings';
import {
  buildPieSlicesFromTrendData,
  normalizeChartType,
  supportsTrendLine
} from '../../utils/visualizeChartTypes';
import { buildChartPointDetail, findResultForChartPoint } from '../../utils/visualizeChartDetail';
import VisualizeChartDetailModal from './VisualizeChartDetailModal';
import {
  VizChartPlot,
  VizChartShell,
  VizEmpty,
  VizKpiGrid,
  VizLegend,
  VizSectionHeader,
  VizTooltipBox
} from './visualizeUi';

const TICK = { fontSize: 11, fill: 'var(--muted-foreground)' };
const GRID = 'var(--border)';
const DEMO_MALE = 'var(--report-male)';
const DEMO_FEMALE = 'var(--report-female)';

function fmtNum(n) {
  return Number(n).toLocaleString('km-KH');
}

function pickClickedPayload(activePayload) {
  return activePayload?.find(
    (p) => p?.value != null && !String(p.dataKey || '').startsWith('__trend_')
  );
}

function MultiTrendTooltip({ active, payload, label, shared = true }) {
  if (!active || !payload?.length) return null;
  let rows = payload.filter((e) => !String(e.dataKey || '').startsWith('__trend_'));
  if (!shared && rows.length > 1) {
    rows = rows.filter((e) => e?.active !== false).slice(0, 1);
    if (!rows.length) rows = [payload.find((e) => !String(e.dataKey || '').startsWith('__trend_'))].filter(Boolean);
  }
  if (!rows.length) return null;
  const title = rows[0]?.payload?.xLabel || payload[0]?.payload?.xLabel || label;
  return (
    <VizTooltipBox title={title}>
      {rows.map((entry) => (
        <p key={entry.dataKey} className="tabular-nums" style={{ color: entry.color }}>
          {entry.name}: {fmtNum(entry.value)}
        </p>
      ))}
      <p className={cn('mt-1 border-t border-border/50 pt-1 text-muted-foreground', P360_TABLE_TEXT)}>
        {VIZ_KH.chartClickDetailHint}
      </p>
    </VizTooltipBox>
  );
}

function SnapshotTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  return (
    <VizTooltipBox title={p?.fullName}>
      <p className="tabular-nums text-primary">{fmtNum(p?.total)}</p>
    </VizTooltipBox>
  );
}

function DemoTooltip({ active, payload, label, shared = true }) {
  if (!active || !payload?.length) return null;
  const rows = shared ? payload : payload.filter((e) => e?.active !== false).slice(0, 1);
  return (
    <VizTooltipBox title={label}>
      {rows.map((e) => (
        <p key={e.dataKey} style={{ color: e.color }} className="tabular-nums">
          {e.name}: {fmtNum(e.value)}
        </p>
      ))}
    </VizTooltipBox>
  );
}

function ChartResponsive({ children }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  );
}

function yAxisProps(domain, settings) {
  return {
    domain,
    tick: TICK,
    allowDecimals: false,
    width: 52,
    axisLine: false,
    tickLine: false,
    tickCount: settings.yTicks ?? 5
  };
}

function PieTrendTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  return (
    <VizTooltipBox title={p?.name}>
      <p className="tabular-nums text-primary">{fmtNum(p?.value)}</p>
    </VizTooltipBox>
  );
}

function renderTrendSeries({
  chartType,
  series,
  lineCurve,
  lineStrokeWidth,
  barMaxSize,
  barRadius,
  showLabels,
  stackId
}) {
  if (chartType === 'line') {
    return series.map((s) => (
      <Line
        key={s.id}
        type={lineCurve}
        dataKey={s.dataKey}
        name={s.label}
        stroke={s.color}
        strokeWidth={lineStrokeWidth}
        dot={{ r: 3, fill: s.color }}
        activeDot={{ r: 5 }}
      />
    ));
  }
  if (chartType === 'area') {
    return series.map((s) => (
      <Area
        key={s.id}
        type={lineCurve}
        dataKey={s.dataKey}
        name={s.label}
        stroke={s.color}
        fill={s.color}
        fillOpacity={0.22}
        strokeWidth={lineStrokeWidth}
        dot={{ r: 2, fill: s.color }}
        activeDot={{ r: 4 }}
      />
    ));
  }
  const labelPos = chartType === 'horizontal' ? 'right' : 'top';
  return series.map((s) => (
    <Bar
      key={s.id}
      dataKey={s.dataKey}
      name={s.label}
      fill={s.color}
      radius={barRadius}
      maxBarSize={barMaxSize}
      stackId={stackId}
    >
      {showLabels ? (
        <LabelList
          dataKey={s.dataKey}
          position={labelPos}
          className={cn(P360_TABLE_TEXT, 'fill-foreground')}
          formatter={fmtNum}
        />
      ) : null}
    </Bar>
  ));
}

function MultiTrendChart({
  data,
  series,
  variant,
  chartSettings = DEFAULT_CHART_SETTINGS,
  xDataKey = 'period',
  onPointClick
}) {
  if (!data.length || !series.length) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <VizEmpty>{VIZ_KH.chartNoCompare}</VizEmpty>
      </div>
    );
  }

  const chartType = normalizeChartType(variant);
  const showTrendLine = Boolean(chartSettings.showTrendLine) && supportsTrendLine(chartType);
  const chartData = withTrendLineOverlay(data, series, showTrendLine);
  const legendItems = [
    ...series.map((s) => ({ key: s.id, label: s.label, color: s.color })),
    ...(showTrendLine
      ? series.map((s) => ({
          key: `${s.id}-trend`,
          label: `${s.label} (${VIZ_KH.chartTrendLine})`,
          color: s.color,
          dashed: true
        }))
      : [])
  ];
  const yDomain = resolveYAxisDomain(chartData, series, chartSettings);
  const showLabels = chartSettings.showBarLabels || series.length === 1;
  const denseX = xDataKey === 'xLabel';
  const xLayout = resolveXAxisLayout(denseX, chartSettings);
  const barMaxSize = Number(chartSettings.barMaxSize) || 40;
  const barRadius = Number(chartSettings.barRadius) || 0;
  const lineCurve = chartSettings.lineCurve || 'monotone';
  const lineStrokeWidth = Number(chartSettings.lineStrokeWidth) || 2;
  const stackId = chartType === 'stacked' ? 'viz-stack' : undefined;
  const tooltipShared = chartSettings.tooltipShared !== false;
  const tooltipCursor = tooltipShared
    ? { fill: 'oklch(0.5 0.13 46 / 0.06)' }
    : { fill: 'oklch(0.5 0.13 46 / 0.12)', stroke: 'oklch(0.5 0.13 46 / 0.25)', strokeWidth: 1 };

  if (chartType === 'pie') {
    const { slices, periodLabel } = buildPieSlicesFromTrendData(chartData, series, xDataKey);
    if (!slices.length) {
      return (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <VizEmpty>{VIZ_KH.chartPieNoData}</VizEmpty>
        </div>
      );
    }
    const pieLegend = slices.map((s) => ({ key: s.id, label: s.name, color: s.color }));
    const lastRow = chartData[chartData.length - 1];
    const handlePieClick = (slice) => {
      if (!onPointClick || !slice || !lastRow) return;
      onPointClick({
        row: lastRow,
        seriesId: slice.id,
        seriesLabel: slice.name,
        value: slice.value
      });
    };
    return (
      <>
        <p className={cn('mb-2 shrink-0 text-center text-muted-foreground', P360_TABLE_TEXT)}>
          {VIZ_KH.chartPiePeriodHint.replace('{period}', periodLabel)}
        </p>
        <VizChartPlot className={onPointClick ? 'cursor-pointer' : undefined}>
          <ChartResponsive>
            <PieChart>
              <Tooltip content={<PieTrendTooltip />} />
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="78%"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
                onClick={(_, index) => handlePieClick(slices[index])}
              >
                {slices.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartResponsive>
        </VizChartPlot>
        {chartSettings.showLegend ? <VizLegend items={pieLegend} /> : null}
      </>
    );
  }

  const handleChartClick = (state) => {
    if (!onPointClick) return;
    const payload = pickClickedPayload(state?.activePayload);
    if (!payload?.payload) return;
    const s = series.find((x) => x.dataKey === payload.dataKey);
    if (!s) return;
    onPointClick({
      row: payload.payload,
      seriesId: s.id,
      seriesLabel: s.label,
      value: payload.value
    });
  };

  const isHorizontal = chartType === 'horizontal';
  const useComposed = showTrendLine || chartType === 'area';
  const ChartRoot = useComposed
    ? ComposedChart
    : chartType === 'line'
      ? LineChart
      : chartType === 'area'
        ? AreaChart
        : BarChart;

  const cartesian = (
    <ChartRoot
      data={chartData}
      layout={isHorizontal ? 'vertical' : 'horizontal'}
      margin={
        isHorizontal
          ? { top: 12, right: 48, left: 4, bottom: 8 }
          : { top: 16, right: 12, left: 4, bottom: xLayout.bottom }
      }
      onClick={onPointClick ? handleChartClick : undefined}
    >
      {chartSettings.showGrid !== false ? (
        <CartesianGrid
          stroke={GRID}
          strokeDasharray="3 3"
          strokeOpacity={0.45}
          horizontal={!isHorizontal}
          vertical={isHorizontal}
        />
      ) : null}
      {isHorizontal ? (
        <>
          <XAxis type="number" tick={TICK} allowDecimals={false} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey={xDataKey}
            width={denseX ? 200 : 88}
            tick={{ ...TICK, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
        </>
      ) : (
        <>
          <XAxis
            dataKey={xDataKey}
            tick={TICK}
            axisLine={{ stroke: GRID }}
            tickLine={false}
            interval={denseX ? 'preserveStartEnd' : undefined}
            angle={xLayout.angle}
            textAnchor={xLayout.textAnchor}
            height={xLayout.height}
          />
          <YAxis {...yAxisProps(yDomain, chartSettings)} />
        </>
      )}
      <Tooltip
        shared={tooltipShared}
        cursor={tooltipCursor}
        content={(props) => <MultiTrendTooltip {...props} shared={tooltipShared} />}
      />
      {renderTrendSeries({
        chartType,
        series,
        lineCurve,
        lineStrokeWidth,
        barMaxSize,
        barRadius,
        showLabels,
        stackId
      })}
      {showTrendLine
        ? series.map((s) => (
            <Line
              key={`${s.id}-trend`}
              type="linear"
              dataKey={trendLineDataKey(s.id)}
              name={`${s.label} (${VIZ_KH.chartTrendLine})`}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray="6 4"
              strokeOpacity={0.85}
              dot={false}
              activeDot={{ r: 4 }}
              legendType="line"
              connectNulls
            />
          ))
        : null}
    </ChartRoot>
  );

  return (
    <>
      <VizChartPlot className={onPointClick ? 'cursor-pointer' : undefined}>
        <ChartResponsive>{cartesian}</ChartResponsive>
      </VizChartPlot>
      {chartSettings.showLegend ? <VizLegend items={legendItems} /> : null}
    </>
  );
}

/** Compare + many indicators: one block per facility, bars per indicator. */
function SnapshotCompareGrouped({
  grouped = [],
  periodLabel,
  periodKey,
  maxTotal = 1,
  chartSettings = DEFAULT_CHART_SETTINGS,
  onRowClick
}) {
  if (!grouped.length) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <VizEmpty>{VIZ_KH.chartNoSnapshot}</VizEmpty>
      </div>
    );
  }

  const facilityOrder = grouped.map((g) => g.facilityCode);
  const legendItems = grouped.map((g, i) => ({
    key: g.facilityCode,
    label: g.facilityLabel,
    color: resolveSeriesColor(g.facilityCode, i, chartSettings)
  }));

  return (
    <VizChartShell
      title={VIZ_KH.chartSnapshotCompareGrouped.replace('{period}', periodLabel)}
      legend={<VizLegend items={legendItems} />}
    >
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 py-2">
        {grouped.map((group, gi) => {
          const color = resolveSeriesColor(group.facilityCode, gi, chartSettings);
          return (
            <section key={group.facilityCode} className="border border-border/70 bg-muted/5 px-2 py-2">
              <h4 className={cn('mb-2 truncate text-xs font-semibold text-foreground', P360_TABLE_TEXT)}>
                {group.facilityLabel}
              </h4>
              <ul className="space-y-1.5">
                {group.rows.map((row) => {
                  const pct = Math.min(100, (row.total / maxTotal) * 100);
                  return (
                    <li key={`${group.facilityCode}-${row.indicatorId}`}>
                      <button
                        type="button"
                        className={cn(
                          'w-full text-left',
                          onRowClick && 'cursor-pointer rounded-sm hover:bg-muted/30'
                        )}
                        onClick={() =>
                          onRowClick?.({
                            periodKey,
                            indicatorId: row.indicatorId,
                            facilityCode: group.facilityCode,
                            seriesLabel: group.facilityLabel,
                            xLabel: periodLabel,
                            value: row.total
                          })
                        }
                        disabled={!onRowClick}
                      >
                      <div className="mb-0.5 flex items-baseline justify-between gap-2">
                        <span
                          className={cn('min-w-0 flex-1 truncate text-[11px] text-foreground', P360_TABLE_TEXT)}
                          title={row.fullName}
                        >
                          {row.name}
                        </span>
                        <span className={cn('shrink-0 tabular-nums text-[11px] font-medium', P360_TABLE_TEXT)}>
                          {fmtNum(row.total)}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted/40">
                        <div
                          className="h-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </VizChartShell>
  );
}

function SnapshotChart({
  data,
  periodLabel,
  periodKey,
  chartSettings = DEFAULT_CHART_SETTINGS,
  layout = 'byIndicator',
  onBarClick
}) {
  if (!data.length) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <VizEmpty>{VIZ_KH.chartNoSnapshot}</VizEmpty>
      </div>
    );
  }

  const chartData = [...data].reverse();
  const rowH = 28;
  const chartH = Math.max(120, chartData.length * rowH + 24);
  const labelW = layout === 'compareFacilities' ? 220 : 200;
  const facilityOrder =
    layout === 'compareFacilities'
      ? [...new Set(chartData.map((d) => d.facilityCode).filter(Boolean))]
      : [];

  const colorForEntry = (entry, i) => {
    const id =
      layout === 'compareFacilities' && entry.facilityCode
        ? entry.facilityCode
        : entry.indicatorId || entry.name || String(i);
    const idx =
      layout === 'compareFacilities' && entry.facilityCode
        ? facilityOrder.indexOf(entry.facilityCode)
        : i;
    return resolveSeriesColor(id, idx >= 0 ? idx : i, chartSettings);
  };

  const legendItems =
    layout === 'compareFacilities'
      ? facilityOrder.map((code, i) => {
          const hit = chartData.find((d) => d.facilityCode === code);
          return {
            key: code,
            label: hit?.name || code,
            color: resolveSeriesColor(code, i, chartSettings)
          };
        })
      : chartData.map((d, i) => ({
          key: d.indicatorId || d.name,
          label: d.name,
          color: resolveSeriesColor(d.indicatorId || d.name, i, chartSettings)
        }));

  return (
    <VizChartShell
      title={VIZ_KH.chartSnapshotHint.replace('{period}', periodLabel)}
      legend={chartSettings.showLegend ? <VizLegend items={legendItems} /> : null}
    >
      <VizChartPlot className={cn('overflow-y-auto', onBarClick && 'cursor-pointer')}>
        <div style={{ height: chartH, minHeight: '100%' }}>
          <ChartResponsive width="100%" height={chartH}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 48, left: 4, bottom: 8 }}
              barCategoryGap={layout === 'compareFacilities' ? 6 : 4}
              onClick={
                onBarClick
                  ? (state) => {
                      const p = state?.activePayload?.[0];
                      if (p?.payload) onBarClick({ entry: p.payload, value: p.value });
                    }
                  : undefined
              }
            >
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" strokeOpacity={0.45} horizontal={false} />
              <XAxis type="number" tick={TICK} allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={labelW}
                tick={{ ...TICK, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <Tooltip content={<SnapshotTooltip />} cursor={{ fill: 'oklch(0.5 0.13 46 / 0.06)' }} />
              <Bar dataKey="total" radius={0} maxBarSize={22}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={colorForEntry(entry, i)} />
                ))}
                <LabelList
                  dataKey="total"
                  position="right"
                  className={cn(P360_TABLE_TEXT, 'fill-foreground')}
                  formatter={fmtNum}
                />
              </Bar>
            </BarChart>
          </ChartResponsive>
        </div>
      </VizChartPlot>
    </VizChartShell>
  );
}

const DEMO_LEGEND = [
  { key: 'male014', label: VIZ_KH.male014, color: DEMO_MALE },
  { key: 'female014', label: VIZ_KH.female014, color: DEMO_FEMALE },
  { key: 'maleOver14', label: VIZ_KH.maleOver14, color: DEMO_MALE },
  { key: 'femaleOver14', label: VIZ_KH.femaleOver14, color: DEMO_FEMALE }
];

function DemographicsChart({ data, title, chartSettings = DEFAULT_CHART_SETTINGS }) {
  if (!data.length) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <VizEmpty>{VIZ_KH.chartNoDemographics}</VizEmpty>
      </div>
    );
  }

  const yDomain = resolveYAxisDomain(data, [], chartSettings);

  return (
    <VizChartShell
      title={title}
      legend={chartSettings.showLegend ? <VizLegend items={DEMO_LEGEND} /> : null}
    >
      <p className={cn('mb-1 shrink-0 text-muted-foreground', P360_TABLE_TEXT)}>{VIZ_KH.chartDemographicsHint}</p>
      <VizChartPlot>
        <ChartResponsive>
          <BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
            {chartSettings.showGrid !== false ? (
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" strokeOpacity={0.45} vertical={false} />
            ) : null}
            <XAxis dataKey="period" tick={TICK} axisLine={{ stroke: GRID }} tickLine={false} />
            <YAxis {...yAxisProps(yDomain, chartSettings)} />
            <Tooltip
              shared={chartSettings.tooltipShared !== false}
              cursor={
                chartSettings.tooltipShared !== false
                  ? { fill: 'oklch(0.5 0.13 46 / 0.06)' }
                  : { fill: 'oklch(0.5 0.13 46 / 0.12)' }
              }
              content={(props) => (
                <DemoTooltip {...props} shared={chartSettings.tooltipShared !== false} />
              )}
            />
            <Bar dataKey="male014" name={VIZ_KH.male014} fill={DEMO_MALE} stackId="a" radius={0} />
            <Bar dataKey="female014" name={VIZ_KH.female014} fill={DEMO_FEMALE} stackId="a" radius={0} />
            <Bar dataKey="maleOver14" name={VIZ_KH.maleOver14} fill={DEMO_MALE} stackId="b" radius={0} />
            <Bar dataKey="femaleOver14" name={VIZ_KH.femaleOver14} fill={DEMO_FEMALE} stackId="b" radius={0} />
          </BarChart>
        </ChartResponsive>
      </VizChartPlot>
    </VizChartShell>
  );
}

export default function VisualizeChart({
  results = [],
  panel = 'trend',
  variant = 'bar',
  chartIndicatorIds = [],
  chartSettings = DEFAULT_CHART_SETTINGS,
  catalog = [],
  scopeMode = 'rollup',
  siteCode = '',
  siteLevel = 'facility',
  compareSiteCodes = [],
  periods = [],
  onNavigateToPatient360,
  onBeforeNavigateToPatient360
}) {
  const [chartDetail, setChartDetail] = useState(null);
  const primaryId = chartIndicatorIds[0] || null;
  const compareMode = scopeMode === 'compare' || isCompareResults(results);

  const openPointDetail = useCallback(
    ({ row, seriesId, seriesLabel, value }) => {
      const result = findResultForChartPoint(results, { compareMode, row, seriesId });
      setChartDetail(
        buildChartPointDetail(result, catalog, {
          compareMode,
          seriesLabel,
          xLabel: row?.xLabel || row?.period,
          value
        })
      );
    },
    [results, catalog, compareMode]
  );

  const openSnapshotDetail = useCallback(
    ({ periodKey, indicatorId, facilityCode, seriesLabel, xLabel, value }) => {
      const seriesId = compareMode && facilityCode ? facilityCode : indicatorId;
      const row = { periodKey, indicatorId, xLabel };
      openPointDetail({ row, seriesId, seriesLabel, value });
    },
    [openPointDetail, compareMode]
  );
  const multi = useMemo(() => {
    let built;
    if (compareMode && chartIndicatorIds.length) {
      built = buildFacilityCompareTrendData(results, chartIndicatorIds, catalog);
    } else {
      built = buildMultiTrendData(results, chartIndicatorIds, catalog);
    }
    return {
      ...built,
      series: applySeriesColors(built.series, chartSettings)
    };
  }, [compareMode, results, chartIndicatorIds, catalog, chartSettings]);
  const snapshot = useMemo(
    () => buildSnapshotData(results, chartIndicatorIds, catalog, { compareMode }),
    [results, chartIndicatorIds, catalog, compareMode]
  );
  const demoData = useMemo(
    () => buildDemographicsForIndicator(results, primaryId),
    [results, primaryId]
  );
  const singleKpis = useMemo(() => {
    if (compareMode || chartIndicatorIds.length !== 1 || !primaryId) return [];
    const rows = multi.data.map((row) => {
      const key = multi.series[0]?.dataKey;
      return { periodKey: row.periodKey, period: row.period, total: key ? row[key] : 0 };
    });
    return buildTrendKpis(rows).map((k) => ({
      periodKey: k.periodKey,
      period: k.period,
      value: fmtNum(k.total),
      delta: k.delta,
      deltaLabel: k.delta != null ? fmtNum(Math.abs(k.delta)) : null,
      pct: k.pct
    }));
  }, [chartIndicatorIds.length, multi.data, multi.series, primaryId]);

  const detailModal = (
    <VisualizeChartDetailModal
      open={Boolean(chartDetail)}
      detail={chartDetail}
      onClose={() => setChartDetail(null)}
      catalog={catalog}
      periods={periods}
      pageContext={{ siteCode, siteLevel, scopeMode, compareSiteCodes }}
      onNavigateToPatient360={onNavigateToPatient360}
      onBeforeNavigateToPatient360={onBeforeNavigateToPatient360}
    />
  );

  if (panel === 'snapshot') {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {snapshot.layout === 'compareGrouped' ? (
          <SnapshotCompareGrouped
            grouped={snapshot.grouped}
            periodLabel={snapshot.periodLabel}
            periodKey={snapshot.periodKey}
            maxTotal={snapshot.maxTotal}
            chartSettings={chartSettings}
            onRowClick={openSnapshotDetail}
          />
        ) : (
          <SnapshotChart
            data={snapshot.data}
            periodLabel={snapshot.periodLabel}
            periodKey={snapshot.periodKey}
            chartSettings={chartSettings}
            layout={snapshot.layout}
            onBarClick={({ entry, value }) =>
              openSnapshotDetail({
                periodKey: snapshot.periodKey,
                indicatorId: entry.indicatorId,
                facilityCode: entry.facilityCode,
                seriesLabel: entry.fullName || entry.name,
                xLabel: snapshot.periodLabel,
                value
              })
            }
          />
        )}
        {detailModal}
      </div>
    );
  }

  if (panel === 'demographics') {
    const title = primaryId ? chartFullLabel(primaryId, null, catalog) : '';
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <DemographicsChart data={demoData} title={title} chartSettings={chartSettings} />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      {singleKpis.length ? <VizKpiGrid kpis={singleKpis} /> : null}
      {compareMode ? (
        <VizSectionHeader>
          {chartIndicatorIds.length > 1
            ? VIZ_KH.chartCompareSitesIndicators
            : `${VIZ_KH.chartCompareFacilities}: ${chartFullLabel(primaryId, null, catalog)}`}
        </VizSectionHeader>
      ) : chartIndicatorIds.length > 1 ? (
        <VizSectionHeader>{VIZ_KH.chartCompareMulti}</VizSectionHeader>
      ) : primaryId ? (
        <VizSectionHeader>{chartFullLabel(primaryId, null, catalog)}</VizSectionHeader>
      ) : null}
      <div className="flex min-h-0 flex-1 basis-0 flex-col pb-1">
        <MultiTrendChart
          data={multi.data}
          series={multi.series}
          variant={variant}
          chartSettings={chartSettings}
          xDataKey={multi.xDataKey || 'period'}
          onPointClick={openPointDetail}
        />
      </div>
      {detailModal}
    </div>
  );
}
