import {
  BufferAttribute, BufferGeometry, Color, ExtrudeGeometry, MeshBasicMaterial, MeshLambertMaterial, Mesh, Path, Shape, Vector2,
  type IUniform,
} from 'three';
import { parseRings, PATTERNS, shapeParts } from './map3d';

// The land of the 3D map, built apart from React: every seat's outline lifted into a block, all the blocks in one mesh.
// The seats rise and fall by writing into that mesh's vertices, so it is built once and then changed in place, which is why
// it is not a tree of declarative meshes. The scene in MapScene3D.tsx draws it and everything around it.

export interface MapShape { d: string; bbox: [number, number, number, number] }
export interface SceneSeat { id: string; state: string }
export interface SeatLook { winner: number; margin: number; stale: boolean }
/** A column of support standing on a region: the parties' shares there, stacked. */
export interface ColumnSpec { x: number; z: number; parts: { color: string; share: number }[] }
/** A mark a map layer puts on a seat: its shape, colour, and its place among the marks on that seat. */
export interface PinSpec { seat: string; kind: 'ring' | 'dot' | 'bullseye' | 'square' | 'diamond' | 'down' | 'up' | 'hex' | 'flag'; color: string; slot: number; of: number }
export interface MarkSpec { seat: string; party: number; kind: 'poster' | 'flag' | 'tent'; slot: number; of: number }

/** The tint a seat takes where the player's branches are strong. */
export const HEAT_COLOR = '#14b8a6';
export const NIGHT = { undeclared: '#4a4f5c', pale: '#1d2028', backdrop: '#2a2e38', line: '#000000' };
export const DAY = { undeclared: '#c4c8d2', pale: '#eef0f4', backdrop: '#dcdfe6', line: '#222222' };
export type Palette = typeof DAY;

export const isDark = () => {
  const root = document.documentElement.dataset.theme;
  return root ? root === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
};

/** The number each kind of pattern goes by in the material that draws it. Nought is none. */
const PATTERN_NO: Record<(typeof PATTERNS)[number]['kind'], number> = { dots: 1, diag: 2, vert: 3, horiz: 4, back: 5, hatch: 6 };
const FOG_PATTERN = PATTERN_NO.diag, FOG_INK = 0.55;

/**
 * The patterns of the colour-blind palette and of seats in the fog, drawn on the top faces by the material: a pattern number
 * and an ink (0 dark to 1 light) for each seat, and the place on the map to keep the pattern still as heights change.
 */
const PATTERN_VERTEX = 'attribute float aPat;\nattribute float aInk;\nvarying float vPat;\nvarying float vInk;\nvarying vec2 vPlace;\n';
const PATTERN_FRAGMENT = `uniform float uTile;
varying float vPat;
varying float vInk;
varying vec2 vPlace;
float seatPattern(float kind, vec2 p) {
  vec2 q = fract(p);
  if (kind < 1.5) return step(distance(q, vec2(0.5)), 0.17);
  if (kind < 2.5) return step(fract(p.x + p.y), 0.26);
  if (kind < 3.5) return step(q.x, 0.24);
  if (kind < 4.5) return step(q.y, 0.24);
  if (kind < 5.5) return step(fract(p.x - p.y), 0.26);
  return max(step(q.x, 0.18), step(q.y, 0.18));
}
`;

/** The material of the land: vertex colours, and the patterns on top. `tile` is the size of one repeat of a pattern. */
export function patternMaterial(tile: IUniform<number>): MeshLambertMaterial {
  const paint = new MeshLambertMaterial({ vertexColors: true });
  paint.onBeforeCompile = (shader) => {
    shader.uniforms.uTile = tile;
    shader.vertexShader = PATTERN_VERTEX + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvPat = aPat;\nvInk = aInk;\nvPlace = position.xz;');
    shader.fragmentShader = PATTERN_FRAGMENT + shader.fragmentShader.replace(
      '#include <color_fragment>',
      '#include <color_fragment>\nif (vPat > 0.5) diffuseColor.rgb = mix(diffuseColor.rgb, vec3(vInk), 0.45 * seatPattern(vPat, vPlace / uTile));',
    );
  };
  return paint;
}

/**
 * One seat. All the seats are drawn as a single mesh, so a seat is a run of that mesh's vertices: those to lift when it
 * rises, those of its top face (which carry its pattern), and its run of the outline. `pick` is the seat's own shape, never
 * drawn, kept only so that a ray can find which seat is under the pointer.
 */
