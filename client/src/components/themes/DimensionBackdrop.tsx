import { useEffect, useRef } from 'react';
import { useMotionPreference } from '../../hooks/useMotionPreference';

// Credentials: a tesseract — a four-dimensional cube — rotating through two 4D planes and
// projected down to the screen, inside a receding portal.

const vertices: number[][] = [];
for (let i = 0; i < 16; i++) {
  vertices.push([0, 1, 2, 3].map((bit) => ((i >> bit) & 1 ? 1 : -1)));
}
// Two vertices share an edge when they differ in exactly one coordinate.
const edges: [number, number][] = [];
for (let a = 0; a < 16; a++) {
  for (let bit = 0; bit < 4; bit++) {
    const b = a ^ (1 << bit);
    if (a < b) edges.push([a, b]);
  }
}

function project(angle: number) {
  const [xw, zw, xy] = [angle, angle * 0.62, angle * 0.25];
  return vertices.map(([x0, y0, z0, w0]) => {
    // Rotate in the XW and ZW planes (the 4D turns), then slowly in XY.
    let x = x0 * Math.cos(xw) - w0 * Math.sin(xw);
    let w = x0 * Math.sin(xw) + w0 * Math.cos(xw);
    const z = z0 * Math.cos(zw) - w * Math.sin(zw);
    w = z0 * Math.sin(zw) + w * Math.cos(zw);
    let y = y0;
    [x, y] = [x * Math.cos(xy) - y * Math.sin(xy), x * Math.sin(xy) + y * Math.cos(xy)];
    // 4D → 3D, then 3D → 2D perspective.
    const k4 = 1 / (3 - w);
    const k3 = 1 / (4 - z * k4);
    return { x: x * k4 * k3, y: y * k4 * k3, depth: w };
  });
}

const SCALE = 820;

export function DimensionBackdrop() {
  const lines = useRef<(SVGLineElement | null)[]>([]);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const { reducedMotion, visible } = useMotionPreference();

  useEffect(() => {
    let frame = 0;
    let angle = 0.6;
    let last = performance.now();
    const draw = () => {
      const points = project(angle);
      edges.forEach(([a, b], i) => {
        const line = lines.current[i];
        if (!line) return;
        line.setAttribute('x1', (points[a].x * SCALE).toFixed(1));
        line.setAttribute('y1', (points[a].y * SCALE).toFixed(1));
        line.setAttribute('x2', (points[b].x * SCALE).toFixed(1));
        line.setAttribute('y2', (points[b].y * SCALE).toFixed(1));
        // The inner cube (further along W) reads a little brighter.
        line.style.opacity = (0.35 + 0.3 * ((points[a].depth + points[b].depth) / 4 + 0.5)).toFixed(
          2,
        );
      });
      points.forEach((point, i) => {
        const dot = dots.current[i];
        if (!dot) return;
        dot.setAttribute('cx', (point.x * SCALE).toFixed(1));
        dot.setAttribute('cy', (point.y * SCALE).toFixed(1));
      });
    };
    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      angle += Math.min((now - last) / 1000, 0.05) * 0.32;
      last = now;
      draw();
    };
    draw();
    if (!reducedMotion && visible) frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, visible]);

  return (
    <div className="theme-art dimension-art" aria-hidden="true">
      <div className="dimension-tunnel">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} style={{ animationDelay: `${i * -2}s` }} />
        ))}
      </div>
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMaxYMid slice" className="dimension-svg">
        <g transform="translate(1190 560)" className="dimension-shift">
          {edges.map((_, i) => (
            <line
              key={i}
              ref={(node) => {
                lines.current[i] = node;
              }}
              className="tesseract-edge"
            />
          ))}
          {vertices.map((_, i) => (
            <circle
              key={i}
              r="3.2"
              ref={(node) => {
                dots.current[i] = node;
              }}
              className="tesseract-vertex"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
