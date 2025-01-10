import { useState } from 'react';
import type { Node, Point } from './types';

export function useNodeDragging() {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const startDragging = (node: Node | null, startPoint: Point) => {
    setIsDragging(true);
    setSelectedNode(node);
    setDragStart(startPoint);
    setDragOffset({ x: 0, y: 0 });
  };

  const updateDragging = (currentPoint: Point) => {
    if (!isDragging) return null;

    const dx = currentPoint.x - dragStart.x;
    const dy = currentPoint.y - dragStart.y;
    
    setDragOffset({ x: dx, y: dy });

    return { dx, dy };
  };

  const stopDragging = () => {
    setIsDragging(false);
    setSelectedNode(null);
    setDragOffset({ x: 0, y: 0 });
  };

  return {
    isDragging,
    dragStart,
    dragOffset,
    selectedNode,
    startDragging,
    updateDragging,
    stopDragging
  };
}