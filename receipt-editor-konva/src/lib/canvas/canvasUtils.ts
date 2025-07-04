import Konva from 'konva';
import { CanvasElement } from '../types';

export const getRelativePointerPosition = (stage: Konva.Stage): { x: number; y: number } => {
  const transform = stage.getAbsoluteTransform().copy();
  transform.invert();

  const pos = stage.getPointerPosition();
  if (!pos) return { x: 0, y: 0 };

  return transform.point(pos);
};

export const getCanvasElementFromKonvaNode = (node: Konva.Node): Partial<CanvasElement> => {
  const attrs = node.getAttrs();
  const element: Partial<CanvasElement> = {
    id: attrs.id,
    x: attrs.x || 0,
    y: attrs.y || 0,
    rotation: attrs.rotation || 0,
    opacity: attrs.opacity || 1,
  };

  if (node instanceof Konva.Text) {
    element.type = 'text';
    element.width = attrs.width || 100;
    element.height = attrs.height || 30;
    element.text = attrs.text || 'Text';
    element.fontSize = attrs.fontSize || 16;
    element.fontFamily = attrs.fontFamily || 'Arial';
    element.fontStyle = attrs.fontStyle || 'normal';
    element.fill = attrs.fill || '#000000';
    element.textAlign = attrs.align || 'left';
  } else if (node instanceof Konva.Rect) {
    element.type = 'rectangle';
    element.width = attrs.width || 100;
    element.height = attrs.height || 50;
    element.fill = attrs.fill || '#ffffff';
    element.stroke = attrs.stroke || '#000000';
    element.strokeWidth = attrs.strokeWidth || 2;
  } else if (node instanceof Konva.Circle) {
    element.type = 'circle';
    const radius = attrs.radius || 40;
    element.width = radius * 2;
    element.height = radius * 2;
    element.fill = attrs.fill || '#ffffff';
    element.stroke = attrs.stroke || '#000000';
    element.strokeWidth = attrs.strokeWidth || 2;
  } else if (node instanceof Konva.Line) {
    element.type = 'line';
    element.points = attrs.points || [0, 0, 100, 0];
    element.stroke = attrs.stroke || '#000000';
    element.strokeWidth = attrs.strokeWidth || 2;
    element.width = 100;
    element.height = 2;
  } else if (node instanceof Konva.Image) {
    element.type = 'image';
    element.width = attrs.width || 100;
    element.height = attrs.height || 100;
  }

  return element;
};

