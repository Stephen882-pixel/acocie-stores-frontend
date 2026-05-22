import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import AuthCard from '../../components/auth/AuthCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';
import { extractAuthPayload, REMEMBER_EMAIL_KEY } from '../../utils/auth';
import { getApiErrorMessage } from '../../utils/apiError';
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const defaultEmail =
    location.state?.email ??
    (typeof localStorage !== 'undefined'
      ? localStorage.getItem(REMEMBER_EMAIL_KEY) ?? ''
      : '');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: defaultEmail,
      rememberMe: Boolean(defaultEmail),
    },
  });

  useEffect(() => {
    if (location.state?.email) {
      toast.success('Email verified! Sign in to continue.');
    }
  }, [location.state?.email]);

  const onSubmit = async ({ rememberMe, ...values }) => {
    setLoading(true);
    try {
      const { data } = await authApi.login(values);
      const auth = extractAuthPayload(data);
      if (!auth) {
        toast.error('Unexpected login response. Please try again.');
        return;
      }
      setAuth(auth);

      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, values.email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      toast.success('Welcome back!');
      const from = location.state?.from?.pathname ?? '/';
      navigate(from, { replace: true });
    } catch (err) {
      if (err?.response?.data?.needsVerification) {
        toast.error('Please verify your email first.');
        navigate('/verify-otp', { state: { email: values.email }, replace: true });
        return;
      }
      toast.error(getApiErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Sign in" subtitle="Welcome back to Acocie Stores">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="jane@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="accent-scarlet-600"
              {...register('rememberMe')}
            />
            <span className="text-gray-600">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-scarlet-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth isLoading={loading}>
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-scarlet-600 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}
