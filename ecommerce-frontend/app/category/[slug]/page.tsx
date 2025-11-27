'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import Pagination from '@/components/ui/Pagination';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  slug: string;
  rating: number;
  brand: string;
  createdAt: string;
  discountPrice?: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
}

interface Filters {
  priceRange: [number, number];
  sortBy: string;
  clothingType: string;
  materials: string[];
}

export default function CategoryPage() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 2000000],
    sortBy: 'newest',
    clothingType: '',
    materials: []
  });

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        // Convert slug to ID (assuming slug is the ID for now)
        const categoryId = params.slug;
        
        const categoryResponse = await fetch(`http://localhost:5091/api/categories/${categoryId}`);
        if (!categoryResponse.ok) {
          throw new Error('Failed to fetch category');
        }
        const categoryData = await categoryResponse.json();
        setCategory(categoryData);

        // Fetch products by category using the existing API
        const productsResponse = await fetch(`http://localhost:5091/api/products/by-category/${categoryId}`);
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const productsData = await productsResponse.json();
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (err) {
        setError('Failed to load category and products');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchCategoryAndProducts();
    }
  }, [params.slug]);

  useEffect(() => {
    let result = [...products];

    // Apply price filter
    result = result.filter(
      product => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Apply clothing type filter
    if (filters.clothingType) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(filters.clothingType.toLowerCase()) ||
        (product as any).clothingType?.name?.toLowerCase().includes(filters.clothingType.toLowerCase())
      );
    }

    // Apply material filter
    if (filters.materials.length > 0) {
      result = result.filter(product => 
        filters.materials.some(material => 
          product.description.toLowerCase().includes(material.toLowerCase()) ||
          (product as any).productMaterials?.some((pm: any) => 
            pm.material?.name?.toLowerCase().includes(material.toLowerCase())
          )
        )
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, products]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-16">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-gray-200 h-64"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !category) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h2 className="text-2xl font-light text-black mb-4 tracking-wider">Error</h2>
              <p className="text-gray-600 mt-2 text-sm">{error || 'Category not found'}</p>
              <Link href="/" className="text-black hover:text-gray-600 mt-6 inline-block font-normal text-sm uppercase tracking-wide">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          {/* Breadcrumbs */}
          <div className="mb-8">
            <nav className="text-gray-600 text-sm font-medium">
              <ol className="list-none p-0 inline-flex">
                <li className="flex items-center">
                  <Link href="/" className="text-black hover:text-gray-600 transition-colors">
                    Trang chủ
                  </Link>
                  <span className="mx-2">/</span>
                </li>
                <li className="text-black font-medium">{category.name}</li>
              </ol>
            </nav>
          </div>

        {/* Category Header */}
        <div className="mb-12 bg-white border border-gray-200 p-8">
          <h1 className="text-3xl font-light text-black mb-4 tracking-wider">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600 text-sm">{category.description}</p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <ProductFilters onFilterChange={setFilters} />
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Results Summary */}
            <div className="mb-8 bg-white border border-gray-200 p-6">
              <p className="text-gray-600 font-normal text-sm uppercase tracking-wide">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} trong{' '}
                <span className="font-normal">{filteredProducts.length}</span> sản phẩm
                {filters.clothingType && ` - Loại áo: ${filters.clothingType}`}
                {filters.materials.length > 0 && ` - Chất liệu: ${filters.materials.join(', ')}`}
              </p>
            </div>

            {currentProducts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-200">
                <p className="text-gray-600 font-normal text-sm uppercase tracking-wide">
                  Không tìm thấy sản phẩm phù hợp với tiêu chí của bạn.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 bg-white border border-gray-200 p-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 