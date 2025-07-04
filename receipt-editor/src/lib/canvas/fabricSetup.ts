import * as fabric from 'fabric';

export const initializeFabricCanvas = (canvasElement: HTMLCanvasElement, width: number, height: number) => {
  const canvas = new fabric.Canvas(canvasElement, {
    width,
    height,
    backgroundColor: '#ffffff',
    selection: true,
    preserveObjectStacking: true,
    renderOnAddRemove: true,
    controlsAboveOverlay: true,
    allowTouchScrolling: false,
  });

  // Set up grid
  const gridSize = 20;
  const drawGrid = () => {
    const objects = [];
    
    // Vertical lines
    for (let i = 0; i <= width; i += gridSize) {
      objects.push(new fabric.Line([i, 0, i, height], {
        stroke: '#e0e0e0',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        excludeFromExport: true,
      }));
    }
    
    // Horizontal lines
    for (let i = 0; i <= height; i += gridSize) {
      objects.push(new fabric.Line([0, i, width, i], {
        stroke: '#e0e0e0',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        excludeFromExport: true,
      }));
    }
    
    const group = new fabric.Group(objects, {
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });
    
    canvas.add(group);
    // In Fabric.js v6, we'll handle the grid rendering differently
    // The grid will be rendered first since it's added first
  };

  drawGrid();

  // Set up snapping
  const snapToGrid = (value: number) => {
    return Math.round(value / gridSize) * gridSize;
  };

  canvas.on('object:moving', (e) => {
    const obj = e.target;
    if (obj && obj.type !== 'group') {
      obj.set({
        left: snapToGrid(obj.left || 0),
        top: snapToGrid(obj.top || 0),
      });
    }
  });

  // Set up object constraints
  canvas.on('object:moving', (e) => {
    const obj = e.target;
    if (obj) {
      const objWidth = obj.width! * obj.scaleX!;
      const objHeight = obj.height! * obj.scaleY!;
      
      // Keep objects within canvas bounds
      if (obj.left! < 0) obj.set({ left: 0 });
      if (obj.top! < 0) obj.set({ top: 0 });
      if (obj.left! + objWidth > width) obj.set({ left: width - objWidth });
      if (obj.top! + objHeight > height) obj.set({ top: height - objHeight });
    }
  });

  // Set up selection styling
  fabric.Object.prototype.set({
    transparentCorners: false,
    cornerSize: 8,
    cornerStyle: 'circle',
    cornerColor: '#2563eb',
    borderColor: '#2563eb',
    borderScaleFactor: 1,
  });

  return canvas;
};

export const createTextElement = (
  text: string,
  options: {
    left?: number;
    top?: number;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fill?: string;
    textAlign?: string;
  } = {}
) => {
  return new fabric.Text(text, {
    left: options.left || 50,
    top: options.top || 50,
    fontSize: options.fontSize || 16,
    fontFamily: options.fontFamily || 'Arial',
    fontWeight: options.fontWeight || 'normal',
    fill: options.fill || '#000000',
    textAlign: options.textAlign || 'left',
    selectable: true,
    editable: true,
  });
};

export const createRectangleElement = (
  options: {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  } = {}
) => {
  return new fabric.Rect({
    left: options.left || 50,
    top: options.top || 50,
    width: options.width || 100,
    height: options.height || 100,
    fill: options.fill || 'transparent',
    stroke: options.stroke || '#000000',
    strokeWidth: options.strokeWidth || 1,
    selectable: true,
  });
};

export const createCircleElement = (
  options: {
    left?: number;
    top?: number;
    radius?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  } = {}
) => {
  return new fabric.Circle({
    left: options.left || 50,
    top: options.top || 50,
    radius: options.radius || 50,
    fill: options.fill || 'transparent',
    stroke: options.stroke || '#000000',
    strokeWidth: options.strokeWidth || 1,
    selectable: true,
  });
};

export const createLineElement = (
  options: {
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    stroke?: string;
    strokeWidth?: number;
  } = {}
) => {
  return new fabric.Line([
    options.x1 || 50,
    options.y1 || 50,
    options.x2 || 150,
    options.y2 || 50,
  ], {
    stroke: options.stroke || '#000000',
    strokeWidth: options.strokeWidth || 1,
    selectable: true,
  });
};

export const loadImageElement = (
  imageUrl: string,
  options: {
    left?: number;
    top?: number;
    scaleX?: number;
    scaleY?: number;
  } = {}
): Promise<fabric.Image> => {
  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(imageUrl).then((img) => {
      img.set({
        left: options.left || 50,
        top: options.top || 50,
        scaleX: options.scaleX || 1,
        scaleY: options.scaleY || 1,
        selectable: true,
      });
      resolve(img);
    }).catch(() => {
      reject(new Error('Failed to load image'));
    });
  });
};
