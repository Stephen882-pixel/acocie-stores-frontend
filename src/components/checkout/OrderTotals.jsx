// src/components/checkout/OrderTotals.jsx
import { formatMoney } from '../../utils/checkout';

/**
 * Line items + totals block shared by checkout and order confirmation.
 * Props:
 *   items   — [{ productName, variantName, quantity, unitPrice }]
 *   totals  — { subtotal, shippingCost, taxAmount, totalAmount }
 */
export default function OrderTotals({ items = [], totals }) {
  return (
    <div className="space-y-4">
      <ul className="divide-y divide-gray-100">
        {items.map((item, i) => (
          <li key={`${item.productId ?? i}-${item.variantId ?? ''}`} className="flex justify-between gap-3 py-2 text-sm">
            <div className="min-w-0">
              <p className="text-gray-900 truncate">{item.productName}</p>
              <p className="text-xs text-gray-500">
                {item.variantName ? `${item.variantName} · ` : ''}Qty {item.quantity}
              </p>
            </div>
            <span className="text-gray-900 whitespace-nowrap">
              {formatMoney(parseFloat(item.unitPrice) * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="space-y-1.5 text-sm border-t border-gray-100 pt-4">
        <div className="flex justify-between text-gray-600">
          <dt>Subtotal</dt><dd>{formatMoney(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-gray-600">
          <dt>Shipping</dt><dd>{formatMoney(totals.shippingCost)}</dd>
        </div>
        <div className="flex justify-between text-gray-600">
          <dt>VAT (16%)</dt><dd>{formatMoney(totals.taxAmount)}</dd>
        </div>
        <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-100">
          <dt>Total</dt><dd>{formatMoney(totals.totalAmount)}</dd>
        </div>
      </dl>
    </div>
  );
}
