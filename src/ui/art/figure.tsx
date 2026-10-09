import type { ReactNode } from 'react';

// One person of the pictures, drawn as an editorial cartoon would draw them: a head with a face that says how they feel, hair
// or a songkok or a headscarf, a shirt with a collar (batik, a baju Melayu with its sampin, a baju kurung, a blazer), arms that
// bend at the elbow, trousers and shoes. A figure stands on (0, 0), upward being negative, about 125 units tall. Who they are
// (skin, build, clothes, glasses, a moustache) comes from their number in the picture, so that no two neighbours are alike.

const INK = '#2a2623';
export const SKIN = ['#eec39a', '#dba878', '#c48a5c', '#a8724a', '#8a5a3c'];
/** Royal blue, campaign red and emerald, with the earth colours that most clothes are. */
export const CLOTH = ['#2f4f96', '#b4342d', '#2f7d5b', '#c79a3f', '#8a6a4a', '#7b8044', '#5d7791', '#b9846a', '#e6dcc2'];
const HAIR = ['#1f1a17', '#2a1d17', '#3a2a20', '#6f6a64', '#b9b4aa'];
const pick = <T,>(xs: readonly T[], i: number): T => xs[((i % xs.length) + xs.length) % xs.length];

export type Pose = 'down' | 'up' | 'out' | 'point' | 'hips' | 'head' | 'hold' | 'fold' | 'wave';
export type Mood = 'calm' | 'glad' | 'cross' | 'worried' | 'shock';
export type Outfit = 'batik' | 'shirt' | 'tee' | 'melayu' | 'kurung' | 'suit';
export type Headwear = 'hair' | 'songkok' | 'tudung' | 'bald' | 'bun';

export interface Look {
  skin: string; hair: string; head: Headwear; outfit: Outfit; cloth: string; cloth2: string;
  /** How broad, and how tall, against the ordinary (1). */
  build: number; tall: number;
  glasses: boolean; moustache: boolean;
}

/** Who a figure is, from their number: the same number is always the same person. */
export function lookOf(i: number): Look {
  const n = Math.abs(i);
  const woman = n % 5 === 2 || n % 7 === 4;
  const head: Headwear = woman ? (n % 3 === 0 ? 'bun' : 'tudung') : pick(['hair', 'songkok', 'hair', 'bald', 'songkok', 'hair'] as const, n);
  const outfit: Outfit = woman ? 'kurung' : pick(['batik', 'shirt', 'tee', 'batik', 'melayu', 'shirt', 'tee'] as const, n * 3 + 1);
  return {
    skin: pick(SKIN, n * 2 + 1), hair: n % 6 === 3 || n % 11 === 5 ? pick(HAIR, 3 + (n % 2)) : pick(HAIR, n), head, outfit,
    cloth: pick(CLOTH, n * 5 + 2), cloth2: pick(CLOTH, n * 3),
    build: [1, 1.12, 0.94, 1.06, 1.2, 0.98][n % 6], tall: [1, 0.95, 1.05, 0.98, 1.03][n % 5],
    glasses: n % 4 === 1, moustache: !woman && n % 5 === 3,
  };
}

// The angles of an arm, the upper part from the shoulder and the forearm from the elbow, for the left arm; the right is its mirror.
const ARMS: Record<Pose, [l1: number, l2: number, r1: number, r2: number]> = {
  down: [7, -5, -7, 5],
  up: [132, 28, -132, -28],
  out: [42, 58, -42, -58],
  point: [8, -6, -72, -24],
  hips: [40, -112, -40, 112],
  head: [110, 100, -110, -100],
  hold: [20, -82, -20, 82],
  fold: [14, -100, -14, 100],
  wave: [7, -5, -138, -22],
};

