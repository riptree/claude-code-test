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
  monochromeThreshold: number;
  monochromeContrast: number;
  monochromeBrightness: number;
}

export type Tool = 'select' | 'text' | 'rectangle' | 'circle' | 'line' | 'image';

export interface CanvasState {
  elements: CanvasElement[];
  selectedElementId: string | null;
  tool: Tool;
  config: CanvasConfig;
  history: CanvasElement[][];
  historyIndex: number;
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
}
