// src/utils/vendor.js

/** Sum of this vendor's line items — the API's order totals include other vendors' items. */
export const vendorSubtotal = (order) =>
  (order?.items ?? []).reduce((sum, i) => sum + (parseFloat(i.subtotal) || 0), 0);

/** What the vendor should do next for an order in each status. */
export const VENDOR_NEXT_ACTION = {
  pending: { label: 'Awaiting admin confirmation', actionable: false },
  confirmed: { label: 'Accept order', actionable: true },
  processing: { label: 'Ship order', actionable: true },
  shipped: { label: 'Confirm delivery', actionable: true },
  delivered: { label: 'Completed', actionable: false },
  cancelled: { label: 'Cancelled', actionable: false },
  refunded: { label: 'Refunded', actionable: false },
};

// Only values both the Joi schema and the DB enum accept ('pending'/'failed' pass
// validation but are not in the DB enum). 'delivered' is set via "Mark delivered".
export const TRACKING_UPDATE_OPTIONS = [
  { value: 'in_transit', label: 'In transit' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
];
