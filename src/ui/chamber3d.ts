import {
  AmbientLight, BoxGeometry, Color, DirectionalLight, HemisphereLight, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, MeshLambertMaterial,
  PerspectiveCamera, Raycaster, Scene, Vector2, Vector3, WebGLRenderer,
} from 'three';
import { pitch, type Member, type Place } from './hemicycle';
import { approach } from './map3d';

// The House in 3D: one block for each seat on tiered benches, seen from one fixed place. Blocks slide to their new seats
// when a party crosses the floor, rise to vote Aye and sink to vote No. It draws what it is told and reports what is pointed at.

export interface ChamberOptions {
  partyColor: (party: number) => string;
  calm: boolean;
  onHot(party: number | null): void;
}

interface Block { key: string; party: number; pos: Vector3; goal: Vector3; lift: number; liftGoal: number; colour: Color }

const FOV = 32;
const AYE = new Color('#2fbf71'), NO = new Color('#e5484d'), WAVER = new Color('#d9a441');

const dark = () => {
  const root = document.documentElement.dataset.theme;
  return root ? root === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
};

export class Chamber3D {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(FOV, 2, 0.01, 100);
  private ray = new Raycaster();
  private blocks = new Map<string, Block>();
  private order: Block[] = [];
  private mesh: InstancedMesh | null = null;
  private wall: Mesh;
  private size = 0.03;
  private hot: number | null = null;
  private frame = 0;
  private last = 0;
  private ro: ResizeObserver;
  private cleanup: (() => void)[] = [];
  private pointer: { x: number; y: number } | null = null;
  private members: Member[] = [];

