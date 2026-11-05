import { useFrame, useLoader, type ThreeElements } from '@react-three/fiber';
import { Component, useContext, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { Group, Mesh, MeshPhysicalMaterial, Quaternion, Raycaster, SphereGeometry, Vector3, type Bone, type Object3D } from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ease, now, Offset, type ArmPose } from './clock';

// The male politician: a man in a dark suit with a skeleton of the usual kind (hips, spine, neck, head, two arms with hands and fingers,
// two legs). The file has no motion in it, so every pose is made here: each frame the bones go back to their rest and the arms and legs are
// pointed where the pose wants them, the body breathes, and the head nods while he talks. See public/models/CREDITS.txt for who made it.

export const POLITICIAN_URL = `${import.meta.env.BASE_URL}models/politician.glb`;
const useGltf = () => useLoader(GLTFLoader, POLITICIAN_URL, (loader) => { loader.setMeshoptDecoder(MeshoptDecoder); });
/** Starts fetching the model, so that it is there when the first scene wants it. */
export function preloadPolitician(): void { try { useLoader.preload(GLTFLoader, POLITICIAN_URL, (loader) => { loader.setMeshoptDecoder(MeshoptDecoder); }); } catch { /* the cartoon figure stands in */ } }

/** The model's height in scene units at scale 1, the same as the cartoon figure's. */
const HEIGHT = 1.8;

type G = ThreeElements['group'];
const KEY = (name: string) => name.replace(/_\d+$/, '');

interface Rig {
  root: Object3D;
  bones: Record<string, Bone>;
  rest: [Bone, Quaternion][];
  /** The side of the body the +x axis of the model is: its 'Left' or 'Right'. */
  plus: 'Left' | 'Right';
  minus: 'Left' | 'Right';
  /** What to multiply the model's own units by to make it HEIGHT tall. */
  norm: number;
  shoulder: number;
  /** Where the party's rosette is pinned, in the space of the chest bone, and which way out of the jacket it faces. */
  badgeAt: Vector3;
  badgeOut: Vector3;
}

function buildRig(source: Object3D): Rig {
  const root = cloneSkinned(source);
  const bones: Record<string, Bone> = {};
  const rest: [Bone, Quaternion][] = [];
  root.traverse((o) => {
    if ((o as Bone).isBone) { bones[KEY(o.name)] = o as Bone; rest.push([o as Bone, o.quaternion.clone()]); }
    const m = o as Mesh;
    if (m.isMesh) {
      m.frustumCulled = false;        // the skin moves far from the pose its bounds were taken in
      const mat = m.material as MeshPhysicalMaterial;
      const glass = mat.transparent;
      m.castShadow = !glass; m.receiveShadow = true;
      if (!glass) { mat.side = 0; mat.roughness = Math.max(mat.roughness, 0.55); }
    }
  });
  root.updateMatrixWorld(true);
  const p = new Vector3(), q = new Vector3();
  const lx = bones.LeftArm.getWorldPosition(p).x, rx = bones.RightArm.getWorldPosition(q).x;
  const top = bones.HeadTop_End.getWorldPosition(p).y, foot = bones.LeftToe_End?.getWorldPosition(q).y ?? 0;
  const shoulder = Math.abs(lx - rx), sideSign = lx > rx ? 1 : -1;
  // the lapel: find the front of the jacket on the wearer's left breast by shooting a ray at it from in front, and pin the rosette there
  const chest = bones.Spine2.getWorldPosition(new Vector3());
  const from = chest.clone().add(new Vector3(sideSign * shoulder * 0.36, shoulder * 0.02, shoulder * 3));
  let outfit: Mesh | undefined;
  root.traverse((o) => { if ((o as Mesh).isMesh && /outfit/i.test(o.name)) outfit = o as Mesh; });
  const hit = outfit ? new Raycaster(from, new Vector3(0, 0, -1)).intersectObject(outfit, false)[0] : undefined;
  const point = hit ? hit.point.clone() : chest.clone().add(new Vector3(sideSign * shoulder * 0.36, 0, shoulder * 0.45));
  const out = new Vector3(0, 0, 1);
  const badgeAt = bones.Spine2.worldToLocal(point.clone());
  const badgeOut = bones.Spine2.worldToLocal(point.clone().add(out)).sub(badgeAt).normalize();
  return { root, bones, rest, plus: lx > rx ? 'Left' : 'Right', minus: lx > rx ? 'Right' : 'Left', norm: HEIGHT / Math.max(0.01, top - foot), shoulder, badgeAt, badgeOut };
}

