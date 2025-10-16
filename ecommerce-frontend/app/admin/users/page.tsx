'use client';

import React, { useEffect, useState } from 'react';
import { fetchAllUsers, deleteUser } from '@/app/services/api';

export default function UserPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  //Lấy danh sách user
  const loadUsers = async () => {
    try {
      const res = await fetchAllUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  //Xoá user
  const handleDelete = async (id: number) => {
    const confirm = window.confirm("Bạn có chắc muốn xoá người dùng này?");
    if (!confirm) return;

    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert("Không thể xoá người dùng!");
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">👥 Quản lý người dùng</h1>

      {loading ? (
        <p>⏳ Đang tải danh sách...</p>
      ) : users.length === 0 ? (
        <p>😢 Không có người dùng nào.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left border-b">ID</th>
              <th className="py-2 px-4 text-left border-b">Tên đăng nhập</th>
              <th className="py-2 px-4 text-left border-b">Họ tên</th>
              <th className="py-2 px-4 text-left border-b">Vai trò</th>
              <th className="py-2 px-4 text-left border-b">Trạng thái</th>
              <th className="py-2 px-4 text-left border-b">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{user.id}</td>
                <td className="py-2 px-4 border-b">{user.username}</td>
                <td className="py-2 px-4 border-b">{user.fullName}</td>
                <td className="py-2 px-4 border-b">{user.role}</td>
                <td className="py-2 px-4 border-b">
                  {user.isActive ? "✅ Hoạt động" : "❌ Bị khoá"}
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(user.id)}
                  >
                    🗑️ Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
