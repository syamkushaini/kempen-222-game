import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import type { Look } from './faces';

// A 3D bust of one of the game's invented people, built from the same `Look` as the flat portraits, so the two always match.
// It is drawn with React Three Fiber, fetched only where it is used, and kept small: a few dozen simple shapes, no textures.

const SKIN = ['#f1cda8', '#e2b088', '#c98d62', '#9c6644'];
const SHADE = ['#dcb089', '#c99468', '#ac7248', '#7f4f33'];
const HAIR = { black: '#22201f', brown: '#4a3526', grey: '#8e8e92', white: '#e3e1dc' };
const INK = '#1f1f26';
const JACKET = '#2b3140';

/** The head and shoulders, centred on the origin, 1 unit to the head's radius. */
function Bust({ look, accent, calm }: { look: Look; accent: string; calm: boolean }) {
  const root = useRef<Group>(null);
  const eyes = useRef<Group>(null);
  const skin = SKIN[look.skin], shade = SHADE[look.skin], hair = HAIR[look.hairColor];
  const scarf = look.headwear === 'scarf';
  const body = look.wear === 'suit' ? JACKET : accent;

  // A slow turn of the head and a breath, a look toward the pointer, and a blink now and then. Still when the player asks for calm.
  useFrame((state, dt) => {
    if (calm || !root.current) return;
    const t = state.clock.elapsedTime;
    const aimY = state.pointer.x * 0.5 + Math.sin(t * 0.6) * 0.12;
    const aimX = -state.pointer.y * 0.25 + Math.sin(t * 0.9) * 0.03;
    root.current.rotation.y += (aimY - root.current.rotation.y) * Math.min(1, dt * 4);
    root.current.rotation.x += (aimX - root.current.rotation.x) * Math.min(1, dt * 4);
    root.current.position.y = Math.sin(t * 1.4) * 0.025;
    if (eyes.current) eyes.current.scale.y = t % 4.2 > 4.05 ? 0.1 : 1;
  });

  return (
    <group ref={root}>
      {/* shoulders and what is worn on them */}
      <mesh position={[0, -1.75, 0]} scale={[1.75, 0.95, 0.95]}><sphereGeometry args={[1, 32, 16]} /><meshLambertMaterial color={body} /></mesh>
      {look.wear === 'suit' && <mesh position={[0, -1.02, 0.78]} rotation={[0.25, 0, Math.PI]} scale={[0.5, 0.55, 0.08]}><coneGeometry args={[1, 1, 3]} /><meshLambertMaterial color="#f5f2ea" /></mesh>}
      {look.wear === 'suit' && <mesh position={[0, -1.1, 0.84]} scale={[0.1, 0.55, 0.05]}><boxGeometry /><meshLambertMaterial color={accent} /></mesh>}
      {/* neck */}
      <mesh position={[0, -0.78, 0]}><cylinderGeometry args={[0.3, 0.34, 0.7, 20]} /><meshLambertMaterial color={shade} /></mesh>
      {/* back hair, behind the head */}
      {!scarf && (look.hair === 'long' || look.hair === 'bob') && (
        <mesh position={[0, look.hair === 'long' ? -0.1 : 0.1, -0.2]} scale={[1.05, look.hair === 'long' ? 1.45 : 1.15, 0.85]}><sphereGeometry args={[1, 24, 16]} /><meshLambertMaterial color={hair} /></mesh>
      )}
      {/* head */}
      <mesh position={[0, 0.25, 0]} scale={[0.9, 1.08, 0.95]}><sphereGeometry args={[1, 40, 24]} /><meshLambertMaterial color={skin} /></mesh>
      <mesh position={[-0.9, 0.2, 0]} scale={[0.1, 0.22, 0.12]}><sphereGeometry args={[1, 12, 8]} /><meshLambertMaterial color={shade} /></mesh>
      <mesh position={[0.9, 0.2, 0]} scale={[0.1, 0.22, 0.12]}><sphereGeometry args={[1, 12, 8]} /><meshLambertMaterial color={shade} /></mesh>
      {/* face */}
      <mesh position={[0, 0.13, 0.93]} scale={[0.1, 0.16, 0.12]}><sphereGeometry args={[1, 12, 8]} /><meshLambertMaterial color={shade} /></mesh>
      <group ref={eyes} position={[0, 0.38, 0.86]}>
        <mesh position={[-0.33, 0, 0]}><sphereGeometry args={[0.085, 12, 8]} /><meshBasicMaterial color={INK} /></mesh>
        <mesh position={[0.33, 0, 0]}><sphereGeometry args={[0.085, 12, 8]} /><meshBasicMaterial color={INK} /></mesh>
      </group>
      <mesh position={[-0.33, 0.55, 0.83]} rotation={[0, 0, 0.08]} scale={[0.2, 0.035, 0.05]}><boxGeometry /><meshBasicMaterial color={INK} /></mesh>
      <mesh position={[0.33, 0.55, 0.83]} rotation={[0, 0, -0.08]} scale={[0.2, 0.035, 0.05]}><boxGeometry /><meshBasicMaterial color={INK} /></mesh>
      <mesh position={[0, -0.22, 0.86]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.2, 0.035, 8, 20, Math.PI]} /><meshBasicMaterial color="#8a4a42" /></mesh>
      {look.facial === 'moustache' && <mesh position={[0, -0.07, 0.92]} scale={[0.34, 0.07, 0.08]}><sphereGeometry args={[1, 12, 8]} /><meshLambertMaterial color={hair} /></mesh>}
      {look.facial === 'beard' && <mesh position={[0, 0.25, 0]} scale={[0.93, 1.11, 0.98]}><sphereGeometry args={[1.02, 32, 16, 0, Math.PI * 2, Math.PI * 0.72, Math.PI * 0.28]} /><meshLambertMaterial color={hair} /></mesh>}
      {look.glasses && (
        <group position={[0, 0.38, 0.9]}>
          <mesh position={[-0.33, 0, 0]}><torusGeometry args={[0.22, 0.03, 8, 24]} /><meshBasicMaterial color="#2a2a33" /></mesh>
          <mesh position={[0.33, 0, 0]}><torusGeometry args={[0.22, 0.03, 8, 24]} /><meshBasicMaterial color="#2a2a33" /></mesh>
          <mesh scale={[0.2, 0.03, 0.03]}><boxGeometry /><meshBasicMaterial color="#2a2a33" /></mesh>
        </group>
      )}
      {/* hair on top, or a headscarf, or a songkok */}
      {!scarf && look.hair !== 'thin' && look.headwear !== 'songkok' && <HairCap color={hair} bun={look.hair === 'bun'} fringe={look.hair === 'swept' || look.hair === 'side'} />}
      {!scarf && look.hair === 'thin' && look.headwear !== 'songkok' && <mesh position={[0, 0.25, 0]} scale={[0.92, 1.1, 0.97]} rotation={[-0.9, 0, 0]}><sphereGeometry args={[1.01, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.3]} /><meshLambertMaterial color={hair} /></mesh>}
      {scarf && <Scarf color={accent} />}
      {look.headwear === 'songkok' && (
        <group position={[0, 1.2, 0]}>
          <mesh><cylinderGeometry args={[0.66, 0.74, 0.62, 28]} /><meshLambertMaterial color={INK} /></mesh>
          <mesh position={[0, -0.3, 0]}><cylinderGeometry args={[0.745, 0.745, 0.05, 28]} /><meshLambertMaterial color="#c9a44c" /></mesh>
        </group>
      )}
    </group>
  );
}

