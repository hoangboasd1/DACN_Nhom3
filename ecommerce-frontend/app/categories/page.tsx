'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchCategories } from '@/app/services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchCategories();
        setCategories(res.data); // Nếu anh sửa hàm fetchCategories trả ra data luôn thì đổi thành setCategories(res)
      } catch (error) {
        console.error('❌ Lỗi khi lấy categories:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        🛍️ Danh mục sản phẩm
      </h1>

      {loading ? (
        <p className="text-center text-gray-500 text-lg animate-pulse">
          Đang tải danh mục...
        </p>
      ) : categories.length === 0 ? (
        <p className="text-center text-red-500 text-lg">
          Không có danh mục nào được tìm thấy 😢
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="group block overflow-hidden rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all bg-white"
            >
              <div className="relative h-40">

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />
              </div>

              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {category.name}
                </h2>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {category.description || 'Khám phá các sản phẩm hot trong danh mục này'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
