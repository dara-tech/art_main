import api from './api';

/**
 * Sends a natural language query to the backend AI engine.
 * Calls POST /apiv1/ai/copilot-query
 */
export async function queryAiCopilot(query, periodLabel = '2026-Q2') {
  try {
    const res = await api.post('/apiv1/ai/copilot-query', { query, periodLabel });
    return res.data?.data || res.data;
  } catch (err) {
    console.warn('Backend AI query endpoint failed:', err?.message);
    return null;
  }
}

/**
 * Fetches real database anomalies for identified facilities.
 * Calls GET /apiv1/ai/anomalies
 */
export async function fetchAiAnomalies(periodLabel = '2026-Q2') {
  try {
    const res = await api.get('/apiv1/ai/anomalies', { params: { periodLabel } });
    return res.data?.data || [];
  } catch (err) {
    console.warn('Failed to fetch AI anomalies from database:', err?.message);
    return [];
  }
}

/**
 * Fetches real database executive narrative.
 * Calls GET /apiv1/ai/narrative
 */
export async function fetchAiNarrative(periodLabel = '2026-Q2') {
  try {
    const res = await api.get('/apiv1/ai/narrative', { params: { periodLabel } });
    return res.data?.data || null;
  } catch (err) {
    console.warn('Failed to fetch AI narrative from database:', err?.message);
    return null;
  }
}
