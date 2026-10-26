// src/pages/customer/CheckoutPage.jsx
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AddressForm from '../../components/profile/AddressForm';
import OrderTotals from '../../components/checkout/OrderTotals';
import Button from '../../components/ui/Button';
import { checkoutApi } from '../../api/checkout.api';
import { usersApi } from '../../api/users.api';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { getApiErrorMessage } from '../../utils/apiError';
import { isCustomerAccount, PAYMENT_METHODS } from '../../utils/checkout';

const NOTES_MAX = 1000;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addressId, setAddressId] = useState(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [problems, setProblems] = useState([]);

  const applySummary = (data) => {
    setSummary(data);
    setAddressId(data.selectedShippingAddress ?? null);
    setAddingAddress(!data.addresses?.length);
  };

  useEffect(() => {
    if (!isCustomerAccount(user)) return;
    checkoutApi.getSummary()
      .then(({ data }) => applySummary(data))
      .catch((err) => {
        toast.error(getApiErrorMessage(err, 'Could not load checkout.'));
        if (err?.response?.status === 400) navigate('/cart', { replace: true }); // empty cart
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!isCustomerAccount(user)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Checkout unavailable</h1>
        <p className="mt-2 text-sm text-gray-500">
          Only customer accounts can place orders. Sign in with a customer account to buy.
        </p>
        <Link to="/" className="btn-primary inline-block mt-6">Back to store</Link>
      </div>
    );
  }

  const handleAddAddress = async (payload) => {
    setSavingAddress(true);
    try {
      const { data } = await usersApi.addAddress(payload);
      toast.success('Address saved.');
      const { data: fresh } = await checkoutApi.getSummary(data.address.id);
      applySummary(fresh);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not save address.'));
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!addressId) {
      toast.error('Choose a shipping address.');
      return;
    }
    setPlacing(true);
    setProblems([]);
    try {
      await checkoutApi.initiate();
      const { data } = await checkoutApi.placeOrder({
        shippingAddressId: addressId,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
      await fetchCart().catch(() => {});
      navigate('/checkout/success', { replace: true, state: { order: data.order } });
    } catch (err) {
      const details = err?.response?.data?.details;
      if (Array.isArray(details) && details.length) {
        setProblems(details);
        toast.error('Some items in your cart can no longer be ordered.');
      } else {
        toast.error(getApiErrorMessage(err, 'Could not place your order.'));
      }
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8 animate-pulse">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-48 bg-gray-200 rounded-card" />
          <div className="h-32 bg-gray-200 rounded-card" />
        </div>
        <div className="h-72 bg-gray-200 rounded-card" />
      </div>
    );
  }

  if (!summary) return <Navigate to="/cart" replace />;

  const addresses = summary.addresses ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <nav className="text-xs text-gray-400 flex items-center gap-1.5 mb-4">
        <Link to="/cart" className="hover:text-scarlet-600">Cart</Link>
        <span>/</span>
        <span className="text-gray-600">Checkout</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Shipping address */}
          <section className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">1. Shipping address</h2>
              {addresses.length > 0 && !addingAddress && (
                <button onClick={() => setAddingAddress(true)} className="text-sm text-scarlet-600 hover:underline">
                  + New address
                </button>
              )}
            </div>

            {addingAddress ? (
              <AddressForm
                onSubmit={handleAddAddress}
                onCancel={addresses.length ? () => setAddingAddress(false) : undefined}
                submitting={savingAddress}
              />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex gap-3 p-4 rounded border cursor-pointer transition-colors ${
                      addressId === a.id ? 'border-scarlet-600 bg-scarlet-50/40' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingAddress"
                      className="mt-1 accent-scarlet-600"
                      checked={addressId === a.id}
                      onChange={() => setAddressId(a.id)}
                    />
                    <span className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-medium text-gray-900">{a.label || a.fullName}</span>
                      {a.isDefault && <span className="ml-2 text-[10px] uppercase font-semibold text-scarlet-700">Default</span>}
                      <br />
                      {a.fullName}<br />
                      {a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ''}<br />
                      {a.city}, {a.state} {a.postalCode}<br />
                      {a.phone}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* 2. Payment */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Payment method</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex items-start gap-3 p-3 rounded border transition-colors ${
                    !m.enabled ? 'opacity-50 cursor-not-allowed border-gray-200'
                      : paymentMethod === m.value ? 'border-scarlet-600 bg-scarlet-50/40 cursor-pointer'
                      : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="mt-1 accent-scarlet-600"
                    disabled={!m.enabled}
                    checked={paymentMethod === m.value}
                    onChange={() => setPaymentMethod(m.value)}
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">{m.label}</span>
                    <span className="block text-xs text-gray-500">{m.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* 3. Notes */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">3. Order notes <span className="text-sm font-normal text-gray-400">(optional)</span></h2>
            <p className="text-xs text-gray-500 mb-3">Delivery instructions, gate codes, preferred times…</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, NOTES_MAX))}
              rows={3}
              className="input-field resize-y"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{notes.length}/{NOTES_MAX}</p>
          </section>
        </div>

        {/* Summary */}
        <aside className="card p-6 space-y-4 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
          <OrderTotals items={summary.items} totals={summary} />

          {problems.length > 0 && (
            <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-1">
              {problems.map((p) => <p key={p}>⚠ {p}</p>)}
              <Link to="/cart" className="block font-medium underline pt-1">Update your cart</Link>
            </div>
          )}

          <Button fullWidth isLoading={placing} disabled={!addressId || addingAddress} onClick={handlePlaceOrder}>
            Place order
          </Button>
          <p className="text-xs text-gray-400 text-center">
            By placing your order you agree to pay on delivery.
          </p>
        </aside>
      </div>
    </div>
  );
}
