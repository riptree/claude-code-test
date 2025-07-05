'use client';

import React, { useRef } from 'react';
import { useCanvasStore, createImageElement } from '@/lib/stores/canvasStore';
import { Tool } from '@/lib/types';
import {
  FiMousePointer,
  FiType,
  FiSquare,
  FiCircle,
  FiMinus,
  FiImage,
  FiRotateCcw,
  FiRotateCw,
  FiGrid,
  FiZoomIn,
  FiZoomOut,
  FiMove,
  FiTrash2,
  FiCopy,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';

interface ToolbarProps {
  className?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({ className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    tool,
    setTool,
    config,
    updateConfig,
    selectedElementId,
    deleteElement,
    duplicateElement,
    bringToFront,
    sendToBack,
    undo,
    redo,
    canUndo,
    canRedo,
    clearCanvas,
    zoom,
    setZoom,
    resetView,
    addElement,
  } = useCanvasStore();

  const tools: Array<{
    id: Tool;
    label: string;
    icon: React.ReactNode;
    shortcut?: string;
  }> = [
    { id: 'select', label: 'Select', icon: <FiMousePointer />, shortcut: 'V' },
    { id: 'text', label: 'Text', icon: <FiType />, shortcut: 'T' },
    { id: 'rectangle', label: 'Rectangle', icon: <FiSquare />, shortcut: 'R' },
    { id: 'circle', label: 'Circle', icon: <FiCircle />, shortcut: 'C' },
    { id: 'line', label: 'Line', icon: <FiMinus />, shortcut: 'L' },
    { id: 'image', label: 'Image', icon: <FiImage />, shortcut: 'I' },
  ];

  const handleToolChange = (newTool: Tool) => {
    if (newTool === 'image') {
      fileInputRef.current?.click();
    } else {
      setTool(newTool);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      if (imageUrl) {
        const img = new Image();
        img.onload = () => {
          const element = createImageElement(imageUrl, 100, 100, img.width, img.height);
          addElement(element);
        };
        img.src = imageUrl;
      }
    };
    reader.readAsDataURL(file);
    
    // Reset input
    event.target.value = '';
  };

  const handleOrientationToggle = () => {
    updateConfig({
      orientation: config.orientation === 'landscape' ? 'portrait' : 'landscape',
    });
  };

  const handleGridToggle = () => {
    updateConfig({
      gridVisible: !config.gridVisible,
    });
  };

  const handleZoomIn = () => {
    setZoom(zoom * 1.2);
  };

  const handleZoomOut = () => {
    setZoom(zoom / 1.2);
  };

  const handleZoomReset = () => {
    resetView();
  };

  return (
    <div className={`bg-white border-r border-gray-300 ${className}`}>
      <div className="p-4 space-y-4">
        {/* Tools */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            {tools.map((toolItem) => (
              <button
                key={toolItem.id}
                onClick={() => handleToolChange(toolItem.id)}
                className={`p-2 rounded-lg border transition-colors ${
                  tool === toolItem.id
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
                title={`${toolItem.label} (${toolItem.shortcut})`}
              >
                <div className="flex flex-col items-center space-y-1">
                  {toolItem.icon}
                  <span className="text-xs">{toolItem.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Controls */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Canvas</h3>
          <div className="space-y-2">
            <button
              onClick={handleOrientationToggle}
              className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {config.orientation === 'landscape' ? '📱 Portrait' : '🖥️ Landscape'}
            </button>
            
            <button
              onClick={handleGridToggle}
              className={`w-full p-2 text-sm border rounded-lg transition-colors ${
                config.gridVisible
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiGrid className="inline mr-2" />
              Grid
            </button>

            <button
              onClick={() => updateConfig({ monochromePreview: !config.monochromePreview })}
              className={`w-full p-2 text-sm border rounded-lg transition-colors ${
                config.monochromePreview
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              ⚫ {config.monochromePreview ? 'Color View' : 'B&W Preview'}
            </button>
          </div>
        </div>

        {/* Monochrome Settings */}
        {config.monochromePreview && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">B&W Settings</h3>
            <div className="space-y-3">
                                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Threshold: {config.monochromeThreshold}
                        </label>
                        <input
                          type="range"
                          min="80"
                          max="180"
                          step="5"
                          value={config.monochromeThreshold}
                          onChange={(e) => updateConfig({ monochromeThreshold: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Dark</span>
                          <span>Light</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Contrast: {config.monochromeContrast.toFixed(1)}
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="1.5"
                          step="0.1"
                          value={config.monochromeContrast}
                          onChange={(e) => updateConfig({ monochromeContrast: parseFloat(e.target.value) })}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Soft</span>
                          <span>Sharp</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Brightness: {config.monochromeBrightness > 0 ? '+' : ''}{config.monochromeBrightness}
                        </label>
                        <input
                          type="range"
                          min="-30"
                          max="30"
                          step="5"
                          value={config.monochromeBrightness}
                          onChange={(e) => updateConfig({ monochromeBrightness: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Darker</span>
                          <span>Brighter</span>
                        </div>
                      </div>
            </div>
          </div>
        )}

        {/* History */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">History</h3>
          <div className="flex space-x-2">
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="flex-1 p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiRotateCcw className="inline mr-1" />
              Undo
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="flex-1 p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiRotateCw className="inline mr-1" />
              Redo
            </button>
          </div>
        </div>

        {/* Zoom */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Zoom</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiZoomOut />
            </button>
            <div className="flex-1 text-center text-sm text-gray-600">
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiZoomIn />
            </button>
          </div>
          <button
            onClick={handleZoomReset}
            className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiMove className="inline mr-2" />
            Reset View
          </button>
        </div>

        {/* Element Actions */}
        {selectedElementId && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Element</h3>
            <div className="space-y-2">
              <button
                onClick={() => duplicateElement(selectedElementId)}
                className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiCopy className="inline mr-2" />
                Duplicate
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => bringToFront(selectedElementId)}
                  className="flex-1 p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Bring to Front"
                >
                  <FiArrowUp className="inline mr-1" />
                  Front
                </button>
                <button
                  onClick={() => sendToBack(selectedElementId)}
                  className="flex-1 p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Send to Back"
                >
                  <FiArrowDown className="inline mr-1" />
                  Back
                </button>
              </div>
              
              <button
                onClick={() => deleteElement(selectedElementId)}
                className="w-full p-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                <FiTrash2 className="inline mr-2" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Clear Canvas */}
        <div className="space-y-2">
          <button
            onClick={clearCanvas}
            className="w-full p-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            <FiTrash2 className="inline mr-2" />
            Clear Canvas
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

export default Toolbar;
