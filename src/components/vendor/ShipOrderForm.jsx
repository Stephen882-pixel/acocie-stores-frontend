// src/components/vendor/ShipOrderForm.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';

const schema = z.object({
  carrier: z.string().trim().min(2, 'At least 2 characters').max(100),
  trackingNumber: z.string().trim().min(2, 'At least 2 characters').max(100),
  trackingUrl: z.union([z.literal(''), z.string().trim().url('Enter a full URL, e.g. https://…')]),
  estimatedDelivery: z.string().optional(),
});

/** Props: onSubmit(values) async, submitting */
export default function ShipOrderForm({ onSubmit, submitting }) {
  const today = new Date().toISOString().slice(0, 10);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { carrier: '', trackingNumber: '', trackingUrl: '', estimatedDelivery: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Carrier" placeholder="DHL, G4S, Sendy…" error={errors.carrier?.message} {...register('carrier')} />
        <Input label="Tracking number" error={errors.trackingNumber?.message} {...register('trackingNumber')} />
      </div>
      <Input
        label="Tracking URL (optional)"
        type="url"
        placeholder="https://…"
        error={errors.trackingUrl?.message}
        {...register('trackingUrl')}
      />
      <Input label="Estimated delivery (optional)" type="date" min={today} {...register('estimatedDelivery')} />
      <div className="flex justify-end">
        <Button type="submit" isLoading={submitting}>Mark as shipped</Button>
      </div>
    </form>
  );
}
