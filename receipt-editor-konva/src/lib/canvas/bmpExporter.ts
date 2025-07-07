/**
 * Canvas ImageDataから1ビット（2階調）BMPバイナリを生成する
 */
export const createMonochromeBMPFromImageData = (imageData: ImageData, threshold: number = 128): ArrayBuffer => {
  const { width, height, data } = imageData;
  
  // BMPファイルのヘッダーサイズ計算
  const fileHeaderSize = 14;
  const infoHeaderSize = 40;
  const paletteSize = 8; // 2色 × 4バイト
  const headerSize = fileHeaderSize + infoHeaderSize + paletteSize;
  
  // 各行のビット数を8の倍数に調整し、さらに4バイト境界に合わせる
  const bitsPerRow = Math.ceil(width / 8) * 8;
  const bytesPerRow = bitsPerRow / 8;
  const rowSize = Math.ceil(bytesPerRow / 4) * 4;
  const pixelDataSize = rowSize * height;
  const fileSize = headerSize + pixelDataSize;
  
  // ArrayBufferとDataViewを作成
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  
  let offset = 0;
  
  // BMPファイルヘッダー (14バイト)
  view.setUint8(offset++, 0x42); // 'B'
  view.setUint8(offset++, 0x4D); // 'M'
  view.setUint32(offset, fileSize, true); offset += 4;
  view.setUint32(offset, 0, true); offset += 4;
  view.setUint32(offset, headerSize, true); offset += 4;
  
  // BMPインフォヘッダー (40バイト)
  view.setUint32(offset, infoHeaderSize, true); offset += 4;
  view.setUint32(offset, width, true); offset += 4;
  view.setUint32(offset, height, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, 1, true); offset += 2; // 1ビット
  view.setUint32(offset, 0, true); offset += 4;
  view.setUint32(offset, pixelDataSize, true); offset += 4;
  view.setUint32(offset, 2835, true); offset += 4;
  view.setUint32(offset, 2835, true); offset += 4;
  view.setUint32(offset, 2, true); offset += 4; // 2色
  view.setUint32(offset, 2, true); offset += 4; // 2色
  
  // カラーパレット (8バイト: 2色 × 4バイト)
  // 色0: 黒 (0, 0, 0, 0)
  view.setUint8(offset++, 0); // Blue
  view.setUint8(offset++, 0); // Green
  view.setUint8(offset++, 0); // Red
  view.setUint8(offset++, 0); // Reserved
  
  // 色1: 白 (255, 255, 255, 0)
  view.setUint8(offset++, 255); // Blue
  view.setUint8(offset++, 255); // Green
  view.setUint8(offset++, 255); // Red
  view.setUint8(offset++, 0);   // Reserved
  
  // ピクセルデータ（下から上へ、1ビットずつパック）
  const pixelArray = new Uint8Array(buffer, headerSize);
  
  for (let y = height - 1; y >= 0; y--) {
    const rowOffset = (height - 1 - y) * rowSize;
    
    for (let x = 0; x < width; x++) {
      const dataIndex = (y * width + x) * 4;
      const byteIndex = Math.floor(x / 8);
      const bitIndex = 7 - (x % 8); // MSBから開始
      
      // RGBAから直接グレースケール変換して白黒判定
      const r = data[dataIndex];
      const g = data[dataIndex + 1];
      const b = data[dataIndex + 2];
      
      // ITU-R BT.601 標準によるグレースケール変換
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // 閾値による白黒判定
      if (gray > threshold) {
        pixelArray[rowOffset + byteIndex] |= (1 << bitIndex);
      }
      // 黒の場合は何もしない（初期値0）
    }
  }
  
  return buffer;
};

/**
 * Canvasから1ビット（2階調）BMPバイナリを生成する
 */
export const canvasToBMP = (canvas: HTMLCanvasElement, threshold: number = 128): Blob => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const bmpData = createMonochromeBMPFromImageData(imageData, threshold);
  
  return new Blob([bmpData], { type: 'image/bmp' });
};

/**
 * DataURLから1ビット（2階調）BMPバイナリを生成する（最適化版）
 */
export const dataURLToBMP = (dataURL: string, threshold: number = 128): Promise<Blob> => {
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
      
      // ImageDataを取得して直接1ビットBMPに変換（グレースケール変換と白黒変換も同時に実行）
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      try {
        const bmpData = createMonochromeBMPFromImageData(imageData, threshold);
        const bmpBlob = new Blob([bmpData], { type: 'image/bmp' });
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
