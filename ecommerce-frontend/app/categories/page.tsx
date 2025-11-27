'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchCategories } from '@/app/services/api';
import { FiShoppingBag, FiArrowRight, FiGrid, FiLayers, FiTag } from 'react-icons/fi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchCategories();
        setCategories(res.data);
      } catch (error) {
        console.error('❌ Lỗi khi lấy categories:', error);
        setError('Không thể tải bộ sưu tập');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Header Section */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 bg-gray-100 text-black px-6 py-3 text-sm font-medium uppercase tracking-wide mb-8">
              <FiGrid className="w-4 h-4" />
              Khám phá bộ sưu tập
            </div>
            <h1 className="text-4xl font-light text-black mb-6 tracking-wider">
              Bộ sưu tập sản phẩm
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Khám phá đa dạng các bộ sưu tập sản phẩm chất lượng cao với giá cả hợp lý
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 w-3/4"></div>
                    <div className="h-4 bg-gray-200 w-full"></div>
                    <div className="h-4 bg-gray-200 w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <div className="bg-white border border-gray-200 p-12 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-8">
                  <FiGrid className="text-black text-2xl" />
                </div>
                <h3 className="text-xl font-light text-black mb-4 tracking-wider">Không thể tải bộ sưu tập</h3>
                <p className="text-gray-600 mb-8 text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-black hover:bg-gray-800 text-white px-8 py-3 font-normal text-sm uppercase tracking-wide transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && categories.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-white border border-gray-200 p-12 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-8">
                  <FiLayers className="text-black text-2xl" />
                </div>
                <h3 className="text-xl font-light text-black mb-4 tracking-wider">Chưa có bộ sưu tập</h3>
                <p className="text-gray-600 text-sm">Hiện tại chưa có bộ sưu tập sản phẩm nào được tạo</p>
              </div>
            </div>
          )}

          {/* Categories Grid */}
          {!loading && !error && categories.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="group block"
                >
                  <div className="bg-white border border-gray-200 hover:border-black transition-all duration-300 overflow-hidden">
                    {/* Category Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <div className="absolute inset-0 bg-black flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                        <FiLayers className="w-16 h-16 text-white" />
                      </div>
                      
                      {/* Category Number Badge */}
                      <div className="absolute top-4 left-4 bg-white border border-gray-300 text-black font-medium text-xs px-3 py-1 uppercase tracking-wide">
                        #{index + 1}
                      </div>
                      
                      {/* Hover Arrow */}
                      <div className="absolute bottom-4 right-4 bg-white border border-gray-300 text-black p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <FiArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Category Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-light text-black mb-3 group-hover:text-gray-600 transition-colors tracking-wide">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {category.description || 'Khám phá các sản phẩm chất lượng cao trong bộ sưu tập này'}
                      </p>
                      
                      {/* Action Button */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 flex items-center gap-1 uppercase tracking-wide">
                          <FiShoppingBag className="w-3 h-3" />
                          Xem sản phẩm
                        </span>
                        <div className="text-black group-hover:text-gray-600 transition-colors">
                          <FiArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Stats Section */}
          {!loading && !error && categories.length > 0 && (
            <div className="mt-20 bg-white border border-gray-200 p-12">
              <div className="text-center">
                <h2 className="text-xl font-light text-black mb-8 tracking-wider">Thống kê bộ sưu tập</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-light text-black mb-2 tracking-wide">{categories.length}</div>
                    <div className="text-gray-600 text-sm uppercase tracking-wide">Tổng số bộ sưu tập</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-light text-black mb-2 tracking-wide">100%</div>
                    <div className="text-gray-600 text-sm uppercase tracking-wide">Chất lượng đảm bảo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-light text-black mb-2 tracking-wide">24/7</div>
                    <div className="text-gray-600 text-sm uppercase tracking-wide">Hỗ trợ khách hàng</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          {!loading && !error && categories.length > 0 && (
            <div className="mt-20 text-center">
              <div className="bg-black p-12 text-white">
                <h3 className="text-xl font-light mb-6 tracking-wider">Không tìm thấy bộ sưu tập phù hợp?</h3>
                <p className="text-base mb-8 opacity-90 leading-relaxed">
                  Liên hệ với chúng tôi để được tư vấn về sản phẩm phù hợp nhất
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-white text-black px-8 py-3 font-normal text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors"
                >
                  Liên hệ ngay
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}