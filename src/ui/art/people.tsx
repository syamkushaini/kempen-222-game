import type { ReactNode } from 'react';

// The people of the pictures. Every figure is drawn standing on the point (0, 0), upward being negative, about a hundred units
// tall at scale 1. `i` is the figure's number in the picture, so that two of them never wear the same thing.

export interface Part { i: number; /** A prefix for the ids this picture defines (patterns, filters), so that two pictures never share one. */ uid: string }
export type Drawing = (p: Part) => ReactNode;

export const SKIN = ['#f0c08a', '#d99a62', '#b9764a', '#8a5a3a'];
export const CLOTH = ['#2f4f96', '#b4342d', '#2f7d5b', '#c79a3f', '#8a5a3a', '#7b8044', '#4a6a8a'];
const DARK = '#2a2f3a';
const pick = <T,>(xs: T[], i: number) => xs[((i % xs.length) + xs.length) % xs.length];

type Head = 'hair' | 'songkok' | 'tudung' | 'bald';
const headOf = (i: number): Head => (['hair', 'songkok', 'tudung', 'hair', 'bald', 'songkok'] as Head[])[i % 6];

/** A head on a neck at the given height: hair, a songkok, a headscarf or nothing. */
function Face({ y, i, kind = headOf(i), r = 11 }: { y: number; i: number; kind?: Head; r?: number }) {
  const skin = pick(SKIN, i);
  return (
    <g>
      {kind === 'tudung' && <path d={`M${-r - 3} ${y + 6} a${r + 3} ${r + 5} 0 0 1 ${2 * r + 6} 0 v10 h${-(2 * r + 6)} z`} fill={pick(CLOTH, i + 2)} />}
      <circle cx="0" cy={y} r={r} fill={skin} />
      {kind === 'hair' && <path d={`M${-r} ${y - 1} a${r} ${r} 0 0 1 ${2 * r} 0 q${-r} ${-5} ${-2 * r} 0z`} fill="#2a1d17" />}
      {kind === 'songkok' && <rect x={-r + 1} y={y - r - 3} width={2 * r - 2} height="9" rx="3" fill="#15171c" />}
      {kind === 'tudung' && <path d={`M${-r + 1} ${y - 2} a${r} ${r} 0 0 1 ${2 * r - 2} 0 v9 a${r} ${r + 2} 0 0 1 ${-(2 * r - 2)} 0z`} fill={pick(CLOTH, i + 2)} opacity="0.0" />}
      <circle cx={-4} cy={y} r="1.3" fill={DARK} /><circle cx="4" cy={y} r="1.3" fill={DARK} />
    </g>
  );
}

export function Body({ i, uid, arms = 'down', tie, sash, bag }: { i: number; uid: string; arms?: 'down' | 'up' | 'out' | 'point'; tie?: string; sash?: string; bag?: boolean }) {
  const cloth = pick(CLOTH, i), skin = pick(SKIN, i);
  // Every fourth figure is in a batik shirt, with the sleeves rolled up to the elbow, as the weather and the habit would have it.
  const batik = i % 4 === 0 && !sash;
  const shirt = batik ? `url(#${uid}batik)` : cloth;
  // Each arm hangs from its shoulder and is turned about it: out, up or pointing, as the figure needs.
  const arm = {
    down: [['-15', '-78', 'rotate(4)'], ['15', '-78', 'rotate(-4)']],
    up: [['-15', '-78', 'rotate(148)'], ['15', '-78', 'rotate(-148)']],
    out: [['-15', '-78', 'rotate(66)'], ['15', '-78', 'rotate(-66)']],
    point: [['-15', '-78', 'rotate(4)'], ['15', '-78', 'rotate(-98)']],
  }[arms];
  return (
    <g>
      <rect x="-10" y="-40" width="8" height="40" rx="3" fill={DARK} /><rect x="2" y="-40" width="8" height="40" rx="3" fill={DARK} />
      {bag && <rect x="-24" y="-70" width="12" height="30" rx="4" fill="#c79a3f" />}
      <rect x="-15" y="-82" width="30" height="46" rx="11" fill={shirt} />
      {arm.map(([x, y, r], k) => (
        <g key={k} transform={`translate(${x} ${y}) ${r}`}>
          <rect x="-3.5" width="7" height="18" rx="3.5" fill={shirt} /><rect x="-3.5" y="14" width="7" height="21" rx="3.5" fill={skin} /><circle cx="0" cy="36" r="4.2" fill={skin} />
        </g>
      ))}
      {tie && <path d="M0 -80 l-4 10 l4 16 l4 -16z" fill={tie} />}
      {sash && <path d="M-15 -80 L15 -52 l0 8 L-15 -72z" fill={sash} />}
      <Face y={-94} i={i} />
    </g>
  );
}

