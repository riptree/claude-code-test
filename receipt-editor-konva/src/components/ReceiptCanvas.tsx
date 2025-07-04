'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Circle, Line, Image as KonvaImage } from 'react-konva';
import { useCanvasStore } from '@/lib/stores/canvasStore';
import { CanvasElement } from '@/lib/types';
import Konva from 'konva';

interface ReceiptCanvasProps {
  className?: string;
  stageRef?: React.RefObject<Konva.Stage>;
}

const ReceiptCanvas: React.FC<ReceiptCanvasProps> = ({ className, stageRef: externalStageRef }) => {
  const internalStageRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef || internalStageRef;
  const [images, setImages] = useState<Map<string, HTMLImageElement>>(new Map());
  
  const {
    config,
    elements,
    selectedElementId,
    tool,
    selectElement,
    updateElement,
    addElement,
    deleteElement,
    setTool,
    zoom,
    panX,
    panY,
  } = useCanvasStore();

  // Handle image loading
  useEffect(() => {
    const imageElements = elements.filter(el => el.type === 'image' && el.imageUrl);
    
    imageElements.forEach(element => {
      if (element.imageUrl && !images.has(element.id)) {
        const img = new Image();
        img.onload = () => {
          setImages(prev => new Map(prev).set(element.id, img));
        };
        img.src = element.imageUrl;
      }
    });
  }, [elements, images]);

  // Handle stage click for adding elements
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === 'select') {
      if (e.target === e.target.getStage()) {
        selectElement(null);
      }
      return;
    }

    const stage = e.target.getStage();
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const { x, y } = pointer;
    
    let newElement: CanvasElement;
    const elementId = `${tool}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    switch (tool) {
      case 'text':
        newElement = {
          id: elementId,
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
          text: 'New Text',
          fontSize: 16,
          fontFamily: 'Arial',
          fontStyle: 'normal',
          textAlign: 'left',
        };
        break;
      
      case 'rectangle':
        newElement = {
          id: elementId,
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
        };
        break;
      
      case 'circle':
        newElement = {
          id: elementId,
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
        };
        break;
      
      case 'line':
        newElement = {
          id: elementId,
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
        };
        break;
      
      default:
        return;
    }

    addElement(newElement);
    selectElement(elementId);
    setTool('select');
  };

  // Handle element selection
  const handleElementClick = (elementId: string) => {
    selectElement(elementId);
  };

  // Handle element drag
  const handleElementDragEnd = (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    updateElement(elementId, {
      x: node.x(),
      y: node.y(),
    });
  };

  // Handle element transform
  const handleElementTransform = (elementId: string, e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    updateElement(elementId, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation(),
    });
    
    // Reset scale to 1
    node.scaleX(1);
    node.scaleY(1);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          deleteElement(selectedElementId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, deleteElement]);

  // Render element based on type
  const renderElement = (element: CanvasElement) => {
    const isSelected = element.id === selectedElementId;
    const commonProps = {
      key: element.id,
      id: element.id,
      x: element.x,
      y: element.y,
      rotation: element.rotation,
      opacity: element.opacity,
      draggable: true,
      onClick: () => handleElementClick(element.id),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleElementDragEnd(element.id, e),
      onTransform: (e: Konva.KonvaEventObject<Event>) => handleElementTransform(element.id, e),
      stroke: isSelected ? '#0066cc' : undefined,
      strokeWidth: isSelected ? 2 : undefined,
      strokeScaleEnabled: false,
    };

    switch (element.type) {
      case 'text':
        return (
          <Text
            {...commonProps}
            text={element.text || 'Text'}
            fontSize={element.fontSize || 16}
            fontFamily={element.fontFamily || 'Arial'}
            fontStyle={element.fontStyle || 'normal'}
            fill={element.fill}
            width={element.width}
            height={element.height}
            align={element.textAlign || 'left'}
            verticalAlign="top"
          />
        );
      
      case 'rectangle':
        return (
          <Rect
            {...commonProps}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      
      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={Math.min(element.width, element.height) / 2}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      
      case 'line':
        return (
          <Line
            {...commonProps}
            points={element.points || [0, 0, element.width, 0]}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      
      case 'image':
        const img = images.get(element.id);
        return (
          <KonvaImage
            {...commonProps}
            image={img}
            width={element.width}
            height={element.height}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`relative bg-gray-100 ${className}`}>
      <div 
        className="bg-white shadow-lg border border-gray-300 rounded-lg overflow-hidden"
        style={{
          width: config.width + 40,
          height: config.height + 40,
          padding: '20px',
        }}
      >
        <Stage
          ref={stageRef}
          width={config.width}
          height={config.height}
          scaleX={zoom}
          scaleY={zoom}
          x={panX}
          y={panY}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            {/* Canvas background */}
            <Rect
              x={0}
              y={0}
              width={config.width}
              height={config.height}
              fill={config.backgroundColor}
              listening={false}
            />
            
            {/* Grid */}
            {config.gridVisible && (
              <>
                {Array.from({ length: Math.ceil(config.width / config.gridSize) + 1 }, (_, i) => (
                  <Line
                    key={`grid-v-${i}`}
                    points={[i * config.gridSize, 0, i * config.gridSize, config.height]}
                    stroke="#ddd"
                    strokeWidth={0.5}
                    listening={false}
                  />
                ))}
                {Array.from({ length: Math.ceil(config.height / config.gridSize) + 1 }, (_, i) => (
                  <Line
                    key={`grid-h-${i}`}
                    points={[0, i * config.gridSize, config.width, i * config.gridSize]}
                    stroke="#ddd"
                    strokeWidth={0.5}
                    listening={false}
                  />
                ))}
              </>
            )}
            
            {/* Render elements */}
            {elements.map(renderElement)}
          </Layer>
        </Stage>
      </div>
      
      {/* Canvas info */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {config.width} × {config.height}px
      </div>
      
      {/* Zoom info */}
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};

export default ReceiptCanvas;