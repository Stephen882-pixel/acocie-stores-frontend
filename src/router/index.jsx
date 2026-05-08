// src/router/index.jsx
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';

// Public pages
import HomePage from '../pages/public/HomePage';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyOTPPage from '../pages/auth/VerifyOTPPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import VerifyResetOTPPage from '../pages/auth/VerifyResetOTPPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Route guards
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // ── Public ──────────────────────────────────────────────
      { index: true, element: <HomePage /> },

      // ── Auth (redirect away if already logged in) ────────────
      { path: 'login',            element: <PublicRoute><LoginPage /></PublicRoute> },
      { path: 'register',         element: <PublicRoute><RegisterPage /></PublicRoute> },
      { path: 'verify-otp',       element: <VerifyOTPPage /> },
      { path: 'forgot-password',  element: <ForgotPasswordPage /> },
      { path: 'verify-reset-otp', element: <VerifyResetOTPPage /> },
      { path: 'reset-password',   element: <ResetPasswordPage /> },

      // ── Customer (protected) — Phase 3 ───────────────────────
      // { path: 'cart',     element: <PrivateRoute><CartPage /></PrivateRoute> },
      // { path: 'checkout', element: <PrivateRoute><CheckoutPage /></PrivateRoute> },
      // { path: 'orders',   element: <PrivateRoute><OrderHistoryPage /></PrivateRoute> },
      // { path: 'orders/:id', element: <PrivateRoute><OrderDetailPage /></PrivateRoute> },
      // { path: 'profile',  element: <PrivateRoute><ProfilePage /></PrivateRoute> },
    ],
  },
]);

export default router;
