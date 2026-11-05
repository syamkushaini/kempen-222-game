import { useLoader, type ThreeElements } from '@react-three/fiber';
import { Suspense, useMemo, type ReactNode } from 'react';
import { Color, Mesh, MeshStandardMaterial, type Material, type Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ModelBoundary } from './ModelBoundary';

// The props of the action scenes, modelled in Blender for Kempen 222: in the studio, the television camera on its tripod, the radio
// microphone and the lectern; at the rally, the stage, the truss that holds the banner, the lamp post of the ceramah and the festival stall;
// in the street, the terrace house, the kampung house on stilts, the shade tree, the coconut palm and the billboard frame.
// Each is a small plain model (under 40 KB) that stands on the floor and faces the front (+Z). One material of a prop can take a colour
// (the lectern's panel, the stage's planks, the stall's canopy). If a model cannot be fetched, the stand-in passed as `fallback` is shown.

const url = (file: string) => `${import.meta.env.BASE_URL}models/${file}`;
export const PROPS = {
  camera: 'tv-camera.glb', mic: 'studio-mic.glb', lectern: 'lectern.glb',
  stage: 'rally-stage.glb', truss: 'truss.glb', lamp: 'lamp-post.glb', stall: 'market-stall.glb',
  house: 'terrace-house.glb', kampung: 'kampung-house.glb', tree: 'tree.glb', palm: 'palm.glb', billboard: 'billboard-frame.glb',
} as const;
export type PropId = keyof typeof PROPS;
/** The material of each prop that can take a colour. */
const TINTED: Partial<Record<PropId, string>> = { lectern: 'Panel', stage: 'Deck', stall: 'Canopy', house: 'Roof', kampung: 'Roof' };

export const preloadProps = (): void => {
  for (const file of Object.values(PROPS)) { try { useLoader.preload(GLTFLoader, url(file)); } catch { /* the stand-ins are used */ } }
};

type G = ThreeElements['group'];
const materialOf = (m: Mesh): Material => (Array.isArray(m.material) ? m.material[0] : m.material);

function Model({ file, tint, ...rest }: { file: string; tint?: { material: string; color: string } } & G) {
  const gltf = useLoader(GLTFLoader, url(file));
  const root = useMemo<Object3D>(() => {
    const r = gltf.scene.clone(true);
    r.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      m.material = materialOf(m).clone();
      m.castShadow = true; m.receiveShadow = true;
      if (tint && materialOf(m).name === tint.material) (materialOf(m) as MeshStandardMaterial).color = new Color(tint.color);
    });
    return r;
  }, [gltf, tint?.material, tint?.color]); // eslint-disable-line react-hooks/exhaustive-deps
  return <group {...rest}><primitive object={root} /></group>;
}

/** A prop; `tint` colours its one tintable material. `fallback` is shown while it loads or if it fails. */
export function Prop({ kind, tint, fallback, ...rest }: { kind: PropId; tint?: string; fallback: ReactNode } & G) {
  const t = tint && TINTED[kind] ? { material: TINTED[kind]!, color: tint } : undefined;
  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}><Model file={PROPS[kind]} tint={t} {...rest} /></Suspense>
    </ModelBoundary>
  );
}
