import Konva from 'konva';

export interface BMPExportOptions {
  width: number;
  height: number;
  quality: number;
  monochrome: boolean;
  maxFileSize: number;
}

export const exportToBMP = async (
  stage: Konva.Stage,
  options: BMPExportOptions
): Promise<Blob> => {
  const { width, height, monochrome, maxFileSize } = options;

  // Create a temporary canvas for export
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) {
    throw new Error('Failed to get canvas context');
  }

  // Fill with white background
  tempCtx.fillStyle = '#ffffff';
  tempCtx.fillRect(0, 0, width, height);

  // Get the stage canvas
  const stageCanvas = stage.toCanvas();
  
  // Draw the stage content to our temp canvas, scaling to fit
  const scaleX = width / stage.width();
  const scaleY = height / stage.height();
  const scale = Math.min(scaleX, scaleY);
  
  const scaledWidth = stage.width() * scale;
  const scaledHeight = stage.height() * scale;
  const offsetX = (width - scaledWidth) / 2;
  const offsetY = (height - scaledHeight) / 2;

  tempCtx.drawImage(stageCanvas, offsetX, offsetY, scaledWidth, scaledHeight);

  // Convert to monochrome if needed
  if (monochrome) {
    const imageData = tempCtx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale using luminance formula
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      // Convert to pure black or white
      const bw = gray > 128 ? 255 : 0;
      
      data[i] = bw;     // Red
      data[i + 1] = bw; // Green
      data[i + 2] = bw; // Blue
      // Alpha channel (data[i + 3]) remains unchanged
    }

    tempCtx.putImageData(imageData, 0, 0);
  }

  // Convert to BMP format
  const bmpBlob = await canvasToBMP(tempCanvas);

  // Check file size
  if (bmpBlob.size > maxFileSize) {
    throw new Error(`File size ${(bmpBlob.size / 1024).toFixed(1)}KB exceeds maximum ${(maxFileSize / 1024).toFixed(1)}KB`);
  }

  return bmpBlob;
};

const canvasToBMP = async (canvas: HTMLCanvasElement): Promise<Blob> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // BMP header constants
  const fileHeaderSize = 14;
  const infoHeaderSize = 40;
  const bitsPerPixel = 24;
  const rowSize = Math.floor((bitsPerPixel * width + 31) / 32) * 4;
  const pixelDataSize = rowSize * height;
  const fileSize = fileHeaderSize + infoHeaderSize + pixelDataSize;

  // Create BMP buffer
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // File header
  view.setUint16(0, 0x4D42, true); // BM signature
  view.setUint32(2, fileSize, true); // File size
  view.setUint32(6, 0, true); // Reserved
  view.setUint32(10, fileHeaderSize + infoHeaderSize, true); // Data offset

  // Info header
  view.setUint32(14, infoHeaderSize, true); // Info header size
  view.setInt32(18, width, true); // Width
  view.setInt32(22, -height, true); // Height (negative for top-down)
  view.setUint16(26, 1, true); // Planes
  view.setUint16(28, bitsPerPixel, true); // Bits per pixel
  view.setUint32(30, 0, true); // Compression
  view.setUint32(34, pixelDataSize, true); // Image size
  view.setInt32(38, 2835, true); // X pixels per meter
  view.setInt32(42, 2835, true); // Y pixels per meter
  view.setUint32(46, 0, true); // Colors used
  view.setUint32(50, 0, true); // Important colors

  // Pixel data
  let dataIndex = fileHeaderSize + infoHeaderSize;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * 4;
      const r = data[pixelIndex];
      const g = data[pixelIndex + 1];
      const b = data[pixelIndex + 2];

      // BMP uses BGR format
      view.setUint8(dataIndex, b);
      view.setUint8(dataIndex + 1, g);
      view.setUint8(dataIndex + 2, r);
      dataIndex += 3;
    }

    // Add padding to align rows to 4-byte boundary
    const padding = rowSize - (width * 3);
    for (let p = 0; p < padding; p++) {
      view.setUint8(dataIndex, 0);
      dataIndex++;
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
};

export const downloadBMP = (blob: Blob, filename: string = 'receipt.bmp'): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const validateImageSize = (blob: Blob, maxSize: number): boolean => {
  return blob.size <= maxSize;
};

export const getImageDimensions = (blob: Blob): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
};

export const previewBMP = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read blob'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};