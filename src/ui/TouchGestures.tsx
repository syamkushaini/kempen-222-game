import { useEffect, useRef, type ReactNode } from 'react';

interface TouchGesturesProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

/** A swipe slower than this (in milliseconds) is a drag, not a swipe. */
const QUICK = 600;
/** Controls a finger is meant to work, and things that pan or scroll by themselves. */
const OWN_GESTURE = 'input, select, textarea, button, a, label, summary, [role=slider], [role=dialog], svg, canvas, .map-frame, .chips';

/** True when the touch began on something that takes a drag itself: a slider, a list scrolled sideways, the map. */
export function ownsGesture(el: Element | null): boolean {
  for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) {
    if (n.matches(OWN_GESTURE)) return true;
    if (n.scrollWidth > n.clientWidth + 1) {
      const x = getComputedStyle(n).overflowX;
      if (x === 'auto' || x === 'scroll') return true;
    }
  }
  return false;
}

/** How far from a slider (in pixels) a touch still counts as aimed at it: the track is thin, and a thumb lands beside it. */
export const SLIDER_REACH = { x: 16, y: 56 };

/** True when a touch at (x, y) is on, or close enough to, any of the sliders' boxes. */
export function nearSlider(x: number, y: number, boxes: { left: number; right: number; top: number; bottom: number }[]): boolean {
  return boxes.some((b) => x >= b.left - SLIDER_REACH.x && x <= b.right + SLIDER_REACH.x && y >= b.top - SLIDER_REACH.y && y <= b.bottom + SLIDER_REACH.y);
}

const nearAnySlider = (x: number, y: number) => nearSlider(x, y, [...document.querySelectorAll('input[type=range]')].map((el) => el.getBoundingClientRect()));

export function TouchGestures({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 60,
}: TouchGesturesProps) {
  // The latest handlers, so the listeners are added once and never act on a stale screen.
  const handlers = useRef({ onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown });
  handlers.current = { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown };
  const start = useRef<{ x: number; y: number; at: number } | null>(null);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      // Two fingers are a pinch, and a touch on a control or a scrolling strip is that control's own.
      const t = e.touches[0];
      start.current = e.touches.length === 1 && !ownsGesture(e.target as Element | null) && !nearAnySlider(t.clientX, t.clientY)
        ? { x: t.clientX, y: t.clientY, at: e.timeStamp }
        : null;
    };
    const onEnd = (e: TouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s || e.timeStamp - s.at > QUICK || document.querySelector('[role=dialog]')) return;
      const dx = e.changedTouches[0].clientX - s.x;
      const dy = e.changedTouches[0].clientY - s.y;
      const h = handlers.current;
      // Clearly sideways or clearly up and down: a diagonal scroll of the page changes nothing.
      if (Math.abs(dx) > threshold && Math.abs(dx) > 2 * Math.abs(dy)) (dx > 0 ? h.onSwipeRight : h.onSwipeLeft)?.();
      else if (Math.abs(dy) > threshold && Math.abs(dy) > 2 * Math.abs(dx)) (dy > 0 ? h.onSwipeDown : h.onSwipeUp)?.();
    };
    const onCancel = () => { start.current = null; };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    window.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onCancel);
    };
  }, [threshold]);

  return <>{children}</>;
}