/** Hair as a cap over the top of the head, tilted back so that the forehead shows; a bun sits on top. */
function HairCap({ color, bun, fringe }: { color: string; bun: boolean; fringe: boolean }) {
  return (
    <group position={[0, 0.25, 0]}>
      <mesh scale={[0.95, 1.12, 1.0]} rotation={[fringe ? -0.38 : -0.5, 0, 0]}><sphereGeometry args={[1.03, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} /><meshLambertMaterial color={color} /></mesh>
      {bun && <mesh position={[0, 1.15, -0.15]}><sphereGeometry args={[0.38, 16, 12]} /><meshLambertMaterial color={color} /></mesh>}
    </group>
  );
}

/** A headscarf: a shell over the top and sides of the head that leaves the face open, with a fold under the chin. */
function Scarf({ color }: { color: string }) {
  return (
    <group position={[0, 0.25, 0]}>
      <mesh scale={[0.99, 1.14, 1.04]} rotation={[-1.0, 0, 0]}><sphereGeometry args={[1.04, 36, 20, 0, Math.PI * 2, 0, Math.PI * 0.62]} /><meshLambertMaterial color={color} /></mesh>
      <mesh position={[0, -0.82, -0.12]} scale={[0.92, 0.42, 0.78]}><sphereGeometry args={[0.95, 28, 14, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65]} /><meshLambertMaterial color={color} /></mesh>
    </group>
  );
}

/** One round 3D portrait: the bust on a coloured disc, the way the flat portraits are. */
export default function Bust3D({ look, accent, size, calm }: { look: Look; accent: string; size: number; calm: boolean }) {
  return (
    <div className="bust3d" style={{ width: size, height: size, background: `color-mix(in srgb, ${accent} 26%, #e8e3d8)` }} aria-hidden="true">
      <Canvas
        // Drawn only when something changes if the player asked for calm; otherwise a gentle animation.
        frameloop={calm ? 'demand' : 'always'} dpr={[1, 2]} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        camera={{ fov: 28, position: [0, 0.15, 6.0], near: 0.1, far: 30 }} onCreated={({ camera }) => camera.lookAt(0, 0.0, 0)}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[2.5, 3.5, 5]} intensity={2.2} />
        <directionalLight position={[-3, 1, 2]} intensity={0.6} color="#cfd8ff" />
        <Bust look={look} accent={accent} calm={calm} />
      </Canvas>
    </div>
  );
}

