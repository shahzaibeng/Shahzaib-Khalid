import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/** Counts from zero to `value` once it scrolls into view. */
export function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const element = useRef<HTMLSpanElement>(null);
  const inView = useInView(element, { once: true });
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setCurrent,
    });
    return () => controls.stop();
  }, [inView, reduced, value]);

  return <span ref={element}>{(reduced ? value : current).toFixed(decimals)}</span>;
}
