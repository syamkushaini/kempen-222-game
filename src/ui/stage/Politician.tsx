import { useFrame, useLoader, type ThreeElements } from '@react-three/fiber';
import { useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { Group, Mesh, MeshPhysicalMaterial, Quaternion, Raycaster, SphereGeometry, Vector3, type Bone, type Object3D } from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ease, now, Offset, type ArmPose } from './clock';

// The politicians: a man in a dark suit, a woman in a trouser suit and a rival in a three-piece with a skeleton of the usual kind (hips, spine, neck, head, two arms with hands and fingers,
// two legs). The file has no motion in it, so every pose is made here: each frame the bones go back to their rest and the arms and legs are
// pointed where the pose wants them, the body breathes, and the head nods while he talks. See public/models/CREDITS.txt for who made it.

/** Which politician: the man in the suit, the woman in the trouser suit, or the rival in the three-piece. */
export type PoliticianId = 'male' | 'female' | 'rival';

/** The names of the bones the animator moves, which differ from one skeleton to the next (`S` is 'Left' or 'Right'). */
interface Names {
  hips: string; spine1: string; chest: string; neck: string; head: string; headTop: string;
  /** The tip of a toe, for the height of the feet; none when the soles are already at the floor. */
  toe?: string; jaw?: string;
  /** The cloth is made of open sheets that must be seen from both sides. */
  twoSided?: boolean;
  shoulder: (s: string) => string; arm: (s: string) => string; fore: (s: string) => string; hand: (s: string) => string;
  up: (s: string) => string; leg: (s: string) => string; foot: (s: string) => string;
}
const MIXAMO: Names = {
  hips: 'Hips', spine1: 'Spine1', chest: 'Spine2', neck: 'Neck', head: 'Head', headTop: 'HeadTop_End', toe: 'LeftToe_End',
  shoulder: (s) => `${s}Shoulder`, arm: (s) => `${s}Arm`, fore: (s) => `${s}ForeArm`, hand: (s) => `${s}Hand`,
  up: (s) => `${s}UpLeg`, leg: (s) => `${s}Leg`, foot: (s) => `${s}Foot`,
};
const MODELS: Record<PoliticianId, { file: string; names: Names }> = {
  male: { file: 'politician.glb', names: MIXAMO },
  rival: { file: 'rival.glb', names: MIXAMO },
  female: {
    file: 'politician-female.glb',
    names: {
      hips: 'Pelvis', spine1: 'Spine1', chest: 'Spine3', neck: 'Neck', head: 'Head', headTop: 'Head_Tip', jaw: 'jaw', twoSided: true,
      shoulder: (s) => `${s}_Shoulder`, arm: (s) => `${s}_Arm`, fore: (s) => `${s}_ForeArm`, hand: (s) => `${s}_Hand`,
      up: (s) => `${s}_thigh`, leg: (s) => `${s}_shin`, foot: (s) => `${s}_ankle`,
    },
  },
};
export const modelUrl = (id: PoliticianId): string => `${import.meta.env.BASE_URL}models/${MODELS[id].file}`;
export const POLITICIAN_URL = modelUrl('male');
const useGltf = (id: PoliticianId) => useLoader(GLTFLoader, modelUrl(id), (loader) => { loader.setMeshoptDecoder(MeshoptDecoder); });
/** Starts fetching a model, so that it is there when the first scene wants it. */
export function preloadPolitician(id: PoliticianId = 'male'): void { try { useLoader.preload(GLTFLoader, modelUrl(id), (loader) => { loader.setMeshoptDecoder(MeshoptDecoder); }); } catch { /* the cartoon figure stands in */ } }

/** The model's height in scene units at scale 1, the same as the cartoon figure's. */
const HEIGHT = 1.8;

type G = ThreeElements['group'];
const KEY = (name: string) => name.replace(/_\d+$/, '');

