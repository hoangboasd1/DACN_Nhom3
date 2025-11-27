'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { FiMail, FiSend } from 'react-icons/fi';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [currentYear, setCurrentYear] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log('Subscribe:', email);
    setEmail('');
  };

  const footerLinks = {
    company: [
      { name: 'Về chúng tôi', href: '/about' },
      { name: 'Liên hệ', href: '/contact' },
      { name: 'Tuyển dụng', href: '/careers' },
      { name: 'Tin tức', href: '/blog' },
    ],
    help: [
      { name: 'Câu hỏi thường gặp', href: '/faqs' },
      { name: 'Thông tin vận chuyển', href: '/shipping' },
      { name: 'Đổi trả hàng', href: '/returns' },
      { name: 'Trạng thái đơn hàng', href: '/order-status' },
    ],
    legal: [
      { name: 'Điều khoản sử dụng', href: '/terms' },
      { name: 'Chính sách bảo mật', href: '/privacy' },
      { name: 'Chính sách cookie', href: '/cookie' },
    ],
  };

  const socialLinks = [
    { icon: FaFacebookF, href: 'https://facebook.com', color: 'hover:text-blue-600' },
    { icon: FaTwitter, href: 'https://twitter.com', color: 'hover:text-blue-400' },
    { icon: FaInstagram, href: 'https://instagram.com', color: 'hover:text-pink-500' },
    { icon: FaLinkedinIn, href: 'https://linkedin.com', color: 'hover:text-blue-700' },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <h3 className="text-2xl font-light text-black tracking-wider mb-4">LazyShop</h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                  Cửa hàng thời trang hàng đầu Việt Nam với những sản phẩm chất lượng cao và giá cả hợp lý.
                </p>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="text-gray-400" />
                  <span>Số 298 Đường Cầu Diễn, Phường Tây Tựu, Thành phố Hà Nội</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-gray-400" />
                  <span>0328162969</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-gray-400" />
                  <span>support@lazyshop.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaClock className="text-gray-400" />
                  <span>8:00 - 22:00 (T2-CN)</span>
                </div>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-sm font-medium text-black mb-6 uppercase tracking-wide">Công ty</h3>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-600 hover:text-black transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help Links */}
            <div>
              <h3 className="text-sm font-medium text-black mb-6 uppercase tracking-wide">Hỗ trợ</h3>
              <ul className="space-y-4">
                {footerLinks.help.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-600 hover:text-black transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-sm font-medium text-black mb-6 uppercase tracking-wide">Đăng ký nhận tin</h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Đăng ký để nhận thông tin về sản phẩm mới, khuyến mãi đặc biệt và tin tức thời trang!
              </p>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 focus:outline-none focus:border-black text-sm"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 hover:bg-gray-800 transition-colors"
                  >
                    <FiSend size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Chúng tôi cam kết không spam và bảo vệ thông tin cá nhân của bạn.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="py-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <span className="text-gray-600 text-sm">Theo dõi chúng tôi:</span>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-black transition-colors"
                      title={`Theo dõi trên ${Icon.name}`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="text-gray-600 text-sm">
              © {currentYear} LazyShop.
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="py-6 border-t border-gray-200">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            {footerLinks.legal.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="hover:text-black transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="py-8 border-t border-gray-200">
          <div className="text-center">
            <h4 className="text-sm font-medium text-black mb-4 uppercase tracking-wide">Phương thức thanh toán</h4>
            <div className="flex justify-center items-center space-x-6 text-gray-400">
              <div className="w-16 h-10 bg-gray-100 flex items-center justify-center text-xs font-medium tracking-wide">VISA</div>
              <div className="w-16 h-10 bg-gray-100 flex items-center justify-center text-xs font-medium tracking-wide">MC</div>
              <div className="w-16 h-10 bg-gray-100 flex items-center justify-center text-xs font-medium tracking-wide">ATM</div>
              <div className="w-16 h-10 bg-gray-100 flex items-center justify-center text-xs font-medium tracking-wide">COD</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;