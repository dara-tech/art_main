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
import { VIZ_KH } from '../../pages/visualizeKh';
import {
  buildDemographicsForIndicator,
  buildFacilityCompareTrendData,
  buildMultiTrendData,
  buildSnapshotData,
  buildTrendKpis,
  chartFullLabel,
  isMultiFacilityCompare,
  VIZ_CHART_COLORS
} from '../../utils/visualizeChartData';
import {
  applySeriesColors,
  DEFAULT_CHART_SETTINGS,
  resolveChartTypography,
  resolveSeriesColor,
  resolveXAxisLayout,
  resolveYAxisDomain,
  trendLineDataKey,
  withTrendLineOverlay
} from '../../utils/visualizeChartSettings';
import {
  buildPieSlicesFromTrendData,
  normalizeChartType,
  PIE_ON_CHART_LABEL_MIN_PERCENT,
  pieLegendLabel,
  preparePieDisplay,
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
  VizPeriodAxis,
  VizSectionHeader,
  VizTooltipBox
} from './visualizeUi';

const GRID = 'var(--border)';
const DEMO_MALE = 'var(--report-male)';
const DEMO_FEMALE = 'var(--report-female)';

function CategoryAxisTick({ x, y, payload, angle = 0, textAnchor = 'middle', typography }) {
  const label = payload?.value != null && payload.value !== '' ? String(payload.value) : '';
  if (!label) return null;
  const t = typography || resolveChartTypography();
  return (
    <text
      x={x}
      y={y}
      dy={angle ? 4 : 14}
      fill={t.fill}
      fontSize={t.fontSize}
      fontWeight={t.fontWeight}
      textAnchor={textAnchor}
      transform={angle ? `rotate(${angle}, ${x}, ${y})` : undefined}
    >
      {label}
    </text>
  );
}

function categoryXAxisProps({ xDataKey, xLayout, showPeriodAxisTitle = false, typography }) {
  const t = typography || resolveChartTypography();
  const axisTitle = showPeriodAxisTitle
    ? {
        value: VIZ_KH.period,
        position: 'bottom',
        offset: 4,
        style: t.axisTitle
      }
    : undefined;
  return {
    dataKey: xDataKey,
    interval: 0,
    minTickGap: 4,
    tickMargin: 10,
    tickLine: false,
    axisLine: { stroke: GRID },
    height: xLayout.height,
    label: axisTitle,
    tick: (props) => (
      <CategoryAxisTick
        {...props}
        angle={xLayout.angle}
        textAnchor={xLayout.textAnchor}
        typography={t}
      />
    )
  };
}

function fmtNum(n) {
  return Number(n).toLocaleString('km-KH');
}

function pickClickedPayload(activePayload) {
  return activePayload?.find(
    (p) => p?.value != null && !String(p.dataKey || '').startsWith('__trend_')
  );
}

function MultiTrendTooltip({ active, payload, label, shared = true, typography }) {
  if (!active || !payload?.length) return null;
  let rows = payload.filter((e) => !String(e.dataKey || '').startsWith('__trend_'));
  if (!shared && rows.length > 1) {
    rows = rows.filter((e) => e?.active !== false).slice(0, 1);
    if (!rows.length) rows = [payload.find((e) => !String(e.dataKey || '').startsWith('__trend_'))].filter(Boolean);
  }
  if (!rows.length) return null;
  const title =
    rows[0]?.payload?.period ||
    rows[0]?.payload?.xLabel ||
    payload[0]?.payload?.period ||
    payload[0]?.payload?.xLabel ||
    label;
  return (
    <VizTooltipBox title={title} typography={typography}>
      {rows.map((entry) => (
        <p key={entry.dataKey} className="tabular-nums" style={{ color: entry.color }}>
          {entry.name}: {fmtNum(entry.value)}
        </p>
      ))}
      <p className="mt-1 border-t border-border/50 pt-1 text-muted-foreground">
        {VIZ_KH.chartClickDetailHint}
      </p>
    </VizTooltipBox>
  );
}

