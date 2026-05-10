// src/components/product/ProductFilters.jsx
import { useEffect, useState } from 'react';
import { categoriesApi } from '../../api/categories.api';

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

/**
 * Sidebar filter panel.
 * Props:
 *   filters   — current filter state { categoryId, minPrice, maxPrice, inStock, sortBy }
 *   onChange  — callback(updatedFilters)
 *   onReset   — callback to clear all filters
 */
export default function ProductFilters({ filters, onChange, onReset }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoriesApi.getAll()
      .then(({ data }) => {
        // handle both { data: [...] } and flat array shapes
        const list = Array.isArray(data) ? data : (data.data ?? []);
        setCategories(list);
      })
      .catch(() => setCategories([]));
  }, []);

  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <aside className="space-y-6 text-sm">
      {/* Sort */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-2">Sort by</h3>
        <select
          value={filters.sortBy ?? ''}
          onChange={(e) => set('sortBy', e.target.value)}
          className="input-field"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-2">Category</h3>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900">
            <input
              type="radio"
              name="category"
              value=""
              checked={!filters.categoryId}
              onChange={() => set('categoryId', '')}
              className="accent-scarlet-600"
            />
            All categories
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900">
              <input
                type="radio"
                name="category"
                value={cat.id}
                checked={filters.categoryId === cat.id}
                onChange={() => set('categoryId', cat.id)}
                className="accent-scarlet-600"
              />
              {cat.name}
              {cat.productCount != null && (
                <span className="ml-auto text-xs text-gray-400">{cat.productCount}</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-2">Price range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) => set('minPrice', e.target.value)}
            className="input-field w-full"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) => set('maxPrice', e.target.value)}
            className="input-field w-full"
          />
        </div>
      </div>

      {/* In stock toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={filters.inStock ?? false}
              onChange={(e) => set('inStock', e.target.checked)}
            />
            <div className={`w-10 h-5 rounded-full transition-colors ${filters.inStock ? 'bg-scarlet-600' : 'bg-gray-300'}`} />
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.inStock ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
          <span className="text-gray-700">In stock only</span>
        </label>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="text-xs text-scarlet-600 hover:underline"
      >
        Clear all filters
      </button>
    </aside>
  );
}
