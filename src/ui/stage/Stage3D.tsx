import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useContext, useEffect } from 'react';
import { Mesh, MeshBasicMaterial, Vector3, type Material } from 'three';
import type { Look } from '../faces';
import { ease, now, Offset } from './parts';
import { SCENES, type Mood } from './scenes';
import type { ActionId } from '../../sim/campaign/types';

/** The light of each time of day: the sky and ground the hemisphere light takes its colours from, the sun, the fog, and lamps over the stage at night. */
const LIGHT: Record<Mood, { sky: string; ground: string; hemi: number; sun: string; sunI: number; fog: string; lamp?: string }> = {
  day: { sky: '#dbeeff', ground: '#9fb38e', hemi: 1.15, sun: '#fff4e2', sunI: 2.6, fog: '#e6f2ff' },
  dusk: { sky: '#ffcf9e', ground: '#6b5a7a', hemi: 0.95, sun: '#ffb37a', sunI: 2.2, fog: '#f2b48e', lamp: '#ffcf8a' },
  night: { sky: '#8a9be0', ground: '#343a5c', hemi: 0.9, sun: '#b9c8ff', sunI: 1.2, fog: '#323769', lamp: '#ffe2b0' },
  indoor: { sky: '#fff6e8', ground: '#b8ad98', hemi: 1.1, sun: '#fff0dc', sunI: 2.0, fog: '#e4ddcf' },
  studio: { sky: '#a9bbea', ground: '#38415e', hemi: 0.85, sun: '#ffffff', sunI: 1.5, fog: '#2c3550', lamp: '#fff2d6' },
};

/** The camera moves in slowly over the scene and drifts a little to one side, so that the picture is never still. */
function CameraRig() {
  const off = useContext(Offset);
  useFrame((s) => {
    const t = now(s.clock.elapsedTime, off);
    const k = ease(t, 0, 4.2);
    s.camera.position.set(Math.sin(t * 0.45) * 0.6, 3.25 - k * 0.55, 10.2 - k * 1.9);
    s.camera.lookAt(0, 1.15 + k * 0.1, -0.3);
  });
  return null;
}

/** Everything solid casts a shadow and takes one; light-giving and see-through things, and the ground itself, do not cast. */
function Shadows() {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      const mats = ([] as Material[]).concat(o.material as Material | Material[]);
      const glass = mats.some((m) => m.transparent || m instanceof MeshBasicMaterial);
      // Paper, confetti and coins are too thin to throw a shadow worth having: theirs only smudge what is behind them.
      o.geometry.computeBoundingBox();
      const size = o.geometry.boundingBox?.getSize(new Vector3());
      const thin = !!size && Math.min(size.x, size.y, size.z) < 0.045;
      o.castShadow = !glass && !thin && !o.userData.ground;
      o.receiveShadow = !glass;
    });
  }, [scene]);
  return null;
}

/** The scene for one action, drawn with React Three Fiber on a canvas that fills its box. */
export default function Stage3D({ id, look, accent, rival, freeze = null }: { id: ActionId; look: Look; accent: string; rival: { look: Look; accent: string }; freeze?: number | null }) {
  const scene = SCENES[id];
  const L = LIGHT[scene.mood];
  return (
    <div className={`stage3d mood-${scene.mood}`} aria-hidden="true">
      <Canvas shadows="soft" dpr={[1, 1.75]} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} camera={{ fov: 36, position: [0, 3.25, 10.2], near: 0.1, far: 60 }}>
        <fog attach="fog" args={[L.fog, 13, 27]} />
        <hemisphereLight args={[L.sky, L.ground, L.hemi]} />
        <directionalLight
          position={[4.5, 8, 5.5]} intensity={L.sunI} color={L.sun} castShadow
          shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-normalBias={0.03}
          shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-camera-near={1} shadow-camera-far={30}
        />
        {/* a cool light from behind and to the side, to set people apart from what is behind them */}
        <directionalLight position={[-5, 3.5, -6]} intensity={0.9} color="#cfe0ff" />
        {L.lamp && <pointLight position={[0, 3.6, -1.4]} intensity={14} distance={9} decay={1.6} color={L.lamp} />}
        <Offset.Provider value={{ freeze }}>
          <CameraRig />
          {scene.render({ look, accent, rival })}
        </Offset.Provider>
        <Shadows />
      </Canvas>
    </div>
  );
}
