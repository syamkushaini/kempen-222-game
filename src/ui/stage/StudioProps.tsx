import { useLoader, type ThreeElements } from '@react-three/fiber';
import { Suspense, useMemo, type ReactNode } from 'react';
import { Color, Mesh, MeshStandardMaterial, type Material, type Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ModelBoundary } from './ModelBoundary';

// The props of the studio scenes, modelled in Blender for Kempen 222: the television camera on its tripod, the radio microphone and the
// lectern. Each is a small plain model (under 40 KB) that stands on the floor and faces the front (+Z); the lectern's front panel takes the
// party's colour. If a model cannot be fetched, the box-built stand-in that is passed as `fallback` is shown instead.

const url = (file: string) => `${import.meta.env.BASE_URL}models/${file}`;
export const STUDIO_PROPS = { camera: 'tv-camera.glb', mic: 'studio-mic.glb', lectern: 'lectern.glb' } as const;
export type StudioProp = keyof typeof STUDIO_PROPS;

export const preloadStudioProps = (): void => {
  for (const file of Object.values(STUDIO_PROPS)) { try { useLoader.preload(GLTFLoader, url(file)); } catch { /* the stand-ins are used */ } }
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

/** A studio prop; `accent` tints the lectern's front panel. `fallback` is shown while it loads or if it fails. */
export function StudioProp({ kind, accent, fallback, ...rest }: { kind: StudioProp; accent?: string; fallback: ReactNode } & G) {
  const tint = kind === 'lectern' && accent ? { material: 'Panel', color: accent } : undefined;
  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}><Model file={STUDIO_PROPS[kind]} tint={tint} {...rest} /></Suspense>
    </ModelBoundary>
  );
}
