import { useLayoutEffect, useRef, type ReactNode } from 'react';

/** How far a label may shrink to stay on its line: below this it would be too small to read, so it is left to wrap instead. */
export const FIT_FLOOR = 0.72;

/**
 * A label that stays on one line: if the words are too long for the box (a longer language, a narrow screen, larger
 * text) the type is made a little smaller until they fit. Nothing is ever cut off: at the floor, the label wraps.
 */
export function FitText({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = '';
      el.style.whiteSpace = 'nowrap';
      const full = parseFloat(getComputedStyle(el).fontSize) || 16;
      let size = full;
      while (el.scrollWidth > el.clientWidth + 0.5 && size > full * FIT_FLOOR) { size -= 0.5; el.style.fontSize = `${size}px`; }
      // Still too long at the smallest size worth reading: let it take a second line.
      if (el.scrollWidth > el.clientWidth + 0.5) el.style.whiteSpace = 'normal';
    };
    fit();
    if (typeof ResizeObserver !== 'function') return;
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement ?? el);
    return () => ro.disconnect();
  }, [children]);
  return <span ref={ref} className={`fit ${className}`}>{children}</span>;
}
