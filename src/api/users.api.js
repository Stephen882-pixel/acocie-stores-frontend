// src/api/users.api.js
import api from './axios';

export const usersApi = {
  getProfile: () => api.get('/users/profile'),

  updateProfile: (data) => api.put('/users/profile', data),

  deleteAccount: (password) => api.delete('/users/delete', { data: { password } }),

  getAddresses: () => api.get('/users/addresses'),

  addAddress: (data) => api.post('/users/addresses', data),

  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),

  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),

  getLoginHistory: (limit = 10) => api.get('/users/login-history', { params: { limit } }),

  requestVendor: () => api.post('/users/request-vendor'),
};
