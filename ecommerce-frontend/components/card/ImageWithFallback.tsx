'use client';

import { useState } from 'react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export default function ImageWithFallback({ fallbackSrc = '/placeholder.png', ...props }: Props) {
  const [src, setSrc] = useState(props.src);

  return (
    <img
      {...props}
      src={src}
      onError={() => setSrc(fallbackSrc)}
      alt={props.alt || 'Ảnh sản phẩm'}
    />
  );
}
