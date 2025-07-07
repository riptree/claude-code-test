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

export interface MonochromeOptions {
  threshold?: number;
  contrast?: number;
  brightness?: number;
  useAdaptiveThreshold?: boolean;
}

/**
 * DataURLからBMPバイナリを生成する
 */
export const dataURLToBMP = (dataURL: string, monochrome: boolean = false, monochromeOptions?: MonochromeOptions): Promise<Blob> => {
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
      
              // 白黒変換処理（キャンバスと同じシンプルな処理）
          if (monochrome) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // オプションのデフォルト値
            const options = {
              threshold: 128,
              ...monochromeOptions
            };
            
            // シンプルなグレースケール変換と白黒変換
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              
              // グレースケール変換
              const gray = 0.299 * r + 0.587 * g + 0.114 * b;
              
              // 白黒変換（キャンバスプレビューと同じ閾値）
              const bw = gray > options.threshold ? 255 : 0;
              
              data[i] = bw;     // Red
              data[i + 1] = bw; // Green
              data[i + 2] = bw; // Blue
              // Alpha channel (data[i + 3]) remains unchanged
            }

            ctx.putImageData(imageData, 0, 0);
          }
      
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
