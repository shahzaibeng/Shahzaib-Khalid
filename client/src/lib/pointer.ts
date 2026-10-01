// One shared pointer position for the canvas effects, updated by a single passive listener.
export const pointer = {
  x: -9999,
  y: -9999,
  active: false,
  // Where the cursor trail's head currently is, so particles can react to the trail itself.
  headX: -9999,
  headY: -9999,
};

let listeners = 0;

function onMove(event: PointerEvent) {
  if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
}

function onLeave() {
  pointer.active = false;
}

export function trackPointer() {
  if (listeners++ === 0) {
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
  }
  return () => {
    if (--listeners === 0) {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    }
  };
}
