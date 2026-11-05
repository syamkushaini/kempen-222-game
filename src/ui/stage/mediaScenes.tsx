import { Bust } from '../Bust3D';
import { Suspense } from 'react';
import { BallotBoxModel } from './BallotBox';
import { VotingBoothModel } from './VotingBooth';
import { ModelBoundary } from './ModelBoundary';
import { CameraOperator } from './CameraOperator';
import { Reporter } from './Reporter';
import { Prop } from './Props';
import { Anim, Ball, Banner, Box, Bubble, Coin, Crowd, ease, Figure, Flag, Ground, Heart, Hero, Mat, rnd, span, Wave } from './parts';
import { crowdColors, type SceneProps } from './groundScenes';

/** The camera that films the leader, with its red light and a sign that says it is live. */
function Camera({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  return <Prop kind="camera" position={[x, 0, z]} rotation={[0, ry + Math.PI, 0]} fallback={<BoxCamera x={x} z={z} ry={ry} />} />;
}

/** The camera built from boxes: shown while the modelled one loads, or if it cannot be loaded. */
function BoxCamera({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      <Box s={[0.06, 1.2, 0.06]} c="#2a2a33" position={[0, 0.6, 0]} />
      <Box s={[0.55, 0.38, 0.8]} c="#1f1f26" position={[0, 1.35, 0]} />
      <mesh position={[0, 1.35, -0.55]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.14, 0.18, 0.3, 14]} /><Mat c="#444b5a" /></mesh>
      <Anim f={(t, g) => { g.visible = Math.sin(t * 6) > -0.2; }} position={[0.18, 1.58, 0.1]}><Ball r={0.05} c="#ff3b3b" e={1} /></Anim>
    </group>
  );
}

type StudioKind = 'tv' | 'radio' | 'debate' | 'manifesto';

