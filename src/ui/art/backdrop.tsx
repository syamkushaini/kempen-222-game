import type { ReactNode } from 'react';

// What lies behind and in front of the people in a picture, so that a scene has depth: a far line of trees or of a town, clouds
// or stars, birds, tufts of grass or the boards of a floor going away to a point, and something close to the eye in a bottom
// corner (leaves outdoors, the back of a plastic chair indoors). Drawn from the scene's number, so each scene keeps its own.

const INK = '#2a2623';
const W = 800, H = 450;
/** A number between 0 and 1 from two others: the same every time. */
const rnd = (seed: number, k: number): number => { const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const line = { fill: 'none', stroke: INK, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function Cloud({ x, y, s, dark }: { x: number; y: number; s: number; dark: boolean }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M-52 6 q-16 -2 -12 -16 q4 -12 18 -9 q4 -16 22 -15 q16 1 20 14 q16 -5 22 8 q5 14 -12 18z"
      fill={dark ? '#8d939c' : '#f6f1e4'} fillOpacity={dark ? 0.75 : 0.82} stroke={INK} strokeOpacity="0.5" strokeWidth="1.3" strokeLinejoin="round"
    />
  );
}

/** A coconut palm seen far off: a leaning trunk and a few fronds. */
function FarPalm({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} {...line} strokeOpacity="0.55" strokeWidth="1.6">
      <path d="M0 0 q5 -22 -2 -44" />
      {[-150, -110, -70, -30, 10].map((a) => <path key={a} d="M-2 -44 q12 -8 22 4" transform={`rotate(${a} -2 -44)`} />)}
    </g>
  );
}

/** Behind everything: the far line, the sky's furniture, and the texture of the ground. */
export function Backdrop({ sky, ground, town, hasHills, horizon, feet, seed }: { sky: string; ground: string; town: boolean; hasHills: boolean; horizon: number; feet: number; seed: number }): ReactNode {
  if (sky === 'room') {
    // The floor's boards run away to a point behind the wall.
    const vx = 400 + (rnd(seed, 1) - 0.5) * 120;
    return (
      <g className="soft" {...line} strokeOpacity="0.32" strokeWidth="1.2">
        {Array.from({ length: 13 }, (_, k) => { const x = -140 + k * 90; return <path key={k} d={`M${vx + (x - vx) * 0.62} ${feet} L${x} ${H}`} />; })}
        {[14, 36, 66].map((d) => <path key={d} d={`M0 ${feet + d} H${W}`} />)}
      </g>
    );
  }
  const night = sky === 'night', storm = sky === 'storm';
  const far: ReactNode[] = [];
  if (!hasHills && ground !== 'water') {
    if (town) {
      // A town on the skyline: blocks of different heights, with a few lit windows.
      let x = -10;
      for (let k = 0; x < W + 10; k++) {
        const w = 26 + rnd(seed, k) * 34, h = 22 + rnd(seed, k + 50) * 74;
        far.push(<g key={`t${k}`}><rect x={x} y={horizon - h} width={w} height={h + 2} fill={night ? '#3d4660' : '#8e97a1'} fillOpacity="0.6" stroke={INK} strokeOpacity="0.35" strokeWidth="1" />
          {h > 44 && Array.from({ length: 3 }, (_, r) => <rect key={r} x={x + 5 + (r % 2) * (w * 0.4)} y={horizon - h + 8 + r * 12} width="4" height="5" fill={night ? '#f2d98a' : '#e9e4d4'} fillOpacity="0.8" stroke="none" />)}</g>);
        x += w + 2 + rnd(seed, k + 90) * 10;
      }
    } else {
      // The country: a broken line of trees, with a kampung roof and palms here and there.
      const pts = Array.from({ length: 31 }, (_, k) => `${k * 28 - 20} ${horizon - 10 - rnd(seed, k) * 20}`);
      far.push(<path key="trees" d={`M-20 ${horizon + 2} L${pts.join(' L')} L${W + 20} ${horizon + 2}z`} fill={night ? '#3f5348' : '#6f8a72'} fillOpacity="0.6" stroke={INK} strokeOpacity="0.35" strokeWidth="1.1" strokeLinejoin="round" />);
      for (let k = 0; k < 3; k++) far.push(<FarPalm key={`p${k}`} x={60 + rnd(seed, k + 20) * 680} y={horizon - 8} s={0.7 + rnd(seed, k + 30) * 0.5} />);
      const rx = 120 + rnd(seed, 40) * 520;
      far.push(<g key="roof" transform={`translate(${rx} ${horizon - 6})`}><path d="M-18 0 v-12 h36 v12z" fill="#b99a6e" fillOpacity="0.7" stroke={INK} strokeOpacity="0.4" strokeWidth="1" /><path d="M-23 -12 L0 -27 L23 -12z" fill="#8a4a3c" fillOpacity="0.75" stroke={INK} strokeOpacity="0.4" strokeWidth="1" /></g>);
    }
  }
  const skyThings: ReactNode[] = [];
  if (night) for (let k = 0; k < 16; k++) { const x = rnd(seed, k + 60) * W, y = 26 + rnd(seed, k + 70) * 170; skyThings.push(<path key={`s${k}`} d={`M${x - 3} ${y} h6 M${x} ${y - 3} v6`} stroke="#f4efd6" strokeWidth="1.3" strokeLinecap="round" />); }
  else {
    for (let k = 0; k < 3; k++) skyThings.push(<Cloud key={`c${k}`} x={90 + k * 260 + rnd(seed, k + 3) * 110} y={54 + rnd(seed, k + 9) * 74} s={0.8 + rnd(seed, k + 12) * 0.6} dark={storm} />);
    if (!storm && sky !== 'haze') for (let k = 0; k < 3; k++) { const x = 240 + rnd(seed, k + 80) * 380, y = 80 + rnd(seed, k + 84) * 70; skyThings.push(<path key={`b${k}`} d={`M${x} ${y} q5 -6 10 0 q5 -6 10 0`} {...line} strokeOpacity="0.6" strokeWidth="1.4" />); }
  }
  const tufts: ReactNode[] = [];
  if (ground === 'grass') {
    for (let k = 0; k < 30; k++) {
      const y = horizon + 14 + rnd(seed, k + 100) * (H - horizon - 26), x = rnd(seed, k + 140) * W, s = 0.7 + ((y - horizon) / (H - horizon)) * 1.1;
      tufts.push(<path key={`g${k}`} d={`M${x} ${y} l${-3 * s} ${-8 * s} M${x} ${y} l${1 * s} ${-11 * s} M${x} ${y} l${4.5 * s} ${-7 * s}`} {...line} strokeOpacity="0.45" strokeWidth="1.2" />);
    }
  } else if (ground === 'sand' || ground === 'tile') {
    for (let k = 0; k < 40; k++) tufts.push(<circle key={`d${k}`} cx={rnd(seed, k + 100) * W} cy={horizon + 12 + rnd(seed, k + 140) * (H - horizon - 20)} r="1.1" fill={INK} fillOpacity="0.35" stroke="none" />);
  }
  return <g className="soft">{skyThings}{far}{tufts}</g>;
}