function Arm({ x, a1, a2, sleeve, skin, long }: { x: number; a1: number; a2: number; sleeve: string; skin: string; long: boolean }) {
  return (
    <g transform={`translate(${x} -87) rotate(${a1})`}>
      <rect x="-4.5" y="-2" width="9" height="24" rx="4.5" fill={sleeve} />
      <g transform={`translate(0 20) rotate(${a2})`}>
        <rect x="-3.8" y="-2" width="7.6" height="22" rx="3.8" fill={long ? sleeve : skin} />
        <circle cx="0" cy="21.5" r="4.8" fill={skin} />
      </g>
    </g>
  );
}

/** A face: brows, eyes, a nose, and a mouth that says how its owner feels. */
function Features({ mood, look }: { mood: Mood; look: Look }) {
  const line = { fill: 'none', stroke: INK, strokeWidth: 1.5, strokeLinecap: 'round' as const };
  const brows = {
    calm: 'M-8.5 -114 q3 -1.6 6 0 M2.5 -114 q3 -1.6 6 0',
    glad: 'M-8.5 -115 q3 -2.4 6 -0.4 M2.5 -115.4 q3 -2 6 0.4',
    cross: 'M-9 -116.5 l6.5 2.6 M9 -116.5 l-6.5 2.6',
    worried: 'M-9 -112.5 l6.5 -2.8 M9 -112.5 l-6.5 -2.8',
    shock: 'M-9 -117 q3 -2.4 6 -0.6 M3 -117.6 q3 -1.8 6 0.6',
  }[mood];
  const mouth = {
    calm: <path d="M-4.5 -99.5 q4.5 2.4 9 0" {...line} />,
    glad: <path d="M-6.5 -101.5 q6.5 8 13 0z" fill="#f6efe0" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />,
    cross: <path d="M-5.5 -98 q5.5 -4 11 0" {...line} />,
    worried: <path d="M-5 -98.6 q2.5 -2.2 5 0 q2.5 2.2 5 0" {...line} />,
    shock: <ellipse cx="0" cy="-98.5" rx="3.6" ry="4.6" fill="#3a2420" stroke={INK} strokeWidth="1.2" />,
  }[mood];
  const wide = mood === 'shock';
  return (
    <g>
      <path d={brows} {...line} strokeWidth="1.9" />
      {mood === 'glad'
        ? <path d="M-8 -109 q2.5 -3.4 5 0 M3 -109 q2.5 -3.4 5 0" {...line} strokeWidth="1.7" />
        : [-5.5, 5.5].map((x) => <g key={x}>{wide && <circle cx={x} cy="-109.5" r="3.4" fill="#f6efe0" stroke={INK} strokeWidth="1" />}<ellipse cx={x} cy="-109.5" rx={wide ? 1.4 : 1.7} ry={wide ? 1.4 : 2.2} fill={INK} stroke="none" /></g>)}
      <path d="M0.5 -108 q3.2 4.6 -1.2 5.4" {...line} strokeWidth="1.2" />
      {look.moustache && <path d="M-6 -101.5 q3 -2.6 6 -0.6 q3 -2 6 0.6 q-3 1.6 -6 0.2 q-3 1.4 -6 -0.2z" fill={look.hair} stroke={INK} strokeWidth="0.8" />}
      {mouth}
      {look.glasses && <g fill="#ffffff22" stroke={INK} strokeWidth="1.3"><circle cx="-5.5" cy="-109.5" r="4.4" /><circle cx="5.5" cy="-109.5" r="4.4" /><path d="M-1.1 -109.5 h2.2 M-9.9 -110 l-3.6 -1.4 M9.9 -110 l3.6 -1.4" fill="none" /></g>}
      {mood === 'worried' && <path d="M13.5 -117 q-2.6 4.2 0 6 q2.6 -1.8 0 -6z" fill="#9cc4d6" stroke={INK} strokeWidth="0.8" />}
    </g>
  );
}

