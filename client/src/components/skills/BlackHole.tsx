import { useEffect, useRef } from 'react';
import { skillGroups } from '../../config/content';
import { useMotionPreference } from '../../hooks/useMotionPreference';
import { skillIcons } from '../../lib/skillIcons';

// Every distinct skill that has a logo.
const logos = [...new Set(skillGroups.flatMap((group) => group.skills))].filter(
  (name) => skillIcons[name],
);

interface Orbit {
  radius: number; // as a fraction of the outer radius, 1 = edge, 0 = singularity
  angle: number;
  inflow: number;
}

const HORIZON = 0.27; // event-horizon radius as a fraction of the outer radius
const TILT = 0.24; // how flat the disk looks (the view is from just above its plane)

function seed(index: number): Orbit {
  return {
    radius: HORIZON + 0.08 + ((index * 0.618) % 1) * (1 - HORIZON - 0.08),
    angle: index * 2.399, // golden angle, so logos start evenly spread
    inflow: 0.012 + ((index * 0.37) % 1) * 0.01,
  };
}

/**
 * A black hole with an accretion disk that slowly pulls the skill logos in. The logos orbit
 * faster as they fall (Kepler), stretch and fade at the horizon, then re-enter from the edge.
 */
export function BlackHole() {
  const stage = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLSpanElement | null)[]>([]);
  const { reducedMotion, visible } = useMotionPreference();

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const orbits = logos.map((_, index) => seed(index));
    let width = 0;
    let height = 0;
    let frame = 0;
    let inView = true;
    let last = performance.now();

    const place = () => {
      const outer = Math.min(width * 0.5, height * 1.15) * 0.96;
      orbits.forEach((orbit, index) => {
        const node = items.current[index];
        if (!node) return;
        const r = orbit.radius * outer;
        const depth = Math.sin(orbit.angle); // > 0: near side of the disk, in front of the hole
        const x = Math.cos(orbit.angle) * r;
        const y = depth * r * TILT;
        // Close to the horizon: shrink, stretch along the orbit, and fade out.
        const edge = Math.min(1, Math.max(0, (orbit.radius - HORIZON) / 0.22));
        const spawn = Math.min(1, (1 - orbit.radius) / 0.08);
        const scale = (0.78 + 0.22 * ((depth + 1) / 2)) * (0.45 + 0.55 * edge);
        const stretch = 1 + (1 - edge) * 0.9;
        const rotation = (Math.atan2(y, x) * 180) / Math.PI + 90;
        node.style.transform =
          `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rotation.toFixed(1)}deg) ` +
          `scale(${(scale * stretch).toFixed(3)}, ${(scale / stretch).toFixed(3)}) rotate(${(-rotation).toFixed(1)}deg)`;
        node.style.opacity = (
          Math.min(edge * 1.4, spawn) *
          (0.62 + 0.38 * ((depth + 1) / 2))
        ).toFixed(3);
        node.style.zIndex = depth > 0 ? '6' : '2';
      });
    };

    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!inView) return;
      for (const orbit of orbits) {
        // Angular speed grows as the orbit tightens; the inward drift speeds up near the end.
        orbit.angle += (0.32 / Math.pow(orbit.radius, 1.5)) * dt;
        orbit.radius -= orbit.inflow * (1 + 0.8 / orbit.radius) * dt;
        if (orbit.radius < HORIZON * 0.98) {
          orbit.radius = 1;
          orbit.angle = Math.random() * Math.PI * 2;
        }
      }
      place();
    };

    const resize = () => {
      width = element.clientWidth;
      height = element.clientHeight;
      place();
    };
    const sizes = new ResizeObserver(resize);
    sizes.observe(element);
    const watcher = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting));
    watcher.observe(element);
    resize();
    if (!reducedMotion && visible) frame = requestAnimationFrame(step);
    element.dataset.moving = String(!reducedMotion && visible);
    return () => {
      cancelAnimationFrame(frame);
      sizes.disconnect();
      watcher.disconnect();
    };
  }, [reducedMotion, visible]);

  return (
    <div ref={stage} className="black-hole" aria-hidden="true">
      <div className="bh-glow" />
      <div className="bh-disk bh-disk-back">
        <i />
      </div>
      <div className="bh-lens" />
      <div className="bh-horizon" />
      <div className="bh-disk bh-disk-front">
        <i />
      </div>
      <div className="bh-orbits">
        {logos.map((name, index) => {
          const Icon = skillIcons[name];
          return (
            <span
              key={name}
              ref={(node) => {
                items.current[index] = node;
              }}
              className="bh-logo"
              title={name}
            >
              <Icon />
            </span>
          );
        })}
      </div>
    </div>
  );
}
