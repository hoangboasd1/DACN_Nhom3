'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiX, FiSearch } from 'react-icons/fi';

interface Option {
  id: number;
  name: string;
}

interface MultiSelectSearchProps {
  options: Option[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  loading?: boolean;
}

const MultiSelectSearch: React.FC<MultiSelectSearchProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Tìm kiếm...",
  label,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedValues.includes(option.name)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setInputValue('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value);
    
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSelectOption = (option: Option) => {
    const newSelectedValues = [...selectedValues, option.name];
    onSelectionChange(newSelectedValues);
    setInputValue('');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleRemoveSelected = (value: string) => {
    const newSelectedValues = selectedValues.filter(v => v !== value);
    onSelectionChange(newSelectedValues);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
      setInputValue('');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Selected Items */}
        {selectedValues.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2 p-2 border border-gray-300 rounded min-h-[40px] bg-white">
            {selectedValues.map((value) => (
              <span
                key={value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
              >
                {value}
                <button
                  onClick={() => handleRemoveSelected(value)}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  type="button"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input Field */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={selectedValues.length === 0 ? placeholder : "Tìm kiếm thêm..."}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors text-sm"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-sm text-gray-500">
                Đang tải...
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  type="button"
                >
                  {option.name}
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-sm text-gray-500">
                {searchTerm ? 'Không tìm thấy kết quả' : 'Không có tùy chọn nào'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectSearch;