/** Where the leader speaks to the country: a television studio, a radio booth, a debate between two lecterns, or a launch of the manifesto. */
export function Studio({ look, accent, rival, kind }: SceneProps & { kind: StudioKind }) {
  const cols = crowdColors(accent);
  return (
    <>
      <Ground c="#2f3a52" />
      <Box s={[24, 7, 0.1]} c="#3d4a63" position={[0, 3.5, -3.4]} />
      <Box s={[24, 0.16, 0.12]} c={accent} position={[0, 1.2, -3.32]} />
      {kind === 'tv' && (
        <>
          <Box s={[2.4, 0.95, 0.8]} c={accent} position={[0, 0.48, -1.6]} />
          <Hero look={look} accent={accent} player position={[0, 0.2, -1.9]} arms="down" scale={1.1} />
          <Reporter accent={accent} position={[2.1, 0, -1.2]} rotation={[0, -0.15, 0]} />
          <CameraOperator position={[-1.3, 0, 0.7]} rotation={[0, Math.PI - 0.45, 0]} />
          <Camera x={-2.2} z={1.2} ry={0.35} /><Camera x={2.4} z={1.6} ry={-0.4} />
          <Anim f={(t, g) => { g.visible = t > 0.4 && Math.sin(t * 5) > -0.8; }} position={[0, 3.3, -3.2]}><Box s={[1.6, 0.5, 0.1]} c="#e11d2f" e={0.8} /></Anim>
          {[-3.4, 3.4].map((x) => <group key={x} position={[x, 0, -2]}><Box s={[0.05, 2.6, 0.05]} c="#2a2a33" position={[0, 1.3, 0]} /><Box s={[1.0, 0.7, 0.06]} c="#fff6d8" e={0.8} position={[0, 2.7, 0]} rotation={[0.3, 0, 0]} /></group>)}
        </>
      )}
      {kind === 'radio' && (
        <>
          <Box s={[2.2, 0.8, 0.9]} c="#6b4a2f" position={[0, 0.4, -1.5]} />
          <Hero look={look} accent={accent} player position={[0, 0.1, -2]} arms="down" scale={1.1} />
          <Reporter accent={accent} position={[2, 0, -1.4]} rotation={[0, -0.15, 0]} />
          <Prop kind="mic" position={[0.5, 0.8, -1.35]} rotation={[0, Math.PI, 0]} scale={1.3} fallback={<><Box s={[0.05, 0.6, 0.05]} c="#2a2a33" position={[0.5, 1.1, -1.35]} /><Ball r={0.13} c="#2a2a33" position={[0.5, 1.45, -1.35]} /></>} />
          <Wave position={[0.5, 1.45, -1.3]} c="#ffffff" count={3} max={0.9} />
          <group position={[3.2, 0, -1.5]}><mesh position={[0, 1.5, 0]}><coneGeometry args={[0.5, 3, 4]} /><Mat c="#9aa3b2" /></mesh><Wave position={[0, 3.1, 0]} c={accent} count={3} max={1.5} every={1.6} /></group>
          {[-3.2, -2.1].map((x, i) => <group key={x} position={[x, 0, 0]}><Box s={[0.9, 0.55, 0.4]} c="#8a4a8f" position={[0, 0.3, 0]} /><Ball r={0.17} c="#e8e3d8" position={[-0.22, 0.3, 0.21]} /><Box s={[0.3, 0.05, 0.02]} c="#e8e3d8" position={[0.2, 0.4 + i * 0.03, 0.21]} /></group>)}
        </>
      )}
      {kind === 'debate' && (
        <>
          <Prop kind="lectern" tint={accent} position={[-1.7, 0, -1.2]} scale={0.9} fallback={<Box s={[0.9, 1.1, 0.7]} c={accent} position={[-1.7, 0.55, -1.2]} />} />
          <Hero look={look} accent={accent} player position={[-1.7, 0, -1.7]} arms="point" scale={1.05} />
          <Prop kind="lectern" tint={rival.accent} position={[1.7, 0, -1.2]} scale={0.9} fallback={<Box s={[0.9, 1.1, 0.7]} c={rival.accent} position={[1.7, 0.55, -1.2]} />} />
          <Hero look={rival.look} accent={rival.accent} position={[1.7, 0, -1.7]} arms="up" scale={1.05} />
          <Anim f={(t, g) => { const mine = Math.floor(t / 0.9) % 2 === 0; g.position.set(mine ? -1.4 : 1.4, 2.8 + Math.sin(t * 3) * 0.05, -1.4); g.visible = t > 0.3; }}><Bubble mark="!" /></Anim>
          <Anim f={(t, g) => { const mine = Math.floor(t / 0.9) % 2 === 0; g.position.set(mine ? 1.4 : -1.4, 2.5, -1.4); g.visible = t > 1.0; g.scale.setScalar(0.6); }}><Bubble mark="?" /></Anim>
          <Box s={[1.8, 0.7, 0.5]} c="#6b4a2f" position={[0, 0.35, -2.8]} />
          <Reporter accent={accent} position={[0, 0, -2.1]} scale={1} />
          <CameraOperator position={[-2.6, 0, 0.5]} rotation={[0, Math.PI - 0.5, 0]} />
          <Crowd n={22} area={[-3.5, 3.5, 1, 3.2]} colors={cols} cheer={0.2} seed={11} />
          <Camera x={0} z={2.4} />
        </>
      )}
      {kind === 'manifesto' && (
        <>
          <Prop kind="lectern" tint={accent} position={[0, 0, -1.6]} fallback={<Box s={[1.1, 1.0, 0.6]} c="#8d6e4a" position={[0, 0.5, -1.6]} />} />
          <Banner c={accent} position={[0, 0, -3.2]} w={4.6} h={2} />
          <Hero look={look} accent={accent} player position={[0, 0, -2.1]} arms="up" />
          <Reporter accent={accent} position={[2.9, 0, -1.2]} rotation={[0, -0.15, 0]} />
          <CameraOperator position={[-2.9, 0, -0.5]} rotation={[0, Math.PI - 0.6, 0]} />
          <Box s={[0.5, 0.04, 0.38]} c="#ffffff" position={[0, 1.02, -1.55]} rotation={[-0.3, 0, 0]} />
          {Array.from({ length: 16 }, (_, i) => (
            <Anim key={i} f={(t, g) => { const x = ((t - 0.5 - i * 0.12) / 1.6); g.visible = x > 0 && x < 1.2; g.position.set((rnd(i) - 0.5) * 5 * x, 1.2 + x * 2.2, -1.2 + rnd(i + 3) * 2.2 * x); g.rotation.set(x * 4, x * 3, 0.3); }}><Box s={[0.5, 0.03, 0.66]} c="#fffdf5" /></Anim>
          ))}
          {[0, 1, 2].map((i) => <Box key={i} s={[0.5, 0.06, 0.38]} c={['#ffffff', accent, '#f3efe6'][i]} position={[2.2, 0.06 + i * 0.07, -1]} />)}
        </>
      )}
    </>
  );
}