export interface Block {
  id: string; index: number; state: string; pick: Mesh; height: number; goal: number;
  start: number; count: number; upper: Uint32Array; top: Uint32Array; edgeStart: number; edgeCount: number;
}

export interface Land {
  blocks: Block[];
  byId: Map<string, Block>;
  geometry: BufferGeometry;
  outline: BufferGeometry;
  dispose(): void;
}

/** A seat's outline lifted into a block one unit tall, lying on the map with north away from the camera. */
function extrude(d: string) {
  const parts = shapeParts(parseRings(d));
  const geo = new ExtrudeGeometry(parts.map((p) => {
    const s = new Shape(p.outer.map(([x, y]) => new Vector2(x, -y)));
    s.holes = p.holes.map((h) => new Path(h.map(([x, y]) => new Vector2(x, -y))));
    return s;
  }), { depth: 1, bevelEnabled: false, curveSegments: 1 });
  geo.rotateX(-Math.PI / 2);
  return { geo, parts };
}

export function buildLand(shapes: Record<string, MapShape>, seats: SceneSeat[], size: number): Land {
  const pos: number[] = [], nor: number[] = [], line: number[] = [];
  const pickMat = new MeshBasicMaterial();
  const blocks: Block[] = [];
  const byId = new Map<string, Block>();
  const own: { dispose(): void }[] = [pickMat];

  for (const [index, seat] of seats.entries()) {
    const shape = shapes[seat.id];
    if (!shape) continue;
    const { geo, parts } = extrude(shape.d);
    own.push(geo);
    const p = geo.getAttribute('position').array as Float32Array, n = geo.getAttribute('normal').array as Float32Array;
    const start = pos.length / 3, upper: number[] = [], top: number[] = [];
    // The faces are copied into the one mesh, all but the undersides, which nobody will ever see.
    for (const group of geo.groups) {
      const cap = group.materialIndex === 0;
      for (let v = group.start; v < group.start + group.count; v += 3) {
        const ys = [p[v * 3 + 1], p[(v + 1) * 3 + 1], p[(v + 2) * 3 + 1]];
        if (cap && ys.every((y) => y < 0.5)) continue;
        for (let k = 0; k < 3; k++) {
          const at = pos.length / 3, o = (v + k) * 3;
          pos.push(p[o], p[o + 1], p[o + 2]);
          nor.push(n[o], n[o + 1], n[o + 2]);
          if (ys[k] > 0.5) upper.push(at);
          if (cap) top.push(at);
        }
      }
    }
    const edgeStart = line.length / 3;
    for (const part of parts) for (const ring of [part.outer, ...part.holes]) {
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i], b = ring[(i + 1) % ring.length];
        line.push(a[0], 0, a[1], b[0], 0, b[1]);
      }
    }
    const pick = new Mesh(geo, pickMat);
    pick.userData.seat = seat.id;
    const block: Block = {
      id: seat.id, index, state: seat.state, pick, height: -1, goal: 1e-4,
      start, count: pos.length / 3 - start, upper: Uint32Array.from(upper), top: Uint32Array.from(top), edgeStart, edgeCount: line.length / 3 - edgeStart,
    };
    blocks.push(block);
    byId.set(seat.id, block);
  }

  const total = pos.length / 3;
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(Float32Array.from(pos), 3));
  geometry.setAttribute('normal', new BufferAttribute(Float32Array.from(nor), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(total * 3), 3));
  geometry.setAttribute('aPat', new BufferAttribute(new Float32Array(total), 1));
  geometry.setAttribute('aInk', new BufferAttribute(new Float32Array(total), 1));
  const outline = new BufferGeometry();
  outline.setAttribute('position', new BufferAttribute(Float32Array.from(line), 3));
  own.push(geometry, outline);

  const land: Land = { blocks, byId, geometry, outline, dispose: () => own.forEach((d) => d.dispose()) };
  for (const b of blocks) liftBlock(land, b, 1e-4, size);
  return land;
}

