// src/components/profile/AddressForm.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { phoneField } from '../../utils/phoneSchema';

const schema = z.object({
  label: z.string().trim().max(50).optional(),
  fullName: z.string().trim().min(2, 'At least 2 characters').max(100),
  phone: phoneField,
  addressLine1: z.string().trim().min(3, 'At least 3 characters').max(255),
  addressLine2: z.string().trim().max(255).optional(),
  city: z.string().trim().min(2, 'At least 2 characters').max(100),
  state: z.string().trim().min(2, 'At least 2 characters').max(100),
  postalCode: z.string().trim().min(2, 'At least 2 characters').max(20),
  country: z.string().trim().min(2, 'At least 2 characters').max(100),
  isDefault: z.boolean().optional(),
});

const EMPTY = {
  label: '',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Kenya',
  isDefault: false,
};

/**
 * Reusable address form (profile address book, checkout).
 * Props:
 *   initial    — address to edit, or undefined for a new one
 *   onSubmit   — async callback(payload) with API-ready fields
 *   onCancel   — optional cancel handler
 *   submitting — show loading state on the submit button
 */
export default function AddressForm({ initial, onSubmit, onCancel, submitting = false }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, initial[k] ?? EMPTY[k]]))
      : EMPTY,
  });

  const submit = ({ label, ...rest }) => {
    // Joi rejects an empty label; addressLine2 may be '' to clear it
    onSubmit(label ? { label, ...rest } : rest);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Label (optional)" placeholder="Home, Office…" error={errors.label?.message} {...register('label')} />
        <Input label="Full name" error={errors.fullName?.message} {...register('fullName')} />
      </div>
      <Input label="Phone" type="tel" placeholder="+254712345678" error={errors.phone?.message} {...register('phone')} />
      <Input label="Address line 1" placeholder="Street, building" error={errors.addressLine1?.message} {...register('addressLine1')} />
      <Input label="Address line 2 (optional)" placeholder="Apartment, floor" error={errors.addressLine2?.message} {...register('addressLine2')} />
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="City" error={errors.city?.message} {...register('city')} />
        <Input label="County / State" error={errors.state?.message} {...register('state')} />
        <Input label="Postal code" error={errors.postalCode?.message} {...register('postalCode')} />
        <Input label="Country" error={errors.country?.message} {...register('country')} />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" className="accent-scarlet-600" {...register('isDefault')} />
        Set as default address
      </label>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" isLoading={submitting}>{initial ? 'Save address' : 'Add address'}</Button>
      </div>
    </form>
  );
}
