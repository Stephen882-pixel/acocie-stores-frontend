import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthCard from '../../components/auth/AuthCard';
import Button from '../../components/ui/Button';
import OTPInput, { OTP_LENGTH, OTP_RESEND_SECONDS } from '../../components/auth/OTPInput';
import { authApi } from '../../api/auth.api';
import { getApiErrorMessage } from '../../utils/apiError';

export default function VerifyResetOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email ?? '';

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      toast.error('Enter the full 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyResetOtp({ email, otp });
      toast.success('Code verified! Set your new password.');
      navigate('/reset-password', { state: { email }, replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Invalid OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.forgotPassword(email);
      toast.success('New code sent!');
      setCountdown(OTP_RESEND_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(''));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not resend code.'));
    }
  };

  return (
    <AuthCard title="Enter reset code" subtitle={`Check your email — ${email}`}>
      <form onSubmit={onSubmit}>
        <OTPInput digits={digits} onDigitsChange={setDigits} disabled={loading} />
        <Button type="submit" fullWidth isLoading={loading}>
          Verify Code
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        {countdown > 0 ? (
          <>
            Resend in <span className="font-medium text-scarlet-600">{countdown}s</span>
          </>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-scarlet-600 font-medium hover:underline"
          >
            Resend code
          </button>
        )}
      </p>

      <p className="text-center text-sm text-gray-500 mt-3">
        <Link to="/forgot-password" className="text-scarlet-600 hover:underline">
          ← Use a different email
        </Link>
      </p>
    </AuthCard>
  );
}
