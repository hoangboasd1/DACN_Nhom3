'use client';

import React from 'react';
import { FiChevronDown, FiFilter } from 'react-icons/fi';
import MultiSelectSearch from '@/components/ui/MultiSelectSearch';
import SingleSelectSearch from '@/components/ui/SingleSelectSearch';

interface FilterProps {
  onFilterChange: (filters: {
    priceRange: [number, number];
    sortBy: string;
    clothingType: string;
    materials: string[];
  }) => void;
}

interface ClothingType {
  id: number;
  name: string;
}

interface Material {
  id: number;
  name: string;
}

const ProductFilters = ({ onFilterChange }: FilterProps) => {
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 2000000]);
  const [sortBy, setSortBy] = React.useState('newest');
  const [clothingType, setClothingType] = React.useState<string>('');
  const [materials, setMaterials] = React.useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = React.useState(true);
  const [clothingTypeOptions, setClothingTypeOptions] = React.useState<ClothingType[]>([]);
  const [materialOptions, setMaterialOptions] = React.useState<Material[]>([]);
  const [loading, setLoading] = React.useState(true);

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    if (type === 'min') {
      setPriceRange([numValue, priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], numValue]);
    }
  };


  // Load dữ liệu từ API
  React.useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoading(true);
        
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
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  React.useEffect(() => {
    onFilterChange({
      priceRange,
      sortBy,
      clothingType,
      materials,
    });
  }, [priceRange, sortBy, clothingType, materials, onFilterChange]);

  return (
    <div className="bg-white border border-gray-200">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full flex items-center justify-between p-4 bg-black text-white hover:bg-gray-800 transition-colors font-normal text-sm uppercase tracking-wide"
        >
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4" />
            <span>Bộ lọc</span>
          </div>
          <FiChevronDown className={`transform transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block p-8`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <FiFilter className="w-4 h-4 text-gray-600" />
          <h3 className="text-lg font-light text-black tracking-wider">Bộ lọc</h3>
        </div>

        {/* Sort By */}
        <div className="mb-8">
          <h4 className="text-xs font-medium text-gray-600 mb-4 uppercase tracking-wide">Sắp xếp theo</h4>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black bg-white text-gray-800 transition-colors text-sm"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_low">Giá: Thấp đến Cao</option>
            <option value="price_high">Giá: Cao đến Thấp</option>
            <option value="popular">Phổ biến nhất</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-8">
          <h4 className="text-xs font-medium text-gray-600 mb-4 uppercase tracking-wide">Khoảng giá</h4>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 font-medium mb-2 uppercase tracking-wide">Từ (₫)</label>
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black bg-white text-gray-800 transition-colors text-sm"
                  min="0"
                  step="10000"
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 font-medium mb-2 uppercase tracking-wide">Đến (₫)</label>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black bg-white text-gray-800 transition-colors text-sm"
                  min="0"
                  step="10000"
                  placeholder="2000000"
                />
              </div>
            </div>
            
            {/* Price Range Display */}
            <div className="bg-gray-50 p-4">
              <div className="text-xs text-gray-600">
                <span className="font-normal uppercase tracking-wide">Khoảng giá:</span> 
                <span className="ml-2 text-black font-light">
                  {priceRange[0].toLocaleString()}₫ - {priceRange[1].toLocaleString()}₫
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clothing Type Filter */}
        <div className="mb-8">
          <SingleSelectSearch
            options={clothingTypeOptions}
            selectedValue={clothingType}
            onSelectionChange={setClothingType}
            placeholder="Tìm kiếm loại áo..."
            label="Loại áo"
            loading={loading}
          />
        </div>

        {/* Material Filter */}
        <div className="mb-8">
          <MultiSelectSearch
            options={materialOptions}
            selectedValues={materials}
            onSelectionChange={setMaterials}
            placeholder="Tìm kiếm chất liệu..."
            label="Chất liệu"
            loading={loading}
          />
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={() => {
            setPriceRange([0, 2000000]);
            setSortBy('newest');
            setClothingType('');
            setMaterials([]);
          }}
          className="w-full py-3 px-4 bg-white border border-gray-300 text-black hover:border-black transition-colors font-normal text-sm uppercase tracking-wide"
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;