import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthCard from '../../components/auth/AuthCard';
import Button from '../../components/ui/Button';
import OTPInput, { OTP_LENGTH, OTP_RESEND_SECONDS } from '../../components/auth/OTPInput';
import { authApi } from '../../api/auth.api';
import { getApiErrorMessage } from '../../utils/apiError';

const PENDING_EMAIL_KEY = 'acocie-pending-verify-email';

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email ?? '';

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS);

  useEffect(() => {
    if (email) sessionStorage.setItem(PENDING_EMAIL_KEY, email);
  }, [email]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      toast.error('Enter the full 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyOtp({ email, otp });
      sessionStorage.removeItem(PENDING_EMAIL_KEY);
      toast.success('Email verified! You can now sign in.');
      navigate('/login', { replace: true, state: { email } });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Invalid OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    toast(
      'Registration codes are sent once. If yours expired, return to registration or check your spam folder.',
      { icon: 'ℹ️', duration: 5000 }
    );
    setCountdown(OTP_RESEND_SECONDS);
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle={`Enter the 6-digit code sent to ${email}`}
    >
      <form onSubmit={onSubmit}>
        <OTPInput digits={digits} onDigitsChange={setDigits} disabled={loading} />
        <Button type="submit" fullWidth isLoading={loading}>
          Verify
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        {countdown > 0 ? (
          <>
            Resend unavailable —{' '}
            <span className="font-medium text-scarlet-600">{countdown}s</span>
          </>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-scarlet-600 font-medium hover:underline"
          >
            Didn&apos;t get a code?
          </button>
        )}
      </p>

      <p className="text-center text-sm text-gray-500 mt-3">
        <Link to="/register" className="text-scarlet-600 hover:underline">
          ← Back to registration
        </Link>
      </p>
    </AuthCard>
  );
}
