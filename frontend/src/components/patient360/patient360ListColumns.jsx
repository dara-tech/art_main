import { createElement } from 'react';
import { P360_KH } from '../../pages/patient360Kh';
import { columnWidthForField } from './patient360ColumnWidths';
import Patient360ListVcctCell from './Patient360ListVcctCell';

const H = P360_KH.listHeaders;
const STORAGE_KEY = 'p360-list-column-order-v4';
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
  if (code == null || code === '' || Number(code) === -1) {
    return row?.patientStatusLabel || 'កំពុងព្យាបាល (Active)';
  }
  const key = String(code);
  return P360_KH.list.statusLabels?.[key] || row.patientStatusLabel || 'កំពុងព្យាបាល (Active)';
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
    id: 'vcct',
    label: H.vcct,
    hideWhen: (programFilter) => programFilter === 'infant'
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
  },
  {
    id: 'latestVl',
    label: H.latestVl,
    hideWhen: () => false
  },
  {
    id: 'currentRegimen',
    label: H.currentRegimen,
    hideWhen: () => false
  },
  {
    id: 'mmdStatus',
    label: H.mmdStatus,
    hideWhen: () => false
  },
  {
    id: 'nextAppointment',
    label: H.nextAppointment,
    hideWhen: () => false
  },
  {
    id: 'tptStatus',
    label: H.tptStatus,
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
      sortValue: (r) => r.patientStatus ?? -1,
      getValue: (r) => formatPatientStatus(r),
      renderCell: (r) => {
        const text = formatPatientStatus(r);
        const code = r?.patientStatus;
        let tone = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400';
        if (code === '0' || Number(code) === 0) tone = 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400';
        else if (code === '3' || Number(code) === 3) tone = 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400';
        else if (code === '1' || Number(code) === 1) tone = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        return createElement('span', { className: `inline-flex items-center rounded-none border px-1.5 py-0.5 text-[11px] font-medium ${tone}` }, text);
      }
    },
    patientStatusDate: {
      id: 'patientStatusDate',
      label: H.statusDate,
      width: columnWidthForField('patientStatusDate', H.statusDate, colCount),
      mono: true,
      sortValue: (r) => r.patientStatusDate || r.daArt || r.firstVisit,
      getValue: (r) => formatDate(r.patientStatusDate || r.daArt || r.firstVisit)
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
    vcct: {
      id: 'vcct',
      label: H.vcct,
      width: columnWidthForField('vcct', H.vcct, colCount) + 16,
      mono: true,
      sortValue: (r) => r.vcctId,
      getValue: (r) => (r.vcctId ? String(r.vcctId).trim() : '—'),
      renderCell: (row) => createElement(Patient360ListVcctCell, { row })
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
    },
    latestVl: {
      id: 'latestVl',
      label: H.latestVl,
      width: columnWidthForField('latestVl', H.latestVl, colCount),
      sortValue: (r) => r.latestVl || r.vlResult || 0,
      getValue: (r) => {
        const val = r.latestVl ?? r.vlResult;
        if (val == null || val === '') return '—';
        return String(val);
      }
    },
    currentRegimen: {
      id: 'currentRegimen',
      label: H.currentRegimen,
      width: columnWidthForField('currentRegimen', H.currentRegimen, colCount),
      sortValue: (r) => r.currentRegimen || r.regimen || '',
      getValue: (r) => r.currentRegimen || r.regimen || 'TLD'
    },
    mmdStatus: {
      id: 'mmdStatus',
      label: H.mmdStatus,
      width: columnWidthForField('mmdStatus', H.mmdStatus, colCount),
      sortValue: (r) => r.mmdStatus || r.mmd || '',
      getValue: (r) => r.mmdStatus || r.mmd || '3M MMD'
    },
    nextAppointment: {
      id: 'nextAppointment',
      label: H.nextAppointment,
      width: columnWidthForField('nextAppointment', H.nextAppointment, colCount),
      mono: true,
      sortValue: (r) => r.nextAppointment || r.daNextVisit,
      getValue: (r) => formatDate(r.nextAppointment || r.daNextVisit)
    },
    tptStatus: {
      id: 'tptStatus',
      label: H.tptStatus,
      width: columnWidthForField('tptStatus', H.tptStatus, colCount),
      sortValue: (r) => r.tptStatus || r.tpt,
      getValue: (r) => r.tptStatus || r.tpt || '—'
    }
  };

  return order.map((id) => byId[id]).filter(Boolean);
}
