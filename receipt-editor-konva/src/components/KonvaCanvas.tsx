'use client';

import React, { useRef, useEffect } from 'react';
import { Stage as KonvaStage } from 'konva/lib/Stage';
import { KonvaEventObject } from 'konva/lib/Node';
import { Stage, Layer, Rect, Text, Circle, Line, Transformer } from 'react-konva';
import { Transformer as KonvaTransformer } from 'konva/lib/shapes/Transformer';

import { useCanvasStore } from '@/lib/stores/canvasStore';
import { CanvasElement } from '@/lib/types';
import { ImageElement } from '@/components/ImageElement';

interface KonvaCanvasProps {
  className?: string;
  stageRef?: React.RefObject<KonvaStage | null>;
}

const KonvaCanvas: React.FC<KonvaCanvasProps> = ({ className, stageRef: externalStageRef }) => {
  const internalStageRef = useRef<KonvaStage | null>(null);
  const stageRef = externalStageRef || internalStageRef;
  const transformerRef = useRef<KonvaTransformer>(null);
  
  const {
    config,
    elements,
    selectedElementId,
    tool,
    selectElement,
    updateElement,
    addElement,
    setTool,
  } = useCanvasStore();

  // Update transformer when selection changes
  useEffect(() => {
    if (transformerRef.current) {
      const stage = stageRef.current;
      if (stage && selectedElementId) {
        const selectedNode = stage.findOne('#' + selectedElementId);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
        } else {
          transformerRef.current.nodes([]);
        }
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedElementId, stageRef]);

  // Handle stage click for adding elements
  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
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
    
    const elementId = `${tool}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let newElement: CanvasElement;

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
          fill: '#000000',
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
  const handleElementDragEnd = (elementId: string, e: KonvaEventObject<MouseEvent>) => {
    const node = e.target;
    updateElement(elementId, {
      x: node.x(),
      y: node.y(),
    });
  };

  // Handle transformer changes
  const handleTransformEnd = (e: KonvaEventObject<MouseEvent>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Calculate new width and height
    const newWidth = Math.max(5, node.width() * scaleX);
    const newHeight = Math.max(5, node.height() * scaleY);
    
    // Reset scale and update dimensions
    node.scaleX(1);
    node.scaleY(1);
    
    updateElement(node.id(), {
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight,
      rotation: node.rotation(),
    });
  };

  return (
    <div className={`relative bg-gray-100 ${className || ''} max-w-full max-h-full overflow-auto`}>
      <div 
        className="bg-white shadow-lg border border-gray-300 rounded-lg overflow-hidden"
        style={{
          width: config.width,
          height: config.height,
          maxWidth: '100%',
          maxHeight: '100%',
          filter: `grayscale(1) contrast(${Math.min(config.monochromeContrast * 1.2, 2.5)})`
        }}
      >
        <Stage
          ref={stageRef}
          width={config.width}
          height={config.height}
          onClick={handleStageClick}
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
            
            {/* Render elements */}
            {elements.map((element) => {
              const isSelected = element.id === selectedElementId;
              const commonProps = {
                id: element.id,
                x: element.x,
                y: element.y,
                rotation: element.rotation,
                opacity: element.opacity,
                draggable: true,
                onClick: () => handleElementClick(element.id),
                onDragEnd: (e: KonvaEventObject<MouseEvent>) => handleElementDragEnd(element.id, e),
                stroke: isSelected ? '#0066cc' : undefined,
                strokeWidth: isSelected ? 2 : undefined,
                strokeScaleEnabled: false,
              };

              switch (element.type) {
                case 'text':
                  return (
                    <Text
                      key={element.id}
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
                      key={element.id}
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
                      key={element.id}
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
                      key={element.id}
                      {...commonProps}
                      points={element.points || [0, 0, element.width, 0]}
                      stroke={element.stroke}
                      strokeWidth={element.strokeWidth}
                    />
                  );
                
                case 'image':
                  return (
                    <ImageElement
                      key={element.id}
                      element={element as CanvasElement & { type: 'image' }}
                      commonProps={commonProps}
                    />
                  );
                
                default:
                  return null;
              }
            })}
            
            {/* Transformer for resizing */}
            <Transformer
              ref={transformerRef}
              keepRatio={selectedElementId ? elements.find(el => el.id === selectedElementId)?.type === 'image' : false}
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
              onTransformEnd={handleTransformEnd}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export { KonvaCanvas }; 
