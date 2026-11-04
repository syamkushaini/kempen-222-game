import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { Look } from './faces';
import { canDraw3D } from './Manager';

const Bust3D = lazy(() => import('./Bust3D'));

/** A portrait this big or bigger is drawn live (it moves); smaller ones, which come many at a time, are still pictures of the 3D bust. */
export const LIVE_FROM = 72;
/** How many live canvases may be open at once: browsers allow about sixteen, and the map and chamber need some. */
const MAX_LIVE = 5;
let live = 0;

let supported: boolean | null = null;
const can3D = () => (supported ??= canDraw3D());

/**
 * A person drawn in 3D from their look. A big portrait is live; a small one is a picture of the 3D bust, made once on a shared hidden
 * canvas. Until the picture is ready, and wherever 3D cannot be drawn, the flat portrait (`flat`) is shown in its place.
 */
export function Person3D({ look, accent, size, flat, className }: { look: Look; accent: string; size: number; flat: string; className?: string }) {
  const wantLive = size >= LIVE_FROM;
  const calm = useMemo(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  // A live canvas is taken from the few there are; if none is free, the picture is used instead.
  const [liveOk] = useState(() => { if (can3D() && wantLive && live < MAX_LIVE) { live++; return true; } return false; });
  useEffect(() => () => { if (liveOk) live--; }, [liveOk]);
  const [still, setStill] = useState<string | null>(null);
  const key = useMemo(() => JSON.stringify(look), [look]);
  useEffect(() => {
    if (!can3D() || liveOk) return;
    let alive = true;
    void import('./snap3d').then((m) => m.snapshot(look, accent, Math.round(size * 2))).then((url) => { if (alive && url) setStill(url); }).catch(() => undefined);
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, accent, size, liveOk]);
  const flatImg = <img className={`portrait ${className ?? ''}`} src={flat} width={size} height={size} alt="" draggable={false} />;
  if (!can3D()) return flatImg;
  if (liveOk) return <Suspense fallback={flatImg}><Bust3D look={look} accent={accent} size={size} calm={calm} /></Suspense>;
  if (!still) return flatImg;
  return (
    <span className={`bust3d still ${className ?? ''}`} style={{ width: size, height: size, background: `color-mix(in srgb, ${accent} 26%, #e8e3d8)` }} aria-hidden="true">
      <img src={still} width={size} height={size} alt="" draggable={false} />
    </span>
  );
}
