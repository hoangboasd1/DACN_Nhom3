'use client';
import React from 'react';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import Link from 'next/link';

type CartItemProps = {
  item: any;
  onUpdateQuantity: (productId: number, quantity: number, productVariantId?: number) => Promise<void>;
  onDeleteItem: (productId: number, productVariantId?: number) => Promise<void>;
};

export default function CartItem({ item, onUpdateQuantity, onDeleteItem }: CartItemProps) {
  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-12 items-center px-6 py-6 hover:bg-gray-50 transition-colors">
        {/* Sản phẩm - col-span-6 */}
        <div className="col-span-6 flex items-center gap-4">
          <div className="relative group">
            <Link href={`/product/${item.product.id}`}>
              <img
                src={item.product.imageUrl || '/placeholder.png'}
                alt={item.product.name}
                className="w-20 h-20 object-cover border border-gray-200 hover:border-black transition-colors"
                onError={(e) => (e.currentTarget.src = '/placeholder.png')}
              />
            </Link>
            <button
              onClick={() => onDeleteItem(item.productId, item.productVariantId)}
              className="absolute -top-2 -right-2 bg-black text-white p-1.5 hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Xoá sản phẩm"
              title="Xoá sản phẩm"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/product/${item.product.id}`}>
              <h3 className="font-light text-black hover:text-gray-600 transition-colors line-clamp-2 mb-1 tracking-wide">
                {item.product.name}
              </h3>
            </Link>
            <p className="text-gray-500 text-sm line-clamp-2 mb-2">
              {item.product.description || 'Không có mô tả'}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">SKU:</span>
                <span className="text-sm font-mono text-gray-500">
                  {item.productVariant?.sku || `#${item.product.id}`}
                </span>
              </div>
              {item.productVariant && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Biến thể:</span>
                  <span className="text-sm text-gray-800">
                    {item.productVariant.color?.name} - {item.productVariant.size?.name}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Tồn kho:</span>
                <span className={`text-sm font-light ${
                  (item.productVariant?.stockQuantity || item.product.instock) > 0 
                    ? 'text-gray-1000' 
                    : 'text-gray-400'
                }`}>
                  {item.productVariant?.stockQuantity || item.product.instock} sản phẩm
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Đơn giá - col-span-2 */}
        <div className="col-span-2 text-center">
          <div className="text-black font-light">
            {item.product.price.toLocaleString()}₫
          </div>
          <div className="text-sm text-gray-500 mt-1">mỗi sản phẩm</div>
        </div>

        {/* Số lượng - col-span-2 */}
        <div className="col-span-2 flex justify-center">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1, item.productVariantId)}
              disabled={item.quantity <= 1}
              className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Giảm số lượng"
            >
              <FiMinus size={16} />
            </button>
            <div className="px-4 py-2 bg-gray-50 border-x border-gray-300 min-w-[60px] text-center font-light">
              {item.quantity}
            </div>
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1, item.productVariantId)}
              disabled={item.quantity >= (item.productVariant?.stockQuantity || item.product.instock)}
              className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Tăng số lượng"
              title={item.quantity >= (item.productVariant?.stockQuantity || item.product.instock) 
                ? `Chỉ còn ${item.productVariant?.stockQuantity || item.product.instock} sản phẩm` 
                : "Tăng số lượng"}
            >
              <FiPlus size={16} />
            </button>
          </div>
        </div>

        {/* Thành tiền - col-span-2 */}
        <div className="col-span-2 text-right">
          <div className="text-black font-light text-lg">
            {(item.product.price * item.quantity).toLocaleString()}₫
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {item.quantity} × {item.product.price.toLocaleString()}₫
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <div className="flex gap-4">
          <div className="relative group flex-shrink-0">
            <Link href={`/product/${item.product.id}`}>
              <img
                src={item.product.imageUrl || '/placeholder.png'}
                alt={item.product.name}
                className="w-20 h-20 object-cover border border-gray-200"
                onError={(e) => (e.currentTarget.src = '/placeholder.png')}
              />
            </Link>
            <button
              onClick={() => onDeleteItem(item.productId, item.productVariantId)}
              className="absolute -top-2 -right-2 bg-black text-white p-1.5 hover:bg-gray-800"
              aria-label="Xoá sản phẩm"
            >
              <FiTrash2 size={12} />
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <Link href={`/product/${item.product.id}`}>
              <h3 className="font-light text-black hover:text-gray-600 transition-colors line-clamp-2 mb-1 tracking-wide">
                {item.product.name}
              </h3>
            </Link>
            {item.productVariant && (
              <p className="text-sm text-gray-600 mb-2">
                {item.productVariant.color?.name} - {item.productVariant.size?.name}
                {item.productVariant.sku && (
                  <span className="ml-2 text-xs text-gray-500">({item.productVariant.sku})</span>
                )}
              </p>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <div className="text-black font-light">
                {item.product.price.toLocaleString()}₫
              </div>
              <div className="text-black font-light text-lg">
                {(item.product.price * item.quantity).toLocaleString()}₫
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => onUpdateQuantity(item.productId, item.quantity - 1, item.productVariantId)}
                  disabled={item.quantity <= 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Giảm số lượng"
                >
                  <FiMinus size={14} />
                </button>
                <div className="px-3 py-2 bg-gray-50 border-x border-gray-300 min-w-[50px] text-center font-light text-sm">
                  {item.quantity}
                </div>
                <button
                  onClick={() => onUpdateQuantity(item.productId, item.quantity + 1, item.productVariantId)}
                  disabled={item.quantity >= (item.productVariant?.stockQuantity || item.product.instock)}
                  className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Tăng số lượng"
                  title={item.quantity >= (item.productVariant?.stockQuantity || item.product.instock) 
                    ? `Chỉ còn ${item.productVariant?.stockQuantity || item.product.instock} sản phẩm` 
                    : "Tăng số lượng"}
                >
                  <FiPlus size={14} />
                </button>
              </div>
              
              <div className="text-xs text-gray-500">
                {item.quantity} × {item.product.price.toLocaleString()}₫
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
