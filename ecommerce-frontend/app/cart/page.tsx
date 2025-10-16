'use client';

import { useEffect, useState } from 'react';
import { fetchCart, updateCartItem, deleteCartItem } from '../services/api';
import Link from 'next/link';
import { FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import CartItem from '@/components/card/CartItem';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await fetchCart();
      const data = res.data;

      if (!data || !Array.isArray(data)) {
        throw new Error("Dữ liệu không hợp lệ");
      }

      setCartItems(data);
      setError(null);
    } catch {
      setError("Lỗi khi tải giỏ hàng. Vui lòng thử lại sau.");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    setTotal(totalPrice);
  }, [cartItems]);

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      await updateCartItem(productId, quantity);
      setCartItems(prev =>
        prev.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    } catch {
      alert("Lỗi khi cập nhật số lượng");
    }
  };

  const handleDeleteItem = async (productId: number) => {
    if (!confirm("Bạn có chắc muốn xoá sản phẩm này không?")) return;
    try {
      await deleteCartItem(productId);
      setCartItems(prev => prev.filter(item => item.productId !== productId));
    } catch {
      alert("Lỗi khi xoá sản phẩm");
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải giỏ hàng...</div>;

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <button
          onClick={loadCart}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <FiShoppingBag className="text-orange-500" /> Giỏ hàng ({cartItems.length})
        </h1>
        <Link
          href="/product"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow font-medium flex items-center gap-2"
        >
          <FiArrowLeft /> Tiếp tục mua
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 bg-gray-50 px-6 py-3 text-sm font-medium text-gray-500 border-b">
          <div className="col-span-6">Sản phẩm</div>
          <div className="col-span-2 text-center">Đơn giá</div>
          <div className="col-span-2 text-center">Số lượng</div>
          <div className="col-span-2 text-right">Thành tiền</div>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <h2 className="text-lg font-semibold mb-2">🛒 Giỏ hàng trống</h2>
            <p className="text-sm mb-4">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
          </div>
        ) : (
          <div className="divide-y">
            {cartItems.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onDeleteItem={handleDeleteItem}
              />
            ))}
          </div>
        )}

        <div className="border-t p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-gray-600">Miễn phí vận chuyển cho đơn hàng trên 500.000₫</p>
            <div className="text-right">
              <p className="text-gray-700">Tổng tiền:</p>
              <p className="text-2xl font-bold text-orange-600">{total.toLocaleString()}₫</p>
              <p className="text-sm text-gray-500">(Đã bao gồm VAT nếu có)</p>
              <Link
                href="/checkout"
                className={`inline-block mt-4 py-3 px-8 rounded-lg font-semibold shadow-md transition ${
                  cartItems.length === 0
                    ? "bg-gray-300 text-white cursor-not-allowed pointer-events-none"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                Thanh toán ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
