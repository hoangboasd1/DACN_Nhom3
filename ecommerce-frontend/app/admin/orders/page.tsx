'use client';

import React, { useEffect, useState } from 'react';
import { fetchAllOrdersAdmin, deleteOrder, updateOrderStatus } from '@/app/services/api';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Update as UpdateIcon,
  Info as InfoIcon
} from '@mui/icons-material';

export default function OrderPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const router = useRouter();

  // Gọi API lấy tất cả đơn hàng (cho admin)
  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchAllOrdersAdmin();
      setOrders(res.data);
    } catch (err) {
      console.error('Lỗi khi load đơn hàng:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Hàm xoá đơn hàng
  const handleDelete = async (orderId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xoá đơn hàng này không? 😥')) return;
    try {
      await deleteOrder(orderId);
      await loadOrders(); // Load lại danh sách
    } catch (err) {
      console.error('Lỗi xoá đơn hàng:', err);
    }
  };

  // Hàm cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    const statusLabels: { [key: string]: string } = {
      'Pending': 'Chờ xử lý',
      'Processing': 'Đang xử lý', 
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy'
    };
    
    const confirmMessage = newStatus === 'Cancelled' 
      ? `Bạn có chắc chắn muốn HỦY đơn hàng này? Số lượng hàng sẽ được hoàn lại kho.`
      : `Bạn có chắc chắn muốn chuyển đơn hàng sang trạng thái "${statusLabels[newStatus]}"?`;
    
    if (!confirm(confirmMessage)) return;
    
    setUpdatingStatus(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders(); // Load lại danh sách
      
      const successMessage = newStatus === 'Cancelled'
        ? `Đã hủy đơn hàng và hoàn lại số lượng hàng vào kho`
        : `Đã cập nhật trạng thái đơn hàng thành "${statusLabels[newStatus]}"`;
        
      alert(successMessage);
    } catch (err: any) {
      console.error('Lỗi cập nhật trạng thái:', err);
      alert(err.response?.data || 'Lỗi khi cập nhật trạng thái đơn hàng');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Điều hướng đến trang xem chi tiết
  const handleViewDetails = (orderId: number) => {
    router.push(`/admin/orderdetails/${orderId}`);
  };

  // Mở dialog thông tin
  const handleOpenInfo = (order: any) => {
    setSelectedOrder(order);
    setInfoDialogOpen(true);
  };

  // Hàm lấy nhãn trạng thái
  const getStatusLabel = (status: string) => {
    const statusLabels: { [key: string]: string } = {
      'Pending': 'Chờ xử lý',
      'Processing': 'Đang xử lý', 
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy'
    };
    return statusLabels[status] || status;
  };

  // Hàm lấy màu trạng thái
  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      'Pending': 'warning',
      'Processing': 'info',
      'Completed': 'success', 
      'Cancelled': 'error'
    };
    return statusColors[status] || 'default';
  };

  // Thống kê đơn hàng
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    processing: orders.filter(o => o.status === 'Processing').length,
    completed: orders.filter(o => o.status === 'Completed').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Đang tải đơn hàng...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 'bold',
          color: '#374151', // màu xám đậm đơn giản
          mb: 1
        }}>
          Quản lý đơn hàng
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Quản lý và theo dõi trạng thái đơn hàng
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 4,
        '& > *': {
          flex: '1 1 200px',
          minWidth: '200px'
        }
      }}>
        <Card sx={{ 
          backgroundColor: '#3b82f6', // màu xanh dương đơn giản
          color: 'white',
          border: '1px solid #2563eb'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Tổng đơn hàng
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {orderStats.total}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          backgroundColor: '#f59e0b', // màu vàng đơn giản
          color: 'white',
          border: '1px solid #d97706'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Chờ xử lý
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {orderStats.pending}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          backgroundColor: '#06b6d4', // màu cyan đơn giản
          color: 'white',
          border: '1px solid #0891b2'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Đang xử lý
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {orderStats.processing}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          backgroundColor: '#10b981', // màu xanh lá đơn giản
          color: 'white',
          border: '1px solid #059669'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Hoàn thành
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {orderStats.completed}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          backgroundColor: '#ef4444', // màu đỏ đơn giản
          color: 'white',
          border: '1px solid #dc2626'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Đã hủy
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {orderStats.cancelled}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Thông tin về quản lý tồn kho
        </Typography>
        <Typography variant="body2">
          <strong>Khi đặt hàng:</strong> Tồn kho được trừ ngay lập tức để tránh overselling<br/>
          <strong>Khi hủy đơn:</strong> Số lượng hàng sẽ được hoàn lại kho tự động<br/>
          <strong>Khi khôi phục đơn:</strong> Sẽ kiểm tra và trừ lại kho nếu đủ hàng
        </Typography>
      </Alert>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <Alert severity="info">
          Không có đơn hàng nào.
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Khách hàng</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tổng tiền</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ngày tạo</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái đơn hàng</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái thanh toán</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow 
                  key={order.orderId || order.id || index} 
                  hover
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: '#f8fafc' 
                    } 
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {order.user?.fullName || 'Khách hàng đã xóa tài khoản'}
                    </Typography>
                    {!order.user && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        (UserId: NULL)
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {order.totalAmount?.toLocaleString('vi-VN')}₫
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(order.status || 'Pending')}
                      color={getStatusColor(order.status || 'Pending')}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={
                        order.payments && order.payments.length > 0
                          ? order.payments[0].status === 1
                            ? 'Đã thanh toán'
                            : order.payments[0].status === 2
                            ? 'Thất bại'
                            : order.payments[0].status === 3
                            ? 'Đã hoàn tiền'
                            : 'Đang xử lý'
                          : 'Chưa thanh toán'
                      }
                      color={
                        order.payments && order.payments.length > 0
                          ? order.payments[0].status === 1 ? 'success' :
                            order.payments[0].status === 2 ? 'error' :
                            order.payments[0].status === 3 ? 'info' : 'warning'
                          : 'warning'
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {/* Dropdown để chọn trạng thái */}
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={order.status || 'Pending'}
                          onChange={(e) => handleUpdateStatus(order.orderId, e.target.value)}
                          disabled={updatingStatus === order.orderId || order.status === 'Completed' || order.status === 'Cancelled'}
                          sx={{
                            fontSize: '0.75rem',
                            '& .MuiSelect-select': {
                              py: 0.5
                            }
                          }}
                        >
                          {/* Nếu đã thanh toán thành công, chỉ cho phép Completed */}
                          {order.payments && order.payments.length > 0 && order.payments[0].status === 1 ? (
                            <MenuItem value="Completed">Hoàn thành</MenuItem>
                          ) : [
                            <MenuItem key="Pending" value="Pending">Chờ xử lý</MenuItem>,
                            <MenuItem key="Processing" value="Processing">Đang xử lý</MenuItem>,
                            <MenuItem key="Completed" value="Completed">Hoàn thành</MenuItem>,
                            <MenuItem key="Cancelled" value="Cancelled">Đã hủy</MenuItem>
                          ]}
                        </Select>
                      </FormControl>
                      
                      {/* Các nút hành động */}
                      <Tooltip title="Xem chi tiết">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleViewDetails(order.orderId)}
                          size="small"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Thông tin">
                        <IconButton 
                          color="info" 
                          onClick={() => handleOpenInfo(order)}
                          size="small"
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Xóa">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(order.orderId)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    {/* Thông báo khi không thể chỉnh sửa */}
                    {(order.status === 'Completed' || order.status === 'Cancelled') && (
                      <Typography variant="caption" color="text.secondary" sx={{ 
                        display: 'block', 
                        mt: 0.5,
                        fontStyle: 'italic'
                      }}>
                        {order.status === 'Completed' 
                          ? 'Đơn hàng đã hoàn thành'
                          : 'Đơn hàng đã hủy'
                        }
                      </Typography>
                    )}
                    
                    {/* Thông báo khi đã thanh toán thành công */}
                    {order.payments && order.payments.length > 0 && order.payments[0].status === 1 && order.status !== 'Completed' && (
                      <Typography variant="caption" color="success.main" sx={{ 
                        display: 'block', 
                        mt: 0.5,
                        fontStyle: 'italic',
                        fontWeight: 'medium'
                      }}>
                         Đã thanh toán 
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Info Dialog */}
      <Dialog 
        open={infoDialogOpen} 
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#3b82f6', // màu xanh dương đơn giản
          color: 'white',
          fontWeight: 'bold'
        }}>
          Thông tin đơn hàng
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {selectedOrder && (
            <List>
              <ListItem>
                <ListItemText 
                  primary="ID Đơn hàng" 
                  secondary={selectedOrder.orderId || selectedOrder.id} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Khách hàng" 
                  secondary={selectedOrder.user?.fullName || 'Không rõ'} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Email" 
                  secondary={selectedOrder.user?.email || 'Không có'} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Tổng tiền" 
                  secondary={`${selectedOrder.totalAmount?.toLocaleString('vi-VN')}₫`} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Ngày tạo" 
                  secondary={new Date(selectedOrder.orderDate).toLocaleString('vi-VN')} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Trạng thái" 
                  secondary={getStatusLabel(selectedOrder.status || 'Pending')} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Thanh toán" 
                  secondary={
                    selectedOrder.payments && selectedOrder.payments.length > 0
                      ? selectedOrder.payments[0].status === 1
                        ? 'Đã thanh toán'
                        : selectedOrder.payments[0].status === 2
                        ? 'Thất bại'
                        : selectedOrder.payments[0].status === 3
                        ? 'Đã hoàn tiền'
                        : 'Đang xử lý'
                      : 'Chưa thanh toán'
                  } 
                />
              </ListItem>
            </List>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setInfoDialogOpen(false)} color="inherit">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}