'use client';

import React, { useEffect, useState } from 'react';
import { fetchProducts, createProduct, updateProduct, 
    deleteProduct, fetchCategories, fetchMaterials, fetchClothingTypes,
    uploadImage, fetchProductVariants, createProductVariant, updateProductVariant, 
    deleteProductVariant, fetchColors, fetchSizes, createColor, createSize} from '@/app/services/api';
import Modal from '@/components/Modal';
import { ChromePicker } from 'react-color';
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Fab,
  Tooltip,
  Autocomplete
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CloudUpload as UploadIcon,
  Palette as VariantIcon,
  Close as XIcon
} from '@mui/icons-material';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  instock: number;
  imageUrl?: string;
  gender?: string;
  categoryId: number;
  category?: any;
  clothingTypeId?: number;
  clothingType?: any;
  productMaterials?: Array<{
    id: number;
    material: {
      id: number;
      name: string;
    };
  }>;
  createdAt?: string;
};

type Category = {
  id: number;
  name: string;
};

type Material = {
  id: number;
  name: string;
  description?: string;
};

type ClothingType = {
  id: number;
  name: string;
  description?: string;
};

type Color = {
  id: number;
  name: string;
  hexCode?: string;
  description?: string;
};

type Size = {
  id: number;
  name: string;
  code?: string;
  description?: string;
};

