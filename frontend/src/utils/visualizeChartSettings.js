import { VIZ_CHART_COLORS } from './visualizeChartData';

/** Nice upper bound for Y-axis ticks (e.g. 937 → 1000). */
export function niceCeil(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 10;
  const mag = 10 ** Math.floor(Math.log10(n));
  const norm = n / mag;
  let nice = 10;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 5) nice = 5;
  return nice * mag;
}

export const VIZ_COLOR_PALETTES = {
  default: VIZ_CHART_COLORS,
  warm: [
    'oklch(0.55 0.14 45)',
    'oklch(0.5 0.12 25)',
    'oklch(0.48 0.1 70)',
    'oklch(0.52 0.11 15)',
    'oklch(0.46 0.09 55)',
    'oklch(0.58 0.13 85)',
    'oklch(0.44 0.08 35)',
    'oklch(0.5 0.1 95)'
  ],
  cool: [
    'oklch(0.48 0.1 240)',
    'oklch(0.5 0.11 210)',
    'oklch(0.46 0.09 270)',
    'oklch(0.52 0.1 195)',
    'oklch(0.44 0.08 255)',
    'oklch(0.5 0.12 225)',
    'oklch(0.42 0.07 285)',
    'oklch(0.54 0.09 200)'
  ],
  pastel: [
    'oklch(0.78 0.08 46)',
    'oklch(0.76 0.07 252)',
    'oklch(0.75 0.06 18)',
    'oklch(0.77 0.07 165)',
    'oklch(0.74 0.06 280)',
    'oklch(0.78 0.08 75)',
    'oklch(0.76 0.05 220)',
    'oklch(0.73 0.04 58)'
  ],
  vivid: [
    'oklch(0.58 0.2 46)',
    'oklch(0.55 0.18 252)',
    'oklch(0.56 0.19 18)',
    'oklch(0.57 0.17 165)',
    'oklch(0.54 0.2 280)',
    'oklch(0.58 0.18 75)',
    'oklch(0.55 0.16 220)',
    'oklch(0.52 0.15 58)'
  ]
};

export const CHART_PALETTE_IDS = Object.keys(VIZ_COLOR_PALETTES);

export const CHART_FONT_SIZE_OPTIONS = [9, 10, 11, 12, 13, 14];
export const CHART_FONT_WEIGHT_OPTIONS = ['normal', 'medium', 'bold'];

const CHART_AXIS_FILL = '#73695c';

export function resolveChartFontWeight(weight = 'medium') {
  if (weight === 'bold') return 700;
  if (weight === 'normal') return 400;
  return 500;
}

/** Recharts tick / axis / HTML period strip typography from chart settings. */
export function resolveChartTypography(settings = DEFAULT_CHART_SETTINGS) {
  const rawSize = Number(settings.chartFontSize);
  const fontSize = CHART_FONT_SIZE_OPTIONS.includes(rawSize) ? rawSize : 11;
  const fontWeight = resolveChartFontWeight(settings.chartFontWeight);
  const axisTitleWeight = settings.chartFontWeight === 'bold' ? 700 : 600;
  return {
    fontSize,
    fontWeight,
    fill: CHART_AXIS_FILL,
    tick: { fontSize, fill: CHART_AXIS_FILL, fontWeight },
    axisTitle: { fill: CHART_AXIS_FILL, fontSize, fontWeight: axisTitleWeight },
    periodDenseSize: Math.max(9, fontSize - 1),
    labelList: { fontSize, fontWeight, fill: 'var(--foreground)' }
  };
}

export const DEFAULT_CHART_SETTINGS = {
  yFromZero: true,
  yMaxMode: 'auto',
  yMaxManual: 1000,
  showGrid: true,
  showBarLabels: false,
  showLegend: false,
  /** true = tooltip lists every series at the same period; false = only the hovered bar/line */
  tooltipShared: true,
  showTrendLine: false,
  colorPalette: 'default',
  seriesColors: {},
  xLabelAngle: 'auto',
  barMaxSize: 40,
  barRadius: 0,
  lineCurve: 'monotone',
  lineStrokeWidth: 2,
  yTicks: 5,
  chartFontSize: 11,
  chartFontWeight: 'medium'
};

export function getPaletteColors(paletteId = 'default') {
  return VIZ_COLOR_PALETTES[paletteId] || VIZ_COLOR_PALETTES.default;
}

