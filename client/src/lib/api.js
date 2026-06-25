
import axios from 'axios';

const BACKEND_URL =  'https://unofficial-6hpn.onrender.com'
export const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API, timeout: 30000 });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('psit_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
}); 

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('psit_token');
      localStorage.removeItem('psit_user');
      // soft redirect to login if we are not already there
      if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
