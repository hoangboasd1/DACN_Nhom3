'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { FiSearch, FiShoppingCart, FiUser, FiHeart } from 'react-icons/fi';
import { fetchCurrentUser, logout, fetchProducts } from '@/app/services/api';
import { useCart } from '@/contexts/CartContext';
import { clearInvalidAuth } from '@/utils/auth';

const Header = () => {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const { itemCount: cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetchProducts();
      const products = response.data || [];
      
      // Lọc sản phẩm theo từ khóa
      const filtered = products.filter((product: any) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5); // Chỉ lấy 5 sản phẩm đầu tiên
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Debounce search
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchTerm.trim()) {
      router.push(`/product?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSuggestionClick = (product: any) => {
    setSearchTerm(product.name);
    setShowSuggestions(false);
    router.push(`/product/${product.id}`);
  };

  useEffect(() => {
    // Clear invalid auth first
    clearInvalidAuth();
    
    const loadUser = async () => {
      try {
        const response = await fetchCurrentUser();
        setUser(response.data);
      } catch {
        setUser(null);
      }
    };

    loadUser();

    // Handle click outside to close suggestions
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    logout(); // This now triggers the logout event
    setUser(null);
    router.push('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="hidden lg:flex items-center justify-between py-2 text-xs text-gray-600 border-b border-gray-100">
          <div className="flex items-center space-x-6">
            <span> Hotline: 0328162969</span>
            <span> Email: support@lazyshop.com</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/about" className="hover:text-black transition-colors">Về chúng tôi</Link>
            <Link href="/contact" className="hover:text-black transition-colors">Liên hệ</Link>
            <span>Giao hàng nhanh chóng</span>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-3xl font-light text-black tracking-wider">
              LazyShop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/categories" className="text-black hover:text-gray-600 font-normal text-sm uppercase tracking-wide transition-colors">
              Bộ sưu tập
            </Link>
            <Link href="/product" className="text-black hover:text-gray-600 font-normal text-sm uppercase tracking-wide transition-colors">
              Sản phẩm
            </Link>
            {user && (
              <Link href="/orders" className="text-black hover:text-gray-600 font-normal text-sm uppercase tracking-wide transition-colors">
                Đơn hàng
              </Link>
            )}
          </nav>

          {/* Search - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full" ref={searchRef}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 focus:outline-none focus:border-black text-gray-700 placeholder-gray-400 text-sm"
                aria-label="Tìm kiếm sản phẩm"
              />
              <button
                type="submit"
                aria-label="Tìm kiếm"
                title="Tìm kiếm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                <FiSearch size={18} />
              </button>
              
              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg z-50 max-h-80 overflow-y-auto">
                  {isLoadingSuggestions ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto"></div>
                      <p className="mt-2 text-sm">Đang tìm kiếm...</p>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="py-2">
                      {suggestions.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSuggestionClick(product)}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="w-12 h-12 relative mr-3 flex-shrink-0">
                            <Image
                              src={product.imageUrl || '/placeholder.png'}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                              sizes="48px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {product.description || 'Không có mô tả'}
                            </p>
                            <div className="flex items-center mt-1">
                              {product.discountPrice ? (
                                <span className="text-sm font-medium text-red-600">
                                  {product.discountPrice.toLocaleString()}₫
                                </span>
                              ) : (
                                <span className="text-sm font-medium text-gray-900">
                                  {product.price.toLocaleString()}₫
                                </span>
                              )}
                              {product.discountPrice && (
                                <span className="text-xs text-gray-500 line-through ml-2">
                                  {product.price.toLocaleString()}₫
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchTerm.length >= 2 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">Không tìm thấy sản phẩm phù hợp</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </form>

          {/* Icons & User */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link href="/wishlist" className="hidden lg:flex items-center text-black hover:text-gray-600 transition-colors">
              <FiHeart size={20} />
            </Link>

            {/* User */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link href="/profile" className="text-black hover:text-gray-600 transition-colors text-sm">
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-black hover:text-gray-600 transition-colors text-sm"
                  title="Đăng xuất"
                >
                  <FiLogOut size={18} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center text-black hover:text-gray-600 transition-colors">
                <FiUser size={20} />
              </Link>
            )}

            {/* Cart */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!user) {
                    router.push('/login');
                  } else {
                    router.push('/cart');
                  }
                }}
                className="flex items-center justify-center text-black hover:text-gray-600 transition-colors relative"
                title={user ? "Giỏ hàng" : "Đăng nhập để xem giỏ hàng"}
              >
                <FiShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-black hover:text-gray-600 transition-colors"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative" ref={searchRef}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 focus:outline-none focus:border-black text-gray-700 placeholder-gray-400 text-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                <FiSearch size={16} />
              </button>
              
              {/* Mobile Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg z-50 max-h-60 overflow-y-auto">
                  {isLoadingSuggestions ? (
                    <div className="p-3 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mx-auto"></div>
                      <p className="mt-1 text-xs">Đang tìm kiếm...</p>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="py-1">
                      {suggestions.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSuggestionClick(product)}
                          className="flex items-center p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="w-10 h-10 relative mr-2 flex-shrink-0">
                            <Image
                              src={product.imageUrl || '/placeholder.png'}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                              sizes="40px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium text-gray-900 truncate">
                              {product.name}
                            </h4>
                            <div className="flex items-center mt-0.5">
                              {product.discountPrice ? (
                                <span className="text-xs font-medium text-red-600">
                                  {product.discountPrice.toLocaleString()}₫
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-gray-900">
                                  {product.price.toLocaleString()}₫
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchTerm.length >= 2 ? (
                    <div className="p-3 text-center text-gray-500">
                      <p className="text-xs">Không tìm thấy sản phẩm phù hợp</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <nav className="py-4 space-y-1">
              <Link 
                href="/categories" 
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors text-sm uppercase tracking-wide"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Bộ sưu tập
              </Link>
              <Link 
                href="/product" 
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors text-sm uppercase tracking-wide"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              <Link 
                href="/wishlist" 
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors text-sm uppercase tracking-wide"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Yêu thích
              </Link>
              {user && (
                <>
                  <Link 
                    href="/orders" 
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors text-sm uppercase tracking-wide"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đơn hàng
                  </Link>
                  <Link 
                    href="/profile" 
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors text-sm uppercase tracking-wide"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tài khoản
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;