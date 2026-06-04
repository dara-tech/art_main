import api from './api';

const patient360Api = {
  getDictionary: async () =>
    (await api.get('/apiv1/patient-360/dictionary')).data,

  getDrugOptions: async (siteCode) =>
    (await api.get('/apiv1/patient-360/drugs', { params: { siteCode } })).data?.drugs || [],

  listPatients: async (
    siteCode,
    { page = 1, limit = 25, program, q, sex, province, patientStatus, sortBy, sortDir } = {}
  ) =>
    (
      await api.get('/apiv1/patient-360/patients', {
        params: {
          siteCode,
          page,
          limit,
          program: program || undefined,
          q: q || undefined,
          sex: sex === '0' || sex === '1' ? sex : undefined,
          province: province?.trim() || undefined,
          patientStatus:
            patientStatus === '0' || patientStatus === '1' || patientStatus === '3'
              ? patientStatus
              : undefined,
          sortBy: sortBy || undefined,
          sortDir: sortDir === 'desc' ? 'desc' : sortBy ? 'asc' : undefined
        }
      })
    ).data,

  listVisits: async (siteCode, params) =>
    (await api.get('/apiv1/patient-360/visits', { params: { siteCode, ...params } })).data,

  search: async (siteCode, q, limit = 15) =>
    (await api.get('/apiv1/patient-360/search', { params: { siteCode, q, limit } })).data,

  getProfile: async (siteCode, clinicId, { tab = 'summary', program, programs } = {}) =>
    (
      await api.get('/apiv1/patient-360', {
        params: {
          siteCode,
          clinicId,
          tab,
          program,
          programs: Array.isArray(programs) ? programs.join(',') : programs
        }
      })
    ).data,

  createAdultRegistration: async (siteCode, payload) =>
    (await api.post('/apiv1/patient-360/registration', { ...payload, siteCode })).data,

  updateAdultRegistration: async (siteCode, clinicId, payload) =>
    (await api.put(`/apiv1/patient-360/registration/${clinicId}`, { ...payload, siteCode })).data,

  createAdultVisit: async (siteCode, payload) =>
    (await api.post('/apiv1/patient-360/visits', { ...payload, siteCode })).data,

  updateAdultVisit: async (siteCode, vid, payload) =>
    (await api.put(`/apiv1/patient-360/visits/${vid}`, { ...payload, siteCode })).data,

  getProvinces: async (siteCode) =>
    (await api.get('/apiv1/patient-360/provinces', { params: { siteCode } })).data?.provinces || []
};

export default patient360Api;
