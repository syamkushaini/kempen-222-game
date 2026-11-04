import { useFrame, type ThreeElements } from '@react-three/fiber';
import { createContext, useContext, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { Color, Object3D, type Group, type InstancedMesh } from 'three';
import { Bust } from '../Bust3D';
import type { Look } from '../faces';

// The pieces the action scenes are built from: people, a crowd, a platform, flags, coins and the like. Everything is a plain low-poly shape
// with one flat colour, and everything moves from one clock, so a scene is a handful of these set out and given a script.

/** The scene's clock: normally the time since it began; a gallery or a test may hold it still at one moment (`freeze`). */
export interface StageTime { freeze: number | null }
export const Offset = createContext<StageTime>({ freeze: null });
/** The time in seconds into the scene. */
export const now = (elapsed: number, o: StageTime): number => o.freeze ?? elapsed;

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
/** A smooth rise from 0 at `a` to 1 at `b`. */
export const ease = (t: number, a: number, b: number) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
/** A rise and fall: 0 before `a`, 1 between `b` and `c`, 0 after `d`. */
export const span = (t: number, a: number, b: number, c: number, d: number) => ease(t, a, b) * (1 - ease(t, c, d));
/** A number from 0 to 1 that depends only on the seed. */
export const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

type G = ThreeElements['group'];

/** A group that is moved from the clock: `f` gets the time in seconds and the group. */
export function Anim({ f, children, ...rest }: { f(t: number, g: Group): void; children?: ReactNode } & G) {
  const ref = useRef<Group>(null);
  const off = useContext(Offset);
  useFrame((s) => { if (ref.current) f(now(s.clock.elapsedTime, off), ref.current); });
  return <group ref={ref} {...rest}>{children}</group>;
}

export const Mat = ({ c, e = 0, op = 1 }: { c: string; e?: number; op?: number }) =>
  <meshLambertMaterial color={c} emissive={e ? c : '#000000'} emissiveIntensity={e} transparent={op < 1} opacity={op} />;

export const Box = ({ s, c, e, op, ...rest }: { s: [number, number, number]; c: string; e?: number; op?: number } & ThreeElements['mesh']) =>
  <mesh {...rest}><boxGeometry args={s} /><Mat c={c} e={e} op={op} /></mesh>;
export const Ball = ({ r, c, e, op, ...rest }: { r: number; c: string; e?: number; op?: number } & ThreeElements['mesh']) =>
  <mesh {...rest}><sphereGeometry args={[r, 14, 10]} /><Mat c={c} e={e} op={op} /></mesh>;

export type ArmPose = 'down' | 'wave' | 'up' | 'point' | 'clap';

/** A person: legs, a body, arms and a head (or whatever `head` is). 1.8 units tall at scale 1. */
export function Figure({ color = '#3b82f6', skin = '#e2b088', pants = '#2b3140', arms = 'down', walk = 0, cheer = 0, phase = 0, head, headY = 1.62, scale = 1, ...rest }:
  { color?: string; skin?: string; pants?: string; arms?: ArmPose; walk?: number; cheer?: number; phase?: number; head?: ReactNode; headY?: number; scale?: number } & G) {
  const legL = useRef<Group>(null), legR = useRef<Group>(null), armL = useRef<Group>(null), armR = useRef<Group>(null), root = useRef<Group>(null);
  const off = useContext(Offset);
  useFrame((s) => {
    const t = now(s.clock.elapsedTime, off) + phase;
    const w = Math.sin(t * 7) * 0.7 * walk;
    if (legL.current) legL.current.rotation.x = w;
    if (legR.current) legR.current.rotation.x = -w;
    if (root.current) root.current.position.y = (walk ? Math.abs(Math.sin(t * 7)) * 0.05 : 0) + cheer * Math.abs(Math.sin(t * 5.5)) * 0.22;
    const L = armL.current, R = armR.current;
    if (!L || !R) return;
    if (arms === 'wave') { R.rotation.z = Math.PI - 0.5 + Math.sin(t * 8) * 0.45; L.rotation.z = 0.1; }
    else if (arms === 'up') { R.rotation.z = Math.PI - 0.3 + Math.sin(t * 6) * 0.15; L.rotation.z = -Math.PI + 0.3 - Math.sin(t * 6 + 1) * 0.15; }
    else if (arms === 'point') { R.rotation.z = Math.PI / 2 + 0.2; R.rotation.x = -0.6 + Math.sin(t * 5) * 0.1; L.rotation.z = 0.1; }
    else if (arms === 'clap') { R.rotation.z = 0.5 + Math.sin(t * 9) * 0.25; L.rotation.z = -0.5 - Math.sin(t * 9) * 0.25; R.rotation.x = L.rotation.x = -0.9; }
    else { R.rotation.z = -0.12 - Math.sin(t * 7) * 0.4 * walk; L.rotation.z = 0.12 + Math.sin(t * 7) * 0.4 * walk; }
  });
  return (
    <group scale={scale} {...rest}>
      <group ref={root}>
        <group ref={legL} position={[-0.1, 0.52, 0]}><Box s={[0.15, 0.52, 0.15]} c={pants} position={[0, -0.26, 0]} /></group>
        <group ref={legR} position={[0.1, 0.52, 0]}><Box s={[0.15, 0.52, 0.15]} c={pants} position={[0, -0.26, 0]} /></group>
        <mesh position={[0, 0.97, 0]}><capsuleGeometry args={[0.2, 0.5, 4, 10]} /><Mat c={color} /></mesh>
        <group ref={armL} position={[-0.27, 1.3, 0]}><mesh position={[0, -0.22, 0]}><capsuleGeometry args={[0.06, 0.34, 3, 8]} /><Mat c={color} /></mesh><Ball r={0.07} c={skin} position={[0, -0.48, 0]} /></group>
        <group ref={armR} position={[0.27, 1.3, 0]}><mesh position={[0, -0.22, 0]}><capsuleGeometry args={[0.06, 0.34, 3, 8]} /><Mat c={color} /></mesh><Ball r={0.07} c={skin} position={[0, -0.48, 0]} /></group>
        {head ?? <Ball r={0.19} c={skin} position={[0, headY, 0]} />}
      </group>
    </group>
  );
}

/** The player's leader on the stage: a full figure with the 3D head the game draws everywhere else, talking while the scene runs. */
export function Hero({ look, accent, talking = true, arms = 'wave', scale = 1.15, walk = 0, ...rest }: { look: Look; accent: string; talking?: boolean; arms?: ArmPose; scale?: number; walk?: number } & G) {
  return (
    <Figure
      color={look.wear === 'suit' ? '#2b3140' : accent} arms={arms} scale={scale} walk={walk}
      head={<group position={[0, 1.55, 0]} scale={0.205}><Bust look={look} accent={accent} calm={false} talking={talking} /></group>}
      {...rest}
    />
  );
}

/** Many people at once, drawn as two instanced shapes: they jump when they cheer. */
export function Crowd({ n, area, colors, cheer = 0.8, seed = 1, scale = 0.5, cheerFrom = 0.8 }: { n: number; area: [number, number, number, number]; colors: string[]; cheer?: number; seed?: number; scale?: number; cheerFrom?: number }) {
  const bodies = useRef<InstancedMesh>(null), heads = useRef<InstancedMesh>(null);
  const off = useContext(Offset);
  const spots = useMemo(() => Array.from({ length: n }, (_, i) => ({
    x: area[0] + rnd(seed + i * 3.1) * (area[1] - area[0]), z: area[2] + rnd(seed + i * 5.7) * (area[3] - area[2]),
    ph: rnd(seed + i * 7.3) * 6.3, sp: 4 + rnd(seed + i * 2.3) * 3, k: Math.floor(rnd(seed + i * 9.1) * colors.length),
    h: 0.85 + rnd(seed + i * 1.9) * 0.3,
    at: rnd(seed + i * 4.4) * 0.8,
  })), [n, area, seed, colors.length]);
  const dummy = useMemo(() => new Object3D(), []);
  useLayoutEffect(() => {
    spots.forEach((p, i) => { bodies.current?.setColorAt(i, new Color(colors[p.k])); heads.current?.setColorAt(i, new Color(['#e2b088', '#c98d62', '#f1cda8', '#9c6644'][i % 4])); });
    for (const m of [bodies.current, heads.current]) if (m?.instanceColor) m.instanceColor.needsUpdate = true;
  }, [spots, colors]);
  useFrame((s) => {
    const t = now(s.clock.elapsedTime, off);
    const up = ease(t, cheerFrom - 0.4, cheerFrom + 0.4);
    spots.forEach((p, i) => {
      const j = cheer * up * Math.abs(Math.sin(t * p.sp + p.ph)) * 0.3;
      // Arriving: each person drops in and grows to full size at their own moment.
      const k = Math.max(0.001, ease(t, p.at, p.at + 0.35));
      const drop = (1 - k) * 0.6;
      dummy.position.set(p.x, (0.97 * scale * p.h) * k + j + drop, p.z); dummy.scale.set(scale * k, scale * p.h * k, scale * k); dummy.updateMatrix();
      bodies.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(p.x, 1.6 * scale * p.h * k + j + drop, p.z); dummy.scale.setScalar(scale * k); dummy.updateMatrix();
      heads.current?.setMatrixAt(i, dummy.matrix);
    });
    if (bodies.current) bodies.current.instanceMatrix.needsUpdate = true;
    if (heads.current) heads.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={bodies} args={[undefined, undefined, n]}><capsuleGeometry args={[0.2, 0.5, 3, 8]} /><meshLambertMaterial color="#ffffff" /></instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, n]}><sphereGeometry args={[0.19, 10, 8]} /><meshLambertMaterial color="#ffffff" /></instancedMesh>
    </>
  );
}

