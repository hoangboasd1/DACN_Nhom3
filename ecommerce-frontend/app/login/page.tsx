// app/login/page.tsx
'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "../services/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Kiểm tra xem user đã đăng nhập chưa
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          console.log('User đã đăng nhập, redirecting...', userData);
          
          // Redirect dựa trên role
          if (userData.role === 'Admin' || userData.role === 'admin') {
            router.replace('/admin');
          } else {
            router.replace('/');
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    };

    // Kiểm tra ngay khi component mount
    checkAuth();

    // Lắng nghe sự kiện storage để kiểm tra khi có thay đổi
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue) {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Set flag to prevent auth validation during login
      sessionStorage.setItem('isLoggingIn', 'true');
      
      const response = await login(username, password);
      console.log("Login response:", response.data); // Debug log
      
      // Lấy role từ response trước
      const role = response.data.user?.role;
      console.log("User role:", role); // Debug log

      // Determine redirect path first
      let redirectPath = "/";
      if (role === "Admin" || role === "admin") {
        redirectPath = "/admin";
      } else if (role === "nguoidung") {
        redirectPath = "/";
      }

      // Save to localStorage after determining redirect path
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Trigger events to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'token',
        newValue: response.data.token,
        oldValue: null
      }));
      
      // Also trigger a custom login event for immediate updates
      window.dispatchEvent(new CustomEvent('userLogin', {
        detail: { 
          token: response.data.token,
          user: response.data.user
        }
      }));

      // Clear login flag
      sessionStorage.removeItem('isLoggingIn');

      // Use replace instead of push to avoid back button issues
      // Add a small delay to ensure localStorage is set and components updated
      setTimeout(() => {
        router.replace(redirectPath);
      }, 150);
      
    } catch (error: any) {
      // Clear login flag on error
      sessionStorage.removeItem('isLoggingIn');
      
      // Sử dụng userMessage từ Axios interceptor
      const msg = error.userMessage || "Đã xảy ra lỗi khi đăng nhập";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      <Header />
      <br />
      <br />
      <div className="flex flex-1 items-center justify-center">
        <div className="max-w-sm w-full p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="username"
                id="username"
                className="p-2 w-full border border-gray-400 rounded bg-white text-gray-800"
                placeholder="Nhập username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <input
                type="password"
                id="password"
                className="p-2 w-full border border-gray-400 rounded bg-white text-gray-800"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            <button type="submit" className="w-full bg-blue-600 text-white py-2 mt-4 rounded-md hover:bg-blue-700">
              Đăng nhập
            </button>
            <p className="mt-4 text-sm text-center">
              Chưa có tài khoản? <a href="/register" className="text-blue-600 hover:underline">Đăng ký ngay</a>
            </p>
            <p className="mt-2 text-sm text-center">
              <a href="/admin-login" className="text-purple-600 hover:underline font-medium">Đăng nhập Admin</a>
            </p>
          </form>
        </div>
      </div>
      <br />
      <br />
      <Footer />
    </div>
  );
}
