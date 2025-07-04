'use client';

import React from 'react';
import { useCanvasStore } from '@/lib/stores/canvasStore';
import { CanvasElement } from '@/lib/types';

interface PropertyPanelProps {
  className?: string;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ className }) => {
  const { elements, selectedElementId, updateElement } = useCanvasStore();

  const selectedElement = elements.find(el => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className={`bg-white border-l border-gray-300 ${className}`}>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Properties</h3>
          <p className="text-sm text-gray-500">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (property: keyof CanvasElement, value: any) => {
    updateElement(selectedElement.id, { [property]: value });
  };

  const renderTextProperties = () => {
    if (selectedElement.type !== 'text') return null;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text
          </label>
          <textarea
            value={selectedElement.text || ''}
            onChange={(e) => handlePropertyChange('text', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Size
          </label>
          <input
            type="number"
            value={selectedElement.fontSize || 16}
            onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            min="8"
            max="200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Family
          </label>
          <select
            value={selectedElement.fontFamily || 'Arial'}
            onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Style
          </label>
          <select
            value={selectedElement.fontStyle || 'normal'}
            onChange={(e) => handlePropertyChange('fontStyle', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="italic">Italic</option>
            <option value="bold italic">Bold Italic</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Align
          </label>
          <select
            value={selectedElement.textAlign || 'left'}
            onChange={(e) => handlePropertyChange('textAlign', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <div className="flex space-x-2">
            <input
              type="color"
              value={selectedElement.fill || '#000000'}
              onChange={(e) => handlePropertyChange('fill', e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={selectedElement.fill || '#000000'}
              onChange={(e) => handlePropertyChange('fill', e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderImageProperties = () => {
    if (selectedElement.type !== 'image') return null;

    const aspectRatio = selectedElement.width / selectedElement.height;

    const handleResizeWithRatio = (newWidth: number) => {
      const newHeight = newWidth / aspectRatio;
      handlePropertyChange('width', Math.round(newWidth));
      handlePropertyChange('height', Math.round(newHeight));
    };



    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              比率を保持してリサイズ (現在の比率: {aspectRatio.toFixed(2)})
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => {
                  const newWidth = parseInt(e.target.value) || 1;
                  handleResizeWithRatio(newWidth);
                }}
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                min="1"
                placeholder="幅"
              />
              <span className="flex items-center text-gray-500">×</span>
              <input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => {
                  const newHeight = parseInt(e.target.value) || 1;
                  const newWidth = newHeight * aspectRatio;
                  handlePropertyChange('width', Math.round(newWidth));
                  handlePropertyChange('height', Math.round(newHeight));
                }}
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                min="1"
                placeholder="高さ"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleResizeWithRatio(100)}
              className="flex-1 p-2 text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded hover:bg-gray-100 transition-colors"
            >
              小 (100px)
            </button>
            <button
              onClick={() => handleResizeWithRatio(150)}
              className="flex-1 p-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded hover:bg-blue-100 transition-colors"
            >
              中 (150px)
            </button>
            <button
              onClick={() => handleResizeWithRatio(200)}
              className="flex-1 p-2 text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded hover:bg-gray-100 transition-colors"
            >
              大 (200px)
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderShapeProperties = () => {
    if (!['rectangle', 'circle', 'line'].includes(selectedElement.type)) return null;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fill Color
          </label>
          <div className="flex space-x-2">
            <input
              type="color"
              value={selectedElement.fill || '#ffffff'}
              onChange={(e) => handlePropertyChange('fill', e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={selectedElement.fill || '#ffffff'}
              onChange={(e) => handlePropertyChange('fill', e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stroke Color
          </label>
          <div className="flex space-x-2">
            <input
              type="color"
              value={selectedElement.stroke || '#000000'}
              onChange={(e) => handlePropertyChange('stroke', e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={selectedElement.stroke || '#000000'}
              onChange={(e) => handlePropertyChange('stroke', e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stroke Width
          </label>
          <input
            type="number"
            value={selectedElement.strokeWidth || 2}
            onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            min="0"
            max="50"
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border-l border-gray-300 ${className}`}>
      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Properties</h3>
          <div className="text-xs text-gray-500 mb-4">
            {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Element
          </div>
        </div>

        {/* Position & Size */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Position & Size</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-700 mb-1">X</label>
              <input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => handlePropertyChange('x', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">Y</label>
              <input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => handlePropertyChange('y', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          {/* Show regular size inputs for non-image elements */}
          {selectedElement.type !== 'image' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Width</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.width)}
                  onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Height</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.height)}
                  onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  min="1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Transform */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Transform</h4>
          
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              Rotation ({Math.round(selectedElement.rotation)}°)
            </label>
            <input
              type="range"
              value={selectedElement.rotation}
              onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value))}
              className="w-full"
              min="-180"
              max="180"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-700 mb-1">
              Opacity ({Math.round(selectedElement.opacity * 100)}%)
            </label>
            <input
              type="range"
              value={selectedElement.opacity}
              onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
              className="w-full"
              min="0"
              max="1"
              step="0.1"
            />
          </div>
        </div>

        {/* Type-specific properties */}
        {renderTextProperties()}
        {renderImageProperties()}
        {renderShapeProperties()}

        {/* Element Info */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Element Info</h4>
          <div className="text-xs text-gray-500 space-y-1">
            <div>ID: {selectedElement.id}</div>
            <div>Type: {selectedElement.type}</div>
            <div>Position: ({Math.round(selectedElement.x)}, {Math.round(selectedElement.y)})</div>
            <div>Size: {Math.round(selectedElement.width)} × {Math.round(selectedElement.height)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;
