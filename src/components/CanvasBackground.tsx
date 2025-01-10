import { useEffect, useRef } from 'react';
import { useParticles } from './canvas/useParticles';
import { useCanvasRenderer } from './canvas/useCanvasRenderer';

export default function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { initParticles, updateParticle } = useParticles(40);
  const { drawBackground, drawParticle, drawConnections } = useCanvasRenderer();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles = initParticles(window.innerWidth, window.innerHeight);
    let animationFrame: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      drawBackground(ctx, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        updateParticle(particle, canvas.width, canvas.height);
        drawParticle(ctx, particle);
      });

      drawConnections(ctx, particles);
      animationFrame = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    const handleResize = () => {
      resizeCanvas();
      particles = initParticles(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [initParticles, updateParticle, drawBackground, drawParticle, drawConnections]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
    />
  );
}