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
