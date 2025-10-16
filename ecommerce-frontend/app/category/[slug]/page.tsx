'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
  brands: string[];
  ratings: number[];
  sortBy: string;
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
    priceRange: [0, 1000],
    brands: [],
    ratings: [],
    sortBy: 'newest'
  });

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        const categoryResponse = await fetch(`/api/categories/${params.slug}`);
        if (!categoryResponse.ok) {
          throw new Error('Failed to fetch category');
        }
        const categoryData = await categoryResponse.json();
        setCategory(categoryData);

        const productsResponse = await fetch(`/api/categories/${params.slug}/products`);
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

    // Apply brand filter
    if (filters.brands.length > 0) {
      result = result.filter(product => filters.brands.includes(product.brand));
    }

    // Apply rating filter
    if (filters.ratings.length > 0) {
      result = result.filter(product => filters.ratings.includes(product.rating));
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
        result.sort((a, b) => b.rating - a.rating);
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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-orange-100 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-orange-50 h-64 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Error</h2>
          <p className="text-gray-800 mt-2">{error || 'Category not found'}</p>
          <Link href="/" className="text-[#FFB629] hover:text-[#ffa600] mt-4 inline-block font-medium">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <nav className="text-gray-800 text-sm font-medium">
            <ol className="list-none p-0 inline-flex">
              <li className="flex items-center">
                <Link href="/" className="text-[#FFB629] hover:text-[#ffa600] font-semibold">
                  Trang chủ
                </Link>
                <span className="mx-2">/</span>
              </li>
              <li className="text-gray-900 font-semibold">{category.name}</li>
            </ol>
          </nav>
        </div>

        {/* Category Header */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-gray-800">{category.description}</p>
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
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-800 font-medium">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of{' '}
                <span className="font-semibold">{filteredProducts.length}</span> products
              </p>
            </div>

            {currentProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-800 font-medium">No products found matching your criteria.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 bg-white p-4 rounded-lg shadow-sm">
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
  );
} 