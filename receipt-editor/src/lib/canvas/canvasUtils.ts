import * as fabric from 'fabric';

export const generateId = (): string => {
  return `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const exportCanvasAsDataURL = (canvas: fabric.Canvas, format: string = 'png'): string => {
  // Hide grid and non-exportable elements
  const objects = canvas.getObjects();
  const hiddenObjects: fabric.Object[] = [];
  
  objects.forEach(obj => {
    if ((obj as any).excludeFromExport) {
      obj.visible = false;
      hiddenObjects.push(obj);
    }
  });
  
  canvas.renderAll();
  
  const dataURL = canvas.toDataURL({
    format,
    quality: 1,
    multiplier: 1,
  });
  
  // Restore visibility
  hiddenObjects.forEach(obj => {
    obj.visible = true;
  });
  
  canvas.renderAll();
  
  return dataURL;
};

export const resizeCanvas = (canvas: fabric.Canvas, width: number, height: number) => {
  canvas.setDimensions({ width, height });
  
  // Remove existing grid
  const objects = canvas.getObjects();
  const gridObjects = objects.filter(obj => (obj as any).excludeFromExport);
  gridObjects.forEach(obj => canvas.remove(obj));
  
  // Redraw grid
  const gridSize = 20;
  const gridObjects2 = [];
  
  // Vertical lines
  for (let i = 0; i <= width; i += gridSize) {
    gridObjects2.push(new fabric.Line([i, 0, i, height], {
      stroke: '#e0e0e0',
      strokeWidth: 1,
      selectable: false,
      evented: false,
      excludeFromExport: true,
    }));
  }
  
  // Horizontal lines
  for (let i = 0; i <= height; i += gridSize) {
    gridObjects2.push(new fabric.Line([0, i, width, i], {
      stroke: '#e0e0e0',
      strokeWidth: 1,
      selectable: false,
      evented: false,
      excludeFromExport: true,
    }));
  }
  
  const group = new fabric.Group(gridObjects2, {
    selectable: false,
    evented: false,
    excludeFromExport: true,
  });
  
  canvas.add(group);
  // In Fabric.js v6, we'll handle the grid rendering differently
  // The grid will be rendered first since it's added first
  canvas.renderAll();
};

export const centerObjectOnCanvas = (canvas: fabric.Canvas, obj: fabric.Object) => {
  const canvasCenter = canvas.getCenter();
  obj.set({
    left: canvasCenter.left - (obj.width! * obj.scaleX!) / 2,
    top: canvasCenter.top - (obj.height! * obj.scaleY!) / 2,
  });
  canvas.renderAll();
};

export const duplicateObject = (canvas: fabric.Canvas, obj: fabric.Object): Promise<fabric.Object> => {
  return new Promise((resolve) => {
    obj.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (obj.left || 0) + 10,
        top: (obj.top || 0) + 10,
      });
      canvas.add(cloned);
      resolve(cloned);
    });
  });
};

export const alignObjects = (canvas: fabric.Canvas, alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length < 2) return;
  
  const canvasWidth = canvas.width || 0;
  const canvasHeight = canvas.height || 0;
  
  switch (alignment) {
    case 'left':
      const leftMost = Math.min(...activeObjects.map(obj => obj.left || 0));
      activeObjects.forEach(obj => obj.set({ left: leftMost }));
      break;
      
    case 'center':
      const centerX = canvasWidth / 2;
      activeObjects.forEach(obj => {
        const objWidth = (obj.width || 0) * (obj.scaleX || 1);
        obj.set({ left: centerX - objWidth / 2 });
      });
      break;
      
    case 'right':
      const rightMost = Math.max(...activeObjects.map(obj => (obj.left || 0) + ((obj.width || 0) * (obj.scaleX || 1))));
      activeObjects.forEach(obj => {
        const objWidth = (obj.width || 0) * (obj.scaleX || 1);
        obj.set({ left: rightMost - objWidth });
      });
      break;
      
    case 'top':
      const topMost = Math.min(...activeObjects.map(obj => obj.top || 0));
      activeObjects.forEach(obj => obj.set({ top: topMost }));
      break;
      
    case 'middle':
      const centerY = canvasHeight / 2;
      activeObjects.forEach(obj => {
        const objHeight = (obj.height || 0) * (obj.scaleY || 1);
        obj.set({ top: centerY - objHeight / 2 });
      });
      break;
      
    case 'bottom':
      const bottomMost = Math.max(...activeObjects.map(obj => (obj.top || 0) + ((obj.height || 0) * (obj.scaleY || 1))));
      activeObjects.forEach(obj => {
        const objHeight = (obj.height || 0) * (obj.scaleY || 1);
        obj.set({ top: bottomMost - objHeight });
      });
      break;
  }
  
  canvas.renderAll();
};

export const bringToFront = (canvas: fabric.Canvas, _obj: fabric.Object) => {
  // In Fabric.js v6, we need to handle object ordering differently
  // For now, we'll just render the canvas
  canvas.renderAll();
};

export const sendToBack = (canvas: fabric.Canvas, _obj: fabric.Object) => {
  // In Fabric.js v6, we need to handle object ordering differently
  // For now, we'll just render the canvas
  canvas.renderAll();
};

export const lockObject = (obj: fabric.Object, lock: boolean) => {
  obj.set({
    lockMovementX: lock,
    lockMovementY: lock,
    lockRotation: lock,
    lockScalingX: lock,
    lockScalingY: lock,
    selectable: !lock,
  });
};
