import { z } from 'zod';

/** Matches backend: min 8 chars, upper, lower, digit */
export const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and a number'
  );

/** Add confirm-password match to a zod object schema */
export function withPasswordConfirmation(schema, passwordKey = 'password') {
  return schema.refine((d) => d[passwordKey] === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
}
