// src/components/orders/OrderStatusBadge.jsx
import { ORDER_STATUSES } from '../../utils/orders';

export default function OrderStatusBadge({ status }) {
  const meta = ORDER_STATUSES[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${meta.className}`}>
      {meta.label}
    </span>
  );
}
