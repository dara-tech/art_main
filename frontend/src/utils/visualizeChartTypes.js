/** Trend panel chart types (Recharts). */
export const CHART_TYPE_IDS = ['bar', 'line', 'area', 'stacked', 'horizontal', 'pie'];

export function isValidChartType(type) {
  return CHART_TYPE_IDS.includes(type);
}

export function normalizeChartType(type, fallback = 'bar') {
  return isValidChartType(type) ? type : fallback;
}

export function supportsTrendLine(type) {
  return type === 'bar' || type === 'line' || type === 'area';
}

export function usesBarOptions(type) {
  return type === 'bar' || type === 'stacked' || type === 'horizontal';
}

export function usesLineCurve(type) {
  return type === 'line' || type === 'area';
}

/** Build pie slices from the latest period row. */
export function buildPieSlicesFromTrendData(data = [], series = [], xDataKey = 'period') {
  if (!data.length || !series.length) return { slices: [], periodLabel: '' };
  const row = data[data.length - 1];
  const periodLabel = row?.[xDataKey] ?? row?.xLabel ?? '';
  const slices = series
    .map((s) => ({
      id: s.id,
      name: s.label,
      value: Number(row[s.dataKey]) || 0,
      color: s.color
    }))
    .filter((d) => d.value > 0);
  return { slices, periodLabel };
}

/** Max slices before on-chart labels are hidden (use legend + tooltip). */
export const PIE_ON_CHART_LABEL_MAX_SLICES = 8;
/** Min share (0–1) to print a label on the pie when labels are enabled. */
export const PIE_ON_CHART_LABEL_MIN_PERCENT = 0.05;

/** Sort slices; keep every site/facility — no "Other" bucket. */
export function preparePieDisplay(slices = []) {
  const sorted = [...slices].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((sum, s) => sum + s.value, 0);
  if (!total) {
    return { slices: [], total: 0, showOnChartLabels: false };
  }

  const showOnChartLabels = sorted.length <= PIE_ON_CHART_LABEL_MAX_SLICES;

  return { slices: sorted, total, showOnChartLabels };
}

export function pieLegendLabel(slice, total) {
  const pct = total > 0 ? ((slice.value / total) * 100).toFixed(1) : '0';
  return `${slice.name} (${pct}%)`;
}
