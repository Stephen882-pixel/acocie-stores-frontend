// src/api/categories.api.js
import api from './axios';

export const categoriesApi = {
  getAll: (params = {}) => api.get('/categories', { params }),

  getById: (id, params = {}) => api.get(`/categories/${id}`, { params }),

  create: (data) => api.post('/categories', data),

  update: (id, data) => api.put(`/categories/${id}`, data),

  remove: (id) => api.delete(`/categories/${id}`),
};
