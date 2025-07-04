import Konva from 'konva';
import { CanvasElement } from '../types';

export const initializeKonvaStage = (container: HTMLDivElement, width: number, height: number): Konva.Stage => {
  const stage = new Konva.Stage({
    container,
    width,
    height,
    draggable: false,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  // Add background
  const background = new Konva.Rect({
    x: 0,
    y: 0,
    width,
    height,
    fill: '#ffffff',
    listening: false,
  });
  layer.add(background);

  return stage;
};

export const createKonvaElement = (element: CanvasElement): Konva.Node => {
  const commonProps = {
    id: element.id,
    x: element.x,
    y: element.y,
    rotation: element.rotation,
    opacity: element.opacity,
    draggable: true,
  };

  switch (element.type) {
    case 'text':
      return new Konva.Text({
        ...commonProps,
        text: element.text || 'Text',
        fontSize: element.fontSize || 16,
        fontFamily: element.fontFamily || 'Arial',
        fontStyle: element.fontStyle || 'normal',
        fill: element.fill,
        width: element.width,
        height: element.height,
        align: element.textAlign || 'left',
        verticalAlign: 'top',
      });

    case 'rectangle':
      return new Konva.Rect({
        ...commonProps,
        width: element.width,
        height: element.height,
        fill: element.fill,
        stroke: element.stroke,
        strokeWidth: element.strokeWidth,
      });

    case 'circle':
      return new Konva.Circle({
        ...commonProps,
        radius: Math.min(element.width, element.height) / 2,
        fill: element.fill,
        stroke: element.stroke,
        strokeWidth: element.strokeWidth,
      });

    case 'line':
      return new Konva.Line({
        ...commonProps,
        points: element.points || [0, 0, element.width, 0],
        stroke: element.stroke,
        strokeWidth: element.strokeWidth,
      });

    case 'image':
      const imageNode = new Konva.Image({
        ...commonProps,
        width: element.width,
        height: element.height,
      });

      if (element.imageUrl) {
        const imageObj = new Image();
        imageObj.onload = () => {
          imageNode.image(imageObj);
          imageNode.getLayer()?.batchDraw();
        };
        imageObj.src = element.imageUrl;
      }

      return imageNode;

    default:
      throw new Error(`Unknown element type: ${element.type}`);
  }
};

export const updateKonvaElement = (konvaNode: Konva.Node, element: CanvasElement): void => {
  const commonProps = {
    x: element.x,
    y: element.y,
    rotation: element.rotation,
    opacity: element.opacity,
  };

  // Update common properties
  Object.assign(konvaNode, commonProps);

  // Update type-specific properties
  switch (element.type) {
    case 'text':
      if (konvaNode instanceof Konva.Text) {
        konvaNode.setAttrs({
          text: element.text || 'Text',
          fontSize: element.fontSize || 16,
          fontFamily: element.fontFamily || 'Arial',
          fontStyle: element.fontStyle || 'normal',
          fill: element.fill,
          width: element.width,
          height: element.height,
          align: element.textAlign || 'left',
        });
      }
      break;

    case 'rectangle':
      if (konvaNode instanceof Konva.Rect) {
        konvaNode.setAttrs({
          width: element.width,
          height: element.height,
          fill: element.fill,
          stroke: element.stroke,
          strokeWidth: element.strokeWidth,
        });
      }
      break;

    case 'circle':
      if (konvaNode instanceof Konva.Circle) {
        konvaNode.setAttrs({
          radius: Math.min(element.width, element.height) / 2,
          fill: element.fill,
          stroke: element.stroke,
          strokeWidth: element.strokeWidth,
        });
      }
      break;

    case 'line':
      if (konvaNode instanceof Konva.Line) {
        konvaNode.setAttrs({
          points: element.points || [0, 0, element.width, 0],
          stroke: element.stroke,
          strokeWidth: element.strokeWidth,
        });
      }
      break;

    case 'image':
      if (konvaNode instanceof Konva.Image) {
        konvaNode.setAttrs({
          width: element.width,
          height: element.height,
        });
      }
      break;
  }
};

export const addGridToStage = (stage: Konva.Stage, gridSize: number, color: string = '#ddd'): void => {
  const layer = stage.findOne('Layer');
  if (!layer) return;

  // Remove existing grid lines
  layer.find('.grid-line').forEach(line => line.destroy());

  const width = stage.width();
  const height = stage.height();

  // Create vertical grid lines
  for (let i = 0; i <= width; i += gridSize) {
    const line = new Konva.Line({
      points: [i, 0, i, height],
      stroke: color,
      strokeWidth: 1,
      name: 'grid-line',
      listening: false,
    });
    layer.add(line);
  }

  // Create horizontal grid lines
  for (let i = 0; i <= height; i += gridSize) {
    const line = new Konva.Line({
      points: [0, i, width, i],
      stroke: color,
      strokeWidth: 1,
      name: 'grid-line',
      listening: false,
    });
    layer.add(line);
  }

  // Move grid lines to back
  layer.find('.grid-line').forEach(line => line.moveToBottom());
};

export const removeGridFromStage = (stage: Konva.Stage): void => {
  const layer = stage.findOne('Layer');
  if (!layer) return;

  layer.find('.grid-line').forEach(line => line.destroy());
};

export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

export const addTransformerToStage = (stage: Konva.Stage): Konva.Transformer => {
  const layer = stage.findOne('Layer');
  if (!layer) throw new Error('No layer found');

  const transformer = new Konva.Transformer({
    nodes: [],
    keepRatio: false,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  });

  layer.add(transformer);
  return transformer;
};

export const resizeStage = (stage: Konva.Stage, width: number, height: number): void => {
  stage.width(width);
  stage.height(height);

  // Update background
  const background = stage.findOne('Rect');
  if (background) {
    background.width(width);
    background.height(height);
  }

  stage.batchDraw();
};