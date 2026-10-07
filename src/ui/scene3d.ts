import {
  AmbientLight, BufferGeometry, CanvasTexture, Color, ConeGeometry, CylinderGeometry, DirectionalLight, ExtrudeGeometry, Float32BufferAttribute,
  Group, HemisphereLight, LineBasicMaterial, LineSegments, Material, Mesh, MeshLambertMaterial, PerspectiveCamera, Raycaster, RepeatWrapping,
  Scene, Shape, SphereGeometry, Vector2, Vector3, WebGLRenderer, BoxGeometry, Path, SRGBColorSpace,
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

/** A small repeating picture for a seat's top face: the party's colour with its pattern, or a pale hatch for a seat in the fog. */
function tile(base: string, pattern: (typeof PATTERNS)[number] | null, ink = '#000'): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d')!;
  g.fillStyle = base;
  g.fillRect(0, 0, 32, 32);
  const k = pattern?.kind ?? 'diag';
  g.strokeStyle = g.fillStyle = pattern?.ink ?? ink;
  g.globalAlpha = 0.45;
  g.lineWidth = 4;
  g.beginPath();
  if (k === 'vert' || k === 'hatch') { g.moveTo(16, 0); g.lineTo(16, 32); }
  if (k === 'horiz' || k === 'hatch') { g.moveTo(0, 16); g.lineTo(32, 16); }
  if (k === 'diag') { g.moveTo(-4, 36); g.lineTo(36, -4); g.moveTo(-20, 20); g.lineTo(20, -20); g.moveTo(12, 52); g.lineTo(52, 12); }
  if (k === 'back') { g.moveTo(-4, -4); g.lineTo(36, 36); g.moveTo(-20, 12); g.lineTo(20, 52); g.moveTo(12, -20); g.lineTo(52, 20); }
  g.stroke();
  if (k === 'dots') { g.beginPath(); g.arc(16, 16, 5, 0, Math.PI * 2); g.fill(); }
  const tex = new CanvasTexture(c);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

interface Block { id: string; index: number; state: string; mesh: Mesh; edges: LineSegments; height: number; goal: number }

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
  private pin: Group | null = null;
  private palette = isDark() ? NIGHT : DAY;
  private materials = new Map<string, Material>();
  private textures = new Map<string, CanvasTexture>();
  private disposables: { dispose(): void }[] = [];
  private focus: [number, number, number, number];
  private goal = { x: 0, z: 0, dist: 1 };
  private frame = 0;
  private last = 0;
  private flashes: { block: Block; until: number; mats: MeshLambertMaterial[] }[] = [];
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
    this.scene.add(this.backdrop, this.props, this.columns);

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

  private build() {
    const { shapes, seats, backdrop } = this.o;
    const make = (d: string) => {
      const parts = shapeParts(parseRings(d));
      const geos = parts.map((p) => {
        const s = new Shape(p.outer.map(([x, y]) => new Vector2(x, -y)));
        s.holes = p.holes.map((h) => new Path(h.map(([x, y]) => new Vector2(x, -y))));
        return s;
      });
      const geo = new ExtrudeGeometry(geos, { depth: 1, bevelEnabled: false, curveSegments: 1 });
      geo.rotateX(-Math.PI / 2);
      this.disposables.push(geo);
      return { geo, parts };
    };
    const lineMat = new LineBasicMaterial({ color: this.palette.line, transparent: true, opacity: 0.35 });
    this.disposables.push(lineMat);
    for (const id of backdrop) {
      const shape = shapes[id];
      if (!shape) continue;
      const { geo } = make(shape.d);
      const mat = new MeshLambertMaterial({ color: this.palette.backdrop });
      this.disposables.push(mat);
      const m = new Mesh(geo, mat);
      m.scale.y = 0.001 * this.size;
      this.backdrop.add(m);
    }
    for (const [index, seat] of seats.entries()) {
      const shape = shapes[seat.id];
      if (!shape) continue;
      const { geo, parts } = make(shape.d);
      const mesh = new Mesh(geo, [new MeshLambertMaterial(), new MeshLambertMaterial()]);
      const points: number[] = [];
      for (const part of parts) for (const ring of [part.outer, ...part.holes]) {
        for (let i = 0; i < ring.length; i++) {
          const a = ring[i], b = ring[(i + 1) % ring.length];
          points.push(a[0], 1.001, a[1], b[0], 1.001, b[1]);
        }
      }
      const eg = new BufferGeometry();
      eg.setAttribute('position', new Float32BufferAttribute(points, 3));
      this.disposables.push(eg);
      const edges = new LineSegments(eg, lineMat);
      mesh.add(edges);
      mesh.userData.seat = seat.id;
      const block: Block = { id: seat.id, index, state: seat.state, mesh, edges, height: 0.0001, goal: 0.0001 };
      mesh.scale.y = block.height;
      this.scene.add(mesh);
      this.blocks.push(block);
      this.byId.set(seat.id, block);
    }
  }

  // ---------- looks ----------

  private texture(key: string, make: () => CanvasTexture): CanvasTexture {
    let t = this.textures.get(key);
    if (!t) {
      t = make();
      t.repeat.set(1 / (this.size * 0.012), 1 / (this.size * 0.012));
      this.textures.set(key, t);
      this.disposables.push(t);
    }
    return t;
  }

  private material(key: string, make: () => Material): Material {
    let m = this.materials.get(key);
    if (!m) { m = make(); this.materials.set(key, m); this.disposables.push(m); }
    return m;
  }

  /** The top and side of a block, for how the seat is to look now. */
  private look(b: Block, d: SeatLook): [Material, Material] {
    const dim = this.selectedState !== null && b.state !== this.selectedState;
    const picked = b.id === this.selected;
    const hex = d.winner < 0 ? this.palette.undeclared : this.o.partyColor(d.winner);
    const fog = d.stale && d.winner >= 0;
    const colour = new Color(hex);
    if (fog) colour.lerp(new Color(this.palette.pale), 0.55);
    if (dim) colour.lerp(new Color(this.palette.pale), 0.6);
    if (picked) colour.lerp(new Color('#ffffff'), 0.3);
    const code = colour.getHexString();
    const patterned = d.winner >= 0 && (fog || this.accessible);
    const pattern = fog ? null : PATTERNS[d.winner % PATTERNS.length];
    const topKey = `top:${code}:${patterned ? (fog ? 'fog' : d.winner) : 'plain'}`;
    const top = this.material(topKey, () => new MeshLambertMaterial(patterned
      ? { map: this.texture(topKey, () => tile(`#${code}`, pattern, fog ? '#8a90a0' : '#000')) }
      : { color: colour }));
    const side = this.material(`side:${code}`, () => new MeshLambertMaterial({ color: colour.clone().multiplyScalar(0.72) }));
    return [top, side];
  }

  private paint(b: Block) {
    const d = this.display[b.index];
    if (!d) return;
    b.mesh.material = this.look(b, d);
    b.goal = seatHeight(d, this.size) * this.o.lift;
  }

  // ---------- what the game tells it ----------

  setDisplay(display: SeatLook[]) {
    this.display = display;
    this.blocks.forEach((b) => this.paint(b));
    if (this.o.calm) this.blocks.forEach((b) => { b.height = b.goal; b.mesh.scale.y = b.goal; });
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
      for (const t of this.textures.values()) t.repeat.set(1 / (size * 0.012), 1 / (size * 0.012));
      this.blocks.forEach((b) => this.paint(b));
      if (this.o.calm) this.blocks.forEach((b) => { b.height = b.goal; b.mesh.scale.y = b.goal; });
      this.setMarks(this.markSpecs.marks, this.markSpecs.pin);
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
    this.endFlash(b);
    const mats = (b.mesh.material as MeshLambertMaterial[]).map((m) => m.clone());
    b.mesh.material = mats;
    this.flashes.push({ block: b, until: performance.now() + 900, mats });
    this.refresh();
  }

  private endFlash(b: Block) {
    const f = this.flashes.find((x) => x.block === b);
    if (!f) return;
    f.mats.forEach((m) => m.dispose());
    this.flashes = this.flashes.filter((x) => x !== f);
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
      b.height = approach(b.height, b.goal, dt, 7);
      b.mesh.scale.y = Math.max(b.height, 1e-4);
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
      if (left <= 0) { this.paint(f.block); f.mats.forEach((m) => m.dispose()); return false; }
      f.mats.forEach((m) => m.emissive.set('#ffffff').multiplyScalar(0.7 * left));
      return true;
    });
    for (const g of this.props.children) { const b = this.byId.get(g.userData.seat as string); g.position.y = b ? b.mesh.scale.y : 0; }
    this.render();
    if (this.pointer) { this.hover(); this.pointer = null; }
    if (this.settle()) this.refresh();
  }

  private render() { this.renderer.render(this.scene, this.camera); }

  // ---------- picking ----------

  private pick(clientX: number, clientY: number): string | null {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.ray.setFromCamera(new Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), this.camera);
    this.scene.updateMatrixWorld();
    const hit = this.ray.intersectObjects(this.blocks.map((b) => b.mesh), false)[0];
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