  constructor(private box: HTMLElement, private o: ChamberOptions) {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    box.appendChild(this.renderer.domElement);
    this.scene.add(new HemisphereLight(0xffffff, 0x8890a0, 1.3), new AmbientLight(0xffffff, 0.2));
    const sun = new DirectionalLight(0xffffff, 1.4);
    sun.position.set(-0.4, 1, 0.8);
    this.scene.add(sun);
    this.wall = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: dark() ? '#ffffff' : '#111111', transparent: true, opacity: 0.8 }));
    this.scene.add(this.wall);

    const el = this.renderer.domElement;
    const move = (e: PointerEvent) => { this.pointer = { x: e.clientX, y: e.clientY }; this.refresh(); };
    const leave = () => { this.pointer = null; this.o.onHot(null); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerdown', move);
    el.addEventListener('pointerleave', leave);
    this.cleanup.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerdown', move); el.removeEventListener('pointerleave', leave); });

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(box);
    this.resize();
  }

  /** Where a seat is in the room: benches step up toward the back, and the open side faces the camera. */
  private spot(p: Place): Vector3 {
    return new Vector3(p.x, p.row * this.size * 0.55, -p.y);
  }

  /** Seats everyone. A member already in the room walks to its new seat; a new one appears in it. */
  set(places: Place[], members: Member[], line: number) {
    this.members = members;
    const size = pitch(places.length) * 0.78;
    const rebuilt = size !== this.size || members.length !== this.order.length;
    this.size = size;
    const next = new Map<string, Block>();
    this.order = members.map((m, i) => {
      const key = `${m.party}:${m.k}`;
      const goal = this.spot(places[i]);
      const b = this.blocks.get(key) ?? { key, party: m.party, pos: goal.clone(), goal, lift: 0, liftGoal: 0, colour: new Color() };
      b.goal = goal;
      next.set(key, b);
      return b;
    });
    this.blocks = next;
    if (rebuilt) this.build();
    // The majority line: a thin wall from the front bench to the back, at the seat that makes a majority.
    const angle = Math.PI * (1 - line);
    const inner = 0.3, outer = 1.08, mid = (inner + outer) / 2;
    this.wall.scale.set(outer - inner, this.size * 7, this.size * 0.22);
    this.wall.position.set(Math.cos(angle) * mid, this.size * 3.2, -Math.sin(angle) * mid);
    this.wall.rotation.y = angle;
    this.paint();
    if (this.o.calm) this.order.forEach((b) => { b.pos.copy(b.goal); b.lift = b.liftGoal; });
    this.refresh();
  }

  setHot(party: number | null) {
    if (party === this.hot) return;
    this.hot = party;
    this.paint();
    this.refresh();
  }

  private build() {
    if (this.mesh) { this.scene.remove(this.mesh); this.mesh.geometry.dispose(); (this.mesh.material as MeshLambertMaterial).dispose(); this.mesh.dispose(); }
    const s = this.size;
    const geo = new BoxGeometry(s, s * 1.5, s);
    geo.translate(0, s * 0.75, 0);
    this.mesh = new InstancedMesh(geo, new MeshLambertMaterial(), Math.max(1, this.order.length));
    this.scene.add(this.mesh);
  }

  /** Colour and height for every block: its party, lifted when its party is pointed at, raised or sunk by its vote. */
  private paint() {
    this.order.forEach((b, i) => {
      const m = this.members[i];
      b.colour.set(this.o.partyColor(b.party));
      if (m.vote === 'aye') b.colour.lerp(AYE, 0.35);
      if (m.vote === 'no') b.colour.lerp(NO, 0.35).multiplyScalar(0.7);
      if (m.vote === 'waver') b.colour.lerp(WAVER, 0.3);
      if (this.hot !== null && this.hot !== b.party) b.colour.multiplyScalar(0.45);
      if (m.hidden) b.colour.multiplyScalar(0.18);
      b.liftGoal = (m.hidden ? -1.2 : m.vote === 'aye' ? 1.2 : m.vote === 'no' ? -0.9 : 0) * this.size + (this.hot === b.party ? 0.9 * this.size : 0);
    });
  }

  private resize() {
    const w = this.box.clientWidth, h = this.box.clientHeight;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // One fixed view from above the front of the chamber, pulled back far enough for the whole half circle at this shape of picture.
    const half = Math.tan((FOV * Math.PI) / 360);
    const dist = Math.max(1.36 / (half * this.camera.aspect), 0.7 / half);
    const aim = new Vector3(0, 0.05, -0.5);
    this.camera.position.set(0, dist * 0.78, aim.z + dist * 0.63);
    this.camera.lookAt(aim);
    this.camera.updateProjectionMatrix();
    this.draw();
  }

  private moving(): boolean {
    return this.order.some((b) => b.lift !== b.liftGoal || !b.pos.equals(b.goal));
  }

  private refresh() {
    if (!this.frame) this.frame = requestAnimationFrame((t) => this.tick(t));
  }

  private tick(now: number) {
    this.frame = 0;
    const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 1 / 60;
    this.last = now;
    for (const b of this.order) {
      b.pos.set(approach(b.pos.x, b.goal.x, dt, 5), approach(b.pos.y, b.goal.y, dt, 5), approach(b.pos.z, b.goal.z, dt, 5));
      b.lift = approach(b.lift, b.liftGoal, dt, 8);
      if (Math.abs(b.lift - b.liftGoal) < 1e-5) b.lift = b.liftGoal;
      if (b.pos.distanceTo(b.goal) < 1e-5) b.pos.copy(b.goal);
    }
    this.draw();
    if (this.pointer) { this.o.onHot(this.pick(this.pointer.x, this.pointer.y)); this.pointer = null; }
    if (this.moving()) this.refresh(); else this.last = 0;
  }

  private draw() {
    const mesh = this.mesh;
    if (!mesh) return;
    const m = new Matrix4();
    this.order.forEach((b, i) => {
      m.makeTranslation(b.pos.x, b.pos.y + b.lift, b.pos.z);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, b.colour);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    this.renderer.render(this.scene, this.camera);
  }

  private pick(clientX: number, clientY: number): number | null {
    if (!this.mesh) return null;
    const r = this.renderer.domElement.getBoundingClientRect();
    this.ray.setFromCamera(new Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), this.camera);
    const hit = this.ray.intersectObject(this.mesh, false)[0];
    return hit?.instanceId !== undefined ? (this.order[hit.instanceId]?.party ?? null) : null;
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    this.ro.disconnect();
    this.cleanup.forEach((fn) => fn());
    if (this.mesh) { this.mesh.geometry.dispose(); (this.mesh.material as MeshLambertMaterial).dispose(); this.mesh.dispose(); }
    this.wall.geometry.dispose();
    (this.wall.material as MeshBasicMaterial).dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
