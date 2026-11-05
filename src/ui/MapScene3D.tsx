import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useCallback, useEffect, useMemo, useRef, useState, type ElementRef, type RefObject } from 'react';
import {
  BoxGeometry, ConeGeometry, CylinderGeometry, Group, OctahedronGeometry, PerspectiveCamera, Raycaster, SphereGeometry, TorusGeometry, Vector2, Vector3,
} from 'three';
import type { Mark } from '../sim/campaign/marks';
import { useStore } from '../state/store';
import { useT } from './hooks';
import { approach, fitDistance, offerPicture, seatHeight } from './map3d';
import { pinchFactor } from './mapGesture';
import {
  buildBackdrop, buildLand, DAY, isDark, liftBlock, NIGHT, patternMaterial, tintBlock,
  type ColumnSpec, type LookContext, type MapShape, type PinSpec, type SceneSeat, type SeatLook,
} from './mapLand';

type Box = [number, number, number, number];

export interface MapScene3DProps {
  shapes: Record<string, MapShape>;
  seats: SceneSeat[];
  backdrop: string[];
  home: Box;
  focus: Box;
  display: SeatLook[];
  selectedSeat: string | null;
  selectedState: string | null;
  accessible: boolean;
  marks: Mark[];
  /** The marks the ticked map layers put on seats, and the tint the player's branches give them. */
  pins: PinSpec[];
  heat: Record<string, number> | null;
  pin: Box | null;
  pulse: { id: string; n: number } | null;
  /** Support by region as columns standing on the map, while the poll is open. */
  columns: ColumnSpec[] | null;
  label: string;
  single: boolean;
  partyColor: (party: number) => string;
  onPick(id: string): void;
  onHover(id: string | null, x: number, y: number): void;
}

const FOV = 35;
const TILT = 0.95; // radians from straight down: about 54 degrees

/** What the buttons beside the map, and the result card, ask of the scene. */
interface Rig { zoomBy(factor: number): void; reset(): void; snapshot(): string }

// ---------- what stands on the land ----------

