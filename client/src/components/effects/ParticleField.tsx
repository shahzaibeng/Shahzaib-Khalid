import { useEffect, useRef } from 'react';
import { pointer, trackPointer } from '../../lib/pointer';
import { useMotionPreference } from '../../hooks/useMotionPreference';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  // Each particle's resting drift, which it eases back to after being pushed.
  dx: number;
  dy: number;
  size: number;
}

const LINK_DISTANCE = 130;
const POINTER_RADIUS = 170;

/**
 * A drifting particle network. Particles near the cursor trail are pushed away and flow back
 * with damping, and links close to the trail brighten. Pauses offscreen and in hidden tabs.
 */
export function ParticleField() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { reducedMotion, visible } = useMotionPreference();

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    const untrack = trackPointer();
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let inView = true;

    const seed = () => {
      const count = Math.min(150, Math.round((width * height) / 9500));
      particles = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.08 + Math.random() * 0.22;
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: dx,
          vy: dy,
          dx,
          dy,
          size: 0.6 + Math.random() * 1.5,
        };
      });
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const bounds = element.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      element.width = width * ratio;
      element.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      seed();
      draw();
    };

    const draw = () => {
      const bounds = element.getBoundingClientRect();
      const px = (pointer.headX > -9000 ? pointer.headX : pointer.x) - bounds.left;
      const py = (pointer.headY > -9000 ? pointer.headY : pointer.y) - bounds.top;
      const near = pointer.active;
      context.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = dx * dx + dy * dy;
          if (distance > LINK_DISTANCE * LINK_DISTANCE) continue;
          const strength = 1 - Math.sqrt(distance) / LINK_DISTANCE;
          const mx = (a.x + b.x) / 2 - px;
          const my = (a.y + b.y) / 2 - py;
          const glow = near ? Math.max(0, 1 - Math.hypot(mx, my) / (POINTER_RADIUS * 1.3)) : 0;
          context.strokeStyle = glow
            ? `rgba(200, 169, 126, ${(strength * (0.12 + glow * 0.5)).toFixed(3)})`
            : `rgba(190, 185, 175, ${(strength * 0.2).toFixed(3)})`;
          context.lineWidth = 0.6 + glow * 0.6;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
      for (const particle of particles) {
        const glow = near
          ? Math.max(0, 1 - Math.hypot(particle.x - px, particle.y - py) / POINTER_RADIUS)
          : 0;
        context.fillStyle = glow
          ? `rgba(220, 195, 150, ${(0.45 + glow * 0.55).toFixed(3)})`
          : 'rgba(200, 195, 185, 0.55)';
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size + glow * 1.2, 0, Math.PI * 2);
        context.fill();
      }
      return { px, py, near };
    };

    const step = () => {
      frame = requestAnimationFrame(step);
      if (!inView) return;
      const { px, py, near } = draw();
      for (const particle of particles) {
        if (near) {
          const dx = particle.x - px;
          const dy = particle.y - py;
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < POINTER_RADIUS) {
            // Pushed outward along the pointer direction, strongest at the centre.
            const force = (1 - distance / POINTER_RADIUS) ** 2 * 1.6;
            particle.vx += (dx / distance) * force;
            particle.vy += (dy / distance) * force;
          }
        }
        // Damping pulls velocity back to the particle's resting drift.
        particle.vx += (particle.dx - particle.vx) * 0.045;
        particle.vy += (particle.dy - particle.vy) * 0.045;
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;
      }
    };

    const observer = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting));
    observer.observe(element);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);
    resize();
    if (!reducedMotion && visible) frame = requestAnimationFrame(step);
    element.dataset.moving = String(!reducedMotion && visible);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      untrack();
    };
  }, [reducedMotion, visible]);

  return <canvas ref={canvas} className="particle-field" aria-hidden="true" />;
}
