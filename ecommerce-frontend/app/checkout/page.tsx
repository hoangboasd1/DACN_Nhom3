'use client';

import { useEffect, useState } from 'react';
import { submitOrder, createPayment, fetchCurrentUser, fetchUserAddresses } from '@/app/services/api';
import { calculateDistance, calculateShippingFee } from '@/services/distanceService';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard, FiTruck, FiCheck, FiLoader } from 'react-icons/fi';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  note: string;
  paymentMethod: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, total, loading: loadingCart, error: errorCart, clearCart } = useCart();
  
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [loadingShipping, setLoadingShipping] = useState(false);

  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    note: '',
    paymentMethod: 'cod',
  });

  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    // Cart đã được load từ CartContext, không cần load lại
  }, []);

  // Load thông tin user và địa chỉ mặc định
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setLoadingUserInfo(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setLoadingUserInfo(false);
          return;
        }

        const userRes = await fetchCurrentUser();
        setUserInfo(userRes.data);
        
        try {
          const addressesRes = await fetchUserAddresses();
          setUserAddresses(addressesRes.data);
          
          const defaultAddr = addressesRes.data.find((addr: any) => addr.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setForm(prev => ({
              ...prev,
              address: defaultAddr.addressText
            }));
            setTimeout(async () => {
              await calculateDistanceAndFee(defaultAddr.addressText);
            }, 100);
          } else if (addressesRes.data.length > 0) {
            const firstAddr = addressesRes.data[0];
            setSelectedAddressId(firstAddr.id);
            setForm(prev => ({
              ...prev,
              address: firstAddr.addressText
            }));
            setTimeout(async () => {
              await calculateDistanceAndFee(firstAddr.addressText);
            }, 100);
          }
        } catch (addressError) {
          console.log('Không có địa chỉ hoặc chưa đăng nhập');
        }

        setForm(prev => ({
          ...prev,
          fullName: userRes.data.fullName || '',
          email: '',
          phone: userRes.data.phone || ''
        }));

      } catch (error) {
        console.log('Không thể load thông tin user hoặc chưa đăng nhập');
      } finally {
        setLoadingUserInfo(false);
      }
    };

    loadUserInfo();
  }, []);

  useEffect(() => {
    if (form.address && form.address.trim()) {
      calculateDistanceAndFee(form.address);
    }
  }, [form.address]);

  const validate = () => {
    const errors: Partial<FormData> = {};
    
    if (!form.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên';
    }
    
    if (!form.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!form.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^\d{9,15}$/.test(form.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!form.address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ giao hàng';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateDistanceAndFee = async (address: string) => {
    try {
      setLoadingShipping(true);
      const distanceKm = await calculateDistance(address);
      setDistance(distanceKm);
      const fee = await calculateShippingFee(address);
      setShippingFee(fee);
      return distanceKm;
    } catch (error) {
      console.error('Lỗi khi tính khoảng cách:', error);
      setDistance(0);
      setShippingFee(20000);
      return 0;
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleAddressChange = (addressId: number) => {
    const selectedAddr = userAddresses.find(addr => addr.id === addressId);
    if (selectedAddr) {
      setSelectedAddressId(addressId);
      setForm(prev => ({
        ...prev,
        address: selectedAddr.addressText
      }));
      calculateDistanceAndFee(selectedAddr.addressText);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    if (cartItems.length === 0) {
      alert('Giỏ hàng đang trống, không thể thanh toán.');
      return;
    }

    setSubmitting(true);
    try {
      const orderRes = await submitOrder(form.address, form.note);
      const orderId = orderRes.data?.orderId;
      
      if (!orderId) {
        alert('Không lấy được ID đơn hàng.');
        return;
      }
      
      const totalAmount = total + shippingFee;
      const payload = {
        orderId: orderId,
        paymentMethod: form.paymentMethod,
        amount: totalAmount,
        paymentGateway: form.paymentMethod !== 'cod' ? form.paymentMethod.toUpperCase() : undefined,
      };
      
      await createPayment(payload);
      setOrderSuccess(true);
      clearCart(); // Xóa giỏ hàng sau khi đặt hàng thành công
      router.push(`/orderdetails/${orderId}`);
    } catch (err: any) {
      console.error("Lỗi trong quá trình đặt hàng:", err);
      
      if (err.response && err.response.data === 'Giỏ hàng trống.') {
        alert('Giỏ hàng đang trống, không thể thanh toán.');
      } else if (err.response?.status === 401) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        router.push('/login');
      } else {
        alert(`Lỗi khi gửi đơn hàng: ${err.response?.data || err.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCart) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (errorCart || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h2>
              <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
              <Link 
                href="/categories"
                className="inline-block bg-black text-white px-6 py-3 font-normal text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-black transition-colors">Giỏ hàng</Link>
            <span>/</span>
            <span className="text-black font-medium">Thanh toán</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-black tracking-wider mb-2">Thanh toán đơn hàng</h1>
          <p className="text-gray-600">Hoàn tất đơn hàng của bạn một cách an toàn và nhanh chóng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form thông tin */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Thông tin cá nhân */}
              <div className="border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-black flex items-center justify-center mr-3">
                    <FiUser className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-light text-black tracking-wider">Thông tin cá nhân</h2>
                  {loadingUserInfo && (
                      <div className="ml-auto flex items-center text-gray-600">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin mr-2"></div>
                        <span className="text-sm">Đang tải...</span>
                      </div>
                  )}
                </div>

                {userInfo && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FiCheck className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-green-700 font-medium">Đã tự động điền thông tin từ tài khoản</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const defaultAddr = userAddresses.find(addr => addr.isDefault);
                          const selectedAddr = defaultAddr || userAddresses[0];
                          setForm(prev => ({
                            ...prev,
                            fullName: userInfo.fullName || '',
                            email: '',
                            phone: userInfo.phone || '',
                            address: selectedAddr ? selectedAddr.addressText : ''
                          }));
                          if (selectedAddr) {
                            setSelectedAddressId(selectedAddr.id);
                          }
                        }}
                        className="text-xs bg-green-100 hover:bg-green-200 px-3 py-1 rounded-full transition-colors"
                      >
                        Làm mới
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="inline w-4 h-4 mr-1" />
                      Họ và tên *
                    </label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên"
                      className={`w-full px-4 py-3 border rounded-lg focus:border-black transition-colors ${
                        formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMail className="inline w-4 h-4 mr-1" />
                      Email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Nhập email"
                      className={`w-full px-4 py-3 border rounded-lg focus:border-black transition-colors ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiPhone className="inline w-4 h-4 mr-1" />
                    Số điện thoại *
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className={`w-full px-4 py-3 border rounded-lg focus:border-black transition-colors ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Địa chỉ giao hàng */}
              <div className="border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-black flex items-center justify-center mr-3">
                    <FiMapPin className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-light text-black tracking-wider">Địa chỉ giao hàng</h2>
                </div>

                <div>
                  <label className="block text-sm font-light text-black uppercase tracking-wide mb-2">
                    <FiMapPin className="inline w-4 h-4 mr-1" />
                    Địa chỉ giao hàng *
                  </label>
                  {userAddresses.length > 0 ? (
                    <select
                      value={selectedAddressId || ''}
                      onChange={(e) => handleAddressChange(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black transition-colors"
                    >
                      <option value="">Chọn địa chỉ giao hàng</option>
                      {userAddresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.addressText} {addr.isDefault ? '(Mặc định)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Nhập địa chỉ giao hàng"
                      className={`w-full px-4 py-3 border rounded-lg focus:border-black transition-colors ${
                        formErrors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                  {formErrors.address && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                  )}
                  
                  {/* Thông tin khoảng cách và phí ship */}
                  {form.address && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FiMapPin className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-gray-600">Khoảng cách:</span>
                          </div>
                          <div className="flex items-center">
                            {loadingShipping ? (
                              <div className="flex items-center text-gray-600">
                                <div className="w-3 h-3 border-2 border-gray-300 border-t-black rounded-full animate-spin mr-1"></div>
                                <span className="text-sm">Đang tính...</span>
                              </div>
                            ) : (
                              <span className="font-light text-black">
                                {distance > 0 ? `${distance.toFixed(1)} km` : 'Chưa tính'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FiTruck className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-gray-600 ">Phí ship:</span>
                          </div>
                          <div className="flex items-center">
                            {loadingShipping ? (
                              <div className="flex items-center text-gray-600">
                                <div className="w-3 h-3 border-2 border-gray-300 border-t-black rounded-full animate-spin mr-1"></div>
                                <span className="text-sm">Đang tính...</span>
                              </div>
                            ) : (
                              <span className="font-light text-black">
                                {shippingFee > 0 ? `${shippingFee.toLocaleString()} đ` : 'Chưa tính'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (tuỳ chọn)
                  </label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Ghi chú cho đơn hàng..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-black flex items-center justify-center mr-3">
                    <FiCreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-light text-black tracking-wider">Phương thức thanh toán</h2>
                </div>

                <div className="space-y-3">
                  {[
                    { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
                    { value: 'momo', label: 'Ví điện tử MoMo'},
                  ].map((method) => (
                    <label key={method.value} className="flex items-center p-4 border border-gray-200 hover:border-black cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={form.paymentMethod === method.value}
                        onChange={handleChange}
                        className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                      />
                      <span className="ml-2 text-black font-light">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white font-normal text-sm uppercase tracking-wide py-4 px-6 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  'Xác nhận đặt hàng'
                )}
              </button>
            </form>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-light text-black tracking-wider mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={`checkout-item-${index}-${item.productId}-${item.productVariantId || 'default'}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-light text-black truncate tracking-wide">{item.product.name}</h3>
                      {item.productVariant && (
                        <p className="text-sm text-gray-600">
                          {item.productVariant.color?.name} - {item.productVariant.size?.name}
                          {item.productVariant.sku && (
                            <span className="ml-2 text-xs text-gray-500">({item.productVariant.sku})</span>
                          )}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                      <p className="text-black font-light">
                        {(item.product.price * item.quantity).toLocaleString()} đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{total.toLocaleString()} đ</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Phí ship:</span>
                  <div className="flex items-center">
                    {loadingShipping ? (
                      <div className="flex items-center text-gray-600">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin mr-1"></div>
                        <span className="text-sm">Đang tính...</span>
                      </div>
                    ) : (
                      <span>{shippingFee.toLocaleString()} đ</span>
                    )}
                  </div>
                </div>
                
                {distance > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Khoảng cách:</span>
                    <span>{distance.toFixed(1)} km</span>
                  </div>
                )}
                
                <div className="border-t border-gray-300 pt-3 flex justify-between text-xl font-light text-black">
                  <span>Tổng cộng:</span>
                  <span className="text-black">{(total + shippingFee).toLocaleString()} đ</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-100 border border-gray-200">
                <div className="flex items-center text-gray-700">
                  <FiCheck className="w-5 h-5 mr-2" />
                  <span className="text-sm font-light">Đảm bảo an toàn và bảo mật</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Thông tin của bạn được mã hóa và bảo vệ an toàn
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}