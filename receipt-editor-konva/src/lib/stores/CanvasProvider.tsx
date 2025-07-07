import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
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
  monochromeThreshold: 128,
  monochromeContrast: 0.8, // より穏やかなコントラスト
  monochromeBrightness: 0, // CSSのbrightness(1)に対応
};

const initialState: CanvasState = {
  elements: [],
  selectedElementId: null,
  tool: 'select',
  config: DEFAULT_CONFIG,
  history: [[]],
  historyIndex: 0,
};

type CanvasAction =
  | { type: 'SET_TOOL'; payload: Tool }
  | { type: 'ADD_ELEMENT'; payload: CanvasElement }
  | { type: 'UPDATE_ELEMENT'; payload: { id: string; updates: Partial<CanvasElement> } }
  | { type: 'DELETE_ELEMENT'; payload: string }
  | { type: 'SELECT_ELEMENT'; payload: string | null }
  | { type: 'UPDATE_CONFIG'; payload: Partial<CanvasConfig> }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_CANVAS' }
  | { type: 'DUPLICATE_ELEMENT'; payload: string }
  | { type: 'BRING_TO_FRONT'; payload: string }
  | { type: 'SEND_TO_BACK'; payload: string };

const canvasReducer = (state: CanvasState, action: CanvasAction): CanvasState => {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, tool: action.payload };

    case 'ADD_ELEMENT': {
      const newElements = [...state.elements, action.payload];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...newElements]);
      
      return {
        ...state,
        elements: newElements,
        selectedElementId: action.payload.id,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'UPDATE_ELEMENT': {
      const elementIndex = state.elements.findIndex(el => el.id === action.payload.id);
      if (elementIndex === -1) return state;

      const newElements = [...state.elements];
      newElements[elementIndex] = { ...newElements[elementIndex], ...action.payload.updates };
      
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...newElements]);

      return {
        ...state,
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'DELETE_ELEMENT': {
      const newElements = state.elements.filter(el => el.id !== action.payload);
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...newElements]);
      
      return {
        ...state,
        elements: newElements,
        selectedElementId: state.selectedElementId === action.payload ? null : state.selectedElementId,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'SELECT_ELEMENT':
      return { ...state, selectedElementId: action.payload };

    case 'UPDATE_CONFIG': {
      const newConfig = { ...state.config, ...action.payload };
      
      // If orientation changes, swap width and height
      if (action.payload.orientation && action.payload.orientation !== state.config.orientation) {
        newConfig.width = state.config.height;
        newConfig.height = state.config.width;
      }
      
      return { ...state, config: newConfig };
    }

    case 'UNDO': {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          ...state,
          elements: [...state.history[newIndex]],
          historyIndex: newIndex,
          selectedElementId: null,
        };
      }
      return state;
    }

    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          ...state,
          elements: [...state.history[newIndex]],
          historyIndex: newIndex,
          selectedElementId: null,
        };
      }
      return state;
    }

    case 'CLEAR_CANVAS': {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([]);
      
      return {
        ...state,
        elements: [],
        selectedElementId: null,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'DUPLICATE_ELEMENT': {
      const element = state.elements.find(el => el.id === action.payload);
      if (!element) return state;

      const newElement: CanvasElement = {
        ...element,
        id: `${element.type}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        x: element.x + 20,
        y: element.y + 20,
      };

      const newElements = [...state.elements, newElement];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...newElements]);

      return {
        ...state,
        elements: newElements,
        selectedElementId: newElement.id,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'BRING_TO_FRONT': {
      const elementIndex = state.elements.findIndex(el => el.id === action.payload);
      if (elementIndex === -1 || elementIndex === state.elements.length - 1) return state;

      const newElements = [...state.elements];
      const element = newElements.splice(elementIndex, 1)[0];
      newElements.push(element);

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...newElements]);

      return {
        ...state,
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'SEND_TO_BACK': {
      const elementIndex = state.elements.findIndex(el => el.id === action.payload);
      if (elementIndex === -1 || elementIndex === 0) return state;

      const newElements = [...state.elements];
      const element = newElements.splice(elementIndex, 1)[0];
      newElements.unshift(element);

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...newElements]);

      return {
        ...state,
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    default:
      return state;
  }
};

interface CanvasStore extends CanvasState, CanvasActions {}

const CanvasContext = createContext<CanvasStore | null>(null);

interface CanvasProviderProps {
  children: ReactNode;
}

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(canvasReducer, initialState);

  const setTool = useCallback((tool: Tool) => {
    dispatch({ type: 'SET_TOOL', payload: tool });
  }, []);

  const addElement = useCallback((element: CanvasElement) => {
    dispatch({ type: 'ADD_ELEMENT', payload: element });
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    dispatch({ type: 'UPDATE_ELEMENT', payload: { id, updates } });
  }, []);

  const deleteElement = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ELEMENT', payload: id });
  }, []);

  const selectElement = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_ELEMENT', payload: id });
  }, []);

  const updateConfig = useCallback((configUpdates: Partial<CanvasConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: configUpdates });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const canUndo = useCallback(() => {
    return state.historyIndex > 0;
  }, [state.historyIndex]);

  const canRedo = useCallback(() => {
    return state.historyIndex < state.history.length - 1;
  }, [state.historyIndex, state.history.length]);

  const clearCanvas = useCallback(() => {
    dispatch({ type: 'CLEAR_CANVAS' });
  }, []);

  const duplicateElement = useCallback((id: string) => {
    dispatch({ type: 'DUPLICATE_ELEMENT', payload: id });
  }, []);

  const bringToFront = useCallback((id: string) => {
    dispatch({ type: 'BRING_TO_FRONT', payload: id });
  }, []);

  const sendToBack = useCallback((id: string) => {
    dispatch({ type: 'SEND_TO_BACK', payload: id });
  }, []);

  const contextValue: CanvasStore = {
    ...state,
    setTool,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    updateConfig,
    undo,
    redo,
    canUndo,
    canRedo,
    clearCanvas,
    duplicateElement,
    bringToFront,
    sendToBack,
  };

  return (
    <CanvasContext.Provider value={contextValue}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvasStore = (): CanvasStore => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvasStore must be used within a CanvasProvider');
  }
  return context;
};