/** Sets a seat to a height: its upper vertices, its outline, and the unseen shape a ray is tested against. */
export function liftBlock(land: Land, b: Block, h: number, size: number) {
  if (b.height === h) return;
  b.height = h;
  const y = Math.max(h, 1e-4);
  const pos = land.geometry.getAttribute('position') as BufferAttribute, line = land.outline.getAttribute('position') as BufferAttribute;
  const p = pos.array as Float32Array, l = line.array as Float32Array;
  for (const v of b.upper) p[v * 3 + 1] = y;
  const above = y + size * 2e-4;
  for (let v = b.edgeStart; v < b.edgeStart + b.edgeCount; v++) l[v * 3 + 1] = above;
  pos.needsUpdate = true;
  line.needsUpdate = true;
  b.pick.scale.y = y;
  b.pick.updateMatrixWorld(true);
}

/** Everything that decides how a seat looks, short of its own state. */
export interface LookContext {
  display: SeatLook[];
  palette: Palette;
  partyColor: (party: number) => string;
  selected: string | null;
  selectedState: string | null;
  accessible: boolean;
  heat: Record<string, number> | null;
}

/** How a seat is to look now: its colour, and the pattern on its top, if any. */
function look(b: Block, d: SeatLook, c: LookContext): { colour: Color; pattern: number; ink: number } {
  const dim = c.selectedState !== null && b.state !== c.selectedState;
  const picked = b.id === c.selected;
  const fog = d.stale && d.winner >= 0;
  const colour = new Color(d.winner < 0 ? c.palette.undeclared : c.partyColor(d.winner));
  if (fog) colour.lerp(new Color(c.palette.pale), 0.55);
  if (dim) colour.lerp(new Color(c.palette.pale), 0.6);
  if (picked) colour.lerp(new Color('#ffffff'), 0.3);
  const mark = d.winner >= 0 && !fog && c.accessible ? PATTERNS[d.winner % PATTERNS.length] : null;
  return { colour, pattern: fog ? FOG_PATTERN : mark ? PATTERN_NO[mark.kind] : 0, ink: fog ? FOG_INK : mark?.ink === '#fff' ? 1 : 0 };
}

/** Writes a seat's colour and pattern into the mesh, `lit` of the way to white for a seat that is flashing. */
export function tintBlock(land: Land, b: Block, c: LookContext, lit = 0) {
  const d = c.display[b.index];
  if (!d) return;
  const { colour, pattern, ink } = look(b, d, c);
  const warm = c.heat?.[b.id];
  if (warm) colour.lerp(new Color(HEAT_COLOR), 0.08 + 0.4 * warm);
  if (lit > 0) colour.lerp(new Color('#ffffff'), lit);
  const side = colour.clone().multiplyScalar(0.72);
  const col = land.geometry.getAttribute('color') as BufferAttribute, pat = land.geometry.getAttribute('aPat') as BufferAttribute, inks = land.geometry.getAttribute('aInk') as BufferAttribute;
  const cs = col.array as Float32Array, pa = pat.array as Float32Array, ia = inks.array as Float32Array;
  for (let v = b.start; v < b.start + b.count; v++) { cs[v * 3] = side.r; cs[v * 3 + 1] = side.g; cs[v * 3 + 2] = side.b; pa[v] = 0; }
  for (const v of b.top) { cs[v * 3] = colour.r; cs[v * 3 + 1] = colour.g; cs[v * 3 + 2] = colour.b; pa[v] = pattern; ia[v] = ink; }
  col.needsUpdate = pat.needsUpdate = inks.needsUpdate = true;
}

/** Around a one-seat contest, the seats beside it lie flat for context: one geometry for them all. */
export function buildBackdrop(shapes: Record<string, MapShape>, ids: string[]): BufferGeometry | null {
  if (ids.length === 0) return null;
  const flat: number[] = [], up: number[] = [];
  for (const id of ids) {
    const shape = shapes[id];
    if (!shape) continue;
    const { geo } = extrude(shape.d);
    const p = geo.getAttribute('position').array as Float32Array;
    for (const group of geo.groups) {
      if (group.materialIndex !== 0) continue;
      for (let v = group.start; v < group.start + group.count; v += 3) {
        if (p[v * 3 + 1] < 0.5) continue;
        for (let k = 0; k < 3; k++) { flat.push(p[(v + k) * 3], 0, p[(v + k) * 3 + 2]); up.push(0, 1, 0); }
      }
    }
    geo.dispose();
  }
  const ground = new BufferGeometry();
  ground.setAttribute('position', new BufferAttribute(Float32Array.from(flat), 3));
  ground.setAttribute('normal', new BufferAttribute(Float32Array.from(up), 3));
  return ground;
}
