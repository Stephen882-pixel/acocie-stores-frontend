// src/pages/public/ProductDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/products.api';
import { useAuthStore } from '../../store/authStore';
import ProductImages from '../../components/product/ProductImages';
import VariantSelector from '../../components/product/VariantSelector';
import ProductGrid from '../../components/product/ProductGrid';
import toast from 'react-hot-toast';

const TABS = ['Description', 'Shipping Info'];

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('Description');
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    productsApi.getById(id)
      .then(({ data }) => {
        const p = data.data ?? data;
        setProduct(p);

        const firstInStock = p.variants?.find((v) => v.inventory?.quantity > 0) ?? p.variants?.[0];
        if (firstInStock) setSelectedVariantId(firstInStock.id);

        if (p.category?.id) {
          productsApi.getAll({ categoryId: p.category.id, limit: 5 })
            .then(({ data: rd }) => {
              const list = rd.products ?? rd.data?.products ?? [];
              setRelated(list.filter((r) => r.id !== id).slice(0, 4));
            })
            .catch(() => {});
        }
      })
      .catch(() => toast.error('Product not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const selectedVariant = product?.variants?.find((v) => v.id === selectedVariantId);
  const displayPrice = parseFloat(selectedVariant?.price ?? product?.price) || 0;
  const compareAt = parseFloat(product?.compareAtPrice) || 0;
  const inStock = selectedVariant
    ? (selectedVariant.inventory?.quantity ?? 0) > 0
    : true;

  const handleAddToCart = async () => {
    if (!selectedVariantId) {
      toast.error('Please select a variant.');
      return;
    }
    if (!user) {
      toast('Please sign in to add items to your cart.', { icon: '🔒' });
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    try {
      toast.success('Added to cart! (Cart coming in Phase 3)');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-card" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-7 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-11 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
        <p className="text-lg">Product not found.</p>
        <Link to="/products" className="mt-4 inline-block text-scarlet-600 hover:underline">← Back to products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-14">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 flex items-center gap-1.5">
        <Link to="/" className="hover:text-scarlet-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-scarlet-600">Products</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/categories/${product.category.id}`} className="hover:text-scarlet-600">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-600 truncate max-w-[160px]">{product.name}</span>
      </nav>

      {/* Main product layout */}
      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Left — images */}
        <ProductImages images={product.images ?? []} name={product.name} />

        {/* Right — details */}
        <div className="space-y-5">
          {/* Category + Vendor */}
          <div className="flex items-center gap-3 flex-wrap">
            {product.category?.name && (
              <Link
                to={`/categories/${product.category.id}`}
                className="text-xs uppercase tracking-wider text-scarlet-600 font-medium hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            {product.vendor && (
              <span className="text-xs text-gray-400">
                Sold by {product.vendor.firstName} {product.vendor.lastName}
              </span>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">
              ${displayPrice?.toFixed(2)}
            </span>
            {compareAt > 0 && compareAt > displayPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ${compareAt.toFixed(2)}
                </span>
                <span className="text-sm font-medium text-scarlet-600 bg-scarlet-50 px-2 py-0.5 rounded">
                  {Math.round(((compareAt - displayPrice) / compareAt) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock status */}
          <p className={`text-sm font-medium ${inStock ? 'text-emerald-600' : 'text-red-500'}`}>
            {inStock ? '● In Stock' : '● Out of Stock'}
          </p>

          {/* Variant selector */}
          {product.variants?.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selectedId={selectedVariantId}
              onSelect={setSelectedVariantId}
            />
          )}

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Quantity</span>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                −
              </button>
              <span className="px-4 py-1.5 text-sm font-medium border-x border-gray-300">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
              className="btn-primary flex-1 py-3 text-base disabled:opacity-50"
            >
              {addingToCart ? 'Adding…' : 'Add to Cart'}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="btn-secondary flex-1 py-3 text-base disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <div>
        <div className="flex border-b border-gray-200 gap-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-scarlet-600 text-scarlet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="py-6 text-sm text-gray-700 leading-relaxed prose max-w-none">
          {tab === 'Description' && (
            product.description
              ? <p>{product.description}</p>
              : <p className="text-gray-400">No description provided.</p>
          )}
          {tab === 'Shipping Info' && (
            <div className="space-y-2">
              <p>📦 Standard delivery: 3–5 business days</p>
              <p>🚚 Express delivery available at checkout</p>
              <p>↩ Returns accepted within 14 days of delivery</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Related Products ─────────────────────────────────────── */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Products</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
