import { StorageItem } from '../../../types/storage';

export interface Node {
  x: number;
  y: number;
  radius: number;
  item: StorageItem;
}

export interface Point {
  x: number;
  y: number;
}

export interface CanvasState {
  offset: Point;
  scale: number;
  isDragging: boolean;
  dragStart: Point;
  hoveredNode: Node | null;
  selectedNode: Node | null;
}