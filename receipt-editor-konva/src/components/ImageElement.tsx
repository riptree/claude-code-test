'use client';

import React from 'react';
import { Image } from 'react-konva';
import { CanvasElement } from '@/lib/types';

interface ImageElementProps {
  element: CanvasElement & { type: 'image' };
  commonProps: Record<string, unknown>;
}

const ImageElement: React.FC<ImageElementProps> = ({ element, commonProps }) => {
  const [imageElement, setImageElement] = React.useState<HTMLImageElement | null>(null);
  
  React.useEffect(() => {
    if (element.imageUrl) {
      const img = new window.Image();
      img.onload = () => setImageElement(img);
      img.src = element.imageUrl;
    }
  }, [element.imageUrl]);
  
  return (
    <Image
      {...commonProps}
      width={element.width}
      height={element.height}
      image={imageElement || undefined}
      alt=""
    />
  );
};

export { ImageElement }; 
