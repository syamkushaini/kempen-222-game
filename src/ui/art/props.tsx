import type { Drawing } from './people';

// The things in the pictures: furniture, papers, money, weather. Each stands on the point (0, 0). The wide ones (rain, haze,
// water) reach about 450 units either side, so they are put in the middle of the picture.

const INK = '#2a2f3a';
const Paper = ({ x = 0, y = 0, r = 0, w = 36, h = 46, lines = 5, fill = '#f6f4ee' }: { x?: number; y?: number; r?: number; w?: number; h?: number; lines?: number; fill?: string }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}><rect width={w} height={h} rx="2" fill={fill} stroke="#0002" />{Array.from({ length: lines }, (_, k) => <rect key={k} x="5" y={6 + k * ((h - 12) / lines)} width={w - 10 - (k % 3) * 6} height="2.4" rx="1" fill="#8a909c" />)}</g>
);

/** A lectern with a microphone. */
export const podium: Drawing = () => (
  <g><path d="M-26 -62 H26 L20 0 H-20z" fill="#6b4a32" /><rect x="-30" y="-68" width="60" height="8" rx="2" fill="#8a5d33" /><rect x="-1.5" y="-96" width="3" height="28" fill="#555" /><circle cx="0" cy="-98" r="5" fill="#222" /><rect x="-10" y="-52" width="20" height="14" rx="2" fill="var(--primary, #c0392b)" /></g>
);
/** A bunch of microphones from the press. */
export const mics: Drawing = () => (
  <g>{[-18, -6, 6, 18].map((x, k) => <g key={x} transform={`rotate(${(k - 1.5) * 9} 0 0)`}><rect x={x - 1.5} y="-70" width="3" height="46" fill="#555" /><circle cx={x} cy="-74" r="6" fill={['#d83a3a', '#2b5f9e', '#e8c56b', '#2f9e6f'][k]} /></g>)}</g>
);
/** A television camera on legs. */
export const camera: Drawing = () => (
  <g><path d="M0 -34 L-16 0 M0 -34 L16 0 M0 -34 V0" stroke="#444" strokeWidth="3" /><rect x="-26" y="-64" width="46" height="28" rx="4" fill="#2a2f3a" /><rect x="18" y="-58" width="20" height="16" rx="3" fill="#3a4150" /><circle cx="36" cy="-50" r="6" fill="#8fb8d9" /><circle cx="-18" cy="-58" r="3" fill="#d83a3a" /></g>
);
/** A newspaper, headline and photograph. */
export const newspaper: Drawing = () => (
  <g transform="rotate(-6)"><rect x="-44" y="-62" width="88" height="62" rx="3" fill="#efece4" stroke="#0002" /><rect x="-38" y="-56" width="76" height="12" fill={INK} /><rect x="-38" y="-38" width="32" height="26" fill="#9aa3b0" />{[0, 1, 2, 3].map((k) => <rect key={k} x="-2" y={-38 + k * 8} width="40" height="3" fill="#8a909c" />)}</g>
);
/** A stack of papers. */
export const docs: Drawing = () => (
  <g><Paper x={-26} y={-52} r={-8} /><Paper x={-12} y={-56} r={4} /><Paper x={-4} y={-50} r={-2} w={36} h={46} /></g>
);
/** A sack of money. */
export const moneybag: Drawing = () => (
  <g><path d="M-26 0 Q-40 -40 -14 -62 H14 Q40 -40 26 0z" fill="#b99a4c" /><path d="M-14 -62 l-6 -12 h40 l-6 12z" fill="#b99a4c" /><rect x="-12" y="-66" width="24" height="5" fill="#7a5a28" /><text x="0" y="-22" textAnchor="middle" fontSize="30" fontWeight="700" fill="#4a3a14" fontFamily="system-ui">RM</text></g>
);
/** A stack of banknotes. */
export const cash: Drawing = () => (
  <g>{[0, 1, 2, 3].map((k) => <g key={k} transform={`translate(${(k % 2) * 6} ${-k * 9})`}><rect x="-36" y="-14" width="72" height="14" rx="2" fill="#4fa36a" /><circle cx="0" cy="-7" r="4" fill="#cfe9d4" /></g>)}</g>
);
/** A gavel. */
export const gavel: Drawing = () => (
  <g transform="rotate(-24)"><rect x="-4" y="-70" width="8" height="70" rx="3" fill="#8a5d33" /><rect x="-24" y="-92" width="48" height="26" rx="5" fill="#6b4a32" /><rect x="-30" y="-8" width="60" height="8" rx="3" fill="#4a3322" /></g>
);
/** A ballot box. */
export const ballot: Drawing = () => (
  <g><rect x="-34" y="-52" width="68" height="52" rx="4" fill="#2b5f9e" /><rect x="-18" y="-56" width="36" height="6" rx="2" fill="#173a63" /><Paper x={-9} y={-90} r={6} w={22} h={30} lines={3} /><text x="0" y="-18" textAnchor="middle" fontSize="16" fontWeight="700" fill="#fff" fontFamily="system-ui">UNDI</text></g>
);
/** A smartphone with a speech bubble and a heart. */
export const phone: Drawing = () => (
  <g><rect x="-22" y="-86" width="44" height="82" rx="8" fill="#20242c" /><rect x="-18" y="-80" width="36" height="68" rx="4" fill="#6fb3e0" /><path d="M-12 -70 h24 a4 4 0 0 1 4 4 v10 a4 4 0 0 1 -4 4 h-12 l-6 6 v-6 h-6 a4 4 0 0 1 -4 -4 v-10 a4 4 0 0 1 4 -4z" fill="#fff" /><path d="M0 -28 c-10 -8 -10 -16 0 -10 c10 -6 10 2 0 10z" fill="#e0405a" /></g>
);
/** A television set. */
export const tv: Drawing = () => (
  <g><rect x="-44" y="-64" width="88" height="56" rx="5" fill="#20242c" /><rect x="-38" y="-58" width="76" height="44" rx="3" fill="#6fb3e0" /><circle cx="0" cy="-34" r="12" fill="#fff6" /><rect x="-14" y="-8" width="28" height="8" fill="#20242c" /></g>
);
/** Sacks of rice. */
export const rice: Drawing = () => (
  <g>{[[-26, 0], [10, 0], [-8, -34]].map(([x, y], k) => <g key={k} transform={`translate(${x} ${y})`}><path d="M-17 0 Q-22 -20 -14 -34 H14 Q22 -20 17 0z" fill="#e9dcb7" /><rect x="-14" y="-38" width="28" height="6" rx="2" fill="#c9b684" /><text x="0" y="-12" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8a6a2a" fontFamily="system-ui">BERAS</text></g>)}</g>
);
/** A tap with a drop of water. */
export const tap: Drawing = () => (
  <g><rect x="-6" y="-70" width="12" height="70" fill="#8a919c" /><path d="M-6 -70 H34 a10 10 0 0 1 10 10 v8 h-12 v-6 H-6z" fill="#a9b2bd" /><path d="M38 -34 q-8 12 0 18 q8 -6 0 -18z" fill="#4f9fd8" /></g>
);
/** A petrol pump. */
export const pump: Drawing = () => (
  <g><rect x="-22" y="-82" width="44" height="82" rx="4" fill="#d8504a" /><rect x="-16" y="-74" width="32" height="22" fill="#2a2f3a" /><text x="0" y="-57" textAnchor="middle" fontSize="12" fill="#7fe08a" fontFamily="monospace">RM2.05</text><path d="M22 -50 q18 4 14 24 v10" fill="none" stroke="#2a2f3a" strokeWidth="4" /></g>
);
/** A party flag on a pole. */
export const flag: Drawing = () => (
  <g><rect x="-2" y="-120" width="4" height="120" fill="#888" /><path d="M2 -118 h52 q-8 14 0 28 h-52z" fill="var(--primary, #c0392b)" /></g>
);
/** Strings of bunting across the top. */
export const bunting: Drawing = () => (
  <g><path d="M-300 -230 Q0 -190 300 -230" fill="none" stroke="#555" strokeWidth="2" />{Array.from({ length: 16 }, (_, k) => { const x = -280 + k * 37; const y = -226 + Math.sin((k / 15) * Math.PI) * 30; return <path key={k} d={`M${x} ${y} h18 l-9 18z`} fill={['#d8504a', '#e8c56b', '#2f9e6f', '#2b6cb0'][k % 4]} />; })}</g>
);
/** A placard on a stick. */
export const placard: Drawing = ({ i }) => (
  <g><rect x="-2" y="-90" width="4" height="90" fill="#8a5d33" /><rect x="-28" y="-130" width="56" height="42" rx="3" fill={['#f6f4ee', '#f2c230', '#e0e8f0'][i % 3]} stroke="#0003" />{[0, 1, 2].map((k) => <rect key={k} x="-20" y={-122 + k * 11} width={40 - k * 8} height="5" rx="2" fill={INK} />)}</g>
);
/** Rain falling across the whole picture. */
export const rain: Drawing = () => (
  <g stroke="#cfe3f5" strokeWidth="2" strokeLinecap="round" opacity="0.7">{Array.from({ length: 70 }, (_, k) => { const x = -440 + ((k * 137) % 880), y = -300 + ((k * 61) % 260); return <path key={k} d={`M${x} ${y} l-6 18`} />; })}</g>
);
/** The sun. */
export const sun: Drawing = () => (
  <g><circle cx="0" cy="-230" r="34" fill="#ffd45a" /><circle cx="0" cy="-230" r="48" fill="#ffd45a" opacity="0.25" /></g>
);
/** The moon and a few stars. */
export const moon: Drawing = () => (
  <g><circle cx="0" cy="-240" r="26" fill="#f4efd6" /><circle cx="10" cy="-246" r="22" fill="#27366a" />{[[-120, -250], [-80, -200], [90, -220], [140, -260], [-190, -210], [200, -200]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r="2.4" fill="#f4efd6" />)}</g>
);
/** Layers of haze that hide the far hills. */
export const haze: Drawing = () => (
  <g><rect x="-460" y="-280" width="920" height="280" fill="#c9b99a" opacity="0.55" /><ellipse cx="0" cy="-220" rx="200" ry="40" fill="#e8d9b4" opacity="0.5" /><circle cx="0" cy="-230" r="30" fill="#e8873a" opacity="0.7" /></g>
);
/** A bank of cloud. */
export const cloud: Drawing = ({ i }) => (
  <g fill={i % 2 ? '#e8edf3' : '#b9c4d1'}><ellipse cx="0" cy="-230" rx="60" ry="20" /><ellipse cx="-34" cy="-222" rx="36" ry="16" /><ellipse cx="38" cy="-224" rx="40" ry="16" /></g>
);
/** Lightning from the clouds. */
export const lightning: Drawing = () => (
  <g><path d="M10 -230 l-30 60 h22 l-18 54 l46 -70 h-24z" fill="#ffe27a" /></g>
);
/** Water across the foreground, with a few ripples. */
export const waves: Drawing = () => (
  <g><rect x="-460" y="-16" width="920" height="70" fill="#3b7ea1" opacity="0.9" />{Array.from({ length: 14 }, (_, k) => <path key={k} d={`M${-440 + k * 66} ${-10 + (k % 3) * 12} q10 -8 20 0 t20 0`} fill="none" stroke="#bfe0f2" strokeWidth="2.5" strokeLinecap="round" />)}</g>
);
/** Smoke rising. */
export const smoke: Drawing = () => (
  <g fill="#9aa1ac"><circle cx="0" cy="-20" r="14" opacity="0.8" /><circle cx="10" cy="-50" r="20" opacity="0.6" /><circle cx="26" cy="-92" r="26" opacity="0.45" /></g>
);
/** Fire. */
export const fire: Drawing = () => (
  <g><path d="M0 0 q-30 -10 -22 -40 q6 14 14 6 q-6 -26 10 -50 q4 26 20 36 q10 18 -22 48z" fill="#e8873a" /><path d="M0 0 q-14 -6 -10 -24 q6 10 10 2 q-2 -12 8 -22 q2 18 6 24 q4 12 -14 20z" fill="#ffd45a" /></g>
);
/** A ribbon across the way, with scissors above. */
export const ribbon: Drawing = () => (
  <g><path d="M-90 -50 Q0 -36 90 -50 v10 Q0 -26 -90 -40z" fill="var(--primary, #c0392b)" /><rect x="-96" y="-56" width="6" height="56" fill="#888" /><rect x="90" y="-56" width="6" height="56" fill="#888" /><path d="M-8 -76 l16 18 M8 -76 l-16 18" stroke="#555" strokeWidth="3" /><circle cx="-8" cy="-80" r="5" fill="none" stroke="#555" strokeWidth="2.5" /><circle cx="8" cy="-80" r="5" fill="none" stroke="#555" strokeWidth="2.5" /></g>
);
/** A sealed envelope. */
export const envelope: Drawing = () => (
  <g transform="rotate(-6)"><rect x="-34" y="-46" width="68" height="46" rx="3" fill="#c9a56a" /><path d="M-34 -46 L0 -20 L34 -46" fill="none" stroke="#8a6a3a" strokeWidth="2.5" /><circle cx="0" cy="-22" r="6" fill="#c0392b" /></g>
);
/** An empty chair. */
export const chair: Drawing = () => (
  <g><rect x="-20" y="-60" width="40" height="46" rx="6" fill="#7a2f3a" /><rect x="-24" y="-24" width="48" height="12" rx="3" fill="#8a3a46" /><rect x="-20" y="-14" width="5" height="14" fill="#3a2a22" /><rect x="15" y="-14" width="5" height="14" fill="#3a2a22" /></g>
);
/** A round table with cups. */
export const table: Drawing = () => (
  <g><ellipse cx="0" cy="-46" rx="60" ry="12" fill="#a77d4e" /><rect x="-4" y="-46" width="8" height="46" fill="#7a5a3a" /><ellipse cx="0" cy="0" rx="26" ry="5" fill="#6a4a2a" />{[-30, 0, 30].map((x) => <rect key={x} x={x - 6} y="-60" width="12" height="12" rx="2" fill="#f2efe6" />)}</g>
);
/** A durian. */
export const durian: Drawing = () => (
  <g><ellipse cx="0" cy="-30" rx="30" ry="28" fill="#9bb04a" />{Array.from({ length: 14 }, (_, k) => { const a = (k / 14) * Math.PI * 2; return <path key={k} d={`M${Math.cos(a) * 26} ${-30 + Math.sin(a) * 24} l${Math.cos(a) * 8} ${Math.sin(a) * 8} l${-Math.sin(a) * 4} ${Math.cos(a) * 4}z`} fill="#6e8530" />; })}<path d="M-6 -58 q6 -12 12 0" fill="none" stroke="#5a6a28" strokeWidth="3" /></g>
);
/** A football. */
export const ball: Drawing = () => (
  <g><circle cx="0" cy="-14" r="14" fill="#fff" stroke="#222" strokeWidth="2" /><path d="M0 -22 l7 5 l-3 9 h-8 l-3 -9z" fill="#222" /></g>
);
/** A shield. */
export const shield: Drawing = () => (
  <g><path d="M0 -90 L34 -78 V-44 Q34 -14 0 0 Q-34 -14 -34 -44 V-78z" fill="#2b5f9e" /><path d="M0 -80 L24 -72 V-46 Q24 -22 0 -10 Q-24 -22 -24 -46 V-72z" fill="#e8c56b" /></g>
);
/** A padlock. */
export const lock: Drawing = () => (
  <g><path d="M-16 -50 v-14 a16 16 0 0 1 32 0 v14" fill="none" stroke="#7d8794" strokeWidth="7" /><rect x="-26" y="-50" width="52" height="42" rx="6" fill="#d9a32b" /><circle cx="0" cy="-32" r="5" fill="#5a4210" /></g>
);
/** A chart whose line falls. */
export const chartDown: Drawing = () => (
  <g><rect x="-60" y="-100" width="120" height="86" rx="6" fill="#f4f6f9" stroke="#0002" /><path d="M-48 -82 L-22 -62 L2 -70 L26 -40 L48 -28" fill="none" stroke="#d83a3a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><path d="M48 -28 l-12 -2 l8 -10z" fill="#d83a3a" /></g>
);
/** A chart whose line climbs. */
export const chartUp: Drawing = () => (
  <g><rect x="-60" y="-100" width="120" height="86" rx="6" fill="#f4f6f9" stroke="#0002" /><path d="M-48 -28 L-22 -44 L2 -38 L26 -64 L48 -84" fill="none" stroke="#2f9e6f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><path d="M48 -84 l-12 2 l8 10z" fill="#2f9e6f" /></g>
);
/** Scales. */
export const scales: Drawing = () => (
  <g><rect x="-3" y="-100" width="6" height="100" fill="#b99a4c" /><rect x="-30" y="-6" width="60" height="6" rx="2" fill="#b99a4c" /><rect x="-60" y="-96" width="120" height="5" rx="2" fill="#b99a4c" />{[-60, 60].map((x) => <g key={x}><path d={`M${x} -92 L${x - 18} -60 H${x + 18}z`} fill="none" stroke="#b99a4c" strokeWidth="2" /><path d={`M${x - 20} -60 h40 a20 12 0 0 1 -40 0z`} fill="#b99a4c" /></g>)}</g>
);
/** A handshake: two hands meeting. */
export const handshake: Drawing = () => (
  <g><path d="M-60 -46 L-20 -52 L8 -40 L-6 -22 L-30 -26 L-60 -30z" fill="#d99a62" /><path d="M60 -46 L20 -52 L-8 -40 L6 -22 L30 -26 L60 -30z" fill="#b9764a" opacity="0.95" /><rect x="-76" y="-54" width="22" height="30" fill="#2b5f9e" /><rect x="54" y="-54" width="22" height="30" fill="#b23a48" /></g>
);
/** A warning sign. */
export const warning: Drawing = () => (
  <g><rect x="-2" y="-30" width="4" height="30" fill="#777" /><path d="M0 -92 L30 -34 H-30z" fill="#f2c230" stroke="#2a2f3a" strokeWidth="4" strokeLinejoin="round" /><rect x="-2.5" y="-76" width="5" height="22" rx="2" fill="#2a2f3a" /><circle cx="0" cy="-44" r="3.2" fill="#2a2f3a" /></g>
);
/** A trophy. */
export const trophy: Drawing = () => (
  <g><path d="M-22 -72 H22 q0 30 -22 36 q-22 -6 -22 -36z" fill="#e8c56b" /><rect x="-4" y="-40" width="8" height="26" fill="#d9a32b" /><rect x="-18" y="-14" width="36" height="14" rx="2" fill="#b5902f" /><path d="M-22 -66 h-10 q0 18 14 20 M22 -66 h10 q0 18 -14 20" fill="none" stroke="#e8c56b" strokeWidth="4" /></g>
);
/** A coin. */
export const coin: Drawing = () => (
  <g><circle cx="0" cy="-22" r="22" fill="#e8c56b" stroke="#b5902f" strokeWidth="4" /><text x="0" y="-14" textAnchor="middle" fontSize="22" fontWeight="700" fill="#8a6a1a" fontFamily="system-ui">$</text></g>
);
/** A megaphone. */
export const megaphone: Drawing = () => (
  <g><path d="M-30 -50 L30 -80 V-20 L-30 -40z" fill="#d8504a" /><rect x="-44" y="-52" width="18" height="14" rx="3" fill="#555" /><path d="M36 -76 l16 -8 M38 -50 h20 M36 -24 l16 8" stroke="#888" strokeWidth="3" strokeLinecap="round" /></g>
);
/** A fence of barbed wire or a barrier. */
export const barrier: Drawing = () => (
  <g>{[-60, -20, 20, 60].map((x) => <rect key={x} x={x - 2} y="-52" width="4" height="52" fill="#6a737f" />)}<path d="M-70 -46 H70 M-70 -26 H70" stroke="#8a919c" strokeWidth="3" />{Array.from({ length: 12 }, (_, k) => <path key={k} d={`M${-62 + k * 11} -50 l4 8 M${-62 + k * 11} -30 l4 8`} stroke="#8a919c" strokeWidth="2" />)}</g>
);
/** A clock, near midnight. */
export const clock: Drawing = () => (
  <g><circle cx="0" cy="-50" r="32" fill="#f6f4ee" stroke={INK} strokeWidth="5" /><path d="M0 -50 V-72 M0 -50 L14 -42" stroke={INK} strokeWidth="4" strokeLinecap="round" /></g>
);
/** A stethoscope-less simple bed: a hospital bed. */
export const bed: Drawing = () => (
  <g><rect x="-50" y="-30" width="100" height="14" rx="4" fill="#dce6ee" /><rect x="-50" y="-44" width="22" height="14" rx="6" fill="#fff" /><rect x="-50" y="-16" width="4" height="16" fill="#777" /><rect x="46" y="-16" width="4" height="16" fill="#777" /><rect x="-50" y="-52" width="4" height="36" fill="#999" /></g>
);
/** A question mark. */
export const question: Drawing = () => (
  <g><text x="0" y="-18" textAnchor="middle" fontSize="96" fontWeight="800" fill="#ffffffcc" fontFamily="system-ui">?</text></g>
);
/** An exclamation mark in a circle. */
export const alarm: Drawing = () => (
  <g><circle cx="0" cy="-44" r="30" fill="#d83a3a" /><rect x="-3.5" y="-66" width="7" height="26" rx="3" fill="#fff" /><circle cx="0" cy="-28" r="4" fill="#fff" /></g>
);
/** A dead fish, belly up. */
export const fish: Drawing = ({ i }) => (
  <g transform={`rotate(${i % 2 ? 180 : 0})`}><ellipse cx="0" cy="-8" rx="26" ry="10" fill="#9aa8b8" /><path d="M24 -8 l16 -10 v20z" fill="#9aa8b8" /><circle cx="-14" cy="-10" r="2.4" fill="#222" /><path d="M-16 -2 l6 5" stroke="#222" strokeWidth="2" /></g>
);
/** A dark cloud over a river: pollution. */
export const sludge: Drawing = () => (
  <g><rect x="-460" y="-4" width="920" height="40" fill="#5a6a3a" opacity="0.85" />{Array.from({ length: 10 }, (_, k) => <ellipse key={k} cx={-400 + k * 90} cy={8 + (k % 2) * 8} rx="30" ry="6" fill="#3f4c28" />)}</g>
);
/** A pair of ballot papers stacked and a pencil: a small count. */
export const pencil: Drawing = () => (
  <g transform="rotate(30)"><rect x="-4" y="-80" width="8" height="64" fill="#f2c230" /><path d="M-4 -16 L0 -4 L4 -16z" fill="#e0b98c" /><rect x="-4" y="-86" width="8" height="8" fill="#d8504a" /></g>
);
/** A cat, sitting. */
export const cat: Drawing = ({ i }) => (
  <g><ellipse cx="0" cy="-16" rx="14" ry="16" fill={['#d99a52', '#8a8f98', '#2a2f3a'][i % 3]} /><circle cx="0" cy="-38" r="11" fill={['#d99a52', '#8a8f98', '#2a2f3a'][i % 3]} /><path d="M-10 -44 l-2 -12 l9 6z M10 -44 l2 -12 l-9 6z" fill={['#d99a52', '#8a8f98', '#2a2f3a'][i % 3]} /><circle cx="-4" cy="-38" r="1.6" fill="#ffe27a" /><circle cx="4" cy="-38" r="1.6" fill="#ffe27a" /><path d="M14 -6 q16 4 12 -14" fill="none" stroke={['#d99a52', '#8a8f98', '#2a2f3a'][i % 3]} strokeWidth="5" strokeLinecap="round" /></g>
);
