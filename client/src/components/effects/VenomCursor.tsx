import { useEffect, useRef } from 'react';
import { pointer, trackPointer } from '../../lib/pointer';
import { useMotionPreference } from '../../hooks/useMotionPreference';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/*
 * A liquid "symbiote" cursor: a dark nucleus with glowing tendrils that react to pointer
 * velocity, reach out and latch onto nearby [data-symbiote-target] elements, pour their glow
 * into them, and burst on click.
 *
 * Performance: one requestAnimationFrame loop. Each frame reads every target rectangle first
 * and writes element styles only at the end, so layout is never forced mid-frame.
 */

const TARGET_SELECTOR = '[data-symbiote-target]';
const GRAB_DISTANCE = 60;
const TENDRILS = 7;
const SEGMENTS = 10;
const CYAN = '200, 169, 126';
const VIOLET = '143, 118, 84';
const STYLE_PROPS = ['--sym-mx', '--sym-my', '--sym-scale', '--sym-power', '--sym-x', '--sym-y'];

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  // Transfer sparks travel toward a point on the target instead of flying free.
  tx?: number;
  ty?: number;
}

interface Box {
  element: HTMLElement;
  left: number;
  top: number;
  right: number;
  bottom: number;
  radius: number;
}

interface Magnet {
  mx: number;
  my: number;
  scale: number;
  power: number;
}

const point = (x = -9999, y = -9999): Point => ({ x, y, vx: 0, vy: 0 });

function distanceToBox(x: number, y: number, box: Box) {
  const dx = Math.max(box.left - x, 0, x - box.right);
  const dy = Math.max(box.top - y, 0, y - box.bottom);
  return Math.hypot(dx, dy);
}

function perimeterOf(box: Box) {
  const width = box.right - box.left;
  const height = box.bottom - box.top;
  const r = Math.min(box.radius, width / 2, height / 2);
  return 2 * (width - 2 * r) + 2 * (height - 2 * r) + Math.PI * 2 * r;
}

// Point at distance t along a rounded rectangle's border, clockwise from the top edge.
function pointOnBorder(box: Box, t: number) {
  const width = box.right - box.left;
  const height = box.bottom - box.top;
  const r = Math.min(box.radius, width / 2, height / 2);
  const w = width - 2 * r;
  const h = height - 2 * r;
  const arc = (Math.PI * r) / 2;
  const perimeter = 2 * w + 2 * h + 4 * arc;
  let d = ((t % perimeter) + perimeter) % perimeter;
  const corner = (cx: number, cy: number, start: number) => {
    const angle = start + (arc ? d / arc : 0) * (Math.PI / 2);
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };
  if (d < w) return { x: box.left + r + d, y: box.top };
  if ((d -= w) < arc) return corner(box.right - r, box.top + r, -Math.PI / 2);
  if ((d -= arc) < h) return { x: box.right, y: box.top + r + d };
  if ((d -= h) < arc) return corner(box.right - r, box.bottom - r, 0);
  if ((d -= arc) < w) return { x: box.right - r - d, y: box.bottom };
  if ((d -= w) < arc) return corner(box.left + r, box.bottom - r, Math.PI / 2);
  if ((d -= arc) < h) return { x: box.left, y: box.bottom - r - d };
  d -= h;
  return corner(box.left + r, box.top + r, Math.PI);
}

/** Fills a tapered liquid strand through the given points. */
function strand(
  context: CanvasRenderingContext2D,
  points: Point[],
  baseWidth: number,
  tipWidth: number,
) {
  const count = points.length;
  const left: { x: number; y: number }[] = [];
  const right: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const a = points[Math.max(i - 1, 0)];
    const b = points[Math.min(i + 1, count - 1)];
    const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / length;
    const ny = (b.x - a.x) / length;
    const half = (baseWidth + (tipWidth - baseWidth) * (i / (count - 1)) ** 0.7) / 2;
    left.push({ x: points[i].x + nx * half, y: points[i].y + ny * half });
    right.push({ x: points[i].x - nx * half, y: points[i].y - ny * half });
  }
  context.beginPath();
  context.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < count - 1; i++) {
    const next = left[i + 1];
    context.quadraticCurveTo(
      left[i].x,
      left[i].y,
      (left[i].x + next.x) / 2,
      (left[i].y + next.y) / 2,
    );
  }
  context.lineTo(points[count - 1].x, points[count - 1].y);
  for (let i = count - 2; i > 0; i--) {
    const next = right[i - 1];
    context.quadraticCurveTo(
      right[i].x,
      right[i].y,
      (right[i].x + next.x) / 2,
      (right[i].y + next.y) / 2,
    );
  }
  context.lineTo(right[0].x, right[0].y);
  context.closePath();
  context.fill();
}

