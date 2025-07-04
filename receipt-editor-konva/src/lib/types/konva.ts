// Konvaの型定義（動的インポート用）
export type KonvaStage = {
  toDataURL: (config?: {
    mimeType?: string;
    quality?: number;
    pixelRatio?: number;
    width?: number;
    height?: number;
  }) => string;
  getPointerPosition: () => { x: number; y: number } | null;
  x: () => number;
  y: () => number;
  scaleX: () => number;
  scaleY: () => number;
  width: () => number;
  height: () => number;
  [key: string]: unknown;
};

export type KonvaNode = {
  x: () => number;
  y: () => number;
  scaleX: () => number;
  scaleY: () => number;
  width: () => number;
  height: () => number;
  rotation: () => number;
};

export type KonvaEvent = {
  target: KonvaNode & {
    getStage: () => KonvaStage | null;
  };
}; 
