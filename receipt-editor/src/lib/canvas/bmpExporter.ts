// BMP format utilities for 2-bit (monochrome) export
export interface BMPExportOptions {
  width: number;
  height: number;
  dithering: boolean;
  threshold: number; // 0-255, threshold for black/white conversion
}

// BMP file header structure
interface BMPFileHeader {
  signature: string; // 'BM'
  fileSize: number;
  reserved1: number;
  reserved2: number;
  dataOffset: number;
}

// BMP info header structure
interface BMPInfoHeader {
  size: number;
  width: number;
  height: number;
  planes: number;
  bitsPerPixel: number;
  compression: number;
  imageSize: number;
  xPixelsPerMeter: number;
  yPixelsPerMeter: number;
  colorsUsed: number;
  importantColors: number;
}

// Convert RGBA pixel data to monochrome using threshold
function rgbaToMonochrome(imageData: ImageData, threshold: number = 128): Uint8Array {
  const { data, width, height } = imageData;
  const monochromeData = new Uint8Array(width * height);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];
    
    // Convert to grayscale using luminance formula
    const grayscale = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    
    // Apply alpha blending with white background
    const blended = alpha < 255 ? Math.round(grayscale + (255 - grayscale) * (1 - alpha / 255)) : grayscale;
    
    // Convert to monochrome: 0 = black, 1 = white
    const pixelIndex = Math.floor(i / 4);
    monochromeData[pixelIndex] = blended >= threshold ? 1 : 0;
  }
  
  return monochromeData;
}

// Apply Floyd-Steinberg dithering
function applyDithering(monochromeData: Uint8Array, width: number, height: number, threshold: number = 128): Uint8Array {
  const result = new Uint8Array(width * height);
  const errorMatrix = new Float32Array(width * height);
  
  // Initialize error matrix with grayscale values
  for (let i = 0; i < monochromeData.length; i++) {
    errorMatrix[i] = monochromeData[i] * 255;
  }
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const oldPixel = errorMatrix[index];
      const newPixel = oldPixel >= threshold ? 255 : 0;
      const error = oldPixel - newPixel;
      
      result[index] = newPixel === 255 ? 1 : 0;
      
      // Distribute error to neighboring pixels
      if (x + 1 < width) {
        errorMatrix[index + 1] += error * 7 / 16;
      }
      if (y + 1 < height) {
        if (x > 0) {
          errorMatrix[index + width - 1] += error * 3 / 16;
        }
        errorMatrix[index + width] += error * 5 / 16;
        if (x + 1 < width) {
          errorMatrix[index + width + 1] += error * 1 / 16;
        }
      }
    }
  }
  
  return result;
}

// Pack monochrome data into BMP format (1 bit per pixel)
function packMonochromeToBMP(monochromeData: Uint8Array, width: number, height: number): Uint8Array {
  // Calculate row size (must be multiple of 4 bytes)
  const bitsPerRow = width;
  const bytesPerRow = Math.ceil(bitsPerRow / 8);
  const paddedBytesPerRow = Math.ceil(bytesPerRow / 4) * 4;
  
  const imageSize = paddedBytesPerRow * height;
  const bmpData = new Uint8Array(imageSize);
  
  for (let y = 0; y < height; y++) {
    // BMP rows are stored bottom-to-top
    const srcRowIndex = (height - 1 - y) * width;
    const destRowIndex = y * paddedBytesPerRow;
    
    for (let x = 0; x < width; x++) {
      const pixelValue = monochromeData[srcRowIndex + x];
      const byteIndex = Math.floor(x / 8);
      const bitIndex = 7 - (x % 8);
      
      if (pixelValue === 0) { // Black pixel
        bmpData[destRowIndex + byteIndex] |= (1 << bitIndex);
      }
      // White pixels remain 0 (default)
    }
  }
  
  return bmpData;
}

// Create BMP file header
function createBMPHeader(width: number, height: number, imageDataSize: number): Uint8Array {
  const paletteSize = 8; // 2 colors * 4 bytes each
  const headerSize = 54; // Standard BMP header size
  const fileSize = headerSize + paletteSize + imageDataSize;
  
  const header = new ArrayBuffer(headerSize + paletteSize);
  const view = new DataView(header);
  
  // File header
  view.setUint16(0, 0x424D, true); // 'BM' signature
  view.setUint32(2, fileSize, true); // File size
  view.setUint32(6, 0, true); // Reserved
  view.setUint32(10, headerSize + paletteSize, true); // Data offset
  
  // Info header
  view.setUint32(14, 40, true); // Info header size
  view.setInt32(18, width, true); // Width
  view.setInt32(22, height, true); // Height
  view.setUint16(26, 1, true); // Planes
  view.setUint16(28, 1, true); // Bits per pixel
  view.setUint32(30, 0, true); // Compression (none)
  view.setUint32(34, imageDataSize, true); // Image size
  view.setUint32(38, 2835, true); // X pixels per meter (72 DPI)
  view.setUint32(42, 2835, true); // Y pixels per meter (72 DPI)
  view.setUint32(46, 2, true); // Colors used
  view.setUint32(50, 2, true); // Important colors
  
  // Color palette (2 colors: black and white)
  view.setUint32(54, 0x00000000, true); // Black (BGRA)
  view.setUint32(58, 0x00FFFFFF, true); // White (BGRA)
  
  return new Uint8Array(header);
}

// Main export function
export function exportCanvasAsBMP(
  canvas: HTMLCanvasElement,
  options: BMPExportOptions
): Blob {
  const { width, height, dithering, threshold } = options;
  
  // Get canvas image data
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Create a temporary canvas with the exact size needed
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) {
    throw new Error('Could not create temporary canvas context');
  }
  
  // Fill with white background
  tempCtx.fillStyle = '#FFFFFF';
  tempCtx.fillRect(0, 0, width, height);
  
  // Draw the original canvas scaled to fit
  tempCtx.drawImage(canvas, 0, 0, width, height);
  
  // Get image data
  const imageData = tempCtx.getImageData(0, 0, width, height);
  
  // Convert to monochrome
  let monochromeData = rgbaToMonochrome(imageData, threshold);
  
  // Apply dithering if requested
  if (dithering) {
    monochromeData = applyDithering(monochromeData, width, height, threshold);
  }
  
  // Pack into BMP format
  const bmpImageData = packMonochromeToBMP(monochromeData, width, height);
  
  // Create header
  const header = createBMPHeader(width, height, bmpImageData.length);
  
  // Combine header and image data
  const bmpFile = new Uint8Array(header.length + bmpImageData.length);
  bmpFile.set(header, 0);
  bmpFile.set(bmpImageData, header.length);
  
  return new Blob([bmpFile], { type: 'image/bmp' });
}

// Utility function to estimate file size
export function estimateBMPFileSize(width: number, height: number): number {
  const headerSize = 62; // Header + palette
  const bytesPerRow = Math.ceil(Math.ceil(width / 8) / 4) * 4;
  const imageSize = bytesPerRow * height;
  return headerSize + imageSize;
}

// Utility function to check if size is within limits
export function validateBMPSize(width: number, height: number, maxSizeKB: number = 1500): boolean {
  const estimatedSize = estimateBMPFileSize(width, height);
  return estimatedSize <= maxSizeKB * 1024;
}