export const calculateBoundingBox = (elements: CanvasElement[]): { 
  minX: number; 
  minY: number; 
  maxX: number; 
  maxY: number; 
  width: number; 
  height: number; 
} => {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach(element => {
    const left = element.x;
    const right = element.x + element.width;
    const top = element.y;
    const bottom = element.y + element.height;

    minX = Math.min(minX, left);
    minY = Math.min(minY, top);
    maxX = Math.max(maxX, right);
    maxY = Math.max(maxY, bottom);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const fitStageToContent = (stage: Konva.Stage, elements: CanvasElement[], padding: number = 50): void => {
  const bbox = calculateBoundingBox(elements);
  
  if (bbox.width === 0 || bbox.height === 0) {
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    return;
  }

  const stageWidth = stage.width();
  const stageHeight = stage.height();

  const contentWidth = bbox.width + padding * 2;
  const contentHeight = bbox.height + padding * 2;

  const scaleX = stageWidth / contentWidth;
  const scaleY = stageHeight / contentHeight;
  const scale = Math.min(scaleX, scaleY);

  stage.scale({ x: scale, y: scale });

  const offsetX = (stageWidth - contentWidth * scale) / 2 - bbox.minX * scale + padding * scale;
  const offsetY = (stageHeight - contentHeight * scale) / 2 - bbox.minY * scale + padding * scale;

  stage.position({ x: offsetX, y: offsetY });
};

export const centerStageOnContent = (stage: Konva.Stage, elements: CanvasElement[]): void => {
  const bbox = calculateBoundingBox(elements);
  
  if (bbox.width === 0 || bbox.height === 0) {
    stage.position({ x: 0, y: 0 });
    return;
  }

  const stageWidth = stage.width();
  const stageHeight = stage.height();
  const scale = stage.scaleX();

  const contentCenterX = bbox.minX + bbox.width / 2;
  const contentCenterY = bbox.minY + bbox.height / 2;

  const offsetX = stageWidth / 2 - contentCenterX * scale;
  const offsetY = stageHeight / 2 - contentCenterY * scale;

  stage.position({ x: offsetX, y: offsetY });
};

export const isPointInElement = (point: { x: number; y: number }, element: CanvasElement): boolean => {
  const { x, y } = point;
  const { x: ex, y: ey, width, height } = element;

  return x >= ex && x <= ex + width && y >= ey && y <= ey + height;
};

export const getElementsAtPoint = (point: { x: number; y: number }, elements: CanvasElement[]): CanvasElement[] => {
  return elements.filter(element => isPointInElement(point, element));
};

export const constrainToCanvas = (
  element: CanvasElement, 
  canvasWidth: number, 
  canvasHeight: number
): CanvasElement => {
  const constrainedElement = { ...element };
  
  // Constrain position
  constrainedElement.x = Math.max(0, Math.min(canvasWidth - element.width, element.x));
  constrainedElement.y = Math.max(0, Math.min(canvasHeight - element.height, element.y));
  
  // Constrain size
  constrainedElement.width = Math.min(element.width, canvasWidth - constrainedElement.x);
  constrainedElement.height = Math.min(element.height, canvasHeight - constrainedElement.y);
  
  return constrainedElement;
};

export const duplicateElement = (element: CanvasElement, offsetX: number = 20, offsetY: number = 20): CanvasElement => {
  const duplicated = { ...element };
  duplicated.id = `${element.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  duplicated.x += offsetX;
  duplicated.y += offsetY;
  
  return duplicated;
};

export const alignElements = (elements: CanvasElement[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): CanvasElement[] => {
  if (elements.length < 2) return elements;

  const bbox = calculateBoundingBox(elements);
  
  return elements.map(element => {
    const alignedElement = { ...element };
    
    switch (alignment) {
      case 'left':
        alignedElement.x = bbox.minX;
        break;
      case 'center':
        alignedElement.x = bbox.minX + (bbox.width - element.width) / 2;
        break;
      case 'right':
        alignedElement.x = bbox.maxX - element.width;
        break;
      case 'top':
        alignedElement.y = bbox.minY;
        break;
      case 'middle':
        alignedElement.y = bbox.minY + (bbox.height - element.height) / 2;
        break;
      case 'bottom':
        alignedElement.y = bbox.maxY - element.height;
        break;
    }
    
    return alignedElement;
  });
};

export const distributeElements = (elements: CanvasElement[], direction: 'horizontal' | 'vertical'): CanvasElement[] => {
  if (elements.length < 3) return elements;

  const sortedElements = [...elements].sort((a, b) => {
    return direction === 'horizontal' ? a.x - b.x : a.y - b.y;
  });

  const first = sortedElements[0];
  const last = sortedElements[sortedElements.length - 1];

  const totalSpace = direction === 'horizontal' 
    ? (last.x + last.width) - first.x
    : (last.y + last.height) - first.y;

  const totalElementSize = sortedElements.reduce((sum, element) => {
    return sum + (direction === 'horizontal' ? element.width : element.height);
  }, 0);

  const spacing = (totalSpace - totalElementSize) / (sortedElements.length - 1);

  let currentPosition = direction === 'horizontal' ? first.x : first.y;

  return sortedElements.map(element => {
    const distributedElement = { ...element };
    
    if (direction === 'horizontal') {
      distributedElement.x = currentPosition;
      currentPosition += element.width + spacing;
    } else {
      distributedElement.y = currentPosition;
      currentPosition += element.height + spacing;
    }
    
    return distributedElement;
  });
};