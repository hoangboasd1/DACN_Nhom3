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
import { fetchProductById, addToWishlist, removeFromWishlist, checkWishlistItem, fetchCurrentUser, fetchProductVariants } from '@/app/services/api';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/types';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItemToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSizes, setSelectedSizes] = useState<any[]>([]);
  const [availableSizes, setAvailableSizes] = useState<any[]>([]);

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
        
        // Fetch product variants
        try {
          const variantsResponse = await fetchProductVariants(Number(params.id));
          setVariants(variantsResponse.data || []);
        } catch (err) {
          console.error('Error fetching variants:', err);
          setVariants([]);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  // Load user and check wishlist status
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetchCurrentUser();
        setUser(response.data);
        if (response.data && product) {
          checkWishlistStatus(response.data.id);
        }
      } catch {
        setUser(null);
      }
    };
    loadUser();
  }, [product]);

  // Check wishlist status when user or product changes
  useEffect(() => {
    if (user && product) {
      checkWishlistStatus(user.id);
    }
  }, [user, product]);

  const checkWishlistStatus = async (userId: number) => {
    try {
      const response = await checkWishlistItem(userId, product!.id);
      setIsFavorite(response.data);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      setIsFavorite(false);
    }
  };

  // Get unique colors from variants
  const getAvailableColors = () => {
    const colorMap = new Map();
    variants.forEach(variant => {
      if (variant.color && !colorMap.has(variant.color.id)) {
        colorMap.set(variant.color.id, variant.color);
      }
    });
    return Array.from(colorMap.values());
  };

  // Get available sizes for selected color
  const getSizesForColor = (colorId: number) => {
    return variants
      .filter(variant => variant.colorId === colorId && variant.stockQuantity > 0)
      .map(variant => variant.size)
      .filter((size, index, self) => 
        index === self.findIndex(s => s.id === size.id)
      );
  };

  // Handle color selection
  const handleColorSelect = (color: any) => {
    setSelectedColor(color);
    setSelectedSizes([]);
    setSelectedVariant(null);
    const sizes = getSizesForColor(color.id);
    setAvailableSizes(sizes);
  };

  // Handle size selection (single size)
  const handleSizeSelect = (size: any) => {
    setSelectedSizes([size]); // Chỉ chọn 1 kích cỡ
    // Find the variant for selected color and size
    const variant = variants.find(v => 
      v.colorId === selectedColor.id && v.sizeId === size.id
    );
    setSelectedVariant(variant);
  };

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    let maxStock = product?.instock || 0;
    if (selectedVariant) {
      maxStock = selectedVariant.stockQuantity;
    }
    
    if (action === 'increase' && quantity < maxStock) {
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

    // Nếu có biến thể, yêu cầu chọn màu và kích cỡ
    if (variants.length > 0) {
      if (!selectedColor) {
        toast.error('Vui lòng chọn màu sắc');
        return;
      }
      if (selectedSizes.length === 0) {
        toast.error('Vui lòng chọn kích cỡ');
        return;
      }
      if (!selectedVariant) {
        toast.error('Biến thể không khả dụng');
        return;
      }
    }

    try {
      setIsAddingToCart(true);
      
      if (selectedVariant) {
        // Thêm biến thể vào giỏ hàng
        await addItemToCart(product.id, quantity, selectedVariant.id);
        toast.success(`Đã thêm ${selectedColor.name} - ${selectedSizes[0].name} vào giỏ hàng`);
      } else {
        // Thêm sản phẩm thường vào giỏ hàng
        await addItemToCart(product.id, quantity);
        toast.success('Đã thêm sản phẩm vào giỏ hàng');
      }
    } catch (error: any) {
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

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích');
      router.push('/login');
      return;
    }

    if (!product) return;

    setIsWishlistLoading(true);
    const previousState = isFavorite;
    
    try {
      if (isFavorite) {
        console.log('Removing from wishlist...');
        const response = await removeFromWishlist(user.id, product.id);
        console.log('Remove response:', response);
        setIsFavorite(false);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        console.log('Adding to wishlist...');
        const response = await addToWishlist(user.id, product.id);
        console.log('Add response:', response);
        setIsFavorite(true);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
      
      // Double-check the status after operation
      setTimeout(async () => {
        try {
          const statusResponse = await checkWishlistItem(user.id, product.id);
          console.log('Status after operation:', statusResponse.data);
          setIsFavorite(statusResponse.data);
        } catch (error) {
          console.error('Error verifying status:', error);
        }
      }, 500);
      
    } catch (error: any) {
      console.error('Wishlist error:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
      // Revert state on error
      setIsFavorite(previousState);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="aspect-square bg-gray-200"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 w-3/4"></div>
                  <div className="h-6 bg-gray-200 w-1/2"></div>
                  <div className="h-10 bg-gray-200 w-1/3"></div>
                  <div className="h-24 bg-gray-200"></div>
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
              <h2 className="text-2xl font-light text-black tracking-wider">Error</h2>
              <p className="text-gray-600 mt-4">{error || 'Product not found'}</p>
              <Link href="/" className="text-black hover:text-gray-600 mt-6 inline-block font-normal text-sm uppercase tracking-wide">
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
        <div className="container mx-auto px-4 py-16">
          {/* Breadcrumbs */}
          <nav className="mb-12">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-black hover:text-gray-600">
                  Trang chủ
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li>
                <Link href={`/category/${product.categoryId}`} className="text-black hover:text-gray-600">
                  {product.category?.name || 'Danh mục'}
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-gray-600">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square relative overflow-hidden bg-gray-100">
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
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-light text-black mb-4 tracking-wider">{product.name}</h1>
                {product.rating && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, index) => (
                        <AiFillStar
                          key={index}
                          className={`h-4 w-4 ${
                            index < Math.floor(product.rating || 0)
                              ? 'text-gray-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600 uppercase tracking-wide">({product.rating} đánh giá)</span>
                  </div>
                )}
              </div>

              <div className="border-t border-b border-gray-200 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    {product.discountPrice ? (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-light text-black tracking-wide">
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
                      <span className="text-2xl font-light text-black tracking-wide">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(product.price)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wide">
                    {variants.length > 0 ? (
                      selectedVariant ? (
                        selectedVariant.stockQuantity > 0 ? (
                          <span className="text-gray-600">Còn {selectedVariant.stockQuantity} sản phẩm</span>
                        ) : (
                          <span className="text-gray-600">Hết hàng</span>
                        )
                      ) : (
                        <span className="text-gray-600">Vui lòng chọn màu sắc và kích cỡ</span>
                      )
                    ) : (
                      product.instock > 0 ? (
                        <span className="text-gray-600">Còn {product.instock} sản phẩm</span>
                      ) : (
                        <span className="text-gray-600">Hết hàng</span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                {product.productMaterials && product.productMaterials.length > 0 && (
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-medium text-gray-600 w-24 uppercase tracking-wide">Chất liệu:</span>
                    <div className="flex flex-wrap gap-1">
                      {product.productMaterials.map((pm, index) => (
                        <span key={pm.id} className="text-xs text-gray-800 bg-gray-100 px-2 py-1">
                          {pm.material ? pm.material.name : 'N/A'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {product.clothingType && (
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-medium text-gray-600 w-24 uppercase tracking-wide">Loại:</span>
                    <span className="text-xs text-gray-800">{product.clothingType.name}</span>
                  </div>
                )}
                {product.gender && (
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-medium text-gray-600 w-24 uppercase tracking-wide">Giới tính:</span>
                    <span className="text-xs text-gray-800">{product.gender}</span>
                  </div>
                )}
                {product.category && (
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-medium text-gray-600 w-24 uppercase tracking-wide">Danh mục:</span>
                    <span className="text-xs text-gray-800">{product.category.name}</span>
                  </div>
                )}
              </div>

              {/* Product Variants */}
              {variants.length > 0 && (
                <div className="space-y-6">
                  {/* Color Selection */}
                  <div className="space-y-3">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Màu sắc:</span>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableColors().map((color) => (
                        <button
                          key={color.id}
                          onClick={() => handleColorSelect(color)}
                          className={`flex items-center space-x-2 px-3 py-2 border text-xs font-normal transition-colors ${
                            selectedColor?.id === color.id
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {color.hexCode && (
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.hexCode }}
                            />
                          )}
                          <span>{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Selection */}
                  {selectedColor && (
                    <div className="space-y-3">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Kích cỡ:</span>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => {
                          const variant = variants.find(v => 
                            v.colorId === selectedColor.id && v.sizeId === size.id
                          );
                          const isSelected = selectedSizes.length > 0 && selectedSizes[0].id === size.id;
                          const isOutOfStock = !variant || variant.stockQuantity === 0;
                          
                          return (
                            <button
                              key={size.id}
                              onClick={() => !isOutOfStock && handleSizeSelect(size)}
                              disabled={isOutOfStock}
                              className={`px-3 py-2 border text-xs font-normal transition-colors ${
                                isSelected
                                  ? 'border-black bg-black text-white'
                                  : isOutOfStock
                                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {size.name}
                              {variant && variant.sku && (
                                <span className="ml-1 text-xs opacity-75">
                                  ({variant.sku})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selected Variant Info */}
                  {selectedVariant && (
                    <div className="bg-gray-50 p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 uppercase tracking-wide">Đã chọn:</span>
                        <span className="font-medium">
                          {selectedColor.name} - {selectedSizes[0].name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 uppercase tracking-wide">Tồn kho:</span>
                        <span className={`font-medium ${selectedVariant.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedVariant.stockQuantity > 0 ? `Còn ${selectedVariant.stockQuantity} sản phẩm` : 'Hết hàng'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      className="p-2 hover:bg-gray-100 text-gray-600 disabled:text-gray-300 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-gray-800 font-normal text-sm">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      className="p-2 hover:bg-gray-100 text-gray-600 disabled:text-gray-300 transition-colors"
                      disabled={selectedVariant ? quantity >= selectedVariant.stockQuantity : (product && quantity >= product.instock)}
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={
                      isAddingToCart || 
                      (variants.length > 0 ? !selectedVariant || selectedVariant.stockQuantity === 0 : product?.instock === 0)
                    }
                    className="flex-1 bg-black hover:bg-gray-800 text-white py-3 px-6 font-normal text-sm uppercase tracking-wide flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiShoppingCart className="w-4 h-4" />
                    <span>
                      {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                    </span>
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    disabled={isWishlistLoading}
                    className={`p-3 border border-gray-300 hover:border-black transition-colors ${
                      isFavorite 
                        ? 'bg-black border-black text-white' 
                        : 'bg-white text-gray-600'
                    } ${isWishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isWishlistLoading ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    ) : isFavorite ? (
                      <AiFillHeart className="w-4 h-4" />
                    ) : (
                      <FiHeart className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Product Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-light text-black tracking-wider">Mô tả sản phẩm</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 