/** In front of everything, in a bottom corner: leaves outdoors, the back of a plastic chair indoors. */
export function Foreground({ sky, ground, seed }: { sky: string; ground: string; seed: number }): ReactNode {
  if (ground === 'water') return null;
  const left = rnd(seed, 200) < 0.5;
  const flip = left ? '' : `translate(${W} 0) scale(-1 1)`;
  if (sky === 'room') {
    // The back of a plastic chair, close to the eye, as from a seat in the room.
    const c = (['#b4342d', '#2f4f96', '#d8cfb6'] as const)[seed % 3];
    return (
      <g transform={flip}>
        <g className="part">
          <path d="M18 458 L26 372 Q28 356 44 354 L112 354 Q128 356 130 372 L138 458z" fill={c} />
          {[52, 78, 104].map((x) => <rect key={x} x={x - 7} y="376" width="14" height="52" rx="6" fill="#00000030" />)}
        </g>
        <path className="soft" d="M78 354 L112 354 Q128 356 130 372 L138 458 L82 458z" fill={INK} fillOpacity="0.16" />
      </g>
    );
  }
  // Broad leaves coming in from the corner, as a banana clump would.
  const leaf = (a: number, l: number, k: number) => (
    <g key={k} transform={`translate(18 462) rotate(${a})`}>
      <path d={`M0 0 Q${l * 0.26} ${-l * 0.5} 0 ${-l} Q${-l * 0.26} ${-l * 0.5} 0 0z`} fill={sky === 'night' ? '#3d5a48' : '#5f8a5c'} />
      <path d={`M0 0 V${-l}`} fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="1.5" />
    </g>
  );
  return (
    <g transform={flip}>
      <g className="part">{[[-24, 120], [8, 150], [38, 128], [64, 96]].map(([a, l], k) => leaf(a, l, k))}</g>
      <path className="soft" d="M-10 462 L-10 330 Q60 360 150 462z" fill={INK} fillOpacity="0.16" />
    </g>
  );
}
