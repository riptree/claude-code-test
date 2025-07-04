export interface CanvasElement {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'line' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  textAlign?: string;
  imageUrl?: string;
  scaleX?: number;
  scaleY?: number;
  points?: number[];
}

export interface CanvasConfig {
  width: number;
  height: number;
  orientation: 'landscape' | 'portrait';
  backgroundColor: string;
  gridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
  maxFileSize: number;
  exportFormat: 'bmp';
  colorMode: 'monochrome';
}

export type Tool = 'select' | 'text' | 'rectangle' | 'circle' | 'line' | 'image' | 'pan' | 'zoom';

export interface CanvasState {
  elements: CanvasElement[];
  selectedElementId: string | null;
  tool: Tool;
  config: CanvasConfig;
  history: CanvasElement[][];
  historyIndex: number;
  zoom: number;
  panX: number;
  panY: number;
}

export interface CanvasActions {
  setTool: (tool: Tool) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  updateConfig: (config: Partial<CanvasConfig>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearCanvas: () => void;
  duplicateElement: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;
}

export interface ExportOptions {
  format: 'bmp';
  quality: number;
  width: number;
  height: number;
  monochrome: boolean;
  maxFileSize: number;
}

export interface ImportedImage {
  id: string;
  url: string;
  width: number;
  height: number;
  file: File;
}

export interface GridSettings {
  size: number;
  visible: boolean;
  snapToGrid: boolean;
  color: string;
  opacity: number;
}