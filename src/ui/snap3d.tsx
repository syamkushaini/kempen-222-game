import { createRoot, extend, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { Bust, BustLights, BUST_CAMERA, BUST_TARGET } from './Bust3D';
import type { Look } from './faces';

// Still pictures of the 3D busts, for the places where many people are listed at once (a cabinet, the party cards): every browser limits
// how many graphics canvases may be live, so these are drawn one at a time on a single hidden canvas and kept as images.

// A canvas made by hand (not by <Canvas>) has to be told which Three.js shapes it may use.
extend(THREE as never);

let canvas: HTMLCanvasElement | null = null;
let root: ReturnType<typeof createRoot> | null = null;
let line: Promise<unknown> = Promise.resolve();
const kept = new Map<string, string>();

/** Draws one bust once, in the pose it has at rest, and hands back the picture. */
function Shoot({ look, accent, done }: { look: Look; accent: string; done(url: string): void }) {
  const gl = useThree((s) => s.gl);
  const advance = useThree((s) => s.advance);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.lookAt(...BUST_TARGET);
    advance(0, true);
    done(gl.domElement.toDataURL('image/png'));
  }, [gl, advance, camera, done]);
  return (
    <>
      <BustLights />
      <Bust look={look} accent={accent} calm />
    </>
  );
}

/** The picture of a bust at this size in pixels, or null if the browser could not draw it. Pictures already made are kept. Jobs run one at a time. */
export function snapshot(look: Look, accent: string, px: number): Promise<string | null> {
  const key = `${accent}|${px}|${JSON.stringify(look)}`;
  const hit = kept.get(key);
  if (hit) return Promise.resolve(hit);
  const job = () => new Promise<string | null>((resolve) => {
    try {
      canvas ??= document.createElement('canvas');
      root ??= createRoot(canvas);
      let settled = false;
      const finish = (url: string | null) => { if (settled) return; settled = true; if (url) kept.set(key, url); resolve(url); };
      root.configure({
        frameloop: 'never', dpr: 1, size: { width: px, height: px, top: 0, left: 0 }, camera: BUST_CAMERA,
        gl: { alpha: true, antialias: true, preserveDrawingBuffer: true },
      });
      root.render(<Shoot look={look} accent={accent} done={finish} />);
      // If the picture never comes (the context was lost, say), the line moves on rather than waiting for ever.
      setTimeout(() => finish(null), 4000);
    } catch { resolve(null); }
  });
  const next = line.then(job, job);
  line = next;
  return next;
}
