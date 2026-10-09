import type { ReactNode } from 'react';
import { Figure, type Mood, type Pose } from './figure';

// The people of the pictures, by what they are in the story: a leader, a citizen, a crowd, the police, a reporter. Each stands on
// the point (0, 0). `i` is the figure's number in the picture, so that two of them are never the same person; `tone` is the
// temper of the scene (a scandal, a celebration), which their faces follow.

export type Tone = 'plain' | 'glad' | 'tense';
export interface Part {
  i: number;
  /** A prefix for the ids this picture defines (patterns, filters), so that two pictures never share one. */
  uid: string;
  tone: Tone;
}
export type Drawing = (p: Part) => ReactNode;

const INK = '#2a2623';
const PARTY = 'var(--primary, #b4342d)';

/** How one figure feels in a scene of a given temper: not all alike, but mostly of the scene's mind. */
export function feel(tone: Tone, i: number): Mood {
  const n = Math.abs(i);
  if (tone === 'glad') return (['glad', 'glad', 'calm', 'glad'] as const)[n % 4];
  if (tone === 'tense') return (['worried', 'cross', 'shock', 'worried', 'cross'] as const)[n % 5];
  return (['calm', 'glad', 'calm', 'worried', 'calm'] as const)[n % 5];
}

/** An ordinary citizen. */
export const person: Drawing = ({ i, uid, tone }) => <Figure i={i} uid={uid} mood={feel(tone, i)} pose={(['down', 'hips', 'fold', 'down', 'hold'] as Pose[])[Math.abs(i) % 5]} />;

/** A politician, talking with open hands: a party rosette on the chest, batik or a blazer, and often a songkok. */
export const leader: Drawing = ({ i, uid, tone }) => {
  const n = Math.abs(i);
  return (
    <Figure
      i={i} uid={uid} pose={(['out', 'point', 'out', 'wave', 'hips'] as Pose[])[n % 5]} mood={tone === 'tense' ? (n % 2 ? 'cross' : 'worried') : tone === 'glad' ? 'glad' : n % 3 ? 'calm' : 'glad'}
      look={{ outfit: (['batik', 'suit', 'melayu', 'batik'] as const)[n % 4], head: (['songkok', 'hair', 'songkok', 'hair', 'bald'] as const)[n % 5], build: [1.12, 1.2, 1.04][n % 3] }}
      rosette={PARTY} tie={n % 4 === 1 ? PARTY : undefined}
    />
  );
};

/** A pair in conversation, turned to each other. */
export const pair: Drawing = ({ i, uid, tone }) => (
  <g>
    <g transform="translate(-27 0)"><Figure i={i} uid={uid} pose="point" mood={feel(tone, i)} look={{ outfit: 'batik' }} /></g>
    <g transform="translate(27 0) scale(-1 1)"><Figure i={i + 3} uid={uid} pose="out" mood={feel(tone, i + 2)} /></g>
  </g>
);

/** A crowd: two rows of people, the ones behind smaller, some with an arm in the air and one with a blank placard. */
export const crowd: Drawing = ({ i, uid, tone }) => {
  const back = [-58, -22, 16, 54], front = [-76, -40, -2, 38, 74];
  const up: Pose[] = tone === 'tense' ? ['up', 'point', 'head', 'up', 'hips'] : ['up', 'down', 'wave', 'up', 'hold'];
  return (
    <g>
      {back.map((x, k) => <g key={`b${k}`} transform={`translate(${x} -17) scale(0.84)`} opacity="0.92"><Figure i={i + 11 + k * 3} uid={uid} pose={k % 2 ? 'up' : 'down'} mood={feel(tone, i + k + 7)} /></g>)}
      <g transform="translate(34 -18)"><rect x="-1.6" y="-166" width="3.2" height="66" fill="#8a6a3a" /><rect x="-17" y="-190" width="34" height="27" rx="2" fill="#efe6cf" /><path d="M-9 -182 l18 12 M9 -182 l-18 12" stroke={tone === 'glad' ? '#2f7d5b' : '#b4342d'} strokeWidth="3" strokeLinecap="round" /></g>
      {front.map((x, k) => <g key={`f${k}`} transform={`translate(${x} ${k % 2 ? 3 : 0}) scale(${(0.93 + (k % 3) * 0.04).toFixed(2)})`}><Figure i={i + k * 2} uid={uid} pose={up[k]} mood={feel(tone, i + k)} /></g>)}
    </g>
  );
};

/** Party people in a row: baju Melayu or batik, with the party's sash across the chest. */
export const chiefs: Drawing = ({ i, uid, tone }) => (
  <g>{[-46, 0, 46].map((x, k) => (
    <g key={k} transform={`translate(${x} ${k === 1 ? 0 : -3}) scale(${k === 1 ? 1 : 0.95})`}>
      <Figure i={i + k * 4} uid={uid} pose={(['fold', 'hips', 'down'] as Pose[])[k]} mood={feel(tone, i + k * 2)} look={{ outfit: k === 1 ? 'melayu' : 'batik', head: k === 2 ? 'hair' : 'songkok' }} sash={PARTY} />
    </g>
  ))}</g>
);

/** A police officer: dark blue uniform, a peaked cap, a belt and a baton. */
export const police: Drawing = ({ i, uid }) => (
  <Figure
    i={i + 2} uid={uid} pose="hips" mood="calm" look={{ outfit: 'shirt', cloth: '#2c4470', head: 'hair', glasses: false }}
    over={(
      <g>
        <path d="M-15 -118 Q0 -128 15 -118 L13 -123 Q0 -136 -13 -123z" fill="#22335a" /><path d="M-16 -117 q16 -5 32 0 l-1 3 q-15 -4 -30 0z" fill="#15171c" /><circle cx="0" cy="-124" r="2.2" fill="#e6c25a" />
        <rect x="-15" y="-52" width="30" height="5" fill="#15171c" /><rect x="-3" y="-53" width="6" height="7" fill="#e6c25a" />
        <rect x="16" y="-56" width="3.6" height="34" rx="1.8" fill="#15171c" transform="rotate(12 16 -56)" />
      </g>
    )}
  />
);

