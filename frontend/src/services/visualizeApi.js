import api, { getApiBaseUrl } from './api';
import { handleUnauthorized, isUnauthorizedResponse } from './authSession';

async function streamVisualizeRun(body, handlers = {}) {
  const token = localStorage.getItem('token');
  const base = getApiBaseUrl();

  const url = `${base}/apiv1/visualize/run/stream`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/x-ndjson',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    if (isUnauthorizedResponse(response.status)) {
      handleUnauthorized();
      throw new Error('Session expired. Please sign in again.');
    }
    let message = `Request failed (${response.status})`;
    try {
      const err = await response.json();
      message = err?.message || err?.error || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Streaming is not supported in this browser');
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  const parseLine = (line) => {
    if (!line.trim()) return;
    let payload = null;
    try {
      payload = JSON.parse(line);
    } catch {
      return;
    }
    handlers.onMessage?.(payload);
    if (payload.type === 'start') handlers.onStart?.(payload);
    if (payload.type === 'result') handlers.onResult?.(payload);
    if (payload.type === 'done') handlers.onDone?.(payload);
    if (payload.type === 'error') handlers.onError?.(new Error(payload.message || 'Stream error'));
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    lines.forEach(parseLine);
  }
  if (buffer.trim()) parseLine(buffer);
}

const visualizeApi = {
  getCatalog: async () => (await api.get('/apiv1/visualize/catalog')).data,
  run: async (body) => (await api.post('/apiv1/visualize/run', body)).data,
  streamRun: streamVisualizeRun
};

export default visualizeApi;
