'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AddressManager from '@/components/AddressManager';
import { fetchUserById, updateUser, changeUserPassword } from '../services/api';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ username: '', fullName: '', phone: '' });
  const [message, setMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'address'>('profile');
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
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex flex-1 items-center justify-center text-lg text-gray-600">Đang tải thông tin...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="flex flex-1 items-start justify-center py-12 px-4">
        <div className="w-full max-w-4xl bg-white border border-gray-200 p-8">
          <h2 className="text-2xl font-light text-center text-black mb-8 tracking-wider">Thông tin cá nhân</h2>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-6 font-normal text-sm uppercase tracking-wide transition ${
                activeTab === 'profile'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab('address')}
              className={`py-3 px-6 font-normal text-sm uppercase tracking-wide transition ${
                activeTab === 'address'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Quản lý địa chỉ
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' ? (
            <div>
              {message && <p className="text-center text-gray-800 font-medium mb-6 text-sm">{message}</p>}

              {!edit ? (
                <div className="space-y-6">
                  <Field label="Tên đăng nhập" name="username" value={form.username} onChange={() => { }} disabled />
                  <Field label="Họ tên" name="fullName" value={form.fullName} onChange={() => { }} disabled />
                  <Field label="Số điện thoại" name="phone" value={form.phone} onChange={() => { }} disabled />
                  <ActionButton onClick={() => setEdit(true)} primary>Sửa thông tin</ActionButton>
                  <ActionButton onClick={() => setShowChangePassword(!showChangePassword)}>
                    {showChangePassword ? 'Đóng đổi mật khẩu' : 'Đổi mật khẩu'}
                  </ActionButton>
                  <ActionButton onClick={() => router.push('/orders')}>Xem đơn hàng</ActionButton>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-6">
                  <Field label="Tên đăng nhập" name="username" value={form.username} onChange={() => { }} disabled />
                  <Field label="Họ tên" name="fullName" value={form.fullName} onChange={handleChange} required />
                  <Field label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} required />
                  <ActionButton type="submit" primary>Lưu thay đổi</ActionButton>
                  <ActionButton onClick={() => setEdit(false)}>Hủy</ActionButton>
                </form>
              )}

              {showChangePassword && (
                <form onSubmit={handlePasswordChange} className="mt-8 space-y-6 border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-medium text-center text-black">Đổi mật khẩu</h3>
                  <input
                    type="password"
                    name="oldPassword"
                    className="p-3 w-full border border-gray-300 focus:outline-none focus:border-black bg-white text-gray-800"
                    placeholder="Mật khẩu cũ"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    name="newPassword"
                    className="p-3 w-full border border-gray-300 focus:outline-none focus:border-black bg-white text-gray-800"
                    placeholder="Mật khẩu mới"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                  {passwordMsg && <p className="text-center text-gray-800 font-medium text-sm">{passwordMsg}</p>}
                  <ActionButton type="submit" primary>Đổi mật khẩu</ActionButton>
                  <ActionButton onClick={() => setShowChangePassword(false)}>Đóng</ActionButton>
                </form>
              )}
            </div>
          ) : (
            <AddressManager />
          )}
        </div>
        <div className="px-6 mt-8">
          <button
            onClick={() => history.back()}
            className="inline-block bg-white border border-gray-300 hover:border-black text-black font-normal py-2 px-6 transition text-sm uppercase tracking-wide"
          >
            Quay lại
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
      <label className="block text-sm font-medium text-black mb-2 uppercase tracking-wide">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        required={required}
        placeholder={label}
        className="p-3 w-full border border-gray-300 focus:outline-none focus:border-black bg-white text-gray-800 disabled:bg-gray-50"
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
  const base = 'w-full py-3 font-normal transition duration-200 text-sm uppercase tracking-wide';
  const style = primary
    ? 'bg-black text-white hover:bg-gray-800'
    : 'bg-white border border-gray-300 text-black hover:border-black';

  return (
    <button type={type} onClick={onClick} className={`${base} ${style}`}>
      {children}
    </button>
  );
}