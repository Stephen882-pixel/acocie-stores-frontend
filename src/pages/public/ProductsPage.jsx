// src/pages/public/ProductsPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../../api/products.api';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilters from '../../components/product/ProductFilters';

const DEFAULT_FILTERS = {
  categoryId: '',
  minPrice: '',
  maxPrice: '',
  inStock: false,
  sortBy: '',
};

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialise filters from URL query params so links/back-button work
  const [filters, setFilters] = useState({
    categoryId: searchParams.get('categoryId') ?? '',
    minPrice:   searchParams.get('minPrice') ?? '',
    maxPrice:   searchParams.get('maxPrice') ?? '',
    inStock:    searchParams.get('inStock') === 'true',
    sortBy:     searchParams.get('sortBy') ?? '',
  });
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync filters → URL params
  const syncUrl = useCallback((f, q, p) => {
    const params = {};
    if (f.categoryId) params.categoryId = f.categoryId;
    if (f.minPrice)   params.minPrice   = f.minPrice;
    if (f.maxPrice)   params.maxPrice   = f.maxPrice;
    if (f.inStock)    params.inStock    = 'true';
    if (f.sortBy)     params.sortBy     = f.sortBy;
    if (q)            params.q          = q;
    if (p > 1)        params.page       = p;
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const fetchProducts = useCallback(async (f, q, p) => {
    setLoading(true);
    try {
      let res;
      if (q) {
        res = await productsApi.search(q, { page: p, limit: PAGE_SIZE });
      } else {
        const params = { page: p, limit: PAGE_SIZE };
        if (f.categoryId) params.categoryId = f.categoryId;
        if (f.minPrice)   params.minPrice   = f.minPrice;
        if (f.maxPrice)   params.maxPrice   = f.maxPrice;
        if (f.inStock)    params.inStock    = true;
        if (f.sortBy)     params.sortBy     = f.sortBy;
        res = await productsApi.getAll(params);
      }
      const body = res.data;
      // handle both { products, pagination } and flat array shapes
      const list = body.products ?? body.data?.products ?? (Array.isArray(body) ? body : []);
      const pag  = body.pagination ?? body.data?.pagination ?? null;
      setProducts(list);
      setPagination(pag);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncUrl(filters, searchQuery, page);
    fetchProducts(filters, searchQuery, page);
  }, [filters, searchQuery, page, fetchProducts, syncUrl]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
        </h1>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-80">
          <input
            type="text"
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary px-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      <div className="flex gap-8">
        {/* Filters sidebar */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <ProductFilters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleReset}
          />
        </div>

        {/* Product grid + pagination */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Mobile filter bar */}
          <div className="lg:hidden">
            <ProductFilters
              filters={filters}
              onChange={handleFiltersChange}
              onReset={handleReset}
            />
          </div>

          {/* Result count */}
          {!loading && pagination && (
            <p className="text-sm text-gray-500">
              Showing {products.length} of {pagination.total} products
            </p>
          )}

          <ProductGrid products={products} loading={loading} />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
              >
                ← Prev
              </button>

              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 py-1 text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 text-sm rounded ${
                          p === page
                            ? 'bg-scarlet-600 text-white font-medium'
                            : 'border border-gray-200 text-gray-600 hover:border-scarlet-400'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>

              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