// Working vectors, shared: nothing here allocates once the scene is running.
const qa = new Quaternion(), qb = new Quaternion(), qp = new Quaternion(), qg = new Quaternion();
const pa = new Vector3(), pb = new Vector3(), da = new Vector3(), dt = new Vector3(), ta = new Vector3();
const AX = new Vector3(1, 0, 0), AY = new Vector3(0, 1, 0), AZ = new Vector3(0, 0, 1);

/** Turns `bone` so that the line from it to `child` points along `dir` (in the group's own space). */
function aim(bone: Bone, child: Bone, dir: Vector3, gq: Quaternion) {
  bone.updateWorldMatrix(true, false); child.updateWorldMatrix(true, false);
  bone.getWorldPosition(pa); child.getWorldPosition(pb);
  da.subVectors(pb, pa).normalize();
  dt.copy(dir).normalize().applyQuaternion(gq);
  qa.setFromUnitVectors(da, dt);
  bone.getWorldQuaternion(qb).premultiply(qa);
  bone.parent!.getWorldQuaternion(qp);
  bone.quaternion.copy(qp.invert().multiply(qb));
  bone.updateMatrixWorld(true);
}
/** Turns `bone` about an axis (in the group's own space), from where it is. */
function turn(bone: Bone, axis: Vector3, angle: number, gq: Quaternion) {
  if (!angle) return;
  bone.updateWorldMatrix(true, false);
  ta.copy(axis).applyQuaternion(gq);
  qa.setFromAxisAngle(ta, angle);
  bone.getWorldQuaternion(qb).premultiply(qa);
  bone.parent!.getWorldQuaternion(qp);
  bone.quaternion.copy(qp.invert().multiply(qb));
  bone.updateMatrixWorld(true);
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);
const lerpV = (a: Vector3, b: Vector3, k: number, out: Vector3) => out.copy(a).lerp(b, k);
const sway = (t: number, f: number, p = 0) => Math.sin(t * f + p);

/** Where each arm points in each pose: [upper arm, forearm], for the arm on the +x side (`s` = 1) or the −x side (`s` = −1). */
function armTargets(pose: ArmPose, s: number, role: 'main' | 'other', t: number, talking: number, upper: Vector3, fore: Vector3) {
  const side = s;
  const relaxU = v(side * 0.1, -1, 0.04), relaxF = v(side * 0.05, -1, 0.42);
  const k = ease(t, 0.05, 0.75);
  let u = relaxU, f = relaxF;
  if (pose === 'wave' && role === 'main') { u = v(side * 0.78, 0.5, 0.12); f = v(side * 0.35 + sway(t, 8.2) * 0.55, 1, 0.12); }
  else if (pose === 'up') { u = v(side * 0.55, 0.84, 0.1); f = v(side * 0.2 + sway(t, 6.4, side) * 0.14, 1, 0.04); }
  else if (pose === 'point' && role === 'main') { u = v(side * 0.55, 0.08, 0.82); f = v(side * 0.5, 0.1 + sway(t, 5) * 0.03, 0.86); }
  else if (pose === 'clap') { const c = 0.5 + 0.5 * Math.sin(t * 9 + (side > 0 ? 0 : Math.PI)); u = v(side * 0.28, -0.55, 0.78); f = v(-side * (0.1 + 0.4 * c), 0.1, 1); }
  else if (role === 'other' || pose === 'down') {
    // Talking: the free hand gestures a little, in time with the words
    f = v(side * (0.05 + 0.25 * talking * (0.5 + 0.5 * sway(t, 3.1, side))), -1 + 0.5 * talking * (0.5 + 0.5 * sway(t, 4.3 + side)), 0.42 + 0.35 * talking * (0.5 + 0.5 * sway(t, 3.7)));
  }
  lerpV(relaxU, u, k, upper); lerpV(relaxF, f, k, fore);
}

