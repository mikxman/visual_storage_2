import { useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

export function useParticles(count: number = 50) {
  const createParticle = useCallback((width: number, height: number): Particle => ({
    x: Math.random() * width,
    y: Math.random() * height,
    dx: (Math.random() - 0.5) * 1,
    dy: (Math.random() - 0.5) * 1,
    radius: Math.random() * 2 + 1,
  }), []);

  const initParticles = useCallback((width: number, height: number): Particle[] => {
    return Array.from({ length: count }, () => createParticle(width, height));
  }, [createParticle, count]);

  const updateParticle = useCallback((particle: Particle, width: number, height: number) => {
    particle.x += particle.dx;
    particle.y += particle.dy;

    if (particle.x < 0 || particle.x > width) particle.dx *= -1;
    if (particle.y < 0 || particle.y > height) particle.dy *= -1;
  }, []);

  return { initParticles, updateParticle };
}