import { CanvasElement } from '../types';

// Re-export from CanvasProvider for backward compatibility
export { CanvasProvider, useCanvasStore } from './CanvasProvider';

// Generate unique ID for elements
const generateElementId = (type: string): string => {
  return `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

// Image element factory (used by Toolbar)
export const createImageElement = (imageUrl: string, x: number = 100, y: number = 100, originalWidth: number = 100, originalHeight: number = 100): CanvasElement => {
  // 画像を適切なサイズに縮小（最大150px）
  const maxSize = 150;
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  if (width > maxSize || height > maxSize) {
    if (aspectRatio > 1) {
      // 横長の画像
      width = maxSize;
      height = maxSize / aspectRatio;
    } else {
      // 縦長の画像
      height = maxSize;
      width = maxSize * aspectRatio;
    }
  }
  
  return {
    id: generateElementId('image'),
    type: 'image',
    x,
    y,
    width: Math.round(width),
    height: Math.round(height),
    rotation: 0,
    opacity: 1,
    fill: '',
    stroke: '',
    strokeWidth: 0,
    imageUrl,
  };
};
