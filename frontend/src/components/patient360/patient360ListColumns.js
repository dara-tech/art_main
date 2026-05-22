import { P360_KH } from '../../pages/patient360Kh';
import { columnWidthForField } from './patient360ColumnWidths';

const H = P360_KH.listHeaders;
const STORAGE_KEY = 'p360-list-column-order-v2';
export const P360_LIST_LOCKED_COLUMN = 'clinicId';

function formatDate(value) {
  if (value == null || value === '') return '—';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value);
  if (s.startsWith('1900-01-01')) return '—';
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function formatPatientStatus(row) {
  const code = row?.patientStatus;
  if (code == null || code === '' || Number(code) === -1) return '—';
  const key = String(code);
  return P360_KH.list.statusLabels?.[key] || row.patientStatusLabel || '—';
}

function formatClinicId(value, program) {
  if (value == null || value === '') return '—';
  const s = String(value).trim();
  if (program === 'child' && /^\d+$/.test(s) && s.length < 6) return s.padStart(6, '0');
  return s;
}

/** All list column definitions (visibility may depend on program filter). */
export const P360_LIST_COLUMN_DEFS = [
  {
    id: 'clinicId',
    label: H.clinicId,
    hideWhen: () => false
  },
  {
    id: 'program',
    label: H.program,
    hideWhen: (programFilter) => Boolean(programFilter)
  },
  {
    id: 'sex',
    label: H.sex,
    hideWhen: () => false
  },
  {
    id: 'patientStatus',
    label: H.status,
    hideWhen: () => false
  },
  {
    id: 'patientStatusDate',
    label: H.statusDate,
    hideWhen: () => false
  },
  {
    id: 'province',
    label: H.province,
    hideWhen: () => false
  },
  {
    id: 'country',
    label: H.country,
    hideWhen: (programFilter) => programFilter === 'infant'
  },
  {
    id: 'dob',
    label: H.dob,
    hideWhen: () => false
  },
  {
    id: 'art',
    label: H.art,
    hideWhen: () => false
  },
  {
    id: 'daArt',
    label: H.daArt,
    hideWhen: (programFilter) => programFilter === 'infant'
  },
  {
    id: 'firstVisit',
    label: H.firstVisit,
    hideWhen: () => false
  }
];

export function getAvailableListColumns(programFilter = '') {
  return P360_LIST_COLUMN_DEFS.filter((c) => !c.hideWhen?.(programFilter));
}

export function defaultListColumnOrder(programFilter = '') {
  return getAvailableListColumns(programFilter).map((c) => c.id);
}

export function labelForListColumn(id) {
  return P360_LIST_COLUMN_DEFS.find((c) => c.id === id)?.label || id;
}

export function sanitizeColumnOrder(order, programFilter = '') {
  const available = new Set(getAvailableListColumns(programFilter).map((c) => c.id));
  const seen = new Set();
  const next = [];
  for (const id of order || []) {
    if (!available.has(id) || seen.has(id)) continue;
    seen.add(id);
    next.push(id);
  }
  if (!next.includes(P360_LIST_LOCKED_COLUMN)) {
    next.unshift(P360_LIST_LOCKED_COLUMN);
  }
  for (const col of getAvailableListColumns(programFilter)) {
    if (!seen.has(col.id)) next.push(col.id);
  }
  return next;
}

export function loadListColumnOrder(programFilter = '') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultListColumnOrder(programFilter);
    const parsed = JSON.parse(raw);
    const order = Array.isArray(parsed?.order) ? parsed.order : Array.isArray(parsed) ? parsed : [];
    return sanitizeColumnOrder(order, programFilter);
  } catch {
    return defaultListColumnOrder(programFilter);
  }
}

export function saveListColumnOrder(order) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ order }));
  } catch {
    /* ignore quota */
  }
}

