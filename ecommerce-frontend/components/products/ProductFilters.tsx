'use client';

import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';

interface FilterProps {
  onFilterChange: (filters: {
    priceRange: [number, number];
    brands: string[];
    ratings: number[];
    sortBy: string;
  }) => void;
}

const ProductFilters = ({ onFilterChange }: FilterProps) => {
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 2000000]);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = React.useState<number[]>([]);
  const [sortBy, setSortBy] = React.useState('newest');
  const [isFilterOpen, setIsFilterOpen] = React.useState(true);

  // Danh sách thương hiệu thời trang
  const brands = [
    'UNIQLO',
    'H&M',
    'ZARA',
    'Routine',
    'Owen',
    'Vascara',
    'JUNO',
    'IVY moda',
    'CANIFA'
  ];

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    if (type === 'min') {
      setPriceRange([numValue, priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], numValue]);
    }
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleRatingToggle = (rating: number) => {
    setSelectedRatings(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  React.useEffect(() => {
    onFilterChange({
      priceRange,
      brands: selectedBrands,
      ratings: selectedRatings,
      sortBy,
    });
  }, [priceRange, selectedBrands, selectedRatings, sortBy, onFilterChange]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full flex items-center justify-between p-4 bg-[#FFB629] text-white rounded-t-lg hover:bg-[#ffa600] transition-colors font-semibold"
        >
          <span>Bộ lọc</span>
          <FiChevronDown className={`transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block p-4`}>
        {/* Sort By */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Sắp xếp theo</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-[#FFB629] bg-white text-gray-800"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_low">Giá: Thấp đến Cao</option>
            <option value="price_high">Giá: Cao đến Thấp</option>
            <option value="popular">Phổ biến nhất</option>
            <option value="discount">Giảm giá nhiều</option>
            <option value="bestseller">Bán chạy nhất</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Khoảng giá</h3>
          <div className="flex gap-4">
            <div>
              <label className="text-sm text-gray-800 font-medium">Từ</label>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-[#FFB629] bg-white text-gray-800"
                min="0"
                step="10000"
              />
            </div>
            <div>
              <label className="text-sm text-gray-800 font-medium">Đến</label>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-[#FFB629] bg-white text-gray-800"
                min="0"
                step="10000"
              />
            </div>
          </div>
        </div>

        {/* Brands */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Thương hiệu</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                  className="rounded text-[#FFB629] focus:ring-[#FFB629] border-gray-200"
                />
                <span className="ml-2 text-gray-800">{brand}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ratings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Đánh giá</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedRatings.includes(rating)}
                  onChange={() => handleRatingToggle(rating)}
                  className="rounded text-[#FFB629] focus:ring-[#FFB629] border-gray-200"
                />
                <span className="ml-2 flex items-center text-gray-800">
                  {[...Array(rating)].map((_, i) => (
                    <AiFillStar key={i} className="text-[#FFB629] text-lg" />
                  ))}
                  {[...Array(5 - rating)].map((_, i) => (
                    <AiFillStar key={i} className="text-gray-200 text-lg" />
                  ))}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={() => {
            setPriceRange([0, 2000000]);
            setSelectedBrands([]);
            setSelectedRatings([]);
            setSortBy('newest');
          }}
          className="w-full py-2 px-4 bg-orange-50 text-gray-800 font-medium rounded hover:bg-orange-100 transition-colors"
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
};

export default ProductFilters; 