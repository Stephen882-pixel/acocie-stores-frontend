// src/components/orders/OrderRequestForm.jsx
import { useState } from 'react';
import Button from '../ui/Button';

const MIN = 5;
const MAX = 500;

/**
 * Reason form for cancellation / return requests.
 * Props:
 *   title, description, submitLabel
 *   onSubmit   — async callback(reason)
 *   onCancel   — close the form
 *   submitting — loading state
 */
export default function OrderRequestForm({ title, description, submitLabel, onSubmit, onCancel, submitting }) {
  const [reason, setReason] = useState('');
  const tooShort = reason.trim().length < MIN;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!tooShort) onSubmit(reason.trim());
      }}
      className="rounded border border-gray-200 bg-gray-50 p-4 space-y-3"
    >
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value.slice(0, MAX))}
        rows={3}
        placeholder="Tell us why (at least 5 characters)"
        className="input-field resize-y bg-white"
        autoFocus
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400">{reason.length}/{MAX}</span>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Back</Button>
          <Button type="submit" variant="danger" size="sm" isLoading={submitting} disabled={tooShort}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