/** The phone: the social post that is liked and shared, and the cyber troops that answer for it. */
export function Social({ look, accent, rival, kind }: SceneProps & { kind: 'social' | 'troops' }) {
  if (kind === 'social') {
    return (
      <>
        <Ground c="#dfe6f2" />
        <Box s={[24, 7, 0.1]} c="#c9d6ee" position={[0, 3.5, -3.4]} />
        <group position={[0, 1.7, -1.2]}>
          <Box s={[1.7, 3, 0.16]} c="#1f1f26" /><Box s={[1.5, 2.7, 0.03]} c="#dbeafe" e={0.5} position={[0, 0, 0.09]} />
          <group position={[0, 0.35, 0.12]} scale={0.34}><Bust look={look} accent={accent} calm={false} talking /></group>
          <Box s={[1.3, 0.1, 0.02]} c="#93c5fd" position={[0, -0.6, 0.11]} /><Box s={[0.9, 0.1, 0.02]} c="#93c5fd" position={[-0.2, -0.82, 0.11]} />
        </group>
        {Array.from({ length: 18 }, (_, i) => (
          <Anim key={i} f={(t, g) => { const x = ((t - 0.5 - i * 0.18) / 1.5); g.visible = x > 0 && x < 1; g.position.set(-0.6 + rnd(i) * 1.2 + Math.sin(x * 5 + i) * 0.4, 1.4 + x * 3, -0.9 + rnd(i + 2) * 0.8); g.scale.setScalar(1.6 * (1 - x * 0.4)); }}><Heart c={i % 3 ? '#ec4899' : '#ef4444'} /></Anim>
        ))}
        <Hero look={look} accent={accent} player position={[-2.8, 0, 0.2]} arms="point" />
        {[0, 1, 2, 3].map((i) => <Anim key={i} f={(t, g) => { g.visible = t > 0.9 + i * 0.4; g.scale.setScalar(ease(t, 0.9 + i * 0.4, 1.2 + i * 0.4)); }} position={[2 + (i % 2) * 0.7, 1.2 + i * 0.5, -0.4]}><Ball r={0.22} c="#ef4444" e={0.5} /></Anim>)}
      </>
    );
  }
  return (
    <>
      <Ground c="#2a2f3c" />
      <Box s={[24, 7, 0.1]} c="#1f2430" position={[0, 3.5, -3.4]} />
      {Array.from({ length: 15 }, (_, i) => (
        <group key={i} position={[-4 + (i % 5) * 1.6, 0, -2.6 + Math.floor(i / 5) * 1.0]}>
          <Box s={[0.5, 0.3, 0.45]} c="#3b4252" position={[0, 0.15, 0]} />
          <Box s={[0.3, 0.45, 0.04]} c="#7dd3fc" e={0.7} position={[0, 0.55, 0.1]} rotation={[-0.2, 0, 0]} />
          <Box s={[0.1, 0.1, 0.1]} c="#e11d2f" e={0.6} position={[0.22, 0.34, 0.2]} />
        </group>
      ))}
      <Hero look={rival.look} accent={rival.accent} position={[3, 0, 0.6]} arms="up" scale={1.05} />
      {Array.from({ length: 14 }, (_, i) => (
        <Anim key={i} f={(t, g) => { const x = ((t - 0.3 - i * 0.2) / 1.0); g.visible = x > 0 && x < 1; g.position.set(-3 + (i % 5) * 1.5 + x * (3 - (-3 + (i % 5) * 1.5)) * 0.9, 1.4 + Math.sin(x * Math.PI) * 1.0, -1.6 + x * 2.1); g.scale.setScalar(0.7); }}><Bubble mark="!" c={i % 2 ? '#fecaca' : '#ffffff'} /></Anim>
      ))}
    </>
  );
}

