// src/components/product/VariantSelector.jsx

/**
 * Chip-style variant selector.
 * Props:
 *   variants        — array of variant objects from API
 *   selectedId      — currently selected variant id
 *   onSelect        — callback(variantId)
 */
export default function VariantSelector({ variants = [], selectedId, onSelect }) {
  if (!variants.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">
        Variant:{' '}
        <span className="font-normal text-gray-500">
          {variants.find((v) => v.id === selectedId)?.name ?? 'Select one'}
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const outOfStock = v.inventory?.quantity != null && v.inventory.quantity <= 0;
          const isSelected = v.id === selectedId;

          return (
            <button
              key={v.id}
              onClick={() => !outOfStock && onSelect(v.id)}
              disabled={outOfStock}
              title={outOfStock ? 'Out of stock' : v.name}
              className={`
                relative px-3 py-1.5 text-sm rounded border transition-all
                ${isSelected
                  ? 'border-scarlet-600 bg-scarlet-50 text-scarlet-700 font-medium'
                  : 'border-gray-300 text-gray-700 hover:border-scarlet-400'}
                ${outOfStock ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer'}
              `}
            >
              {v.name}
              {v.price && (
                <span className="ml-1 text-xs text-gray-400">${parseFloat(v.price).toFixed(2)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
