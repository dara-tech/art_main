import api from './api';

const patient360Api = {
  getDictionary: async () =>
    (await api.get('/apiv1/patient-360/dictionary')).data,

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

  search: async (siteCode, q, limit = 15) =>
    (await api.get('/apiv1/patient-360/search', { params: { siteCode, q, limit } })).data,

  /** tab: summary | visits | labs | drugs | history | care | status | timeline | full */
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
    ).data
};

export default patient360Api;
