// src/components/orders/OrderProgress.jsx
import { format } from 'date-fns';
import { ORDER_STEPS, ORDER_STATUSES } from '../../utils/orders';

/** Horizontal step tracker for an order's happy path; a banner for cancelled/refunded. */
export default function OrderProgress({ order }) {
  if (order.status === 'cancelled' || order.status === 'refunded') {
    const when = order.cancelledAt ?? order.updated_at;
    return (
      <div className="rounded border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
        This order was <span className="font-medium">{ORDER_STATUSES[order.status].label.toLowerCase()}</span>
        {when ? ` on ${format(new Date(when), 'MMM d, yyyy')}` : ''}.
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.findIndex((s) => s.status === order.status);

  return (
    <ol className="grid grid-cols-5 gap-1">
      {ORDER_STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const date = step.dateField && order[step.dateField];
        return (
          <li key={step.status} className="flex flex-col items-center text-center">
            <div className="flex items-center w-full">
              <span className={`flex-1 h-0.5 ${i === 0 ? 'invisible' : done ? 'bg-scarlet-600' : 'bg-gray-200'}`} />
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                  done ? 'bg-scarlet-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={`flex-1 h-0.5 ${i === ORDER_STEPS.length - 1 ? 'invisible' : i < currentIndex ? 'bg-scarlet-600' : 'bg-gray-200'}`}
              />
            </div>
            <span className={`mt-2 text-xs font-medium ${done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</span>
            {done && date && (
              <span className="text-[11px] text-gray-400">{format(new Date(date), 'MMM d')}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
