'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { registerUser } from "../services/api";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        username: "",
        password: "",
        fullName: "",
        phone: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccess(false);

        try {
            await registerUser(form);
            setSuccess(true);
            setTimeout(() => router.push("/login"), 1500);
        } catch (err: any) {
            setErrorMessage(err?.response?.data?.message || "Đăng ký thất bại");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-blue-50">
            <Header />
            <br />
            <div className="flex flex-1 items-center justify-center">
                <div className="max-w-sm w-full p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-2xl font-bold text-center mb-6">Đăng ký</h2>
                    <form onSubmit={handleRegister}>
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                name="username"
                                className="p-2 w-full border border-gray-400 rounded bg-white text-gray-800"
                                placeholder="Nhập username"
                                value={form.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                            <input
                                type="password"
                                name="password"
                                className="p-2 w-full border border-gray-400 rounded bg-white text-gray-800"
                                placeholder="Nhập mật khẩu"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Họ tên</label>
                            <input
                                type="text"
                                name="fullName"
                                className="p-2 w-full border border-gray-400 rounded bg-white text-gray-800"
                                placeholder="Nhập họ tên"
                                value={form.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                className="p-2 w-full border border-gray-400 rounded bg-white text-gray-800"
                                placeholder="Nhập số điện thoại"
                                value={form.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
                        {success && <p className="text-green-600 text-sm">Đăng ký thành công! Đang chuyển hướng...</p>}
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 mt-4 rounded-md hover:bg-blue-700">
                            Đăng ký
                        </button>
                        <p className="mt-4 text-sm text-center">
                            Đã có tài khoản? <a href="/login" className="text-blue-600 hover:underline">Đăng nhập</a>
                        </p>
                    </form>
                </div>
            </div>
            <br />
            <Footer />
        </div>
    );
}