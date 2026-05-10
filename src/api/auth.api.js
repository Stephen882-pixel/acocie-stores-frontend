// src/api/auth.api.js
import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  verifyOtp: ({ email, otp }) => api.post('/auth/verify-otp', { email, otpCode: otp }),
  login: (data) => api.post('/auth/login', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyResetOtp: ({ email, otp }) => api.post('/auth/verify-reset-otp', { email, otpCode: otp }),
  resetPassword: ({ email, newPassword, confirmPassword }) => api.post('/auth/reset-password', { email, newPassword, confirmPassword }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  changePassword: (data) => api.post('/auth/change-password', data),
};
