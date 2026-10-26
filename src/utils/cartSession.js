// src/utils/cartSession.js
// Guest carts are keyed by a client-generated session id sent as X-Session-ID.

const CART_SESSION_KEY = 'acocie-cart-session';

export function getCartSessionId() {
  try {
    return localStorage.getItem(CART_SESSION_KEY);
  } catch {
    return null;
  }
}

export function getOrCreateCartSessionId() {
  let id = getCartSessionId();
  if (!id) {
    id = crypto.randomUUID();
    try {
      localStorage.setItem(CART_SESSION_KEY, id);
    } catch {
      // storage unavailable — id lives for this page load only
    }
  }
  return id;
}

export function clearCartSessionId() {
  try {
    localStorage.removeItem(CART_SESSION_KEY);
  } catch {
    // ignore
  }
}
