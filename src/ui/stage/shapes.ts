import { useEffect, useState } from 'react';
import type { BufferGeometry, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * A set of shapes kept in one model file and shared by every copy drawn: the file is fetched once, and each named mesh in it becomes one
 * geometry. Until the file arrives, or if it cannot be fetched, `use()` gives null and the caller draws its stand-in. The parts are painted in
 * greys (vertex colours) that multiply the colour given in code, so one shape serves every colour.
 */
export function sharedShapes<K extends string>(file: string, names: Record<K, string>) {
  const url = `${import.meta.env.BASE_URL}models/${file}`;
  let shapes: Record<K, BufferGeometry> | null = null;
  let loading: Promise<void> | null = null;
  const waiting = new Set<() => void>();

  /** Fetch the file once; everyone who asked is told when it is ready. */
  const load = (): Promise<void> => {
    loading ??= new GLTFLoader().loadAsync(url).then((g) => {
      const out = {} as Record<K, BufferGeometry>;
      for (const key of Object.keys(names) as K[]) {
        const m = g.scene.getObjectByName(names[key]) as Mesh | undefined;
        if (!m?.isMesh) throw new Error(`${file} has no mesh ${names[key]}`);
        out[key] = m.geometry;
      }
      shapes = out;
      for (const f of waiting) f();
      waiting.clear();
    }).catch(() => undefined);
    return loading;
  };

  /** The shapes once they are loaded, else null. */
  const use = (): Record<K, BufferGeometry> | null => {
    const [, redraw] = useState(0);
    useEffect(() => {
      if (shapes) return;
      const f = () => redraw((x) => x + 1);
      waiting.add(f);
      void load();
      return () => { waiting.delete(f); };
    }, []);
    return shapes;
  };

  return { url, load, use };
}
