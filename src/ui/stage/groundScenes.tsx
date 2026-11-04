import type { Look } from '../faces';
import { Anim, Ball, Banner, Box, Crowd, ease, Figure, Flag, Ground, Hero, House, Platform, rnd, span, Tree, Wave, Bubble, Mat } from './parts';

export interface SceneProps { look: Look; accent: string; rival: { look: Look; accent: string } }
export const crowdColors = (accent: string) => [accent, '#f3efe6', '#3d6b8c', '#a35a8f', '#2f7d5b', '#d09a3a'];

/** A fall of paper: small pieces drifting down over an area. */
function Confetti({ n = 30, area = 6, colors }: { n?: number; area?: number; colors: string[] }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Anim key={i} f={(t, g) => { const y = 4.6 - ((t * (0.9 + rnd(i) * 0.8) + rnd(i + 9) * 4) % 4.6); g.position.set((rnd(i + 1) - 0.5) * area, y, -1.5 + rnd(i + 2) * 4); g.rotation.set(t * 3 + i, t * 2, 0); }}>
          <Box s={[0.1, 0.02, 0.07]} c={colors[i % colors.length]} />
        </Anim>
      ))}
    </>
  );
}

/** A string of lights or bunting between two poles. */
function Bunting({ y = 3, w = 8, n = 12, colors }: { y?: number; w?: number; n?: number; colors: string[] }) {
  return (
    <group position={[0, y, -1]}>
      {Array.from({ length: n }, (_, i) => {
        const x = -w / 2 + (w * (i + 0.5)) / n;
        return <mesh key={i} position={[x, -Math.sin((i + 0.5) / n * Math.PI) * 0.45, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.18, 0.32, 3]} /><Mat c={colors[i % colors.length]} /></mesh>;
      })}
    </group>
  );
}

type RallyKind = 'ceramah' | 'megarally' | 'festival' | 'youth' | 'local' | 'charity';

/** A speaker on a platform and people in front of them: the ceramah, the mega rally, the festival, the youth meeting, the village hall and the charity drive. */
export function Rally({ look, accent, kind }: SceneProps & { kind: RallyKind }) {
  const cols = crowdColors(accent);
  const big = kind === 'megarally';
  return (
    <>
      <Ground c={kind === 'ceramah' ? '#8a9a7c' : '#b9c9a8'} />
      <Platform position={[0, 0, -2.6]} c={kind === 'festival' ? '#c98d3d' : '#8d6e4a'} w={big ? 5.6 : 4.2} />
      <Banner c={accent} position={[0, 0.3, -3.6]} w={big ? 5.6 : 4.2} h={big ? 2 : 1.5} />
      <Hero look={look} accent={accent} position={[0, 0.3, -2.6]} arms="wave" />
      <Anim f={(t, g) => { g.visible = t > 0.6; }} position={[0.7, 2.1, -2.2]}><Wave c={accent} count={3} max={kind === 'ceramah' ? 2.4 : 1.6} /></Anim>
      <Crowd n={kind === 'ceramah' ? 38 : big ? 110 : kind === 'local' ? 22 : kind === 'charity' ? 16 : 56} area={big ? [-5.5, 5.5, -0.6, 3.6] : [-3.6, 3.6, -0.6, 3.4]} colors={cols} seed={kind.length * 7} cheer={kind === 'charity' ? 0.2 : 0.9} />
      {kind === 'ceramah' && [-4.2, -2.1, 2.1, 4.2].map((x, i) => (
        <group key={x} position={[x, 0, -1.4]}><Box s={[0.06, 2.4, 0.06]} c="#6b4a2f" position={[0, 1.2, 0]} /><Anim f={(t, g) => { g.scale.setScalar(1 + Math.sin(t * 4 + i) * 0.08); }} position={[0, 2.55, 0]}><Ball r={0.22} c="#ffcf6b" e={0.9} /></Anim></group>
      ))}
      {big && Array.from({ length: 16 }, (_, i) => <Flag key={i} c={i % 2 ? accent : '#f3efe6'} phase={i} position={[-5 + (i % 8) * 1.4, 0, 0.4 + Math.floor(i / 8) * 1.6]} />)}
      {big && <Confetti colors={cols} />}
      {kind === 'festival' && (
        <>
          <Bunting colors={cols} />
          {[-4.2, 4.2].map((x) => <group key={x} position={[x, 0, -1]}><Box s={[1.4, 0.8, 0.9]} c="#e8dcc4" position={[0, 0.4, 0]} /><Box s={[1.6, 0.12, 1.1]} c={x < 0 ? '#d64b4b' : '#3d6b8c'} position={[0, 1.7, 0]} /><Box s={[0.06, 1.7, 0.06]} c="#6b4a2f" position={[-0.65, 0.85, 0.4]} /><Box s={[0.06, 1.7, 0.06]} c="#6b4a2f" position={[0.65, 0.85, 0.4]} /></group>)}
          <Confetti n={18} area={5} colors={cols} />
        </>
      )}
      {kind === 'youth' && Array.from({ length: 18 }, (_, i) => (
        <Anim key={i} f={(t, g) => { g.position.set(-3.4 + rnd(i) * 6.8, 1.6 + Math.sin(t * 3 + i) * 0.12, 0.2 + rnd(i + 4) * 2.8); g.visible = t > 0.9; }}><Box s={[0.1, 0.17, 0.02]} c="#fffbe0" e={1} /></Anim>
      ))}
      {kind === 'local' && (<><House position={[-3.4, 0, -3]} /><Tree position={[3.6, 0, -2.6]} /><Tree position={[-5, 0, -1.2]} /></>)}
      {kind === 'charity' && (
        <>
          <group position={[3.2, 0, -1.4]}>{[0, 1, 2].map((i) => <Box key={i} s={[0.6, 0.5, 0.6]} c={['#d09a3a', '#2f7d5b', '#3d6b8c'][i]} position={[(i - 1) * 0.65, 0.25, 0]} />)}<Box s={[1.3, 0.4, 0.6]} c="#e8dcc4" position={[0, 0.7, 0]} /></group>
          {[0, 1, 2, 3].map((i) => <Anim key={i} f={(t, g) => { const x = -3 + ((t * 0.5 + i * 0.9) % 3.8) * 1.6; g.position.set(x, 0, -0.3 + (i % 2) * 0.5); }}><Figure color={cols[i + 1]} walk={1} scale={0.7} arms="down" /></Anim>)}
        </>
      )}
    </>
  );
}