/** The ground the scene stands on. */
export const Ground = ({ c = '#b9c9a8', r = 30, y = 0 }: { c?: string; r?: number; y?: number }) =>
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} userData={{ ground: true }}><circleGeometry args={[r, 64]} /><Mat c={c} /></mesh>;

/** A raised platform with steps, for a speaker. */
export const Platform = ({ c = '#8d6e4a', w = 4.2, d = 2, ...rest }: { c?: string; w?: number; d?: number } & G) =>
  <group {...rest}><Box s={[w, 0.3, d]} c={c} position={[0, 0.15, 0]} /><Box s={[w * 0.5, 0.15, 0.5]} c={c} position={[0, 0.075, d / 2 + 0.25]} /></group>;

/** A banner hung behind a speaker, in the party's colour, with a star on it. */
export function Banner({ c, w = 4.2, h = 1.5, ...rest }: { c: string; w?: number; h?: number } & G) {
  return (
    <group {...rest}>
      <Box s={[w, h, 0.08]} c={c} position={[0, h / 2, 0]} />
      <Box s={[w + 0.2, 0.08, 0.1]} c="#e8e3d8" position={[0, h, 0]} />
      <mesh position={[0, h / 2, 0.07]}><circleGeometry args={[h * 0.28, 5]} /><Mat c="#fbf7ee" /></mesh>
    </group>
  );
}

