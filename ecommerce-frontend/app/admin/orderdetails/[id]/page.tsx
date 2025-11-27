'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchOrderById } from "@/app/services/api";

export default function OrderDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchOrderById(Number(id));
      setOrderDetails(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Tính tổng từ UnitPrice (đã bao gồm phí ship)
  const total = orderDetails.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  
  // Tính tổng sản phẩm (chưa bao gồm phí ship)
  const subtotal = orderDetails.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  
  const shippingFee = orderDetails.length > 0 && orderDetails[0].order?.shippingFee 
    ? orderDetails[0].order.shippingFee 
    : total - subtotal;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Chi tiết đơn hàng #{id}
        </h1>
        <button
          onClick={() => router.back()}
          className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Quay lại
        </button>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : orderDetails.length === 0 ? (
        <p> Không tìm thấy sản phẩm nào trong đơn hàng.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-left text-sm text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Số lượng</th>
                <th className="px-4 py-3">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 text-sm">
              {orderDetails.map((item, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 flex items-center gap-3">
                    <img
                      src={item.product?.imageUrl}
                      alt={item.product?.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span>{item.product?.name}</span>
                  </td>
                  <td className="px-4 py-2">
                    {item.unitPrice?.toLocaleString()}₫
                  </td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">
                    {(item.unitPrice * item.quantity).toLocaleString()}₫
                  </td>
                </tr>
              ))}

              <tr className="border-t bg-gray-50">
                <td className="px-4 py-2 text-right" colSpan={3}>
                  Tạm tính:
                </td>
                <td className="px-4 py-2">
                  {subtotal.toLocaleString()}₫
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 text-right" colSpan={3}>
                  Phí ship:
                </td>
                <td className="px-4 py-2">
                  {shippingFee.toLocaleString()}₫
                </td>
              </tr>
              <tr className="border-t font-semibold bg-gray-100">
                <td className="px-4 py-2 text-right" colSpan={3}>
                  Tổng cộng:
                </td>
                <td className="px-4 py-2 text-red-600">
                  {total.toLocaleString()}₫
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