/** Billboards going up beside a road: the leader's face on each, and cars going by. */
export function Billboards({ look, accent }: SceneProps) {
  return (
    <>
      <Ground c="#b9c9a8" />
      <Box s={[18, 0.03, 2.4]} c="#58606c" position={[0, 0.02, 1.6]} />
      <Box s={[18, 0.03, 0.1]} c="#e8e3d8" position={[0, 0.04, 1.6]} />
      {[-3.4, 0, 3.4].map((x, i) => (
        <Anim key={x} f={(t, g) => { const k = ease(t, 0.3 + i * 0.5, 1.1 + i * 0.5); g.scale.set(1, Math.max(0.001, k), 1); }} position={[x, 0, -1.2]}>
          <Prop kind="billboard" fallback={<><Box s={[0.14, 2.2, 0.14]} c="#6b4a2f" position={[-0.8, 1.1, 0]} /><Box s={[0.14, 2.2, 0.14]} c="#6b4a2f" position={[0.8, 1.1, 0]} /></>} />
          <Box s={[2.6, 1.5, 0.12]} c={accent} position={[0, 2.5, 0.05]} />
          <Box s={[2.7, 0.08, 0.16]} c="#e8e3d8" position={[0, 3.28, 0.05]} />
          <group position={[-0.55, 2.4, 0.16]} scale={0.34}><Bust look={look} accent="#e8e3d8" calm={false} /></group>
          <Box s={[0.9, 0.12, 0.03]} c="#fbf7ee" position={[0.5, 2.7, 0.13]} /><Box s={[0.7, 0.12, 0.03]} c="#fbf7ee" position={[0.4, 2.45, 0.13]} />
        </Anim>
      ))}
      {[['#d64b4b', 0], ['#3d6b8c', 1], ['#d09a3a', 2]].map(([c, i]) => (
        <Anim key={c as string} f={(t, g) => { g.position.set(-8 + ((t * 2.4 + (i as number) * 5) % 16), 0.2, 1.4 + ((i as number) % 2) * 0.4); }}><Box s={[1.0, 0.35, 0.5]} c={c as string} position={[0, 0.2, 0]} /><Box s={[0.55, 0.28, 0.46]} c="#bcd9ea" position={[-0.05, 0.5, 0]} /></Anim>
      ))}
      {[-5.6, 5.6].map((x, i) => <Flag key={x} c={accent} phase={i} position={[x, 0, -0.6]} />)}
    </>
  );
}

type MoneyKind = 'dinner' | 'crowdfund' | 'tycoon';

