// src/components/profile/ProfileDetails.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { usersApi } from '../../api/users.api';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../utils/apiError';
import { phoneField } from '../../utils/phoneSchema';

const schema = z.object({
  firstName: z.string().trim().min(2, 'At least 2 characters').max(50),
  lastName: z.string().trim().min(2, 'At least 2 characters').max(50),
  phone: z.union([z.literal(''), phoneField]),
});

const ROLE_LABELS = {
  customer: 'Customer',
  vendor_pending: 'Vendor (pending approval)',
  vendor: 'Vendor',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

/**
 * Props:
 *   profile    — user object from GET /users/profile
 *   onUpdated  — callback(updatedFields) after a successful save
 */
export default function ProfileDetails({ profile, onUpdated }) {
  const updateUser = useAuthStore((s) => s.updateUser);
  const [saving, setSaving] = useState(false);
  const [requestingVendor, setRequestingVendor] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      phone: profile.phone ?? '',
    },
  });

  const memberSince = profile.created_at ?? profile.createdAt;

  const onSubmit = async ({ phone, ...names }) => {
    setSaving(true);
    try {
      // phone is unique in the DB, so never send an empty string
      const { data } = await usersApi.updateProfile(phone ? { ...names, phone } : names);
      const fields = {
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: data.user.phone,
      };
      updateUser(fields);
      onUpdated(fields);
      reset({ ...fields, phone: fields.phone ?? '' });
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update profile.'));
    } finally {
      setSaving(false);
    }
  };

  const handleRequestVendor = async () => {
    if (!window.confirm('Apply to become a vendor? An admin will review your request.')) return;
    setRequestingVendor(true);
    try {
      const { data } = await usersApi.requestVendor();
      updateUser({ role: data.role });
      onUpdated({ role: data.role });
      toast.success('Vendor request submitted.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not submit vendor request.'));
    } finally {
      setRequestingVendor(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal information</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <Input label="Email" value={profile.email} disabled className="bg-gray-50 text-gray-500" />
          <Input
            label="Phone"
            type="tel"
            placeholder="+254712345678"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <div className="flex justify-end">
            <Button type="submit" isLoading={saving} disabled={!isDirty}>Save changes</Button>
          </div>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
        <dl className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Role</dt>
            <dd className="font-medium text-gray-900">{ROLE_LABELS[profile.role] ?? profile.role}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Email verified</dt>
            <dd className={`font-medium ${profile.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
              {profile.isVerified ? 'Yes' : 'No'}
            </dd>
          </div>
          {memberSince && (
            <div>
              <dt className="text-gray-500">Member since</dt>
              <dd className="font-medium text-gray-900">{format(new Date(memberSince), 'MMM d, yyyy')}</dd>
            </div>
          )}
        </dl>

        {profile.role === 'customer' && (
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Sell on Acocie</p>
              <p className="text-xs text-gray-500">Apply for a vendor account to list your own products.</p>
            </div>
            <Button variant="secondary" isLoading={requestingVendor} onClick={handleRequestVendor}>
              Become a vendor
            </Button>
          </div>
        )}
        {profile.role === 'vendor_pending' && (
          <p className="mt-6 pt-6 border-t border-gray-100 text-sm text-amber-700">
            Your vendor application is under review.
          </p>
        )}
      </section>
    </div>
  );
}
