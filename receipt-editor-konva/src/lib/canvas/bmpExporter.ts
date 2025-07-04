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

/**
 * Canvas ImageDataからBMPバイナリを生成する
 */
export const createBMPFromImageData = (imageData: ImageData): ArrayBuffer => {
  const { width, height, data } = imageData;
  
  // BMPファイルのヘッダーサイズ計算
  const fileHeaderSize = 14;
  const infoHeaderSize = 40;
  const headerSize = fileHeaderSize + infoHeaderSize;
  
  // 各行のバイト数（4バイト境界に合わせる）
  const rowSize = Math.floor((width * 3 + 3) / 4) * 4;
  const pixelDataSize = rowSize * height;
  const fileSize = headerSize + pixelDataSize;
  
  // ArrayBufferとDataViewを作成
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  
  let offset = 0;
  
  // BMPファイルヘッダー (14バイト)
  view.setUint8(offset++, 0x42); // 'B'
  view.setUint8(offset++, 0x4D); // 'M'
  view.setUint32(offset, fileSize, true); offset += 4; // ファイルサイズ
  view.setUint32(offset, 0, true); offset += 4; // 予約領域
  view.setUint32(offset, headerSize, true); offset += 4; // ピクセルデータのオフセット
  
  // BMPインフォヘッダー (40バイト)
  view.setUint32(offset, infoHeaderSize, true); offset += 4; // ヘッダーサイズ
  view.setUint32(offset, width, true); offset += 4; // 幅
  view.setUint32(offset, height, true); offset += 4; // 高さ
  view.setUint16(offset, 1, true); offset += 2; // プレーン数
  view.setUint16(offset, 24, true); offset += 2; // ビット深度 (24bit RGB)
  view.setUint32(offset, 0, true); offset += 4; // 圧縮方式 (無圧縮)
  view.setUint32(offset, pixelDataSize, true); offset += 4; // ピクセルデータサイズ
  view.setUint32(offset, 2835, true); offset += 4; // 水平解像度 (72 DPI)
  view.setUint32(offset, 2835, true); offset += 4; // 垂直解像度 (72 DPI)
  view.setUint32(offset, 0, true); offset += 4; // カラーパレット数
  view.setUint32(offset, 0, true); offset += 4; // 重要なカラー数
  
  // ピクセルデータ（下から上へ、BGRの順序）
  const pixelArray = new Uint8Array(buffer, headerSize);
  let pixelOffset = 0;
  
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const dataIndex = (y * width + x) * 4;
      
      // RGBA -> BGR変換
      pixelArray[pixelOffset++] = data[dataIndex + 2]; // B
      pixelArray[pixelOffset++] = data[dataIndex + 1]; // G
      pixelArray[pixelOffset++] = data[dataIndex + 0]; // R
    }
    
    // 行の終端を4バイト境界に合わせるためのパディング
    while (pixelOffset % 4 !== 0) {
      pixelArray[pixelOffset++] = 0;
    }
  }
  
  return buffer;
};

/**
 * CanvasからBMPバイナリを生成する
 */
export const canvasToBMP = (canvas: HTMLCanvasElement): Blob => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const bmpData = createBMPFromImageData(imageData);
  
  return new Blob([bmpData], { type: 'image/bmp' });
};

/**
 * DataURLからBMPバイナリを生成する
 */
export const dataURLToBMP = (dataURL: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 白背景で塗りつぶし
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 画像を描画
      ctx.drawImage(img, 0, 0);
      
      try {
        const bmpBlob = canvasToBMP(canvas);
        resolve(bmpBlob);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      reject(error);
    };
    
    img.src = dataURL;
  });
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
