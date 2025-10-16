'use client';

import React from 'react';
import { AiFillStar } from 'react-icons/ai';
import { formatCurrency } from '@/utils/format';

interface ProductInfoProps {
  name: string;
  price: number;
  discountPrice?: number;
  rating: number;
  description: string;
  brand: string;
}

const ProductInfo = ({ name, price, discountPrice, rating, description, brand }: ProductInfoProps) => {
  const discount = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Brand */}
      <div className="text-gray-600">{brand}</div>

      {/* Product Name */}
      <h1 className="text-3xl font-bold text-gray-900">{name}</h1>

      {/* Rating */}
      <div className="flex items-center space-x-2">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <AiFillStar
              key={i}
              className={`text-xl ${i < Math.floor(rating) ? 'text-[#FFB629]' : 'text-gray-200'}`}
            />
          ))}
        </div>
        <span className="text-[#FFB629] font-medium">{rating}</span>
      </div>

      {/* Price */}
      <div className="flex items-center space-x-4">
        {discountPrice ? (
          <>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(discountPrice)}</span>
            <span className="text-lg text-gray-500 line-through">{formatCurrency(price)}</span>
            <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded">
              -{discount}%
            </span>
          </>
        ) : (
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(price)}</span>
        )}
      </div>

      {/* Description */}
      <div className="prose prose-sm text-gray-700">
        <p>{description}</p>
      </div>
    </div>
  );
};

export default ProductInfo; 