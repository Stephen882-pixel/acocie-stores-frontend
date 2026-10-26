// src/api/cart.api.js
import api from './axios';
import { useAuthStore } from '../store/authStore';
import { getCartSessionId, getOrCreateCartSessionId } from '../utils/cartSession';

/** Guests are identified by X-Session-ID; signed-in users by their token. */
function sessionConfig({ create = false } = {}) {
  if (useAuthStore.getState().accessToken) return {};
  const sessionId = create ? getOrCreateCartSessionId() : getCartSessionId();
  return sessionId ? { headers: { 'X-Session-ID': sessionId } } : {};
}

export const cartApi = {
  get: () => api.get('/cart', sessionConfig()),

  addItem: ({ productId, variantId, quantity }) =>
    api.post('/cart/items', { productId, variantId: variantId ?? null, quantity }, sessionConfig({ create: true })),

  updateItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }, sessionConfig()),

  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`, sessionConfig()),

  clear: () => api.delete('/cart/clear', sessionConfig()),

  validate: () => api.get('/cart/validate', sessionConfig()),

  merge: (guestSessionId) => api.post('/cart/merge', { sessionId: guestSessionId }),
};
