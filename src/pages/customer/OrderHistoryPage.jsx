// src/pages/customer/OrderHistoryPage.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { ordersApi } from '../../api/orders.api';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../utils/apiError';
import { isCustomerAccount, formatMoney } from '../../utils/checkout';
import { ORDER_STATUSES } from '../../utils/orders';

const PAGE_SIZE = 10;
const FILTERS = [{ value: '', label: 'All' }, ...Object.entries(ORDER_STATUSES).map(([value, { label }]) => ({ value, label }))];

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const status = ORDER_STATUSES[searchParams.get('status')] ? searchParams.get('status') : '';
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);
  const queryKey = `${status}|${page}`;

  // `key` records which query the data belongs to, so loading is derived, not set in the effect.
  const [result, setResult] = useState({ key: null, orders: [], pagination: null });
  const [stats, setStats] = useState(null);
  const [lookup, setLookup] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const loading = result.key !== queryKey;

  useEffect(() => {
    if (!isCustomerAccount(user)) return;
    ordersApi.getStats().then(({ data }) => setStats(data)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!isCustomerAccount(user)) return;
    let ignore = false;
    ordersApi.getAll({ page, limit: PAGE_SIZE, ...(status && { status }) })
      .then(({ data }) => {
        if (!ignore) setResult({ key: queryKey, orders: data.orders ?? [], pagination: data.pagination });
      })
      .catch((err) => {
        if (ignore) return;
        toast.error(getApiErrorMessage(err, 'Could not load orders.'));
        setResult({ key: queryKey, orders: [], pagination: null });
      });
    return () => { ignore = true; };
  }, [user, page, status, queryKey]);

  const setQuery = (next) => {
    const params = { ...(status && { status }), ...(page > 1 && { page: String(page) }), ...next };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    setSearchParams(params);
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    const number = lookup.trim().toUpperCase();
    if (!number) return;
    setLookingUp(true);
    try {
      const { data } = await ordersApi.getByNumber(number);
      navigate(`/orders/${data.order.id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Order not found.'));
    } finally {
      setLookingUp(false);
    }
  };

  if (!isCustomerAccount(user)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Orders unavailable</h1>
        <p className="mt-2 text-sm text-gray-500">Order history is only available for customer accounts.</p>
      </div>
    );
  }

  const { orders, pagination } = result;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <form onSubmit={handleLookup} className="flex w-full sm:w-auto">
          <input
            value={lookup}
            onChange={(e) => setLookup(e.target.value)}
            placeholder="Find by order number, e.g. ORD-202605-00001"
            className="input-field rounded-r-none sm:w-80"
          />
          <button
            type="submit"
            disabled={lookingUp}
            className="bg-scarlet-600 hover:bg-scarlet-700 text-white text-sm px-4 rounded-r border border-scarlet-600 disabled:opacity-50"
          >
            {lookingUp ? '…' : 'Find'}
          </button>
        </form>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-xs text-gray-500">Total orders</p>
            <p className="text-xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Total spent (paid)</p>
            <p className="text-xl font-bold text-gray-900">{formatMoney(stats.totalSpent)}</p>
          </div>
          <div className="card p-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-500">In progress</p>
            <p className="text-xl font-bold text-gray-900">
              {(stats.ordersByStatus ?? [])
                .filter((s) => ['pending', 'confirmed', 'processing', 'shipped'].includes(s.status))
                .reduce((sum, s) => sum + s.count, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
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

      {/* List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-card" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-900 font-medium">{status ? `No ${ORDER_STATUSES[status].label.toLowerCase()} orders.` : 'You have no orders yet.'}</p>
          <Link to="/products" className="btn-primary inline-block mt-4">Start shopping</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const itemCount = (o.items ?? []).reduce((sum, i) => sum + i.quantity, 0);
            const names = (o.items ?? []).map((i) => i.productName).filter(Boolean);
            return (
              <li key={o.id}>
                <Link to={`/orders/${o.id}`} className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-md transition-shadow">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-gray-900">{o.orderNumber}</span>
                      <OrderStatusBadge status={o.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Placed {format(new Date(o.created_at), 'MMM d, yyyy')}
                      {itemCount > 0 && ` · ${itemCount} item${itemCount === 1 ? '' : 's'}`}
                    </p>
                    {names.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {names.slice(0, 2).join(', ')}{names.length > 2 ? ` +${names.length - 2} more` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                    <span className="text-base font-semibold text-gray-900">{formatMoney(o.totalAmount)}</span>
                    <span className="text-xs text-scarlet-600">View details →</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination */}
      {pagination?.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6 text-sm">
          <button
            onClick={() => setQuery({ page: String(page - 1) })}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-gray-600">Page {page} of {pagination.pages}</span>
          <button
            onClick={() => setQuery({ page: String(page + 1) })}
            disabled={page >= pagination.pages}
            className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
