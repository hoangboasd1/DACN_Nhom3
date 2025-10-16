'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAdminDashboard } from '@/app/services/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchAdminDashboard();
        setStats(data);
      } catch (error) {
        console.error('Không thể tải dữ liệu thống kê');
      }
    };

    loadStats();
  }, []);

  const adminLinks = [
    { href: '/admin/products', label: 'Quản lý sản phẩm' },
    { href: '/admin/orders', label: 'Quản lý đơn hàng' },
    { href: '/admin/users', label: 'Quản lý người dùng' },
    { href: '/admin/categories', label: 'Danh mục sản phẩm' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Bảng điều khiển Admin</h1>

      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard label="🛒 Tổng đơn hàng" value={stats.totalOrders} />
          <StatCard label="📦 Sản phẩm đang bán" value={stats.activeProducts} />
          <StatCard label="👥 Người dùng" value={stats.totalUsers} />
          <StatCard label="💸 Doanh thu hôm nay" value={Number(stats.revenueToday).toLocaleString('vi-VN') + 'đ'} />
        </div>
      ) : (
        <p className="text-gray-500">Đang tải dữ liệu thống kê...</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="block bg-blue-500 text-white text-center py-4 rounded-xl shadow hover:bg-blue-600 transition"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-4 border-l-4 border-blue-500">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