/** Money coming in: a fundraising dinner, thousands of small gifts, or one very large cheque with strings. */
export function Money({ look, accent, kind }: SceneProps & { kind: MoneyKind }) {
  const cols = crowdColors(accent);
  const tray = (x: number, z: number) => (
    <group position={[x, 0, z]}>
      <Box s={[1.1, 0.9, 0.7]} c="#e8dcc4" position={[0, 0.45, 0]} />
      <Anim f={(t, g) => { g.scale.y = Math.max(0.001, ease(t, 0.8, 3.6)); }} position={[0, 0.9, 0]}><Box s={[0.9, 0.9, 0.5]} c="#f2c230" e={0.25} position={[0, 0.45, 0]} /></Anim>
    </group>
  );
  return (
    <>
      <Ground c={kind === 'dinner' ? '#d9cbb0' : kind === 'tycoon' ? '#3a3f4d' : '#dfe6f2'} />
      <Box s={[24, 7, 0.1]} c={kind === 'tycoon' ? '#2a2f3c' : '#e8e3d8'} position={[0, 3.5, -3.4]} />
      {kind === 'dinner' && (
        <>
          {[[-2.6, -0.2], [0, 0.6], [2.6, -0.2]].map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
              <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.8, 0.8, 0.08, 20]} /><Mat c="#f3efe6" /></mesh><Box s={[0.1, 0.7, 0.1]} c="#6b4a2f" position={[0, 0.35, 0]} />
              {[0, 1, 2, 3].map((k) => <Figure key={k} color={cols[(i + k) % cols.length]} scale={0.55} arms={k % 2 ? 'up' : 'down'} cheer={0.15} phase={k + i} position={[Math.cos(k * 1.57) * 1.1, 0, Math.sin(k * 1.57) * 1.1]} />)}
            </group>
          ))}
          <Hero look={look} accent={accent} player position={[0, 0, -2.3]} arms="up" />
          {tray(3.3, 0.2)}
          {Array.from({ length: 14 }, (_, i) => <Anim key={i} f={(t, g) => { const x = ((t - 0.5 - i * 0.2) / 1.0); g.visible = x > 0 && x < 1; const sx = [-2.6, 0, 2.6][i % 3]; g.position.set(sx + (3.3 - sx) * x, 1 + Math.sin(x * Math.PI) * 1.6, 0.2 + (0.2 - 0.2) * x); g.rotation.y = t * 6; }}><Coin /></Anim>)}
        </>
      )}
      {kind === 'crowdfund' && (
        <>
          {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return <Figure key={i} color={cols[i % cols.length]} scale={0.6} arms="up" phase={i} cheer={0.3} position={[Math.cos(a) * 3.2, 0, Math.sin(a) * 2 + 0.3]} />; })}
          <group position={[0, 0, 0.3]}>
            <Box s={[1.6, 1.4, 1.2]} c="#dbeafe" op={0.45} position={[0, 0.7, 0]} />
            <Anim f={(t, g) => { g.scale.y = Math.max(0.001, ease(t, 0.8, 3.6)); }}><Box s={[1.4, 1.2, 1.0]} c="#f2c230" e={0.25} position={[0, 0.6, 0]} /></Anim>
          </group>
          {Array.from({ length: 22 }, (_, i) => <Anim key={i} f={(t, g) => { const x = ((t - 0.4 - i * 0.14) / 0.9); const a = (i % 16) / 16 * Math.PI * 2; g.visible = x > 0 && x < 1; g.position.set(Math.cos(a) * 3.2 * (1 - x), 1.3 + Math.sin(x * Math.PI) * 1.7, 0.3 + (Math.sin(a) * 2) * (1 - x)); g.rotation.y = t * 7; }}><Coin /></Anim>)}
          <Hero look={look} accent={accent} player position={[0, 0, -2.4]} arms="up" />
        </>
      )}
      {kind === 'tycoon' && (
        <>
          <Hero look={look} accent={accent} player position={[-1.1, 0, -1]} arms="point" />
          <Figure color="#15181f" pants="#15181f" position={[1.1, 0, -1]} arms="point" scale={1.15} head={<group position={[0, 1.6, 0]}><Ball r={0.19} c="#c98d62" /><mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.13, 0.15, 0.22, 14]} /><Mat c="#15181f" /></mesh><mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.27, 0.27, 0.03, 14]} /><Mat c="#15181f" /></mesh></group>} />
          <Box s={[1.5, 0.12, 0.8]} c="#6b4a2f" position={[0, 0.75, 0.3]} /><Box s={[0.12, 0.75, 0.6]} c="#6b4a2f" position={[-0.6, 0.38, 0.3]} /><Box s={[0.12, 0.75, 0.6]} c="#6b4a2f" position={[0.6, 0.38, 0.3]} />
          <group position={[0, 0.85, 0.3]}>
            <Box s={[0.7, 0.22, 0.46]} c="#2a2a33" position={[0, 0.11, 0]} />
            <Anim f={(t, g) => { g.rotation.x = -ease(t, 1.0, 1.6) * 1.8; }} position={[0, 0.22, -0.23]}><Box s={[0.7, 0.05, 0.46]} c="#3a3a44" position={[0, 0, 0.23]} /></Anim>
          </group>
          {Array.from({ length: 12 }, (_, i) => <Anim key={i} f={(t, g) => { const x = ((t - 1.4 - i * 0.18) / 1.2); g.visible = x > 0 && x < 1; g.position.set((rnd(i) - 0.5) * 0.7, 1.1 + x * 2.4, 0.3 + (rnd(i + 3) - 0.5) * 0.4); g.rotation.y = t * 6; }}><Coin /></Anim>)}
        </>
      )}
    </>
  );
}

