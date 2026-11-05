import { useEffect, useState } from 'react';
import type { BufferGeometry, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// The shapes of the cartoon people, modelled in Blender for Kempen 222 (public/models/crowd-person.glb): a whole body for the crowd, and a
// torso, a leg, an arm and a head for the figures whose limbs move. Each part is painted in greys (shirt white, trousers and shoes dark, hair
// near black) that multiply the colour given in code, so one model serves every shirt and every skin. The file is 48 KB and is fetched once;
// until it arrives, or if it cannot be fetched, the people are drawn from capsules and spheres as before.

export const PEOPLE_URL = `${import.meta.env.BASE_URL}models/crowd-person.glb`;
export interface PeopleShapes { crowd: BufferGeometry; torso: BufferGeometry; leg: BufferGeometry; arm: BufferGeometry; head: BufferGeometry }

let shapes: PeopleShapes | null = null;
let loading: Promise<void> | null = null;
const waiting = new Set<() => void>();

/** Fetch the model once; everyone who asked is told when it is ready. */
export function loadPeople(): Promise<void> {
  loading ??= new GLTFLoader().loadAsync(PEOPLE_URL).then((g) => {
    const geo = (name: string): BufferGeometry => {
      const m = g.scene.getObjectByName(name) as Mesh | undefined;
      if (!m?.isMesh) throw new Error(`crowd-person.glb has no mesh ${name}`);
      return m.geometry;
    };
    shapes = { crowd: geo('CrowdBody'), torso: geo('Torso'), leg: geo('Leg'), arm: geo('Arm'), head: geo('Head') };
    for (const f of waiting) f();
    waiting.clear();
  }).catch(() => undefined);
  return loading;
}

/** The modelled shapes once they are loaded, else null (and the caller draws its stand-in). */
export function usePeople(): PeopleShapes | null {
  const [, redraw] = useState(0);
  useEffect(() => {
    if (shapes) return;
    const f = () => redraw((x) => x + 1);
    waiting.add(f);
    void loadPeople();
    return () => { waiting.delete(f); };
  }, []);
  return shapes;
}
