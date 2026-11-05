import { useLoader, type ThreeElements } from '@react-three/fiber';
import { Suspense, useMemo, type ReactNode } from 'react';
import { Color, Mesh, MeshStandardMaterial, type Material, type Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ModelBoundary } from './ModelBoundary';

// The props of the action scenes, modelled in Blender for Kempen 222: in the studio, the television camera on its tripod, the radio
// microphone and the lectern; at the rally, the stage, the truss that holds the banner, the lamp post of the ceramah and the festival stall;
// in the street, the terrace house, the kampung house on stilts, the shade tree, the coconut palm and the billboard frame; and for the money,
// the banquet table, the collection counter, the pile of notes and coins, the clear crowdfund box and the tycoon's desk; on the road, the
// car, the campaign van with its loudspeakers, and the pole of a flag (vehicles face +X, the way they drive across the scenes); in the
// hall and online, the conference table with its laptops, the presentation stand, the floor microphone, the big phone and the cyber trooper's desk;
// and at the night attack, the flying tabloid, the press microphones the rival faces and the floodlights.
// Each is a small plain model (under 40 KB) that stands on the floor and faces the front (+Z). One material of a prop can take a colour
// (the lectern's panel, the stage's planks, the stall's canopy). If a model cannot be fetched, the stand-in passed as `fallback` is shown.

const url = (file: string) => `${import.meta.env.BASE_URL}models/${file}`;
export const PROPS = {
  camera: 'tv-camera.glb', mic: 'studio-mic.glb', lectern: 'lectern.glb',
  stage: 'rally-stage.glb', truss: 'truss.glb', lamp: 'lamp-post.glb', stall: 'market-stall.glb',
  house: 'terrace-house.glb', kampung: 'kampung-house.glb', tree: 'tree.glb', palm: 'palm.glb', billboard: 'billboard-frame.glb',
  table: 'dinner-table.glb', pile: 'money-pile.glb', counter: 'counter.glb', donation: 'donation-box.glb', desk: 'desk.glb',
  car: 'car.glb', van: 'van.glb', flagpole: 'flag-pole.glb',
  boardroom: 'conference-table.glb', chart: 'presentation-stand.glb', standmic: 'mic-stand.glb', phone: 'phone.glb', workstation: 'workstation.glb',
  newspaper: 'newspaper.glb', pressmics: 'press-mics.glb', floodlight: 'floodlight.glb',
} as const;
export type PropId = keyof typeof PROPS;
/** The material of each prop that can take a colour. */
const TINTED: Partial<Record<PropId, string>> = { lectern: 'Panel', stage: 'Deck', stall: 'Canopy', house: 'Roof', kampung: 'Roof', table: 'Sash', counter: 'Sash', donation: 'Label', car: 'Paint', van: 'Stripe' };

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

/**
 * A prop; `tint` colours its one tintable material. `fallback` is shown while it loads or if it fails. The position, rotation and scale
 * given go to the model only: a fallback must be placed by itself (or sit in a group that places both).
 */
export function Prop({ kind, tint, fallback, ...rest }: { kind: PropId; tint?: string; fallback: ReactNode } & G) {
  const t = tint && TINTED[kind] ? { material: TINTED[kind]!, color: tint } : undefined;
  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}><Model file={PROPS[kind]} tint={t} {...rest} /></Suspense>
    </ModelBoundary>
  );
}
