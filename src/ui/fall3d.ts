import { Body, Box, Plane, Vec3, World } from 'cannon-es';
import {
  AmbientLight, BoxGeometry, Color, DirectionalLight, HemisphereLight, InstancedMesh, Matrix4, MeshLambertMaterial, PerspectiveCamera, Quaternion,
  Scene, Vector3, WebGLRenderer,
} from 'three';
import { pitch, type Member, type Place } from './hemicycle';

// The one moment in the game given to a physics engine: a government loses the House, and its benches come down. The
// chamber stands as it was for a breath; then the government's blocks are let go, and fall and scatter as real things would.

const FOV = 32;
/** The chamber is a unit across, which is too small for a physics engine to be steady in: the room is built ten times larger. */
const ROOM = 10;

export class Fall3D {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(FOV, 2, 0.05, 500);
  private world = new World({ gravity: new Vec3(0, -14, 0) });
  private bodies: Body[] = [];
  private mesh: InstancedMesh;
  private frame = 0;
  private last = 0;
  private let = false;
  private ro: ResizeObserver;

  constructor(private box: HTMLElement, places: Place[], members: Member[], partyColor: (p: number) => string) {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    box.appendChild(this.renderer.domElement);
    this.scene.add(new HemisphereLight(0xffffff, 0x8890a0, 1.3), new AmbientLight(0xffffff, 0.2));
    const sun = new DirectionalLight(0xffffff, 1.4);
    sun.position.set(-0.4, 1, 0.8);
    this.scene.add(sun);

    const s = pitch(places.length) * 0.78 * ROOM;
    const geo = new BoxGeometry(s, s * 1.5, s);
    this.mesh = new InstancedMesh(geo, new MeshLambertMaterial(), Math.max(1, members.length));
    this.scene.add(this.mesh);

    const floor = new Body({ mass: 0, shape: new Plane() });
    floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(floor);
    this.world.allowSleep = true;
    const shape = new Box(new Vec3(s / 2, s * 0.75, s / 2));
    const colour = new Color();
    members.forEach((m, i) => {
      const p = places[i];
      // Everyone starts where they sat. Only the government's benches are loose; the rest of the House does not move.
      const body = new Body({ mass: m.side === 'left' ? 1 : 0, shape, position: new Vec3(p.x * ROOM, p.row * s * 0.55 + s * 0.75, -p.y * ROOM) });
      body.sleepSpeedLimit = 0.4;
      body.linearDamping = 0.05;
      body.angularDamping = 0.2;
      if (m.side === 'left') body.sleep();
      this.world.addBody(body);
      this.bodies.push(body);
      colour.set(partyColor(m.party));
      if (m.side !== 'left') colour.multiplyScalar(0.5);
      this.mesh.setColorAt(i, colour);
    });

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(box);
    this.resize();
  }

  /** Lets the government's benches go: each block is knocked a little, up and outward, and the engine does the rest. */
  release() {
    if (this.let) return;
    this.let = true;
    let n = 0;
    for (const b of this.bodies) {
      if (b.mass === 0) continue;
      // The same knocks every time, spread by a fixed pattern, so the moment looks alike wherever it is seen.
      const a = (n++ * 2.399963) % (Math.PI * 2);
      b.wakeUp();
      b.velocity.set(Math.cos(a) * 1.6 - 1.2, 3.2 + (n % 5) * 0.5, Math.sin(a) * 1.6 + 1.4);
      b.angularVelocity.set(Math.sin(a * 3) * 5, Math.cos(a * 2) * 5, Math.sin(a) * 5);
    }
    this.last = 0;
    if (!this.frame) this.frame = requestAnimationFrame((t) => this.tick(t));
  }

  private resize() {
    const w = this.box.clientWidth, h = this.box.clientHeight;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    const half = Math.tan((FOV * Math.PI) / 360);
    const dist = Math.max(1.6 / (half * this.camera.aspect), 0.9 / half) * ROOM;
    const aim = new Vector3(0, 0.05 * ROOM, -0.5 * ROOM);
    this.camera.position.set(0, dist * 0.78, aim.z + dist * 0.63);
    this.camera.lookAt(aim);
    this.camera.updateProjectionMatrix();
    this.draw();
  }

  private tick(now: number) {
    this.frame = 0;
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 1 / 60;
    this.last = now;
    this.world.step(1 / 60, dt, 3);
    this.draw();
    if (this.bodies.some((b) => b.mass > 0 && b.sleepState !== Body.SLEEPING)) this.frame = requestAnimationFrame((t) => this.tick(t));
  }

  private draw() {
    const m = new Matrix4(), q = new Quaternion(), v = new Vector3(), one = new Vector3(1, 1, 1);
    this.bodies.forEach((b, i) => {
      v.set(b.position.x, b.position.y, b.position.z);
      q.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w);
      this.mesh.setMatrixAt(i, m.compose(v, q, one));
    });
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    this.ro.disconnect();
    this.mesh.geometry.dispose();
    (this.mesh.material as MeshLambertMaterial).dispose();
    this.mesh.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