interface Rig {
  root: Object3D;
  n: Names;
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

const lifted = new WeakSet<object>();

function buildRig(source: Object3D, n: Names): Rig {
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
      if (!glass) { if (!n.twoSided) mat.side = 0;
        // the jacket's cloth, one material shared by dozens of pieces, is lifted once: it reads too dark under the stage lights
        else if (/sherpa|fleece/i.test(mat.name) && !lifted.has(mat)) { lifted.add(mat); mat.normalMap = null; mat.color.multiplyScalar(2); }
        mat.roughness = Math.max(mat.roughness, 0.55); }
    }
  });
  root.updateMatrixWorld(true);
  const p = new Vector3(), q = new Vector3();
  const lx = bones[n.arm('Left')].getWorldPosition(p).x, rx = bones[n.arm('Right')].getWorldPosition(q).x;
  const top = bones[n.headTop].getWorldPosition(p).y, foot = (n.toe ? bones[n.toe]?.getWorldPosition(q).y : 0) ?? 0;
  const shoulder = Math.abs(lx - rx), sideSign = lx > rx ? 1 : -1;
  // the lapel: find the front of the jacket on the wearer's left breast by shooting a ray at it from in front, and pin the rosette there
  const chest = bones[n.chest].getWorldPosition(new Vector3());
  const from = chest.clone().add(new Vector3(sideSign * shoulder * 0.36, shoulder * 0.02, shoulder * 3));
  const outfit: Mesh[] = [];
  root.traverse((o) => { if ((o as Mesh).isMesh && /outfit_top|outfit$|pattern/i.test(o.name)) outfit.push(o as Mesh); });
  const hit = outfit.length ? new Raycaster(from, new Vector3(0, 0, -1)).intersectObjects(outfit, false)[0] : undefined;
  const point = hit ? hit.point.clone() : chest.clone().add(new Vector3(sideSign * shoulder * 0.36, 0, shoulder * 0.45));
  const out = new Vector3(0, 0, 1);
  const badgeAt = bones[n.chest].worldToLocal(point.clone());
  const badgeOut = bones[n.chest].worldToLocal(point.clone().add(out)).sub(badgeAt).normalize();
  return { root, n, bones, rest, plus: lx > rx ? 'Left' : 'Right', minus: lx > rx ? 'Right' : 'Left', norm: HEIGHT / Math.max(0.01, top - foot), shoulder, badgeAt, badgeOut };
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
  const { bones: b, plus, minus, n } = rig;
  for (const [bone, q] of rig.rest) bone.quaternion.copy(q);
  rig.root.updateMatrixWorld(true);
  const gq = p.gq, breathe = sway(t, 1.7), step = sway(t, 7), walk = p.walk;
  // hips and spine: a breath, a lean into the words, a roll with each step
  turn(b[n.hips], AY, sway(t, 2.0) * 0.04 + walk * step * 0.09, gq);
  turn(b[n.spine1], AX, 0.03 + breathe * 0.012 + p.talking * 0.03 * (0.5 + 0.5 * sway(t, 3.4)), gq);
  turn(b[n.chest], AY, -walk * step * 0.07 + p.talking * sway(t, 2.2) * 0.05, gq);
  // collar bones down a little, so that the jacket does not pinch when the arms come down
  const pu = new Vector3(), pf = new Vector3();
  for (const [name, s, role] of [[plus, 1, 'main'], [minus, -1, 'other']] as const) {
    turn(b[n.shoulder(name)], AZ, -s * 0.2, gq);
    armTargets(p.pose, s, role, t, p.talking, pu, pf);
    // arms swing against the legs while walking, except the one that is waving to the crowd
    if (walk > 0 && !(p.pose === 'wave' && role === 'main')) {
      const sw = -step * 0.55 * walk * s;
      pu.set(s * 0.1, -Math.cos(sw), Math.sin(sw)); pf.set(s * 0.06, -Math.cos(sw + 0.3 * walk), Math.sin(sw + 0.3 * walk) + 0.1);
    }
    aim(b[n.arm(name)], b[n.fore(name)], pu, gq);
    aim(b[n.fore(name)], b[n.hand(name)], pf, gq);
  }
  // the head: nods and turns while he talks, steady otherwise, eyes on the crowd
  turn(b[n.neck], AX, p.talking * (sway(t, 6.3) * 0.05 + 0.02) + breathe * 0.006, gq);
  turn(b[n.head], AY, sway(t, 1.4) * 0.12 * (0.4 + p.talking * 0.6), gq);
  turn(b[n.head], AX, p.talking * sway(t, 5.2, 1) * 0.04, gq);
  // the mouth opens and closes with the words, on a model that has a jaw
  if (n.jaw && b[n.jaw]) turn(b[n.jaw], AX, p.talking * (0.5 + 0.5 * sway(t, 17)) * 0.22, gq);
  if (walk > 0) {
    // the legs: thigh forward, shin folding back as the foot lifts
    for (const [name, s] of [[plus, 1], [minus, -1]] as const) {
      const a = Math.sin(t * 7 + (s > 0 ? 0 : Math.PI)) * 0.55 * walk;
      const knee = Math.max(0, -Math.cos(t * 7 + (s > 0 ? 0 : Math.PI))) * 0.6 * walk;
      aim(b[n.up(name)], b[n.leg(name)], v(0, -Math.cos(a), Math.sin(a)), gq);
      aim(b[n.leg(name)], b[n.foot(name)], v(0, -Math.cos(a - knee), Math.sin(a - knee)), gq);
    }
  }
  rig.root.updateMatrixWorld(true);
}

export function Politician({ model = 'male', pose: armPose = 'down', walk = 0, talking = true, accent, phase = 0, scale = 1.15, ...rest }:
  { model?: PoliticianId; pose?: ArmPose; walk?: number; talking?: boolean; accent: string; phase?: number; scale?: number } & G) {
  const gltf = useGltf(model);
  const rig = useMemo(() => buildRig(gltf.scene, MODELS[model].names), [gltf, model]);
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
    const chest = rig.bones[rig.n.chest];
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
