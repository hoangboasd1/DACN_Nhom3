'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchData } from '@/app/services/api';

export default function OrderDetailsPage() {
  const params = useParams();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = rawId ? parseInt(rawId) : null;

  const [order, setOrder] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

useEffect(() => {
  if (!id) {
    setError('Không tìm thấy mã đơn hàng.');
    setLoading(false);
    return;
  }

  fetchData(id)
    .then(({ order, payment }) => {
      setOrder(order);
      setPayment(payment);
    })
    .catch((err) => {
      console.error('❌ Lỗi khi fetch:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    })
    .finally(() => setLoading(false));
}, [id]);


  const getPaymentStatusText = (status: number) => {
    switch (status) {
      case 0: return '⏳ Chờ xử lý';
      case 1: return '✅ Đã thanh toán';
      case 2: return '❌ Thất bại';
      default: return '⚠️ Không xác định';
    }
  };

  if (loading) return <p className="p-8 text-lg">⏳ Đang tải chi tiết đơn hàng...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;
  if (!order) return <p className="p-8 text-red-600">Đơn hàng không tồn tại.</p>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow rounded-lg border mt-10">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">Chi tiết đơn hàng 🧾</h1>
      <div className="mb-6 space-y-1">
        <p><strong>Mã đơn hàng:</strong> #{order.orderId}</p>
        <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Trạng thái:</strong> <span className="text-green-600 font-semibold">Đã đặt hàng</span></p>
      </div>

      <h2 className="text-xl font-semibold text-orange-600 mb-3">Danh sách sản phẩm</h2>
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full border-collapse">
          <thead className="bg-orange-100">
            <tr>
              <th className="text-left p-3 border">Tên sản phẩm</th>
              <th className="text-right p-3 border">Số lượng</th>
              <th className="text-right p-3 border">Giá</th>
              <th className="text-right p-3 border">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.orderDetails.map((item: any) => (
              <tr key={item.productId} className="hover:bg-orange-50">
                <td className="p-3 border">{item.product?.name || '---'}</td>
                <td className="text-right p-3 border">{item.quantity}</td>
                <td className="text-right p-3 border">{item.product?.price.toLocaleString()} đ</td>
                <td className="text-right p-3 border">
                  {(item.product?.price * item.quantity).toLocaleString()} đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-right mt-6 text-xl font-bold text-orange-800">
        Tổng cộng: {order.totalAmount.toLocaleString()} đ
      </div>

      {payment && (
        <div className="mt-10 bg-gray-50 border rounded-lg p-4 space-y-2">
          <h2 className="text-lg font-semibold text-indigo-600">💳 Thông tin thanh toán</h2>
          <p><strong>Phương thức:</strong> {payment.paymentMethod}</p>
          <p><strong>Số tiền:</strong> {payment.amount.toLocaleString()} đ</p>
          <p>
            <strong>Trạng thái:</strong>{' '}
            <span className="text-blue-600 font-medium">
              {getPaymentStatusText(payment.status)}
            </span>
          </p>
          <p><strong>Mã giao dịch:</strong> {payment.transactionId || '---'}</p>
          <p><strong>Cổng thanh toán:</strong> {payment.paymentGateway || '---'}</p>
        </div>
      )}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => history.back()}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          ⬅️ Quay lại đơn hàng
        </button>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          🏠 Về trang chủ
        </Link>
      </div>
    </div>
  );
}