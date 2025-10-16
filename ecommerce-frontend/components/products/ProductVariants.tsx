'use client';

import React, { useState } from 'react';

interface Variant {
  id: number;
  size: string;
  color: string;
  stock: number;
}

interface ProductVariantsProps {
  variants: Variant[];
  onVariantChange: (variant: Variant | null) => void;
}

const ProductVariants = ({ variants, onVariantChange }: ProductVariantsProps) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // Get unique sizes and colors
  const sizes = Array.from(new Set(variants.map(v => v.size)));
  const colors = Array.from(new Set(variants.map(v => v.color)));

  // Find selected variant
  const selectedVariant = variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  );

  // Update parent component when selection changes
  React.useEffect(() => {
    onVariantChange(selectedVariant || null);
  }, [selectedVariant, onVariantChange]);

  const handleQuantityChange = (value: number) => {
    if (!selectedVariant) return;
    const newQuantity = Math.max(1, Math.min(value, selectedVariant.stock));
    setQuantity(newQuantity);
  };

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kích thước
        </label>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`py-2 text-sm font-medium rounded-md transition-all
                ${selectedSize === size
                  ? 'bg-[#FFB629] text-white'
                  : 'bg-white text-gray-800 border border-gray-200 hover:border-[#FFB629]'
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Màu sắc
        </label>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`py-2 text-sm font-medium rounded-md transition-all
                ${selectedColor === color
                  ? 'bg-[#FFB629] text-white'
                  : 'bg-white text-gray-800 border border-gray-200 hover:border-[#FFB629]'
                }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số lượng
        </label>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={!selectedVariant || quantity <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-800 hover:border-[#FFB629] disabled:opacity-50 disabled:hover:border-gray-300"
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            min="1"
            max={selectedVariant?.stock || 1}
            className="w-16 h-8 text-center border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:border-[#FFB629]"
          />
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={!selectedVariant || quantity >= selectedVariant.stock}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-800 hover:border-[#FFB629] disabled:opacity-50 disabled:hover:border-gray-300"
          >
            +
          </button>
          {selectedVariant && (
            <span className="text-sm text-gray-800">
              Còn {selectedVariant.stock} sản phẩm
            </span>
          )}
        </div>
      </div>

      {/* Stock Status */}
      {selectedSize && selectedColor && !selectedVariant && (
        <p className="text-red-500 text-sm">Phiên bản này đã hết hàng</p>
      )}
    </div>
  );
};

export default ProductVariants; 