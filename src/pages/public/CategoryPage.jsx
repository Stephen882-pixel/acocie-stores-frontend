// src/pages/public/CategoryPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categoriesApi } from '../../api/categories.api';
import { productsApi } from '../../api/products.api';
import ProductGrid from '../../components/product/ProductGrid';

const PAGE_SIZE = 20;

export default function CategoryPage() {
  const { id } = useParams();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Load category info once
  useEffect(() => {
    categoriesApi.getById(id)
      .then(({ data }) => setCategory(data.data ?? data))
      .catch(() => setCategory(null));
  }, [id]);

  // Load products whenever page changes
  useEffect(() => {
    setLoading(true);
    productsApi.getAll({ categoryId: id, page, limit: PAGE_SIZE })
      .then(({ data }) => {
        const list = data.products ?? data.data?.products ?? (Array.isArray(data) ? data : []);
        const pag  = data.pagination ?? data.data?.pagination ?? null;
        setProducts(list);
        setPagination(pag);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [id, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 flex items-center gap-1.5">
        <Link to="/" className="hover:text-scarlet-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-scarlet-600">Products</Link>
        <span>/</span>
        <span className="text-gray-600">{category?.name ?? 'Category'}</span>
      </nav>

      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">
          {category?.name ?? (
            <span className="inline-block h-8 w-48 bg-gray-200 animate-pulse rounded" />
          )}
        </h1>
        {category?.description && (
          <p className="text-sm text-gray-500">{category.description}</p>
        )}
        {pagination && (
          <p className="text-sm text-gray-400">{pagination.total} products</p>
        )}
      </div>

      {/* Grid */}
      <ProductGrid products={products} loading={loading} />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {pagination.totalPages}
          </span>
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
  );
}