function Head({ look, mood }: { look: Look; mood: Mood }) {
  const { head, hair, skin } = look;
  const scarf = look.cloth2;
  return (
    <g>
      {head === 'tudung' && <path d="M-17 -108 Q-18 -127 0 -127 Q18 -127 17 -108 L20 -85 Q0 -76 -20 -85z" fill={scarf} />}
      {head === 'bun' && <circle cx="0" cy="-125" r="6.5" fill={hair} />}
      <rect x="-4.5" y="-97" width="9" height="9" fill={skin} />
      {head !== 'tudung' && <><circle cx="-13" cy="-107" r="3.2" fill={skin} /><circle cx="13" cy="-107" r="3.2" fill={skin} /></>}
      <ellipse cx="0" cy="-108" rx={head === 'tudung' ? 10.5 : 13} ry={head === 'tudung' ? 12 : 14.2} fill={skin} />
      {(head === 'hair' || head === 'bun') && <path d="M-13.4 -109 Q-15.5 -124.5 0 -123.6 Q15.5 -124.5 13.4 -109 Q10 -117.5 2 -117 Q-7 -118.4 -13.4 -109z" fill={hair} />}
      {head === 'bald' && <path d="M-13.4 -107 q-1.6 -8 2.6 -11 q-0.6 6 -2.6 11z M13.4 -107 q1.6 -8 -2.6 -11 q0.6 6 2.6 11z" fill={hair} />}
      {head === 'songkok' && <><path d="M-13.4 -110 q-1 -6 1.8 -8 h23.2 q2.8 2 1.8 8 q-6 -5 -13.4 -5 q-7.4 0 -13.4 5z" fill={hair} /><path d="M-12.6 -117 L-11.4 -132 Q0 -135.4 11.4 -132 L12.6 -117 Q0 -113.6 -12.6 -117z" fill="#1d1c20" transform="rotate(-4 0 -124)" /></>}
      {head === 'tudung' && <path d="M-11 -111 Q-12 -122.5 0 -122.5 Q12 -122.5 11 -111 Q6 -117 0 -117 Q-6 -117 -11 -111z" fill={scarf} />}
      <Features mood={mood} look={look} />
      {head === 'tudung' && <path d="M-15.5 -97 Q0 -84 15.5 -97 L18 -78 Q0 -67 -18 -78z" fill={scarf} />}
    </g>
  );
}

export interface FigureProps {
  i: number; uid: string; pose?: Pose; mood?: Mood;
  /** Anything about the figure that is not left to their number. */
  look?: Partial<Look>;
  /** A tie, a sash across the chest or a party rosette, in a colour. */
  tie?: string; sash?: string; rosette?: string;
  /** Drawn on the back, behind the body (a satchel), and in front of everything (a hat, a vest). */
  behind?: ReactNode; over?: ReactNode;
}

