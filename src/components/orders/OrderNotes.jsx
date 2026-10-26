// src/components/orders/OrderNotes.jsx
import { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import { ordersApi } from '../../api/orders.api';
import { getApiErrorMessage } from '../../utils/apiError';

const AUTHOR_LABELS = {
  customer_note: 'You',
  vendor_note: 'Seller',
  admin_note: 'Acocie support',
  system_note: 'System',
};

/**
 * Notes thread on an order (customer notes + staff notes visible to the customer).
 * Props: orderId, notes (initial list from the order)
 */
export default function OrderNotes({ orderId, notes: initialNotes = [] }) {
  const [notes, setNotes] = useState(() =>
    [...initialNotes].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  );
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    setSending(true);
    try {
      const { data } = await ordersApi.addNote(orderId, text);
      setNotes((list) => [...list, data.note]);
      setContent('');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not add note.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>

      {notes.length === 0 ? (
        <p className="text-sm text-gray-500 mb-4">No messages yet. Questions about this order? Ask below.</p>
      ) : (
        <ul className="space-y-3 mb-4">
          {notes.map((n) => {
            const mine = n.noteType === 'customer_note';
            return (
              <li key={n.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${mine ? 'bg-scarlet-50 text-gray-900' : 'bg-gray-100 text-gray-800'}`}>
                  <p className="text-[11px] font-medium text-gray-500 mb-0.5">
                    {AUTHOR_LABELS[n.noteType] ?? 'Note'}
                    {n.created_at && <> · {format(new Date(n.created_at), 'MMM d, HH:mm')}</>}
                  </p>
                  <p className="whitespace-pre-line">{n.content}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 1000))}
          rows={2}
          placeholder="Write a message to the seller…"
          className="input-field resize-y flex-1"
        />
        <Button type="submit" isLoading={sending} disabled={!content.trim()}>Send</Button>
      </form>
    </section>
  );
}
