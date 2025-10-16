'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi';
import { fetchCurrentUser, logout, fetchCart } from '@/app/services/api';


const Header = () => {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetchCurrentUser();
        setUser(response.data);
      } catch {
        setUser(null);
      }
    };

    const loadCart = async () => {
      try {
        const res = await fetchCart();
        const total = res.data.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    loadUser();
    loadCart();
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFB629]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            LazyShop
          </Link>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-label="Tìm kiếm sản phẩm"
              />
              <button
                type="submit"
                aria-label="Tìm kiếm"
                title="Tìm kiếm"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <FiSearch />
              </button>
            </div>
          </form>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/categories" className="text-gray-900 hover:text-gray-700 font-medium">
              Danh mục
            </Link>
            <Link href="/product" className="text-gray-900 hover:text-gray-700 font-medium">
              Sản phẩm
            </Link>
          </nav>

          {/* Icons & User */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/profile">
                  <span className="text-gray-900 font-medium px-5">
                    Hello, {user.username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold bg-red-50 text-red-600 border border-red-200 rounded-full shadow-sm hover:bg-red-100 hover:text-white hover:bg-red-500 transition-colors duration-200"
                  title="Đăng xuất"
                >
                  <FiLogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="p-2 text-gray-900 hover:bg-gray-900/10 rounded-full">
                <FiUser size={20} />
              </Link>
            )}
            <Link href="/cart" className="relative group ml-4">
              <button
                className="flex items-center justify-center w-11 h-11 rounded-full bg-white shadow hover:bg-yellow-200 transition-colors duration-200 border border-yellow-300"
                title="Giỏ hàng"
              >
                <FiShoppingCart size={22} className="text-red-600 group-hover:text-yellow-800 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;