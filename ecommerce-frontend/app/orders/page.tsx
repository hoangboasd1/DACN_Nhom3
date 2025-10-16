'use client';

import { useEffect, useState } from 'react';
import { fetchAllOrder, fetchOrderDetails } from '@/app/services/api';
import { useRouter } from 'next/navigation';

interface Order {
  id: number;
  createdAt: string;
  status: string;
}

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetchAllOrder();
        setOrders(
          res.data.map((o: any) => ({
            id: o.orderId,
            createdAt: o.orderDate,
            status: o.status
          }))
        );
      } catch (err) {
        console.error('❌ Lỗi khi lấy đơn hàng:', err);
        setError('Không thể lấy danh sách đơn hàng 🥲');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewDetails = (orderId: number) => {
    router.push(`/orderdetails/${orderId}`);
  };

  if (loading) return <div className="text-center p-5">Đang tải đơn hàng... 🌀</div>;
  if (error) return <div className="text-red-500 text-center p-5">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4">🛒 Đơn hàng của bạn</h1>
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-600 hover:underline hover:text-blue-800 text-sm"
      >
        ⬅️ Quay lại
      </button>
      {orders.length === 0 ? (
        <p className="text-gray-500">Bạn chưa mua đơn hàng nào cả 😢</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p><strong>📦 Mã đơn:</strong> #{order.id}</p>
                  <p><strong>🗓️ Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  <p><strong>📌 Trạng thái:</strong> {order.status || 'Đang xử lý'}</p>
                </div>
                <button
                  onClick={() => handleViewDetails(order.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Xem chi tiết ➤
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
