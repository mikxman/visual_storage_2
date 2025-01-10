import { useEffect, useRef, useState } from 'react';
import { StorageItem } from '../../types/storage';

interface InfiniteCanvasProps {
  items: StorageItem[];
}

interface Node {
  x: number;
  y: number;
  radius: number;
  item: StorageItem;
  dx: number;
  dy: number;
}

export default function InfiniteCanvas({ items }: InfiniteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodes, setNodes] = useState<Node[]>([]);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  useEffect(() => {
    // Initialize nodes in a circular pattern
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) / 4;

    const newNodes = items.map((item, index) => {
      const angle = (index / items.length) * Math.PI * 2;
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: 30 + item.quantity * 2,
        item,
        dx: 0,
        dy: 0
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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawNode = (node: Node) => {
      const { x, y, radius, item } = node;
      const drawX = x + offset.x;
      const drawY = y + offset.y;

      // Draw connection lines
      ctx.beginPath();
      nodes.forEach(otherNode => {
        const distance = Math.hypot(node.x - otherNode.x, node.y - otherNode.y);
        if (distance < 300 && node !== otherNode) {
          ctx.moveTo(drawX, drawY);
          ctx.lineTo(otherNode.x + offset.x, otherNode.y + offset.y);
        }
      });
      ctx.strokeStyle = 'rgba(66, 153, 225, 0.2)';
      ctx.stroke();

      // Draw node
      ctx.beginPath();
      ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
      ctx.fillStyle = node === hoveredNode 
        ? 'rgba(66, 153, 225, 0.8)' 
        : 'rgba(66, 153, 225, 0.6)';
      ctx.fill();

      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, drawX, drawY);
      ctx.font = '12px Arial';
      ctx.fillText(`Qty: ${item.quantity}`, drawX, drawY + 20);
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(drawNode);
      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX - offset.x;
      const mouseY = e.clientY - offset.y;

      if (isDragging) {
        setOffset({
          x: offset.x + (e.clientX - dragStart.x),
          y: offset.y + (e.clientY - dragStart.y)
        });
        setDragStart({ x: e.clientX, y: e.clientY });
        return;
      }

      // Check for hover
      const hoveredNode = nodes.find(node => {
        const distance = Math.hypot(mouseX - node.x, mouseY - node.y);
        return distance < node.radius;
      });
      setHoveredNode(hoveredNode || null);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', (e) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    });
    canvas.addEventListener('mouseup', () => setIsDragging(false));
    canvas.addEventListener('mouseleave', () => setIsDragging(false));

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [nodes, offset, isDragging, dragStart, hoveredNode]);

  return (
    <div className="relative w-full h-[calc(100vh-12rem)]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-move"
      />
      {hoveredNode && (
        <div 
          className="absolute bg-white p-4 rounded-lg shadow-lg"
          style={{ 
            left: hoveredNode.x + offset.x + hoveredNode.radius + 10, 
            top: hoveredNode.y + offset.y 
          }}
        >
          <h3 className="font-semibold">{hoveredNode.item.name}</h3>
          <p>Quantity: {hoveredNode.item.quantity}</p>
          <p>Category: {hoveredNode.item.category}</p>
          <p>Location: {hoveredNode.item.location}</p>
        </div>
      )}
    </div>
  );
}