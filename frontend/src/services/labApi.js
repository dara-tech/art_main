import api from './api';

export async function fetchLabTestResults(params = {}) {
  const {
    start = '20240901130000',
    end = '20240902235959',
    type = 'hiv',
    host = 'public'
  } = params;

  try {
    const response = await api.get('/apiv1/lab/test-results', {
      params: { start, end, type, host }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Lab Test Results:', error);
    throw error;
  }
}
