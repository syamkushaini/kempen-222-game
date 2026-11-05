import { useFrame, useLoader, type ThreeElements } from '@react-three/fiber';
import { useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { Box3, Group, Mesh, MeshPhysicalMaterial, Raycaster, SphereGeometry, Vector3 } from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { now, Offset, type ArmPose } from './clock';

// Two people who come as a single piece of mesh with no skeleton of their own: a man in a baju Melayu and songkok, and a woman in a tudung.
// They cannot raise an arm, so they are given life from outside: they sway, lean into their words, bob when the crowd cheers and roll along as
// they walk. See public/models/CREDITS.txt for who made them.

export type StaticId = 'baju' | 'tudung';

const MODELS: Record<StaticId, { file: string; height: number; badge: [number, number] }> = {
  // height in scene units, and where the party's rosette goes: [x, fraction of the height] on the chest, on the front
  baju: { file: 'baju-melayu.glb', height: 1.8, badge: [0.07, 0.76] },
  tudung: { file: 'tudung.glb', height: 1.66, badge: [0.1, 0.72] },
};
export const staticUrl = (id: StaticId): string => `${import.meta.env.BASE_URL}models/${MODELS[id].file}`;
const load = (loader: GLTFLoader) => { loader.setMeshoptDecoder(MeshoptDecoder); };
/** Starts fetching a model, so that it is there when the first scene wants it. */
export function preloadStatic(id: StaticId): void { try { useLoader.preload(GLTFLoader, staticUrl(id), load); } catch { /* the cartoon figure stands in */ } }

type G = ThreeElements['group'];

export function StaticFigure({ model, pose = 'down', walk = 0, talking = true, accent, phase = 0, scale = 1.15, ...rest }:
  { model: StaticId; pose?: ArmPose; walk?: number; talking?: boolean; accent: string; phase?: number; scale?: number } & G) {
  const gltf = useLoader(GLTFLoader, staticUrl(model), load);
  const cfg = MODELS[model];
  const built = useMemo(() => {
    const root = gltf.scene.clone(true);
    root.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh) {
        m.castShadow = true; m.receiveShadow = true;
        // the files do not say how metallic the cloth is, and glTF then means fully: it is not
        const mat = m.material as MeshPhysicalMaterial;
        mat.side = 0; mat.metalness = 0; mat.roughness = Math.max(mat.roughness, 0.6);
      }
    });
    root.updateMatrixWorld(true);
    const size = new Box3().setFromObject(root), h = size.max.y - size.min.y;
    const norm = cfg.height / Math.max(0.01, h), lift = -size.min.y;
    const r = h * 0.04;
    // the rosette: found on the chest by shooting a ray at the front of the clothes
    const y = size.min.y + h * cfg.badge[1];
    const hit = new Raycaster(new Vector3(cfg.badge[0], y, 3), new Vector3(0, 0, -1)).intersectObject(root, true)[0];
    const point = hit ? hit.point : new Vector3(cfg.badge[0], y, 0.1);
    const badge = new Group();
    badge.add(new Mesh(new SphereGeometry(r, 16, 12), new MeshPhysicalMaterial({ roughness: 0.4, clearcoat: 0.6 })));
    const heart = new Mesh(new SphereGeometry(r * 0.5, 12, 10), new MeshPhysicalMaterial({ color: '#f6ead2', roughness: 0.5 }));
    heart.position.set(0, 0, r * 0.7);
    badge.add(heart);
    badge.position.copy(point).add(new Vector3(0, 0, r * 0.2));
    root.add(badge);
    return { root, norm, lift, badge };
  }, [gltf, cfg]);
  useLayoutEffect(() => { ((built.badge.children[0] as Mesh).material as MeshPhysicalMaterial).color.set(accent); }, [built, accent]);
  const body = useRef<Group>(null);
  const off = useContext(Offset);
  const talk = useRef(0);
  useFrame((s, dt) => {
    const g = body.current; if (!g) return;
    const t = now(s.clock.elapsedTime, off) + phase;
    const want = talking ? 0.55 + 0.45 * Math.sin(t * 2.6) * Math.sin(t * 1.3 + 1) : 0;
    talk.current += (Math.max(0, want) - talk.current) * Math.min(1, dt * 8);
    const k = talk.current, step = Math.sin(t * 7);
    const cheer = pose === 'up' || pose === 'wave' ? Math.abs(Math.sin(t * 6)) * 0.04 : 0;
    g.position.y = walk * Math.abs(step) * 0.05 + cheer;
    g.rotation.z = Math.sin(t * 1.5) * 0.012 + walk * step * 0.04;
    g.rotation.x = 0.02 + k * 0.05 * (0.5 + 0.5 * Math.sin(t * 3.4)) + (pose === 'point' ? 0.05 : 0);
    g.rotation.y = Math.sin(t * 1.4) * 0.1 * (0.4 + k * 0.6) + (pose === 'wave' ? Math.sin(t * 2) * 0.12 : 0);
  });
  return (
    <group {...rest}>
      <group ref={body} scale={built.norm * scale}>
        <group position={[0, built.lift, 0]}><primitive object={built.root} /></group>
      </group>
    </group>
  );
}
