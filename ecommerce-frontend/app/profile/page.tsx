'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { fetchUserById, updateUser, changeUserPassword } from '../services/api';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ username: '', fullName: '', phone: '' });
  const [message, setMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const router = useRouter();

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.userId || payload.sub;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) return;
    fetchUserById(userId)
      .then((res) => {
        setUser(res.data);
        setForm({
          username: res.data.username,
          fullName: res.data.fullName,
          phone: res.data.phone || '',
        });
      })
      .catch(() => setMessage('Không thể tải thông tin người dùng 😢'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await updateUser(user.id, {
        fullName: form.fullName,
        phone: form.phone,
      });
      setUser({ ...user, ...form });
      setEdit(false);
      setMessage('✅ Cập nhật thành công!');
    } catch {
      setMessage('❌ Cập nhật thất bại!');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    try {
      await changeUserPassword(user.id, passwordForm);
      setPasswordMsg('✅ Đổi mật khẩu thành công!');
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } catch {
      setPasswordMsg('❌ Đổi mật khẩu thất bại!');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-blue-50">
        <Header />
        <div className="flex flex-1 items-center justify-center text-lg text-gray-600">Đang tải thông tin...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      <Header />
      <div className="flex flex-1 items-start justify-center py-12 px-4">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-md p-8">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">👤 Xem thông tin người dùng</h2>

          {message && <p className="text-center text-green-600 font-medium mb-4">{message}</p>}

          {!edit ? (
            <div className="space-y-4">
              <Field label="Tên đăng nhập" name="username" value={form.username} onChange={() => { }} disabled />
              <Field label="Họ tên" name="fullName" value={form.fullName} onChange={() => { }} disabled />
              <Field label="Số điện thoại" name="phone" value={form.phone} onChange={() => { }} disabled />
              <ActionButton onClick={() => setEdit(true)} primary>✏️ Sửa thông tin người dùng</ActionButton>
              <ActionButton onClick={() => setShowChangePassword(!showChangePassword)}>
                🔒 {showChangePassword ? 'Đóng đổi mật khẩu' : 'Đổi mật khẩu'}
              </ActionButton>
              <ActionButton onClick={() => router.push('/orders')}>🛒 Xem đơn hàng</ActionButton>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              <Field label="Tên đăng nhập" name="username" value={form.username} onChange={() => { }} disabled />
              <Field label="Họ tên" name="fullName" value={form.fullName} onChange={handleChange} required />
              <Field label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} required />
              <ActionButton type="submit" primary>💾 Lưu thay đổi</ActionButton>
              <ActionButton onClick={() => setEdit(false)}>❌ Hủy</ActionButton>
            </form>
          )}

          {showChangePassword && (
            <form onSubmit={handlePasswordChange} className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold text-center text-gray-700">🔐 Đổi mật khẩu</h3>
              <input
                type="password"
                name="oldPassword"
                className="p-2 w-full border border-gray-400 rounded bg-white text-gray-800"
                placeholder="Mật khẩu cũ"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                required
              />
              <input
                type="password"
                name="newPassword"
                className="p-2 w-full border border-gray-400 rounded bg-white text-gray-800"
                placeholder="Mật khẩu mới"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
              {passwordMsg && <p className="text-center text-green-600 font-medium">{passwordMsg}</p>}
              <ActionButton type="submit" primary>✅ Đổi mật khẩu</ActionButton>
              <ActionButton onClick={() => setShowChangePassword(false)}>❎ Đóng</ActionButton>
            </form>
          )}
        </div>
        <div className="px-6 mt-4">
          <button
            onClick={() => history.back()}
            className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
          >
            ⬅️ Quay lại
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// 🧩 Field input component
type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
};

function Field({ label, name, value, onChange, disabled = false, required = false }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        required={required}
        placeholder={label}
        className="p-2 w-full border border-gray-400 rounded bg-white text-gray-800"
      />
    </div>
  );
}

// 🧩 Action button component
type ActionButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  primary?: boolean;
};

function ActionButton({ children, onClick, type = 'button', primary = false }: ActionButtonProps) {
  const base = 'w-full py-2 rounded font-medium transition duration-200';
  const style = primary
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-200 text-gray-700 hover:bg-gray-300';

  return (
    <button type={type} onClick={onClick} className={`${base} ${style}`}>
      {children}
    </button>
  );
}