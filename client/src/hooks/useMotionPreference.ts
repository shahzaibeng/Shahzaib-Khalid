import { useSyncExternalStore } from 'react';
import { useMediaQuery } from './useMediaQuery';

function subscribeVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

// Reports the device motion preference and whether the tab is currently visible.
export function useMotionPreference() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const visible = useSyncExternalStore(subscribeVisibility, () => !document.hidden);
  return { reducedMotion, visible };
}
