// src/components/cart/CartItemRow.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCartStore } from '../../store/cartStore';
import { getApiErrorMessage } from '../../utils/apiError';

const MAX_QTY = 100; // backend limit per line

/**
 * Stock for a cart line. Read from the raw relations because the API's
 * computed `availableStock` is always 0 for products without variants.
 */
function lineStock(item) {
  return item.variant
    ? item.variant.stockQuantity ?? 0
    : item.product?.inventory?.availableStock ?? 0;
}

export default function CartItemRow({ item }) {
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const [busy, setBusy] = useState(false);

  const { product, variant } = item;
  const image = product?.images?.[0]?.imageUrl;
  const unitPrice = parseFloat(item.currentPrice ?? variant?.price ?? product?.price) || 0;
  const stock = lineStock(item);
  const maxQty = Math.min(MAX_QTY, stock);

  const issues = (item.issues ?? []).filter((i) => i !== 'Insufficient stock');
  if (stock < item.quantity) {
    issues.push(stock > 0 ? `Only ${stock} left in stock` : 'Out of stock');
  }

  const changeQty = async (quantity) => {
    if (quantity < 1 || quantity === item.quantity) return;
    setBusy(true);
    try {
      await updateItem(item.id, quantity);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update quantity.'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await removeItem(item.id);
      toast.success('Item removed.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not remove item.'));
      setBusy(false);
    }
  };

  return (
    <li className={`flex gap-4 py-5 ${busy ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Image */}
      <Link
        to={`/products/${product?.id}`}
        className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden"
      >
        {image ? (
          <img src={image} alt={product?.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/products/${product?.id}`}
              className="text-sm font-medium text-gray-900 hover:text-scarlet-600 line-clamp-2"
            >
              {product?.name}
            </Link>
            {variant?.name && <p className="text-xs text-gray-500 mt-0.5">{variant.name}</p>}
            {product?.vendor && (
              <p className="text-xs text-gray-400">
                by {product.vendor.firstName} {product.vendor.lastName}
              </p>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
            ${(unitPrice * item.quantity).toFixed(2)}
          </p>
        </div>

        <p className="text-xs text-gray-500">${unitPrice.toFixed(2)} each</p>

        {issues.length > 0 && (
          <ul className="text-xs text-amber-700 space-y-0.5">
            {issues.map((issue) => <li key={issue}>⚠ {issue}</li>)}
          </ul>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-center border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => changeQty(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="px-3 py-1 text-sm font-medium border-x border-gray-300 min-w-[2.5rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => changeQty(item.quantity + 1)}
              disabled={item.quantity >= maxQty}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button onClick={remove} className="text-xs text-gray-500 hover:text-red-600 transition-colors">
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
