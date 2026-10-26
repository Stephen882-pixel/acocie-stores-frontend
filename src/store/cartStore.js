// src/store/cartStore.js
import { create } from 'zustand';
import { cartApi } from '../api/cart.api';
import { useAuthStore } from './authStore';
import { getCartSessionId, clearCartSessionId } from '../utils/cartSession';

const EMPTY_CART = { id: null, items: [], subtotal: '0.00', itemCount: 0 };

export const useCartStore = create((set, get) => ({
  cart: EMPTY_CART,
  loading: false,
  loaded: false,

  fetchCart: async () => {
    // A guest with no session has nothing to fetch (and the API would 400).
    if (!useAuthStore.getState().accessToken && !getCartSessionId()) {
      set({ cart: EMPTY_CART, loaded: true });
      return;
    }
    set({ loading: true });
    try {
      const { data } = await cartApi.get();
      set({ cart: data.cart ?? EMPTY_CART, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (payload) => {
    await cartApi.addItem(payload);
    await get().fetchCart();
  },

  updateItem: async (itemId, quantity) => {
    await cartApi.updateItem(itemId, quantity);
    await get().fetchCart();
  },

  removeItem: async (itemId) => {
    await cartApi.removeItem(itemId);
    await get().fetchCart();
  },

  clearCart: async () => {
    await cartApi.clear();
    set({ cart: EMPTY_CART });
  },

  /** Move the guest cart into the user's cart. Call right after login. */
  mergeGuestCart: async () => {
    const guestSessionId = getCartSessionId();
    if (guestSessionId) {
      try {
        await cartApi.merge(guestSessionId);
        clearCartSessionId();
      } catch {
        // keep the session id so the guest cart isn't lost; user cart still loads
      }
    }
    await get().fetchCart().catch(() => {});
  },

  /** Drop the signed-in user's cart from memory on logout. */
  reset: () => set({ cart: EMPTY_CART, loaded: false }),
}));
