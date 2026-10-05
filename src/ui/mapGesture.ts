// The part of map zooming that is plain arithmetic: where the map sits after
// the player pinches, drags or presses a zoom button. A view is a scale `k`
// about the middle of the map plus a shift (x, y), all in the map's own units.

export interface View { k: number; x: number; y: number }
export const FIT: View = { k: 1, x: 0, y: 0 };
export const MIN_VIEW = 1;
export const MAX_VIEW = 10;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Keeps the map from being dragged out of sight: some of it always stays on screen. */
export function keepInside(v: View, w: number, h: number): View {
  const k = clamp(v.k, MIN_VIEW, MAX_VIEW);
  const reachX = (w * k) / 2, reachY = (h * k) / 2;
  return { k, x: clamp(v.x, -reachX, reachX), y: clamp(v.y, -reachY, reachY) };
}

/**
 * The view after the point that was at `from` (in map units, on screen) is now
 * at `to`, with the scale changed to `k`. A drag is `k` unchanged; a pinch
 * moves the midpoint and changes `k`; both keep the same spot of map under the fingers.
 */
export function holdPoint(start: View, from: [number, number], to: [number, number], k: number, w: number, h: number): View {
  const cx = w / 2, cy = h / 2;
  // The map point that was under `from`.
  const qx = (from[0] - cx - start.x) / start.k + cx;
  const qy = (from[1] - cy - start.y) / start.k + cy;
  return keepInside({ k, x: to[0] - cx - k * (qx - cx), y: to[1] - cy - k * (qy - cy) }, w, h);
}

/** A zoom button: change the scale about the middle of the map. */
export function zoomBy(v: View, factor: number, w: number, h: number): View {
  const k = clamp(v.k * factor, MIN_VIEW, MAX_VIEW);
  const r = k / v.k;
  return keepInside({ k, x: v.x * r, y: v.y * r }, w, h);
}

/** The SVG transform that draws a view. */
export const viewTransform = (v: View, w: number, h: number) =>
  `translate(${v.x} ${v.y}) translate(${w / 2} ${h / 2}) scale(${v.k}) translate(${-w / 2} ${-h / 2})`;
