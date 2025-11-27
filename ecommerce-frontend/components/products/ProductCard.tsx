import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { addToWishlist, removeFromWishlist, checkWishlistItem, fetchCurrentUser } from '@/app/services/api';
import toast from 'react-hot-toast';

interface ProductProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    slug: string;
    rating?: number;
    discountPrice?: number;
  };
}

export default function ProductCard({ product }: ProductProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetchCurrentUser();
        setUser(response.data);
        if (response.data) {
          checkWishlistStatus(response.data.id);
        }
      } catch {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  // Refresh wishlist status when user changes
  useEffect(() => {
    if (user) {
      checkWishlistStatus(user.id);
    }
  }, [user]);

  const checkWishlistStatus = async (userId: number) => {
    try {
      const response = await checkWishlistItem(userId, product.id);
      console.log('Check wishlist status:', response.data);
      setIsInWishlist(response.data);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      setIsInWishlist(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Wishlist toggle clicked:', { user: user?.id, product: product.id, isInWishlist });
    
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      return;
    }

    setIsLoading(true);
    const previousState = isInWishlist;
    
    try {
      if (isInWishlist) {
        console.log('Removing from wishlist...');
        const response = await removeFromWishlist(user.id, product.id);
        console.log('Remove response:', response);
        setIsInWishlist(false);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        console.log('Adding to wishlist...');
        const response = await addToWishlist(user.id, product.id);
        console.log('Add response:', response);
        setIsInWishlist(true);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
      
      // Double-check the status after operation
      setTimeout(async () => {
        try {
          const statusResponse = await checkWishlistItem(user.id, product.id);
          console.log('Status after operation:', statusResponse.data);
          setIsInWishlist(statusResponse.data);
        } catch (error) {
          console.error('Error verifying status:', error);
        }
      }, 500);
      
    } catch (error: any) {
      console.error('Wishlist error:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
      // Revert state on error
      setIsInWishlist(previousState);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group relative">
      <Link href={`/product/${product.id}`} className="block">
        <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
          <Image
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center"
            width={300}
            height={300}
          />
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            disabled={isLoading}
            className="absolute top-3 right-3 p-2 bg-white border border-gray-300 hover:border-black transition-colors z-10"
            title={isInWishlist ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
          >
            <FiHeart 
              className={`w-4 h-4 transition-colors duration-200 ${
                isInWishlist 
                  ? 'text-black' 
                  : 'text-gray-600 hover:text-black'
              }`} 
            />
          </button>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-light text-black line-clamp-1 tracking-wide">{product.name}</h3>
          <div className="mt-3 flex items-center justify-between">
            <div>
              {product.discountPrice ? (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-light text-black">${product.discountPrice}</p>
                  <p className="text-xs text-gray-500 line-through">${product.price}</p>
                </div>
              ) : (
                <p className="text-sm font-light text-black">${product.price}</p>
              )}
            </div>
            <button className="p-2 border border-gray-300 hover:border-black transition-colors">
              <FiShoppingCart className="h-4 w-4 text-gray-600 hover:text-black" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}