import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL?.trim();
const normalizedBaseUrl = rawBaseUrl
  ? rawBaseUrl.replace(/\/+$/, '')
  : '/api';

const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
