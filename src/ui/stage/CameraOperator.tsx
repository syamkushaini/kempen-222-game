import { useFrame, type ThreeElements } from '@react-three/fiber';
import { useContext, useRef } from 'react';
import type { Group } from 'three';
import { Bust } from '../Bust3D';
import type { Look } from '../faces';
import { now, Offset } from './clock';
import { Ball, Box, Mat } from './parts';

// The camera operator: a man in a black t-shirt, black cargo trousers and a cap, with a broadcast camera on his shoulder, one hand under the
// lens and the other steadying it from above, as in the picture it is made from. Plain shapes, with the game's own 3D head.

type G = ThreeElements['group'];

const LOOK: Look = { skin: 1, hair: 'short', hairColor: 'brown', wear: 'baju' };
const BLACK = '#1a1a1f', TROUSERS = '#222227', SKIN = '#dba47c';

export function CameraOperator({ scale = 1.1, phase = 0, ...rest }: { scale?: number; phase?: number } & G) {
  const body = useRef<Group>(null), rig = useRef<Group>(null), rec = useRef<Group>(null);
  const off = useContext(Offset);
  useFrame((s) => {
    const t = now(s.clock.elapsedTime, off) + phase;
    if (body.current) { body.current.rotation.y = Math.sin(t * 0.9) * 0.1; body.current.rotation.z = Math.sin(t * 1.3) * 0.01; }
    // the camera is panned a little, as if following the speaker, and rocks with his breathing
    if (rig.current) { rig.current.rotation.y = Math.sin(t * 0.8) * 0.12; rig.current.position.y = 1.62 + Math.sin(t * 1.8) * 0.006; }
    // the red light blinks
    if (rec.current) rec.current.visible = Math.sin(t * 4) > -0.3;
  });
  return (
    <group scale={scale} {...rest}>
      <group ref={body}>
        {/* legs in cargo trousers, with a pocket on each thigh, and trainers */}
        {[-0.095, 0.095].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 0.43, 0]}><cylinderGeometry args={[0.085, 0.07, 0.86, 10]} /><Mat c={TROUSERS} /></mesh>
            <Box s={[0.03, 0.13, 0.12]} c={TROUSERS} position={[x < 0 ? -0.095 : 0.095, 0.5, 0.02]} />
            <Box s={[0.1, 0.07, 0.22]} c="#101014" position={[0, 0.035, 0.04]} />
          </group>
        ))}
        <mesh position={[0, 0.98, 0]}><cylinderGeometry args={[0.185, 0.17, 0.25, 12]} /><Mat c={TROUSERS} /></mesh>
        {/* the t-shirt, with its short sleeves */}
        <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.2, 0.185, 0.42, 12]} /><Mat c={BLACK} /></mesh>
        <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.04, 0.045, 0.1, 8]} /><Mat c={SKIN} /></mesh>
        {/* the arm under the lens (his right, on the left of the picture): the upper arm out and forward, the forearm up to the camera */}
        <group position={[-0.22, 1.4, 0]} rotation={[-0.5, 0, -0.45]}>
          <mesh position={[0, -0.09, 0]}><capsuleGeometry args={[0.055, 0.1, 3, 8]} /><Mat c={BLACK} /></mesh>
          <group position={[0, -0.2, 0]} rotation={[-1.7, 0, 0.5]}>
            <mesh position={[0, -0.13, 0]}><capsuleGeometry args={[0.042, 0.18, 3, 8]} /><Mat c={SKIN} /></mesh>
            <Ball r={0.05} c={SKIN} position={[0, -0.29, 0]} />
          </group>
        </group>
        {/* the arm over the top (his left): across the chest, the hand on the camera */}
        <group position={[0.22, 1.4, 0]} rotation={[-0.9, 0, 0.35]}>
          <mesh position={[0, -0.09, 0]}><capsuleGeometry args={[0.055, 0.1, 3, 8]} /><Mat c={BLACK} /></mesh>
          <group position={[0, -0.2, 0]} rotation={[-1.1, 0, -1.0]}>
            <mesh position={[0, -0.13, 0]}><capsuleGeometry args={[0.042, 0.2, 3, 8]} /><Mat c={SKIN} /></mesh>
            <Ball r={0.05} c={SKIN} position={[0, -0.3, 0]} />
          </group>
        </group>
        {/* the camera on his shoulder: body, battery, lens in its hood, a microphone and an aerial on top, and the red light */}
        <group ref={rig} position={[-0.16, 1.62, 0.08]} rotation={[0, 0.12, 0]}>
          <Box s={[0.2, 0.2, 0.42]} c="#1e1e24" position={[0, 0, -0.02]} />
          <Box s={[0.16, 0.16, 0.16]} c="#16161b" position={[0, 0.02, -0.28]} />
          <Box s={[0.24, 0.24, 0.2]} c="#121216" position={[0, 0, 0.3]} />
          <mesh position={[0, 0, 0.405]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.085, 0.085, 0.02, 16]} /><meshLambertMaterial color="#050507" /></mesh>
          <mesh position={[0, 0.17, 0.12]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 0.28, 8]} /><Mat c="#1b1b20" /></mesh>
          <Box s={[0.012, 0.22, 0.012]} c="#101014" position={[0.06, 0.3, -0.16]} />
          <group ref={rec} position={[0.1, 0.06, 0.1]}><Ball r={0.02} c="#ff2b2b" e={1} /></group>
        </group>
        <group position={[0, 1.58, 0]} scale={0.205}>
          <Bust look={LOOK} accent={BLACK} calm={false} talking={false} shoulders={false} />
          {/* the cap and its peak */}
          <mesh position={[0, 0.55, 0]} scale={[1.04, 0.62, 1.06]}><sphereGeometry args={[1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /><Mat c={BLACK} /></mesh>
          <Box s={[1.5, 0.12, 0.9]} c={BLACK} position={[0, 0.5, 0.95]} rotation={[0.12, 0, 0]} />
        </group>
      </group>
    </group>
  );
}