/** A flag on a pole, rippling. */
export function Flag({ c, phase = 0, ...rest }: { c: string; phase?: number } & G) {
  return (
    <group {...rest}>
      <Box s={[0.05, 1.5, 0.05]} c="#e8e3d8" position={[0, 0.75, 0]} />
      <Anim f={(t, g) => { g.rotation.y = Math.sin(t * 6 + phase) * 0.25; }} position={[0.02, 1.25, 0]}><Box s={[0.7, 0.42, 0.03]} c={c} position={[0.35, 0, 0]} /></Anim>
    </group>
  );
}

/** A ring that grows and fades, over and over: sound, a signal, a call. */
export function Wave({ c = '#ffffff', every = 1.2, count = 3, max = 2.6, ...rest }: { c?: string; every?: number; count?: number; max?: number } & G) {
  return (
    <Anim f={(t, g) => g.children.forEach((m, i) => { const x = ((t / every) + i / count) % 1; m.scale.setScalar(0.15 + x * max); (((m as unknown as { material: { opacity: number } }).material).opacity) = (1 - x) * 0.55; })} {...rest}>
      {Array.from({ length: count }, (_, i) => <mesh key={i}><torusGeometry args={[1, 0.03, 6, 36]} /><meshBasicMaterial color={c} transparent opacity={0.5} /></mesh>)}
    </Anim>
  );
}

