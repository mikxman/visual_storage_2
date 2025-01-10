import { useEffect, useRef, useState } from 'react';
import { StorageItem } from '../../types/storage';
import { useNodeDragging } from './canvas/useNodeDragging';
import { updateStorageItem } from '../../lib/supabase';
import type { Node, Point } from './canvas/types';

interface InfiniteMapProps {
  items: StorageItem[];
}

const InfiniteMap = ({ items }: InfiniteMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [nodes, setNodes] = useState<Node[]>([]);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [scale, setScale] = useState(1);
  
  const {
    isDragging,
    selectedNode,
    dragOffset,
    startDragging,
    updateDragging,
    stopDragging
  } = useNodeDragging();

  // Convert screen coordinates to world coordinates
  const screenToWorld = (screenX: number, screenY: number) => ({
    x: (screenX - offset.x) / scale,
    y: (screenY - offset.y) / scale
  });

  // Convert world coordinates to screen coordinates
  const worldToScreen = (worldX: number, worldY: number) => ({
    x: worldX * scale + offset.x,
    y: worldY * scale + offset.y
  });

  useEffect(() => {
    // Initialize nodes with stored coordinates or in a circular pattern if not set
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) / 3;
    
    const newNodes = items.map((item, index) => {
      // Use stored coordinates if available
      if (typeof item.x === 'number' && typeof item.y === 'number') {
        return {
          x: item.x,
          y: item.y,
          radius: 30 + Math.min(item.quantity, 20) * 2,
          item
        };
      }
      
      // Fall back to circular pattern if no coordinates are stored
      const angle = (index / items.length) * Math.PI * 2;
      const distance = radius * (0.5 + Math.random() * 0.5);
      return {
        x: centerX + Math.cos(angle) * distance + (Math.random() - 0.5) * 100,
        y: centerY + Math.sin(angle) * distance + (Math.random() - 0.5) * 100,
        radius: 30 + Math.min(item.quantity, 20) * 2,
        item
      };
    });

    setNodes(newNodes);
  }, [items]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const { devicePixelRatio: ratio = 1 } = window;
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
      ctx.scale(ratio, ratio);
    };

    const drawNode = (node: Node) => {
      const { x, y } = worldToScreen(
        node === selectedNode ? node.x + dragOffset.x / scale : node.x,
        node === selectedNode ? node.y + dragOffset.y / scale : node.y
      );
      const scaledRadius = node.radius * scale;

      // Draw connections
      ctx.beginPath();
      nodes.forEach(otherNode => {
        if (node !== otherNode && node.item.category === otherNode.item.category) {
          const otherPos = worldToScreen(
            otherNode === selectedNode ? otherNode.x + dragOffset.x / scale : otherNode.x,
            otherNode === selectedNode ? otherNode.y + dragOffset.y / scale : otherNode.y
          );
          const distance = Math.hypot(node.x - otherNode.x, node.y - otherNode.y);
          if (distance < 400) {
            ctx.moveTo(x, y);
            ctx.lineTo(otherPos.x, otherPos.y);
            ctx.strokeStyle = 'rgba(66, 153, 225, 0.2)';
            ctx.stroke();
          }
        }
      });

      // Draw node
      ctx.beginPath();
      ctx.arc(x, y, scaledRadius, 0, Math.PI * 2);
      
      if (node === selectedNode) {
        ctx.fillStyle = 'rgba(66, 153, 225, 0.9)';
        ctx.strokeStyle = '#2b6cb0';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (node === hoveredNode) {
        ctx.fillStyle = 'rgba(66, 153, 225, 0.8)';
      } else {
        ctx.fillStyle = 'rgba(66, 153, 225, 0.6)';
      }
      
      ctx.fill();

      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.font = `${14 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(node.item.name, x, y);
      ctx.font = `${12 * scale}px Arial`;
      ctx.fillText(`Qty: ${node.item.quantity}`, x, y + 20 * scale);
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      const gridSize = 50 * scale;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      for (let x = offset.x % gridSize; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = offset.y % gridSize; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      nodes.forEach(drawNode);
      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (isDragging) {
        const dragDelta = updateDragging({ x: mouseX, y: mouseY });
        if (dragDelta && selectedNode) {
          // Node dragging - no need to modify
          return;
        } else if (dragDelta) {
          // Pan the canvas with reduced speed (0.5x)
          setOffset(prev => ({
            x: prev.x + dragDelta.dx * 0.5,
            y: prev.y + dragDelta.dy * 0.5
          }));
        }
        return;
      }

      // Check for hover
      const worldPos = screenToWorld(mouseX, mouseY);
      const hoveredNode = nodes.find(node => {
        const distance = Math.hypot(worldPos.x - node.x, worldPos.y - node.y);
        return distance < node.radius;
      });
      setHoveredNode(hoveredNode || null);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const worldPos = screenToWorld(mouseX, mouseY);
      const clickedNode = nodes.find(node => {
        const distance = Math.hypot(worldPos.x - node.x, worldPos.y - node.y);
        return distance < node.radius;
      });

      startDragging(clickedNode || null, { x: mouseX, y: mouseY });
    };

    const handleMouseUp = async () => {
      if (selectedNode && isDragging) {
        const newX = selectedNode.x + dragOffset.x / scale;
        const newY = selectedNode.y + dragOffset.y / scale;

        // Update local state first
        const newNodes = nodes.map(node =>
          node === selectedNode
            ? {
                ...node,
                x: newX,
                y: newY
              }
            : node
        );
        setNodes(newNodes);

        // Use the new updateStorageItem function
        const success = await updateStorageItem(selectedNode.item.id, {
          x: newX,
          y: newY
        });

        if (!success) {
          // Revert the local state if the update failed
          setNodes(nodes);
        }
      }
      stopDragging();
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldPos = screenToWorld(mouseX, mouseY);
      const delta = -e.deltaY * 0.001;
      const newScale = Math.min(Math.max(0.5, scale + delta), 2);
      
      setScale(newScale);
      setOffset({
        x: mouseX - worldPos.x * newScale,
        y: mouseY - worldPos.y * newScale
      });
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [nodes, offset, isDragging, selectedNode, dragOffset, scale, screenToWorld, worldToScreen, startDragging, updateDragging, stopDragging]);

  return (
    <div className="relative w-full h-[calc(100vh-12rem)]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: hoveredNode ? 'move' : 'default' }}
      />
      {hoveredNode && (
        <div 
          className="absolute bg-white p-4 rounded-lg shadow-lg z-10"
          style={{ 
            left: worldToScreen(hoveredNode.x, hoveredNode.y).x + hoveredNode.radius * scale + 10, 
            top: worldToScreen(hoveredNode.x, hoveredNode.y).y 
          }}
        >
          <h3 className="font-semibold">{hoveredNode.item.name}</h3>
          <p>Quantity: {hoveredNode.item.quantity}</p>
          <p>Category: {hoveredNode.item.category}</p>
          <p>Location: {hoveredNode.item.location}</p>
        </div>
      )}
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md">
        <p className="text-sm text-gray-600">Drag items to move • Hold and drag to pan • Scroll to zoom</p>
      </div>
    </div>
  );
};

export default InfiniteMap;