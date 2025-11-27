import axios from 'axios';

export const API = axios.create({
  baseURL: "http://localhost:5091/api"
})

// Thêm response interceptor để xử lý lỗi một cách thân thiện
API.interceptors.response.use(
  (response) => {
    // Trả về response thành công
    return response;
  },
  (error) => {
    // Xử lý lỗi một cách thân thiện
    if (error.response) {
      // Server trả về response với status code lỗi
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - có thể là sai thông tin đăng nhập hoặc tài khoản bị khóa
        if (data && data.message) {
          error.userMessage = data.message;
        } else {
          error.userMessage = "Tên đăng nhập hoặc mật khẩu không đúng";
        }
      } else if (status === 403) {
        error.userMessage = "Bạn không có quyền truy cập";
      } else if (status === 404) {
        error.userMessage = "Không tìm thấy dữ liệu";
      } else if (status >= 500) {
        error.userMessage = "Lỗi máy chủ, vui lòng thử lại sau";
      } else if (data && data.message) {
        error.userMessage = data.message;
      } else {
        error.userMessage = "Đã xảy ra lỗi không xác định";
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      error.userMessage = "Không thể kết nối đến máy chủ";
    } else {
      // Lỗi khác
      error.userMessage = "Đã xảy ra lỗi không xác định";
    }
    
    return Promise.reject(error);
  }
);

//API lấy danh sách bộ sưu tập
export const fetchCategories = () => API.get('/categories');

// Product Variant APIs
export const fetchProductVariants = (productId: number) => API.get(`/ProductVariant/product/${productId}`);
export const createProductVariant = (data: any) => API.post('/ProductVariant', data);
export const updateProductVariant = (id: number, data: any) => API.put(`/ProductVariant/${id}`, data);
export const deleteProductVariant = (id: number) => API.delete(`/ProductVariant/${id}`);
export const updateVariantStock = (id: number, stock: number) => API.put(`/ProductVariant/${id}/stock`, { stock });

// Color APIs
export const fetchColors = () => API.get('/Color');
export const createColor = (data: any) => API.post('/Color', data);
export const updateColor = (id: number, data: any) => API.put(`/Color/${id}`, data);
export const deleteColor = (id: number) => API.delete(`/Color/${id}`);

// Size APIs
export const fetchSizes = () => API.get('/Size');
export const createSize = (data: any) => API.post('/Size', data);
export const updateSize = (id: number, data: any) => API.put(`/Size/${id}`, data);
export const deleteSize = (id: number) => API.delete(`/Size/${id}`);

//API lấy danh sách chất liệu
export const fetchMaterials = () => API.get('/products/materials');

//API lấy danh sách loại quần áo
export const fetchClothingTypes = () => API.get('/products/clothing-types');

//API tạo mới bộ sưu tập
export const createCategory = (
  data: { name: String, description: String }) => API.post(
    '/categories', data);

//API sửa bộ sưu tập
export const updateCategory = (id: number,
  data: { name: String, description: String }) => API.put(
    `/categories/${id}`, data);

//API xóa bộ sưu tập
export const deleteCategory = (id: number) => API.delete(
  `/categories/${id}`);

// PRODUCT API
export const fetchProducts = () => API.get("/products", {
  headers: {
    'Content-Type': 'application/json',  // Đảm bảo gửi header hợp lệ
  },
});

