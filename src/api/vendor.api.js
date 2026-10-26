// src/api/vendor.api.js
import api from './axios';

export const vendorApi = {
  getStats: () => api.get('/vendor/dashboard/stats'),

  getOrders: (params = {}) => api.get('/vendor/orders', { params }),

  getOrder: (id) => api.get(`/vendor/orders/${id}`),

  acceptOrder: (id) => api.put(`/vendor/orders/${id}/accept`),

  shipOrder: (id, { carrier, trackingNumber, trackingUrl, estimatedDelivery }) =>
    api.put(`/vendor/orders/${id}/ship`, {
      carrier,
      trackingNumber,
      ...(trackingUrl && { trackingUrl }),
      ...(estimatedDelivery && { estimatedDelivery }),
    }),

  markDelivered: (id) => api.put(`/vendor/orders/${id}/deliver`),

  updateTracking: (id, data) => api.put(`/vendor/orders/${id}/tracking`, data),

  addNote: (id, { content, isVisibleToCustomer }) =>
    api.post(`/vendor/orders/${id}/notes`, { content, isVisibleToCustomer }),
};
