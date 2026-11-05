import { useFrame, useLoader, type ThreeElements } from '@react-three/fiber';
import { useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { Color, Mesh, MeshStandardMaterial, type Material, type Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { now, Offset } from './clock';

// The polling booth of the get-out-the-vote scene: a table with a cardboard screen on three sides, a pencil on a string, a ballot paper and
// a stamp. It is a plain 1,100-triangle model; the stamp takes the party's colour and comes down each time a voter marks a ballot.

export const VOTING_BOOTH_URL = `${import.meta.env.BASE_URL}models/voting-booth.glb`;
export const preloadVotingBooth = (): void => { try { useLoader.preload(GLTFLoader, VOTING_BOOTH_URL); } catch { /* the scene goes on without it */ } };

type G = ThreeElements['group'];
const materialOf = (m: Mesh): Material => (Array.isArray(m.material) ? m.material[0] : m.material);

/** The booth, with `marks` (seconds) at which a voter stamps their ballot: the stamp comes down at each. */
export function VotingBoothModel({ accent, marks = [], ...rest }: { accent: string; marks?: number[] } & G) {
  const gltf = useLoader(GLTFLoader, VOTING_BOOTH_URL);
  const off = useContext(Offset);
  const stamp = useRef<Mesh[]>([]);
  const root = useMemo<Object3D>(() => {
    const r = gltf.scene.clone(true);
    r.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      m.material = materialOf(m).clone();
      m.castShadow = true; m.receiveShadow = true;
    });
    return r;
  }, [gltf]);
  // The stamp is found on the clone that is on show (not while it is made: React may make it twice and keep the first), and takes the party's colour.
  useLayoutEffect(() => {
    const parts: Mesh[] = [];
    root.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      const name = materialOf(m).name;
      if (name === 'stamp_base' || name === 'stamp_handle') parts.push(m);
      if (name === 'stamp_base') (materialOf(m) as MeshStandardMaterial).color = new Color(accent);
    });
    stamp.current = parts;
  }, [root, accent]);
  useFrame((s) => {
    const t = now(s.clock.elapsedTime, off);
    // each mark: the stamp is lifted, then thumped down
    let lift = 0;
    for (const at of marks) { const d = t - at; if (d > -0.35 && d < 0.1) lift = Math.max(lift, d < 0 ? Math.sin((1 - -d / 0.35) * Math.PI * 0.5) * 0.06 : 0.06 * Math.max(0, 1 - d / 0.1)); }
    for (const m of stamp.current) m.position.y = lift;
  });
  return (
    <group {...rest}>
      <primitive object={root} />
    </group>
  );
}
