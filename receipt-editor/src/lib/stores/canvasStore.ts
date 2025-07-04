import { create } from 'zustand';

export type Tool = 'select' | 'text' | 'rectangle' | 'circle' | 'line' | 'image';
export type Orientation = 'landscape' | 'portrait';

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  orientation: Orientation;
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'line' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  locked: boolean;
  // Text specific properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  // Shape specific properties
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  // Line specific properties
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  // Image specific properties
  src?: string;
}

interface CanvasState {
  // Canvas configuration
  config: CanvasConfig;
  
  // Current tool
  tool: Tool;
  
  // Elements management
  elements: CanvasElement[];
  selectedElementId: string | null;
  
  // History for undo/redo
  history: CanvasElement[][];
  historyIndex: number;
  
  // Actions
  setTool: (tool: Tool) => void;
  setOrientation: (orientation: Orientation) => void;
  updateConfig: (updates: Partial<CanvasConfig>) => void;
  
  // Element management
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  getSelectedElement: () => CanvasElement | null;
  
  // History management
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Canvas operations
  clearCanvas: () => void;
}

const defaultConfig: CanvasConfig = {
  width: 1160,
  height: 406,
  backgroundColor: '#ffffff',
  orientation: 'landscape',
};

const createCanvasStore = create<CanvasState>((set, get) => ({
  // Initial state
  config: defaultConfig,
  tool: 'select',
  elements: [],
  selectedElementId: null,
  history: [[]],
  historyIndex: 0,

  // Tool management
  setTool: (tool) => set({ tool }),

  // Configuration management
  setOrientation: (orientation) => {
    const { config } = get();
    const newConfig = { ...config, orientation };
    
    // Swap width and height for orientation change
    if (orientation === 'landscape') {
      newConfig.width = Math.max(config.width, config.height);
      newConfig.height = Math.min(config.width, config.height);
    } else {
      newConfig.width = Math.min(config.width, config.height);
      newConfig.height = Math.max(config.width, config.height);
    }
    
    set({ config: newConfig });
  },

  updateConfig: (updates) => {
    const { config } = get();
    set({ config: { ...config, ...updates } });
  },

  // Element management
  addElement: (element) => {
    const { elements, history, historyIndex } = get();
    const newElements = [...elements, element];
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    
    set({
      elements: newElements,
      history: newHistory,
      historyIndex: historyIndex + 1,
    });
  },

  updateElement: (id, updates) => {
    const { elements, history, historyIndex } = get();
    const newElements = elements.map(element =>
      element.id === id ? { ...element, ...updates } : element
    );
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    
    set({
      elements: newElements,
      history: newHistory,
      historyIndex: historyIndex + 1,
    });
  },

  deleteElement: (id) => {
    const { elements, history, historyIndex } = get();
    const newElements = elements.filter(element => element.id !== id);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    
    set({
      elements: newElements,
      history: newHistory,
      historyIndex: historyIndex + 1,
      selectedElementId: get().selectedElementId === id ? null : get().selectedElementId,
    });
  },

  selectElement: (id) => set({ selectedElementId: id }),

  getSelectedElement: () => {
    const { elements, selectedElementId } = get();
    return elements.find(element => element.id === selectedElementId) || null;
  },

  // History management
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({
        elements: history[historyIndex - 1],
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({
        elements: history[historyIndex + 1],
        historyIndex: historyIndex + 1,
      });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // Canvas operations
  clearCanvas: () => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([]);
    
    set({
      elements: [],
      history: newHistory,
      historyIndex: historyIndex + 1,
      selectedElementId: null,
    });
  },
}));

export const useCanvasStore = createCanvasStore; 
