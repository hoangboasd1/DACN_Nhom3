import React from 'react';
import Link from 'next/link';

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-6">
      {/* Tiêu đề chung cho tất cả trang con */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🛍️ Sản phẩm</h1>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Quay về trang chủ
        </Link>
      </div>

      {/* Khu vực nội dung */}
      <div>{children}</div>
    </div>
  );
}
