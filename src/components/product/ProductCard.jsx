// src/components/product/ProductCard.jsx
import { Link } from 'react-router-dom';

/**
 * Displays a single product in a grid.
 * Props: product object from API
 */
export default function ProductCard({ product }) {
  const primaryImage = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const lowestPrice = product.variants?.length
    ? Math.min(...product.variants.map((v) => parseFloat(v.price) || 0))
    : parseFloat(product.price) || 0;
  const compareAt = parseFloat(product.compareAtPrice) || 0;
  const inStock = product.variants?.some((v) => v.inventory?.quantity > 0) ?? true;

  return (
    <Link
      to={`/products/${product.id}`}
      className="card group flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {primaryImage?.imageUrl ? (
          <img
            src={primaryImage.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Out of stock badge */}
        {!inStock && (
          <span className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-medium px-2 py-0.5 rounded">
            Out of stock
          </span>
        )}

        {/* Compare-at price discount badge */}
        {compareAt > 0 && compareAt > lowestPrice && (
          <span className="absolute top-2 right-2 bg-scarlet-600 text-white text-xs font-medium px-2 py-0.5 rounded">
            {Math.round(((compareAt - lowestPrice) / compareAt) * 100)}% OFF
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        {/* Category */}
        {product.category?.name && (
          <span className="text-xs text-gray-400 uppercase tracking-wide">{product.category.name}</span>
        )}

        {/* Name */}
        <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-scarlet-600 transition-colors">
          {product.name}
        </h3>

        {/* Vendor */}
        {product.vendor && (
          <p className="text-xs text-gray-400">
            by {product.vendor.firstName} {product.vendor.lastName}
          </p>
        )}

        {/* Price row */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          <span className="text-sm font-semibold text-gray-900">
            ${lowestPrice?.toFixed(2)}
          </span>
          {compareAt > 0 && compareAt > lowestPrice && (
            <span className="text-xs text-gray-400 line-through">
              ${compareAt.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
