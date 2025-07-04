'use client';

import { useState } from 'react';
import { useCanvasStore } from '@/lib/stores/canvasStore';
import { FiSettings, FiType, FiSquare, FiImage, FiEye, FiEyeOff, FiLock, FiUnlock } from 'react-icons/fi';

interface PropertyGroupProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function PropertyGroup({ title, icon, children, defaultExpanded = true }: PropertyGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
        </div>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="p-3 pt-0 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

interface PropertyFieldProps {
  label: string;
  children: React.ReactNode;
}

function PropertyField({ label, children }: PropertyFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

export default function PropertyPanel() {
  const { 
    config, 
    updateConfig, 
    selectedElementId, 
    getSelectedElement, 
    updateElement,
    elements 
  } = useCanvasStore();

  const selectedElement = getSelectedElement();

  const handleConfigChange = (key: keyof typeof config, value: any) => {
    updateConfig({ [key]: value });
  };

  const handleElementChange = (key: string, value: any) => {
    if (selectedElementId) {
      updateElement(selectedElementId, { [key]: value });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Canvas Properties */}
        <PropertyGroup
          title="Canvas"
          icon={<FiSettings size={16} />}
          defaultExpanded={true}
        >
          <PropertyField label="Width (px)">
            <input
              type="number"
              value={config.width}
              onChange={(e) => handleConfigChange('width', parseInt(e.target.value))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              min="100"
              max="2000"
            />
          </PropertyField>
          
          <PropertyField label="Height (px)">
            <input
              type="number"
              value={config.height}
              onChange={(e) => handleConfigChange('height', parseInt(e.target.value))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              min="100"
              max="2000"
            />
          </PropertyField>
          
          <PropertyField label="Orientation">
            <select
              value={config.orientation}
              onChange={(e) => handleConfigChange('orientation', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
            </select>
          </PropertyField>
          
          <PropertyField label="Background Color">
            <input
              type="color"
              value={config.backgroundColor}
              onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
              className="w-full h-8 border border-gray-300 rounded"
            />
          </PropertyField>
        </PropertyGroup>

        {/* Element Properties */}
        {selectedElement && (
          <>
            {/* Common Properties */}
            <PropertyGroup
              title="Position & Size"
              icon={<FiSquare size={16} />}
              defaultExpanded={true}
            >
              <div className="grid grid-cols-2 gap-2">
                <PropertyField label="X">
                  <input
                    type="number"
                    value={Math.round(selectedElement.x)}
                    onChange={(e) => handleElementChange('x', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </PropertyField>
                <PropertyField label="Y">
                  <input
                    type="number"
                    value={Math.round(selectedElement.y)}
                    onChange={(e) => handleElementChange('y', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </PropertyField>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <PropertyField label="Width">
                  <input
                    type="number"
                    value={Math.round(selectedElement.width)}
                    onChange={(e) => handleElementChange('width', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    min="1"
                  />
                </PropertyField>
                <PropertyField label="Height">
                  <input
                    type="number"
                    value={Math.round(selectedElement.height)}
                    onChange={(e) => handleElementChange('height', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    min="1"
                  />
                </PropertyField>
              </div>
              
              <PropertyField label="Rotation">
                <input
                  type="number"
                  value={Math.round(selectedElement.rotation)}
                  onChange={(e) => handleElementChange('rotation', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  min="-180"
                  max="180"
                />
              </PropertyField>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedElement.visible}
                    onChange={(e) => handleElementChange('visible', e.target.checked)}
                    className="rounded"
                  />
                  <FiEye size={16} />
                  <span className="text-sm">Visible</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedElement.locked}
                    onChange={(e) => handleElementChange('locked', e.target.checked)}
                    className="rounded"
                  />
                  <FiLock size={16} />
                  <span className="text-sm">Locked</span>
                </label>
              </div>
            </PropertyGroup>

            {/* Text Properties */}
            {selectedElement.type === 'text' && (
              <PropertyGroup
                title="Text"
                icon={<FiType size={16} />}
                defaultExpanded={true}
              >
                <PropertyField label="Text">
                  <textarea
                    value={(selectedElement as any).text || ''}
                    onChange={(e) => handleElementChange('text', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    rows={3}
                  />
                </PropertyField>
                
                <PropertyField label="Font Size">
                  <input
                    type="number"
                    value={(selectedElement as any).fontSize || 16}
                    onChange={(e) => handleElementChange('fontSize', parseInt(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    min="8"
                    max="128"
                  />
                </PropertyField>
                
                <PropertyField label="Font Family">
                  <select
                    value={(selectedElement as any).fontFamily || 'Arial'}
                    onChange={(e) => handleElementChange('fontFamily', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </PropertyField>
                
                <PropertyField label="Font Weight">
                  <select
                    value={(selectedElement as any).fontWeight || 'normal'}
                    onChange={(e) => handleElementChange('fontWeight', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </PropertyField>
                
                <PropertyField label="Color">
                  <input
                    type="color"
                    value={(selectedElement as any).color || '#000000'}
                    onChange={(e) => handleElementChange('color', e.target.value)}
                    className="w-full h-8 border border-gray-300 rounded"
                  />
                </PropertyField>
                
                <PropertyField label="Alignment">
                  <select
                    value={(selectedElement as any).align || 'left'}
                    onChange={(e) => handleElementChange('align', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </PropertyField>
              </PropertyGroup>
            )}

            {/* Shape Properties */}
            {selectedElement.type === 'shape' && (
              <PropertyGroup
                title="Shape"
                icon={<FiSquare size={16} />}
                defaultExpanded={true}
              >
                <PropertyField label="Stroke Color">
                  <input
                    type="color"
                    value={(selectedElement as any).strokeColor || '#000000'}
                    onChange={(e) => handleElementChange('strokeColor', e.target.value)}
                    className="w-full h-8 border border-gray-300 rounded"
                  />
                </PropertyField>
                
                <PropertyField label="Stroke Width">
                  <input
                    type="number"
                    value={(selectedElement as any).strokeWidth || 1}
                    onChange={(e) => handleElementChange('strokeWidth', parseInt(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    min="0"
                    max="20"
                  />
                </PropertyField>
                
                <PropertyField label="Fill Color">
                  <input
                    type="color"
                    value={(selectedElement as any).fillColor || '#transparent'}
                    onChange={(e) => handleElementChange('fillColor', e.target.value)}
                    className="w-full h-8 border border-gray-300 rounded"
                  />
                </PropertyField>
              </PropertyGroup>
            )}

            {/* Image Properties */}
            {selectedElement.type === 'image' && (
              <PropertyGroup
                title="Image"
                icon={<FiImage size={16} />}
                defaultExpanded={true}
              >
                <PropertyField label="Opacity">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={(selectedElement as any).opacity || 1}
                    onChange={(e) => handleElementChange('opacity', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">
                    {Math.round(((selectedElement as any).opacity || 1) * 100)}%
                  </span>
                </PropertyField>
              </PropertyGroup>
            )}
          </>
        )}

        {/* Layer List */}
        <PropertyGroup
          title="Layers"
          icon={<FiSquare size={16} />}
          defaultExpanded={false}
        >
          <div className="space-y-1">
            {elements.map((element, index) => (
              <div
                key={element.id}
                className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                  selectedElementId === element.id
                    ? 'bg-blue-100 border border-blue-300'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => {
                  selectElement(element.id);
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {element.type === 'text' ? 'Text' : 
                     element.type === 'shape' ? 'Shape' : 
                     element.type === 'image' ? 'Image' : 'Element'}
                  </span>
                  <div className="flex items-center space-x-1">
                    {element.visible ? <FiEye size={12} /> : <FiEyeOff size={12} />}
                    {element.locked && <FiLock size={12} />}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(element.x)}, {Math.round(element.y)}
                </div>
              </div>
            ))}
            {elements.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4">
                No elements on canvas
              </div>
            )}
          </div>
        </PropertyGroup>
      </div>
    </div>
  );
}