import { useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
}

export function useCanvasRenderer() {
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
  }, []);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.fill();
  }, []);

  const drawConnections = useCallback((
    ctx: CanvasRenderingContext2D,
    particles: Particle[],
    maxDistance: number = 150
  ) => {
    particles.forEach((p1, i) => {
      particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - distance / maxDistance)})`;
          ctx.stroke();
        }
      });
    });
  }, []);

  return { drawBackground, drawParticle, drawConnections };
}