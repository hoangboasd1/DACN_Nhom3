'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiMinus, FiPlus, FiShoppingCart, FiHeart, FiShare2 } from 'react-icons/fi';
import { AiFillStar, AiFillHeart } from 'react-icons/ai';
import { toast } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { fetchProductById, addToCart } from '@/app/services/api';
import type { Product } from '@/types';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) {
        setError('Product ID is required');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetchProductById(Number(params.id));
        if (!response.data) {
          throw new Error('Product not found');
        }
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase' && product && quantity < product.instock) {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Kiểm tra token đăng nhập
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      router.push('/login');
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart({
        productId: product.id,
        quantity: quantity
      });
      toast.success('Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        router.push('/login');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại');
      } else {
        toast.error('Đã có lỗi xảy ra. Vui lòng thử lại sau');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích');
      router.push('/login');
      return;
    }
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích');
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-500">Error</h2>
              <p className="text-gray-800 mt-2">{error || 'Product not found'}</p>
              <Link href="/" className="text-[#FFB629] hover:text-[#ffa600] mt-4 inline-block font-medium">
                Return to Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-[#FFB629] hover:text-[#ffa600]">
                  Trang chủ
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li>
                <Link href={`/category/${product.categoryId}`} className="text-[#FFB629] hover:text-[#ffa600]">
                  {product.category?.name || 'Danh mục'}
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-gray-800">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                {product.rating && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, index) => (
                        <AiFillStar
                          key={index}
                          className={`h-5 w-5 ${
                            index < Math.floor(product.rating || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-700">({product.rating} đánh giá)</span>
                  </div>
                )}
              </div>

              <div className="border-t border-b py-4">
                <div className="flex items-center justify-between">
                  <div>
                    {product.discountPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-red-600">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(product.discountPrice)}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(product.price)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    {product.instock > 0 ? (
                      <span className="text-green-600">Còn {product.instock} sản phẩm</span>
                    ) : (
                      <span className="text-red-600">Hết hàng</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      className="p-2 hover:bg-gray-100 text-gray-600 disabled:text-gray-300"
                      disabled={quantity <= 1}
                    >
                      <FiMinus className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 text-gray-800 font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      className="p-2 hover:bg-gray-100 text-gray-600 disabled:text-gray-300"
                      disabled={product && quantity >= product.instock}
                    >
                      <FiPlus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product?.instock === 0 || isAddingToCart}
                    className="flex-1 bg-[#FFB629] hover:bg-[#ffa600] text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed relative"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    <span>
                      {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                    </span>
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-3 rounded-lg border ${
                      isFavorite 
                        ? 'bg-red-50 border-red-200 text-red-500' 
                        : 'hover:bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    {isFavorite ? (
                      <AiFillHeart className="w-6 h-6" />
                    ) : (
                      <FiHeart className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>

              {/* Product Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Mô tả sản phẩm</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 