/** A worker in a hard hat and a reflective vest. */
export const worker: Drawing = ({ i, uid, tone }) => (
  <Figure
    i={i} uid={uid} pose={Math.abs(i) % 2 ? 'hips' : 'down'} mood={feel(tone, i)} look={{ outfit: 'tee', head: 'hair' }}
    over={(
      <g>
        <path d="M-14 -119 a14 13 0 0 1 28 0z" fill="#e8b92e" /><rect x="-16.5" y="-120.5" width="33" height="3.6" rx="1.8" fill="#c9980f" />
        <path d="M-13 -90 L-5 -90 L-5 -48 L-13 -48z M13 -90 L5 -90 L5 -48 L13 -48z" fill="#e8873a" /><path d="M-13 -66 h8 M5 -66 h8" stroke="#f6efe0" strokeWidth="3" />
      </g>
    )}
  />
);

/** A student: younger, in a T-shirt, with a satchel on the back and an arm in the air. */
export const student: Drawing = ({ i, uid, tone }) => (
  <g transform="scale(0.9)">
    <Figure i={i + 1} uid={uid} pose={(['up', 'wave', 'hold', 'up'] as Pose[])[Math.abs(i) % 4]} mood={tone === 'tense' ? 'cross' : 'glad'} look={{ outfit: 'tee', build: 0.94, moustache: false, hair: '#1f1a17', head: Math.abs(i) % 3 === 0 ? 'tudung' : 'hair' }} behind={<rect x="-22" y="-86" width="16" height="30" rx="5" fill="#c79a3f" />} />
  </g>
);

/** A reporter with a microphone held out and a press card on a lanyard. */
export const reporter: Drawing = ({ i, uid }) => (
  <Figure
    i={i + 4} uid={uid} pose="point" mood="calm" look={{ outfit: 'shirt' }}
    over={(
      <g>
        <path d="M-5 -92 L0 -70 L5 -92" fill="none" stroke="#b4342d" strokeWidth="1.6" /><rect x="-4.5" y="-71" width="9" height="11" rx="1.5" fill="#f1ece0" />
        <g transform="translate(51 -98) rotate(64)"><rect x="-2" y="0" width="4" height="15" fill="#4a4a4f" /><ellipse cx="0" cy="-4" rx="5.4" ry="7" fill="#26262b" /></g>
      </g>
    )}
  />
);

/** Someone with a hand up, asking. */
export const asker: Drawing = ({ i, uid, tone }) => <Figure i={i + 5} uid={uid} pose="wave" mood={tone === 'tense' ? 'cross' : 'worried'} />;

/** A delivery rider on a scooter, in a helmet, with a box on the back: the rider is drawn first and the scooter over their legs. */
export const rider: Drawing = ({ i, uid, tone }) => (
  <g>
    <rect x="-66" y="-92" width="38" height="36" rx="4" fill="#2f7d5b" /><path d="M-60 -80 h26 M-60 -70 h26" stroke="#f6efe0" strokeOpacity="0.6" strokeWidth="2" />
    <g transform="translate(-8 -34) scale(0.74)"><Figure i={i} uid={uid} pose="hold" mood={feel(tone, i)} look={{ outfit: 'tee', head: 'hair' }} over={<><path d="M-15.5 -112 a15.5 16.5 0 0 1 31 0 v5 h-31z" fill="#e6dcc2" /><path d="M-15.5 -109 h31" stroke={INK} strokeWidth="2" /></>} /></g>
    <path d="M-44 -18 Q-46 -50 -20 -52 H6 Q14 -52 18 -44 L30 -20 Q8 -10 -14 -12z" fill="#b4342d" />
    <path d="M22 -40 L34 -78 M26 -80 h18" fill="none" stroke="#2a2623" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M30 -64 q14 2 16 20 l-10 4z" fill="#e6dcc2" />
    <circle cx="-40" cy="-15" r="15" fill="#2a2623" /><circle cx="-40" cy="-15" r="6" fill="#b9b4aa" /><circle cx="40" cy="-15" r="15" fill="#2a2623" /><circle cx="40" cy="-15" r="6" fill="#b9b4aa" />
    <path d="M-58 -30 q18 -14 36 0" fill="none" stroke="#2a2623" strokeWidth="4" strokeLinecap="round" />
  </g>
);

/** A ruler in yellow, seated on a throne chair, with a tengkolok. */
export const ruler: Drawing = ({ i, uid }) => (
  <g>
    <path d="M-34 0 V-96 Q0 -116 34 -96 V0z" fill="#6d1f2c" /><path d="M-28 -6 V-88 Q0 -104 28 -88 V-6z" fill="#8a2a3b" /><rect x="-40" y="-52" width="12" height="52" rx="4" fill="#5a1824" /><rect x="28" y="-52" width="12" height="52" rx="4" fill="#5a1824" />
    <g transform="translate(0 -6) scale(0.86)">
      <Figure i={i + 6} uid={uid} pose="fold" mood="calm" look={{ outfit: 'melayu', cloth: '#e3b93a', head: 'hair', glasses: false, build: 1.1 }} over={<path d="M-14 -119 Q-10 -136 4 -134 Q16 -133 14 -119 Q6 -124 0 -122 Q-8 -124 -14 -119z M4 -134 l9 -9 l-2 12z" fill="#e3b93a" />} />
    </g>
  </g>
);
