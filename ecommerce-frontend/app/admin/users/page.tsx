'use client';

import React, { useEffect, useState } from 'react';
import { fetchAllUsers, deleteUser, updateUserRole, updateUser, testUserAPI, toggleUserStatus } from '@/app/services/api';
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
  Avatar
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  BugReport as BugIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
} from '@mui/icons-material';

export default function UserPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  //Lấy danh sách user
  const loadUsers = async () => {
    try {
      const res = await fetchAllUsers();
      // Chuẩn hóa role để đảm bảo tính nhất quán
      const normalizedUsers = res.data.map((user: any) => ({
        ...user,
        role: user.role || 'nguoidung'
      }));
      setUsers(normalizedUsers);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  //Xoá user
  const handleDelete = async (id: number) => {
    const confirm = window.confirm("Bạn có chắc muốn xoá người dùng này?");
    if (!confirm) return;

    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert("Không thể xoá người dùng!");
      console.error(err);
    }
  };

  //Bắt đầu sửa quyền
  const handleEditRole = (userId: number, currentRole: string) => {
    setEditingRole(userId);
    setNewRole(currentRole);
  };

  //Hủy sửa quyền
  const handleCancelEditRole = () => {
    setEditingRole(null);
    setNewRole('');
  };


  //Cập nhật trạng thái hoạt động của user
  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const confirmMessage = newStatus 
      ? 'Bạn có chắc chắn muốn KÍCH HOẠT tài khoản này?'
      : 'Bạn có chắc chắn muốn KHÓA tài khoản này?';
    
    if (!confirm(confirmMessage)) return;

    try {
      console.log('Đang cập nhật trạng thái user:', userId, 'thành:', newStatus);
      
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('token');
      if (!token) {
        alert('❌ Bạn cần đăng nhập để thực hiện thao tác này!');
        return;
      }
      
      console.log('🔑 Token exists:', token ? 'Yes' : 'No');
      
      // Sử dụng API chuyên dụng để toggle status
      const response = await toggleUserStatus(userId, newStatus);
      
      console.log('Response từ server:', response);
      
      // Cập nhật danh sách users
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: newStatus } : user
      ));
      
      const successMessage = newStatus 
        ? 'Đã kích hoạt tài khoản thành công!'
        : 'Đã khóa tài khoản thành công!';
      alert(successMessage);
    } catch (err: any) {
      console.error(' Lỗi cập nhật trạng thái:', err);
      console.error('Response data:', err?.response?.data);
      console.error(' Status:', err?.response?.status);
      console.error(' Headers:', err?.response?.headers);
      
      let errorMessage = 'Không thể cập nhật trạng thái tài khoản!';
      
      // Xử lý các loại lỗi khác nhau
      if (err?.response?.status === 400) {
        // Kiểm tra chi tiết lỗi validation
        const validationErrors = err?.response?.data?.errors;
        if (validationErrors) {
          console.log('🔍 Validation errors:', validationErrors);
          const errorDetails = Object.entries(validationErrors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          errorMessage = ` Lỗi validation:\n${errorDetails}`;
        } else {
          errorMessage = ' Yêu cầu không hợp lệ. Có thể bạn không có quyền thực hiện thao tác này hoặc dữ liệu không đúng định dạng.';
        }
      } else if (err?.response?.status === 401) {
        errorMessage = ' Bạn cần đăng nhập lại để thực hiện thao tác này!';
      } else if (err?.response?.status === 403) {
        errorMessage = ' Bạn không có quyền thực hiện thao tác này!';
      } else if (err?.response?.status === 404) {
        errorMessage = ' Không tìm thấy người dùng!';
      } else if (err?.response?.data) {
        errorMessage += ` Chi tiết: ${err.response.data}`;
      } else if (err?.message) {
        errorMessage += ` Chi tiết: ${err.message}`;
      }
      
      alert(errorMessage);
    }
  };

  //Cập nhật quyền
  const handleUpdateRole = async (userId: number) => {
    if (!newRole || (newRole !== 'Admin' && newRole !== 'nguoidung')) {
      alert('Vui lòng chọn quyền hợp lệ (Admin hoặc nguoidung)');
      return;
    }

    try {
      console.log(' Đang cập nhật quyền cho user:', userId, 'với quyền:', newRole);
      const response = await updateUserRole(userId, { role: newRole });
      console.log(' Phản hồi từ server:', response);
      
      // Cập nhật danh sách users
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      setEditingRole(null);
      setNewRole('');
      alert('Cập nhật quyền thành công!');
    } catch (err: any) {
      console.error(' Lỗi chi tiết:', err);
      console.error(' Response data:', err?.response?.data);
      console.error(' Status:', err?.response?.status);
      
      let errorMessage = 'Không thể cập nhật quyền!';
      if (err?.response?.data) {
        errorMessage += ` Chi tiết: ${err.response.data}`;
      } else if (err?.message) {
        errorMessage += ` Chi tiết: ${err.message}`;
      }
      
      alert(errorMessage);
    }
  };

  //Test API connection
  const handleTestAPI = async () => {
    try {
      console.log('Testing API connection...');
      const response = await testUserAPI();
      console.log(' API Test Response:', response.data);
      alert('API hoạt động bình thường!');
    } catch (err: any) {
      console.error(' API Test Error:', err);
      alert('API không hoạt động! Chi tiết: ' + (err?.message || 'Unknown error'));
    }
  };


  useEffect(() => {
    loadUsers();
  }, []);

  // Thống kê người dùng
  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    users: users.filter(u => u.role === 'nguoidung').length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
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
          Đang tải danh sách người dùng...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 'bold',
            color: '#374151', // màu xám đậm đơn giản
            mb: 1
          }}>
             Quản lý người dùng
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Quản lý tài khoản và phân quyền người dùng
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<BugIcon />}
          onClick={handleTestAPI}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
           Test API
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 4,
        '& > *': {
          flex: '1 1 0',
          minWidth: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }
      }}>
        <Card sx={{ 
          backgroundColor: '#3b82f6', // màu xanh dương đơn giản
          color: 'white',
          border: '1px solid #2563eb'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Tổng người dùng
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {userStats.total}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          backgroundColor: '#ef4444', // màu đỏ đơn giản
          color: 'white',
          border: '1px solid #dc2626'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <AdminIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Admin
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {userStats.admins}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          backgroundColor: '#06b6d4', // màu cyan đơn giản
          color: 'white',
          border: '1px solid #0891b2'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Người dùng
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {userStats.users}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          backgroundColor: '#10b981', // màu xanh lá đơn giản
          color: 'white',
          border: '1px solid #059669'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Hoạt động
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {userStats.active}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          backgroundColor: '#f59e0b', // màu vàng đơn giản
          color: 'white',
          border: '1px solid #d97706'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <BlockIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Bị khóa
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {userStats.inactive}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Users Table */}
      {users.length === 0 ? (
        <Alert severity="info">
           Không có người dùng nào.
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Avatar</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tên đăng nhập</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Họ tên</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Vai trò</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow 
                  key={user.id} 
                  hover
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: '#f8fafc' 
                    } 
                  }}
                >
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <Avatar sx={{ 
                      bgcolor: user.role === 'Admin' ? 'error.main' : 'primary.main',
                      width: 40,
                      height: 40
                    }}>
                      {user.role === 'Admin' ? <AdminIcon /> : <PersonIcon />}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {user.username}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.fullName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {editingRole === user.id ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            sx={{ fontSize: '0.875rem' }}
                          >
                            <MenuItem value="nguoidung">Người dùng</MenuItem>
                            <MenuItem value="Admin">Admin</MenuItem>
                          </Select>
                        </FormControl>
                        <Tooltip title="Lưu">
                          <IconButton 
                            color="success" 
                            onClick={() => handleUpdateRole(user.id)}
                            size="small"
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hủy">
                          <IconButton 
                            color="inherit" 
                            onClick={handleCancelEditRole}
                            size="small"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={user.role === 'Admin' ? '👑 Admin' : '👤 Người dùng'}
                          color={user.role === 'Admin' ? 'error' : 'primary'}
                          size="small"
                          variant="outlined"
                          onClick={undefined}
                        />
                        <Tooltip title="Chỉnh sửa quyền">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEditRole(user.id, user.role || 'nguoidung')}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={user.isActive ? " Hoạt động" : "Bị khóa"}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                      />
                      <Tooltip title={user.isActive ? "Khóa tài khoản" : "Kích hoạt tài khoản"}>
                        <IconButton 
                          color={user.isActive ? "error" : "success"}
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          size="small"
                        >
                          {user.isActive ? <ToggleOffIcon /> : <ToggleOnIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Xóa người dùng">
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(user.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
