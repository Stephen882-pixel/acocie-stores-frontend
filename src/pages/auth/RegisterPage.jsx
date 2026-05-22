import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Enter a valid email'),
    phone: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^\+?[1-9]\d{6,14}$/.test(v), {
        message: 'Enter a valid phone number',
      }),
    password: passwordField,
    confirmPassword: z.string(),
  })
);

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ confirmPassword, phone, ...rest }) => {
    setLoading(true);
    try {
      const payload = {
        ...rest,
        ...(phone?.trim() ? { phone: phone.trim() } : {}),
      };
      await authApi.register(payload);
      toast.success('Account created! Check your email for the OTP.');
      navigate('/verify-otp', { state: { email: rest.email } });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create an account" subtitle="Join Acocie Stores today">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            placeholder="Jane"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last name"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="jane@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Phone number"
          type="tel"
          placeholder="+263771234567 (optional)"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Min 8 chars, upper, lower, number"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Re-enter password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth isLoading={loading}>
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-scarlet-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
