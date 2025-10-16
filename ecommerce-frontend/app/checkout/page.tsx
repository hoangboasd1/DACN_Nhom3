'use client';

import { useEffect, useState } from 'react';
import { fetchCart, submitOrder, createPayment } from '@/app/services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  note: string;
  paymentMethod: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [errorCart, setErrorCart] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    note: '',
    paymentMethod: 'cod',
  });

  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoadingCart(true);
        const res = await fetchCart();
        setCartItems(res.data);
        const totalAmount = res.data.reduce(
          (sum: number, item: any) => sum + item.product.price * item.quantity,
          0
        );
        setTotal(totalAmount);
        setErrorCart(null);
      } catch {
        setErrorCart('Lỗi khi tải giỏ hàng. Vui lòng thử lại sau.');
      } finally {
        setLoadingCart(false);
      }
    };
    loadCart();
  }, []);

  const validate = () => {
    const errors: Partial<FormData> = {};
    if (!form.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên';
    if (!form.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
      errors.email = 'Email không hợp lệ';
    }
    if (!form.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^\d{9,15}$/.test(form.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!form.address.trim()) errors.address = 'Vui lòng nhập địa chỉ giao hàng';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (cartItems.length === 0) {
      alert('Giỏ hàng đang trống, không thể thanh toán.');
      return;
    }

    setSubmitting(true);
    try {
      const orderRes = await submitOrder();
      const orderId = orderRes.data?.orderId;
      if (!orderId) {
        alert('Không lấy được ID đơn hàng.');
        return;
      }
      const payload = {
        orderId: orderId,
        paymentMethod: form.paymentMethod,
        amount: total,
        paymentGateway: form.paymentMethod !== 'cod' ? form.paymentMethod.toUpperCase() : undefined,
      };
      console.log("📦 Gửi payment payload:", payload);
      await createPayment(payload);

      await createPayment({
        orderId: orderId,
        paymentMethod: form.paymentMethod,
        amount: total,
        paymentGateway: form.paymentMethod !== 'cod' ? form.paymentMethod.toUpperCase() : undefined,
      });

      setOrderSuccess(true);
      router.push(`/orderdetails/${orderId}`); // ✅ Chuyển sang trang chi tiết đơn hàng
    } catch (err: any) {
      console.error("❌ Lỗi trong quá trình đặt hàng:", err);
      if (err.response && err.response.data === 'Giỏ hàng trống.') {
        alert('Giỏ hàng đang trống, không thể thanh toán.');
      } else {
        alert('Lỗi khi gửi đơn hàng hoặc thanh toán. Vui lòng thử lại sau.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-orange-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-orange-600 mb-10 select-none">Thanh toán đơn hàng</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6 md:col-span-2 border border-orange-300">
          <h2 className="text-2xl font-semibold text-orange-700 mb-4">Thông tin giao hàng</h2>
          {['fullName', 'email', 'phone', 'address'].map((field) => (
            <div key={field}>
              <input
                name={field}
                value={(form as any)[field]}
                onChange={handleChange}
                placeholder={field === 'fullName' ? 'Họ và tên' : field === 'email' ? 'Email' : field === 'phone' ? 'Số điện thoại' : 'Địa chỉ giao hàng'}
                className="w-full border rounded px-4 py-2"
              />
              {formErrors[field as keyof FormData] && (
                <p className="text-red-500 text-sm">{formErrors[field as keyof FormData]}</p>
              )}
            </div>
          ))}

          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Ghi chú (tuỳ chọn)"
            className="w-full border rounded px-4 py-2"
          />

          <div>
            <label className="block font-medium mb-1">Phương thức thanh toán</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2"
            >
              <option value="cod">Thanh toán khi nhận hàng (COD)</option>
              <option value="bank">Chuyển khoản ngân hàng</option>
              <option value="momo">Ví điện tử MoMo</option>
              <option value="zalopay">Ví điện tử ZaloPay</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded"
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
          </button>
        </form>

        <aside className="bg-white rounded-lg shadow-lg p-6 border border-orange-300">
          <h2 className="text-2xl font-semibold text-orange-700 mb-6">Đơn hàng của bạn</h2>
          <ul className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
            {cartItems.map((item) => (
              <li key={item.productId} className="flex justify-between py-3">
                <div>
                  <p className="font-semibold text-orange-900">{item.product.name}</p>
                  <p className="text-sm text-gray-500">x{item.quantity}</p>
                </div>
                <div className="font-bold text-orange-800">
                  {(item.product.price * item.quantity).toLocaleString()} đ
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-300 mt-6 pt-4 text-right font-extrabold text-xl text-orange-800">
            Tổng tiền: {total.toLocaleString()} đ
          </div>
        </aside>
      </div>
    </div>
  );
}
