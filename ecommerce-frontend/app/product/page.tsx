'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { fetchProducts } from '@/app/services/api';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { FiShoppingCart, FiHeart, FiSearch, FiFilter, FiGrid, FiList, FiLoader, FiStar } from 'react-icons/fi';
import MultiSelectSearch from '@/components/ui/MultiSelectSearch';
import SingleSelectSearch from '@/components/ui/SingleSelectSearch';
import toast from 'react-hot-toast';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(query);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [clothingType, setClothingType] = useState<string>('');
  const [materials, setMaterials] = useState<string[]>([]);
  const [clothingTypeOptions, setClothingTypeOptions] = useState<any[]>([]);
  const [materialOptions, setMaterialOptions] = useState<any[]>([]);
  const { addItemToCart } = useCart();

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProducts();
      setProducts(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy sản phẩm:", err);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      // Load clothing types
      const clothingTypesResponse = await fetch('http://localhost:5091/api/products/clothing-types');
      if (clothingTypesResponse.ok) {
        const clothingTypesData = await clothingTypesResponse.json();
        setClothingTypeOptions(clothingTypesData);
      }
      
      // Load materials
      const materialsResponse = await fetch('http://localhost:5091/api/products/materials');
      if (materialsResponse.ok) {
        const materialsData = await materialsResponse.json();
        setMaterialOptions(materialsData);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
      // Fallback to hardcoded options if API fails
      setClothingTypeOptions([
        { id: 1, name: 'Áo thun' },
        { id: 2, name: 'Áo sơ mi' },
        { id: 3, name: 'Áo khoác' },
        { id: 4, name: 'Áo len' },
        { id: 5, name: 'Áo vest' },
        { id: 6, name: 'Quần jean' },
        { id: 7, name: 'Quần short' },
        { id: 8, name: 'Quần dài' },
        { id: 9, name: 'Váy' },
        { id: 10, name: 'Đầm' }
      ]);
      setMaterialOptions([
        { id: 1, name: 'Cotton' },
        { id: 2, name: 'Polyester' },
        { id: 3, name: 'Denim' },
        { id: 4, name: 'Silk' },
        { id: 5, name: 'Wool' },
        { id: 6, name: 'Linen' },
        { id: 7, name: 'Leather' },
        { id: 8, name: 'Knit' },
        { id: 9, name: 'Chiffon' },
        { id: 10, name: 'Satin' }
      ]);
    }
  };

  const handleAddToCart = async (productId: number) => {
    setAddingToCart(productId);
    try {
      await addItemToCart(productId, 1);
      toast.success("Đã thêm vào giỏ hàng");
    } catch (err) {
      toast.error("Vui lòng đăng nhập để mua hàng");
    } finally {
      setAddingToCart(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/product?q=${encodeURIComponent(searchTerm)}`);
    }
  };


  const clearFilters = () => {
    setClothingType('');
    setMaterials([]);
    setSearchTerm('');
  };

  const filteredAndSortedProducts = products
    .filter(product => {
      // Lọc theo tìm kiếm
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Lọc theo loại áo
      const matchesClothingType = !clothingType || 
        product.clothingType?.name?.toLowerCase().includes(clothingType.toLowerCase()) ||
        product.name.toLowerCase().includes(clothingType.toLowerCase());
      
      // Lọc theo chất liệu
      const matchesMaterial = materials.length === 0 || 
        materials.some(material => 
          product.productMaterials?.some((pm: any) => 
            pm.material?.name?.toLowerCase().includes(material.toLowerCase())
          ) ||
          product.description.toLowerCase().includes(material.toLowerCase())
        );
      
      return matchesSearch && matchesClothingType && matchesMaterial;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stock':
          return b.instock - a.instock;
        default:
          return 0;
      }
    });

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadProducts(),
        loadFilterOptions()
      ]);
    };
    loadData();
  }, []);

  // Cập nhật searchTerm khi query từ URL thay đổi
  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm uppercase tracking-wide">Đang tải sản phẩm</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="bg-white border border-gray-200 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-8">
                <FiLoader className="text-black text-2xl" />
              </div>
              <h2 className="text-2xl font-light text-black mb-4 tracking-wider">Có lỗi xảy ra</h2>
              <p className="text-gray-600 mb-8 text-sm">{error}</p>
              <button
                onClick={loadProducts}
                className="bg-black text-white px-8 py-3 font-normal text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors"
              >
                Thử lại
              </button>
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
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-black font-medium">Sản phẩm</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-black mb-4 tracking-wider">Tất cả sản phẩm</h1>
          <p className="text-gray-600 text-sm">Khám phá bộ sưu tập sản phẩm đa dạng của chúng tôi</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white border border-gray-200 p-8 mb-12">
          <div className="flex flex-col gap-6">
            {/* Search and Controls Row */}
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </form>

              {/* Sort and View Controls */}
              <div className="flex items-center gap-6">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <FiFilter className="text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors text-sm"
                  >
                    <option value="name">Sắp xếp theo tên</option>
                    <option value="price-low">Giá thấp đến cao</option>
                    <option value="price-high">Giá cao đến thấp</option>
                    <option value="stock">Tồn kho</option>
                  </select>
                </div>

                {/* View Mode */}
                <div className="flex items-center gap-1 bg-gray-100 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-white border border-gray-300' : 'hover:bg-gray-200'} transition-colors`}
                    title="Xem dạng lưới"
                  >
                    <FiGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-white border border-gray-300' : 'hover:bg-gray-200'} transition-colors`}
                    title="Xem dạng danh sách"
                  >
                    <FiList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Options */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Clothing Type Filter */}
                <div>
                  <SingleSelectSearch
                    options={clothingTypeOptions}
                    selectedValue={clothingType}
                    onSelectionChange={setClothingType}
                    placeholder="Tìm kiếm loại áo..."
                    label="Loại áo"
                    loading={false}
                  />
                </div>

                {/* Material Filter */}
                <div>
                  <MultiSelectSearch
                    options={materialOptions}
                    selectedValues={materials}
                    onSelectionChange={setMaterials}
                    placeholder="Tìm kiếm chất liệu..."
                    label="Chất liệu"
                    loading={false}
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              {(clothingType || materials.length > 0 || searchTerm) && (
                <div className="mt-4">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-colors text-sm uppercase tracking-wide"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-gray-600 text-sm uppercase tracking-wide">
            Hiển thị {filteredAndSortedProducts.length} sản phẩm
            {searchTerm && ` cho "${searchTerm}"`}
            {clothingType && ` - Loại áo: ${clothingType}`}
            {materials.length > 0 && ` - Chất liệu: ${materials.join(', ')}`}
          </p>
        </div>

        {/* Products Grid/List */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-8">
              <FiSearch className="text-black text-2xl" />
            </div>
            <h2 className="text-2xl font-light text-black mb-4 tracking-wider">Không tìm thấy sản phẩm</h2>
            <p className="text-gray-600 mb-8 text-sm">
              {searchTerm ? `Không có sản phẩm nào phù hợp với "${searchTerm}"` : 'Hiện tại chưa có sản phẩm nào'}
            </p>
            <Link
              href="/categories"
              className="inline-block bg-black text-white px-8 py-3 font-normal text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors"
            >
              Khám phá danh mục
            </Link>
          </div>
        ) : (
          <div className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredAndSortedProducts.map((product) => (
              <div key={product.id} className="group bg-white border border-gray-200 hover:border-black transition-colors duration-200 overflow-hidden">
                <Link href={`/product/${product.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.imageUrl || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          // Add to wishlist functionality
                        }}
                        className="p-2 bg-white border border-gray-300 hover:border-black transition-colors"
                        title="Thêm vào yêu thích"
                      >
                        <FiHeart className="w-4 h-4 text-gray-600 hover:text-black transition-colors" />
                      </button>
                    </div>
                    {product.instock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <span className="bg-white bg-opacity-80 text-black px-3 py-1 text-xs font-normal uppercase tracking-wide">
                          Hết hàng
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-lg font-light text-black mb-3 line-clamp-2 tracking-wide">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-xs mb-6 line-clamp-2">
                      {product.description}
                    </p>
                    
                    {/* Product Details */}
                    <div className="space-y-2 mb-6">
                      {product.productMaterials && product.productMaterials.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Chất liệu:</span>
                          <div className="flex flex-wrap gap-1">
                            {product.productMaterials.slice(0, 2).map((pm: any) => (
                              <span key={pm.id} className="text-xs text-gray-700 bg-gray-100 px-1 py-0.5">
                                {pm.material ? pm.material.name : 'N/A'}
                              </span>
                            ))}
                            {product.productMaterials.length > 2 && (
                              <span className="text-xs text-gray-500">+{product.productMaterials.length - 2}</span>
                            )}
                          </div>
                        </div>
                      )}
                      {product.clothingType && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Loại:</span>
                          <span className="text-xs text-gray-700">{product.clothingType.name}</span>
                        </div>
                      )}
                      {product.gender && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Giới tính:</span>
                          <span className="text-xs text-gray-700">{product.gender}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-1">
                        <FiStar className="w-4 h-4 text-gray-400 fill-current" />
                        <span className="text-xs text-gray-600">4.5</span>
                      </div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        Còn {product.instock} sản phẩm
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-light text-black tracking-wide">
                        {product.price?.toLocaleString()}₫
                      </span>
                    </div>
                  </div>
                </Link>
                
                <div className="px-8 pb-8">
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingToCart === product.id || product.instock === 0}
                    className="w-full bg-black text-white font-normal text-sm uppercase tracking-wide py-3 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addingToCart === product.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <FiShoppingCart className="w-4 h-4" />
                        Thêm vào giỏ hàng
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-16 text-center">
          <div className="bg-black text-white p-12">
            <h3 className="text-xl font-light text-white mb-6 tracking-wider">Cần hỗ trợ?</h3>
            <p className="text-gray-300 mb-8 text-sm">
              Liên hệ với chúng tôi để được tư vấn sản phẩm phù hợp nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-black px-8 py-3 font-normal text-sm uppercase tracking-wide hover:bg-gray-200 transition-colors"
              >
                Liên hệ hỗ trợ
              </Link>
              <Link
                href="/categories"
                className="bg-white border border-gray-300 text-black px-8 py-3 font-normal text-sm uppercase tracking-wide hover:border-black transition-colors"
              >
                Xem danh mục
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm uppercase tracking-wide">Đang tải...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}