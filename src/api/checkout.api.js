// src/api/checkout.api.js
import api from './axios';

export const checkoutApi = {
  // Reserves inventory. The backend never releases a reservation, so call this
  // only immediately before placeOrder — not when the checkout page opens.
  initiate: () => api.post('/checkout/initiate'),

  getSummary: (shippingAddressId) =>
    api.get('/checkout/summary', { params: shippingAddressId ? { shippingAddressId } : {} }),

  placeOrder: ({ shippingAddressId, paymentMethod, notes }) =>
    api.post('/checkout/place-order', { shippingAddressId, paymentMethod, notes }),
};