type WalkKind = 'walkabout' | 'canvass' | 'blitz';

/** A leader walking down a street with followers: a walkabout; stopping at doors: the canvass; and every branch at once: the blitz. */
export function Walk({ look, accent, kind }: SceneProps & { kind: WalkKind }) {
  const cols = crowdColors(accent);
  const stop = kind === 'canvass' ? 0.2 : 2.6;
  return (
    <>
      <Ground c="#b9c9a8" />
      <Box s={[16, 0.03, 2.4]} c="#58606c" position={[0, 0.02, 0.6]} />
      <Box s={[16, 0.03, 0.12]} c="#e8e3d8" position={[0, 0.04, 0.6]} />
      {[-5.4, -3, -0.6, 1.8, 4.2].map((x, i) => (
        <House key={x} position={[x, 0, -2.4]} roof={['#a24b3a', '#3d6b8c', '#8a6b3a', '#6b8a4a', '#a24b3a'][i]} open={i === 2 && kind !== 'walkabout' ? (t) => span(t, 1.4, 1.9, 3.2, 3.6) : i === 3 && kind === 'blitz' ? (t) => span(t, 1.9, 2.3, 3.4, 3.8) : undefined} />
      ))}
      <Tree position={[-6.6, 0, -1.4]} /><Tree position={[6.2, 0, -1.6]} />
      {kind === 'walkabout' && [[-3.4, 1.7], [-1.2, 1.9], [1.4, 1.8], [3.6, 1.7]].map(([x, z], i) => <Figure key={i} color={cols[i + 1]} position={[x, 0, z]} arms="wave" cheer={0.4} phase={i} scale={0.85} />)}
      <Anim f={(t, g) => { g.position.set(-5 + ease(t, 0.2, 3.4) * (stop + 5), 0, 0.5); }}>
        <Hero look={look} accent={accent} arms="wave" walk={1} scale={1.1} />
        {[1, 2, 3, kind === 'blitz' ? 4 : 3.5].map((k, i) => <Figure key={i} color={cols[(i + 2) % cols.length]} walk={1} arms={i % 2 ? 'wave' : 'down'} phase={i * 2} scale={0.85} position={[-k * 0.75, 0, 0.35 * ((i % 3) - 1)]} />)}
      </Anim>
      {kind === 'canvass' && (
        <>
          <Anim f={(t, g) => { g.visible = t > 1.9; g.position.set(-0.55, 0, -1.35); }}><Figure color="#d09a3a" scale={0.8} arms="wave" /></Anim>
          {Array.from({ length: 6 }, (_, i) => <Anim key={i} f={(t, g) => { const x = ((t - 1.6 - i * 0.18) / 0.8); g.visible = x > 0 && x < 1; g.position.set(-0.2 - x * 0.2, 1.3 + Math.sin(x * Math.PI) * 0.8, 0.45 - x * 1.7); g.rotation.set(x * 6, 0, 0.5); }}><Box s={[0.18, 0.02, 0.24]} c="#fffdf5" /></Anim>)}
        </>
      )}
      {kind === 'blitz' && [2.4, 3.1, 3.8].map((x, i) => <Anim key={i} f={(t, g) => { g.visible = t > 1.3 + i * 0.5; g.position.set(x, 0, -1.3); }}><Figure color={cols[i + 1]} scale={0.8} arms="wave" /></Anim>)}
      {kind === 'blitz' && Array.from({ length: 12 }, (_, i) => <Anim key={i} f={(t, g) => { const x = ((t - 1 - i * 0.2) / 0.9); g.visible = x > 0 && x < 1; g.position.set(0 + (i % 3) * 1.4 + x * 0.6, 1.2 + Math.sin(x * Math.PI) * 0.7, 0.4 - x * 1.6); g.rotation.set(x * 6, 0, 0.4); }}><Box s={[0.18, 0.02, 0.24]} c="#fffdf5" /></Anim>)}
    </>
  );
}