/** The voters of the polling scene, when each steps off a van, and the way each walks: to the booth, a pause behind its screen, then to the ballot box. */
const VOTERS = [0, 1, 2, 3, 4, 5];
const voterAt = (i: number) => 0.7 + i * 0.3;
function voterPath(i: number, t: number): { x: number; z: number } {
  const a = t - voterAt(i);
  const from = { x: -2.7 + (i % 2) * 1.3, z: 0.05 };
  const booth = { x: 0.1 + (i % 2) * 0.8, z: -0.35 };
  const box = { x: 1.3 + (i % 3) * 0.5, z: -0.1 + (i % 2) * 0.55 };
  const k1 = ease(a, 0, 0.9), k2 = ease(a, 1.55, 2.2);
  return { x: from.x + (booth.x - from.x) * k1 + (box.x - booth.x) * k2, z: from.z + (booth.z - from.z) * k1 + (box.z - booth.z) * k2 };
}

/** A branch office going up and filling, and the vans that take people to vote. */
export function Build({ look, accent, kind }: SceneProps & { kind: 'build' | 'gotv' }) {
  const cols = crowdColors(accent);
  const plainBox = (
    <group>
      <Box s={[0.9, 1.1, 0.7]} c="#e8e3d8" position={[0, 0.55, 0]} /><Box s={[0.92, 0.1, 0.72]} c={accent} position={[0, 1.15, 0]} /><Box s={[0.4, 0.03, 0.04]} c="#1f1f26" position={[0, 1.22, 0.2]} />
    </group>
  );
  if (kind === 'build') {
    return (
      <>
        <Ground c="#b9c9a8" />
        <Anim f={(t, g) => { g.scale.y = Math.max(0.001, ease(t, 0.3, 1.8)); }} position={[0, 0, -1.8]}>
          <Box s={[3.2, 1.7, 2]} c="#e8dcc4" position={[0, 0.85, 0]} />
          <mesh position={[0, 2.0, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.7, 1, 1.15]}><coneGeometry args={[1.5, 0.8, 4]} /><Mat c="#a24b3a" /></mesh>
          <Box s={[2.4, 0.5, 0.08]} c={accent} position={[0, 1.55, 1.04]} /><Box s={[0.6, 1.1, 0.06]} c="#7b5a3a" position={[0, 0.55, 1.02]} />
        </Anim>
        <Flag c={accent} position={[2.2, 0, -0.9]} />
        {[0, 1, 2, 3].map((i) => <Anim key={i} f={(t, g) => { const x = ((t * 0.7 + i * 0.4) % 2.2); g.position.set(-3.6 + x * 2.2, 0, 0.2 + (i % 2) * 0.6); }}><Figure color={cols[i + 1]} walk={1} scale={0.8} arms="down" /></Anim>)}
        <Hero look={look} accent={accent} player position={[-1.8, 0, 0.5]} arms="point" />
        <Anim f={(t, g) => { g.visible = t > 2.2; }}><Crowd n={14} area={[-1.6, 1.6, -0.2, 0.9]} colors={cols} cheer={0.6} seed={21} cheerFrom={2.4} /></Anim>
      </>
    );
  }
  return (
    <>
      <Ground c="#b9c9a8" />
      <Box s={[18, 0.03, 2.2]} c="#58606c" position={[0, 0.02, 0.5]} />
      {[0, 1].map((i) => (
        <Anim key={i} f={(t, g) => { g.position.set(-8 + ease(t, 0.2 + i * 0.4, 1.4 + i * 0.4) * (4.4 + i * 1.6), 0, 0.5 + i * 0.1); }}>
          <Box s={[1.8, 0.9, 0.8]} c="#f3efe6" position={[0, 0.65, 0]} /><Box s={[1.82, 0.2, 0.82]} c={accent} position={[0, 0.7, 0]} />
          {[-0.6, 0.6].map((x) => <mesh key={x} position={[x, 0.2, 0.42]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 0.1, 12]} /><Mat c="#2a2a33" /></mesh>)}
        </Anim>
      ))}
      {/* the voting booth: the voters stand in front of its cardboard screen to mark their ballots, and stamp them in the party's colour */}
      <group position={[0.5, 0, -1.2]}>
        <ModelBoundary fallback={null}>
          <Suspense fallback={null}><VotingBoothModel accent={accent} scale={1.5} marks={VOTERS.map((i) => voterAt(i) + 1.05)} /></Suspense>
        </ModelBoundary>
      </group>
      {VOTERS.map((i) => (
        <Anim key={i} f={(t, g) => {
          const p = voterPath(i, t), q = voterPath(i, t + 0.06);
          g.visible = t >= voterAt(i);
          g.position.set(p.x, 0, p.z);
          // facing the way they are going; at the booth, towards its screen
          const at = t - voterAt(i), marking = at > 0.9 && at < 1.55;
          g.rotation.y = marking ? Math.PI : Math.atan2(q.x - p.x, q.z - p.z);
        }}><Figure color={cols[i % cols.length]} walk={0.8} scale={0.7} phase={i} arms="down" /></Anim>
      ))}
      <group position={[2.9, 0, -0.9]}>
        {/* the ballot box: the modelled one, and the plain box that stands in while it loads or if it cannot be had */}
        <ModelBoundary fallback={plainBox}>
          <Suspense fallback={plainBox}><BallotBoxModel accent={accent} scale={2.6} papers={VOTERS.length} first={voterAt(0) + 2.35} gap={0.24} /></Suspense>
        </ModelBoundary>
        <Anim f={(t, g) => { g.visible = t > 3.9; g.scale.setScalar(ease(t, 3.9, 4.2)); }} position={[0, 1.85, 0]}>
          <Box s={[0.14, 0.5, 0.06]} c="#16a34a" e={0.6} position={[0.12, 0.05, 0]} rotation={[0, 0, -0.7]} /><Box s={[0.14, 0.28, 0.06]} c="#16a34a" e={0.6} position={[-0.12, -0.05, 0]} rotation={[0, 0, 0.7]} />
        </Anim>
      </group>
      <Hero look={look} accent={accent} player position={[-4, 0, -1.7]} arms="wave" />
    </>
  );
}

