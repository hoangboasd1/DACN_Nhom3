'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Image {
  id: number;
  url: string;
  isPrimary: boolean;
}

interface ImageGalleryProps {
  images: Image[];
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<Image>(
    images.find(img => img.isPrimary) || images[0]
  );

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Thumbnails */}
      <div className="col-span-2 space-y-4">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-colors
              ${selectedImage.id === image.id ? 'border-[#FFB629]' : 'border-transparent hover:border-gray-200'}`}
          >
            <Image
              src={image.url}
              alt="Product thumbnail"
              fill
              sizes="(max-width: 768px) 25vw, 10vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="col-span-10">
        <div className="relative aspect-square rounded-lg overflow-hidden">
          <Image
            src={selectedImage.url}
            alt="Product image"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default ImageGallery; 