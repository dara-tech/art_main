function toSortPrimitive(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  const s = String(value).trim();
  if (!s || s === '—') return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const n = Number(s);
  if (!Number.isNaN(n) && /^\d+(\.\d+)?$/.test(s)) return n;
  return s.toLowerCase();
}

export function compareListRows(a, b, column, direction = 'asc') {
  const get = column?.sortValue || column?.getValue;
  if (!get) return 0;
  const av = toSortPrimitive(get(a));
  const bv = toSortPrimitive(get(b));
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  let cmp = 0;
  if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
  else cmp = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
  return direction === 'desc' ? -cmp : cmp;
}

export function sortListRows(rows, column, direction) {
  if (!column || !direction) return rows;
  return [...rows].sort((a, b) => compareListRows(a, b, column, direction));
}

export function nextSortState(prev, columnId) {
  if (prev?.key !== columnId) return { key: columnId, dir: 'asc' };
  return { key: columnId, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
}
