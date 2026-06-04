import { createElement } from 'react';
import { P360_KH } from '../../pages/patient360Kh';
import { columnWidthForField } from './patient360ColumnWidths';

export const P360_VISIT_COLUMN_DEFS = [
  {
    id: 'clinicId',
    label: P360_KH.listHeaders.clinicId || 'Clinic ID',
  },
  {
    id: 'program',
    label: P360_KH.listHeaders.program || 'Program',
  },
  {
    id: 'sex',
    label: P360_KH.listHeaders.sex || 'Sex',
  },
  {
    id: 'artNumber',
    label: P360_KH.listHeaders.art || 'ART No',
  },
  {
    id: 'visitDate',
    label: 'ថ្ងៃពិនិត្យ (Visit Date)',
  },
  {
    id: 'visitType',
    label: 'ប្រភេទពិនិត្យ (Type Visit)',
  },
  {
    id: 'nextAppt',
    label: 'ថ្ងៃណាត់ (Next Appt)',
  }
];

export function buildVisitTableColumns(programFilter = '') {
  const cols = [];
  for (const def of P360_VISIT_COLUMN_DEFS) {
    if (def.id === 'program' && programFilter) continue;
    
    cols.push({
      id: def.id,
      label: def.label,
      minWidth: columnWidthForField(def.id) || 120,
      getValue: (row) => {
        const val = row[def.id];
        if (def.id === 'program') {
          if (val === 'adult') return 'មនុស្សពេញវ័យ ART';
          if (val === 'child') return 'កុមារ ART';
          if (val === 'infant') return 'ទារក / EID';
          return val || '—';
        }
        if (def.id === 'sex') return row.sexLabel || val || '—';
        if (def.id === 'visitType') return row.visitTypeLabel || val || '—';
        if (def.id === 'visitDate' || def.id === 'nextAppt') {
          if (!val) return '—';
          const s = String(val);
          if (s.startsWith('1900-01-01')) return '—';
          return s.slice(0, 10);
        }
        return val != null && val !== '' ? String(val) : '—';
      }
    });
  }
  return cols;
}
