// src/pages/vendor/VendorOrderDetailPage.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import OrderProgress from '../../components/orders/OrderProgress';
import ShipOrderForm from '../../components/vendor/ShipOrderForm';
import TrackingUpdateForm from '../../components/vendor/TrackingUpdateForm';
import VendorNotes from '../../components/vendor/VendorNotes';
import Button from '../../components/ui/Button';
import { vendorApi } from '../../api/vendor.api';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatMoney, paymentMethodLabel } from '../../utils/checkout';
import { PAYMENT_STATUSES, TRACKING_STATUSES } from '../../utils/orders';
import { vendorSubtotal } from '../../utils/vendor';

export default function VendorOrderDetailPage() {
  const { id } = useParams();
  const [result, setResult] = useState({ id: null, order: null });
  const [acting, setActing] = useState(false);

  const loading = result.id !== id;
  const order = result.order;

  useEffect(() => {
    let ignore = false;
    vendorApi.getOrder(id)
      .then(({ data }) => !ignore && setResult({ id, order: data.order }))
      .catch((err) => {
        if (ignore) return;
        toast.error(getApiErrorMessage(err, 'Could not load order.'));
        setResult({ id, order: null });
      });
    return () => { ignore = true; };
  }, [id]);

  /** Run a status action, then refetch so status, timestamps and tracking are current. Resolves to success. */
  const runAction = async (action, successMessage) => {
    setActing(true);
    try {
      await action();
      const { data } = await vendorApi.getOrder(id);
      setResult({ id, order: data.order });
      toast.success(successMessage);
      return true;
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Action failed.'));
      return false;
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="h-20 bg-gray-200 rounded-card" />
        <div className="h-64 bg-gray-200 rounded-card" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center text-gray-500">
        <p className="text-lg">Order not found.</p>
        <Link to="/vendor/orders" className="mt-4 inline-block text-scarlet-600 hover:underline">← Back to orders</Link>
      </div>
    );
  }

  const tracking = order.tracking;
  const address = order.shippingAddress;
  const customer = order.user;

  return (
    <div className="space-y-6">
      <nav className="text-xs text-gray-400 flex items-center gap-1.5">
        <Link to="/vendor/orders" className="hover:text-scarlet-600">Orders</Link>
        <span>/</span>
        <span className="text-gray-600 font-mono">{order.orderNumber}</span>
      </nav>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{order.orderNumber}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm text-gray-500 mt-1">Placed {format(new Date(order.created_at), "MMM d, yyyy 'at' HH:mm")}</p>
      </div>

      <section className="card p-6">
        <OrderProgress order={order} />
      </section>

      {/* Next action */}
      {order.status === 'pending' && (
        <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Waiting for an admin to confirm this order. You can accept it once it’s confirmed.
        </div>
      )}
      {order.status === 'confirmed' && (
        <section className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Accept this order</h2>
            <p className="text-sm text-gray-500">Moves the order to processing and notifies the customer.</p>
          </div>
          <Button isLoading={acting} onClick={() => runAction(() => vendorApi.acceptOrder(id), 'Order accepted.')}>
            Accept order
          </Button>
        </section>
      )}
      {order.status === 'processing' && (
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Ship this order</h2>
          <p className="text-sm text-gray-500 mb-4">Add the shipment details. The customer gets an email with the tracking number.</p>
          <ShipOrderForm
            submitting={acting}
            onSubmit={(values) => runAction(() => vendorApi.shipOrder(id, values), 'Order marked as shipped.')}
          />
        </section>
      )}
      {order.status === 'shipped' && (
        <section className="card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">In transit</h2>
              <p className="text-sm text-gray-500">Keep the customer updated, then confirm delivery.</p>
            </div>
            <Button
              isLoading={acting}
              onClick={() => {
                if (window.confirm('Confirm this order was delivered to the customer?')) {
                  runAction(() => vendorApi.markDelivered(id), 'Order marked as delivered.');
                }
              }}
            >
              Mark as delivered
            </Button>
          </div>
          {tracking && (
            <div className="border-t border-gray-100 pt-5">
              <TrackingUpdateForm
                tracking={tracking}
                submitting={acting}
                onSubmit={(changes) => runAction(() => vendorApi.updateTracking(id, changes), 'Tracking updated.')}
              />
            </div>
          )}
        </section>
      )}

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Your items in this order</h2>
            <ul className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-gray-900">{item.productName}</p>
                    <p className="text-xs text-gray-500">
                      {item.variantName ? `${item.variantName} · ` : ''}SKU {item.sku} · {item.quantity} × {formatMoney(item.unitPrice)}
                    </p>
                  </div>
                  <span className="font-medium text-gray-900 whitespace-nowrap">{formatMoney(item.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-gray-100 pt-3 text-sm font-semibold text-gray-900">
              <span>Your total</span>
              <span>{formatMoney(vendorSubtotal(order))}</span>
            </div>
          </section>

          {/* Tracking */}
          {tracking && (
            <section className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipment</h2>
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                <div><dt className="text-gray-500">Carrier</dt><dd className="font-medium text-gray-900">{tracking.carrier}</dd></div>
                <div>
                  <dt className="text-gray-500">Tracking number</dt>
                  <dd className="font-mono text-gray-900">
                    {tracking.trackingUrl ? (
                      <a href={tracking.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-scarlet-600 hover:underline">
                        {tracking.trackingNumber} ↗
                      </a>
                    ) : tracking.trackingNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Status</dt>
                  <dd className="font-medium text-gray-900">
                    {TRACKING_STATUSES[tracking.trackingStatus] ?? '—'}
                    {tracking.currentLocation && <span className="font-normal text-gray-500"> · {tracking.currentLocation}</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Estimated delivery</dt>
                  <dd className="font-medium text-gray-900">
                    {tracking.estimatedDelivery ? format(new Date(tracking.estimatedDelivery), 'MMM d, yyyy') : '—'}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          <VendorNotes orderId={order.id} />
        </div>

        <aside className="card p-6 space-y-5 text-sm">
          {customer && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-1">Customer</h3>
              <p className="text-gray-900 font-medium">{customer.firstName} {customer.lastName}</p>
              <p className="text-gray-600 break-all">{customer.email}</p>
              {customer.phone && <p className="text-gray-600">{customer.phone}</p>}
            </div>
          )}
          {address && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-1">Ship to</h3>
              <address className="not-italic text-gray-700 leading-relaxed">
                {address.fullName}<br />
                {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}<br />
                {address.city}, {address.state} {address.postalCode}<br />
                {address.country && <>{address.country}<br /></>}
                {address.phone}
              </address>
            </div>
          )}
          <div>
            <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-1">Payment</h3>
            <p className="text-gray-700">{paymentMethodLabel(order.paymentMethod)}</p>
            <p className="text-gray-500">{PAYMENT_STATUSES[order.paymentStatus] ?? order.paymentStatus}</p>
          </div>
          {order.notes && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-1">Customer’s order notes</h3>
              <p className="text-gray-700 whitespace-pre-line">{order.notes}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
