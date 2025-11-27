'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchAllOrder } from '@/app/services/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Pagination from '@/components/ui/Pagination';
import { FiPackage, FiCalendar, FiEye, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';

interface Order {
  id: number;
  createdAt: string;
  status: string;
  totalAmount?: number;
  orderDetails?: any[];
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'processing':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'completed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'Chờ xử lý';
    case 'processing':
      return 'Đang xử lý';
    case 'completed':
      return 'Hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetchAllOrder();
        setOrders(
          res.data.map((o: any) => ({
            id: o.orderId,
            createdAt: o.orderDate,
            status: o.status,
            totalAmount: o.totalAmount,
            orderDetails: o.orderDetails
          }))
        );
      } catch (err) {
        console.error('❌ Lỗi khi lấy đơn hàng:', err);
        setError('Không thể lấy danh sách đơn hàng 🥲');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewDetails = (orderId: number) => {
    router.push(`/orderdetails/${orderId}`);
  };

  // Tính toán phân trang
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm uppercase tracking-wide">Đang tải đơn hàng</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="bg-white border border-gray-200 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-8">
                <FiPackage className="text-black text-2xl" />
              </div>
              <h2 className="text-xl font-light text-black mb-4 tracking-wider">Có lỗi xảy ra</h2>
              <p className="text-gray-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-black transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-black font-medium">Đơn hàng của tôi</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <FiPackage className="text-black text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-light text-black tracking-wider">Đơn hàng của tôi</h1>
              <p className="text-gray-600 text-sm">Theo dõi và quản lý đơn hàng của bạn</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 hover:border-black transition-colors"
          >
            <FiArrowLeft className="text-gray-600" />
            <span className="text-gray-700 text-sm uppercase tracking-wide">Tiếp tục mua sắm</span>
          </Link>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white border border-gray-200 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-8">
                <FiShoppingBag className="text-black text-2xl" />
              </div>
              <h3 className="text-xl font-light text-black mb-4 tracking-wider">Chưa có đơn hàng nào</h3>
              <p className="text-gray-600 mb-8 text-sm">Bạn chưa mua sản phẩm nào từ LazyShop</p>
              <Link
                href="/product"
                className="inline-flex items-center space-x-2 bg-black text-white px-8 py-3 font-normal text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors"
              >
                <FiShoppingBag className="w-4 h-4" />
                <span>Bắt đầu mua sắm</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {currentOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 hover:border-black transition-colors duration-200"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-lg font-light text-black tracking-wide">
                          Đơn hàng #{order.id}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-medium uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-xs text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="text-gray-400" />
                          <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        {order.totalAmount && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">Tổng Tiền:</span>
                            <span className="font-normal text-gray-800">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(order.totalAmount)}
                            </span>
                          </div>
                        )}
                        {order.orderDetails && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400"></span>
                            <span>{order.orderDetails.length} sản phẩm</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(order.id)}
                      className="flex items-center space-x-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-normal text-sm uppercase tracking-wide"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>Xem chi tiết</span>
                    </button>
                  </div>
                  
                  {/* Order Items Preview */}
                  {order.orderDetails && order.orderDetails.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex -space-x-2">
                          {order.orderDetails.slice(0, 3).map((item: any, index: number) => (
                            <div key={index} className="w-10 h-10 bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                              {item.productVariant?.imageUrl ? (
                                <Image
                                  src={item.productVariant.imageUrl}
                                  alt={item.product?.name || 'Sản phẩm'}
                                  width={40}
                                  height={40}
                                  className="object-cover w-full h-full"
                                />
                              ) : item.product?.imageUrl ? (
                                <Image
                                  src={item.product.imageUrl}
                                  alt={item.product.name || 'Sản phẩm'}
                                  width={40}
                                  height={40}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <span className="text-xs font-medium text-gray-600">📦</span>
                              )}
                            </div>
                          ))}
                          {order.orderDetails.length > 3 && (
                            <div className="w-10 h-10 bg-gray-100 border border-gray-300 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-500">+{order.orderDetails.length - 3}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          {order.orderDetails.length === 1 
                            ? `${order.orderDetails[0].product?.name || 'Sản phẩm'}${order.orderDetails[0].productVariant ? ` (${order.orderDetails[0].productVariant.color?.name} - ${order.orderDetails[0].productVariant.size?.name})` : ''}`
                            : `${order.orderDetails[0].product?.name || 'Sản phẩm'}${order.orderDetails[0].productVariant ? ` (${order.orderDetails[0].productVariant.color?.name} - ${order.orderDetails[0].productVariant.size?.name})` : ''} và ${order.orderDetails.length - 1} sản phẩm khác`
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination và thông tin */}
        {orders.length > 0 && (
          <div className="mt-12">
            {/* Thông tin phân trang */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, orders.length)} trong tổng số {orders.length} đơn hàng
              </div>
              <div className="text-sm text-gray-600">
                Trang {currentPage} / {totalPages}
              </div>
            </div>
            
            {/* Component Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
