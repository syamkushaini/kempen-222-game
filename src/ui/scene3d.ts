import {
  AmbientLight, BoxGeometry, BufferAttribute, BufferGeometry, Color, ConeGeometry, CylinderGeometry, DirectionalLight, ExtrudeGeometry, Group,
  HemisphereLight, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, MeshLambertMaterial, OctahedronGeometry, Path, PerspectiveCamera, Raycaster, Scene, Shape,
  SphereGeometry, TorusGeometry, Vector2, Vector3, WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { approach, fitDistance, parseRings, PATTERNS, seatHeight, shapeParts } from './map3d';

// The 3D map: every seat's outline lifted into a block whose height says how firmly the seat is held. It only draws what
// it is told to; the game's own state, taps and cards stay in the React component that owns it.

export interface MapShape { d: string; bbox: [number, number, number, number] }
export interface SceneSeat { id: string; state: string }
export interface SeatLook { winner: number; margin: number; stale: boolean }
/** A column of support standing on a region: the parties' shares there, stacked. */
export interface ColumnSpec { x: number; z: number; parts: { color: string; share: number }[] }
/** A mark a map layer puts on a seat: its shape, colour, and its place among the marks on that seat. */
export interface PinSpec { seat: string; kind: 'ring' | 'dot' | 'bullseye' | 'square' | 'diamond' | 'down' | 'up' | 'hex'; color: string; slot: number; of: number }
/** The tint a seat takes where the player's branches are strong. */
const HEAT_COLOR = '#14b8a6';
export interface MarkSpec { seat: string; party: number; kind: 'tent' | 'flag'; slot: number; of: number }

export interface SceneOptions {
  seats: SceneSeat[];
  shapes: Record<string, MapShape>;
  /** Outlines drawn flat behind a one-seat contest, for context. */
  backdrop: string[];
  /** Width or height of the area on show: heights and markers are in proportion to it. */
  size: number;
  /** The box the whole contest covers. */
  home: [number, number, number, number];
  partyColor: (party: number) => string;
  /** A one-seat contest has nothing to compare heights with, so its seat is given more of a rise. */
  lift: number;
  calm: boolean;
  onPick(id: string): void;
  onHover(id: string | null, x: number, y: number): void;
}

const FOV = 35;
const TILT = 0.95; // radians from straight down: about 54 degrees
const NIGHT = { undeclared: '#4a4f5c', pale: '#1d2028', backdrop: '#2a2e38', line: '#000000' };
const DAY = { undeclared: '#c4c8d2', pale: '#eef0f4', backdrop: '#dcdfe6', line: '#222222' };

const isDark = () => {
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

/**
 * One seat. All the seats are drawn as a single mesh, so a seat is a run of that mesh's vertices: those to lift when it
 * rises, those of its top face (which carry its pattern), and its run of the outline. `pick` is the seat's own shape, never
 * drawn, kept only so that a ray can find which seat is under the pointer.
 */
interface Block {
  id: string; index: number; state: string; pick: Mesh; height: number; goal: number;
  start: number; count: number; upper: Uint32Array; top: Uint32Array; edgeStart: number; edgeCount: number;
}

export class MapScene3D {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(FOV, 1, 0.01, 100000);
  private controls: OrbitControls;
  private ray = new Raycaster();
  private blocks: Block[] = [];
  private byId = new Map<string, Block>();
  private backdrop = new Group();
  private props = new Group();
  private pinsGroup = new Group();
  private pinSpecs: PinSpec[] = [];
  private heat: Record<string, number> | null = null;
  private pin: Group | null = null;
  private palette = isDark() ? NIGHT : DAY;
  private land: BufferGeometry | null = null;
  private outline: BufferGeometry | null = null;
  private tile = { value: 1 };
  private disposables: { dispose(): void }[] = [];
  private focus: [number, number, number, number];
  private goal = { x: 0, z: 0, dist: 1 };
  private frame = 0;
  private last = 0;
  private flashes: { block: Block; until: number }[] = [];
  private accessible = false;
  private selected: string | null = null;
  private selectedState: string | null = null;
  private display: SeatLook[] = [];
  private pointer: { x: number; y: number } | null = null;
  private down: { x: number; y: number } | null = null;
  /** Width or height of the area on show: heights, tiles and markers are in proportion to it, so they follow the camera into a state. */
  private size: number;
  private markSpecs: { marks: MarkSpec[]; pin: [number, number, number, number] | null } = { marks: [], pin: null };
  private box: HTMLElement;
  private ro: ResizeObserver;
  private cleanup: (() => void)[] = [];
  private columns = new Group();
  private columnSpecs: ColumnSpec[] | null = null;
  private rise = 0;
  private riseGoal = 0;
  private swaying: { amplitude: number; period: number; from: number } | null = null;

  constructor(container: HTMLElement, private o: SceneOptions) {
    this.box = container;
    // Where the tests can reach it: a development server only.
    if (import.meta.env.DEV) (window as unknown as { __map3d?: unknown }).__map3d = this;
    this.size = o.size;
    this.tile.value = o.size * 0.012;
    this.focus = o.home;
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    this.renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
    container.appendChild(this.renderer.domElement);

    this.scene.add(new HemisphereLight(0xffffff, 0x8890a0, 1.35));
    this.scene.add(new AmbientLight(0xffffff, 0.15));
    const sun = new DirectionalLight(0xffffff, 1.5);
    sun.position.set(-0.5, 1, 0.7);
    this.scene.add(sun);
    this.scene.add(this.backdrop, this.props, this.pinsGroup, this.columns);

    this.build();

    const c = this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    c.enableDamping = false;
    c.enableZoom = false; // a plain scroll belongs to the page; Ctrl or Cmd zooms, as on the flat map
    c.minPolarAngle = 0.1;
    c.maxPolarAngle = 1.3;
    c.minAzimuthAngle = -0.8;
    c.maxAzimuthAngle = 0.8;
    c.screenSpacePanning = false;
    // Whatever the player does with the map becomes the place the camera stays, so nothing pulls it back.
    c.addEventListener('change', () => {
      this.clampTarget();
      const t = c.target;
      this.goal = { x: t.x, z: t.z, dist: this.camera.position.distanceTo(t) };
      this.render();
    });

    const el = this.renderer.domElement;
    const on = <K extends keyof HTMLElementEventMap>(type: K, fn: (e: HTMLElementEventMap[K]) => void, opts?: AddEventListenerOptions) => {
      el.addEventListener(type, fn, opts);
      this.cleanup.push(() => el.removeEventListener(type, fn));
    };
    on('wheel', (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); this.zoomBy(e.deltaY < 0 ? 1.2 : 1 / 1.2); } }, { passive: false });
    on('pointerdown', (e) => { this.down = { x: e.clientX, y: e.clientY }; });
    on('pointerup', (e) => {
      const d = this.down;
      this.down = null;
      if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) return;
      const id = this.pick(e.clientX, e.clientY);
      if (id) this.o.onPick(id);
    });
    on('pointermove', (e) => {
      if (e.buttons) { this.o.onHover(null, 0, 0); return; }
      this.pointer = { x: e.clientX, y: e.clientY };
      if (!this.frame) this.frame = requestAnimationFrame((t) => this.tick(t));
    });
    on('pointerleave', () => { this.pointer = null; this.o.onHover(null, 0, 0); });

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.resize();
    this.fit(true);
    this.setAngles(0, TILT);
  }

  // ---------- building ----------

  /** A seat's outline lifted into a block one unit tall, lying on the map with north away from the camera. */
  private extrude(d: string) {
    const parts = shapeParts(parseRings(d));
    const geo = new ExtrudeGeometry(parts.map((p) => {
      const s = new Shape(p.outer.map(([x, y]) => new Vector2(x, -y)));
      s.holes = p.holes.map((h) => new Path(h.map(([x, y]) => new Vector2(x, -y))));
      return s;
    }), { depth: 1, bevelEnabled: false, curveSegments: 1 });
    geo.rotateX(-Math.PI / 2);
    return { geo, parts };
  }

  private build() {
    const { shapes, seats, backdrop } = this.o;
    const pos: number[] = [], nor: number[] = [], line: number[] = [];
    const pickMat = new MeshBasicMaterial();
    this.disposables.push(pickMat);

    for (const [index, seat] of seats.entries()) {
      const shape = shapes[seat.id];
      if (!shape) continue;
      const { geo, parts } = this.extrude(shape.d);
      this.disposables.push(geo);
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
      this.blocks.push(block);
      this.byId.set(seat.id, block);
    }

    const total = pos.length / 3;
    const land = this.land = new BufferGeometry();
    land.setAttribute('position', new BufferAttribute(Float32Array.from(pos), 3));
    land.setAttribute('normal', new BufferAttribute(Float32Array.from(nor), 3));
    land.setAttribute('color', new BufferAttribute(new Float32Array(total * 3), 3));
    land.setAttribute('aPat', new BufferAttribute(new Float32Array(total), 1));
    land.setAttribute('aInk', new BufferAttribute(new Float32Array(total), 1));
    const paint = new MeshLambertMaterial({ vertexColors: true });
    paint.onBeforeCompile = (shader) => {
      shader.uniforms.uTile = this.tile;
      shader.vertexShader = PATTERN_VERTEX + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvPat = aPat;\nvInk = aInk;\nvPlace = position.xz;');
      shader.fragmentShader = PATTERN_FRAGMENT + shader.fragmentShader.replace(
        '#include <color_fragment>',
        '#include <color_fragment>\nif (vPat > 0.5) diffuseColor.rgb = mix(diffuseColor.rgb, vec3(vInk), 0.45 * seatPattern(vPat, vPlace / uTile));',
      );
    };
    const mesh = new Mesh(land, paint);
    // The seats rise and fall, so what is in view is not worked out from where they began.
    mesh.frustumCulled = false;
    this.scene.add(mesh);

    const outline = this.outline = new BufferGeometry();
    outline.setAttribute('position', new BufferAttribute(Float32Array.from(line), 3));
    const lineMat = new LineBasicMaterial({ color: this.palette.line, transparent: true, opacity: 0.35 });
    const edges = new LineSegments(outline, lineMat);
    edges.frustumCulled = false;
    this.scene.add(edges);
    this.disposables.push(land, paint, outline, lineMat);
    for (const b of this.blocks) this.lift(b, 1e-4);

    // Around a one-seat contest, the seats beside it lie flat for context: one mesh for them all.
    if (backdrop.length > 0) {
      const flat: number[] = [], up: number[] = [];
      for (const id of backdrop) {
        const shape = shapes[id];
        if (!shape) continue;
        const { geo } = this.extrude(shape.d);
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
      const mat = new MeshLambertMaterial({ color: this.palette.backdrop });
      this.disposables.push(ground, mat);
      this.backdrop.add(new Mesh(ground, mat));
    }
  }

  /** Sets a seat to a height: its upper vertices, its outline, and the unseen shape a ray is tested against. */
  private lift(b: Block, h: number) {
    if (!this.land || !this.outline || b.height === h) return;
    b.height = h;
    const y = Math.max(h, 1e-4);
    const pos = this.land.getAttribute('position') as BufferAttribute, line = this.outline.getAttribute('position') as BufferAttribute;
    const p = pos.array as Float32Array, l = line.array as Float32Array;
    for (const v of b.upper) p[v * 3 + 1] = y;
    const above = y + this.size * 2e-4;
    for (let v = b.edgeStart; v < b.edgeStart + b.edgeCount; v++) l[v * 3 + 1] = above;
    pos.needsUpdate = true;
    line.needsUpdate = true;
    b.pick.scale.y = y;
    b.pick.updateMatrixWorld(true);
  }

  // ---------- looks ----------

  /** How a seat is to look now: its colour, a paler one for its sides, and the pattern on its top, if any. */
  private look(b: Block, d: SeatLook): { colour: Color; pattern: number; ink: number } {
    const dim = this.selectedState !== null && b.state !== this.selectedState;
    const picked = b.id === this.selected;
    const fog = d.stale && d.winner >= 0;
    const colour = new Color(d.winner < 0 ? this.palette.undeclared : this.o.partyColor(d.winner));
    if (fog) colour.lerp(new Color(this.palette.pale), 0.55);
    if (dim) colour.lerp(new Color(this.palette.pale), 0.6);
    if (picked) colour.lerp(new Color('#ffffff'), 0.3);
    const mark = d.winner >= 0 && !fog && this.accessible ? PATTERNS[d.winner % PATTERNS.length] : null;
    return { colour, pattern: fog ? FOG_PATTERN : mark ? PATTERN_NO[mark.kind] : 0, ink: fog ? FOG_INK : mark?.ink === '#fff' ? 1 : 0 };
  }

  /** Writes a seat's colour and pattern into the mesh, `lit` of the way to white for a seat that is flashing. */
  private tint(b: Block, lit = 0) {
    const d = this.display[b.index];
    if (!d || !this.land) return;
    const { colour, pattern, ink } = this.look(b, d);
    const warm = this.heat?.[b.id];
    if (warm) colour.lerp(new Color(HEAT_COLOR), 0.08 + 0.4 * warm);
    if (lit > 0) colour.lerp(new Color('#ffffff'), lit);
    const side = colour.clone().multiplyScalar(0.72);
    const col = this.land.getAttribute('color') as BufferAttribute, pat = this.land.getAttribute('aPat') as BufferAttribute, inks = this.land.getAttribute('aInk') as BufferAttribute;
    const c = col.array as Float32Array, pa = pat.array as Float32Array, ia = inks.array as Float32Array;
    for (let v = b.start; v < b.start + b.count; v++) { c[v * 3] = side.r; c[v * 3 + 1] = side.g; c[v * 3 + 2] = side.b; pa[v] = 0; }
    for (const v of b.top) { c[v * 3] = colour.r; c[v * 3 + 1] = colour.g; c[v * 3 + 2] = colour.b; pa[v] = pattern; ia[v] = ink; }
    col.needsUpdate = pat.needsUpdate = inks.needsUpdate = true;
  }

  private paint(b: Block) {
    const d = this.display[b.index];
    if (!d) return;
    this.tint(b);
    b.goal = seatHeight(d, this.size) * this.o.lift;
  }

  // ---------- what the game tells it ----------

  setDisplay(display: SeatLook[]) {
    this.display = display;
    this.blocks.forEach((b) => this.paint(b));
    if (this.o.calm) this.blocks.forEach((b) => this.lift(b, b.goal));
    this.settle();
    this.refresh();
  }

  setAccessible(on: boolean) {
    if (on === this.accessible) return;
    this.accessible = on;
    this.blocks.forEach((b) => this.paint(b));
    this.refresh();
  }

  setSelection(seat: string | null, state: string | null) {
    this.selected = seat;
    this.selectedState = state;
    this.blocks.forEach((b) => this.paint(b));
    this.refresh();
  }

  /** The area to frame: a state, or the whole contest. */
  setFocus(box: [number, number, number, number]) {
    this.focus = box;
    const size = Math.max(box[2] - box[0], box[3] - box[1], 1e-6);
    if (Math.abs(size - this.size) > 1e-9) {
      this.size = size;
      this.tile.value = size * 0.012;
      this.blocks.forEach((b) => this.paint(b));
      if (this.o.calm) this.blocks.forEach((b) => this.lift(b, b.goal));
      this.setMarks(this.markSpecs.marks, this.markSpecs.pin);
      this.setPins(this.pinSpecs);
      if (this.columnSpecs) this.buildColumns();
    }
    this.fit(false);
  }

  setMarks(marks: MarkSpec[], pin: [number, number, number, number] | null) {
    this.markSpecs = { marks, pin };
    this.props.clear();
    const u = this.size * 0.012;
    const tent = new ConeGeometry(0.9 * u, 1.3 * u, 4);
    const pole = new CylinderGeometry(0.08 * u, 0.08 * u, 2 * u, 5);
    const cloth = new BoxGeometry(1.1 * u, 0.7 * u, 0.06 * u);
    this.disposables.push(tent, pole, cloth);
    for (const m of marks) {
      const shape = this.o.shapes[m.seat];
      if (!shape) continue;
      const [x0, y0, x1, y1] = shape.bbox;
      const g = new Group();
      const paint = new MeshLambertMaterial({ color: this.o.partyColor(m.party) });
      const wood = new MeshLambertMaterial({ color: '#d8d2c4' });
      this.disposables.push(paint, wood);
      if (m.kind === 'tent') { const t = new Mesh(tent, paint); t.position.y = 0.65 * u; g.add(t); }
      else {
        const p = new Mesh(pole, wood); p.position.y = u; g.add(p);
        const c = new Mesh(cloth, paint); c.position.set(0.6 * u, 1.65 * u, 0); g.add(c);
      }
      g.position.set((x0 + x1) / 2 + (m.slot - (m.of - 1) / 2) * 1.6 * u, 0, (y0 + y1) / 2);
      g.userData.seat = m.seat;
      this.props.add(g);
    }
    if (this.pin) { this.scene.remove(this.pin); this.pin = null; }
    if (pin) {
      const g = new Group();
      const col = getComputedStyle(document.documentElement).getPropertyValue('--party').trim() || '#ffffff';
      const mat = new MeshLambertMaterial({ color: new Color().set(col.startsWith('#') ? col : '#ffffff') });
      this.disposables.push(mat);
      const stick = new Mesh(new CylinderGeometry(0.12 * u, 0.12 * u, 5 * u, 6), mat);
      stick.position.y = 2.5 * u;
      const head = new Mesh(new SphereGeometry(0.9 * u, 12, 8), mat);
      head.position.y = 5.4 * u;
      g.add(stick, head);
      g.position.set((pin[0] + pin[2]) / 2, 0, (pin[1] + pin[3]) / 2);
      this.pin = g;
      this.scene.add(g);
    }
    this.refresh();
  }

  /** The marks the ticked layers put on seats. They stand on the seat's block, a little in front of the tents. */
  setPins(pins: PinSpec[]) {
    this.pinSpecs = pins;
    this.pinsGroup.clear();
    const u = this.size * 0.012;
    const geo = {
      ring: new TorusGeometry(0.62 * u, 0.13 * u, 6, 20).rotateX(Math.PI / 2),
      dot: new SphereGeometry(0.42 * u, 12, 8),
      square: new BoxGeometry(0.8 * u, 0.3 * u, 0.8 * u),
      diamond: new OctahedronGeometry(0.55 * u),
      down: new ConeGeometry(0.62 * u, 1 * u, 3).rotateX(Math.PI),
      up: new ConeGeometry(0.62 * u, 1 * u, 3),
      hex: new CylinderGeometry(0.55 * u, 0.55 * u, 0.4 * u, 6),
      dotCore: new SphereGeometry(0.24 * u, 10, 6),
    };
    this.disposables.push(...Object.values(geo));
    for (const pin of pins) {
      const shape = this.o.shapes[pin.seat];
      if (!shape) continue;
      const [x0, y0, x1, y1] = shape.bbox;
      const mat = new MeshLambertMaterial({ color: pin.color });
      this.disposables.push(mat);
      const g = new Group();
      if (pin.kind === 'bullseye') { g.add(new Mesh(geo.ring, mat), new Mesh(geo.dotCore, mat)); }
      else g.add(new Mesh(geo[pin.kind], mat));
      g.position.set((x0 + x1) / 2 + (pin.slot - (pin.of - 1) / 2) * 1.5 * u, 0, (y0 + y1) / 2 + 1.1 * u);
      g.userData.seat = pin.seat;
      g.userData.lift = 0.55 * u;
      this.pinsGroup.add(g);
    }
    this.refresh();
  }

  /** How strong the player's branches are under each seat, 0 to 1: the map takes a teal tint where they are. */
  setHeat(heat: Record<string, number> | null) {
    this.heat = heat;
    this.blocks.forEach((b) => this.paint(b));
    this.refresh();
  }

  /** Columns of support by region, rising out of the map while the poll is open and sinking when it is closed. */
  setColumns(cols: ColumnSpec[] | null) {
    if (cols) { this.columnSpecs = cols; this.buildColumns(); this.riseGoal = 1; if (this.o.calm) this.rise = 1; }
    else { this.riseGoal = 0; if (this.o.calm) { this.rise = 0; this.columns.clear(); this.columnSpecs = null; } }
    this.columns.scale.y = Math.max(this.rise, 1e-4);
    this.refresh();
  }

  private buildColumns() {
    this.columns.clear();
    const wide = this.size * 0.035, tall = this.size * 0.2, base = this.size * 0.03 * this.o.lift;
    for (const col of this.columnSpecs ?? []) {
      let y = base;
      for (const part of col.parts) {
        const h = Math.max(part.share * tall, 1e-4);
        const geo = new BoxGeometry(wide, h, wide);
        const mat = new MeshLambertMaterial({ color: part.color });
        this.disposables.push(geo, mat);
        const box = new Mesh(geo, mat);
        box.position.set(col.x, y + h / 2, col.z);
        this.columns.add(box);
        y += h;
      }
    }
  }

  /** A seat has just been declared: it flashes, so the eye is taken to it. */
  pulse(id: string) {
    const b = this.byId.get(id);
    if (!b || this.o.calm) return;
    this.flashes = this.flashes.filter((f) => f.block !== b);
    this.flashes.push({ block: b, until: performance.now() + 900 });
    this.refresh();
  }

  /** For a backdrop: the map turns slowly a little to one side and back, for as long as it is on show. Nothing else moves it. */
  sway(amplitude = 0.3, period = 46) {
    this.swaying = { amplitude, period, from: performance.now() };
    this.refresh();
  }

  // ---------- camera ----------

  private aspect() { return Math.max(0.1, this.box.clientWidth / Math.max(1, this.box.clientHeight)); }

  private fitFor(box: [number, number, number, number]) {
    // The towers add a little to the depth, whichever way they lean.
    return fitDistance(box[2] - box[0], box[3] - box[1] + this.size * 0.04, this.aspect(), FOV, TILT, 1);
  }

  /** Aims the camera at the focus box, keeping whatever angle the player has turned the map to. */
  private fit(now: boolean) {
    const f = this.focus, h = this.o.home;
    this.goal = { x: (f[0] + f[2]) / 2, z: (f[1] + f[3]) / 2, dist: this.fitFor(f) };
    this.controls.minDistance = this.goal.dist * 0.08;
    this.controls.maxDistance = this.fitFor(h) * 1.6;
    if (now || this.o.calm) this.snap(); else this.refresh();
  }

  private snap() {
    const off = new Vector3().subVectors(this.camera.position, this.controls.target);
    const t = this.controls.target;
    t.set(this.goal.x, 0, this.goal.z);
    this.camera.position.copy(t).add(off.setLength(this.goal.dist));
    this.camera.lookAt(t);
    this.render();
  }

  private setAngles(azimuth: number, polar: number) {
    const t = this.controls.target;
    t.set(this.goal.x, 0, this.goal.z);
    const d = this.goal.dist;
    this.camera.position.set(t.x + d * Math.sin(polar) * Math.sin(azimuth), d * Math.cos(polar), t.z + d * Math.sin(polar) * Math.cos(azimuth));
    this.camera.lookAt(t);
    this.controls.update();
  }

  reset() {
    this.fit(true);
    this.setAngles(0, TILT);
    this.render();
  }

  zoomBy(factor: number) {
    const t = this.controls.target;
    const off = new Vector3().subVectors(this.camera.position, t);
    const len = Math.min(this.controls.maxDistance, Math.max(this.controls.minDistance, off.length() / factor));
    this.camera.position.copy(t).add(off.setLength(len));
    this.goal.dist = len;
    this.refresh();
  }

  /** The player may pan, but not off the country. */
  private clampTarget() {
    const h = this.o.home, t = this.controls.target;
    const px = (h[2] - h[0]) * 0.1, pz = (h[3] - h[1]) * 0.1;
    const x = Math.min(h[2] + px, Math.max(h[0] - px, t.x)), z = Math.min(h[3] + pz, Math.max(h[1] - pz, t.z));
    if (x !== t.x || z !== t.z) { this.camera.position.x += x - t.x; this.camera.position.z += z - t.z; t.x = x; t.z = z; }
  }

  // ---------- drawing ----------

  private resize() {
    const w = this.box.clientWidth, h = this.box.clientHeight;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.fit(true);
  }

  /** Whether anything is still on the move, which decides if another frame is wanted. */
  private settle(): boolean {
    return this.swaying !== null || this.rise !== this.riseGoal || this.blocks.some((b) => b.height !== b.goal) || this.flashes.length > 0 || this.cameraMoving();
  }

  private cameraMoving() {
    const t = this.controls.target;
    return Math.abs(t.x - this.goal.x) > 1e-3 * this.size || Math.abs(t.z - this.goal.z) > 1e-3 * this.size || Math.abs(this.camera.position.distanceTo(t) - this.goal.dist) > 1e-3 * this.size;
  }

  /** Asks for a frame, if one is not already on its way. */
  private refresh() {
    if (!this.frame) this.frame = requestAnimationFrame((t) => this.tick(t));
  }

  private tick(now: number) {
    this.frame = 0;
    const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 1 / 60;
    this.last = now;
    for (const b of this.blocks) {
      if (b.height === b.goal) continue;
      this.lift(b, approach(b.height, b.goal, dt, 7));
    }
    // The camera glides to its goal unless the player is holding it.
    const t = this.controls.target;
    const gx = approach(t.x, this.goal.x, dt, 6), gz = approach(t.z, this.goal.z, dt, 6);
    const off = new Vector3().subVectors(this.camera.position, t);
    const len = approach(off.length(), this.goal.dist, dt, 6);
    t.x = gx; t.z = gz;
    this.camera.position.copy(t).add(off.setLength(len));
    this.camera.lookAt(t);
    if (this.swaying) this.setAngles(this.swaying.amplitude * Math.sin(((now - this.swaying.from) / 1000 / this.swaying.period) * Math.PI * 2), TILT);
    if (this.rise !== this.riseGoal) {
      this.rise = approach(this.rise, this.riseGoal, dt, 6);
      if (Math.abs(this.rise - this.riseGoal) < 1e-3) this.rise = this.riseGoal;
      this.columns.scale.y = Math.max(this.rise, 1e-4);
      if (this.rise === 0) { this.columns.clear(); this.columnSpecs = null; }
    }
    // Flashing seats lighten and settle back.
    const stamp = performance.now();
    this.flashes = this.flashes.filter((f) => {
      const left = (f.until - stamp) / 900;
      this.tint(f.block, Math.max(0, 0.6 * left));
      return left > 0;
    });
    for (const g of this.props.children) { const b = this.byId.get(g.userData.seat as string); g.position.y = b ? Math.max(b.height, 0) : 0; }
    for (const g of this.pinsGroup.children) { const b = this.byId.get(g.userData.seat as string); g.position.y = (b ? Math.max(b.height, 0) : 0) + (g.userData.lift as number); }
    this.render();
    if (this.pointer) { this.hover(); this.pointer = null; }
    if (this.settle()) this.refresh();
  }

  private render() { this.renderer.render(this.scene, this.camera); }

  // ---------- picking ----------

  private pick(clientX: number, clientY: number): string | null {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.ray.setFromCamera(new Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), this.camera);
    // The seats' own shapes are never drawn; they are kept at each seat's height for the ray to find.
    const hit = this.ray.intersectObjects(this.blocks.map((b) => b.pick), false)[0];
    return hit ? (hit.object.userData.seat as string) : null;
  }

  private hover() {
    const p = this.pointer;
    if (!p) return;
    const id = this.pick(p.x, p.y);
    const r = this.box.getBoundingClientRect();
    this.o.onHover(id, p.x - r.left, p.y - r.top);
  }

  // ---------- tidying up ----------

  /** A picture of the map for the result card: the whole contest from the usual angle, whatever the player was looking at. */
  snapshot(): string {
    const pos = this.camera.position.clone(), aim = this.controls.target.clone(), goal = { ...this.goal };
    const h = this.o.home;
    this.goal = { x: (h[0] + h[2]) / 2, z: (h[1] + h[3]) / 2, dist: this.fitFor(h) * 0.82 };
    const polar = TILT, d = this.goal.dist;
    this.camera.position.set(this.goal.x, d * Math.cos(polar), this.goal.z + d * Math.sin(polar));
    this.camera.lookAt(this.goal.x, 0, this.goal.z);
    this.render();
    const data = this.renderer.domElement.toDataURL('image/png');
    this.camera.position.copy(pos);
    this.camera.lookAt(aim);
    this.goal = goal;
    this.render();
    return data;
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    this.ro.disconnect();
    this.cleanup.forEach((fn) => fn());
    this.controls.dispose();
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
