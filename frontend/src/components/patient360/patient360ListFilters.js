/** Default list filter shape (Patient 360 registry). */
export const P360_LIST_FILTER_EMPTY = {
  program: '',
  q: '',
  sex: '',
  province: '',
  patientStatus: ''
};

export function countActiveListFilters(filters) {
  if (!filters) return 0;
  let n = 0;
  if (filters.program) n += 1;
  if (String(filters.q || '').trim().length >= 2) n += 1;
  if (filters.sex === '0' || filters.sex === '1') n += 1;
  if (String(filters.province || '').trim()) n += 1;
  if (filters.patientStatus === '0' || filters.patientStatus === '1' || filters.patientStatus === '3') {
    n += 1;
  }
  return n;
}

export function normalizeListFilters(filters) {
  return {
    program: filters?.program ? String(filters.program) : '',
    q: filters?.q != null ? String(filters.q) : '',
    sex: filters?.sex === '0' || filters?.sex === '1' ? String(filters.sex) : '',
    province: filters?.province != null ? String(filters.province).trim() : '',
    patientStatus:
      filters?.patientStatus === '0' || filters?.patientStatus === '1' || filters?.patientStatus === '3'
        ? String(filters.patientStatus)
        : ''
  };
}
