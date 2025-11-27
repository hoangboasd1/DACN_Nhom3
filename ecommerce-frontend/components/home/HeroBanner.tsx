'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { fetchProducts } from '@/app/services/api';
import type { Product } from '@/types';

function pickRandomN<T>(arr: T[], n: number) {
  // Fisher–Yates shuffle (nhanh và chuẩn)
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}

const HeroBanner = () => {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // chỉ giữ tối đa 4 sp đã chọn ngẫu nhiên
  const [products, setProducts] = useState<Product[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAutoRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoRotation = useCallback(() => {
    // luôn clear trước khi set lại
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (products.length <= 1) return; // không xoay nếu < 2 item
    intervalRef.current = setInterval(() => {
      // dùng hàm chuyển an toàn
      goToNextProduct();
    }, 5000);
  }, [products.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToNextProduct = useCallback(() => {
    if (products.length <= 1 || isTransitioning) return;

    setIsTransitioning(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrentProductIndex((prev) => {
        const lastIndex = products.length - 1;
        const next = Math.min(prev + 1, lastIndex);

        // dừng khi tới item cuối cùng (không vòng lại)
        if (next >= lastIndex) {
          stopAutoRotation();
        }

        return next;
      });
      setIsTransitioning(false);
    }, 300);
  }, [products.length, isTransitioning, stopAutoRotation]);

  // Fetch dữ liệu và chọn ngẫu nhiên tối đa 4 sản phẩm
  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await fetchProducts();
        const data: Product[] = response?.data ?? [];
        if (data.length > 0) {
          const randomFour = pickRandomN(data, 4);
          setProducts(randomFour);
          setCurrentProductIndex(0);
        } else {
          setProducts([]);
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

  // Bắt đầu auto rotation khi có từ 2 sản phẩm trở lên
  useEffect(() => {
    if (products.length > 1) startAutoRotation();
    return () => stopAutoRotation();
  }, [products.length, startAutoRotation, stopAutoRotation]);

  // Cleanup timeout khi unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      stopAutoRotation();
    };
  }, [stopAutoRotation]);

  if (isLoading) {
    return (
      <div className="relative bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-16">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 w-3/4 mb-4"></div>
              <div className="h-20 bg-gray-200 w-full mb-8"></div>
              <div className="h-12 bg-gray-200 w-1/3"></div>
            </div>
            <div className="relative h-[500px] bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="relative bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center text-gray-600">{error || 'Không có sản phẩm nào'}</div>
        </div>
      </div>
    );
  }

  const currentProduct = products[currentProductIndex];

  return (
    <div className="relative bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-16">
          <div>
            {currentProduct.category && (
              <div 
                className={`text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider transition-all duration-500 ${
                  isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
                }`}
              >
                {currentProduct.category.name}
              </div>
            )}
            <h1 
              className={`text-4xl font-light mb-6 text-black tracking-wider transition-all duration-500 ${
                isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
              }`}
            >
              {currentProduct.name}
            </h1>
            <p 
              className={`text-gray-600 text-base mb-8 leading-relaxed transition-all duration-500 delay-100 ${
                isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
              }`}
            >
              {currentProduct.description}
            </p>
            <div 
              className={`flex items-center gap-4 mb-8 transition-all duration-500 delay-200 ${
                isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
              }`}
            >
              <span className="text-2xl font-light text-black tracking-wide">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(currentProduct.price)}
              </span>
            </div>
            <div 
              className={`flex items-center gap-4 mb-8 transition-all duration-500 delay-300 ${
                isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
              }`}
            >
              <Link
                href={`/product/${currentProduct.id}`}
                className="inline-block bg-black text-white px-8 py-3 font-normal text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors"
              >
                Xem chi tiết
              </Link>
            </div>

            {/* Dots indicator */}
            {products.length > 1 && (
              <div className="flex items-center gap-2 mt-8">
                {products.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      stopAutoRotation();
                      setIsTransitioning(true);
                      if (timeoutRef.current) clearTimeout(timeoutRef.current);
                      timeoutRef.current = setTimeout(() => {
                        setCurrentProductIndex(index);
                        setIsTransitioning(false);
                        if (index < products.length - 1) startAutoRotation();
                      }, 300);
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`w-2 h-2 transition-all duration-300 rounded-full ${
                      index === currentProductIndex 
                        ? 'bg-black' 
                        : 'bg-gray-300 hover:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative h-[500px]">
            <img
              src={currentProduct.imageUrl}
              alt={currentProduct.name}
              className={`object-cover w-full h-full transition-all duration-500 ${
                isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
              }`}
            />

            {/* Navigation arrows */}
            {products.length > 1 && (
              <>
                <button
                  onClick={() => {
                    stopAutoRotation();
                    setIsTransitioning(true);
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    timeoutRef.current = setTimeout(() => {
                      setCurrentProductIndex((prev) =>
                        prev === 0 ? products.length - 1 : prev - 1
                      );
                      setIsTransitioning(false);
                      // mũi tên trái cho phép vòng về cuối — tuỳ nhu cầu có thể bỏ
                      startAutoRotation();
                    }, 300);
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 hover:border-black text-black p-2 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* mũi tên phải: đi tới & dừng khi đến phần tử cuối */}
                {currentProductIndex < products.length - 1 && (
                  <button
                    onClick={() => {
                      stopAutoRotation();
                      goToNextProduct();
                      // không start lại nếu hàm trên đã dừng ở cuối
                      if (currentProductIndex < products.length - 2) {
                        startAutoRotation();
                      }
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 hover:border-black text-black p-2 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