function Marks({ marks, shapes, u, partyColor, group }: { marks: Mark[]; shapes: Record<string, MapShape>; u: number; partyColor: (party: number) => string; group: RefObject<Group | null> }) {
  const geo = useMemo(() => ({
    tent: new ConeGeometry(0.9 * u, 1.3 * u, 4),
    pole: new CylinderGeometry(0.08 * u, 0.08 * u, 2 * u, 5),
    cloth: new BoxGeometry(1.1 * u, 0.7 * u, 0.06 * u),
    // A small flat poster stuck on the seat, visible at any zoom.
    poster: new BoxGeometry(0.7 * u, 0.5 * u, 0.04 * u),
  }), [u]);
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);
  return (
    <group ref={group}>
      {marks.map((m, i) => {
        const shape = shapes[m.seat];
        if (!shape) return null;
        const [x0, y0, x1, y1] = shape.bbox;
        const paint = <meshLambertMaterial color={partyColor(m.party)} />;
        return (
          <group key={i} position={[(x0 + x1) / 2 + (m.slot - (m.of - 1) / 2) * 1.6 * u, 0, (y0 + y1) / 2]} userData={{ seat: m.seat }}>
            {m.kind === 'tent' && <mesh geometry={geo.tent} position-y={0.65 * u}>{paint}</mesh>}
            {m.kind === 'poster' && <mesh geometry={geo.poster} position-y={0.35 * u}>{paint}</mesh>}
            {m.kind !== 'tent' && m.kind !== 'poster' && (
              <>
                <mesh geometry={geo.pole} position-y={u}><meshLambertMaterial color="#d8d2c4" /></mesh>
                <mesh geometry={geo.cloth} position={[0.6 * u, 1.65 * u, 0]}>{paint}</mesh>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}

/** The marks the ticked layers put on seats. They stand on the seat's block, a little in front of the tents. */
function Pins({ pins, shapes, u, group }: { pins: PinSpec[]; shapes: Record<string, MapShape>; u: number; group: RefObject<Group | null> }) {
  const geo = useMemo(() => ({
    ring: new TorusGeometry(0.62 * u, 0.13 * u, 6, 20).rotateX(Math.PI / 2),
    dot: new SphereGeometry(0.42 * u, 12, 8),
    square: new BoxGeometry(0.8 * u, 0.3 * u, 0.8 * u),
    diamond: new OctahedronGeometry(0.55 * u),
    down: new ConeGeometry(0.62 * u, 1 * u, 3).rotateX(Math.PI),
    up: new ConeGeometry(0.62 * u, 1 * u, 3),
    hex: new CylinderGeometry(0.55 * u, 0.55 * u, 0.4 * u, 6),
    flag: new ConeGeometry(0.34 * u, 1.2 * u, 4),
    dotCore: new SphereGeometry(0.24 * u, 10, 6),
  }), [u]);
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);
  return (
    <group ref={group}>
      {pins.map((pin, i) => {
        const shape = shapes[pin.seat];
        if (!shape) return null;
        const [x0, y0, x1, y1] = shape.bbox;
        const mat = <meshLambertMaterial color={pin.color} />;
        return (
          <group key={i} position={[(x0 + x1) / 2 + (pin.slot - (pin.of - 1) / 2) * 1.5 * u, 0, (y0 + y1) / 2 + 1.1 * u]} userData={{ seat: pin.seat, lift: 0.55 * u }}>
            {pin.kind === 'bullseye'
              ? <><mesh geometry={geo.ring}>{mat}</mesh><mesh geometry={geo.dotCore}>{mat}</mesh></>
              : <mesh geometry={geo[pin.kind]}>{mat}</mesh>}
          </group>
        );
      })}
    </group>
  );
}

/** The flag-pin that stands on a contest's place on the map. */
function Flagpole({ pin, u }: { pin: Box; u: number }) {
  const theme = useStore((s) => s.settings.theme);
  // The party's own colour, from the page; white where there is none.
  const colour = useMemo(() => {
    const c = getComputedStyle(document.documentElement).getPropertyValue('--party').trim();
    return c.startsWith('#') ? c : '#ffffff';
  }, [theme]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group position={[(pin[0] + pin[2]) / 2, 0, (pin[1] + pin[3]) / 2]}>
      <mesh position-y={2.5 * u}><cylinderGeometry args={[0.12 * u, 0.12 * u, 5 * u, 6]} /><meshLambertMaterial color={colour} /></mesh>
      <mesh position-y={5.4 * u}><sphereGeometry args={[0.9 * u, 12, 8]} /><meshLambertMaterial color={colour} /></mesh>
    </group>
  );
}

/** Columns of support by region, rising out of the map while the poll is open and sinking when it is closed. */
function Columns({ cols, size, lift, group }: { cols: ColumnSpec[]; size: number; lift: number; group: RefObject<Group | null> }) {
  const wide = size * 0.035, tall = size * 0.2, base = size * 0.03 * lift;
  return (
    <group ref={group}>
      {cols.map((col, i) => {
        let y = base;
        return col.parts.map((part, j) => {
          const h = Math.max(part.share * tall, 1e-4);
          const at = y + h / 2;
          y += h;
          return <mesh key={`${i}-${j}`} position={[col.x, at, col.z]}><boxGeometry args={[wide, h, wide]} /><meshLambertMaterial color={part.color} /></mesh>;
        });
      })}
    </group>
  );
}

// ---------- the scene ----------

function MapWorld({ p, calm, rig }: { p: MapScene3DProps; calm: boolean; rig: RefObject<Rig | null> }) {
  const { gl, scene, invalidate, size: viewport } = useThree();
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const controls = useRef<ElementRef<typeof OrbitControls>>(null);
  const theme = useStore((s) => s.settings.theme);
  // Taps, hovers and colours go to whoever is current, without rebuilding the scene.
  const latest = useRef(p);
  latest.current = p;

  const palette = useMemo(() => (isDark() ? NIGHT : DAY), [theme]); // eslint-disable-line react-hooks/exhaustive-deps
  /** Width or height of the area on show: heights, tiles and markers are in proportion to it, so they follow the camera into a state. */
  const size = Math.max(p.focus[2] - p.focus[0], p.focus[3] - p.focus[1], 1e-6);
  const u = size * 0.012;
  const lift = p.single ? 4 : 1; // a one-seat contest has nothing to compare heights with, so its seat is given more of a rise

  // The land is built again only for a different contest or map: everything else changes it in place.
  const seatsKey = p.seats.map((s) => s.id).join();
  const land = useMemo(() => buildLand(p.shapes, p.seats, size), [p.shapes, seatsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => land.dispose(), [land]);
  const backdrop = useMemo(() => buildBackdrop(p.shapes, p.backdrop), [p.shapes, p.backdrop]);
  useEffect(() => () => backdrop?.dispose(), [backdrop]);
  const tile = useMemo(() => ({ value: 1 }), []);
  tile.value = u;
  const material = useMemo(() => patternMaterial(tile), [tile]);
  useEffect(() => () => material.dispose(), [material]);

  const look = useRef<LookContext>(null!);
  look.current = {
    display: p.display, palette, partyColor: (party) => latest.current.partyColor(party),
    selected: p.selectedSeat, selectedState: p.selectedState, accessible: p.accessible, heat: p.heat,
  };

  // What the seats are doing: heights, and the seats that are flashing.
  const flashes = useRef<{ id: string; until: number }[]>([]);
  const marksGroup = useRef<Group>(null), pinsGroup = useRef<Group>(null), columnsGroup = useRef<Group>(null);
  const rise = useRef(0), riseGoal = useRef(0);
  const [cols, setCols] = useState<ColumnSpec[] | null>(p.columns);

  useEffect(() => {
    for (const b of land.blocks) {
      const d = p.display[b.index];
      if (!d) continue;
      tintBlock(land, b, look.current);
      b.goal = seatHeight(d, size) * lift;
      if (calm) liftBlock(land, b, b.goal, size);
    }
    invalidate();
  }, [land, p.display, p.selectedSeat, p.selectedState, p.accessible, p.heat, palette, size, lift, calm, invalidate]);

  useEffect(() => { invalidate(); }, [p.marks, p.pins, p.pin, size, invalidate]);

  useEffect(() => {
    if (p.columns) { setCols(p.columns); riseGoal.current = 1; if (calm) rise.current = 1; }
    else { riseGoal.current = 0; if (calm) { rise.current = 0; setCols(null); } }
    if (columnsGroup.current) columnsGroup.current.scale.y = Math.max(rise.current, 1e-4);
    invalidate();
  }, [p.columns, calm, invalidate]);
  useEffect(() => { if (columnsGroup.current) columnsGroup.current.scale.y = Math.max(rise.current, 1e-4); }, [cols]);

  // A seat has just been declared: it flashes, so the eye is taken to it.
  useEffect(() => {
    if (!p.pulse || calm) return;
    flashes.current = flashes.current.filter((f) => f.id !== p.pulse!.id);
    flashes.current.push({ id: p.pulse.id, until: performance.now() + 900 });
    invalidate();
  }, [p.pulse?.n]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- camera ----------

  const goal = useRef({ x: 0, z: 0, dist: 1 });
  const aspect = () => Math.max(0.1, viewport.width / Math.max(1, viewport.height));
  const fitFor = (box: Box) => {
    // The towers add a little to the depth, whichever way they lean.
    return fitDistance(box[2] - box[0], box[3] - box[1] + size * 0.04, aspect(), FOV, TILT, 1);
  };

  const snap = () => {
    const c = controls.current;
    if (!c) return;
    const off = new Vector3().subVectors(camera.position, c.target);
    c.target.set(goal.current.x, 0, goal.current.z);
    camera.position.copy(c.target).add(off.setLength(goal.current.dist));
    camera.lookAt(c.target);
    invalidate();
  };

  /** Aims the camera at the focus box, keeping whatever angle the player has turned the map to. */
  const fit = (now: boolean) => {
    const c = controls.current;
    if (!c) return;
    const f = p.focus, h = p.home;
    goal.current = { x: (f[0] + f[2]) / 2, z: (f[1] + f[3]) / 2, dist: fitFor(f) };
    c.minDistance = goal.current.dist * 0.08;
    c.maxDistance = fitFor(h) * 1.6;
    if (now || calm) snap(); else invalidate();
  };

  const setAngles = (azimuth: number, polar: number) => {
    const c = controls.current;
    if (!c) return;
    c.target.set(goal.current.x, 0, goal.current.z);
    const d = goal.current.dist, t = c.target;
    camera.position.set(t.x + d * Math.sin(polar) * Math.sin(azimuth), d * Math.cos(polar), t.z + d * Math.sin(polar) * Math.cos(azimuth));
    camera.lookAt(t);
    c.update();
  };

  const zoomBy = (factor: number) => {
    const c = controls.current;
    if (!c) return;
    const off = new Vector3().subVectors(camera.position, c.target);
    const len = Math.min(c.maxDistance, Math.max(c.minDistance, off.length() / factor));
    camera.position.copy(c.target).add(off.setLength(len));
    goal.current.dist = len;
    invalidate();
  };

  /** The player may pan, but not off the country. */
  const clampTarget = () => {
    const c = controls.current;
    if (!c) return;
    const h = p.home, t = c.target;
    const px = (h[2] - h[0]) * 0.1, pz = (h[3] - h[1]) * 0.1;
    const x = Math.min(h[2] + px, Math.max(h[0] - px, t.x)), z = Math.min(h[3] + pz, Math.max(h[1] - pz, t.z));
    if (x !== t.x || z !== t.z) { camera.position.x += x - t.x; camera.position.z += z - t.z; t.x = x; t.z = z; }
  };

  /** A picture of the map for the result card: the whole contest from the usual angle, whatever the player was looking at. */
  const snapshot = () => {
    const c = controls.current;
    if (!c) return '';
    const pos = camera.position.clone(), aim = c.target.clone();
    const h = p.home;
    const x = (h[0] + h[2]) / 2, z = (h[1] + h[3]) / 2, d = fitFor(h) * 0.82;
    camera.position.set(x, d * Math.cos(TILT), z + d * Math.sin(TILT));
    camera.lookAt(x, 0, z);
    gl.render(scene, camera);
    const data = gl.domElement.toDataURL('image/png');
    camera.position.copy(pos);
    camera.lookAt(aim);
    gl.render(scene, camera);
    return data;
  };

  // The buttons and the result card reach the scene through this, always the current one.
  const api: Rig = { zoomBy, reset: () => { fit(true); setAngles(0, TILT); invalidate(); }, snapshot };
  rig.current = api;
  const apiRef = useRef(api);
  apiRef.current = api;
  useEffect(() => {
    const withdraw = offerPicture(() => apiRef.current.snapshot());
    return () => { withdraw(); rig.current = null; };
  }, [rig]);
  // Where the tests can reach it: a development server only.
  useEffect(() => { if (import.meta.env.DEV) (window as unknown as { __map3d?: unknown }).__map3d = { rig: apiRef.current, camera, land }; }, [camera, land]);

  // A different map is framed from the usual angle; a different window or focus keeps the angle the player has chosen.
  useEffect(() => { fit(true); setAngles(0, TILT); }, [land]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fit(true); }, [viewport.width, viewport.height]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fit(false); }, [p.focus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Whatever the player does with the map becomes the place the camera stays, so nothing pulls it back.
  const onChange = useRef(() => {});
  onChange.current = () => {
    const c = controls.current;
    if (!c) return;
    clampTarget();
    goal.current = { x: c.target.x, z: c.target.z, dist: camera.position.distanceTo(c.target) };
    invalidate();
  };
  const changed = useCallback(() => onChange.current(), []);

  // ---------- touch, taps and hovers ----------

  useEffect(() => {
    const el = gl.domElement;
    const ray = new Raycaster();
    const fingers = new Map<number, { x: number; y: number }>();
    let spread = 0, down: { x: number; y: number } | null = null, pointer: { x: number; y: number } | null = null, frame = 0;
    const fingerSpread = () => {
      const [a, b] = [...fingers.values()];
      return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
    };
    const pick = (clientX: number, clientY: number): string | null => {
      const r = el.getBoundingClientRect();
      ray.setFromCamera(new Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), camera);
      // The seats' own shapes are never drawn; they are kept at each seat's height for the ray to find.
      const hit = ray.intersectObjects(land.blocks.map((b) => b.pick), false)[0];
      return hit ? (hit.object.userData.seat as string) : null;
    };
    const hover = () => {
      frame = 0;
      if (!pointer) return;
      const id = pick(pointer.x, pointer.y);
      const r = el.getBoundingClientRect();
      latest.current.onHover(id, pointer.x - r.left, pointer.y - r.top);
      pointer = null;
    };
    const on = <K extends keyof HTMLElementEventMap>(type: K, fn: (e: HTMLElementEventMap[K]) => void, opts?: AddEventListenerOptions) => {
      el.addEventListener(type, fn, opts);
      return () => el.removeEventListener(type, fn);
    };
    const lift = (e: PointerEvent) => {
      fingers.delete(e.pointerId);
      spread = fingers.size >= 2 ? fingerSpread() : 0;
    };
    const off = [
      // A plain scroll belongs to the page; Ctrl or Cmd zooms, as on the flat map.
      on('wheel', (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); apiRef.current.zoomBy(e.deltaY < 0 ? 1.2 : 1 / 1.2); } }, { passive: false }),
      on('pointerdown', (e) => {
        down = { x: e.clientX, y: e.clientY };
        fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        // A second finger makes it a pinch, not a tap.
        if (fingers.size >= 2) { down = null; spread = fingerSpread(); }
      }),
      on('pointercancel', lift),
      on('pointerup', (e) => {
        lift(e);
        const d = down;
        down = null;
        if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) return;
        const id = pick(e.clientX, e.clientY);
        if (id) latest.current.onPick(id);
      }),
      on('pointermove', (e) => {
        // Two fingers zoom the map, as the buttons do.
        if (fingers.has(e.pointerId)) {
          fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (fingers.size >= 2) {
            const now = fingerSpread();
            const factor = pinchFactor(spread, now);
            spread = now;
            if (factor !== 1) apiRef.current.zoomBy(factor);
          }
        }
        if (e.buttons) { latest.current.onHover(null, 0, 0); return; }
        pointer = { x: e.clientX, y: e.clientY };
        if (!frame) frame = requestAnimationFrame(hover);
      }),
      on('pointerleave', () => { pointer = null; latest.current.onHover(null, 0, 0); }),
    ];
    return () => { cancelAnimationFrame(frame); off.forEach((fn) => fn()); };
  }, [gl, camera, land]);

  // ---------- every frame ----------

  useFrame((_, delta) => {
    const c = controls.current;
    if (!c) return;
    const dt = Math.min(0.1, delta) || 1 / 60;
    for (const b of land.blocks) {
      if (b.height === b.goal) continue;
      liftBlock(land, b, approach(b.height, b.goal, dt, 7), size);
    }
    // The camera glides to its goal unless the player is holding it.
    const t = c.target, g = goal.current;
    const gx = approach(t.x, g.x, dt, 6), gz = approach(t.z, g.z, dt, 6);
    const off = new Vector3().subVectors(camera.position, t);
    const len = approach(off.length(), g.dist, dt, 6);
    t.x = gx; t.z = gz;
    camera.position.copy(t).add(off.setLength(len));
    camera.lookAt(t);
    if (rise.current !== riseGoal.current) {
      rise.current = approach(rise.current, riseGoal.current, dt, 6);
      if (Math.abs(rise.current - riseGoal.current) < 1e-3) rise.current = riseGoal.current;
      if (columnsGroup.current) columnsGroup.current.scale.y = Math.max(rise.current, 1e-4);
      if (rise.current === 0) setCols(null);
    }
    // Flashing seats lighten and settle back.
    const stamp = performance.now();
    flashes.current = flashes.current.filter((f) => {
      const b = land.byId.get(f.id);
      const left = (f.until - stamp) / 900;
      if (b) tintBlock(land, b, look.current, Math.max(0, 0.6 * left));
      return left > 0;
    });
    // What stands on a seat follows it up and down.
    for (const m of marksGroup.current?.children ?? []) { const b = land.byId.get(m.userData.seat as string); m.position.y = b ? Math.max(b.height, 0) : 0; }
    for (const m of pinsGroup.current?.children ?? []) { const b = land.byId.get(m.userData.seat as string); m.position.y = (b ? Math.max(b.height, 0) : 0) + (m.userData.lift as number); }
    const moving = rise.current !== riseGoal.current || flashes.current.length > 0 || land.blocks.some((b) => b.height !== b.goal)
      || Math.abs(t.x - g.x) > 1e-3 * size || Math.abs(t.z - g.z) > 1e-3 * size || Math.abs(camera.position.distanceTo(t) - g.dist) > 1e-3 * size;
    if (moving) invalidate();
  });

  return (
    <>
      <hemisphereLight args={[0xffffff, 0x8890a0, 1.35]} />
      <ambientLight intensity={0.15} />
      <directionalLight intensity={1.5} position={[-0.5, 1, 0.7]} />

      {/* The seats rise and fall, so what is in view is not worked out from where they began. */}
      <mesh geometry={land.geometry} material={material} frustumCulled={false} />
      <lineSegments geometry={land.outline} frustumCulled={false}>
        <lineBasicMaterial color={palette.line} transparent opacity={0.35} />
      </lineSegments>
      {backdrop && <mesh geometry={backdrop}><meshLambertMaterial color={palette.backdrop} /></mesh>}

      <Marks marks={p.marks} shapes={p.shapes} u={u} partyColor={p.partyColor} group={marksGroup} />
      {p.pin && <Flagpole pin={p.pin} u={u} />}
      <Pins pins={p.pins} shapes={p.shapes} u={u} group={pinsGroup} />
      {cols && <Columns cols={cols} size={size} lift={lift} group={columnsGroup} />}

      <OrbitControls
        ref={controls} makeDefault onChange={changed} enableDamping={false}
        enableZoom={false /* a plain scroll belongs to the page; Ctrl or Cmd zooms, as on the flat map */}
        minPolarAngle={0.1} maxPolarAngle={1.3} minAzimuthAngle={-0.8} maxAzimuthAngle={0.8} screenSpacePanning={false}
      />
    </>
  );
}

/** The 3D map: a canvas that draws what the game's own state says, and hands taps and hovers back to it. Fetched only when 3D is on. */
export default function MapScene3DView(props: MapScene3DProps) {
  const t = useT();
  const rig = useRef<Rig | null>(null);
  const calm = useMemo(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  return (
    <>
      <div className="map3d" role="img" aria-label={props.label}>
        <Canvas
          // flat: no tone mapping, as the map had before it moved to react-three-fiber, so the party colours come out as chosen
          flat frameloop="demand" dpr={[1, 2]} style={{ touchAction: 'none' }}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
          camera={{ fov: FOV, near: 0.01, far: 100000 }}
        >
          <MapWorld p={props} calm={calm} rig={rig} />
        </Canvas>
      </div>
      <div className="map-zoom-buttons" role="group" aria-label={t('map.zoom')}>
        <button className="btn small" onClick={() => rig.current?.zoomBy(1.6)} aria-label={t('map.zoomIn')}>+</button>
        <button className="btn small" onClick={() => rig.current?.zoomBy(1 / 1.6)} aria-label={t('map.zoomOut')}>−</button>
        <button className="btn small" onClick={() => rig.current?.reset()} aria-label={t('map.zoomFit')}>⤢</button>
      </div>
    </>
  );
}