/** The attack: the leader points, headlines and mud fly across, and the rival ducks. */
export function Attack({ look, accent, rival }: SceneProps) {
  return (
    <>
      <Ground c="#3a3f4d" />
      <Reporter accent={accent} position={[0, 0, 0.5]} rotation={[0, 0.1, 0]} scale={1.05} />
      <Box s={[24, 7, 0.1]} c="#2a2f3c" position={[0, 3.5, -3.4]} />
      <Box s={[0.9, 1.1, 0.7]} c={accent} position={[-2.4, 0.55, -1.2]} />
      <Hero look={look} accent={accent} player position={[-2.4, 0, -1.7]} arms="point" />
      <Anim f={(t, g) => { g.rotation.z = Math.sin(t * 9) * 0.1 * span(t, 1.0, 1.2, 3.2, 3.5); g.position.set(2.4, 0, -1.4 + Math.sin(t * 9) * 0.05 * span(t, 1.0, 1.2, 3.2, 3.5)); }}><Hero look={rival.look} accent={rival.accent} arms="up" talking={false} scale={1.1} /></Anim>
      {Array.from({ length: 12 }, (_, i) => (
        <Anim key={i} f={(t, g) => { const x = ((t - 0.5 - i * 0.22) / 0.8); g.visible = x > 0 && x < 1; g.position.set(-1.9 + x * 4.2, 1.5 + Math.sin(x * Math.PI) * 0.5, -1.4); g.rotation.z = x * 4; }}>{i % 3 === 0 ? <Bubble mark="!" c="#fecaca" /> : i % 3 === 1 ? <Ball r={0.13} c="#4a3526" /> : <Box s={[0.34, 0.02, 0.44]} c="#fffdf5" />}</Anim>
      ))}
      <Anim f={(t, g) => { g.visible = t > 1.1; g.position.y = 3 + Math.sin(t * 3) * 0.05; }} position={[2.4, 3, -1.4]}><Bubble mark="?" /></Anim>
    </>
  );
}
