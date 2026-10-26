// src/api/orders.api.js
import api from './axios';

export const ordersApi = {
  getAll: (params = {}) => api.get('/orders', { params }),

  getStats: () => api.get('/orders/stats'),

  getById: (id) => api.get(`/orders/${id}`),

  getByNumber: (orderNumber) => api.get(`/orders/number/${encodeURIComponent(orderNumber)}`),

  getTracking: (id) => api.get(`/orders/${id}/tracking`),

  requestCancellation: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),

  requestReturn: (id, reason) => api.post(`/orders/${id}/return`, { reason }),

  addNote: (id, content) => api.post(`/orders/${id}/notes`, { content }),
};
