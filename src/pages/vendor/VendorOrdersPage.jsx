// src/pages/vendor/VendorOrdersPage.jsx
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { vendorApi } from '../../api/vendor.api';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatMoney } from '../../utils/checkout';
import { ORDER_STATUSES } from '../../utils/orders';
import { vendorSubtotal, VENDOR_NEXT_ACTION } from '../../utils/vendor';

const PAGE_SIZE = 20;
// The vendor orders endpoint does not accept 'refunded'
const FILTER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const FILTERS = [{ value: '', label: 'All' }, ...FILTER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUSES[s].label }))];

export default function VendorOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = FILTER_STATUSES.includes(searchParams.get('status')) ? searchParams.get('status') : '';
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);
  const queryKey = `${status}|${page}`;

  const [result, setResult] = useState({ key: null, orders: [], pagination: null });
  const loading = result.key !== queryKey;

  useEffect(() => {
    let ignore = false;
    vendorApi.getOrders({ page, limit: PAGE_SIZE, ...(status && { status }) })
      .then(({ data }) => {
        if (!ignore) setResult({ key: queryKey, orders: data.orders ?? [], pagination: data.pagination });
      })
      .catch((err) => {
        if (ignore) return;
        toast.error(getApiErrorMessage(err, 'Could not load orders.'));
        setResult({ key: queryKey, orders: [], pagination: null });
      });
    return () => { ignore = true; };
  }, [page, status, queryKey]);

  const setQuery = (next) => {
    const params = { ...(status && { status }), ...(page > 1 && { page: String(page) }), ...next };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    setSearchParams(params);
  };

  const { orders, pagination } = result;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value || 'all'}
            onClick={() => setQuery({ status: f.value, page: '' })}
            className={`px-3 py-1.5 text-sm rounded-full border whitespace-nowrap transition-colors ${
              status === f.value
                ? 'border-scarlet-600 bg-scarlet-50 text-scarlet-700 font-medium'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-200 rounded" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-sm text-gray-500">
          {status ? `No ${ORDER_STATUSES[status].label.toLowerCase()} orders.` : 'No orders yet.'}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Your items</th>
                <th className="px-4 py-3 font-medium text-right">Your total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Next step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => {
                const next = VENDOR_NEXT_ACTION[o.status];
                const qty = (o.items ?? []).reduce((sum, i) => sum + i.quantity, 0);
                return (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link to={`/vendor/orders/${o.id}`} className="font-mono font-medium text-scarlet-600 hover:underline">
                        {o.orderNumber}
                      </Link>
                      <p className="text-xs text-gray-400">{format(new Date(o.created_at), 'MMM d, yyyy HH:mm')}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {o.user ? `${o.user.firstName} ${o.user.lastName}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[16rem]">
                      <p className="truncate">{(o.items ?? []).map((i) => i.productName).join(', ')}</p>
                      <p className="text-xs text-gray-400">{qty} unit{qty === 1 ? '' : 's'}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                      {formatMoney(vendorSubtotal(o))}
                    </td>
                    <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {next?.actionable ? (
                        <Link to={`/vendor/orders/${o.id}`} className="text-xs font-medium text-scarlet-600 hover:underline">
                          {next.label} →
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">{next?.label}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination?.pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button onClick={() => setQuery({ page: String(page - 1) })} disabled={page <= 1} className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-40">
            ← Prev
          </button>
          <span className="text-gray-600">Page {page} of {pagination.pages}</span>
          <button onClick={() => setQuery({ page: String(page + 1) })} disabled={page >= pagination.pages} className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-40">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