// Lấy chi tiết sản phẩm theo ID
export const fetchProductById = (id: number) => API.get(`/products/${id}`, {
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createProduct = (data: any) =>
  API.post("/products", data);
export const updateProduct = (id: number, data: any) =>
  API.put(`/products/${id}`, data);
export const deleteProduct = (id: number) =>
  API.delete(`/products/${id}`);
// Lấy sản phẩm theo bộ sưu tập (CategoryId)
export const fetchProductsByCategory = (categoryId: number) => {
  return API.get(`/products/by-category/${categoryId}`);
};

// Lấy sản phẩm bán chạy trong tuần
export const fetchWeeklyBestSellers = () => {
  return API.get('/products/weekly-bestsellers', {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Lấy sản phẩm nổi bật (bán chạy toàn thời gian)
export const fetchFeaturedProducts = () => {
  return API.get('/products/featured', {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Upload image
export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/files/upload', formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

//Xử lý đăng nhập
export const login = (username: string, password: string) => {
  return API.post("/auth/login", { username, password });
}

//Xử lý giỏ hàng
//Thêm sản phẩm vào giỏ
export const addToCart = (data: { productId: number, quantity: number, productVariantId?: number }) => {
  return API.post("/cart/add", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
}

//Lấy danh sách sản phẩm trong giỏ
export const fetchCart = () => {
  return API.get("/cart/get", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
}

//Cập nhật số lượng sản phẩm trong giỏ
export const updateCartItem = (productId: number, quantity: number, productVariantId?: number) => {
  return API.put('/cart/update-quantity', { 
    productId: productId, 
    quantity,
    productVariantId 
  }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
}

//Xoá sản phẩm khỏi giỏ hàng
export const deleteCartItem = (productId: number, productVariantId?: number) => {
  const url = productVariantId 
    ? `/cart/delete/${productId}?productVariantId=${productVariantId}`
    : `/cart/delete/${productId}`;
  
  return API.delete(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

// Lấy thông tin user hiện tại
export const fetchCurrentUser = () => {
  return API.get('/users/me', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};
// Xóa token để đăng xuất
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Trigger custom logout event to notify ChatProvider
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('logout'));
  }
};

//quản lý users
// Lấy danh sách tất cả người dùng
export const fetchAllUsers = () => {
  return API.get('/users/getAll', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};
// Xoá người dùng theo ID (chỉ admin)
export const deleteUser = (id: number) => {
  return API.delete(`/users/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};
// Đăng ký tài khoản mới
export const registerUser = (data: {
  username: string;
  password: string;
  fullName: string;
  phone: string;
}) => API.post("/users", data);
// Đổi mật khẩu user
export const changeUserPassword = (
  id: number,
  data: { oldPassword: string; newPassword: string }
) => API.post(`/users/${id}/change-password`, data, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});
// Lấy thông tin user theo id
export const fetchUserById = (id: number) => API.get(`/users/${id}`);
// Sửa thông tin user
export const updateUser = (
  id: number,
  data: { FullName?: string; Phone?: string; isActive?: boolean }
) => {
  // Chuẩn hóa data để match với backend expectations
  // Chỉ gửi các field có giá trị thực sự, không gửi null/undefined/empty
  const normalizedData: { FullName?: string; Phone?: string; IsActive?: boolean } = {};
  
  if (data.FullName !== undefined && data.FullName !== null && data.FullName.trim() !== '') {
    normalizedData.FullName = data.FullName.trim();
  }
  if (data.Phone !== undefined && data.Phone !== null && data.Phone.trim() !== '') {
    normalizedData.Phone = data.Phone.trim();
  }
  if (data.isActive !== undefined && data.isActive !== null) {
    normalizedData.IsActive = data.isActive;
  }
  
  console.log('🔄 API Call - updateUser:', {
    url: `/users/${id}`,
    originalData: data,
    normalizedData: normalizedData,
    token: localStorage.getItem('token') ? 'Token exists' : 'No token'
  });
  
  return API.put(`/users/${id}`, normalizedData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
};

// Toggle trạng thái hoạt động của user (chỉ admin)
export const toggleUserStatus = (id: number, isActive: boolean) => {
  console.log('🔄 API Call - toggleUserStatus:', {
    url: `/users/${id}/toggle-status`,
    data: { isActive },
    token: localStorage.getItem('token') ? 'Token exists' : 'No token'
  });
  
  return API.put(`/users/${id}/toggle-status`, { isActive }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
};

// Test API endpoint
export const testUserAPI = () => {
  console.log('🔄 Testing User API endpoint...');
  return API.get('/users/test');
};

// Cập nhật quyền user (admin)
export const updateUserRole = (
  id: number,
  data: { role: string }
) => {
  console.log('🔄 API Call - updateUserRole:', {
    url: `/users/${id}/role`,
    data: data,
    token: localStorage.getItem('token') ? 'Token exists' : 'No token'
  });
  
  return API.put(`/users/${id}/role`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

// quản lý đơn hàng
// Lấy tất cả đơn hàng của user hiện tại (cho trang /orders)
export const fetchAllOrder = () => {
  return API.get('/Order/user', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

// Lấy tất cả đơn hàng (cho admin trang /admin/orders)
export const fetchAllOrdersAdmin = () => {
  return API.get('/Order/getAll', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};
// Xoá đơn hàng theo ID (chỉ admin)
export const deleteOrder = (id: number) => {
  return API.delete(`/Order/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

// Cập nhật trạng thái đơn hàng (chỉ admin)
export const updateOrderStatus = (orderId: number, status: string) => {
  return API.put(`/Order/${orderId}/status`, { status }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

// Thêm hàm gửi đơn hàng
// Gửi đơn hàng
export const submitOrder = (deliveryAddress: string, note?: string) => {
  return API.post(`/Order/`, {
    deliveryAddress: deliveryAddress,
    note: note || ''
  }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

// Lấy thông tin thống kê khách hàng theo ID (cho admin)
export const fetchCustomerStats = (userId: number) => {
  return API.get(`/users/${userId}/stats`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    }
  }).then(res => res.data);
};

// Lấy danh sách orders của khách hàng theo ID (cho admin)
export const fetchCustomerOrders = (userId: number) => {
  return API.get(`/users/${userId}/orders`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    }
  }).then(res => res.data);
};

// thống kê báo cáo
export const fetchAdminDashboard = () => {
  return API.get('/admin/dashboard', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    }
  }).then(res => res.data);
};

export const fetchRevenueByDayInMonth = (year: number, month: number) => {
  return API.get(`/admin/dashboard/revenue-by-day?year=${year}&month=${month}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const fetchTopSellingProducts = (top = 5) => {
  return API.get(`/admin/dashboard/top-products?top=${top}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};
// Doanh thu 7 ngày gần nhất
export const fetchRevenueByWeek = () => {
  return API.get('/admin/dashboard/revenue-by-week', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

// Doanh thu theo tháng trong 1 năm
export const fetchRevenueByMonth = (year: number) => {
  return API.get(`/admin/dashboard/revenue-by-month?year=${year}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

// Doanh thu theo từng năm
export const fetchRevenueByYear = () => {
  return API.get('/admin/dashboard/revenue-by-year', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};


// Tạo thanh toán mới
export const createPayment = (data: {
  orderId: number;
  paymentMethod: string;
  amount: number; // Frontend vẫn dùng number, backend sẽ convert sang decimal
  transactionId?: string;
  paymentGateway?: string;
}) => {
  return API.post('/payment/create', data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};
// Lấy thanh toán theo orderId
export const fetchPaymentByOrderId = async (orderId: number) => {
  const res = await API.get(`/payment/order/${orderId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return res.data;
};

// Cập nhật trạng thái thanh toán (xác nhận đã nhận hàng)
export const confirmPaymentReceived = async (paymentId: number) => {
  return API.put(`/payment/update-status/${paymentId}`, 1, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
};

// User hủy đơn hàng
export const cancelOrder = async (orderId: number) => {
  return API.put(`/Order/${orderId}/cancel`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
};
// lấy dữ liệu để in ra
export const fetchData = async (orderId: number) => {
  try {
    // Lấy thông tin đơn hàng từ bảng Orders (bao gồm status)
    const orderResponse = await API.get(`/Order/${orderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    // Lấy chi tiết sản phẩm từ OrderDetails
    const orderDetails = await fetchOrderDetails(orderId);
    
    // Lấy thông tin thanh toán
    const payment = await fetchPaymentByOrderId(orderId);
    
    // Kết hợp dữ liệu
    const order = {
      ...orderResponse.data,
      orderDetails: orderDetails.orderDetails,
      totalAmount: orderDetails.totalAmount,
      subtotal: orderDetails.subtotal,
      shippingFee: orderDetails.shippingFee,
      createdAt: orderResponse.data.orderDate
    };
    
    return { order, payment };
  } catch (error) {
    console.error("❌ Lỗi khi fetch dữ liệu:", error);
    throw error;
  }
};

// Lấy chi tiết đơn hàng theo OrderId
export const fetchOrderById = (orderId: number) => {
  return API.get(`/orderdetails/order/${orderId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

// Lấy chi tiết đơn hàng theo userId + orderID
export const fetchOrderDetails = async (orderId: string | number) => {
  const idNumber = typeof orderId === 'string' ? parseInt(orderId) : orderId;
  console.log('📦 Gọi API lấy chi tiết đơn hàng:', idNumber);

  const res = await API.get(`/orderdetails/user/${idNumber}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  console.log('✅ Nhận được phản hồi:', res.data);

  // Tính tổng từ UnitPrice (đã bao gồm phí ship)
  const totalAmount = res.data.reduce(
    (sum: number, item: any) => sum + item.unitPrice * item.quantity,
    0
  );

  // Lấy phí ship từ order (nếu có) hoặc mặc định 30,000đ
const shippingFee = res.data.length > 0 && res.data[0].order?.shippingFee 
    ? res.data[0].order.shippingFee 
    : null;


  // Tính tổng sản phẩm (chưa bao gồm phí ship)
  const subtotal = res.data.reduce(
    (sum: number, item: any) => sum + item.product.price * item.quantity,
    0
  );

  return {
    orderId: idNumber,
    createdAt: new Date().toISOString(),
    orderDetails: res.data,
    totalAmount, // Tổng bao gồm phí ship
    subtotal,    // Tổng sản phẩm chưa bao gồm phí ship
    shippingFee,
  };
};

// WISHLIST API
// Lấy danh sách wishlist của user
export const fetchWishlist = (userId: number) => {
  console.log('Fetching wishlist for user:', userId);
  return API.get(`/wishlist/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

// Thêm sản phẩm vào wishlist
export const addToWishlist = (userId: number, productId: number) => {
  console.log('Adding to wishlist:', { userId, productId });
  return API.post('/wishlist', {
    userId,
    productId
  }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

// Xóa sản phẩm khỏi wishlist
export const removeFromWishlist = (userId: number, productId: number) => API.delete(`/wishlist/${userId}/${productId}`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

// Kiểm tra sản phẩm có trong wishlist không
export const checkWishlistItem = (userId: number, productId: number) => API.get(`/wishlist/${userId}/check/${productId}`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

// ADDRESS API
// Lấy danh sách địa chỉ của user
export const fetchUserAddresses = () => {
  return API.get('/addresses', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

// Tạo địa chỉ mới
export const createAddress = (data: { addressText: string; isDefault?: boolean }) => {
  return API.post('/addresses', data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

// Cập nhật địa chỉ
export const updateAddress = (id: number, data: { addressText: string; isDefault?: boolean }) => {
  return API.put(`/addresses/${id}`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

// Xóa địa chỉ
export const deleteAddress = (id: number) => {
  return API.delete(`/addresses/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

// Đặt địa chỉ làm mặc định
export const setDefaultAddress = (id: number) => {
  return API.put(`/addresses/${id}/set-default`, null, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

export default API;