'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCurrentUser } from '../services/api';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { FiShoppingBag, FiArrowLeft, FiLogIn, FiLoader } from 'react-icons/fi';
import CartItem from '@/components/card/CartItem';

export default function CartPage() {
  const { 
    cartItems, 
    total, 
    loading, 
    error, 
    loadCart, 
    updateItemQuantity, 
    removeItemFromCart 
  } = useCart();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const checkAuthentication = async () => {
    try {
      setAuthLoading(true);
      await fetchCurrentUser();
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
      // Redirect to login page if not authenticated
      router.push('/login');
    } finally {
      setAuthLoading(false);
    }
  };


  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated, loadCart]);


  const handleUpdateQuantity = async (productId: number, quantity: number, productVariantId?: number) => {
    try {
      await updateItemQuantity(productId, quantity, productVariantId);
    } catch {
      alert("Vui Lòng Xoá Sản Phẩm Rồi Thêm Lại");
    }
  };

  const handleDeleteItem = async (productId: number, productVariantId?: number) => {
    if (!confirm("Bạn có chắc muốn xoá sản phẩm này không?")) return;
    try {
      await removeItemFromCart(productId, productVariantId);
    } catch {
      alert("Lỗi khi xoá sản phẩm");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md mx-auto p-8 border border-gray-200">
              <div className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-6">
                <FiLogIn className="text-white text-3xl" />
              </div>
              <h2 className="text-2xl font-light text-black tracking-wider mb-4">Cần đăng nhập</h2>
              <p className="text-gray-600 mb-6">
                Bạn cần đăng nhập để xem giỏ hàng của mình. Vui lòng đăng nhập để tiếp tục.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 font-normal text-sm uppercase tracking-wide transition-colors"
              >
                <FiLogIn />
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải giỏ hàng...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md mx-auto p-8 border border-gray-200">
              <div className="w-20 h-20 bg-gray-600 flex items-center justify-center mx-auto mb-6">
                <FiShoppingBag className="text-white text-3xl" />
              </div>
              <h2 className="text-xl font-light text-black tracking-wider mb-4">Lỗi tải giỏ hàng</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={loadCart}
                className="bg-black hover:bg-gray-800 text-white px-6 py-3 font-normal text-sm uppercase tracking-wide transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-black">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Giỏ hàng</span>
          </nav>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-light text-black tracking-wider flex items-center gap-3">
            <FiShoppingBag className="text-black" />
            Giỏ hàng của bạn
          </h1>
          <p className="text-gray-600 mt-2">
            {cartItems.length > 0 
              ? `Bạn có ${cartItems.length} sản phẩm trong giỏ hàng`
              : 'Giỏ hàng của bạn đang trống'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="border border-gray-200 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-lg md:text-xl font-light text-black tracking-wider">Sản phẩm đã chọn</h2>
              </div>

              {cartItems.length === 0 ? (
                <div className="p-8 md:p-12 text-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 flex items-center justify-center mx-auto mb-6">
                    <FiShoppingBag className="text-gray-600 text-3xl md:text-4xl" />
                  </div>
                  <h3 className="text-lg md:text-xl font-light text-black tracking-wider mb-2">Giỏ hàng trống</h3>
                  <p className="text-gray-600 mb-6">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
                  <Link
                    href="/product"
                    className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 font-normal text-sm uppercase tracking-wide transition-colors"
                  >
                    <FiArrowLeft />
                    Tiếp tục mua
                  </Link>
                </div>
              ) : (
                <>
                  {/* Desktop Header */}
                  <div className="hidden md:grid grid-cols-12 bg-gray-100 px-6 py-3 text-sm font-medium text-gray-600 border-b border-gray-200">
                    <div className="col-span-6">Sản phẩm</div>
                    <div className="col-span-2 text-center">Đơn giá</div>
                    <div className="col-span-2 text-center">Số lượng</div>
                    <div className="col-span-2 text-right">Thành tiền</div>
                  </div>

                  {/* Cart Items */}
                  <div className="divide-y">
                    {cartItems.map((item, index) => (
                      <CartItem
                        key={`${item.productId}-${item.productVariantId || 'default'}-${index}`}
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onDeleteItem={handleDeleteItem}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 p-4 md:p-6 sticky top-8">
              <h3 className="text-lg md:text-xl font-light text-black tracking-wider mb-4 md:mb-6">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-3 md:space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span className="text-sm md:text-base">Tạm tính ({cartItems.length} sản phẩm)</span>
                  <span className="text-sm md:text-base font-light">{total.toLocaleString()}₫</span>
                </div>
                
                <div className="border-t pt-3 md:pt-4">
                <div className="flex justify-between text-base md:text-lg font-light text-black">
                  <span>Tổng cộng</span>
                  <span className="text-black">{total.toLocaleString()}₫</span>
                </div>
                </div>
              </div>

              <div className="mt-4 md:mt-6 flex gap-3">
                <Link
                  href="/checkout"
                  className={`flex-1 py-3 px-4 font-normal text-sm uppercase tracking-wide text-center transition-colors ${
                    cartItems.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-black hover:bg-gray-800 text-white"
                  }`}
                >
                  Thanh toán
                </Link>
                
                <Link
                  href="/product"
                  className="flex-1 py-3 px-4 font-normal text-sm uppercase tracking-wide text-center border border-gray-300 text-black hover:border-black transition-colors"
                >
                  Tiếp tục mua
                </Link>
              </div>

              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-100 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-700 text-xs md:text-sm">
                  <FiShoppingBag className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Giao hàng nhanh chóng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
