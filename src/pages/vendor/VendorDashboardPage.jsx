// src/pages/vendor/VendorDashboardPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { vendorApi } from '../../api/vendor.api';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatMoney } from '../../utils/checkout';
import { ORDER_STATUSES } from '../../utils/orders';
import { vendorSubtotal, VENDOR_NEXT_ACTION } from '../../utils/vendor';

function StatCard({ label, value, hint, to }) {
  const body = (
    <>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </>
  );
  return to ? (
    <Link to={to} className="card p-5 hover:shadow-md transition-shadow">{body}</Link>
  ) : (
    <div className="card p-5">{body}</div>
  );
}

export default function VendorDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorApi.getStats()
      .then(({ data }) => setStats(data))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Could not load dashboard.')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-60" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-card" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-card" />
      </div>
    );
  }

  if (!stats) return <p className="text-sm text-gray-500">Dashboard unavailable.</p>;

  const countFor = (status) => stats.ordersByStatus?.find((s) => s.status === status)?.count ?? 0;
  const toAccept = countFor('confirmed');
  const toShip = countFor('processing');
  const toDeliver = countFor('shipped');
  const needsAction = toAccept + toShip + toDeliver;
  const maxCount = Math.max(1, ...(stats.ordersByStatus ?? []).map((s) => s.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}</h1>
        <p className="text-sm text-gray-500">Here’s how your store is doing.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total orders" value={stats.totalOrders} to="/vendor/orders" />
        <StatCard label="Revenue (delivered)" value={formatMoney(stats.totalRevenue)} />
        <StatCard label="Pending revenue" value={formatMoney(stats.pendingRevenue)} hint="Orders not yet delivered" />
        <StatCard
          label="Needs your action"
          value={needsAction}
          hint={needsAction ? `${toAccept} to accept · ${toShip} to ship · ${toDeliver} in transit` : 'All caught up'}
          to={toAccept ? '/vendor/orders?status=confirmed' : toShip ? '/vendor/orders?status=processing' : toDeliver ? '/vendor/orders?status=shipped' : undefined}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Recent orders */}
        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-lg font-semibold text-gray-900">Recent orders</h2>
            <Link to="/vendor/orders" className="text-sm text-scarlet-600 hover:underline">View all</Link>
          </div>
          {stats.recentOrders?.length ? (
            <ul className="divide-y divide-gray-100">
              {stats.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link to={`/vendor/orders/${o.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-medium text-gray-900">{o.orderNumber}</p>
                      <p className="text-xs text-gray-500">{format(new Date(o.created_at), 'MMM d, yyyy')}</p>
                    </div>
                    <span className="hidden sm:block text-xs text-gray-500">{VENDOR_NEXT_ACTION[o.status]?.label}</span>
                    <OrderStatusBadge status={o.status} />
                    <span className="w-20 text-right text-sm font-medium text-gray-900">{formatMoney(vendorSubtotal(o))}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 pb-5 text-sm text-gray-500">No orders yet.</p>
          )}
        </section>

        {/* Status breakdown */}
        <section className="card p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by status</h2>
          {stats.ordersByStatus?.length ? (
            <ul className="space-y-3">
              {stats.ordersByStatus.map((s) => (
                <li key={s.status}>
                  <Link to={`/vendor/orders?status=${s.status}`} className="block group">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 group-hover:text-scarlet-600">{ORDER_STATUSES[s.status]?.label ?? s.status}</span>
                      <span className="font-medium text-gray-900">{s.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-scarlet-500 rounded-full" style={{ width: `${(s.count / maxCount) * 100}%` }} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No orders yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
