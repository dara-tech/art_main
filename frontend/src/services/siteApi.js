import api from './api';

const siteApi = {
  getAllSites: async () => (await api.get('/apiv1/auth/sites-registry')).data
};

export default siteApi;
