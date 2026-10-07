// The maths behind the 3D map, kept apart from Three.js so that it can be tested and so that the library itself
// is only fetched when a player turns 3D on.

export type Point = [number, number];
export type Ring = Point[];

/**
 * The rings of a seat's outline. The map files draw every outline as `M x y` followed by relative `l dx dy` steps and
 * a closing `z`, once for each ring (an island, or a hole in a seat).
 */
export function parseRings(d: string): Ring[] {
  const rings: Ring[] = [];
  let ring: Ring | null = null;
  let x = 0, y = 0;
  for (const m of d.matchAll(/([MlLz])([^MlLz]*)/g)) {
    const cmd = m[1];
    const nums = m[2].trim().length > 0 ? m[2].trim().split(/[\s,]+/).map(Number) : [];
    if (cmd === 'z') { if (ring && ring.length >= 3) rings.push(ring); ring = null; continue; }
    for (let i = 0; i + 1 < nums.length; i += 2) {
      if (cmd === 'M') { if (ring && ring.length >= 3) rings.push(ring); ring = []; x = nums[i]; y = nums[i + 1]; }
      else if (cmd === 'l') { x += nums[i]; y += nums[i + 1]; }
      else { x = nums[i]; y = nums[i + 1]; }
      (ring ??= []).push([x, y]);
    }
  }
  if (ring && ring.length >= 3) rings.push(ring);
  return rings;
}

/** Twice the signed area of a ring: the sign says which way it winds. */
export function area2(ring: Ring): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  return a;
}

export function inside(p: Point, ring: Ring): boolean {
  let yes = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) yes = !yes;
  }
  return yes;
}

export interface ShapeParts { outer: Ring; holes: Ring[] }

/**
 * Sorts a seat's rings into pieces with their holes. The largest ring sets which way an outer edge winds: rings that
 * wind the other way are holes, and each belongs to the piece that contains it.
 */
export function shapeParts(rings: Ring[]): ShapeParts[] {
  if (rings.length === 0) return [];
  const biggest = rings.reduce((a, b) => (Math.abs(area2(b)) > Math.abs(area2(a)) ? b : a));
  const sign = Math.sign(area2(biggest));
  const parts: ShapeParts[] = [];
  const holes: Ring[] = [];
  for (const ring of rings) (Math.sign(area2(ring)) === sign ? parts.push({ outer: ring, holes: [] }) : holes.push(ring));
  for (const hole of holes) {
    const home = parts.find((p) => inside(hole[0], p.outer));
    if (home) home.holes.push(hole); else parts.push({ outer: hole, holes: [] });
  }
  return parts;
}

// ---------- height ----------

/** The margin at which a seat counts as safe, and stands as tall as a seat can. */
export const SAFE_MARGIN = 0.3;
/** How tall the tallest seat is, as a fraction of the size of the area being shown. */
export const TALLEST = 0.02;
const LOWEST = 0.12;
const FOG = 0.06;
const UNDECLARED = 0.02;

/** How firmly a seat is held, from 0 (a toss-up) to 1 (safe). */
export const strength = (margin: number) => Math.max(0, Math.min(1, margin / SAFE_MARGIN));

/**
 * The height of a seat, in map units, where `size` is the width or height of the area on show. Height says how firmly the
 * seat is held, so close contests sit low and show up as the battleground. A seat no one has news of sits lowest of all, and a
 * seat not yet declared is almost flat, ready to rise.
 */
export function seatHeight(d: { winner: number; margin: number; stale: boolean }, size: number): number {
  const top = TALLEST * size;
  if (d.winner < 0) return UNDECLARED * top;
  if (d.stale) return FOG * top;
  return top * (LOWEST + (1 - LOWEST) * Math.sqrt(strength(d.margin)));
}

// ---------- camera ----------

/**
 * How far back a camera aimed at the middle of a box, tilted `tilt` radians from straight down, must stand for the whole
 * box to show. The near edge of a tilted box looms larger than the far one, so it is the near edge that decides.
 */
export function fitDistance(boxWidth: number, boxHeight: number, aspect: number, fovDegrees: number, tilt = 0, pad = 1.08): number {
  const half = Math.tan((fovDegrees * Math.PI) / 360);
  const nearReach = (boxHeight / 2) * Math.sin(tilt);
  const tall = (boxHeight / 2) * (Math.cos(tilt) / half) + nearReach;
  const wide = boxWidth / (2 * half * aspect) + nearReach;
  return Math.max(tall, wide) * pad;
}

/** A value moved toward its goal by the share of the way a frame of `dt` seconds covers at `rate`; the same speed at any frame rate. */
export function approach(value: number, goal: number, dt: number, rate = 9): number {
  const k = 1 - Math.exp(-rate * dt);
  const next = value + (goal - value) * k;
  return Math.abs(goal - next) < Math.abs(goal) * 1e-4 + 1e-6 ? goal : next;
}

// ---------- the colour-blind patterns ----------

/** How each party is marked in the colour-blind palette, over its colour: a line direction or dots, dark or light. Used by the flat map and the 3D one. */
export const PATTERNS: { kind: 'diag' | 'vert' | 'horiz' | 'dots' | 'hatch' | 'back'; ink: string }[] = [
  { kind: 'dots', ink: '#000' }, { kind: 'diag', ink: '#000' }, { kind: 'vert', ink: '#000' }, { kind: 'horiz', ink: '#000' }, { kind: 'back', ink: '#000' },
  { kind: 'hatch', ink: '#000' }, { kind: 'diag', ink: '#fff' }, { kind: 'vert', ink: '#fff' }, { kind: 'horiz', ink: '#fff' }, { kind: 'dots', ink: '#fff' },
];

/** Whether this browser can draw 3D at all. Checked once, and without loading the 3D library. */
let webgl: boolean | null = null;
export function canDraw3D(): boolean {
  if (webgl !== null) return webgl;
  try {
    const c = document.createElement('canvas');
    webgl = !!(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch { webgl = false; }
  return webgl;
}
