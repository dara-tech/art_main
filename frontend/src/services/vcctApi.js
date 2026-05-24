import api from './api';

const vcctApi = {
  listPatients: async (siteCode, { page = 1, limit = 25, q } = {}) =>
    (
      await api.get('/apiv1/vcct/patients', {
        params: {
          siteCode,
          page,
          limit,
          q: q?.trim() || undefined
        }
      })
    ).data,

  getDetail: async (siteCode, { vcctId, vcctSiteCode } = {}) =>
    (
      await api.get('/apiv1/vcct/detail', {
        params: {
          siteCode,
          vcctId,
          vcctSiteCode: vcctSiteCode || undefined
        }
      })
    ).data
};

export default vcctApi;
