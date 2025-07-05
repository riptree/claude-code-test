'use client';

import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Circle, Line, Image, Transformer } from 'react-konva';
import { useCanvasStore } from '@/lib/stores/canvasStore';

// Konvaの型を動的インポート用に定義
type KonvaStage = {
  toDataURL: (config?: {
    mimeType?: string;
    quality?: number;
    pixelRatio?: number;
    width?: number;
    height?: number;
  }) => string;
  getPointerPosition: () => { x: number; y: number } | null;
  x: () => number;
  y: () => number;
  scaleX: () => number;
  scaleY: () => number;
  width: () => number;
  height: () => number;
  [key: string]: unknown;
};

type KonvaEvent = {
  target: {
    getStage: () => KonvaStage | null;
    x: () => number;
    y: () => number;
    scaleX: () => number;
    scaleY: () => number;
    width: () => number;
    height: () => number;
    rotation: () => number;
  };
};

interface KonvaCanvasProps {
  className?: string;
  stageRef?: React.RefObject<KonvaStage | null>;
}

const KonvaCanvas: React.FC<KonvaCanvasProps> = ({ className, stageRef: externalStageRef }) => {
  const internalStageRef = useRef<KonvaStage | null>(null);
  const stageRef = externalStageRef || internalStageRef;
  const transformerRef = useRef<any>(null);
  
  const {
    config,
    elements,
    selectedElementId,
    tool,
    selectElement,
    updateElement,
    addElement,
    setTool,
    zoom,
    panX,
    panY,
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
  const handleStageClick = (e: KonvaEvent) => {
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

    let newElement: any;

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
  const handleElementDragEnd = (elementId: string, e: any) => {
    const node = e.target;
    updateElement(elementId, {
      x: node.x(),
      y: node.y(),
    });
  };

  // Handle transformer changes
  const handleTransformEnd = (e: any) => {
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
          width: config.width + 40,
          height: config.height + 40,
          padding: '20px',
          maxWidth: '100%',
          maxHeight: '100%',
          filter: config.monochromePreview 
            ? `grayscale(1) contrast(${Math.min(config.monochromeContrast * 1.2, 2.5)})`
            : 'none'
        }}
      >
        <Stage
          ref={stageRef as any}
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
            
            {/* Render elements */}
            {elements.map((element) => {
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
                onDragEnd: (e: any) => handleElementDragEnd(element.id, e),
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
                  const ImageComponent = () => {
                    const [imageElement, setImageElement] = React.useState<HTMLImageElement | null>(null);
                    
                    React.useEffect(() => {
                      if (element.imageUrl) {
                        const img = new window.Image();
                        img.onload = () => setImageElement(img);
                        img.src = element.imageUrl;
                      }
                    }, [element.imageUrl]);
                    
                    return (
                      <Image
                        {...commonProps}
                        width={element.width}
                        height={element.height}
                        image={imageElement || undefined}
                      />
                    );
                  };
                  
                  return <ImageComponent />;
                
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

export default KonvaCanvas; 
