'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBoxes, FaTags, FaUsers, FaClipboardList, FaChartBar } from "react-icons/fa";

const menuItems = [
  { href: "/admin/categories", icon: <FaTags />, label: "Nhóm sản phẩm" },
  { href: "/admin/products", icon: <FaBoxes />, label: "Sản phẩm" },
  { href: "/admin/users", icon: <FaUsers />, label: "Người dùng" },
  { href: "/admin/orders", icon: <FaClipboardList />, label: "Đơn hàng" },
  { href: "/admin/report", icon: <FaChartBar />, label: "Thống kê báo cáo" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-700">
        <Link href="/admin">
          <h2 className="text-2xl font-bold text-center tracking-wide">🛠️ Admin Panel</h2>
        </Link>
      </div>

      <ul className="flex-1 p-4 space-y-2">
        {menuItems.map(({ href, icon, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="p-4 text-sm text-center text-gray-400 border-t border-gray-700">
        &copy; {new Date().getFullYear()} Hệ thống quản lý
      </div>
    </div>
  );
}