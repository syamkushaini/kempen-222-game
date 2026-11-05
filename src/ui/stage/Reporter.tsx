import { useFrame, type ThreeElements } from '@react-three/fiber';
import { useContext, useRef } from 'react';
import type { Group } from 'three';
import { Bust } from '../Bust3D';
import type { Look } from '../faces';
import { now, Offset } from './clock';
import { Ball, Box, Mat } from './parts';

// The reporter or presenter: a woman with a brown bob, in a red blouse with short sleeves, a black pencil skirt, black tights and heels,
// with a microphone held up to her mouth in one hand and the other hand open, as in the picture it is made from. Everything is a plain
// shape, like the rest of the stage, apart from the head, which is the game's own 3D head.

type G = ThreeElements['group'];

const LOOK: Look = { skin: 1, hair: 'bob', hairColor: 'brown', wear: 'blouse' };
const BLOUSE = '#c4262e', SKIRT = '#1c1c21', TIGHTS = '#17171b', SKIN = '#e0ac84';

export function Reporter({ accent = '#e11d2f', scale = 1.1, phase = 0, talking = true, ...rest }: { accent?: string; scale?: number; phase?: number; talking?: boolean } & G) {
  const body = useRef<Group>(null), micArm = useRef<Group>(null), micFore = useRef<Group>(null), freeArm = useRef<Group>(null), freeFore = useRef<Group>(null);
  const off = useContext(Offset);
  useFrame((s) => {
    const t = now(s.clock.elapsedTime, off) + phase;
    const k = talking ? 0.5 + 0.5 * Math.sin(t * 2.6) * Math.sin(t * 1.3 + 1) : 0;
    if (body.current) { body.current.rotation.z = Math.sin(t * 1.5) * 0.015; body.current.rotation.y = Math.sin(t * 1.2) * 0.12; body.current.position.y = Math.abs(Math.sin(t * 2.2)) * 0.012; }
    // the microphone hand stays by the mouth, a little unsteady
    if (micArm.current) { micArm.current.rotation.z = -0.3 + Math.sin(t * 2.1) * 0.03; micArm.current.rotation.x = -0.9; }
    if (micFore.current) { micFore.current.rotation.x = -2.8 + Math.max(0, k) * Math.sin(t * 6) * 0.05; micFore.current.rotation.z = 0.45; }
    // the free hand opens out and sweeps, in time with the words
    if (freeArm.current) { freeArm.current.rotation.z = 0.55 + Math.max(0, k) * (0.2 + Math.sin(t * 3.1) * 0.18); freeArm.current.rotation.x = -0.1; }
    if (freeFore.current) freeFore.current.rotation.z = 0.35 + Math.max(0, k) * Math.sin(t * 4.3) * 0.2;
  });
  return (
    <group scale={scale} {...rest}>
      <group ref={body}>
        {/* legs in black tights, and heels */}
        {[-0.085, 0.085].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.062, 0.045, 0.74, 10]} /><Mat c={TIGHTS} /></mesh>
            <Box s={[0.085, 0.05, 0.2]} c="#0c0c10" position={[0, 0.05, 0.04]} />
            <Box s={[0.03, 0.09, 0.03]} c="#0c0c10" position={[0, 0.045, -0.04]} />
          </group>
        ))}
        {/* the pencil skirt, narrow at the knee, and the blouse tucked into it */}
        <mesh position={[0, 0.78, 0]}><cylinderGeometry args={[0.185, 0.155, 0.4, 14]} /><Mat c={SKIRT} /></mesh>
        <mesh position={[0, 1.17, 0]}><cylinderGeometry args={[0.185, 0.16, 0.4, 14]} /><Mat c={BLOUSE} /></mesh>
        {/* the collar and the buttons down the front */}
        <Box s={[0.08, 0.04, 0.03]} c={BLOUSE} position={[-0.05, 1.395, 0.15]} rotation={[0, 0, 0.5]} /><Box s={[0.08, 0.04, 0.03]} c={BLOUSE} position={[0.05, 1.395, 0.15]} rotation={[0, 0, -0.5]} />
        {[1.3, 1.2, 1.1, 1.0].map((y) => <Ball key={y} r={0.012} c="#1a1a1f" position={[0, y, 0.185]} />)}
        <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.04, 0.045, 0.1, 8]} /><Mat c={SKIN} /></mesh>
        {/* the arm with the microphone, its hand up by the mouth */}
        <group ref={micArm} position={[-0.2, 1.38, 0]}>
          <mesh position={[0, -0.09, 0]}><capsuleGeometry args={[0.052, 0.12, 3, 8]} /><Mat c={BLOUSE} /></mesh>
          <group ref={micFore} position={[0, -0.2, 0]}>
            <mesh position={[0, -0.12, 0]}><capsuleGeometry args={[0.04, 0.17, 3, 8]} /><Mat c={SKIN} /></mesh>
            <Ball r={0.05} c={SKIN} position={[0, -0.27, 0]} />
            <group position={[0, -0.27, 0.0]} rotation={[0.35, 0, 0]} scale={1.5}>
              <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.018, 0.016, 0.16, 8]} /><Mat c="#1b1b20" /></mesh>
              <Ball r={0.042} c="#26262c" position={[0, 0.17, 0]} />
              <Box s={[0.07, 0.025, 0.07]} c={accent} e={0.5} position={[0, 0.115, 0]} />
            </group>
          </group>
        </group>
        {/* the free arm, open */}
        <group ref={freeArm} position={[0.2, 1.38, 0]}>
          <mesh position={[0, -0.09, 0]}><capsuleGeometry args={[0.052, 0.12, 3, 8]} /><Mat c={BLOUSE} /></mesh>
          <group ref={freeFore} position={[0, -0.2, 0]}>
            <mesh position={[0, -0.13, 0]}><capsuleGeometry args={[0.04, 0.19, 3, 8]} /><Mat c={SKIN} /></mesh>
            <Ball r={0.048} c={SKIN} position={[0, -0.29, 0]} />
          </group>
        </group>
        <group position={[0, 1.55, 0]} scale={0.205}><Bust look={LOOK} accent={BLOUSE} calm={false} talking={talking} shoulders={false} /></group>
      </group>
    </group>
  );
}
