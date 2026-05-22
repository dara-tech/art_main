import api from './api';

const insightApi = {
  getCatalog: async () => (await api.get('/apiv1/insight/catalog')).data,
  run: async (body, config = {}) => (await api.post('/apiv1/insight/run', body, config)).data
};

export default insightApi;
