/** Shared patient-list helpers for report + visualize detail modals. */

export const DETAIL_COLUMN_LABELS = {
  clinicid: 'Clinic ID',
  site_code: 'Site',
  art_number: 'ART Number',
  Artnum: 'ART Number',
  ART: 'ART Number',
  Sex: 'Sex',
  sex: 'Sex',
  sex_display: 'Sex',
  age: 'Age',
  Age: 'Age',
  patient_type: 'Patient Type',
  typepatients: 'Patient Type',
  patient_status: 'Patient Status',
  DaBirth: 'Date of Birth',
  DafirstVisit: 'First Visit Date',
  DaArt: 'ART Start Date',
  Startartstatus: 'ART Status',
  OffIn: 'Registration Type',
  transfer_status: 'Transfer Status',
  Status: 'Status',
  Tptdrugname: 'TPT Drug',
  dateStart: 'TPT Start Date',
  Datestop: 'TPT Stop Date',
  duration: 'TPT Duration (months)',
  tpt_source: 'TPT Source',
  tptstatus: 'TPT Status',
  step: 'Indicator',
  MMDStatus: 'MMD Status',
  TLDStatus: 'TLD Status',
  TypeofReturn: 'Return Type',
  DateResult: 'VL result date',
  HIVLoad: 'Viral load',
  VLdostatus: 'VL test status',
  vlresultstatus: 'VL result',
  VLDate: 'VL date',
  VLValue: 'VL value',
  high_vl_date: 'High VL date',
  high_vl_value: 'High VL value',
  eac1_date: 'EAC session 1',
  eac2_date: 'EAC session 2',
  eac3_date: 'EAC session 3',
  last_eac_date: 'Last EAC date',
  datevisit: 'Last visit date',
  DatVisit: 'Visit date',
  death_date: 'Date of death',
  death_status: 'Death status',
  death_place: 'Place of death',
  DatLost: 'Date lost',
  days_to_art: 'Days to ART',
  tpt_source: 'TPT source'
};

const ART_NUMBER_KEYS = ['art_number', 'Artnum', 'ART'];

const EXCLUDE_BY_DEFAULT = new Set([
  'step',
  'patient_type',
  'DaBirth',
  'OffIn',
  'Startartstatus',
  'MMDStatus',
  'TLDStatus',
  'tptstatus',
  'Tptdrugname',
  'dateStart',
  'Datestop',
  'duration',
  'DateResult',
  'HIVLoad',
  'VLdostatus',
  'vlresultstatus',
  'VLDate',
  'VLValue',
  'high_vl_date',
  'high_vl_value',
  'eac1_date',
  'eac2_date',
  'eac3_date',
  'last_eac_date',
  'death_date',
  'death_status',
  'death_place',
  'DatLost',
  'DafirstVisit',
  'DaArt',
  'datevisit',
  'DatVisit',
  'TypeofReturn',
  'tpt_source'
]);

