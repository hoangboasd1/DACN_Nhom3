'use client';

import React, { useEffect, useState } from 'react';
import { fetchProducts, addToCart } from '@/app/services/api';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const initialSort = (searchParams.get('sort') || 'name-asc') as SortOption;

  const [searchTerm, setSearchTerm] = useState(query);
  const [filters, setFilters] = useState({
    priceRange: [0, 2000000] as [number, number],
    brands: [] as string[],
    ratings: [] as number[],
    sortBy: initialSort,
  });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cập nhật filters khi sortBy thay đổi để đồng bộ select bên ngoài
  useEffect(() => {
    setFilters((prev) => ({ ...prev, sortBy: initialSort }));
  }, [initialSort]);

  // Hàm fetch sản phẩm
  const fetchSearchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProducts();
      let filtered = res.data.filter(
        (product: any) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );

      // Lọc theo brands nếu chọn
      if (filters.brands.length > 0) {
        filtered = filtered.filter((p: { category: { name: any; }; brand: any; }) => filters.brands.includes(p?.category?.name || '') || filters.brands.includes(p?.brand || ''));
      }

      // Lọc theo khoảng giá
      filtered = filtered.filter((p: { price: number; }) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);

      // Lọc theo đánh giá
      if (filters.ratings.length > 0) {
        filtered = filtered.filter((p: { rating: number; }) => filters.ratings.includes(Math.floor(p.rating) || 0));
      }

      // Sắp xếp
      filtered = filtered.sort((a: { price: number; }, b: { price: number; }) => {
        switch (filters.sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          default:
            return 0;
        }
      });

      setProducts(filtered);
    } catch {
      setError('Lỗi khi tải kết quả tìm kiếm. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setProducts([]);
      setError('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }
    fetchSearchResults();
  }, [searchTerm, filters]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}&sort=${encodeURIComponent(filters.sortBy)}`);
      setSearchTerm(trimmed);
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart({ productId, quantity: 1 });
      alert('Đã thêm vào giỏ hàng!');
    } catch {
      alert('Vui lòng đăng nhập để mua hàng!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-10 px-6">
  <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <a className="text-orange-500" > Giỏ hàng </a>
          </h1>
          <div/>
          <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow font-medium flex items-center gap-2">
           Trang chủ
          </Link>
        </div>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        

        {/* Phần kết quả tìm kiếm */}
        <section className="flex-1">
          <h1 className="text-4xl font-extrabold text-orange-700 mb-8 select-none">
            Kết quả tìm kiếm: <span className="text-orange-900">{searchTerm}</span>
          </h1>

          {/* Thanh tìm kiếm */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex max-w-4xl mx-auto mb-8 rounded-lg shadow-lg overflow-hidden border border-orange-300"
            role="search"
            aria-label="Tìm kiếm sản phẩm"
          >
            <input
              type="search"
              name="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm..."
              className="flex-grow px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-400"
              aria-label="Nhập từ khóa tìm kiếm"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 flex items-center justify-center transition-colors"
              aria-label="Thực hiện tìm kiếm"
            >
              <SearchIcon className="w-6 h-6" />
            </button>
          </form>

          {/* Loading, error, empty */}
          {loading && <p className="text-center text-gray-600 text-xl">Đang tải kết quả...</p>}
          {error && <p className="text-center text-red-600 text-xl">{error}</p>}
          {!loading && !error && products.length === 0 && (
            <p className="text-center text-gray-600 text-xl">
              Không tìm thấy sản phẩm phù hợp với từ khóa &ldquo;
              <mark className="bg-orange-200 px-2 rounded font-semibold">{searchTerm}</mark>&rdquo;.
            </p>
          )}

          {/* Sản phẩm */}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden transform hover:-translate-y-3 hover:shadow-2xl transition cursor-pointer flex flex-col"
                >
                  <Link href={`/product/${product.id}`} className="block flex-grow group relative">
                    <img
                      src={product.imageUrl || '/placeholder.png'}
                      alt={product.name}
                      loading="lazy"
                      className="object-cover w-full h-60 rounded-t-3xl transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="p-6 space-y-3">
                      <h2 className="text-xl font-semibold text-gray-900 truncate">{product.name}</h2>
                      <p className="text-gray-600 text-sm line-clamp-2 min-h-[3rem]">{product.description || 'Không có mô tả'}</p>
                      <p className="text-2xl font-extrabold text-orange-600">{product.price?.toLocaleString()}₫</p>
                      <p className="text-sm text-gray-400">Tồn kho: {product.stock}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-b-3xl transition flex items-center justify-center gap-2"
                    aria-label={`Thêm ${product.name} vào giỏ hàng`}
                  >
                    <ShoppingCartIcon fontSize="medium" />
                    <span>Thêm vào giỏ</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
