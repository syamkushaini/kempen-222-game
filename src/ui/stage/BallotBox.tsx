import { useLoader, type ThreeElements } from '@react-three/fiber';
import { useLayoutEffect, useMemo } from 'react';
import { Mesh, MeshStandardMaterial, type Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Anim, Box, ease } from './parts';

// The ballot box of the get-out-the-vote scene: a clear plastic box with a slotted lid, a white label and a seal strap. It is a plain
// 108-triangle model; the papers that fill it are made here, and drop through the slot one after another as the voters arrive.

export const BALLOT_BOX_URL = `${import.meta.env.BASE_URL}models/ballot-box.glb`;
export const preloadBallotBox = (): void => { try { useLoader.preload(GLTFLoader, BALLOT_BOX_URL); } catch { /* the plain box stands in */ } };

type G = ThreeElements['group'];
/** The model's own size: 0.4 across, 0.4 tall, the slot in the middle of the lid. */
const SIDE = 0.4;

/** The box, with `papers` ballots that drop in from `first` seconds, one every `gap` seconds. */
export function BallotBoxModel({ papers = 7, first = 1.8, gap = 0.34, accent, ...rest }: { papers?: number; first?: number; gap?: number; accent: string } & G) {
  const gltf = useLoader(GLTFLoader, BALLOT_BOX_URL);
  const root = useMemo<Object3D>(() => gltf.scene.clone(true), [gltf]);
  useLayoutEffect(() => {
    root.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      const mat = m.material as MeshStandardMaterial;
      const glass = mat.transparent;
      m.castShadow = !glass; m.receiveShadow = true;
      // the clear plastic: see-through but never invisible, with a polish that catches the light
      if (glass) { mat.depthWrite = false; mat.roughness = 0.18; mat.envMapIntensity = 1.6; mat.opacity = 0.62; m.renderOrder = 2; }
    });
  }, [root]);
  return (
    <group {...rest}>
      <primitive object={root} />
      {/* the ballots: each drops through the slot and lands on the pile, which shows through the plastic */}
      {Array.from({ length: papers }, (_, k) => {
        const at = first + k * gap;
        const rest_y = 0.012 + k * 0.011;
        const turn = (k * 2.399) % 6.283;
        return (
          <Anim key={k} f={(t, g) => {
            const u = ease(t, at, at + 0.4);
            g.visible = t >= at;
            // from above the slot to the pile, turning flat as it falls
            g.position.set(0, rest_y + (1 - u) * 0.42, 0);
            g.rotation.set((1 - u) * 1.3, turn * u, 0);
          }}>
            <Box s={[SIDE * 0.62, 0.008, SIDE * 0.42]} c={k % 2 ? '#f6f3ea' : '#ffffff'} />
          </Anim>
        );
      })}
      {/* a band of the party's colour round the label, so that it is the party's box */}
      <mesh position={[0, 0.095, SIDE / 2 + 0.003]}><boxGeometry args={[SIDE * 0.7, 0.02, 0.004]} /><meshStandardMaterial color={accent} roughness={0.6} /></mesh>
    </group>
  );
}
