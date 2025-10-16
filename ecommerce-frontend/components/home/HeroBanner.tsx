'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchProducts } from '@/app/services/api';
import type { Product } from '@/types';

const HeroBanner = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await fetchProducts();
        // Luôn lấy sản phẩm đầu tiên thay vì random
        if (response.data && response.data.length > 0) {
          setProduct(response.data[0]);
        }
      } catch (err) {
        setError('Failed to fetch product');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getProduct();
  }, []);

  if (isLoading) {
    return (
      <div className="relative bg-orange-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-16">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded w-full mb-8"></div>
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="relative h-[500px] bg-gray-200 rounded-lg animate-pulse">
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="relative bg-orange-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center text-red-500">{error || 'Product not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-orange-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-16">
          <div>
            <h1 className="text-5xl font-bold mb-4 text-gray-900">{product.name}</h1>
            <p className="text-gray-900 text-lg mb-8">
              {product.description}
            </p>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(product.price)}
              </span>
            </div>
            <Link
              href={`/product/${product.id}`}
              className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Xem chi tiết
            </Link>
          </div>
          <div className="relative h-[500px]">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="rounded-lg object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner; 