/** A speech bubble: an oval with a tail, and a mark inside it ("!" or "?") made of two shapes. */
export function Bubble({ mark = '!', c = '#ffffff', ink = '#1f1f26', ...rest }: { mark?: '!' | '?'; c?: string; ink?: string } & G) {
  return (
    <group {...rest}>
      <mesh scale={[1.25, 0.9, 0.3]}><sphereGeometry args={[0.32, 18, 12]} /><Mat c={c} /></mesh>
      <mesh position={[-0.18, -0.34, 0]} rotation={[0, 0, 0.6]} scale={[1, 1, 0.3]}><coneGeometry args={[0.1, 0.22, 3]} /><Mat c={c} /></mesh>
      {mark === '!' ? (
        <>
          <Box s={[0.07, 0.26, 0.08]} c={ink} position={[0, 0.05, 0.1]} />
          <Ball r={0.045} c={ink} position={[0, -0.14, 0.1]} />
        </>
      ) : (
        <>
          <mesh position={[0, 0.07, 0.1]} rotation={[0, 0, -Math.PI / 2]}><torusGeometry args={[0.09, 0.035, 6, 12, Math.PI * 1.5]} /><Mat c={ink} /></mesh>
          <Ball r={0.045} c={ink} position={[0, -0.14, 0.1]} />
        </>
      )}
    </group>
  );
}

/** A coin, standing on its edge. */
export const Coin = (p: G) => <group {...p}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.03, 16]} /><Mat c="#f2c230" e={0.25} /></mesh></group>;

/** A heart, made of two balls and a cone. */
export const Heart = ({ c = '#ec4899', ...p }: { c?: string } & G) => (
  <group {...p}><Ball r={0.07} c={c} position={[-0.055, 0.03, 0]} /><Ball r={0.07} c={c} position={[0.055, 0.03, 0]} /><mesh position={[0, -0.04, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.115, 0.14, 4]} /><Mat c={c} /></mesh></group>
);

/** A house: walls, a roof, a door and a window. `open` swings the door. */
export function House({ c = '#e8dcc4', roof = '#a24b3a', open, ...rest }: { c?: string; roof?: string; open?: (t: number) => number } & G) {
  return (
    <group {...rest}>
      <Box s={[1.5, 1.1, 1.2]} c={c} position={[0, 0.55, 0]} />
      <mesh position={[0, 1.4, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.2, 1, 0.95]}><coneGeometry args={[1.1, 0.6, 4]} /><Mat c={roof} /></mesh>
      <Box s={[0.3, 0.3, 0.05]} c="#bcd9ea" position={[0.45, 0.65, 0.61]} />
      <Anim f={(t, g) => { g.rotation.y = -(open?.(t) ?? 0) * 1.3; }} position={[-0.2, 0, 0.61]}><Box s={[0.34, 0.7, 0.05]} c="#7b5a3a" position={[0.17, 0.35, 0]} /></Anim>
    </group>
  );
}

/** A little tree. */
export const Tree = (p: G) => <group {...p}><Box s={[0.18, 0.8, 0.18]} c="#6b4a2f" position={[0, 0.4, 0]} /><Ball r={0.55} c="#4f8a4a" position={[0, 1.1, 0]} /><Ball r={0.38} c="#5da158" position={[0.25, 1.4, 0.1]} /></group>;
