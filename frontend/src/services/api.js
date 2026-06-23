const API_BASE_URL = 'http://localhost:5001/api';

import axios from 'axios';

// Create configured Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Inject JWT token into headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Gracefully catch auth expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('JWT token invalid or expired. Flushing auth cache.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are in browser, redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile')
};

// Scrap records endpoints
export const scrapAPI = {
  getRecords: (params) => api.get('/scrap', { params }),
  createRecord: (formData) => api.post('/scrap', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateRecord: (id, formData) => api.put(`/scrap/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteRecord: (id) => api.delete(`/scrap/${id}`)
};

// Inventory endpoints
export const inventoryAPI = {
  getInventory: () => api.get('/inventory'),
  updateStock: (id, quantity) => api.put(`/inventory/${id}`, { quantity })
};

// Sales endpoints
export const salesAPI = {
  getSales: () => api.get('/sales'),
  createSale: (saleData) => api.post('/sales', saleData)
};

// Standalone AI endpoints
export const aiAPI = {
  predict: (formData) => api.post('/ai/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// User Management endpoints (Admin only)
export const usersAPI = {
  getUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`)
};

export default api;
export { API_BASE_URL };