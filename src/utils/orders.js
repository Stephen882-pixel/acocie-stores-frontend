// src/utils/orders.js

export const ORDER_STATUSES = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  confirmed: { label: 'Confirmed', className: 'bg-sky-50 text-sky-700' },
  processing: { label: 'Processing', className: 'bg-indigo-50 text-indigo-700' },
  shipped: { label: 'Shipped', className: 'bg-violet-50 text-violet-700' },
  delivered: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600' },
  refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-600' },
};

export const PAYMENT_STATUSES = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  failed: 'Payment failed',
  refunded: 'Refunded',
};

export const TRACKING_STATUSES = {
  in_transit: 'In transit',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  failed_attempt: 'Delivery attempt failed',
  returned: 'Returned to sender',
};

// Happy-path progression with the timestamp field the API sets at each step.
export const ORDER_STEPS = [
  { status: 'pending', label: 'Placed', dateField: 'created_at' },
  { status: 'confirmed', label: 'Confirmed', dateField: 'confirmedAt' },
  { status: 'processing', label: 'Processing', dateField: null },
  { status: 'shipped', label: 'Shipped', dateField: 'shippedAt' },
  { status: 'delivered', label: 'Delivered', dateField: 'deliveredAt' },
];

// Mirrors the backend rules in orderService.
export const CANCELLABLE_STATUSES = ['pending', 'confirmed'];
export const RETURN_WINDOW_DAYS = 14;

export function canCancel(order) {
  return CANCELLABLE_STATUSES.includes(order?.status);
}

export function canReturn(order) {
  if (order?.status !== 'delivered' || !order.deliveredAt) return false;
  const days = (Date.now() - new Date(order.deliveredAt).getTime()) / 86_400_000;
  return days <= RETURN_WINDOW_DAYS;
}
