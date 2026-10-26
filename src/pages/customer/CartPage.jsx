// src/pages/customer/CartPage.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { cartApi } from '../../api/cart.api';
import CartItemRow from '../../components/cart/CartItemRow';
import Button from '../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/apiError';
import { canCheckout } from '../../utils/checkout';

export default function CartPage() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const cart = useCartStore((s) => s.cart);
  const loaded = useCartStore((s) => s.loaded);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const clearCart = useCartStore((s) => s.clearCart);

  const [checkingOut, setCheckingOut] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [blockingIssues, setBlockingIssues] = useState([]);

  useEffect(() => {
    fetchCart().catch((err) => toast.error(getApiErrorMessage(err, 'Could not load your cart.')));
  }, [fetchCart]);

  const handleClear = async () => {
    if (!window.confirm('Remove all items from your cart?')) return;
    setClearing(true);
    try {
      await clearCart();
      setBlockingIssues([]);
      toast.success('Cart cleared.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not clear cart.'));
    } finally {
      setClearing(false);
    }
  };

  const handleCheckout = async () => {
    if (!accessToken) {
      toast('Sign in to check out — your cart will be kept.', { icon: '🔒' });
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    if (!canCheckout(user)) {
      toast.error('Only customer accounts can place orders.');
      return;
    }
    setCheckingOut(true);
    try {
      const { data } = await cartApi.validate();
      if (!data.isValid) {
        setBlockingIssues(data.invalidItems ?? []);
        toast.error('Some items need your attention before checkout.');
        await fetchCart();
        return;
      }
      setBlockingIssues([]);
      navigate('/checkout');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not validate your cart.'));
    } finally {
      setCheckingOut(false);
    }
  };

  if (!loaded) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-7 bg-gray-200 rounded w-40" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h1 className="mt-4 text-xl font-semibold text-gray-900">Your cart is empty</h1>
        <p className="mt-1 text-sm text-gray-500">Browse products and add something you like.</p>
        <Link to="/products" className="btn-primary inline-block mt-6">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Shopping Cart <span className="text-base font-normal text-gray-500">({cart.itemCount} items)</span>
        </h1>
        <button
          onClick={handleClear}
          disabled={clearing}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {clearing ? 'Clearing…' : 'Clear cart'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Items */}
        <div className="lg:col-span-2 card px-4 sm:px-6">
          <ul className="divide-y divide-gray-100">
            {cart.items.map((item) => <CartItemRow key={item.id} item={item} />)}
          </ul>
        </div>

        {/* Summary */}
        <aside className="card p-6 space-y-4 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal ({cart.itemCount} items)</span>
            <span className="font-medium text-gray-900">${parseFloat(cart.subtotal).toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400">Shipping and taxes are calculated at checkout.</p>

          {blockingIssues.length > 0 && (
            <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-1">
              {blockingIssues.map((it) => (
                <p key={it.itemId}>
                  <span className="font-medium">{it.productName}:</span> {it.issues.join(', ')}
                </p>
              ))}
            </div>
          )}

          <Button fullWidth isLoading={checkingOut} onClick={handleCheckout}>
            {accessToken ? 'Proceed to Checkout' : 'Sign in to Checkout'}
          </Button>
          <Link to="/products" className="block text-center text-sm text-scarlet-600 hover:underline">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
