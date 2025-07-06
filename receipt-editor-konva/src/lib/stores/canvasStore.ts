import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { CanvasState, CanvasActions, CanvasElement, CanvasConfig, Tool } from '../types';

const DEFAULT_CONFIG: CanvasConfig = {
  width: 800,
  height: 280,
  orientation: 'landscape',
  backgroundColor: '#ffffff',
  gridVisible: true,
  snapToGrid: false,
  gridSize: 20,
  maxFileSize: 1500000, // 1.5MB in bytes
  exportFormat: 'bmp',
  colorMode: 'monochrome',
  monochromePreview: true, // キャンバスで白黒プレビューを表示
  monochromeThreshold: 128,
  monochromeContrast: 0.8, // より穏やかなコントラスト
  monochromeBrightness: 0, // CSSのbrightness(1)に対応
};

interface CanvasStore extends CanvasState, CanvasActions {}

export const useCanvasStore = create<CanvasStore>()(
  subscribeWithSelector((set, get) => ({
    elements: [],
    selectedElementId: null,
    tool: 'select',
    config: DEFAULT_CONFIG,
    history: [[]],
    historyIndex: 0,

    setTool: (tool: Tool) => {
      set({ tool });
    },

    addElement: (element: CanvasElement) => {
      set((state) => {
        const newElements = [...state.elements, element];
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([...newElements]);
        
        return {
          elements: newElements,
          selectedElementId: element.id,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      });
    },

    updateElement: (id: string, updates: Partial<CanvasElement>) => {
      set((state) => {
        const elementIndex = state.elements.findIndex(el => el.id === id);
        if (elementIndex === -1) return state;

        const newElements = [...state.elements];
        newElements[elementIndex] = { ...newElements[elementIndex], ...updates };
        
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([...newElements]);

        return {
          elements: newElements,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      });
    },

    deleteElement: (id: string) => {
      set((state) => {
        const newElements = state.elements.filter(el => el.id !== id);
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([...newElements]);
        
        return {
          elements: newElements,
          selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      });
    },

    selectElement: (id: string | null) => {
      set({ selectedElementId: id });
    },

    updateConfig: (configUpdates: Partial<CanvasConfig>) => {
      set((state) => {
        const newConfig = { ...state.config, ...configUpdates };
        
        // If orientation changes, swap width and height
        if (configUpdates.orientation && configUpdates.orientation !== state.config.orientation) {
          newConfig.width = state.config.height;
          newConfig.height = state.config.width;
        }
        
        return { config: newConfig };
      });
    },

    undo: () => {
      set((state) => {
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          return {
            elements: [...state.history[newIndex]],
            historyIndex: newIndex,
            selectedElementId: null,
          };
        }
        return state;
      });
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          return {
            elements: [...state.history[newIndex]],
            historyIndex: newIndex,
            selectedElementId: null,
          };
        }
        return state;
      });
    },

    canUndo: () => {
      const state = get();
      return state.historyIndex > 0;
    },

    canRedo: () => {
      const state = get();
      return state.historyIndex < state.history.length - 1;
    },

    clearCanvas: () => {
      set((state) => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([]);
        
        return {
          elements: [],
          selectedElementId: null,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      });
    },

    duplicateElement: (id: string) => {
      set((state) => {
        const element = state.elements.find(el => el.id === id);
        if (!element) return state;

        const newElement: CanvasElement = {
          ...element,
          id: `${element.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          x: element.x + 20,
          y: element.y + 20,
        };

        const newElements = [...state.elements, newElement];
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([...newElements]);

        return {
          elements: newElements,
          selectedElementId: newElement.id,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      });
    },

    bringToFront: (id: string) => {
      set((state) => {
        const elementIndex = state.elements.findIndex(el => el.id === id);
        if (elementIndex === -1 || elementIndex === state.elements.length - 1) return state;

        const newElements = [...state.elements];
        const element = newElements.splice(elementIndex, 1)[0];
        newElements.push(element);

        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([...newElements]);

        return {
          elements: newElements,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      });
    },

    sendToBack: (id: string) => {
      set((state) => {
        const elementIndex = state.elements.findIndex(el => el.id === id);
        if (elementIndex === -1 || elementIndex === 0) return state;

        const newElements = [...state.elements];
        const element = newElements.splice(elementIndex, 1)[0];
        newElements.unshift(element);

        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([...newElements]);

        return {
          elements: newElements,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      });
    },
  }))
);

// Generate unique ID for elements
export const generateElementId = (type: string): string => {
  return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Default element factories
export const createTextElement = (text: string = 'New Text', x: number = 100, y: number = 100): CanvasElement => ({
  id: generateElementId('text'),
  type: 'text',
  x,
  y,
  width: 100,
  height: 30,
  rotation: 0,
  opacity: 1,
  fill: '#000000',
  stroke: '',
  strokeWidth: 0,
  text,
  fontSize: 16,
  fontFamily: 'Arial',
  fontStyle: 'normal',
  textAlign: 'left',
});

export const createRectangleElement = (x: number = 100, y: number = 100): CanvasElement => ({
  id: generateElementId('rectangle'),
  type: 'rectangle',
  x,
  y,
  width: 100,
  height: 50,
  rotation: 0,
  opacity: 1,
  fill: '#ffffff',
  stroke: '#000000',
  strokeWidth: 2,
});

export const createCircleElement = (x: number = 100, y: number = 100): CanvasElement => ({
  id: generateElementId('circle'),
  type: 'circle',
  x,
  y,
  width: 80,
  height: 80,
  rotation: 0,
  opacity: 1,
  fill: '#ffffff',
  stroke: '#000000',
  strokeWidth: 2,
});

export const createLineElement = (x: number = 100, y: number = 100): CanvasElement => ({
  id: generateElementId('line'),
  type: 'line',
  x,
  y,
  width: 100,
  height: 2,
  rotation: 0,
  opacity: 1,
  fill: '',
  stroke: '#000000',
  strokeWidth: 2,
  points: [0, 0, 100, 0],
});

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