function pose(rig: Rig, t: number, p: { pose: ArmPose; walk: number; talking: number; gq: Quaternion }) {
  const { bones: b, plus, minus } = rig;
  for (const [bone, q] of rig.rest) bone.quaternion.copy(q);
  rig.root.updateMatrixWorld(true);
  const gq = p.gq, breathe = sway(t, 1.7), step = sway(t, 7), walk = p.walk;
  // hips and spine: a breath, a lean into the words, a roll with each step
  turn(b.Hips, AY, sway(t, 2.0) * 0.04 + walk * step * 0.09, gq);
  turn(b.Spine1, AX, 0.03 + breathe * 0.012 + p.talking * 0.03 * (0.5 + 0.5 * sway(t, 3.4)), gq);
  turn(b.Spine2, AY, -walk * step * 0.07 + p.talking * sway(t, 2.2) * 0.05, gq);
  // collar bones down a little, so that the jacket does not pinch when the arms come down
  const pu = new Vector3(), pf = new Vector3();
  for (const [name, s, role] of [[plus, 1, 'main'], [minus, -1, 'other']] as const) {
    turn(b[`${name}Shoulder`], AZ, -s * 0.2, gq);
    armTargets(p.pose, s, role, t, p.talking, pu, pf);
    // arms swing against the legs while walking, except the one that is waving to the crowd
    if (walk > 0 && !(p.pose === 'wave' && role === 'main')) {
      const sw = -step * 0.55 * walk * s;
      pu.set(s * 0.1, -Math.cos(sw), Math.sin(sw)); pf.set(s * 0.06, -Math.cos(sw + 0.3 * walk), Math.sin(sw + 0.3 * walk) + 0.1);
    }
    aim(b[`${name}Arm`], b[`${name}ForeArm`], pu, gq);
    aim(b[`${name}ForeArm`], b[`${name}Hand`], pf, gq);
  }
  // the head: nods and turns while he talks, steady otherwise, eyes on the crowd
  turn(b.Neck, AX, p.talking * (sway(t, 6.3) * 0.05 + 0.02) + breathe * 0.006, gq);
  turn(b.Head, AY, sway(t, 1.4) * 0.12 * (0.4 + p.talking * 0.6), gq);
  turn(b.Head, AX, p.talking * sway(t, 5.2, 1) * 0.04, gq);
  if (walk > 0) {
    // the legs: thigh forward, shin folding back as the foot lifts
    for (const [name, s] of [[plus, 1], [minus, -1]] as const) {
      const a = Math.sin(t * 7 + (s > 0 ? 0 : Math.PI)) * 0.55 * walk;
      const knee = Math.max(0, -Math.cos(t * 7 + (s > 0 ? 0 : Math.PI))) * 0.6 * walk;
      aim(b[`${name}UpLeg`], b[`${name}Leg`], v(0, -Math.cos(a), Math.sin(a)), gq);
      aim(b[`${name}Leg`], b[`${name}Foot`], v(0, -Math.cos(a - knee), Math.sin(a - knee)), gq);
    }
  }
  rig.root.updateMatrixWorld(true);
}

export function Politician({ pose: armPose = 'down', walk = 0, talking = true, accent, phase = 0, scale = 1.15, ...rest }:
  { pose?: ArmPose; walk?: number; talking?: boolean; accent: string; phase?: number; scale?: number } & G) {
  const gltf = useGltf();
  const rig = useMemo(() => buildRig(gltf.scene), [gltf]);
  const box = useRef<Group>(null);
  const off = useContext(Offset);
  const talk = useRef(0);
  // the party's colour: a rosette pinned to the lapel, carried by the chest as it moves: a ring of its colour round a cream centre
  const badge = useMemo(() => {
    const r = rig.shoulder * 0.04;
    const g = new Group();
    g.add(new Mesh(new SphereGeometry(r, 16, 12), new MeshPhysicalMaterial({ roughness: 0.4, clearcoat: 0.6 })));
    const heart = new Mesh(new SphereGeometry(r * 0.5, 12, 10), new MeshPhysicalMaterial({ color: '#f6ead2', roughness: 0.5 }));
    heart.position.copy(rig.badgeOut).multiplyScalar(r * 0.7);
    g.add(heart);
    g.position.copy(rig.badgeAt).addScaledVector(rig.badgeOut, r * 0.2);
    return g;
  }, [rig]);
  useLayoutEffect(() => {
    const chest = rig.bones.Spine2;
    chest.add(badge);
    return () => { chest.remove(badge); };
  }, [rig, badge]);
  useLayoutEffect(() => { ((badge.children[0] as Mesh).material as MeshPhysicalMaterial).color.set(accent); }, [badge, accent]);
  useFrame((s, dtime) => {
    const g = box.current; if (!g) return;
    const t = now(s.clock.elapsedTime, off) + phase;
    // speech comes and goes: the head and hands follow
    const want = talking ? 0.55 + 0.45 * Math.sin(t * 2.6) * Math.sin(t * 1.3 + 1) : 0;
    talk.current += (Math.max(0, want) - talk.current) * Math.min(1, dtime * 8);
    g.updateWorldMatrix(true, true);
    g.getWorldQuaternion(qg);
    pose(rig, t, { pose: armPose, walk, talking: talk.current, gq: qg });
  });
  return (
    <group {...rest}>
      <group ref={box} scale={rig.norm * scale}>
        <primitive object={rig.root} />
      </group>
    </group>
  );
}

/** If the model cannot be fetched or read, whatever stands in for it is shown and the scene goes on. */
export class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { /* nothing to report: the cartoon figure stands in */ }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