export function resolveSeriesColor(seriesId, index, settings = DEFAULT_CHART_SETTINGS) {
  const overrides = settings.seriesColors || {};
  if (overrides[seriesId]) return overrides[seriesId];
  const palette = getPaletteColors(settings.colorPalette);
  return palette[index % palette.length];
}

export function applySeriesColors(series = [], settings = DEFAULT_CHART_SETTINGS) {
  return series.map((s, i) => ({
    ...s,
    color: resolveSeriesColor(s.id, i, settings)
  }));
}

export function resolveXAxisLayout(denseX, settings = DEFAULT_CHART_SETTINGS, pointCount = 0) {
  const mode = settings.xLabelAngle || 'auto';
  if (mode === 'straight') {
    return { angle: 0, textAnchor: 'middle', height: 52, bottom: 40, axisTitleOffset: 14 };
  }
  if (mode === 'slanted') {
    return { angle: -35, textAnchor: 'end', height: 80, bottom: 64, axisTitleOffset: 14 };
  }
  if (denseX) {
    return { angle: -35, textAnchor: 'end', height: 80, bottom: 64, axisTitleOffset: 14 };
  }
  if (pointCount > 8) {
    return { angle: -35, textAnchor: 'end', height: 80, bottom: 64, axisTitleOffset: 14 };
  }
  /* Multiple quarters/months: horizontal period labels under bars */
  return { angle: 0, textAnchor: 'middle', height: 56, bottom: 44, axisTitleOffset: 16 };
}

/** Best-effort hex for native color input (oklch falls back to theme primary). */
export function colorToPickerHex(color) {
  const c = String(color || '').trim();
  if (/^#[0-9a-f]{6}$/i.test(c)) return c;
  if (/^#[0-9a-f]{3}$/i.test(c)) {
    const [, a, b, d] = c;
    return `#${a}${a}${b}${b}${d}${d}`;
  }
  return '#8b5a2b';
}

/** Least-squares linear trend y = mx + b over index 0..n-1 (skips non-finite values). */
export function linearTrendValues(values = []) {
  const points = values
    .map((y, x) => ({ x, y: Number(y) }))
    .filter((p) => Number.isFinite(p.y));
  if (points.length < 2) {
    const flat = points[0]?.y ?? null;
    return values.map(() => (flat != null ? flat : null));
  }
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  const n = points.length;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }
  const denom = n * sumXX - sumX * sumX;
  const m = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;
  return values.map((_, i) => {
    const raw = m * i + b;
    return Number.isFinite(raw) ? Math.round(raw) : null;
  });
}

export function trendLineDataKey(seriesId) {
  return `__trend_${seriesId}`;
}

/** Adds per-series regression keys for Recharts overlay lines. */
export function withTrendLineOverlay(data = [], series = [], enabled = false) {
  if (!enabled || !data.length || !series.length) return data;
  const trends = {};
  for (const s of series) {
    trends[s.id] = linearTrendValues(data.map((row) => row[s.dataKey]));
  }
  return data.map((row, i) => {
    const next = { ...row };
    for (const s of series) {
      next[trendLineDataKey(s.id)] = trends[s.id][i];
    }
    return next;
  });
}

export function maxFromChartData(data = [], series = []) {
  let max = 0;
  for (const row of data) {
    if (row?.total != null && series.length === 0) {
      max = Math.max(max, Number(row.total) || 0);
      continue;
    }
    for (const s of series) {
      max = Math.max(max, Number(row[s.dataKey]) || 0);
    }
    if (row?.male014 != null) {
      const stackA = (Number(row.male014) || 0) + (Number(row.female014) || 0);
      const stackB = (Number(row.maleOver14) || 0) + (Number(row.femaleOver14) || 0);
      max = Math.max(max, stackA, stackB);
    }
  }
  return max;
}

export function resolveYAxisDomain(data, series, settings = DEFAULT_CHART_SETTINGS) {
  const maxVal = maxFromChartData(data, series);
  const min = settings.yFromZero !== false ? 0 : 'auto';
  if (settings.yMaxMode === 'manual') {
    const manual = Number(settings.yMaxManual);
    if (Number.isFinite(manual) && manual > 0) {
      return [min, manual];
    }
  }
  if (maxVal <= 0) return [0, 10];
  const padded = Math.ceil(maxVal * 1.06);
  return [min, niceCeil(padded)];
}
