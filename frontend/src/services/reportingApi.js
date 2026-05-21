import api from './api';
import { handleUnauthorized, isUnauthorizedResponse } from './authSession';

function assertOkResponse(response) {
  if (!isUnauthorizedResponse(response.status)) return;
  handleUnauthorized();
  throw new Error('Session expired. Please sign in again.');
}

async function streamNdjsonReport(relativePath, params, handlers = {}) {
  const token = localStorage.getItem('token');
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const search = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value != null && value !== '') acc[key] = String(value);
      return acc;
    }, {})
  ).toString();
  const url = `${base}/apiv1/reports/${relativePath}/stream${search ? `?${search}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/x-ndjson'
    }
  });
  if (!response.ok) {
    assertOkResponse(response);
    let message = `Request failed (${response.status})`;
    try {
      const err = await response.json();
      message = err?.error || err?.message || message;
    } catch {
      /* use default */
    }
    throw new Error(message);
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Streaming is not supported in this browser');
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let streamError = null;
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
    if (payload.type === 'section') handlers.onSection?.(payload);
    if (payload.type === 'done') handlers.onDone?.(payload);
    if (payload.type === 'error') {
      const err = new Error(payload.error || 'Stream error');
      streamError = streamError || err;
      handlers.onStreamError?.(err);
    }
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
  if (streamError) throw streamError;
}

export const reportingApi = {
  getAllIndicators: async (params) => (await api.get('/apiv1/indicators-optimized/all', { params })).data,
  streamAllIndicators: async (params, handlers = {}) => {
    const token = localStorage.getItem('token');
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const search = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value != null && value !== '') acc[key] = String(value);
        return acc;
      }, {})
    ).toString();

    const url = `${base}/apiv1/indicators-optimized/all/stream${search ? `?${search}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: 'application/x-ndjson'
      }
    });

    if (!response.ok) {
      assertOkResponse(response);
      let message = `Request failed (${response.status})`;
      try {
        const err = await response.json();
        message = err?.error || err?.message || message;
      } catch {}
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
      if (payload.type === 'indicator') handlers.onIndicator?.(payload);
      if (payload.type === 'indicator_error') handlers.onIndicatorError?.(payload);
      if (payload.type === 'done') handlers.onDone?.(payload);
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
  },
  getIndicatorDetails: async (indicatorId, params) =>
    (await api.get(`/apiv1/indicators-optimized/details/${indicatorId}`, { params })).data
};

export const infantReportApi = {
  getInfantReport: async (params) => (await api.get('/apiv1/reports/infant-report', { params })).data,
  streamInfantReport: async (params, handlers) => streamNdjsonReport('infant-report', params, handlers),
  getInfantReportDetails: async (params) =>
    (await api.get('/apiv1/reports/infant-report/details', { params })).data
};

export const pnttReportApi = {
  getPnttReport: async (params) => (await api.get('/apiv1/reports/pntt-report', { params })).data,
  streamPnttReport: async (params, handlers) => streamNdjsonReport('pntt-report', params, handlers),
  getPnttReportDetails: async (params) =>
    (await api.get('/apiv1/reports/pntt-report/details', { params })).data
};