/** Indicator-specific columns (beyond patient id + demographics). */
function indicatorSpecificColumnHints(indicatorId) {
  const key = String(indicatorId || '')
    .replace(/^infant:/, '')
    .replace(/^pntt:/, '')
    .toLowerCase();

  if (/^10\.(9|10|11|12|13|14)|eac|eligible_eac|vl_followup/.test(key)) {
    return [
      'high_vl_date',
      'high_vl_value',
      'VLDate',
      'VLValue',
      'DateResult',
      'HIVLoad',
      'VLdostatus',
      'vlresultstatus',
      'eac1_date',
      'eac2_date',
      'eac3_date',
      'last_eac_date',
      'patient_status',
      'transfer_status',
      'Status'
    ];
  }
  if (/^10\.(6|7|8)|eligible_vl|vl_tested|vl_suppression/.test(key)) {
    return ['DateResult', 'HIVLoad', 'VLdostatus', 'vlresultstatus', 'VLDate', 'VLValue', 'patient_status', 'transfer_status', 'Status'];
  }
  if (/tld|05\.2_art_with_tld/.test(key)) {
    return ['TLDStatus', 'DaArt', 'patient_status', 'transfer_status', 'Status'];
  }
  if (/^10\.(1|2)|eligible_mmd|_mmd/.test(key)) {
    return ['MMDStatus', 'datevisit', 'DatVisit', 'DaArt', 'patient_status', 'transfer_status', 'Status'];
  }
  if (/tpt|10\.4|10\.5/.test(key)) {
    return ['Tptdrugname', 'dateStart', 'Datestop', 'duration', 'tptstatus', 'tpt_source', 'patient_status', 'transfer_status', 'Status'];
  }
  if (/08\.1|dead/.test(key)) {
    return ['death_date', 'death_status', 'death_place', 'patient_status', 'Status', 'transfer_status'];
  }
  if (/08\.2|ltfu|lost_to_followup/.test(key)) {
    return ['DatLost', 'patient_status', 'Status', 'transfer_status'];
  }
  if (/08\.3|transfer_out/.test(key)) {
    return ['transfer_status', 'patient_status', 'Status', 'DaArt'];
  }
  if (/06_transfer|transfer_in/.test(key)) {
    return ['transfer_status', 'patient_status', 'DaArt', 'DafirstVisit', 'TypeofReturn', 'Status'];
  }
  if (/07_lost|lost_and_return/.test(key)) {
    return ['TypeofReturn', 'DaArt', 'patient_status', 'Status', 'transfer_status'];
  }
  if (/^05\.|newly_initiated|art_same_day|art_1_7|art_over_7/.test(key)) {
    return ['DaArt', 'Startartstatus', 'days_to_art', 'patient_status', 'transfer_status', 'Status'];
  }
  if (/03_newly_enrolled|04_retested/.test(key)) {
    return ['DafirstVisit', 'DaArt', 'patient_status', 'transfer_status', 'Status'];
  }
  if (/^10_active|^01_active|^09_active|active_pre_art|active_art/.test(key)) {
    return ['Startartstatus', 'patient_status', 'Status', 'transfer_status', 'DaArt'];
  }
  return ['patient_status', 'transfer_status', 'Status', 'DaArt'];
}

function firstAvailableKey(available, keys) {
  return keys.find((k) => available.has(k)) || null;
}

function dedupeColumnsByLabel(keys) {
  const seen = new Set();
  return keys.filter((k) => {
    const label = detailColumnLabel(k);
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });
}

export function detailColumnLabel(key) {
  return DETAIL_COLUMN_LABELS[key] || key;
}

function getSex(record) {
  const sex = record?.sex_display || record?.sex || record?.Sex;
  if (sex === 1 || String(sex).toLowerCase() === 'male' || String(sex).toLowerCase() === 'm') return 'male';
  if (sex === 0 || String(sex).toLowerCase() === 'female' || String(sex).toLowerCase() === 'f') return 'female';
  return 'unknown';
}

