// src/App.jsx
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';

export default function App() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const mergeGuestCart = useCartStore((s) => s.mergeGuestCart);

  // Load the cart on boot and whenever auth changes; on sign-in, fold any guest cart in.
  useEffect(() => {
    if (accessToken) mergeGuestCart();
    else fetchCart().catch(() => {});
  }, [accessToken, fetchCart, mergeGuestCart]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: '14px', borderRadius: '6px' },
          success: { iconTheme: { primary: '#DC143C', secondary: '#fff' } },
        }}
      />
    </div>
  );
}
