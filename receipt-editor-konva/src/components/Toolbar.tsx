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

  return (
    <div className={`bg-white border-r border-gray-300 ${className}`}>
      <div className="p-3 space-y-3">
        {/* Tools */}
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-gray-900">Tools</h3>
          <div className="grid grid-cols-2 gap-1">
            {tools.map((toolItem) => (
              <button
                key={toolItem.id}
                onClick={() => handleToolChange(toolItem.id)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  tool === toolItem.id
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'
                }`}
                title={`${toolItem.label} (${toolItem.shortcut})`}
              >
                <div className="flex flex-col items-center space-y-0.5">
                  <div className="text-sm">{toolItem.icon}</div>
                  <span className="text-xs">{toolItem.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Controls */}
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-gray-900">Canvas</h3>
          <div className="space-y-1.5">
            <button
              onClick={handleOrientationToggle}
              className="w-full p-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-900"
            >
              {config.orientation === 'landscape' ? '縦向きに変更' : '横向きに変更'}
            </button>
          </div>
        </div>

        {/* History */}
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-gray-900">History</h3>
          <div className="flex space-x-2">
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="flex-1 p-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-900"
            >
              <FiRotateCcw className="inline mr-1" />
              Undo
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="flex-1 p-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-900"
            >
              <FiRotateCw className="inline mr-1" />
              Redo
            </button>
          </div>
        </div>

        {/* Element Actions */}
        {selectedElementId && (
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-gray-900">Element</h3>
            <div className="space-y-1.5">
              <div className="flex space-x-2">
                <button
                  onClick={() => duplicateElement(selectedElementId)}
                  className="flex-1 p-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-900"
                >
                  <FiCopy className="inline mr-1" />
                  Copy
                </button>
                <button
                  onClick={() => deleteElement(selectedElementId)}
                  className="flex-1 p-1.5 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <FiTrash2 className="inline mr-1" />
                  Delete
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => bringToFront(selectedElementId)}
                  className="flex-1 p-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-900"
                >
                  <FiArrowUp className="inline mr-1" />
                  Front
                </button>
                <button
                  onClick={() => sendToBack(selectedElementId)}
                  className="flex-1 p-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-900"
                >
                  <FiArrowDown className="inline mr-1" />
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear Canvas */}
        <div className="space-y-1.5">
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

export { Toolbar };
