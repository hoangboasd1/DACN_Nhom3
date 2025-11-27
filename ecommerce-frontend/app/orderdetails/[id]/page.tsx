'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchData, confirmPaymentReceived, cancelOrder } from '@/app/services/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  FiPackage, 
  FiCalendar, 
  FiArrowLeft, 
  FiHome, 
  FiTruck, 
  FiCreditCard,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi';
import {border} from "@mui/system";

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Pending':
      return <FiClock className="text-gray-600" />;
    case 'Processing':
      return <FiTruck className="text-gray-600" />;
    case 'Completed':
      return <FiCheckCircle className="text-gray-600" />;
    case 'Cancelled':
      return <FiXCircle className="text-gray-600" />;
    default:
      return <FiAlertCircle className="text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'Processing':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'Completed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'Cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'Chờ xử lý';
    case 'Processing':
      return 'Đang xử lý';
    case 'Completed':
      return 'Hoàn thành';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

const getPaymentStatusText = (status: number) => {
  switch (status) {
    case 0: return 'Chờ xử lý';
    case 1: return 'Đã thanh toán';
    case 2: return 'Thất bại';
    default: return 'Không xác định';
  }
};

const getPaymentStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'bg-gray-100 text-gray-800';
    case 1: return 'bg-gray-100 text-gray-800';
    case 2: return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = rawId ? parseInt(rawId) : null;

  const [order, setOrder] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Không tìm thấy mã đơn hàng.');
      setLoading(false);
      return;
    }

    fetchData(id)
      .then(({ order, payment }) => {
        console.log(' Order data:', order);
        console.log(' Payment data:', payment);
        setOrder(order);
        setPayment(payment);
      })
      .catch((err) => {
        console.error(' Lỗi khi fetch:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirmPayment = async () => {
    if (!payment || !payment.paymentId) {
      alert('Không tìm thấy thông tin thanh toán');
      return;
    }

    const confirmed = window.confirm(
      'Bạn có chắc chắn đã nhận hàng và muốn xác nhận thanh toán không?\n\n' +
      'Sau khi xác nhận, trạng thái thanh toán sẽ được cập nhật thành "Đã thanh toán".'
    );

    if (!confirmed) return;

    setConfirmingPayment(true);
    try {
      await confirmPaymentReceived(payment.paymentId);
      
      // Cập nhật trạng thái payment trong state
      setPayment({
        ...payment,
        status: 1 // Paid status
      });
      
      alert('✅ Đã xác nhận thanh toán thành công!');
    } catch (error: any) {
      console.error('❌ Lỗi khi xác nhận thanh toán:', error);
      alert('❌ Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại.');
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!id) {
      alert('Không tìm thấy mã đơn hàng');
      return;
    }

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn hủy đơn hàng này không?\n\n' +
      'Sau khi hủy, đơn hàng sẽ không thể khôi phục và tồn kho sẽ được hoàn lại.'
    );

    if (!confirmed) return;

    setCancellingOrder(true);
    try {
      await cancelOrder(id);
      
      // Cập nhật trạng thái order và payment trong state
      setOrder({
        ...order,
        status: 'Cancelled'
      });
      
      // Cập nhật trạng thái thanh toán thành Failed (2)
      if (payment) {
        setPayment({
          ...payment,
          status: 2 // Failed status
        });
      }
      
      alert('Đã hủy đơn hàng thành công! Trạng thái thanh toán đã được cập nhật thành "Thất bại".');
    } catch (error: any) {
      console.error(' Lỗi khi hủy đơn hàng:', error);
      alert(' Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại.');
    } finally {
      setCancellingOrder(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm uppercase tracking-wide">Đang tải chi tiết đơn hàng</p>
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

  if (!order) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="bg-white border border-gray-200 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-8">
                <FiPackage className="text-black text-2xl" />
              </div>
              <h2 className="text-xl font-light text-black mb-4 tracking-wider">Đơn hàng không tồn tại</h2>
              <p className="text-gray-600 text-sm">Không tìm thấy đơn hàng với mã này</p>
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
          <Link href="/orders" className="hover:text-black transition-colors">
            Đơn hàng
          </Link>
          <span>/</span>
          <span className="text-black font-medium">Chi tiết đơn hàng #{order.orderId}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white flex items-center justify-center">
              <FiPackage className="text-black text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-light text-black tracking-wider">Chi tiết đơn hàng</h1>
              <p className="text-gray-600 text-sm">Mã đơn hàng: #{order.orderId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/orders"
              className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 hover:border-black transition-colors"
            >
              <FiArrowLeft className="text-gray-600" />
              <span className="text-gray-700 text-sm uppercase tracking-wide">Quay lại</span>
            </Link>
            {/* Nút hủy đơn hàng - chỉ hiển thị khi đơn hàng chưa hoàn thành, chưa hủy và chưa thanh toán */}
            {order.status !== 'Completed' && order.status !== 'Cancelled' && payment?.status !== 1 && (
              <button
                onClick={handleCancelOrder}
                disabled={cancellingOrder}
                className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 text-black hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-normal text-sm uppercase tracking-wide"
              >
                {cancellingOrder ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    <span>Đang hủy...</span>
                  </>
                ) : (
                  <>
                    <FiXCircle className="w-4 h-4" />
                    <span>Hủy đơn hàng</span>
                  </>
                )}
              </button>
            )}
            <Link
              href="/"
              className="flex items-center space-x-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-normal text-sm uppercase tracking-wide"
            >
              <FiHome className="w-4 h-4" />
              <span>Trang chủ</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status */}
            <div className="bg-white border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-black tracking-wider">Trạng thái đơn hàng</h2>
                <div className={`flex items-center space-x-2 px-3 py-1 border ${getStatusColor(order.status || 'Pending')}`}>
                  {getStatusIcon(order.status || 'Pending')}
                  <span className="font-normal text-xs uppercase tracking-wide">{getStatusText(order.status || 'Pending')}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <FiCalendar className="text-gray-400" />
                  <span><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiPackage className="text-gray-400" />
                  <span><strong>Số sản phẩm:</strong> {order.orderDetails?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white border border-gray-200">
              <div className="p-8 border-b border-gray-200">
                <h2 className="text-xl font-light text-black tracking-wider">Danh sách sản phẩm</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-normal text-gray-900 text-xs uppercase tracking-wide">Sản phẩm</th>
                      <th className="text-center p-4 font-normal text-gray-900 text-xs uppercase tracking-wide">Số lượng</th>
                      <th className="text-right p-4 font-normal text-gray-900 text-xs uppercase tracking-wide">Giá</th>
                      <th className="text-right p-4 font-normal text-gray-900 text-xs uppercase tracking-wide">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderDetails?.map((item: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 flex items-center justify-center overflow-hidden">
                              {item.productVariant?.imageUrl ? (
                                <Image
                                  src={item.productVariant.imageUrl}
                                  alt={item.product?.name || 'Sản phẩm'}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              ) : item.product?.imageUrl ? (
                                <Image
                                  src={item.product.imageUrl}
                                  alt={item.product.name || 'Sản phẩm'}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <span className="text-gray-500">📦</span>
                              )}
                            </div>
                            <div>
                              <div className="font-light text-gray-900 text-sm">{item.product?.name || 'Sản phẩm'}</div>
                              {item.productVariant && (
                                <div className="text-xs text-gray-600">
                                  <div className="flex items-center space-x-2">
                                    {item.productVariant.color?.hexCode && (
                                      <div 
                                        className="w-3 h-3 rounded-full border border-gray-300"
                                        style={{ backgroundColor: item.productVariant.color.hexCode }}
                                        title={item.productVariant.color.name}
                                      />
                                    )}
                                    <span>{item.productVariant.color?.name} - {item.productVariant.size?.name}</span>
                                  </div>
                                  {item.productVariant.sku && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      SKU: {item.productVariant.sku}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="text-xs text-gray-500">
                                {item.product?.material && `Chất liệu: ${item.product.material}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center p-4">
                          <span className="bg-gray-100 px-2 py-1 text-xs font-normal">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="text-right p-4 font-light text-gray-900 text-sm">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(
                            item.productVariant 
                              ? (item.product?.price || 0) + (item.productVariant.priceAdjustment || 0)
                              : (item.product?.price || 0)
                          )}
                        </td>
                        <td className="text-right p-4 font-light text-gray-900 text-sm">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(
                            (item.productVariant 
                              ? (item.product?.price || 0) + (item.productVariant.priceAdjustment || 0)
                              : (item.product?.price || 0)
                            ) * item.quantity
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-white border border-gray-200 p-8">
              <h3 className="text-lg font-light text-black mb-6 tracking-wider">Tóm tắt đơn hàng</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 uppercase tracking-wide">Tạm tính:</span>
                  <span className="text-gray-900">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(order.subtotal || order.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 uppercase tracking-wide">Phí vận chuyển:</span>
                  <span className="text-gray-900">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(payment.amount - (order.subtotal || order.totalAmount))}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-base font-light">
                    <span className="text-gray-900">Tổng cộng:</span>
                    <span className="text-black">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(payment.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {payment && (
              <div className="bg-white border border-gray-200 p-8">
                <div className="flex items-center space-x-2 mb-6">
                  <FiCreditCard className="text-gray-600" />
                  <h3 className="text-lg font-light text-black tracking-wider">Thông tin thanh toán</h3>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 uppercase tracking-wide">Phương thức:</span>
                    <span className="text-gray-900">{payment.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 uppercase tracking-wide">Số tiền:</span>
                    <span className="text-gray-900">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(payment.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 uppercase tracking-wide">Trạng thái:</span>
                    <span className={`px-2 py-1 text-xs font-normal uppercase tracking-wide border border-gray-200 ${getPaymentStatusColor(payment.status)}`}>
                      {getPaymentStatusText(payment.status)}
                    </span>
                  </div>
                  {payment.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 uppercase tracking-wide">Mã giao dịch:</span>
                      <span className="text-gray-900 font-mono text-xs">{payment.transactionId}</span>
                    </div>
                  )}
                  {payment.paymentGateway && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 uppercase tracking-wide">Cổng thanh toán:</span>
                      <span className="text-gray-900">{payment.paymentGateway}</span>
                    </div>
                  )}
                  
                  {/* Nút xác nhận đã nhận hàng cho COD - chỉ hiển thị khi đơn hàng chưa hủy */}
                  {(payment.paymentMethod?.toLowerCase() === 'cod') && payment.status === 0 && order.status !== 'Cancelled' && (
                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <div className="bg-gray-50 border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <FiPackage className="text-gray-600" />
                          <span className="text-sm font-medium text-gray-800 uppercase tracking-wide">Xác nhận đã nhận hàng</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-4">
                          Bạn đã nhận hàng và thanh toán cho shipper chưa? Nhấn nút bên dưới để xác nhận.
                        </p>
                        <button
                          onClick={handleConfirmPayment}
                          disabled={confirmingPayment}
                          className="w-full bg-black text-white px-4 py-3 font-normal text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {confirmingPayment ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Đang xác nhận...</span>
                            </>
                          ) : (
                            <>
                              <FiCheckCircle className="w-4 h-4" />
                              <span>Đã nhận hàng & Thanh toán</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-8 border border-gray-300 rounded-lg">
              <h3 className="text-lg font-light  mb-4 tracking-wider">Cần hỗ trợ?</h3>
              <p className="text-sm text-black-300 mb-6">
                Nếu bạn có thắc mắc về đơn hàng này, hãy liên hệ với chúng tôi.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-black-300">Liên hệ: 0328162969</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-black-300">Email: </span>
                  <span className="text-black-300">support@lazyshop.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}