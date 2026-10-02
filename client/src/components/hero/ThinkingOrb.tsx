import { useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useMotionPreference } from '../../hooks/useMotionPreference';

// Colours follow the light/dark choice: brass and ivory at night, amber and sage by day.
const palettes = {
  dark: { core: '#f3e7d3', glow: '200, 169, 126', dot: '217, 194, 156', ring: '200, 169, 126' },
  light: { core: '#fff4e0', glow: '217, 160, 102', dot: '143, 181, 154', ring: '217, 160, 102' },
};

// Points spread evenly over a sphere (golden-angle spiral).
const COUNT = 90;
const POINTS: [number, number, number][] = [];
for (let i = 0; i < COUNT; i++) {
  const y = 1 - (i / (COUNT - 1)) * 2;
  const radius = Math.sqrt(1 - y * y);
  const angle = i * 2.399963;
  POINTS.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
}

/** A small glowing 3D sphere of points that spins and pulses while the assistant thinks. */
export function ThinkingOrb({ size = 64 }: { size?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const { reducedMotion } = useMotionPreference();

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    element.width = size * ratio;
    element.height = size * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const colors = palettes[theme === 'light' ? 'light' : 'dark'];
    const centre = size / 2;
    const radius = size * 0.3;
    let frame = 0;

    const draw = (time: number) => {
      const t = time / 1000;
      const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
      context.clearRect(0, 0, size, size);

      const glow = context.createRadialGradient(centre, centre, 0, centre, centre, size / 2);
      glow.addColorStop(0, `rgba(${colors.glow}, ${0.45 + pulse * 0.25})`);
      glow.addColorStop(1, `rgba(${colors.glow}, 0)`);
      context.fillStyle = glow;
      context.fillRect(0, 0, size, size);

      // Tilted orbit ring.
      context.strokeStyle = `rgba(${colors.ring}, 0.5)`;
      context.lineWidth = 1;
      context.beginPath();
      context.ellipse(
        centre,
        centre,
        radius * 1.45,
        radius * 0.42,
        -0.45 + t * 0.4,
        0,
        Math.PI * 2,
      );
      context.stroke();

      // Rotating sphere of points, nearer points larger and brighter.
      const [ay, ax] = [t * 0.9, 0.5 + Math.sin(t * 0.6) * 0.25];
      for (const [x0, y0, z0] of POINTS) {
        const x1 = x0 * Math.cos(ay) + z0 * Math.sin(ay);
        const z1 = -x0 * Math.sin(ay) + z0 * Math.cos(ay);
        const y1 = y0 * Math.cos(ax) - z1 * Math.sin(ax);
        const z2 = y0 * Math.sin(ax) + z1 * Math.cos(ax);
        const depth = (z2 + 1) / 2;
        context.fillStyle = `rgba(${colors.dot}, ${0.2 + depth * 0.8})`;
        context.beginPath();
        context.arc(centre + x1 * radius, centre + y1 * radius, 0.5 + depth * 1.3, 0, Math.PI * 2);
        context.fill();
      }

      context.fillStyle = colors.core;
      context.globalAlpha = 0.75 + pulse * 0.25;
      context.beginPath();
      context.arc(centre, centre, 2.6 + pulse * 1.4, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;

      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [size, theme, reducedMotion]);

  return (
    <canvas
      ref={canvas}
      className="thinking-orb"
      data-theme={theme}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
