import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/me'),
};

export const devicesAPI = {
  getAll: () => api.get('/api/devices'),
  create: (device) => api.post('/api/devices', device),
  update: (id, device) => api.put(`/api/devices/${id}`, device),
  delete: (id) => api.delete(`/api/devices/${id}`),
  getById: (id) => api.get(`/api/devices/${id}`),
};

export const heartbeatAPI = {
  getHistory: (deviceId, startDate, endDate) => 
    api.get(`/api/heartbeat/${deviceId}/history`, {
      params: { start_date: startDate, end_date: endDate }
    }),
};

export const notificationsAPI = {
  getAll: () => api.get('/api/notifications'),
  create: (notification) => api.post('/api/notifications', notification),
  update: (id, notification) => api.put(`/api/notifications/${id}`, notification),
  delete: (id) => api.delete(`/api/notifications/${id}`),
  getAlerts: () => api.get('/api/notifications/alerts'),
};

export default api;