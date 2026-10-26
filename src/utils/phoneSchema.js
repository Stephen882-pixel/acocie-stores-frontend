// src/utils/phoneSchema.js
import { z } from 'zod';

// Mirrors the backend Joi pattern: optional +, no leading 0, 7–15 digits.
export const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

export const phoneField = z
  .string()
  .trim()
  .regex(PHONE_REGEX, 'Use international format, e.g. +254712345678');
