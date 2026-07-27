export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '' && !envUrl.includes('192.168.') && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/+$/, '');
  }
  if (import.meta.env.MODE === 'production') {
    return 'https://art-main-8pfj.onrender.com';
  }
  return (envUrl || 'http://localhost:3001').replace(/\/+$/, '');
};

const baseURL = getApiBaseUrl();

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
