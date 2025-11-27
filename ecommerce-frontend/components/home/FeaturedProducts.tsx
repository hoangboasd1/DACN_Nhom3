'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type { Product } from '@/types';
import { fetchTopSellingProducts, fetchProducts, addToWishlist, removeFromWishlist, checkWishlistItem, fetchCurrentUser } from '@/app/services/api';
import toast from 'react-hot-toast';

const FeaturedProducts = () => {
  const [likedProducts, setLikedProducts] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [wishlistLoading, setWishlistLoading] = useState<number | null>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  // Check user authentication
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetchCurrentUser();
        setUser(response.data);
      } catch {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    const getProducts = async () => {
      try {
        console.log('🔄 Fetching top selling products...');
        const response = await fetchTopSellingProducts(6); // Lấy top 6 sản phẩm bán chạy
        console.log('✅ Top selling products response:', response);

        if (response.data && Array.isArray(response.data)) {
          setTopProducts(response.data);

          // Fetch chi tiết sản phẩm để có đầy đủ thông tin
          const productIds = response.data.map((item: any) => item.productId);
          const productDetailsPromises = productIds.map(async (id: number) => {
            try {
              const productResponse = await fetchProducts();
              const product = productResponse.data.find((p: Product) => p.id === id);
              return product ? { ...product, totalSold: response.data.find((item: any) => item.productId === id)?.totalSold || 0 } : null;
            } catch {
              return null;
            }
          });

          const productDetails = await Promise.all(productDetailsPromises);
          const validProducts = productDetails.filter(p => p !== null);
          setProducts(validProducts);
        } else {
          console.warn('⚠️ No top selling products data received');
          setTopProducts([]);
          setProducts([]);
        }
      } catch (err: any) {
        console.error('❌ Error fetching top selling products:', err);
        console.error('❌ Error details:', {
          status: err?.response?.status || 'No status',
          data: err?.response?.data || 'No data',
          message: err?.message || 'No message'
        });

        // Fallback: try to fetch regular products
        try {
          console.log('🔄 Fallback: fetching regular products...');
          const fallbackResponse = await fetchProducts();
          if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
            console.log('✅ Fallback successful, using regular products');
            setProducts(fallbackResponse.data.slice(0, 6)); // Take first 6 products
            setError(null); // Clear error since we have fallback data
          } else {
            throw new Error('No fallback data available');
          }
        } catch (fallbackErr: any) {
          console.error('❌ Fallback also failed:', fallbackErr);
          setError(`Failed to fetch products: ${err?.response?.data || err?.message || fallbackErr?.message || 'Unknown error'}`);
          setProducts([]); // Set empty array as final fallback
        }
      } finally {
        setIsLoading(false);
      }
    };

    getProducts();
  }, []);

  // Check wishlist status for all products when user is available
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user || products.length === 0) return;

      const wishlistStatuses = await Promise.all(
        products.map(async (product) => {
          try {
            const response = await checkWishlistItem(user.id, product.id);
            return { productId: product.id, isInWishlist: response.data };
          } catch {
            return { productId: product.id, isInWishlist: false };
          }
        })
      );

      const likedProductIds = wishlistStatuses
        .filter(status => status.isInWishlist)
        .map(status => status.productId);

      setLikedProducts(likedProductIds);
    };

    checkWishlistStatus();
  }, [user, products]);

  const handleLikeProduct = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      return;
    }

    setWishlistLoading(productId);
    const previousState = likedProducts.includes(productId);

    try {
      if (likedProducts.includes(productId)) {
        console.log('Removing from wishlist...');
        const response = await removeFromWishlist(user.id, productId);
        console.log('Remove response:', response);
        setLikedProducts(prev => prev.filter(id => id !== productId));
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        console.log('Adding to wishlist...');
        const response = await addToWishlist(user.id, productId);
        console.log('Add response:', response);
        setLikedProducts(prev => [...prev, productId]);
        toast.success('Đã thêm vào danh sách yêu thích');
      }

      // Double-check the status after operation
      setTimeout(async () => {
        try {
          const statusResponse = await checkWishlistItem(user.id, productId);
          console.log('Status after operation:', statusResponse.data);
          if (statusResponse.data) {
            setLikedProducts(prev => prev.includes(productId) ? prev : [...prev, productId]);
          } else {
            setLikedProducts(prev => prev.filter(id => id !== productId));
          }
        } catch (error) {
          console.error('Error verifying status:', error);
        }
      }, 500);

    } catch (error: any) {
      console.error('Wishlist error:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
      // Revert state on error
      if (previousState) {
        setLikedProducts(prev => [...prev, productId]);
      } else {
        setLikedProducts(prev => prev.filter(id => id !== productId));
      }
    } finally {
      setWishlistLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-2xl font-light text-black tracking-wider">Sản Phẩm Bán Chạy Nhất</h2>
          <Link href="/products" className="text-black hover:text-gray-600 font-normal text-sm uppercase tracking-wide">
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[3/4] mb-4"></div>
              <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-gray-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-2xl font-light text-black tracking-wider">Sản Phẩm Bán Chạy Nhất</h2>
        <Link href="/products" className="text-black hover:text-gray-600 font-normal text-sm uppercase tracking-wide">
          Xem tất cả
        </Link>
      </div>
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={32}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 3,
          },
          1024: {
            slidesPerView: 4,
          },
        }}
        className="product-slider"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="group relative">
              <div className="block">
                <div className="relative aspect-[3/4] overflow-hidden mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleLikeProduct(product.id, e)}
                      disabled={wishlistLoading === product.id}
                      className="bg-white border border-gray-300 p-2 hover:border-black transition-colors disabled:opacity-50"
                    >
                      {likedProducts.includes(product.id) ? (
                        <FaHeart size={18} className="text-black" />
                      ) : (
                        <FiHeart size={18} />
                      )}
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Link
                      href={`/product/${product.id}`}
                      className="w-full bg-white border border-gray-300 text-black py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 hover:border-black font-normal text-sm uppercase tracking-wide"
                    >
                      <FiShoppingCart />
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
                <Link href={`/product/${product.id}`}>
                  <h3 className="text-base font-light mb-2 text-black group-hover:text-gray-600 transition-colors tracking-wide">
                    {product.name}
                  </h3>

                  {/* Product Details */}
                  <div className="space-y-1 mb-3">
                    {product.category && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Danh mục:</span>
                        <span className="text-xs text-gray-600">{product.category.name}</span>
                      </div>
                    )}

                    {product.gender && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Giới tính:</span>
                        <span className="text-xs text-gray-600">{product.gender}</span>
                      </div>
                    )}
                    {product.instock !== undefined && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Tình trạng:</span>
                        <span className="text-xs text-gray-600">
                          {product.instock > 0 ? 'Còn hàng' : 'Hết hàng'}
                        </span>
                      </div>
                    )}
                    {(product as any).totalSold !== undefined && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Đã bán:</span>
                        <span className="text-xs text-gray-600 font-semibold">{(product as any).totalSold} sản phẩm</span>
                      </div>
                    )}

                    <p className="text-black font-light text-sm tracking-wide">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(product.price)}
                    </p>

                  </div>

                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FeaturedProducts; 