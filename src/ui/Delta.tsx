import { useEffect, useRef, useState } from 'react';

/** How long a change stays beside its number before it fades. */
const SHOWN_MS = 3600;

/**
 * The change in a figure since it last moved, for a few seconds after it moves: "+2" in green with an arrow up, "−40k" in
 * red with an arrow down. The arrow and the sign say which way, so the colour is not the only signal. `scope` is whatever
 * the figure belongs to (a game, a seat): when that changes, the difference is not a change and nothing is shown.
 */
export function Delta({ value, format = (n) => String(Math.round(Math.abs(n))), scope = '', least = 0.5 }: { value: number; format?: (n: number) => string; scope?: string; least?: number }) {
  const prev = useRef({ value, scope });
  const [shown, setShown] = useState<{ by: number; n: number } | null>(null);
  useEffect(() => {
    const was = prev.current;
    prev.current = { value, scope };
    if (was.scope !== scope) { setShown(null); return; }
    const by = value - was.value;
    if (Math.abs(by) < least) return;
    setShown((s) => ({ by, n: (s?.n ?? 0) + 1 }));
    const id = setTimeout(() => setShown(null), SHOWN_MS);
    return () => clearTimeout(id);
  }, [value, scope, least]);
  if (!shown) return null;
  return <span key={shown.n} className={shown.by > 0 ? 'delta up' : 'delta down'} aria-live="polite">{shown.by > 0 ? '▲ +' : '▼ −'}{format(shown.by)}</span>;
}
