import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import AuthCard from '../../components/auth/AuthCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';
import { getApiErrorMessage } from '../../utils/apiError';
import { passwordField, withPasswordConfirmation } from '../../utils/passwordSchema';

const schema = withPasswordConfirmation(
  z.object({
    newPassword: passwordField,
    confirmPassword: z.string(),
  }),
  'newPassword'
);

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email ?? '';
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ newPassword, confirmPassword }) => {
    setLoading(true);
    try {
      await authApi.resetPassword({ email, newPassword, confirmPassword });
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login', { replace: true, state: { email } });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Reset failed. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="New password" subtitle="Choose a strong password for your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New password"
          type="password"
          placeholder="Min 8 chars, upper, lower, number"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          label="Confirm new password"
          type="password"
          placeholder="Re-enter password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" fullWidth isLoading={loading}>
          Reset Password
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        <Link to="/login" className="text-scarlet-600 hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
