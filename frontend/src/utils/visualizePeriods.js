function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const KM_MONTHS = [
  'មករា',
  'កុម្ភៈ',
  'មីនា',
  'មេសា',
  'ឧសភា',
  'មិថុនា',
  'កក្កដា',
  'សីហា',
  'កញ្ញា',
  'តុលា',
  'វិច្ឆិកា',
  'ធ្នូ'
];

export const PERIOD_KIND = {
  quarter: 'quarter',
  month: 'month',
  year: 'year'
};

export function buildQuarterPeriod(year, quarter) {
  const q = Number(quarter);
  const y = Number(year);
  const startMonth = (q - 1) * 3;
  const start = new Date(y, startMonth, 1);
  const end = new Date(y, startMonth + 3, 0);
  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const label = `Q${q} ${y}`;
  return {
    key: `${y}-Q${q}`,
    kind: PERIOD_KIND.quarter,
    year: y,
    label,
    startDate: fmt(start),
    endDate: fmt(end),
    previousEndDate: fmt(previousEnd)
  };
}

export function buildMonthPeriod(year, month) {
  const y = Number(year);
  const m = Number(month);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);
  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const label = `${KM_MONTHS[m - 1]} ${y}`;
  return {
    key: `${y}-M${String(m).padStart(2, '0')}`,
    kind: PERIOD_KIND.month,
    year: y,
    month: m,
    label,
    startDate: fmt(start),
    endDate: fmt(end),
    previousEndDate: fmt(previousEnd)
  };
}

export function buildYearPeriod(year) {
  const y = Number(year);
  const start = new Date(y, 0, 1);
  const end = new Date(y, 11, 31);
  const previousEnd = new Date(y - 1, 11, 31);
  return {
    key: `${y}-Y`,
    kind: PERIOD_KIND.year,
    year: y,
    label: String(y),
    startDate: fmt(start),
    endDate: fmt(end),
    previousEndDate: fmt(previousEnd)
  };
}

export function getPeriodByKey(key) {
  const k = String(key || '').trim();
  if (!k) return null;
  const yearOnly = k.match(/^(\d{4})-Y$/);
  if (yearOnly) return buildYearPeriod(Number(yearOnly[1]));
  const quarter = k.match(/^(\d{4})-Q([1-4])$/);
  if (quarter) return buildQuarterPeriod(Number(quarter[1]), Number(quarter[2]));
  const month = k.match(/^(\d{4})-M(\d{2})$/);
  if (month) return buildMonthPeriod(Number(month[1]), Number(month[2]));
  return null;
}

export function resolvePeriodKeys(keys = []) {
  const seen = new Set();
  const out = [];
  for (const key of keys) {
    const p = getPeriodByKey(key);
    if (!p || seen.has(p.key)) continue;
    seen.add(p.key);
    out.push(p);
  }
  return out;
}

export function listBrowseYears(span = 12) {
  const now = new Date();
  const end = now.getFullYear();
  const start = end - (span - 1);
  const years = [];
  for (let y = end; y >= start; y -= 1) years.push(y);
  return years;
}

/** Full calendar-year periods for every browsable year (newest first). */
export function listAllYearPeriods(span = 12) {
  return listBrowseYears(span).map((y) => buildYearPeriod(y));
}

export function periodsForYear(year, kind = PERIOD_KIND.quarter) {
  const y = Number(year);
  if (kind === PERIOD_KIND.month) {
    return Array.from({ length: 12 }, (_, i) => buildMonthPeriod(y, i + 1));
  }
  if (kind === PERIOD_KIND.year) {
    return [buildYearPeriod(y)];
  }
  return [1, 2, 3, 4].map((q) => buildQuarterPeriod(y, q));
}

/** Disable periods that have not started yet (current quarter/month remain selectable). */
export function isPeriodDisabled(period, now = new Date()) {
  const start = new Date(`${period.startDate}T00:00:00`);
  return start > now;
}

/** Recent quarters for defaults (newest first). */
export function listRecentQuarters(count = 8) {
  const now = new Date();
  let y = now.getFullYear();
  let q = Math.floor(now.getMonth() / 3) + 1;
  const out = [];
  for (let i = 0; i < count; i += 1) {
    out.push(buildQuarterPeriod(y, q));
    q -= 1;
    if (q < 1) {
      q = 4;
      y -= 1;
    }
  }
  return out;
}

export function currentYear() {
  return new Date().getFullYear();
}
