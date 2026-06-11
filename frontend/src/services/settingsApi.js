import api from './api';

const BASE = '/apiv1/settings';

/**
 * Fetch database connection settings from backend .env
 */
export async function getDatabaseSettings() {
  const { data } = await api.get(`${BASE}/db`);
  return data;
}

/**
 * Update database connection settings in backend .env
 * @param {Object} payload - { host, port, database, username, password }
 */
export async function updateDatabaseSettings(payload) {
  const { data } = await api.post(`${BASE}/db`, payload);
  return data;
}

/**
 * Fetch list of available databases from the server
 * @param {Object} payload - { host, port, username, password }
 */
export async function fetchAvailableDatabases(payload) {
  const { data } = await api.post(`${BASE}/databases`, payload);
  return data;
}