/** A speaker in the middle of a hall with people around: a town hall, hands going up and questions coming. */
export function Hall({ look, accent, kind }: SceneProps & { kind: 'townhall' | 'conference' }) {
  const cols = crowdColors(accent);
  if (kind === 'conference') {
    return (
      <>
        <Ground c="#d9d2c2" />
        <Box s={[24, 7, 0.1]} c="#e8e3d8" position={[0, 3.5, -3.4]} />
        <Box s={[4.4, 0.12, 1.5]} c="#8d6e4a" position={[-0.8, 0.78, -0.4]} />
        {[[-2.4, -1], [-1.2, -1], [0, -1], [-2.4, 0.2], [-1.2, 0.2], [0, 0.2]].map(([x, z], i) => <Figure key={i} color={cols[i % cols.length]} position={[x, 0.05, z]} scale={0.7} arms={i % 3 === 0 ? 'wave' : 'down'} phase={i} />)}
        {[[-2.4, -0.4], [-0.8, -0.4]].map(([x, z], i) => <Box key={i} s={[0.5, 0.04, 0.35]} c="#1f1f26" position={[x, 0.86, z]} />)}
        <group position={[2.6, 0, -1.6]}>
          <Box s={[1.8, 1.3, 0.06]} c="#ffffff" position={[0, 1.7, 0]} />
          <Box s={[0.06, 1.1, 0.06]} c="#6b4a2f" position={[-0.7, 0.55, 0]} /><Box s={[0.06, 1.1, 0.06]} c="#6b4a2f" position={[0.7, 0.55, 0]} />
          {[0.35, 0.6, 0.9, 1.15].map((h, i) => <Anim key={i} f={(t, g) => { g.scale.y = Math.max(0.001, ease(t, 0.5 + i * 0.35, 1.1 + i * 0.35)); }} position={[-0.6 + i * 0.4, 1.15, 0.04]}><Box s={[0.26, h, 0.04]} c={i % 2 ? accent : '#3d6b8c'} position={[0, h / 2, 0]} /></Anim>)}
        </group>
        <Hero look={look} accent={accent} position={[1.5, 0, -1.2]} arms="point" />
        <Anim f={(t, g) => { g.position.y = 2.7 + Math.sin(t * 2) * 0.05; g.visible = t > 0.8; }} position={[-0.8, 2.7, -0.4]}><Bubble mark="!" /></Anim>
      </>
    );
  }
  return (
    <>
      <Ground c="#d9d2c2" />
      <Box s={[24, 7, 0.1]} c="#e8e3d8" position={[0, 3.5, -3.6]} />
      <Banner c={accent} position={[0, 0.9, -3.5]} w={5} h={1.8} />
      <Crowd n={34} area={[-3.8, 3.8, 0.4, 3.2]} colors={cols} cheer={0.15} seed={4} />
      {[[-2.2, 0.4], [-0.4, 0.6], [1.9, 0.5], [3.1, 1.2]].map(([x, z], i) => <Anim key={i} f={(t, g) => { g.visible = t > 0.9 + i * 0.5; }} position={[x, 0, z]}><Figure color={cols[i + 1]} arms="up" scale={0.55} /></Anim>)}
      <Hero look={look} accent={accent} position={[0, 0, -1.2]} arms="point" />
      <Box s={[0.05, 0.9, 0.05]} c="#2a2a33" position={[0.55, 0.45, -0.9]} /><Ball r={0.07} c="#2a2a33" position={[0.55, 0.95, -0.9]} />
      {[[-2.2, 0.4], [-0.4, 0.6], [1.9, 0.5], [3.1, 1.2]].map(([x], i) => <Anim key={i} f={(t, g) => { g.visible = t > 1.3 + i * 0.55 && t < 3.9; g.position.set(x, 2.1 + ease(t, 1.3 + i * 0.55, 1.9 + i * 0.55) * 0.5, 0.5); g.scale.setScalar(0.7); }}><Bubble mark={i % 2 ? '!' : '?'} /></Anim>)}
    </>
  );
}
