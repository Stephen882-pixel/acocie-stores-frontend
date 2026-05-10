// src/api/products.api.js
import api from './axios';

export const productsApi = {
  getAll: (params = {}) => api.get('/products', { params }),

  search: (q, params = {}) => api.get('/products/search', { params: { q, ...params } }),

  getFeatured: () => api.get('/products/featured'),

  getById: (id) => api.get(`/products/${id}`),

  create: (data) => api.post('/products', data),

  update: (id, data) => api.put(`/products/${id}`, data),

  remove: (id) => api.delete(`/products/${id}`),
};
