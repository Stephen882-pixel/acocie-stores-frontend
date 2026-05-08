// src/pages/auth/VerifyResetOTPPage.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthCard from '../../components/auth/AuthCard';
import Button from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function VerifyResetOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email ?? '';

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const updateDigit = (idx, val) => {
    const cleaned = val.replace(/\D/, '').slice(-1);
    const next = [...digits];
    next[idx] = cleaned;
    setDigits(next);
    if (cleaned && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = [...digits];
    text.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) { toast.error('Enter the full 6-digit code.'); return; }
    setLoading(true);
    try {
      const { data } = await authApi.verifyResetOtp({ email, otp });
      toast.success('OTP verified! Set your new password.');
      navigate('/reset-password', { state: { resetToken: data.data.resetToken } });
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.forgotPassword(email);
      toast.success('New code sent!');
      setCountdown(RESEND_SECONDS);
    } catch {
      toast.error('Could not resend code.');
    }
  };

  return (
    <AuthCard title="Enter reset code" subtitle={`Check your email — ${email || 'your inbox'}`}>
      <form onSubmit={onSubmit}>
        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => updateDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-12 text-center text-lg font-semibold border border-gray-300 rounded-inp focus:outline-none focus:ring-2 focus:ring-scarlet-500 focus:border-scarlet-500"
            />
          ))}
        </div>
        <Button type="submit" fullWidth isLoading={loading}>
          Verify Code
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        {countdown > 0 ? (
          <>Resend in <span className="font-medium text-scarlet-600">{countdown}s</span></>
        ) : (
          <button onClick={handleResend} className="text-scarlet-600 font-medium hover:underline">
            Resend code
          </button>
        )}
      </p>
    </AuthCard>
  );
}
