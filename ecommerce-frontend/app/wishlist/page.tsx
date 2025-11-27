'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiHeart, FiArrowLeft, FiShoppingCart, FiTrash2, FiLoader, FiStar, FiEye } from 'react-icons/fi';
import { fetchWishlist, removeFromWishlist, fetchCurrentUser, addToCart } from '@/app/services/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import toast from 'react-hot-toast';

// CSS animations
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  .animate-pulse-slow {
    animation: pulse 2s ease-in-out infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [removingItem, setRemovingItem] = useState<number | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const router = useRouter();

  const checkAuthentication = async () => {
    try {
      setAuthLoading(true);
      const response = await fetchCurrentUser();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
      router.push('/login');
    } finally {
      setAuthLoading(false);
    }
  };

  const loadWishlist = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWishlist(user.id);
      setWishlistItems(res.data);
    } catch (error: any) {
      console.error('Error loading wishlist:', error);
      setError("Lỗi khi tải danh sách yêu thích. Vui lòng thử lại sau.");
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: number) => {
    if (!user) return;
    
    setRemovingItem(productId);
    try {
      await removeFromWishlist(user.id, productId);
      setWishlistItems(prev => prev.filter(item => item.productId !== productId));
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } catch {
      toast.error('Lỗi khi xóa sản phẩm');
    } finally {
      setRemovingItem(null);
    }
  };

  const handleAddToCart = async (productId: number) => {
    setAddingToCart(productId);
    try {
      await addToCart({ productId, quantity: 1 });
      toast.success("Đã thêm vào giỏ hàng");
    } catch (err) {
      toast.error("Lỗi khi thêm vào giỏ hàng");
    } finally {
      setAddingToCart(null);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadWishlist();
    }
  }, [isAuthenticated, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm uppercase tracking-wide">Đang kiểm tra đăng nhập...</p>
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
          <div className="text-center">
            <div className="bg-white border border-gray-200 p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 flex items-center justify-center mx-auto mb-8">
                <FiHeart className="text-black text-3xl" />
              </div>
              <h2 className="text-2xl font-light text-black mb-6 tracking-wider">Cần đăng nhập</h2>
              <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                Bạn cần đăng nhập để xem danh sách yêu thích của mình.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 py-3 font-normal text-sm uppercase tracking-wide transition-colors"
              >
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
              <div className="w-12 h-12 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm uppercase tracking-wide">Đang tải danh sách yêu thích...</p>
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
          <div className="text-center">
            <div className="bg-white border border-gray-200 p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 flex items-center justify-center mx-auto mb-8">
                <FiTrash2 className="text-black text-3xl" />
              </div>
              <h2 className="text-2xl font-light text-black mb-6 tracking-wider">Có lỗi xảy ra</h2>
              <p className="text-gray-600 mb-8 text-sm leading-relaxed">{error}</p>
              <button
                onClick={loadWishlist}
                className="bg-black hover:bg-gray-800 text-white px-8 py-3 font-normal text-sm uppercase tracking-wide transition-colors"
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
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-black font-medium">Danh sách yêu thích</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 bg-gray-100 flex items-center justify-center group">
              <FiHeart className="text-black text-2xl group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <h1 className="text-3xl font-light text-black mb-4 tracking-wider">Danh sách yêu thích</h1>
          <p className="text-gray-600 text-sm">
            {wishlistItems.length > 0 
              ? `Bạn có ${wishlistItems.length} sản phẩm trong danh sách yêu thích`
              : 'Danh sách sản phẩm bạn yêu thích'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/product"
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 py-3 font-normal text-sm uppercase tracking-wide transition-colors"
          >
            <FiShoppingCart className="w-4 h-4" />
            Tiếp tục mua sắm
          </Link>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-black text-black px-8 py-3 font-normal text-sm uppercase tracking-wide transition-colors"
          >
            <FiShoppingCart className="w-4 h-4" />
            Xem giỏ hàng
          </Link>
        </div>

        {/* Wishlist Content */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-8 group">
              <FiHeart className="text-gray-400 text-4xl group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h2 className="text-xl font-light text-black mb-4 tracking-wider">Danh sách yêu thích trống</h2>
            <p className="text-gray-500 mb-8 text-sm">Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.</p>
            <Link
              href="/product"
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 py-3 font-normal text-sm uppercase tracking-wide transition-colors"
            >
              <FiShoppingCart className="w-4 h-4" />
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlistItems.map((item, index) => (
              <div 
                key={item.id} 
                className="group bg-white border border-gray-200 hover:border-black transition-all duration-300 overflow-hidden opacity-0"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <Link href={`/product/${item.product.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={item.product.imageUrl || '/placeholder.png'}
                      alt={item.product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFromWishlist(item.product.id);
                        }}
                        disabled={removingItem === item.product.id}
                        className="p-2 bg-white border border-gray-300 hover:border-black transition-all duration-200 disabled:opacity-50 group/btn"
                        title="Xóa khỏi danh sách yêu thích"
                      >
                        {removingItem === item.product.id ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                        ) : (
                          <FiTrash2 className="w-4 h-4 text-black group-hover/btn:scale-110 transition-transform duration-200" />
                        )}
                      </button>
                    </div>
                    {item.product.instock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-black text-white px-3 py-1 text-xs font-medium uppercase tracking-wide">
                          Hết hàng
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-base font-light text-black mb-3 line-clamp-2 tracking-wide">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {item.product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <FiStar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600 uppercase tracking-wide">4.5</span>
                      </div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        Còn {item.product.instock} sản phẩm
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-light text-black tracking-wide">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(item.product.price)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </Link>
                
                <div className="px-6 pb-6">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAddToCart(item.product.id)}
                      disabled={addingToCart === item.product.id || item.product.instock === 0}
                      className="flex-1 bg-black text-white font-normal text-sm uppercase tracking-wide py-3 hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
                    >
                      {addingToCart === item.product.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Đang thêm...
                        </>
                      ) : (
                        <>
                          <FiShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
                          Thêm vào giỏ
                        </>
                      )}
                    </button>
                    <Link
                      href={`/product/${item.product.id}`}
                      className="px-4 py-3 bg-white border border-gray-300 hover:border-black text-black transition-colors flex items-center justify-center group/link"
                      title="Xem chi tiết"
                    >
                      <FiEye className="w-4 h-4 group-hover/link:scale-110 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bulk Actions */}
        {wishlistItems.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-white border border-gray-200 p-12">
              <h3 className="text-lg font-light text-black mb-6 tracking-wider">Thao tác nhanh</h3>
              <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                Thêm tất cả sản phẩm vào giỏ hàng hoặc xóa toàn bộ danh sách
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    wishlistItems.forEach(item => {
                      if (item.product.instock > 0) {
                        handleAddToCart(item.product.id);
                      }
                    });
                  }}
                  className="bg-black text-white px-8 py-3 font-normal text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group/btn"
                >
                  <FiShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
                  Thêm tất cả vào giỏ hàng
                </button>
                <button
                  onClick={() => {
                    if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?')) {
                      wishlistItems.forEach(item => {
                        handleRemoveFromWishlist(item.product.id);
                      });
                    }
                  }}
                  className="bg-white border border-gray-300 text-black px-8 py-3 font-normal text-sm uppercase tracking-wide hover:border-black transition-colors flex items-center justify-center gap-2 group/btn"
                >
                  <FiTrash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
                  Xóa tất cả
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}