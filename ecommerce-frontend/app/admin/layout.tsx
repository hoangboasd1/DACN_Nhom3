import React from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Phần nội dung bên phải */}
      <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
        <Navbar />
        <main className="p-4 flex-1">{children}</main>
      </div>
    </div>
  );
}