function getAge(record) {
  const v = record?.age ?? record?.Age;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export function normalizeDetailRecord(record) {
  return {
    ...record,
    sex_display:
      record?.sex_display ||
      (getSex(record) === 'male' ? 'Male' : getSex(record) === 'female' ? 'Female' : 'Unknown'),
    age: getAge(record)
  };
}

/**
 * Columns for visualize detail table: patient id + sex/age + fields for this indicator only.
 */
export function pickDetailColumnKeys(rows = [], { includeSite = false, indicatorId = null } = {}) {
  const available = new Set();
  for (const row of rows) {
    Object.keys(row || {}).forEach((k) => available.add(k));
  }
  if (!available.size) return [];

  if (!indicatorId) {
    return dedupeColumnsByLabel(
      ['clinicid', 'site_code', 'art_number', 'sex_display', 'age']
        .filter((k) => k !== 'site_code' || includeSite)
        .filter((k) => available.has(k))
    );
  }

  if (String(indicatorId).startsWith('infant:') || String(indicatorId).startsWith('pntt:')) {
    const ordered = [];
    const pushKey = (key) => {
      if (key && available.has(key) && !ordered.includes(key)) ordered.push(key);
    };
    if (includeSite) pushKey('site_code');
    pushKey('clinicid');
    pushKey(firstAvailableKey(available, ART_NUMBER_KEYS));
    pushKey(firstAvailableKey(available, ['sex_display', 'Sex', 'sex']));
    pushKey(firstAvailableKey(available, ['age', 'Age']));
    const rest = [...available].filter(
      (k) => !ordered.includes(k) && k !== 'step' && !(k === 'patient_type' && available.has('typepatients'))
    );
    return dedupeColumnsByLabel([...ordered, ...rest]).slice(0, 10);
  }

  const ordered = [];
  const push = (key) => {
    if (key && available.has(key) && !ordered.includes(key)) ordered.push(key);
  };

  if (includeSite) push('site_code');
  push('clinicid');
  push(firstAvailableKey(available, ART_NUMBER_KEYS));
  push(firstAvailableKey(available, ['sex_display', 'Sex', 'sex']));
  push(firstAvailableKey(available, ['age', 'Age']));
  if (available.has('typepatients')) push('typepatients');

  const hints = indicatorSpecificColumnHints(indicatorId);
  for (const h of hints) push(h);

  const allowed = new Set([...ordered]);
  for (const h of hints) allowed.add(h);

  const result = dedupeColumnsByLabel(ordered);
  if (result.length >= 3) return result;

  const fallback = [...available].filter((k) => {
    if (EXCLUDE_BY_DEFAULT.has(k) && !allowed.has(k)) return false;
    if (k === 'patient_type' && available.has('typepatients')) return false;
    if (k === 'site_code' && !includeSite) return false;
    return true;
  });
  return dedupeColumnsByLabel(
    ['clinicid', ...ART_NUMBER_KEYS, 'sex_display', 'age', ...fallback].filter((k) => available.has(k))
  ).slice(0, 10);
}

export function formatDetailCellValue(v, key = '') {
  if (v == null || v === '') return '—';
  const raw = String(v).trim();
  if (raw === '-1' || raw === 'Status: -1' || raw === 'Status: 0' || raw === '0') {
    if (key === 'transfer_status' || key === 'OffIn' || key === 'Status' || key === 'Startartstatus') {
      return 'Not Transferred';
    }
  }
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '—';
  if (!raw) return '—';
  const n = Number(raw.replace(/,/g, ''));
  if (Number.isFinite(n) && /^-?\d+(\.\d+)?$/.test(raw.replace(/,/g, ''))) return String(n);
  return raw;
}

export function filterDetailRowsClient(rows = [], search = '', { gender = '', minAge = '', maxAge = '' } = {}) {
  let list = rows;

  const q = String(search || '').trim().toLowerCase();
  if (q) {
    list = list.filter((row) =>
      Object.values(row || {}).some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }

  const gen = String(gender || '').trim().toLowerCase();
  if (gen) {
    list = list.filter((row) => {
      const s = String(row.Sex || row.sex || row.sex_display || '').trim().toLowerCase();
      if (gen === 'male' || gen === 'm') return s === 'male' || s === 'm' || s === 'ប្រុស' || s.startsWith('m');
      if (gen === 'female' || gen === 'f') return s === 'female' || s === 'f' || s === 'ស្រី' || s.startsWith('f');
      return true;
    });
  }

  const minA = minAge !== '' && minAge != null ? Number(minAge) : null;
  const maxA = maxAge !== '' && maxAge != null ? Number(maxAge) : null;

  if (minA != null || maxA != null) {
    list = list.filter((row) => {
      const a = Number(row.Age ?? row.age);
      if (!Number.isFinite(a)) return true;
      if (minA != null && a < minA) return false;
      if (maxA != null && a > maxA) return false;
      return true;
    });
  }

  return list;
}

export function paginateDetailRowsClient(rows = [], { page = 1, limit = 25 } = {}) {
  const totalCount = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const p = Math.min(Math.max(1, page), totalPages);
  const offset = (p - 1) * limit;
  return {
    data: rows.slice(offset, offset + limit),
    pagination: {
      page: p,
      limit,
      totalCount,
      totalPages,
      hasNext: p < totalPages,
      hasPrev: p > 1
    }
  };
}
