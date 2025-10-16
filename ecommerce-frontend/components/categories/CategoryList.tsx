'use client';

import React from 'react';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

const CategoryList = () => {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="absolute top-full left-0 bg-white shadow-lg rounded-b-lg w-64 py-2 z-50">
        <div className="animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-4 py-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-full left-0 bg-white shadow-lg rounded-b-lg w-64 p-4 z-50">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 bg-white shadow-lg rounded-b-lg w-64 z-50">
      <ul className="py-2">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/category/${category.slug}`}
              className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
            >
              <span className="text-gray-700">{category.name}</span>
              <FiChevronRight className="text-gray-400" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList; 