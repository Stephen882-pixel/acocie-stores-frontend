// src/components/vendor/VendorNotes.jsx
import { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import { vendorApi } from '../../api/vendor.api';
import { getApiErrorMessage } from '../../utils/apiError';

/**
 * Add notes to an order. The vendor order API does not return existing notes,
 * so only notes written in this session are listed.
 */
export default function VendorNotes({ orderId }) {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [visible, setVisible] = useState(true);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    setSending(true);
    try {
      const { data } = await vendorApi.addNote(orderId, { content: text, isVisibleToCustomer: visible });
      setNotes((list) => [...list, data.note]);
      setContent('');
      toast.success(visible ? 'Message sent to customer.' : 'Internal note saved.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not add note.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Notes</h2>
      <p className="text-xs text-gray-500 mb-4">Message the customer, or keep an internal note for your team.</p>

      {notes.length > 0 && (
        <ul className="space-y-2 mb-4">
          {notes.map((n) => (
            <li key={n.id} className="rounded bg-gray-50 px-3 py-2 text-sm">
              <p className="text-[11px] text-gray-500 mb-0.5">
                {n.isVisibleToCustomer ? 'Sent to customer' : 'Internal'}
                {n.created_at && <> · {format(new Date(n.created_at), 'MMM d, HH:mm')}</>}
              </p>
              <p className="whitespace-pre-line text-gray-800">{n.content}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 1000))}
          rows={3}
          placeholder="Write a note…"
          className="input-field resize-y"
        />
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" className="accent-scarlet-600" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
            Visible to customer
          </label>
          <Button type="submit" size="sm" isLoading={sending} disabled={!content.trim()}>
            {visible ? 'Send' : 'Save note'}
          </Button>
        </div>
      </form>
    </section>
  );
}
