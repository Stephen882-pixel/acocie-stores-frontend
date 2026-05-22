import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';
import { getApiErrorMessage } from '../../utils/apiError';
import { passwordField, withPasswordConfirmation } from '../../utils/passwordSchema';
import { useAuth } from '../../hooks/useAuth';

const schema = withPasswordConfirmation(
  z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordField,
    confirmPassword: z.string(),
  }),
  'newPassword'
);

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { refreshToken, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await authApi.changePassword(values);
      try {
        if (refreshToken) await authApi.logout(refreshToken);
      } catch {
        // still clear local session
      }
      logout();
      toast.success('Password changed. Please sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not change password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Change password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Update your password. You will be signed out on all devices after saving.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <Input
            label="New password"
            type="password"
            placeholder="Minimum 8 characters"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            label="Confirm new password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" fullWidth isLoading={loading}>
            Update Password
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/" className="text-scarlet-600 hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
