// src/components/product/ProductImages.jsx
import { useState } from 'react';

/**
 * Image gallery with thumbnail strip.
 * Props:
 *   images — array of { url, isPrimary, sortOrder }
 *   name   — product name (used as alt text)
 */
export default function ProductImages({ images = [], name = 'Product' }) {
  const sorted = [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const [active, setActive] = useState(
    sorted.findIndex((img) => img.isPrimary) !== -1
      ? sorted.findIndex((img) => img.isPrimary)
      : 0
  );

  if (!sorted.length) {
    return (
      <div className="aspect-square bg-gray-100 rounded-card flex items-center justify-center text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="aspect-square bg-gray-100 rounded-card overflow-hidden">
        <img
          src={sorted[active]?.url}
          alt={`${name} — image ${active + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails — only show if more than 1 image */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                active === idx ? 'border-scarlet-600' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