function SnapshotTooltip({ active, payload, typography }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  return (
    <VizTooltipBox title={p?.fullName} typography={typography}>
      <p className="tabular-nums text-primary">{fmtNum(p?.total)}</p>
    </VizTooltipBox>
  );
}

function DemoTooltip({ active, payload, label, shared = true, typography }) {
  if (!active || !payload?.length) return null;
  const rows = shared ? payload : payload.filter((e) => e?.active !== false).slice(0, 1);
  return (
    <VizTooltipBox title={label} typography={typography}>
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
  const t = resolveChartTypography(settings);
  return {
    domain,
    tick: t.tick,
    allowDecimals: false,
    width: 52,
    axisLine: false,
    tickLine: false,
    tickCount: settings.yTicks ?? 5
  };
}

function PieTrendTooltip({ active, payload, typography }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  return (
    <VizTooltipBox title={p?.name} typography={typography}>
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
  stackId,
  typography,
  onPointClick
}) {
  const clickHandler = onPointClick
    ? (s) => (data, indexOrEvent, maybeEvent) => {
        const event = maybeEvent || (indexOrEvent && typeof indexOrEvent === 'object' ? indexOrEvent : null);
        if (event && typeof event.stopPropagation === 'function') {
          event.stopPropagation();
        }
        const row = data.payload || data;
        const val = data.value !== undefined ? data.value : (row ? row[s.dataKey] : null);
        onPointClick({
          row,
          seriesId: s.id,
          seriesLabel: s.label,
          value: val
        });
      }
    : null;

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
        onClick={clickHandler ? clickHandler(s) : undefined}
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
        onClick={clickHandler ? clickHandler(s) : undefined}
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
      onClick={clickHandler ? clickHandler(s) : undefined}
    >
      {showLabels ? (
        <LabelList
          dataKey={s.dataKey}
          position={labelPos}
          style={typography?.labelList}
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
  const typography = resolveChartTypography(chartSettings);
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
  const xLayout = resolveXAxisLayout(denseX, chartSettings, chartData.length);
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
    const { slices: rawSlices, periodLabel } = buildPieSlicesFromTrendData(chartData, series, xDataKey);
    if (!rawSlices.length) {
      return (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <VizEmpty>{VIZ_KH.chartPieNoData}</VizEmpty>
        </div>
      );
    }
    const { slices, total, showOnChartLabels } = preparePieDisplay(rawSlices);
    const pieLegend = slices.map((s) => ({
      key: s.id,
      label: pieLegendLabel(s, total),
      color: s.color
    }));
    const useLegend = chartSettings.showLegend !== false || !showOnChartLabels || slices.length > 8;
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
    const pieLabel =
      showOnChartLabels &&
      (({ name, percent, x, y }) => {
        if (percent < PIE_ON_CHART_LABEL_MIN_PERCENT) return null;
        return (
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={typography.fill}
            fontSize={typography.fontSize}
            fontWeight={typography.fontWeight}
          >
            {`${name} ${(percent * 100).toFixed(0)}%`}
          </text>
        );
      });
    return (
      <>
        <p
          className="mb-1 shrink-0 text-center text-muted-foreground"
          style={{ fontSize: typography.fontSize, fontWeight: typography.fontWeight }}
        >
          {VIZ_KH.chartPiePeriodHint.replace('{period}', periodLabel)}
        </p>
        {!showOnChartLabels ? (
          <p
            className="mb-2 shrink-0 text-center text-muted-foreground/90"
            style={{ fontSize: Math.max(9, typography.fontSize - 1), fontWeight: typography.fontWeight }}
          >
            {VIZ_KH.chartPieLegendHint}
          </p>
        ) : null}
        <VizChartPlot className={onPointClick ? 'cursor-pointer' : undefined}>
          <ChartResponsive>
            <PieChart>
              <Tooltip content={(props) => <PieTrendTooltip {...props} typography={typography} />} />
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="78%"
                label={pieLabel || false}
                labelLine={Boolean(pieLabel)}
                onClick={(_, index) => handlePieClick(slices[index])}
              >
                {slices.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartResponsive>
        </VizChartPlot>
        {useLegend ? (
          <VizLegend items={pieLegend} typography={typography} scrollable={pieLegend.length > 6} />
        ) : null}
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
  const showPeriodStrip = !isHorizontal && chartData.length > 0;
  const chartBottomMargin = showPeriodStrip ? 12 : xLayout.bottom + 16;
  const yAxisWidth = 52;
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
          : { top: 16, right: 12, left: 4, bottom: chartBottomMargin }
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
          <XAxis type="number" tick={typography.tick} allowDecimals={false} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey={xDataKey}
            width={denseX ? 200 : 88}
            tick={{ ...typography.tick, fontSize: typography.periodDenseSize }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
        </>
      ) : showPeriodStrip ? (
        <>
          <XAxis
            dataKey={xDataKey}
            interval={0}
            height={8}
            tick={false}
            axisLine={{ stroke: GRID }}
            tickLine={false}
          />
          <YAxis {...yAxisProps(yDomain, chartSettings)} />
        </>
      ) : (
        <>
          <XAxis
            {...categoryXAxisProps({ xDataKey, xLayout, showPeriodAxisTitle: false, typography })}
          />
          <YAxis {...yAxisProps(yDomain, chartSettings)} />
        </>
      )}
      <Tooltip
        shared={tooltipShared}
        cursor={tooltipCursor}
        content={(props) => (
          <MultiTrendTooltip {...props} shared={tooltipShared} typography={typography} />
        )}
      />
      {renderTrendSeries({
        chartType,
        series,
        lineCurve,
        lineStrokeWidth,
        barMaxSize,
        barRadius,
        showLabels,
        stackId,
        typography,
        onPointClick
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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <VizChartPlot className={cn('min-h-0 flex-1', onPointClick && 'cursor-pointer')}>
          <ChartResponsive>{cartesian}</ChartResponsive>
        </VizChartPlot>
        {showPeriodStrip ? (
          <VizPeriodAxis
            rows={chartData}
            xDataKey={xDataKey}
            yAxisWidth={yAxisWidth}
            dense={denseX}
            typography={typography}
          />
        ) : null}
      </div>
      {chartSettings.showLegend ? <VizLegend items={legendItems} typography={typography} /> : null}
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

  const typography = resolveChartTypography(chartSettings);
  const textStyle = { fontSize: typography.fontSize, fontWeight: typography.fontWeight };
  const facilityOrder = grouped.map((g) => g.facilityCode);
  const legendItems = grouped.map((g, i) => ({
    key: g.facilityCode,
    label: g.facilityLabel,
    color: resolveSeriesColor(g.facilityCode, i, chartSettings)
  }));

  return (
    <VizChartShell
      title={VIZ_KH.chartSnapshotCompareGrouped.replace('{period}', periodLabel)}
      legend={<VizLegend items={legendItems} typography={typography} />}
    >
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 py-2">
        {grouped.map((group, gi) => {
          const color = resolveSeriesColor(group.facilityCode, gi, chartSettings);
          return (
            <section key={group.facilityCode} className="border border-border/70 bg-muted/5 px-2 py-2">
              <h4 className="mb-2 truncate text-foreground" style={textStyle}>
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
                      <div className="mb-0.5 flex items-baseline justify-between gap-2" style={textStyle}>
                        <span className="min-w-0 flex-1 truncate text-foreground" title={row.fullName}>
                          {row.name}
                        </span>
                        <span className="shrink-0 tabular-nums text-foreground">{fmtNum(row.total)}</span>
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

  const typography = resolveChartTypography(chartSettings);
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
      legend={chartSettings.showLegend ? <VizLegend items={legendItems} typography={typography} /> : null}
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
              <XAxis type="number" tick={typography.tick} allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={labelW}
                tick={{ ...typography.tick, fontSize: typography.periodDenseSize }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <Tooltip
                content={(props) => <SnapshotTooltip {...props} typography={typography} />}
                cursor={{ fill: 'oklch(0.5 0.13 46 / 0.06)' }}
              />
              <Bar dataKey="total" radius={0} maxBarSize={22}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={colorForEntry(entry, i)} />
                ))}
                <LabelList
                  dataKey="total"
                  position="right"
                  style={typography.labelList}
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

  const typography = resolveChartTypography(chartSettings);
  const yDomain = resolveYAxisDomain(data, [], chartSettings);

  return (
    <VizChartShell
      title={title}
      legend={chartSettings.showLegend ? <VizLegend items={DEMO_LEGEND} typography={typography} /> : null}
    >
      <p
        className="mb-1 shrink-0 text-muted-foreground"
        style={{ fontSize: typography.fontSize, fontWeight: typography.fontWeight }}
      >
        {VIZ_KH.chartDemographicsHint}
      </p>
      <VizChartPlot>
        <ChartResponsive>
          <BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 28 }}>
            {chartSettings.showGrid !== false ? (
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" strokeOpacity={0.45} vertical={false} />
            ) : null}
            <XAxis
              {...categoryXAxisProps({
                xDataKey: 'period',
                xLayout: resolveXAxisLayout(false, chartSettings, data.length),
                showPeriodAxisTitle: true,
                typography
              })}
            />
            <YAxis {...yAxisProps(yDomain, chartSettings)} />
            <Tooltip
              shared={chartSettings.tooltipShared !== false}
              cursor={
                chartSettings.tooltipShared !== false
                  ? { fill: 'oklch(0.5 0.13 46 / 0.06)' }
                  : { fill: 'oklch(0.5 0.13 46 / 0.12)' }
              }
              content={(props) => (
                <DemoTooltip
                  {...props}
                  shared={chartSettings.tooltipShared !== false}
                  typography={typography}
                />
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
  sites = [],
  periods = [],
  onNavigateToPatient360,
  onBeforeNavigateToPatient360
}) {
  const [chartDetail, setChartDetail] = useState(null);
  const primaryId = chartIndicatorIds[0] || null;
  const facilityCompare = isMultiFacilityCompare(results);

  const openPointDetail = useCallback(
    ({ row, seriesId, seriesLabel, value }) => {
      const result = findResultForChartPoint(results, { compareMode: facilityCompare, row, seriesId });
      setChartDetail(
        buildChartPointDetail(result, catalog, {
          compareMode: facilityCompare,
          seriesLabel,
          xLabel: row?.xLabel || row?.period,
          value
        })
      );
    },
    [results, catalog, facilityCompare]
  );

  const openSnapshotDetail = useCallback(
    ({ periodKey, indicatorId, facilityCode, seriesLabel, xLabel, value }) => {
      const seriesId = facilityCompare && facilityCode ? facilityCode : indicatorId;
      const row = { periodKey, indicatorId, xLabel };
      openPointDetail({ row, seriesId, seriesLabel, value });
    },
    [openPointDetail, facilityCompare]
  );
  const multi = useMemo(() => {
    let built;
    if (facilityCompare && chartIndicatorIds.length) {
      built = buildFacilityCompareTrendData(results, chartIndicatorIds, catalog);
    } else {
      built = buildMultiTrendData(results, chartIndicatorIds, catalog);
    }
    return {
      ...built,
      series: applySeriesColors(built.series, chartSettings)
    };
  }, [facilityCompare, results, chartIndicatorIds, catalog, chartSettings]);
  const snapshot = useMemo(
    () => buildSnapshotData(results, chartIndicatorIds, catalog, { compareMode: facilityCompare }),
    [results, chartIndicatorIds, catalog, facilityCompare]
  );
  const demoData = useMemo(
    () => buildDemographicsForIndicator(results, primaryId),
    [results, primaryId]
  );
  const singleKpis = useMemo(() => {
    if (facilityCompare || chartIndicatorIds.length !== 1 || !primaryId) return [];
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
      results={results}
      onClose={() => setChartDetail(null)}
      catalog={catalog}
      periods={periods}
      pageContext={{ siteCode, siteLevel, scopeMode, compareSiteCodes, sites }}
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      {singleKpis.length ? <VizKpiGrid kpis={singleKpis} /> : null}
      {facilityCompare ? (
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
