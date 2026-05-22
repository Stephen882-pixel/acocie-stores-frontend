import { useRef } from 'react';

export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 60;

export default function OTPInput({ digits, onDigitsChange, disabled = false }) {
  const inputRefs = useRef([]);

  const updateDigit = (idx, val) => {
    const cleaned = val.replace(/\D/, '').slice(-1);
    const next = [...digits];
    next[idx] = cleaned;
    onDigitsChange(next);
    if (cleaned && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = [...digits];
    text.split('').forEach((ch, i) => {
      next[i] = ch;
    });
    onDigitsChange(next);
    inputRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div
      className="flex justify-center gap-2 mb-6"
      onPaste={handlePaste}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => updateDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 h-12 text-center text-lg font-semibold border border-gray-300 rounded-inp focus:outline-none focus:ring-2 focus:ring-scarlet-500 focus:border-scarlet-500 disabled:opacity-50"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
