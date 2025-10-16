'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type { Product } from '@/types';
import { fetchProducts } from '@/app/services/api';

const WeeklyBestSell = () => {
  const [likedProducts, setLikedProducts] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetchProducts();
        console.log('Weekly best sell products:', response.data);
        // Lấy 5 sản phẩm bán chạy nhất (giả sử sắp xếp theo số lượng đã bán)
        setProducts(response.data.slice(0, 5));
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getProducts();
  }, []);

  const handleLikeProduct = (productId: number) => {
    setLikedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Bán Chạy Trong Tuần</h2>
          <Link href="/products" className="text-gray-900 hover:text-[#FFB629] font-medium">
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Bán Chạy Trong Tuần</h2>
        <Link href="/products" className="text-gray-900 hover:text-[#FFB629] font-medium">
          Xem tất cả
        </Link>
      </div>
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={24}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 3,
          },
          1024: {
            slidesPerView: 4,
          },
        }}
        className="product-slider"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="group relative">
              <div className="block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleLikeProduct(product.id)}
                      className="bg-white p-2 rounded-full shadow-md hover:bg-[#FFB629] hover:text-white transition-colors"
                    >
                      {likedProducts.includes(product.id) ? (
                        <FaHeart size={20} className="text-[#FFB629]" />
                      ) : (
                        <FiHeart size={20} />
                      )}
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Link 
                      href={`/product/${product.id}`}
                      className="w-full bg-white text-gray-900 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 hover:bg-[#FFB629] hover:text-white font-medium"
                    >
                      <FiShoppingCart />
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
                <Link href={`/product/${product.id}`}>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-[#FFB629] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-900 font-semibold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(product.price)}
                  </p>
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default WeeklyBestSell; 