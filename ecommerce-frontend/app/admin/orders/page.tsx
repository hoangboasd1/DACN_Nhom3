'use client';

import React, { useEffect, useState } from 'react';
import { fetchAllOrder, deleteOrder } from '@/app/services/api';
import { useRouter } from 'next/navigation';

export default function OrderPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Gọi API lấy tất cả đơn hàng
  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchAllOrder();
      setOrders(res.data);
    } catch (err) {
      console.error('Lỗi khi load đơn hàng:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Hàm xoá đơn hàng
  const handleDelete = async (orderId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xoá đơn hàng này không? 😥')) return;
    try {
      await deleteOrder(orderId);
      await loadOrders(); // Load lại danh sách
    } catch (err) {
      console.error('Lỗi xoá đơn hàng:', err);
    }
  };

  // Điều hướng đến trang xem chi tiết
  const handleViewDetails = (orderId: number) => {
    router.push(`/admin/orderdetails/${orderId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">📦 Quản lý đơn hàng</h1>

      {loading ? (
        <p>⏳ Đang tải đơn hàng...</p>
      ) : orders.length === 0 ? (
        <p>😢 Không có đơn hàng nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600 uppercase">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Tổng tiền</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {orders.map((order, index) => {
                console.log('🧾 Order:', order); // 👉 Log kiểm tra dữ liệu ở đây

                return (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{order.user?.fullName || 'Không rõ'}</td>
                    <td className="px-4 py-2">{order.totalAmount?.toLocaleString()}₫</td>
                    <td className="px-4 py-2">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {order.payment?.status === 'Success'
                        ? '✅ Đã thanh toán'
                        : order.payment?.status === 'Failed'
                        ? '❌ Thất bại'
                        : '⌛ Đang xử lý'}
                    </td>
                    <td className="px-4 py-2 space-x-3">
                      <button
                        onClick={() => handleViewDetails(order.orderId)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        👁️ Xem
                      </button>
                      <button
                        onClick={() => handleDelete(order.orderId)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        🗑️ Xoá
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}