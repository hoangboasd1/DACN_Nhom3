'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { fetchCart, updateCartItem, deleteCartItem, addToCart } from '@/app/services/api';

interface CartItem {
  productId: number;
  quantity: number;
  productVariantId?: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    description?: string;
    instock: number;
  };
  productVariant?: {
    id: number;
    stockQuantity: number;
    sku?: string;
    color?: {
      id: number;
      name: string;
      hexCode?: string;
    };
    size?: {
      id: number;
      name: string;
    };
  };
}

interface CartContextType {
  cartItems: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  error: string | null;
  loadCart: () => Promise<void>;
  addItemToCart: (productId: number, quantity: number, productVariantId?: number) => Promise<void>;
  updateItemQuantity: (productId: number, quantity: number, productVariantId?: number) => Promise<void>;
  removeItemFromCart: (productId: number, productVariantId?: number) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize calculations để tránh re-render không cần thiết
  const total = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0), 
    [cartItems]
  );
  
  const itemCount = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.quantity, 0), 
    [cartItems]
  );

  // Memoize loadCart function
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchCart();
      setCartItems(res.data || []);
    } catch (err: any) {
      console.error('Lỗi khi tải giỏ hàng:', err);
      setError('Lỗi khi tải giỏ hàng. Vui lòng thử lại sau.');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize addItemToCart function
  const addItemToCart = useCallback(async (productId: number, quantity: number, productVariantId?: number) => {
    try {
      await addToCart({ productId, quantity, productVariantId });
      // Cập nhật local state thay vì reload từ API để tránh re-render
      setCartItems(prev => {
        const existingItem = prev.find(item => item.productId === productId);
        if (existingItem) {
          return prev.map(item =>
            item.productId === productId 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Nếu chưa có trong cart, cần fetch từ API để lấy thông tin sản phẩm
          loadCart();
          return prev;
        }
      });
    } catch (err: any) {
      console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', err);
      // Hiển thị thông báo lỗi cụ thể từ backend
      if (err.response?.data) {
        alert(err.response.data);
      } else {
        alert("Lỗi khi thêm sản phẩm vào giỏ hàng");
      }
      throw err;
    }
  }, [loadCart]);

  // Memoize updateItemQuantity function
  const updateItemQuantity = useCallback(async (productId: number, quantity: number, productVariantId?: number) => {
    if (quantity < 1) return;
    
    try {
      await updateCartItem(productId, quantity, productVariantId);
      setCartItems(prev =>
        prev.map(item =>
          item.productId === productId && item.productVariantId === productVariantId 
            ? { ...item, quantity } 
            : item
        )
      );
    } catch (err: any) {
      console.error('Lỗi khi cập nhật số lượng:', err);
      // Hiển thị thông báo lỗi cụ thể từ backend
      if (err.response?.data) {
        alert(err.response.data);
      } else {
        alert("Lỗi khi cập nhật số lượng");
      }
      throw err;
    }
  }, []);

  // Memoize removeItemFromCart function
  const removeItemFromCart = useCallback(async (productId: number, productVariantId?: number) => {
    try {
      await deleteCartItem(productId, productVariantId);
      setCartItems(prev => prev.filter(item => 
        !(item.productId === productId && item.productVariantId === productVariantId)
      ));
    } catch (err: any) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      throw err;
    }
  }, []);

  // Memoize clearCart function
  const clearCart = useCallback(() => {
    setCartItems([]);
    setError(null);
  }, []);

  // Load cart khi component mount - chỉ chạy 1 lần
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadCart();
    }
  }, [loadCart]);

  // Listen for storage changes để sync giữa các tab - chỉ setup 1 lần
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue) {
        loadCart();
      } else if (e.key === 'token' && !e.newValue) {
        clearCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadCart, clearCart]);

  // Memoize context value để tránh re-render không cần thiết
  const value = useMemo(() => ({
    cartItems,
    total,
    itemCount,
    loading,
    error,
    loadCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearCart,
  }), [
    cartItems,
    total,
    itemCount,
    loading,
    error,
    loadCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearCart,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
