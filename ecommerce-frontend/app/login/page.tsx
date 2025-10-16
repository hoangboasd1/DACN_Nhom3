// app/login/page.tsx
'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../services/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await login(username, password);
      // Lưu JWT token vào localStorage hoặc state
      localStorage.setItem("token", response.data.token);

      // Lấy role từ response
      const role = response.data.user?.role;

      // Chuyển hướng theo role
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "nguoidung") {
        router.push("/");
      }
    } catch (error: any) {
      let msg = "Something went wrong";
      if (error.response && typeof error.response.data === "string") {
        msg = error.response.data;
      } else if (error.response && typeof error.response.data === "object") {
        msg = error.response.data.title || error.response.data.message || JSON.stringify(error.response.data);
      }
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
          </form>
        </div>
      </div>
      <br />
      <br />
      <Footer />
    </div>
  );
}
