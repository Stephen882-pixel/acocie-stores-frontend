// src/utils/checkout.js

// Roles the backend's isCustomer middleware lets through /checkout and /orders.
export const CHECKOUT_ROLES = ['customer', 'vendor_pending'];

export const isCustomerAccount = (user) => CHECKOUT_ROLES.includes(user?.role);

export const PAYMENT_METHODS = [
  { value: 'cash_on_delivery', label: 'Cash on delivery', description: 'Pay when your order arrives.', enabled: true },
  { value: 'mobile_money', label: 'Mobile money', description: 'M-Pesa and others — coming soon.', enabled: false },
  { value: 'card', label: 'Card', description: 'Visa / Mastercard — coming soon.', enabled: false },
  { value: 'bank_transfer', label: 'Bank transfer', description: 'Coming soon.', enabled: false },
];

export const paymentMethodLabel = (value) =>
  PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;

export const formatMoney = (value) => `$${(parseFloat(value) || 0).toFixed(2)}`;
