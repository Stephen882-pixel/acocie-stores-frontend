// src/pages/customer/OrderConfirmationPage.jsx
import { Link, Navigate, useLocation } from 'react-router-dom';
import OrderTotals from '../../components/checkout/OrderTotals';
import { paymentMethodLabel } from '../../utils/checkout';

export default function OrderConfirmationPage() {
  const { state } = useLocation();
  const order = state?.order;

  // Only reachable straight after placing an order
  if (!order) return <Navigate to="/" replace />;

  const address = order.shippingAddress;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Thank you for your order!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Order <span className="font-mono font-medium text-gray-900">{order.orderNumber}</span> has been placed.
          A confirmation email is on its way.
        </p>
      </div>

      <div className="card p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-6 text-sm">
          {address && (
            <div>
              <h2 className="text-xs uppercase tracking-wide text-gray-400 mb-1">Shipping to</h2>
              <address className="not-italic text-gray-700 leading-relaxed">
                {address.fullName}<br />
                {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}<br />
                {address.city}, {address.state} {address.postalCode}<br />
                {address.phone}
              </address>
            </div>
          )}
          <div>
            <h2 className="text-xs uppercase tracking-wide text-gray-400 mb-1">Payment</h2>
            <p className="text-gray-700">{paymentMethodLabel(order.paymentMethod)}</p>
            <h2 className="text-xs uppercase tracking-wide text-gray-400 mt-3 mb-1">Status</h2>
            <p className="text-gray-700 capitalize">{order.status}</p>
          </div>
        </div>

        {order.notes && (
          <div className="text-sm">
            <h2 className="text-xs uppercase tracking-wide text-gray-400 mb-1">Notes</h2>
            <p className="text-gray-700 whitespace-pre-line">{order.notes}</p>
          </div>
        )}

        <OrderTotals items={order.items} totals={order} />
      </div>

      <div className="flex justify-center mt-8">
        <Link to="/products" className="btn-primary">Continue shopping</Link>
      </div>
    </div>
  );
}
