// src/router/index.jsx
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';

// Public pages
import HomePage from '../pages/public/HomePage';
import ProductsPage from '../pages/public/ProductsPage';
import ProductDetailPage from '../pages/public/ProductDetailPage';
import CategoryPage from '../pages/public/CategoryPage';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyOTPPage from '../pages/auth/VerifyOTPPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import VerifyResetOTPPage from '../pages/auth/VerifyResetOTPPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import ChangePasswordPage from '../pages/auth/ChangePasswordPage';

// Customer pages
import CartPage from '../pages/customer/CartPage';
import ProfilePage from '../pages/customer/ProfilePage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrderConfirmationPage from '../pages/customer/OrderConfirmationPage';
import OrderHistoryPage from '../pages/customer/OrderHistoryPage';
import OrderDetailPage from '../pages/customer/OrderDetailPage';

// Vendor pages
import VendorLayout from '../components/vendor/VendorLayout';
import VendorDashboardPage from '../pages/vendor/VendorDashboardPage';
import VendorOrdersPage from '../pages/vendor/VendorOrdersPage';
import VendorOrderDetailPage from '../pages/vendor/VendorOrderDetailPage';

// Route guards
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import AuthEmailRoute from './AuthEmailRoute';
import RoleRoute from './RoleRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // ── Public ──────────────────────────────────────────────────
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'categories/:id', element: <CategoryPage /> },

      // ── Auth ────────────────────────────────────────────────────
      { path: 'login', element: <PublicRoute><LoginPage /></PublicRoute> },
      { path: 'register', element: <PublicRoute><RegisterPage /></PublicRoute> },
      {
        path: 'verify-otp',
        element: (
          <PublicRoute>
            <AuthEmailRoute redirectTo="/register">
              <VerifyOTPPage />
            </AuthEmailRoute>
          </PublicRoute>
        ),
      },
      { path: 'forgot-password', element: <PublicRoute><ForgotPasswordPage /></PublicRoute> },
      {
        path: 'verify-reset-otp',
        element: (
          <PublicRoute>
            <AuthEmailRoute redirectTo="/forgot-password">
              <VerifyResetOTPPage />
            </AuthEmailRoute>
          </PublicRoute>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <PublicRoute>
            <AuthEmailRoute redirectTo="/forgot-password">
              <ResetPasswordPage />
            </AuthEmailRoute>
          </PublicRoute>
        ),
      },
      {
        path: 'change-password',
        element: (
          <PrivateRoute>
            <ChangePasswordPage />
          </PrivateRoute>
        ),
      },

      // ── Customer (protected) — Phase 3 ───────────────────────────
      { path: 'cart', element: <CartPage /> }, // guests allowed — API supports session carts
      { path: 'checkout', element: <PrivateRoute><CheckoutPage /></PrivateRoute> },
      { path: 'checkout/success', element: <PrivateRoute><OrderConfirmationPage /></PrivateRoute> },
      { path: 'orders', element: <PrivateRoute><OrderHistoryPage /></PrivateRoute> },
      { path: 'orders/:id', element: <PrivateRoute><OrderDetailPage /></PrivateRoute> },

      // ── Vendor ──────────────────────────────────────────────────
      {
        path: 'vendor',
        element: <RoleRoute allowedRoles={['vendor']}><VendorLayout /></RoleRoute>,
        children: [
          { index: true, element: <VendorDashboardPage /> },
          { path: 'orders', element: <VendorOrdersPage /> },
          { path: 'orders/:id', element: <VendorOrderDetailPage /> },
        ],
      },
      { path: 'profile', element: <PrivateRoute><ProfilePage /></PrivateRoute> },
    ],
  },
]);

export default router;
