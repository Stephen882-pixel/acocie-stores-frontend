// src/pages/public/HomePage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import ProductGrid from '../../components/product/ProductGrid';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    productsApi.getFeatured()
      .then(({ data }) => {
        const products = Array.isArray(data) ? data : (data.data ?? data.products ?? []);
        setFeatured(products);
      })
      .catch(() => setFeatured([]))
      .finally(() => setLoadingFeatured(false));

    categoriesApi.getAll()
      .then(({ data }) => {
        const cats = Array.isArray(data) ? data : (data.categories ?? data.data ?? []);
        setCategories(cats);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-scarlet-700 to-scarlet-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Shop Smart.<br />Shop Local.
            </h1>
            <p className="text-scarlet-100 text-lg max-w-md">
              Discover thousands of products from local vendors — fresh deals every day.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                to="/products"
                className="bg-white text-scarlet-600 hover:bg-scarlet-50 font-semibold px-6 py-3 rounded-btn transition-colors"
              >
                Shop Now
              </Link>
              <Link
                to="/register"
                className="border border-white text-white hover:bg-white/10 font-medium px-6 py-3 rounded-btn transition-colors"
              >
                Join Free
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-64 h-64 bg-white/10 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-28 w-28 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse Categories</h2>
        {loadingCats ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 h-10 w-28 bg-gray-200 animate-pulse rounded-full" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-400">No categories yet.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            <Link
              to="/products"
              className="flex-shrink-0 px-4 py-2 rounded-full border border-scarlet-600 text-scarlet-600 text-sm font-medium hover:bg-scarlet-50 transition-colors"
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.id}`}
                className="flex-shrink-0 px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm hover:border-scarlet-400 hover:text-scarlet-600 transition-colors whitespace-nowrap"
              >
                {cat.name}
                {cat.productCount ? (
                  <span className="ml-1 text-xs text-gray-400">({cat.productCount})</span>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Featured Products ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-sm text-scarlet-600 hover:underline font-medium">
            View all →
          </Link>
        </div>
        <ProductGrid products={featured} loading={loadingFeatured} />
      </section>

      {/* ── Promo Banner ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-card p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
          <div>
            <h3 className="text-2xl font-bold mb-1">Become a Vendor</h3>
            <p className="text-gray-300 text-sm">Start selling your products to thousands of customers today.</p>
          </div>
          <Link
            to="/register"
            className="flex-shrink-0 bg-scarlet-600 hover:bg-scarlet-700 text-white font-semibold px-6 py-3 rounded-btn transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
