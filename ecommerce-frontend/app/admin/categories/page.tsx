'use client'

import React, {useEffect, useState} from 'react'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/app/services/api'
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  IconButton, 
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

export default function Category(){
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect( () => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        setCategories(res.data);
      } catch (err) {
        console.error('Lỗi khi tải danh sách bộ sưu tập', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);
  
  // Xử lý khi nhấn vào nút thêm bộ sưu tập
  const handleCreateCategory = async () => {
    if(name && description){
      try {
        const res = await createCategory({name, description});
        setCategories([...categories, res.data]);
        setName('');
        setDescription('');
        setDialogOpen(false);
      } catch (err) {
        console.error('Lỗi khi tạo bộ sưu tập', err);
      }
    }
  }

  //Xử lý khi nhấn vào nút cập nhật bộ sưu tập
  const handleUpdateCategory = async () => {
    if (isEditing && editCategoryId && name && description) {
      try {
        await updateCategory(editCategoryId, {name, description});
        const updatedCategories = categories.map((category) =>
          category.id === editCategoryId
            ? { ...category, name, description }
            : category
        );
        setCategories(updatedCategories);
        setName('');
        setDescription(''); 
        setIsEditing(false);
        setEditCategoryId(null);
        setDialogOpen(false);
      } catch (err) {
        console.error('Lỗi khi cập nhật bộ sưu tập', err);
      }
    }
  }

  //Xử lý khi nhấn vào nút xóa bộ sưu tập
  const handleDeleteCategory = async (id: number) => {
    const confirmDelete = window.confirm(
      'Bạn có chắc chắn muốn xóa bộ sưu tập này?');
    if (!confirmDelete) return;
    
    try {
      await deleteCategory(id);
      setCategories(categories.filter((category) => category.id !== id));
    } catch (err) {
      console.error('Lỗi khi xóa bộ sưu tập', err);
    }
  }

  //Xử lý khi nhấn nút Sửa
  const handleEditCategory = (category : any) => {
    setIsEditing(true);
    setEditCategoryId(category.id);
    setName(category.name);
    setDescription(category.description);
    setDialogOpen(true);
  }

  // Mở dialog thêm mới
  const handleOpenAddDialog = () => {
    setIsEditing(false);
    setEditCategoryId(null);
    setName('');
    setDescription('');
    setDialogOpen(true);
  };

  // Đóng dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setIsEditing(false);
    setEditCategoryId(null);
    setName('');
    setDescription('');
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
          Đang tải danh sách danh mục...
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
            🏷️ Quản lý Danh mục
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Quản lý các danh mục sản phẩm trong hệ thống
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            backgroundColor: '#3b82f6', // màu xanh dương đơn giản
            '&:hover': {
              backgroundColor: '#2563eb',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Thêm danh mục mới
        </Button>
      </Box>

      {/* Stats Card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            backgroundColor: '#8b5cf6', // màu tím đơn giản
            color: 'white',
            border: '1px solid #7c3aed'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CategoryIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Tổng danh mục
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {categories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Categories List */}
      {categories.length === 0 ? (
        <Alert severity="info">
          📂 Chưa có danh mục nào. Hãy thêm danh mục đầu tiên!
        </Alert>
      ) : (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 2, backgroundColor: '#f8fafc' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Danh sách danh mục
            </Typography>
          </Box>
          <List>
            {categories.map((category, index) => (
              <React.Fragment key={category.id}>
                <ListItem sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Chip 
                      label={index + 1}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <ListItemText
                    primary={
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {category.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditCategory(category)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteCategory(category.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < categories.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
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
          {isEditing ? "Chỉnh sửa danh mục" : " Thêm danh mục mới"}
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Tên danh mục"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên danh mục"
              variant="outlined"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Mô tả danh mục"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả danh mục"
              multiline
              rows={3}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={isEditing ? handleUpdateCategory : handleCreateCategory}
            variant="contained"
            startIcon={isEditing ? <SaveIcon /> : <AddIcon />}
            sx={{
              backgroundColor: '#3b82f6', // màu xanh dương đơn giản
              '&:hover': {
                backgroundColor: '#2563eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {isEditing ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}