export function moveColumnOrder(order, fromId, toId) {
  if (!fromId || !toId || fromId === toId) return order;
  const next = [...order];
  const fromIdx = next.indexOf(fromId);
  const toIdx = next.indexOf(toId);
  if (fromIdx === -1 || toIdx === -1) return order;
  const [moved] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, moved);
  if (!next.includes(P360_LIST_LOCKED_COLUMN)) {
    next.unshift(P360_LIST_LOCKED_COLUMN);
  } else {
    const lockIdx = next.indexOf(P360_LIST_LOCKED_COLUMN);
    if (lockIdx > 0) {
      next.splice(lockIdx, 1);
      next.unshift(P360_LIST_LOCKED_COLUMN);
    }
  }
  return next;
}

export function toggleColumnInOrder(order, columnId, visible, programFilter = '') {
  const available = getAvailableListColumns(programFilter).map((c) => c.id);
  if (!available.includes(columnId)) return order;
  if (columnId === P360_LIST_LOCKED_COLUMN) return order;

  if (visible) {
    if (order.includes(columnId)) return order;
    return [...order, columnId];
  }
  return order.filter((id) => id !== columnId);
}

export function buildListTableColumns(programFilter = '', columnOrder = []) {
  const order = sanitizeColumnOrder(columnOrder, programFilter);
  const colCount = order.length || 9;

  const byId = {
    clinicId: {
      id: 'clinicId',
      label: H.clinicId,
      width: columnWidthForField('clinicId', H.clinicId, colCount),
      mono: true,
      sortValue: (r) => formatClinicId(r.clinicId, r.program),
      getValue: (r) => formatClinicId(r.clinicId, r.program)
    },
    program: {
      id: 'program',
      label: H.program,
      width: columnWidthForField('program', H.program, colCount),
      sortValue: (r) => r.program,
      getValue: (r) => r.programLabel || P360_KH.programs[r.program] || r.program
    },
    sex: {
      id: 'sex',
      label: H.sex,
      width: columnWidthForField('sex', H.sex, colCount),
      sortValue: (r) => r.sex,
      getValue: (r) => r.sexLabel || '—'
    },
    patientStatus: {
      id: 'patientStatus',
      label: H.status,
      width: columnWidthForField('patientStatus', H.status, colCount),
      sortValue: (r) => r.patientStatus,
      getValue: (r) => formatPatientStatus(r)
    },
    patientStatusDate: {
      id: 'patientStatusDate',
      label: H.statusDate,
      width: columnWidthForField('patientStatusDate', H.statusDate, colCount),
      mono: true,
      sortValue: (r) => r.patientStatusDate,
      getValue: (r) => formatDate(r.patientStatusDate)
    },
    province: {
      id: 'province',
      label: H.province,
      width: columnWidthForField('province', H.province, colCount),
      sortValue: (r) => r.province,
      getValue: (r) => r.province || '—'
    },
    country: {
      id: 'country',
      label: H.country,
      width: columnWidthForField('country', H.country, colCount),
      sortValue: (r) => r.nationalityLabel || r.Nationality,
      getValue: (r) => r.nationalityLabel || '—'
    },
    dob: {
      id: 'dob',
      label: H.dob,
      width: columnWidthForField('dob', H.dob, colCount),
      mono: true,
      sortValue: (r) => r.dateOfBirth,
      getValue: (r) => formatDate(r.dateOfBirth)
    },
    art: {
      id: 'art',
      label: H.art,
      width: columnWidthForField('art', H.art, colCount),
      sortValue: (r) => r.artNumber,
      getValue: (r) => (r.artNumber ? String(r.artNumber).trim() : '—')
    },
    daArt: {
      id: 'daArt',
      label: H.daArt,
      width: columnWidthForField('daArt', H.daArt, colCount),
      mono: true,
      sortValue: (r) => r.daArt,
      getValue: (r) => formatDate(r.daArt)
    },
    firstVisit: {
      id: 'firstVisit',
      label: H.firstVisit,
      width: columnWidthForField('firstVisit', H.firstVisit, colCount),
      mono: true,
      sortValue: (r) => r.firstVisit,
      getValue: (r) => formatDate(r.firstVisit)
    }
  };

  return order.map((id) => byId[id]).filter(Boolean);
}
