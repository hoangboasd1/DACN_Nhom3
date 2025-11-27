'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAdminDashboard } from '@/app/services/api';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import { 
  FaShoppingCart, 
  FaBox, 
  FaUsers, 
  FaDollarSign,
  FaClock,
  FaCog,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchAdminDashboard();
        setStats(data);
      } catch (error) {
        console.error('Không thể tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const adminLinks = [
    { 
      href: '/admin/products', 
      label: 'Quản lý sản phẩm', 
      icon: <FaBox />, 
      color: '#4CAF50',
      description: 'Thêm, sửa, xóa sản phẩm'
    },
    { 
      href: '/admin/orders', 
      label: 'Quản lý đơn hàng', 
      icon: <FaShoppingCart />, 
      color: '#2196F3',
      description: 'Xem và cập nhật trạng thái đơn hàng'
    },
    { 
      href: '/admin/users', 
      label: 'Quản lý người dùng', 
      icon: <FaUsers />, 
      color: '#FF9800',
      description: 'Quản lý tài khoản khách hàng'
    },
    { 
      href: '/admin/categories', 
      label: 'Danh mục sản phẩm', 
      icon: <FaCog />, 
      color: '#9C27B0',
      description: 'Quản lý các danh mục sản phẩm'
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <FaClock color="#FFA726" />;
      case 'Processing': return <FaCog color="#2196F3" />;
      case 'Completed': return <FaCheckCircle color="#4CAF50" />;
      case 'Cancelled': return <FaTimesCircle color="#F44336" />;
      default: return <FaExclamationTriangle color="#FF9800" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#FFA726';
      case 'Processing': return '#2196F3';
      case 'Completed': return '#4CAF50';
      case 'Cancelled': return '#F44336';
      default: return '#FF9800';
    }
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
          Đang tải dữ liệu thống kê...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 'bold',
          color: '#374151', // màu xám đậm đơn giản
          mb: 1
        }}>
           Bảng điều khiển Admin
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Tổng quan về hoạt động của hệ thống
        </Typography>
      </Box>

      {stats ? (
        <Box sx={{ mb: 4 }}>
          {/* Thống kê tổng quan */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                backgroundColor: '#3b82f6', // màu xanh dương đơn giản
                color: 'white',
                border: '1px solid #2563eb'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FaShoppingCart size={32} />
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
                      Tổng đơn hàng
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats.totalOrders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                backgroundColor: '#10b981', // màu xanh lá đơn giản
                color: 'white',
                border: '1px solid #059669'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FaBox size={32} />
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
                      Sản phẩm đang bán
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats.activeProducts}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                backgroundColor: '#f59e0b', // màu vàng đơn giản
                color: 'white',
                border: '1px solid #d97706'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FaUsers size={32} />
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
                      Người dùng
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats.totalUsers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                backgroundColor: '#ef4444', // màu đỏ đơn giản
                color: 'white',
                border: '1px solid #dc2626'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FaDollarSign size={32} />
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
                      Doanh thu hôm nay
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {Number(stats.revenueToday).toLocaleString('vi-VN')}đ
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Thống kê đơn hàng theo trạng thái */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
               Thống kê đơn hàng 
            </Typography>
              <Grid container spacing={2}>
                {[
                  { status: 'Pending', label: 'Chờ xử lý', count: stats.pendingOrders || 0 },
                  { status: 'Processing', label: 'Đang xử lý', count: stats.processingOrders || 0 },
                  { status: 'Completed', label: 'Hoàn thành', count: stats.completedOrders || 0 },
                  { status: 'Cancelled', label: 'Đã hủy', count: stats.cancelledOrders || 0 }
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} md={3} key={item.status}>
                    <Card sx={{ 
                      textAlign: 'center', 
                      p: 2,
                      backgroundColor: `${getStatusColor(item.status)}15`,
                      border: `2px solid ${getStatusColor(item.status)}30`
                    }}>
                      <CardContent>
                        <Box sx={{ mb: 2 }}>
                          {getStatusIcon(item.status)}
                        </Box>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 'bold',
                          color: getStatusColor(item.status),
                          mb: 1
                        }}>
                          {item.count}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: getStatusColor(item.status),
                          fontWeight: 500
                        }}>
                          {item.label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
        
              </Typography>
            </Alert>
          </Paper>
        </Box>
      ) : (
        <Alert severity="error" sx={{ mb: 4 }}>
          Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.
        </Alert>
      )}

      {/* Quick Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
           Thao tác nhanh
        </Typography>
          <Grid container spacing={3}>
            {adminLinks.map((link, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Link href={link.href} style={{ textDecoration: 'none' }}>
                  <Card sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Box sx={{ 
                        mb: 2,
                        color: link.color,
                        fontSize: '2.5rem'
                      }}>
                        {link.icon}
                      </Box>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold',
                        mb: 1,
                        color: 'text.primary'
                      }}>
                        {link.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {link.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Paper>
    </Box>
  );
}
