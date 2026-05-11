import api from './api';

const siteApi = {
  getAllSites: async () => (await api.get('/apiv1/lookups/sites-registry')).data
};

export default siteApi;
