// src/pages/customer/OrderDetailPage.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import OrderProgress from '../../components/orders/OrderProgress';
import OrderRequestForm from '../../components/orders/OrderRequestForm';
import OrderNotes from '../../components/orders/OrderNotes';
import OrderTotals from '../../components/checkout/OrderTotals';
import Button from '../../components/ui/Button';
import { ordersApi } from '../../api/orders.api';
import { getApiErrorMessage } from '../../utils/apiError';
import { paymentMethodLabel } from '../../utils/checkout';
import { canCancel, canReturn, PAYMENT_STATUSES, RETURN_WINDOW_DAYS, TRACKING_STATUSES } from '../../utils/orders';

function AddressBlock({ title, address }) {
  if (!address) return null;
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-1">{title}</h3>
      <address className="not-italic text-sm text-gray-700 leading-relaxed">
        {address.fullName}<br />
        {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}<br />
        {address.city}, {address.state} {address.postalCode}<br />
        {address.country && <>{address.country}<br /></>}
        {address.phone}
      </address>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [result, setResult] = useState({ id: null, order: null });
  // 'cancel' | 'return' | null
  const [requestType, setRequestType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // Request submitted this session — the order API doesn't expose pending requests
  const [submittedRequest, setSubmittedRequest] = useState(null);

  const loading = result.id !== id;
  const order = result.order;

  useEffect(() => {
    let ignore = false;
    ordersApi.getById(id)
      .then(({ data }) => !ignore && setResult({ id, order: data.order }))
      .catch((err) => {
        if (ignore) return;
        toast.error(getApiErrorMessage(err, 'Could not load order.'));
        setResult({ id, order: null });
      });
    return () => { ignore = true; };
  }, [id]);

  const handleRequest = async (reason) => {
    setSubmitting(true);
    try {
      if (requestType === 'cancel') {
        await ordersApi.requestCancellation(id, reason);
        toast.success('Cancellation requested.');
      } else {
        await ordersApi.requestReturn(id, reason);
        toast.success('Return requested.');
      }
      setSubmittedRequest(requestType);
      setRequestType(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not submit your request.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="h-20 bg-gray-200 rounded-card" />
        <div className="h-64 bg-gray-200 rounded-card" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-500">
        <p className="text-lg">Order not found.</p>
        <Link to="/orders" className="mt-4 inline-block text-scarlet-600 hover:underline">← Back to my orders</Link>
      </div>
    );
  }

  const tracking = order.tracking;
  const showCancel = canCancel(order) && !submittedRequest;
  const showReturn = canReturn(order) && !submittedRequest;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <nav className="text-xs text-gray-400 flex items-center gap-1.5">
        <Link to="/orders" className="hover:text-scarlet-600">My Orders</Link>
        <span>/</span>
        <span className="text-gray-600 font-mono">{order.orderNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 font-mono">{order.orderNumber}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Placed {format(new Date(order.created_at), "MMM d, yyyy 'at' HH:mm")}
          </p>
        </div>
        <div className="flex gap-2">
          {showCancel && !requestType && (
            <Button variant="secondary" size="sm" onClick={() => setRequestType('cancel')}>Cancel order</Button>
          )}
          {showReturn && !requestType && (
            <Button variant="secondary" size="sm" onClick={() => setRequestType('return')}>Request return</Button>
          )}
        </div>
      </div>

      {requestType && (
        <OrderRequestForm
          title={requestType === 'cancel' ? 'Request cancellation' : 'Request a return'}
          description={
            requestType === 'cancel'
              ? 'Our team will review your request. You will be notified once it is processed.'
              : `Returns are accepted within ${RETURN_WINDOW_DAYS} days of delivery.`
          }
          submitLabel={requestType === 'cancel' ? 'Submit cancellation' : 'Submit return'}
          onSubmit={handleRequest}
          onCancel={() => setRequestType(null)}
          submitting={submitting}
        />
      )}

      {submittedRequest && (
        <div className="rounded border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          Your {submittedRequest === 'cancel' ? 'cancellation' : 'return'} request was submitted and is awaiting review.
        </div>
      )}

      {/* Progress */}
      <section className="card p-6">
        <OrderProgress order={order} />
      </section>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking */}
          {tracking && (
            <section className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipment</h2>
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Carrier</dt>
                  <dd className="font-medium text-gray-900">{tracking.carrier ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Tracking number</dt>
                  <dd className="font-mono text-gray-900">
                    {tracking.trackingUrl ? (
                      <a href={tracking.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-scarlet-600 hover:underline">
                        {tracking.trackingNumber} ↗
                      </a>
                    ) : tracking.trackingNumber ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Status</dt>
                  <dd className="font-medium text-gray-900">
                    {TRACKING_STATUSES[tracking.trackingStatus] ?? '—'}
                    {tracking.currentLocation && tracking.currentLocation !== TRACKING_STATUSES[tracking.trackingStatus] && (
                      <span className="font-normal text-gray-500"> · {tracking.currentLocation}</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">{order.status === 'delivered' ? 'Delivered' : 'Estimated delivery'}</dt>
                  <dd className="font-medium text-gray-900">
                    {order.deliveredAt
                      ? format(new Date(order.deliveredAt), 'MMM d, yyyy')
                      : tracking.estimatedDelivery
                        ? format(new Date(tracking.estimatedDelivery), 'MMM d, yyyy')
                        : '—'}
                  </dd>
                </div>
              </dl>
              {tracking.lastUpdated && (
                <p className="text-xs text-gray-400 mt-4">
                  Last updated {format(new Date(tracking.lastUpdated), 'MMM d, yyyy HH:mm')}
                </p>
              )}
            </section>
          )}

          {/* Items */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Items</h2>
            {order.items?.length ? (
              <>
                <ul className="text-xs text-gray-400 mb-2">
                  {[...new Map(order.items.filter((i) => i.vendor).map((i) => [i.vendor.id, i.vendor])).values()].map((v) => (
                    <li key={v.id}>Sold by {v.firstName} {v.lastName}</li>
                  ))}
                </ul>
                <OrderTotals items={order.items} totals={order} />
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">Item details are unavailable for this order.</p>
                <OrderTotals items={[]} totals={order} />
              </>
            )}
          </section>

          <OrderNotes orderId={order.id} notes={order.orderNotes} />
        </div>

        {/* Side panel */}
        <aside className="card p-6 space-y-5">
          <div>
            <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-1">Payment</h3>
            <p className="text-sm text-gray-700">{paymentMethodLabel(order.paymentMethod)}</p>
            <p className={`text-sm ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-gray-500'}`}>
              {PAYMENT_STATUSES[order.paymentStatus] ?? order.paymentStatus}
            </p>
          </div>
          <AddressBlock title="Shipping address" address={order.shippingAddress} />
          {order.billingAddress && order.billingAddressId !== order.shippingAddressId && (
            <AddressBlock title="Billing address" address={order.billingAddress} />
          )}
          {order.notes && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-1">Order notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{order.notes}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
