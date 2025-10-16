'use client';
import { logout } from '@/app/services/api';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const confirmLogout = window.confirm('Bạn có chắc muốn đăng xuất và quay về Trang chủ không?');
    if (confirmLogout) {
      logout();
      router.push('/'); // Điều hướng về trang chủ
    }
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-extrabold tracking-wide text-blue-400">
          🛒 LazyShop
        </div>

        {/* Links */}
        <div className="flex items-center space-x-6 text-sm font-medium">
          <a
            href="/"
            onClick={handleHomeClick} // ✅ xử lý click
            className="hover:text-blue-400 transition duration-200 cursor-pointer"
          >
            Trang chủ
          </a>
        </div>
      </div>
    </nav>
  );
}
