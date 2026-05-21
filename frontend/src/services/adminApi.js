import api from './api';

const adminApi = {
  getStats: async () => (await api.get('/apiv1/admin/stats')).data,
  getRoles: async () => (await api.get('/apiv1/admin/roles')).data,
  getSites: async () => (await api.get('/apiv1/admin/sites')).data,
  getProvinces: async () => (await api.get('/apiv1/admin/provinces')).data,
  getOds: async () => (await api.get('/apiv1/admin/ods')).data,
  listUsers: async (params) => (await api.get('/apiv1/admin/users', { params })).data,
  getUser: async (userId) => (await api.get(`/apiv1/admin/users/${userId}`)).data,
  createUser: async (payload) => (await api.post('/apiv1/admin/users', payload)).data,
  changePassword: async (userId, password) =>
    (await api.put(`/apiv1/admin/users/${userId}/password`, { password })).data,
  updateUserStatus: async (userId, active) =>
    (await api.put(`/apiv1/admin/users/${userId}/status`, { active, statusId: active ? 1 : 0 })).data,
  assignRole: async (userId, roleId) =>
    (await api.post(`/apiv1/admin/users/${userId}/roles`, { roleId })).data,
  removeRole: async (userId, assignmentId) =>
    (await api.delete(`/apiv1/admin/users/${userId}/roles/${assignmentId}`)).data,
  clearOrgUnits: async (userId) => (await api.delete(`/apiv1/admin/users/${userId}/org-units`)).data,
  addOrgUnit: async (userId, payload) =>
    (await api.post(`/apiv1/admin/users/${userId}/org-units`, payload)).data,
  removeOrgUnit: async (userId, orgUnitId) =>
    (await api.delete(`/apiv1/admin/users/${userId}/org-units/${orgUnitId}`)).data
};

export default adminApi;