export function Figure({ i, uid, pose = 'down', mood = 'calm', look: given, tie, sash, rosette, behind, over }: FigureProps) {
  const look = { ...lookOf(i), ...given };
  const { outfit, cloth, skin, build } = look;
  const batik = `url(#${uid}batik)`;
  const sw = 17 * build, hw = (outfit === 'kurung' ? 15 : 14) * build * (build > 1.1 ? 1.12 : 1);
  const shirt = outfit === 'batik' ? batik : outfit === 'suit' ? '#3a4150' : cloth;
  const long = outfit === 'melayu' || outfit === 'kurung' || outfit === 'suit';
  const hem = outfit === 'kurung' ? -28 : outfit === 'melayu' ? -38 : -44;
  const [l1, l2, r1, r2] = ARMS[pose];
  const fold = { fill: 'none', stroke: INK, strokeOpacity: 0.45, strokeWidth: 1.1, strokeLinecap: 'round' as const };
  return (
    <g transform={`scale(${(0.96 + (build - 1) * 0.1).toFixed(3)} ${look.tall})`}>
      {behind}
      {outfit === 'kurung'
        ? <><path d={`M${-hw} -34 L${-hw - 4} -5 L${hw + 4} -5 L${hw} -34z`} fill={look.cloth2} /><ellipse cx="-7" cy="-2.5" rx="6.5" ry="3.4" fill="#3a2f2a" /><ellipse cx="7" cy="-2.5" rx="6.5" ry="3.4" fill="#3a2f2a" /></>
        : <>
          <path d={`M${-hw} -46 L${-hw - 0.6} -5 L-2.6 -5 L-0.6 -46z`} fill={outfit === 'melayu' ? cloth : '#3b3f4a'} />
          <path d={`M${hw} -46 L${hw + 0.6} -5 L2.6 -5 L0.6 -46z`} fill={outfit === 'melayu' ? cloth : '#3b3f4a'} />
          <ellipse cx={-hw / 2 - 2.4} cy="-2.5" rx="8" ry="3.8" fill="#26211e" /><ellipse cx={hw / 2 + 2.4} cy="-2.5" rx="8" ry="3.8" fill="#26211e" />
        </>}
      <Arm x={-sw + 2} a1={l1} a2={l2} sleeve={shirt} skin={skin} long={long} />
      <path d={`M${-sw} -85 Q${-sw - 1.5} -91 ${-sw + 6} -92 L${sw - 6} -92 Q${sw + 1.5} -91 ${sw} -85 L${hw} ${hem} L${-hw} ${hem}z`} fill={shirt} />
      {outfit === 'melayu' && <path d={`M${-hw - 0.6} -54 L${hw + 0.6} -54 L${hw + 1.4} -30 L${-hw - 1.4} -30z`} fill={batik} />}
      {outfit === 'suit' && <><path d="M-6 -92 L0 -70 L6 -92z" fill="#f1ece0" /><path d={`M-6 -92 L0 -70 L-3 -60 L${-sw + 5} -84z M6 -92 L0 -70 L3 -60 L${sw - 5} -84z`} fill="#2c323e" /></>}
      {(outfit === 'shirt' || outfit === 'batik') && <><path d="M-6 -92 L0 -84 L6 -92" {...fold} strokeOpacity={0.8} strokeWidth="1.4" /><path d={`M0 -84 V${hem + 2}`} {...fold} /></>}
      {outfit === 'tee' && <path d="M-6 -92 q6 5 12 0" {...fold} strokeOpacity={0.8} strokeWidth="1.4" />}
      {outfit === 'melayu' && <>{[-84, -77, -70].map((y) => <circle key={y} cx="0" cy={y} r="1.1" fill="#e6c25a" stroke="none" />)}<path d="M-5 -92 h10" {...fold} strokeOpacity={0.9} strokeWidth="2" /></>}
      <path d={`M${hw * 0.5} -60 q2 8 -1 14 M${-hw * 0.6} -52 q-1 3 1 6`} {...fold} />
      {/* the side away from the light, a wash that the hatching then finds */}
      <path className="soft" d={`M2 -92 L${sw - 6} -92 Q${sw + 1.5} -91 ${sw} -85 L${hw} ${hem} L3 ${hem}z`} fill={INK} fillOpacity="0.14" />
      {tie && <path d="M0 -90 l-3.2 6 l3.2 20 l3.2 -20z" fill={tie} />}
      {sash && <path d={`M${-sw + 2} -90 L${hw} ${hem + 8} l0 9 L${-sw + 0.5} -80z`} fill={sash} />}
      {rosette && <g><circle cx={-sw * 0.5} cy="-76" r="4.6" fill={rosette} /><path d={`M${-sw * 0.5 - 2} -72 l-1.6 7 l3.6 -3 l3.6 3 l-1.6 -7`} fill={rosette} /></g>}
      <Arm x={sw - 2} a1={r1} a2={r2} sleeve={shirt} skin={skin} long={long} />
      <Head look={look} mood={mood} />
      {over}
    </g>
  );
}