function clearStyles(target: HTMLElement) {
  delete target.dataset.symbioteActive;
  STYLE_PROPS.forEach((name) => target.style.removeProperty(name));
}

export function VenomCursor() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { reducedMotion } = useMotionPreference();
  const finePointer = useMediaQuery('(pointer: fine)');
  const enabled = finePointer && !reducedMotion;

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!enabled || !element || !context) return;
    const root = document.documentElement;
    root.classList.add('symbiote-cursor');
    const untrack = trackPointer();

    const core = point();
    const tendrils = Array.from({ length: TENDRILS }, () =>
      Array.from({ length: SEGMENTS }, () => point()),
    );
    const sparks: Spark[] = [];
    const magnets = new Map<HTMLElement, Magnet>();
    let targets: HTMLElement[] = [];
    let dissolve = 1; // 1 = full nucleus, 0 = poured into the target
    let pulse = 0;
    let wasActive = false;
    let clearNeeded = false;
    let frame = 0;
    let last = performance.now();
    let time = 0;
    let refreshIn = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      element.width = width * ratio;
      element.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const releaseAll = () => {
      magnets.forEach((_, target) => clearStyles(target));
      magnets.clear();
    };

    // Click blast: a radial pulse and 15–20 liquid droplets that dissolve.
    const burst = () => {
      if (!pointer.active) return;
      pulse = 1;
      const count = 15 + Math.floor(Math.random() * 6);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const speed = 3 + Math.random() * 6;
        const life = 28 + Math.random() * 20;
        sparks.push({
          x: core.x,
          y: core.y,
          vx: Math.cos(angle) * speed + core.vx * 0.3,
          vy: Math.sin(angle) * speed + core.vy * 0.3,
          life,
          maxLife: life,
          size: 1.8 + Math.random() * 3,
        });
      }
    };

    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      // Scale motion by elapsed time so it feels the same at 60, 120, or 144 Hz.
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;
      time += dt / 60;

      if (!pointer.active) {
        if (clearNeeded) context.clearRect(0, 0, width, height);
        clearNeeded = false;
        wasActive = false;
        releaseAll();
        return;
      }
      if (!wasActive) {
        // Start at the pointer instead of stretching in from off-screen.
        Object.assign(core, point(pointer.x, pointer.y));
        tendrils.forEach((chain) => chain.forEach((p) => Object.assign(p, point(core.x, core.y))));
      }
      wasActive = true;
      clearNeeded = true;

      // ---- Reads: refresh the target list occasionally, then measure each target once.
      if ((refreshIn -= dt) <= 0) {
        targets = Array.from(document.querySelectorAll<HTMLElement>(TARGET_SELECTOR));
        refreshIn = 30;
      }
      let captured: Box | null = null;
      let nearestDistance = GRAB_DISTANCE;
      for (const target of targets) {
        const rect = target.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > height || rect.width === 0) continue;
        const box: Box = {
          element: target,
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          radius: 0,
        };
        const distance = distanceToBox(pointer.x, pointer.y, box);
        if (distance < nearestDistance) [captured, nearestDistance] = [box, distance];
      }
      if (captured) {
        captured.radius = parseFloat(getComputedStyle(captured.element).borderTopLeftRadius) || 0;
      }

      // ---- Physics: a stiff spring keeps the nucleus close to the real pointer.
      core.vx = (core.vx + (pointer.x - core.x) * 0.38 * dt) * Math.pow(0.52, dt);
      core.vy = (core.vy + (pointer.y - core.y) * 0.38 * dt) * Math.pow(0.52, dt);
      core.x += core.vx * dt;
      core.y += core.vy * dt;
      pointer.headX = core.x;
      pointer.headY = core.y;
      const speed = Math.hypot(core.vx, core.vy);
      // Buttons and links absorb the nucleus; large cards are only gripped at the nearest edge.
      const onCard = captured !== null && captured.element.dataset.symbioteTarget === 'card';
      const inside = captured !== null && nearestDistance === 0 && !onCard;
      dissolve += ((inside ? 0 : 1) - dissolve) * Math.min(0.18 * dt, 1);

      let perimeter = 0;
      let start = 0;
      if (captured) {
        perimeter = perimeterOf(captured);
        let best = Infinity;
        for (let i = 0; i < 40; i++) {
          const t = (i / 40) * perimeter;
          const p = pointOnBorder(captured, t);
          const d = (p.x - core.x) ** 2 + (p.y - core.y) ** 2;
          if (d < best) [best, start] = [d, t];
        }
      }

      tendrils.forEach((chain, k) => {
        let tipX: number;
        let tipY: number;
        let bend: number;
        if (captured) {
          // Grab: spread the tips over the nearest part of the border, or all of it once inside.
          const spread = inside ? perimeter : Math.min(perimeter, onCard ? 200 : 260);
          const t = start - spread / 2 + ((k + 0.5) / TENDRILS) * spread + Math.sin(time * 2 + k);
          const anchor = pointOnBorder(captured, t);
          tipX = anchor.x;
          tipY = anchor.y;
          bend = 4;
        } else {
          // Free: tendrils sway, lengthen with speed, and stream behind the motion.
          const angle = (k / TENDRILS) * Math.PI * 2 + time * 0.6;
          const length = 13 + Math.sin(time * 3.1 + k * 1.7) * 5 + Math.min(speed * 2.2, 34);
          tipX = core.x + Math.cos(angle) * length - core.vx * 2.4;
          tipY = core.y + Math.sin(angle) * length - core.vy * 2.4;
          bend = 7 + Math.min(speed, 12);
        }
        const dx = tipX - core.x;
        const dy = tipY - core.y;
        const reach = Math.hypot(dx, dy) || 1;
        const wave = Math.sin(time * 5 + k * 2.3) * bend;
        const cx = core.x + dx / 2 + (-dy / reach) * wave;
        const cy = core.y + dy / 2 + (dx / reach) * wave;
        chain.forEach((p, i) => {
          const t = i / (SEGMENTS - 1);
          // Each point springs toward its place on a curve from the nucleus to the tip.
          const gx = (1 - t) ** 2 * core.x + 2 * (1 - t) * t * cx + t * t * tipX;
          const gy = (1 - t) ** 2 * core.y + 2 * (1 - t) * t * cy + t * t * tipY;
          const stiffness = i === 0 ? 1 : 0.28 + (1 - t) * 0.3;
          p.vx = (p.vx + (gx - p.x) * stiffness * dt) * Math.pow(0.55, dt);
          p.vy = (p.vy + (gy - p.y) * stiffness * dt) * Math.pow(0.55, dt);
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        });
      });

      // Energy flows from the nucleus into the grabbed element.
      if (captured && Math.random() < 0.45 * dt) {
        const target = pointOnBorder(captured, Math.random() * perimeter);
        sparks.push({
          x: core.x,
          y: core.y,
          vx: 0,
          vy: 0,
          life: 22,
          maxLife: 22,
          size: 1.2 + Math.random() * 1.6,
          tx: target.x,
          ty: target.y,
        });
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        if (spark.tx !== undefined && spark.ty !== undefined) {
          spark.x += (spark.tx - spark.x) * Math.min(0.16 * dt, 1);
          spark.y += (spark.ty - spark.y) * Math.min(0.16 * dt, 1);
        } else {
          spark.vx *= Math.pow(0.9, dt);
          spark.vy *= Math.pow(0.9, dt);
          spark.x += spark.vx * dt;
          spark.y += spark.vy * dt;
        }
        if ((spark.life -= dt) <= 0) sparks.splice(i, 1);
      }
      pulse = Math.max(0, pulse - 0.05 * dt);

      // ---- Draw: neon edges, then a dark liquid centre in each tendril.
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';
      for (const chain of tendrils) {
        const tip = chain[SEGMENTS - 1];
        const gradient = context.createLinearGradient(core.x, core.y, tip.x + 0.1, tip.y + 0.1);
        gradient.addColorStop(0, `rgba(${CYAN}, 0.95)`);
        gradient.addColorStop(1, `rgba(${VIOLET}, 0.9)`);
        context.fillStyle = gradient;
        context.globalAlpha = 0.16;
        strand(context, chain, 13, 5);
        context.globalAlpha = 0.95;
        strand(context, chain, 5.5, 1.6);
      }
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 0.9;
      context.fillStyle = '#111214';
      for (const chain of tendrils) strand(context, chain, 2.6, 0.2);

      context.globalCompositeOperation = 'lighter';
      for (const spark of sparks) {
        const fade = spark.life / spark.maxLife;
        const size = spark.size * (0.4 + fade * 0.6);
        context.globalAlpha = fade * 0.3;
        context.fillStyle = spark.tx === undefined ? `rgb(${VIOLET})` : `rgb(${CYAN})`;
        context.beginPath();
        context.arc(spark.x, spark.y, size * 2.2, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = fade;
        context.fillStyle = '#f3e7d3';
        context.beginPath();
        context.arc(spark.x, spark.y, size * 0.7, 0, Math.PI * 2);
        context.fill();
      }
      if (pulse > 0) {
        context.globalAlpha = pulse * 0.8;
        context.strokeStyle = `rgb(${CYAN})`;
        context.lineWidth = 2 + pulse * 3;
        context.beginPath();
        context.arc(core.x, core.y, (1 - pulse) * 70 + 6, 0, Math.PI * 2);
        context.stroke();
      }

      // The nucleus: a halo around a dark core that stretches with velocity, then dissolves.
      if (dissolve > 0.02) {
        const radius = (7 + pulse * 4) * dissolve;
        const halo = context.createRadialGradient(core.x, core.y, 0, core.x, core.y, radius * 3.4);
        halo.addColorStop(0, `rgba(${CYAN}, 0.75)`);
        halo.addColorStop(0.45, `rgba(${VIOLET}, 0.3)`);
        halo.addColorStop(1, `rgba(${VIOLET}, 0)`);
        context.globalAlpha = dissolve;
        context.fillStyle = halo;
        context.beginPath();
        context.arc(core.x, core.y, radius * 3.4, 0, Math.PI * 2);
        context.fill();
        const stretch = Math.min(speed * 0.05, 0.6);
        context.globalCompositeOperation = 'source-over';
        context.fillStyle = '#111214';
        context.strokeStyle = `rgba(${CYAN}, 0.95)`;
        context.lineWidth = 1.6;
        context.beginPath();
        context.ellipse(
          core.x,
          core.y,
          radius * (1 + stretch),
          radius * (1 - stretch * 0.5),
          Math.atan2(core.vy, core.vx),
          0,
          Math.PI * 2,
        );
        context.fill();
        context.stroke();
      }
      context.globalAlpha = 1;
      context.globalCompositeOperation = 'source-over';

      // ---- Writes: pour the glow into the captured element and ease the others back.
      if (captured) {
        const box: Box = captured;
        const card = box.element.dataset.symbioteTarget === 'card';
        const pull = card ? 0.03 : 0.22;
        const magnet = magnets.get(box.element) ?? { mx: 0, my: 0, scale: 1, power: 0 };
        const ease = Math.min(0.2 * dt, 1);
        magnet.mx += ((pointer.x - (box.left + box.right) / 2) * pull - magnet.mx) * ease;
        magnet.my += ((pointer.y - (box.top + box.bottom) / 2) * pull - magnet.my) * ease;
        magnet.scale += ((card ? 1.01 : 1.05) - magnet.scale) * ease;
        magnet.power += (1 - nearestDistance / GRAB_DISTANCE - magnet.power) * ease;
        magnets.set(box.element, magnet);
        box.element.dataset.symbioteActive = 'true';
        box.element.style.setProperty('--sym-x', `${pointer.x - box.left}px`);
        box.element.style.setProperty('--sym-y', `${pointer.y - box.top}px`);
      }
      const capturedElement = (captured as Box | null)?.element;
      magnets.forEach((magnet, target) => {
        if (target !== capturedElement) {
          const decay = Math.pow(0.8, dt);
          magnet.mx *= decay;
          magnet.my *= decay;
          magnet.power *= decay;
          magnet.scale += (1 - magnet.scale) * Math.min(0.2 * dt, 1);
          delete target.dataset.symbioteActive;
          if (Math.abs(magnet.mx) + Math.abs(magnet.my) < 0.05 && magnet.power < 0.02) {
            magnets.delete(target);
            clearStyles(target);
            return;
          }
        }
        target.style.setProperty('--sym-mx', `${magnet.mx.toFixed(2)}px`);
        target.style.setProperty('--sym-my', `${magnet.my.toFixed(2)}px`);
        target.style.setProperty('--sym-scale', magnet.scale.toFixed(4));
        target.style.setProperty('--sym-power', Math.max(0, magnet.power).toFixed(3));
      });
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointerdown', burst, { passive: true });
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', burst);
      root.classList.remove('symbiote-cursor');
      releaseAll();
      untrack();
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={canvas} className="venom-cursor" aria-hidden="true" />;
}