type ProductVariant = {
  id: number;
  productId: number;
  colorId: number;
  sizeId: number;
  stockQuantity: number;
  priceAdjustment?: number;
  imageUrl?: string;
  sku?: string;
  isActive: boolean;
  color?: Color;
  size?: Size;
};

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [clothingTypes, setClothingTypes] = useState<ClothingType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [form, setForm] = useState<Omit<Product, 'id' | 'category' | 'createdAt' | 'productMaterials'>>({
    name: '',
    description: '',
    price: 0,
    instock: 0,
    imageUrl: '',
    gender: '',
    categoryId: 0,
    clothingTypeId: undefined,
  });

  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Variant management state
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [variantFormOpen, setVariantFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantForm, setVariantForm] = useState({
    colorId: 0,
    sizeName: '',
    stockQuantity: 0,
    imageUrl: '',
    sku: ''
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  
  // Color picker state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedColorName, setSelectedColorName] = useState('');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes, materialsRes, clothingTypesRes, colorsRes, sizesRes] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchMaterials(),
          fetchClothingTypes(),
          fetchColors(),
          fetchSizes()
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setMaterials(materialsRes.data);
        setClothingTypes(clothingTypesRes.data);
        setColors(colorsRes.data);
        setSizes(sizesRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Xử lý mở form thêm mới
  const openAddModal = () => {
    setEditingProduct(null);
    setForm({ 
      name: '', 
      description: '', 
      price: 0, 
      instock: 0, 
      imageUrl: '', 
      gender: '',
      categoryId: categories[0]?.id || 0,
      clothingTypeId: undefined
    });
    setSelectedMaterials([]);
    setModalOpen(true);
  };

  // Xử lý mở form sửa
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price,
      instock: product.instock,
      imageUrl: product.imageUrl || '',
      gender: product.gender || '',
      categoryId: product.categoryId,
      clothingTypeId: product.clothingTypeId,
    });
    
    // Set selected materials from productMaterials
    const materialIds = product.productMaterials && Array.isArray(product.productMaterials) 
      ? product.productMaterials.map(pm => pm.material.id) 
      : [];
    setSelectedMaterials(materialIds);
    
    setModalOpen(true);
  };

  // Xử lý đóng form
  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setSelectedMaterials([]);
  };

  // Xử lý input form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  // Lưu sản phẩm (thêm/sửa)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...form,
        materialIds: selectedMaterials
      };
      
      if (editingProduct) {
        // Sửa
        await updateProduct(editingProduct.id, productData);
        setProducts(products.map(p => (p.id === editingProduct.id ? { ...editingProduct, ...form } : p)));
      } else {
        // Thêm mới
        const res = await createProduct(productData);
        setProducts([...products, res.data]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  // Xóa sản phẩm
  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  // Mở modal quản lý biến thể
  const openVariantModal = async (product: Product) => {
    setSelectedProduct(product);
    setVariantModalOpen(true);
    await loadVariants(product.id);
  };

  // Đóng modal quản lý biến thể
  const closeVariantModal = () => {
    setVariantModalOpen(false);
    setSelectedProduct(null);
    setVariants([]);
  };

  // Load variants for a product
  const loadVariants = async (productId: number) => {
    try {
      const res = await fetchProductVariants(productId);
      setVariants(res.data);
    } catch (error) {
      console.error('Error loading variants:', error);
    }
  };

  // Open variant form
  const openVariantForm = (variant?: ProductVariant) => {
    if (variant) {
      setEditingVariant(variant);
      setVariantForm({
        colorId: variant.colorId,
        sizeName: variant.size?.name || '',
        stockQuantity: variant.stockQuantity,
        imageUrl: variant.imageUrl || '',
        sku: variant.sku || ''
      });
      // Set color picker values
      if (variant.color) {
        setSelectedColor(variant.color.hexCode || '#000000');
        setSelectedColorName(variant.color.name);
      }
      // Set selected sizes for editing
      setSelectedSizes(variant.size?.name ? [variant.size.name] : []);
    } else {
      setEditingVariant(null);
      setVariantForm({
        colorId: 0,
        sizeName: '',
        stockQuantity: 0,
        imageUrl: '',
        sku: ''
      });
      // Reset color picker
      setSelectedColor('#000000');
      setSelectedColorName('');
      // Reset selected sizes
      setSelectedSizes([]);
    }
    setVariantFormOpen(true);
  };

  // Close variant form
  const closeVariantForm = () => {
    setVariantFormOpen(false);
    setEditingVariant(null);
    setShowColorPicker(false);
    setSelectedSizes([]);
    // Reset color picker values
    setSelectedColor('#000000');
    setSelectedColorName('');
    // Reset variant form
    setVariantForm({
      colorId: 0,
      sizeName: '',
      stockQuantity: 0,
      imageUrl: '',
      sku: ''
    });
  };

  // Color picker will stay open until manually closed
  // Removed auto-close functionality

  // Get color name from hex code
  const getColorNameFromHex = (hex: string): string => {
    const colorMap: { [key: string]: string } = {
      '#FF0000': 'Đỏ',
      '#00FF00': 'Xanh lá',
      '#0000FF': 'Xanh dương',
      '#FFFF00': 'Vàng',
      '#FF00FF': 'Tím',
      '#00FFFF': 'Cyan',
      '#FFA500': 'Cam',
      '#800080': 'Tím đậm',
      '#008000': 'Xanh lá đậm',
      '#000080': 'Xanh dương đậm',
      '#800000': 'Đỏ đậm',
      '#808000': 'Vàng olive',
      '#C0C0C0': 'Bạc',
      '#808080': 'Xám',
      '#000000': 'Đen',
      '#FFFFFF': 'Trắng',
      '#FFC0CB': 'Hồng',
      '#A52A2A': 'Nâu',
      '#FFD700': 'Vàng gold',
      '#40E0D0': 'Turquoise'
    };
    
    return colorMap[hex.toUpperCase()] || `Màu ${hex.toUpperCase()}`;
  };

  // Handle color picker change
  const handleColorChange = (color: any) => {
    setSelectedColor(color.hex);
    // Auto-fill color name if not manually entered
    if (!selectedColorName.trim()) {
      const autoColorName = getColorNameFromHex(color.hex);
      setSelectedColorName(autoColorName);
    }
  };

  // Handle color picker complete
  const handleColorChangeComplete = async (color: any) => {
    setSelectedColor(color.hex);
    
    // Auto-fill color name if not manually entered
    if (!selectedColorName.trim()) {
      const autoColorName = getColorNameFromHex(color.hex);
      setSelectedColorName(autoColorName);
    }
    
    // Find existing color by hex code first, then by name
    let existingColor = colors.find(c => c.hexCode?.toLowerCase() === color.hex.toLowerCase());
    
    if (!existingColor) {
      // Try to find by name if provided
      if (selectedColorName.trim()) {
        existingColor = colors.find(c => c.name.toLowerCase() === selectedColorName.toLowerCase());
      }
    }
    
    if (!existingColor) {
      // Create new color
      try {
        const colorName = selectedColorName.trim() || `Màu ${color.hex.toUpperCase()}`;
        const colorData = {
          name: colorName,
          hexCode: color.hex,
          description: `Màu sắc được tạo tự động từ color picker`
        };
        const colorRes = await createColor(colorData);
        existingColor = colorRes.data;
        
        // Check if this is a new color or existing one returned by backend
        const isNewColor = !colors.find(c => c.id === existingColor.id);
        if (isNewColor) {
          setColors([...colors, existingColor]);
        }
      } catch (error) {
        console.error('Error creating color:', error);
        // If creation fails, try to use existing color with same hex
        const fallbackColor = colors.find(c => c.hexCode?.toLowerCase() === color.hex.toLowerCase());
        if (fallbackColor) {
          existingColor = fallbackColor;
        } else {
          alert('Có lỗi khi tạo màu mới. Vui lòng thử lại!');
          return;
        }
      }
    }
    
    setVariantForm({ ...variantForm, colorId: existingColor.id });
    setSelectedColorName(existingColor.name);
    
    // Color picker stays open for user convenience
  };

  // Calculate total stock of all variants
  const getTotalVariantStock = () => {
    return variants.reduce((total, variant) => total + variant.stockQuantity, 0);
  };

  // Get remaining stock for new variant
  const getRemainingStock = () => {
    const totalVariantStock = getTotalVariantStock();
    const currentVariantStock = editingVariant ? editingVariant.stockQuantity : 0;
    return selectedProduct ? selectedProduct.instock - (totalVariantStock - currentVariantStock) : 0;
  };

  // Save variant
  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('Không tìm thấy sản phẩm!');
      return;
    }

    // Validate stock quantity
    const remainingStock = getRemainingStock();
    if (variantForm.stockQuantity > remainingStock) {
      alert(`Số lượng tồn kho không được vượt quá ${remainingStock} (tổng tồn kho sản phẩm cha)`);
      return;
    }

    // Validate required fields
    if (variantForm.colorId === 0 || selectedSizes.length === 0) {
      alert('Vui lòng chọn màu sắc và ít nhất một kích cỡ!');
      return;
    }

    // Ensure colorId is a number
    const colorId = Number(variantForm.colorId);
    if (isNaN(colorId)) {
      alert('Màu sắc không hợp lệ!');
      return;
    }

    // Ensure stockQuantity is a positive number
    if (variantForm.stockQuantity <= 0) {
      alert('Số lượng tồn kho phải lớn hơn 0!');
      return;
    }

    try {
      const newVariants: ProductVariant[] = [];
      
      // Note: Removed duplicate size check to allow multiple variants with same size
      // This allows for scenarios like: Product1-Red-SizeM can have multiple entries
      
      for (const sizeName of selectedSizes) {
        // Find or create size
        let sizeId = sizes.find(s => s.name.toLowerCase() === sizeName.toLowerCase())?.id;
        if (!sizeId) {
          // Create new size
          const sizeRes = await createSize({ name: sizeName });
          sizeId = sizeRes.data.id;
          setSizes([...sizes, sizeRes.data]);
        }

        if (!sizeId) {
          console.error('Size ID is undefined for size:', sizeName);
          continue;
        }

        // Tính số lượng cho từng size (chia đều tổng số lượng)
        const stockPerSize = Math.floor(variantForm.stockQuantity / selectedSizes.length);
        const remainingStock = variantForm.stockQuantity % selectedSizes.length;
        const currentSizeStock = stockPerSize + (selectedSizes.indexOf(sizeName) < remainingStock ? 1 : 0);

        const variantData = {
          productId: selectedProduct.id,
          colorId: colorId,
          sizeId: sizeId,
          stockQuantity: currentSizeStock,
          priceAdjustment: null,
          imageUrl: variantForm.imageUrl || null,
          sku: variantForm.sku || null,
          isActive: true
        };

        console.log('Creating variant with data:', variantData);
        console.log('Selected sizes:', selectedSizes);
        console.log('Current variants:', variants.length);

        // Note: Removed duplicate check to allow multiple variants with same Product+Color+Size
        // This allows for scenarios like: Product1-Red-SizeM can have multiple entries

        if (editingVariant) {
          await updateProductVariant(editingVariant.id, variantData);
          setVariants(variants.map(v => v.id === editingVariant.id ? { ...v, ...variantData } : v));
        } else {
          const res = await createProductVariant(variantData);
          newVariants.push(res.data);
        }
      }
      
      if (!editingVariant) {
        setVariants([...variants, ...newVariants]);
        if (newVariants.length > 0) {
          alert(`Đã tạo thành công ${newVariants.length} biến thể mới!`);
        } else {
          alert('Không có biến thể mới nào được tạo (có thể đã tồn tại).');
        }
      } else {
        alert('Đã cập nhật biến thể thành công!');
      }
      
      closeVariantForm();
    } catch (error: any) {
      console.error('Error saving variant:', error);
      console.error('Error details:', error.response?.data);
      alert(`Có lỗi xảy ra khi lưu biến thể: ${error.response?.data?.message || error.message}`);
    }
  };

  // Delete variant
  const handleDeleteVariant = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa biến thể này?")) {
      try {
        await deleteProductVariant(id);
        setVariants(variants.filter(v => v.id !== id));
      } catch (error) {
        console.error('Error deleting variant:', error);
        alert('Có lỗi xảy ra khi xóa biến thể!');
      }
    }
  };

  // Upload image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const res = await uploadImage(e.target.files[0]);
        setForm({ ...form, imageUrl: res.data.imageUrl });
      } catch (error) {
        alert("Tải ảnh lên thất bại!");
      }
      setUploading(false);
    }
  };

  // Upload variant image
  const handleVariantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const res = await uploadImage(e.target.files[0]);
        setVariantForm({ ...variantForm, imageUrl: res.data.imageUrl });
      } catch (error) {
        alert("Tải ảnh lên thất bại!");
      }
      setUploading(false);
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
          Đang tải dữ liệu...
        </Typography>
      </Box>
    );
  }

  // @ts-ignore
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
             Quản lý Sản phẩm
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Quản lý danh sách sản phẩm và thông tin chi tiết
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddModal}
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
          Thêm sản phẩm mới
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#3b82f6', // màu xanh dương đơn giản
            color: 'white',
            border: '1px solid #2563eb'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Tổng sản phẩm
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {products.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#10b981', // màu xanh lá đơn giản
            color: 'white',
            border: '1px solid #059669'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Sản phẩm có hàng
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {products.filter(p => p.instock > 0).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#f59e0b', // màu vàng đơn giản
            color: 'white',
            border: '1px solid #d97706'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Hết hàng
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {products.filter(p => p.instock === 0).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#8b5cf6', // màu tím đơn giản
            color: 'white',
            border: '1px solid #7c3aed'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Danh mục
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {categories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Products Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Hình ảnh</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tên sản phẩm</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Mô tả</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Giá</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tồn kho</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Danh mục</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Loại quần áo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Chất liệu</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Giới tính</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow 
                key={product.id} 
                hover
                sx={{ 
                  '&:hover': { 
                    backgroundColor: '#f8fafc' 
                  } 
                }}
              >
                <TableCell>{product.id}</TableCell>
                <TableCell>
                  <Avatar
                    src={product.imageUrl}
                    alt={product.name}
                    sx={{ width: 56, height: 56 }}
                    variant="rounded"
                  >
                  
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {product.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {product.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {product.price.toLocaleString('vi-VN')}đ
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={product.instock} 
                    color={product.instock > 0 ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                    onDelete={undefined}
                    clickable={false}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={product.category ? product.category.name : 'N/A'} 
                    color="primary"
                    size="small"
                    variant="outlined"
                    onDelete={undefined}
                    clickable={false}
                  />
                </TableCell>
                <TableCell>
                  {product.clothingType && product.clothingType.name ? (
                    <Chip 
                      label={String(product.clothingType.name)} 
                      color="secondary"
                      size="small"
                      variant="outlined"
                      onDelete={undefined}
                      clickable={false}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">N/A</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                    {product.productMaterials && product.productMaterials.length > 0 ? (
                      product.productMaterials.map(pm => (
                        <Chip 
                          key={pm.id} 
                          label={pm.material ? String(pm.material.name) : 'N/A'} 
                          color="info"
                          size="small"
                          variant="outlined"
                          onDelete={undefined}
                          clickable={false}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">N/A</Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {product.gender ? (
                    <Chip 
                      label={product.gender} 
                      color="warning"
                      size="small"
                      variant="outlined"
                      onDelete={undefined}
                      clickable={false}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">N/A</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton 
                        color="primary" 
                        onClick={() => openEditModal(product)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Quản lý biến thể">
                      <IconButton 
                        color="secondary" 
                        onClick={() => openVariantModal(product)}
                        size="small"
                        sx={{
                          backgroundColor: '#f3e8ff',
                          '&:hover': {
                            backgroundColor: '#e9d5ff',
                          }
                        }}
                      >
                        <VariantIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(product.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Product Modal */}
      <Dialog 
        open={modalOpen} 
        onClose={closeModal}
        maxWidth="md"
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
          {editingProduct ? "✏️ Chỉnh sửa sản phẩm" : " Thêm sản phẩm mới"}
        </DialogTitle>
        
        <DialogContent sx={{ p: 4, maxHeight: '80vh', overflow: 'auto' }}>
          <Box component="form" onSubmit={handleSave} sx={{ mt: 1 }}>
            <Grid container spacing={3}>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên sản phẩm"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                  helperText="Nhập tên sản phẩm rõ ràng và dễ hiểu"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Giá (VNĐ)"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                  helperText="Nhập giá bán của sản phẩm"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả sản phẩm"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                  helperText="Mô tả chi tiết về sản phẩm, tính năng và đặc điểm"
                />
              </Grid>
              
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số lượng tồn kho"
                  name="instock"
                  type="number"
                  value={form.instock}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  inputProps={{ min: 0 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                  helperText="Số lượng sản phẩm có sẵn trong kho"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    label="Danh mục"
                  >
                    {categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>


              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={clothingTypes}
                  getOptionLabel={(option) => option.name}
                  value={clothingTypes.find(ct => ct.id === form.clothingTypeId) || null}
                  onChange={(event, newValue) => {
                    setForm({ ...form, clothingTypeId: newValue?.id || undefined });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Loại quần áo"
                      placeholder="Tìm kiếm loại quần áo..."
                      helperText="Chọn loại trang phục phù hợp"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <Box component="li" key={key} {...otherProps}>
                        <Box>
                          <Typography variant="body1">{option.name}</Typography>
                          {option.description && (
                            <Typography variant="body2" color="text.secondary">
                              {option.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value?.id}
                  noOptionsText="Không tìm thấy loại quần áo"
                  clearOnEscape
                  clearText="Xóa"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  options={materials}
                  getOptionLabel={(option) => option.name}
                  value={materials.filter(material => selectedMaterials.includes(material.id))}
                  onChange={(event, newValue) => {
                    setSelectedMaterials(newValue.map(material => material.id));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Chất liệu"
                      placeholder="Tìm kiếm chất liệu..."
                      helperText="Có thể chọn nhiều chất liệu cho sản phẩm"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <Box component="li" key={key} {...otherProps}>
                        <Box>
                          <Typography variant="body1">{option.name}</Typography>
                          {option.description && (
                            <Typography variant="body2" color="text.secondary">
                              {option.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={option.name}
                        color="info"
                        size="small"
                        variant="outlined"
                        onDelete={() => {
                          const newMaterials = selectedMaterials.filter(id => id !== option.id);
                          setSelectedMaterials(newMaterials);
                        }}
                        deleteIcon={<DeleteIcon />}
                      />
                    ))
                  }
                  isOptionEqualToValue={(option, value) => option.id === value?.id}
                  noOptionsText="Không tìm thấy chất liệu"
                  clearOnEscape
                  clearText="Xóa tất cả"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    width: '100%'
                  }
                }}>
                  <InputLabel>Giới tính</InputLabel>
                  <Select
                    name="gender"
                    value={form.gender || ''}
                    onChange={handleChange}
                    label="Giới tính"
                  >
                    <MenuItem value="Nam">Nam</MenuItem>
                    <MenuItem value="Nữ">Nữ</MenuItem>
                    <MenuItem value="Unisex"> Unisex</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              
              <Grid item xs={12}>
                <Box sx={{ 
                  border: '2px dashed #ccc', 
                  borderRadius: 2, 
                  p: 3, 
                  textAlign: 'center',
                  backgroundColor: '#fafafa',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: '#f0f8ff'
                  }
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                      sx={{ 
                        mb: 2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Tải lên hình ảnh
                    </Button>
                  </label>
                  
                  {uploading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography variant="body2" color="primary">
                        Đang tải ảnh lên...
                      </Typography>
                    </Box>
                  )}
                  
                  {form.imageUrl && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Hình ảnh hiện tại:
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <Avatar
                          src={form.imageUrl}
                          alt="Product"
                          sx={{ 
                            width: 120, 
                            height: 120,
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                          variant="rounded"
                        />
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="body2" color="text.secondary">
                             Hình ảnh đã được tải lên thành công
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Kích thước: 120x120px
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  
                  {!form.imageUrl && !uploading && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Chọn hình ảnh cho sản phẩm
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          justifyContent: 'space-between'
        }}>
          <Button 
            onClick={closeModal} 
            color="inherit"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5
            }}
          >
            Hủy 
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              backgroundColor: '#3b82f6', // màu xanh dương đơn giản
              '&:hover': {
                backgroundColor: '#2563eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {editingProduct ? " Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Variant Management Modal */}
      <Dialog 
        open={variantModalOpen} 
        onClose={closeVariantModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#8b5cf6', // màu tím
          color: 'white',
          fontWeight: 'bold'
        }}>
           Quản lý biến thể sản phẩm
        </DialogTitle>
        
        <DialogContent sx={{ p: 4, maxHeight: '80vh', overflow: 'auto' }}>
          {selectedProduct && (
            <Box>
              <Box sx={{ mb: 2, p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                  <Box display="flex" alignItems="center" sx={{ mb: 2 }}>

                      <img
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          style={{ width: 50, height: 50, marginRight: '1rem', objectFit: 'cover' }}
                      />


                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {selectedProduct.name}
                      </Typography>
                  </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Chip 
                    label={`Giá: ${selectedProduct.price.toLocaleString('vi-VN')}đ`} 
                    color="primary" 
                    size="small" 
                  />
                  <Chip 
                    label={`Số lượng: ${selectedProduct.instock}`}
                    color={selectedProduct.instock > 0 ? 'success' : 'error'} 
                    size="small" 
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Biến thể hiện tại ({variants.length})
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => openVariantForm()}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Thêm biến thể mới
                </Button>
              </Box>

              {variants.length === 0 ? (
                <Box sx={{ 
                  p: 4, 
                  border: '2px dashed #e2e8f0', 
                  borderRadius: 2, 
                  textAlign: 'center',
                  backgroundColor: '#fafafa'
                }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                     Chưa có biến thể nào
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tạo biến thể đầu tiên cho sản phẩm này
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Màu sắc</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Kích cỡ</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Số Lượng</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Mã</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Hình ảnh</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {variants.map((variant) => (
                        <TableRow key={variant.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {variant.color?.hexCode && (
                                <Box
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    backgroundColor: variant.color.hexCode,
                                    border: '1px solid #ccc'
                                  }}
                                />
                              )}
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {variant.color?.name || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {variant.sku || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={variant.size?.name || 'N/A'} 
                              color="info" 
                              size="small" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={variant.stockQuantity} 
                              color={variant.stockQuantity > 0 ? 'success' : 'error'} 
                              size="small" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {variant.sku ? `${variant.sku}-${variant.size?.name}` : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {variant.imageUrl ? (
                              <Avatar
                                src={variant.imageUrl}
                                alt="Variant"
                                sx={{ width: 40, height: 40 }}
                                variant="rounded"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                N/A
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={variant.isActive ? 'Hoạt động' : 'Tạm dừng'} 
                              color={variant.isActive ? 'success' : 'default'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Chỉnh sửa">
                                <IconButton 
                                  color="primary" 
                                  onClick={() => openVariantForm(variant)}
                                  size="small"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton 
                                  color="error" 
                                  onClick={() => handleDeleteVariant(variant.id)}
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0'
        }}>
          <Button 
            onClick={closeVariantModal} 
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              backgroundColor: '#8b5cf6',
              '&:hover': {
                backgroundColor: '#7c3aed',
              }
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Variant Form Modal */}
      <Dialog 
        open={variantFormOpen} 
        onClose={closeVariantForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#10b981', // màu xanh lá
          color: 'white',
          fontWeight: 'bold'
        }}>
          {editingVariant ? "Chỉnh sửa biến thể" : "Thêm biến thể mới"}
        </DialogTitle>
        
        <DialogContent sx={{ 
          p: 0, 
          maxHeight: '85vh', 
          overflow: 'auto',
          backgroundColor: '#f8fafc'
        }}>
          <Box component="form" onSubmit={handleSaveVariant} sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header Section */}
            <Box sx={{ 
              p: 3, 
              backgroundColor: 'white', 
              borderBottom: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
                {editingVariant ? "Chỉnh sửa biến thể" : "Thêm biến thể mới"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tạo biến thể sản phẩm với màu sắc và kích cỡ khác nhau
              </Typography>
            </Box>

            {/* Stock Information */}
            <Box sx={{ 
              p: 3, 
              backgroundColor: '#f0f9ff', 
              borderBottom: '1px solid #e2e8f0',
              borderLeft: '4px solid #3b82f6'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#1e40af' }}>
                📊 Thông tin tồn kho
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e40af' }}>
                    {selectedProduct?.instock}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tổng tồn kho
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#059669' }}>
                    {getTotalVariantStock()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Đã phân bổ
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#585757' }}>
                    {getRemainingStock()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Còn lại
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Form Content */}
            <Box sx={{ 
              p: 3,
              backgroundColor: 'white'
            }}>
              <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box className="color-picker-container" sx={{ 
                  position: 'relative',
                  p: 3,
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  backgroundColor: '#fafafa'
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                    Màu sắc *
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 2,
                    border: '2px solid #e2e8f0',
                    borderRadius: 2,
                    backgroundColor: '#fafafa',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '#10b981',
                      backgroundColor: '#f0fdf4'
                    }
                  }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: selectedColor,
                        border: '3px solid #fff',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        flexShrink: 0
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedColorName || 'Chọn màu sắc'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedColor}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {showColorPicker ? '▲' : '▼'}
                    </Typography>
                  </Box>

                  {showColorPicker && (
                    <Box sx={{ 
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      mt: 1,
                      backgroundColor: 'white',
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      border: '1px solid #e2e8f0'
                    }}>
                      {/* Close button */}
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        zIndex: 1001 
                      }}>
                        <button
                          onClick={() => setShowColorPicker(false)}
                          className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                          title="Đóng color picker"
                        >
                          <XIcon size={14} className="text-gray-600" />
                        </button>
                      </Box>
                      {/* Hiển thị 7 màu cầu vồng cơ bản */}
                      <Box 
                        sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          7 màu cơ bản:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {[
                            { name: 'Đỏ', hex: '#FF0000' },
                            { name: 'Cam', hex: '#FFA500' },
                            { name: 'Vàng', hex: '#FFFF00' },
                            { name: 'Xanh lá', hex: '#00FF00' },
                            { name: 'Xanh dương', hex: '#0000FF' },
                            { name: 'Chàm', hex: '#4B0082' },
                            { name: 'Tím', hex: '#8B00FF' }
                          ].map((color, index) => (
                            <Chip
                              key={index}
                              label={color.name}
                              onClick={() => {
                                setSelectedColor(color.hex);
                                setSelectedColorName(color.name);
                                // Tìm màu trong database hoặc tạo mới
                                const existingColor = colors.find(c => c.hexCode?.toLowerCase() === color.hex.toLowerCase());
                                if (existingColor) {
                                  setVariantForm({ ...variantForm, colorId: existingColor.id });
                                } else {
                                  // Sẽ tạo màu mới khi lưu variant
                                  setVariantForm({ ...variantForm, colorId: 0 });
                                }
                                // Color picker stays open
                              }}
                              sx={{
                                backgroundColor: color.hex,
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600,
                                '&:hover': {
                                  opacity: 0.8,
                                  transform: 'scale(1.05)'
                                }
                              }}
                              size="small"
                            />
                          ))}
                        </Box>
                      </Box>
                      
                      <Box 
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <ChromePicker
                          color={selectedColor}
                          onChange={handleColorChange}
                          onChangeComplete={handleColorChangeComplete}
                          disableAlpha
                        />
                      </Box>
                      
                      <Box 
                        sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label="Tên màu (tự động điền theo màu đã chọn)"
                          value={selectedColorName}
                          onChange={(e) => setSelectedColorName(e.target.value)}
                          placeholder="Tự động điền hoặc nhập tên tùy chỉnh..."
                          helperText="Tên màu sẽ tự động điền khi chọn màu từ color picker"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1,
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 3,
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  backgroundColor: '#fafafa'
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                    📏 Kích cỡ *
                  </Typography>
                  
                  {/* Hiển thị kích cỡ có sẵn từ database */}
                  {sizes.length > 0 && (
                    <Box sx={{ 
                      mb: 2, 
                      p: 2, 
                      border: '1px solid #e2e8f0', 
                      borderRadius: 2, 
                      backgroundColor: '#f8fafc' 
                    }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#374151' }}>
                        Kích cỡ có sẵn:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {sizes.map((size) => (
                          <Chip
                            key={size.id}
                            label={size.name}
                            onClick={() => {
                              if (!selectedSizes.includes(size.name)) {
                                setSelectedSizes([...selectedSizes, size.name]);
                              }
                            }}
                            sx={{
                              backgroundColor: selectedSizes.includes(size.name) ? '#3b82f6' : '#e5e7eb',
                              color: selectedSizes.includes(size.name) ? 'white' : '#374151',
                              cursor: 'pointer',
                              fontWeight: 500,
                              border: selectedSizes.includes(size.name) ? 'none' : '1px solid #d1d5db',
                              '&:hover': {
                                backgroundColor: selectedSizes.includes(size.name) ? '#2563eb' : '#d1d5db',
                                transform: 'scale(1.05)',
                                transition: 'all 0.2s ease'
                              }
                            }}
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1, 
                    mb: 2,
                    p: 3,
                    border: '2px solid #e2e8f0',
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                    minHeight: 80,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    {selectedSizes.map((size, index) => (
                      <Chip
                        key={index}
                        label={size}
                        onDelete={() => setSelectedSizes(prev => prev.filter((_, i) => i !== index))}
                        color="primary"
                        variant="filled"
                        size="small"
                        sx={{ 
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          fontWeight: 600,
                          '& .MuiChip-deleteIcon': {
                            color: 'white',
                            '&:hover': {
                              color: '#fef2f2'
                            }
                          },
                          '&:hover': {
                            backgroundColor: '#2563eb'
                          }
                        }}
                      />
                    ))}
                    {selectedSizes.length === 0 && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: '100%',
                        color: '#6b7280'
                      }}>
                        <Typography variant="body2" sx={{ 
                          fontStyle: 'italic',
                          textAlign: 'center'
                        }}>
                          Chưa chọn kích cỡ 
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <TextField
                    fullWidth
                    size="small"
                    label="Thêm kích cỡ mới"
                    placeholder="Ví dụ: XXL, 2XL, 3XL..."
                    value={variantForm.sizeName}
                    onChange={(e) => setVariantForm({ ...variantForm, sizeName: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (variantForm.sizeName.trim() && !selectedSizes.includes(variantForm.sizeName.trim())) {
                          setSelectedSizes(prev => [...prev, variantForm.sizeName.trim()]);
                          setVariantForm({ ...variantForm, sizeName: '' });
                        }
                      }
                    }}
                    variant="outlined"
                    helperText="Nhấn Enter để thêm kích cỡ mới"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#f9fafb',
                        '&:hover': {
                          backgroundColor: '#ffffff'
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#ffffff',
                          boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#6b7280'
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#3b82f6'
                      }
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 3,
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  backgroundColor: '#fafafa'
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                    Số lượng tồn kho *
                  </Typography>
                  <TextField
                    fullWidth
                    label="Nhập số lượng"
                    type="number"
                    value={variantForm.stockQuantity}
                    onChange={(e) => setVariantForm({ ...variantForm, stockQuantity: Number(e.target.value) })}
                    required
                    variant="outlined"
                    size="small"
                    inputProps={{ min: 0, max: getRemainingStock() }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white',
                        '&:hover': {
                          backgroundColor: '#f9fafb'
                        }
                      }
                    }}
                    helperText={`Tối đa: ${getRemainingStock()} sản phẩm`}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 3,
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  backgroundColor: '#fafafa'
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
                    Mã
                  </Typography>
                  <TextField
                    fullWidth
                    label="Nhập Mã"
                    value={variantForm.sku}
                    onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white',
                        '&:hover': {
                          backgroundColor: '#f9fafb'
                        }
                      }
                    }}
                    helperText="Mã riêng cho biến thể này (tùy chọn)"
                    placeholder="Ví dụ: TSHIRT-RED-M"
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ 
                  p: 3, 
                  border: '2px dashed #d1d5db', 
                  borderRadius: 2,
                  textAlign: 'center',
                  backgroundColor: '#fafafa'
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Hình ảnh biến thể (tùy chọn)
                  </Typography>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleVariantImageUpload}
                    style={{ display: 'none' }}
                    id="variant-image-upload"
                  />
                  
                  <label htmlFor="variant-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                      disabled={uploading}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        mb: 2
                      }}
                    >
                      {uploading ? 'Đang tải...' : 'Chọn hình ảnh'}
                    </Button>
                  </label>

                  {variantForm.imageUrl && (
                    <Box sx={{ mt: 2 }}>
                      <Avatar
                        src={variantForm.imageUrl}
                        alt="Variant Preview"
                        sx={{ 
                          width: 120, 
                          height: 120,
                          borderRadius: 2,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          mx: 'auto'
                        }}
                        variant="rounded"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Hình ảnh đã chọn
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          backgroundColor: 'white',
          borderTop: '1px solid #e2e8f0',
          boxShadow: '0 -1px 3px rgba(0,0,0,0.1)'
        }}>
          <Button 
            onClick={closeVariantForm} 
            color="inherit"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5
            }}
          >
            Hủy bỏ
          </Button>
          <Button 
            onClick={handleSaveVariant} 
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              backgroundColor: '#10b981',
              '&:hover': {
                backgroundColor: '#059669',
              }
            }}
          >
            {editingVariant ? " Cập nhật biến thể" : "Tạo biến thể mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
