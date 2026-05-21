import axios from 'axios';
import { handleUnauthorized, isUnauthorizedResponse } from './authSession';

const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const api = axios.create({
  baseURL,
  timeout: 120000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (isUnauthorizedResponse(status)) {
      handleUnauthorized();
      return Promise.reject(new Error('Session expired. Please sign in again.'));
    }
    return Promise.reject(error);
  }
);

export default api;
