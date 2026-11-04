import { Canvas } from '@react-three/fiber';
import type { Look } from '../faces';
import { Offset } from './parts';
import { SCENES } from './scenes';
import type { ActionId } from '../../sim/campaign/types';

/** The scene for one action, drawn with React Three Fiber on a canvas that fills its box. */
export default function Stage3D({ id, look, accent, rival, freeze = null }: { id: ActionId; look: Look; accent: string; rival: { look: Look; accent: string }; freeze?: number | null }) {
  const scene = SCENES[id];
  const night = scene.mood === 'night' || scene.mood === 'studio';
  return (
    <div className={`stage3d mood-${scene.mood}`} aria-hidden="true">
      <Canvas dpr={[1, 1.75]} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} camera={{ fov: 36, position: [0, 2.9, 8.8], near: 0.1, far: 60 }} onCreated={({ camera }) => camera.lookAt(0, 1.15, 0)}>
        <ambientLight intensity={night ? 1.0 : 1.5} color={night ? '#b9c6ff' : '#ffffff'} />
        <directionalLight position={[3, 6, 5]} intensity={night ? 1.6 : 2.3} color={scene.mood === 'dusk' ? '#ffd2a1' : '#ffffff'} />
        <directionalLight position={[-4, 2, 3]} intensity={0.5} color="#cfd8ff" />
        <Offset.Provider value={{ freeze }}>{scene.render({ look, accent, rival })}</Offset.Provider>
      </Canvas>
    </div>
  );
}
