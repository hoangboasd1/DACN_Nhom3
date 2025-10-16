import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart } from 'react-icons/fi';

interface ProductProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    slug: string;
    rating?: number;
    discountPrice?: number;
  };
}

export default function ProductCard({ product }: ProductProps) {
  return (
    <div className="group relative">
      <Link href={`/product/${product.id}`} className="block">
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            width={300}
            height={300}
          />
        </div>
        <div className="mt-4">
          <h3 className="text-sm text-gray-700 line-clamp-1">{product.name}</h3>
          <div className="mt-1 flex items-center justify-between">
            <div>
              {product.discountPrice ? (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">${product.discountPrice}</p>
                  <p className="text-sm text-gray-500 line-through">${product.price}</p>
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-900">${product.price}</p>
              )}
            </div>
            <button className="rounded-full p-2 hover:bg-gray-100">
              <FiShoppingCart className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
} 