/** An ordinary citizen. */
export const person: Drawing = ({ i, uid }) => <Body uid={uid} i={i} />;
/** Someone in a suit and tie, arms out: a politician talking. */
export const leader: Drawing = ({ i, uid }) => <Body uid={uid} i={i} arms="out" tie="var(--primary, #c0392b)" />;
/** A pair, facing each other. */
export const pair: Drawing = ({ i, uid }) => (
  <g><g transform="translate(-26 0)"><Body uid={uid} i={i} arms="point" tie="#d9d9de" /></g><g transform="translate(26 0) scale(-1 1)"><Body uid={uid} i={i + 3} arms="out" /></g></g>
);
/** Four or five of them, arms in the air. */
export const crowd: Drawing = ({ i, uid }) => (
  <g>{[-62, -30, 0, 31, 62].map((x, k) => <g key={k} transform={`translate(${x} ${k % 2 ? -4 : 0}) scale(${0.9 + (k % 3) * 0.06})`}><Body uid={uid} i={i + k} arms={k % 2 ? 'up' : 'down'} /></g>)}</g>
);
/** A row of party people in sashes. */
export const chiefs: Drawing = ({ i, uid }) => (
  <g>{[-44, 0, 44].map((x, k) => <g key={k} transform={`translate(${x} 0)`}><Body uid={uid} i={i + k} sash="var(--primary, #c0392b)" tie="#eee" /></g>)}</g>
);
/** A police officer with a cap. */
export const police: Drawing = ({ i, uid }) => (
  <g><Body uid={uid} i={i + 2} arms="down" /><rect x="-12" y="-110" width="24" height="9" rx="3" fill="#1f3a68" /><rect x="-15" y="-103" width="30" height="4" rx="2" fill="#15171c" /><rect x="-15" y="-82" width="30" height="46" rx="11" fill="#2d4a7d" /><rect x="12" y="-60" width="4" height="30" rx="2" fill="#15171c" /></g>
);
/** A worker in a hard hat. */
export const worker: Drawing = ({ i, uid }) => (
  <g><Body uid={uid} i={i} arms="down" /><path d="M-12 -98 a12 12 0 0 1 24 0z" fill="#f2c230" /><rect x="-14" y="-99" width="28" height="3" rx="1.5" fill="#d9a40f" /><rect x="-15" y="-60" width="30" height="5" fill="#f2c230" opacity="0.85" /></g>
);
/** A student with a satchel. */
export const student: Drawing = ({ i, uid }) => <g transform="scale(0.88)"><Body uid={uid} i={i + 1} arms="up" bag /></g>;
/** A reporter with a microphone held out. */
export const reporter: Drawing = ({ i, uid }) => (
  <g><Body uid={uid} i={i + 4} arms="point" /><g transform="translate(36 -84)"><rect x="-2" y="0" width="4" height="14" fill="#555" /><circle cx="0" cy="-2" r="6" fill="#222" /></g></g>
);
/** A woman or man at the front with a hand raised to ask. */
export const asker: Drawing = ({ i, uid }) => <Body uid={uid} i={i + 5} arms="up" />;
/** A figure on a motorbike with a delivery box. */
export const rider: Drawing = ({ i, uid }) => (
  <g>
    <circle cx="-34" cy="-14" r="14" fill="none" stroke={DARK} strokeWidth="5" /><circle cx="34" cy="-14" r="14" fill="none" stroke={DARK} strokeWidth="5" />
    <path d="M-34 -14 L-6 -40 H22 L34 -14 M-6 -40 L-12 -64 H4" fill="none" stroke="#c0392b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="-52" y="-78" width="34" height="30" rx="4" fill="#2f9e6f" />
    <g transform="translate(6 0) scale(0.7)"><Body uid={uid} i={i} arms="point" /></g>
  </g>
);
/** A ruler, in yellow, seated on a throne chair. */
export const ruler: Drawing = () => (
  <g>
    <rect x="-26" y="-70" width="52" height="70" rx="8" fill="#6d1f2c" /><rect x="-20" y="-30" width="40" height="30" rx="4" fill="#8a2a3b" />
    <rect x="-13" y="-76" width="26" height="40" rx="10" fill="#e8bd2f" /><circle cx="0" cy="-86" r="11" fill="#d99a62" /><rect x="-12" y="-100" width="24" height="9" rx="3" fill="#15171c" /><rect x="-12" y="-97" width="24" height="3" fill="#e8bd2f" />
  </g>
);
