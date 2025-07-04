'use client';

import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useCanvasStore } from '@/lib/stores/canvasStore';
import { initializeFabricCanvas } from '@/lib/canvas/fabricSetup';
import { resizeCanvas } from '@/lib/canvas/canvasUtils';

export default function ReceiptCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { config, tool, selectElement, updateElement } = useCanvasStore();
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = initializeFabricCanvas(canvasRef.current, config.width, config.height);
    fabricCanvasRef.current = canvas;

    // Set up canvas event listeners
    canvas.on('selection:created', (e) => {
      const activeObject = e.selected?.[0];
      if (activeObject && activeObject.id) {
        selectElement(activeObject.id);
      }
    });

    canvas.on('selection:updated', (e) => {
      const activeObject = e.selected?.[0];
      if (activeObject && activeObject.id) {
        selectElement(activeObject.id);
      }
    });

    canvas.on('selection:cleared', () => {
      selectElement(null);
    });

    canvas.on('object:modified', (e) => {
      const obj = e.target;
      if (obj && obj.id) {
        updateElement(obj.id, {
          x: obj.left || 0,
          y: obj.top || 0,
          width: (obj.width || 0) * (obj.scaleX || 1),
          height: (obj.height || 0) * (obj.scaleY || 1),
          rotation: obj.angle || 0,
        });
      }
    });

    setIsCanvasReady(true);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Handle canvas resize when config changes
  useEffect(() => {
    if (fabricCanvasRef.current && isCanvasReady) {
      resizeCanvas(fabricCanvasRef.current, config.width, config.height);
    }
  }, [config.width, config.height, isCanvasReady]);

  // Handle tool changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    
    switch (tool) {
      case 'select':
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        break;
      case 'text':
        canvas.selection = false;
        canvas.defaultCursor = 'text';
        break;
      case 'rectangle':
      case 'circle':
      case 'line':
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        break;
      case 'image':
        canvas.selection = false;
        canvas.defaultCursor = 'copy';
        break;
      default:
        canvas.selection = true;
        canvas.defaultCursor = 'default';
    }
  }, [tool]);

  // Handle canvas clicks for adding elements
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    
    const handleCanvasClick = (e: fabric.IEvent) => {
      if (tool === 'select' || !e.pointer) return;

      const pointer = e.pointer;
      
      // Import the element creation functions dynamically to avoid circular dependencies
      import('@/lib/canvas/fabricSetup').then(({ 
        createTextElement, 
        createRectangleElement, 
        createCircleElement, 
        createLineElement 
      }) => {
        let newElement: fabric.Object | null = null;
        
        switch (tool) {
          case 'text':
            newElement = createTextElement('Text', {
              left: pointer.x,
              top: pointer.y,
            });
            break;
          case 'rectangle':
            newElement = createRectangleElement({
              left: pointer.x,
              top: pointer.y,
            });
            break;
          case 'circle':
            newElement = createCircleElement({
              left: pointer.x,
              top: pointer.y,
            });
            break;
          case 'line':
            newElement = createLineElement({
              x1: pointer.x,
              y1: pointer.y,
              x2: pointer.x + 100,
              y2: pointer.y,
            });
            break;
        }

        if (newElement) {
          // Add unique ID to the element
          newElement.id = `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          canvas.add(newElement);
          canvas.setActiveObject(newElement);
          canvas.renderAll();
        }
      });
    };

    canvas.on('mouse:down', handleCanvasClick);

    return () => {
      canvas.off('mouse:down', handleCanvasClick);
    };
  }, [tool]);

  return (
    <div className="relative">
      <div 
        className="bg-white shadow-lg border border-gray-300 rounded-lg overflow-hidden"
        style={{
          width: config.width + 20,
          height: config.height + 20,
          padding: '10px',
        }}
      >
        <canvas
          ref={canvasRef}
          className="border border-gray-200"
          style={{
            width: config.width,
            height: config.height,
          }}
        />
      </div>
      
      {/* Canvas info overlay */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {config.width} × {config.height}px
      </div>
    </div>
  );
}