import axios from 'axios';
import { store } from '../app/store';
import { tokenRefreshed, logout } from '../features/auth/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = store.getState().auth.refreshToken;
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh/`, {
            refresh: refreshToken
          });
          
          store.dispatch(tokenRefreshed(response.data));
          
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          store.dispatch(logout());
          return Promise.reject(refreshError);
        }
      } else {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export default api;
