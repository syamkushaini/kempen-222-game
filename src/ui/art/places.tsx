import type { Drawing } from './people';

// The places of the pictures: buildings, landscape and things that move on roads and water. Each stands on the point (0, 0).

const WIN = '#ffe9a8';
const Windows = ({ x, y, cols, rows, w = 8, h = 11, gap = 6, lit = 0.45 }: { x: number; y: number; cols: number; rows: number; w?: number; h?: number; gap?: number; lit?: number }) => (
  <g>{Array.from({ length: rows * cols }, (_, k) => {
    const c = k % cols, r = Math.floor(k / cols);
    return <rect key={k} x={x + c * (w + gap)} y={y + r * (h + gap)} width={w} height={h} rx="1.5" fill={WIN} opacity={((k * 7 + 3) % 10) / 10 < lit ? 0.95 : 0.25} />;
  })}</g>
);

/** A Malay house on stilts, with a pitched roof. */
export const kampung: Drawing = () => (
  <g>
    {[-34, -12, 12, 34].map((x) => <rect key={x} x={x - 2} y="-26" width="4" height="26" fill="#6b4a32" />)}
    <rect x="-44" y="-70" width="88" height="46" fill="#c58f56" /><rect x="-44" y="-30" width="88" height="6" fill="#8a5d33" />
    <path d="M-56 -68 L0 -108 L56 -68z" fill="#8a3a2e" /><path d="M-56 -68 L0 -108 L56 -68 l-4 0 L0 -100 L-52 -68z" fill="#6a2a22" />
    <rect x="-8" y="-58" width="16" height="30" rx="2" fill="#5b3a24" /><rect x="-36" y="-60" width="18" height="16" rx="2" fill={WIN} /><rect x="18" y="-60" width="18" height="16" rx="2" fill={WIN} />
  </g>
);
/** A row of three old shophouses. */
export const shophouses: Drawing = () => (
  <g>{[['#e7b04b', -66], ['#d8607a', 0], ['#4aa3a0', 66]].map(([c, x]) => (
    <g key={x as number} transform={`translate(${x} 0)`}>
      <rect x="-31" y="-100" width="62" height="100" fill={c as string} /><rect x="-31" y="-104" width="62" height="8" fill="#00000030" />
      {[-70, -42].map((y) => <g key={y}>{[-22, 4].map((wx) => <rect key={wx} x={wx} y={y} width="16" height="20" rx="8" fill="#fff6" />)}</g>)}
      <rect x="-26" y="-22" width="52" height="22" fill="#00000040" />
    </g>
  ))}</g>
);
/** An office tower. */
export const tower: Drawing = () => (
  <g><rect x="-30" y="-190" width="60" height="190" fill="#4b6a8c" /><rect x="-30" y="-190" width="14" height="190" fill="#ffffff22" /><Windows x={-22} y={-178} cols={4} rows={9} w={7} gap={5} h={11} /><rect x="-2" y="-210" width="4" height="22" fill="#4b6a8c" /></g>
);
/** A hotel, wide with lit windows and a canopy. */
export const hotel: Drawing = () => (
  <g><rect x="-60" y="-120" width="120" height="120" fill="#7a5c8e" /><Windows x={-52} y={-110} cols={7} rows={6} w={9} gap={6} lit={0.55} /><rect x="-30" y="-24" width="60" height="6" fill="#e8c56b" /><rect x="-24" y="-18" width="48" height="18" fill="#2a1f33" /></g>
);
/** The house of Parliament: a dome on columns. */
export const parliament: Drawing = () => (
  <g>
    <rect x="-95" y="-50" width="190" height="50" fill="#d9d4c7" /><path d="M-100 -50 H100 L90 -62 H-90z" fill="#bdb6a6" />
    {Array.from({ length: 9 }, (_, k) => <rect key={k} x={-80 + k * 20} y="-48" width="8" height="46" fill="#f2efe6" />)}
    <path d="M-40 -62 a40 40 0 0 1 80 0z" fill="#c9a23c" /><rect x="-3" y="-120" width="6" height="18" fill="#c9a23c" /><rect x="-40" y="-64" width="80" height="6" fill="#b5902f" />
  </g>
);
/** The Palace: a golden dome and arches. */
export const palace: Drawing = () => (
  <g>
    <rect x="-80" y="-44" width="160" height="44" fill="#f4e7bd" />{[-54, -18, 18, 54].map((x) => <path key={x} d={`M${x - 10} 0 v-26 a10 10 0 0 1 20 0 v26z`} fill="#a77f2a" />)}
    <path d="M-34 -44 a34 34 0 0 1 68 0z" fill="#e8bd2f" /><path d="M-8 -78 a8 8 0 0 1 16 0z" fill="#e8bd2f" /><rect x="-1.5" y="-96" width="3" height="18" fill="#e8bd2f" />
    <path d="M-80 -44 l10 -22 l10 22z M60 -44 l10 -22 l10 22z" fill="#e8bd2f" />
  </g>
);
/** A court house: pediment, columns, steps. */
export const court: Drawing = () => (
  <g>
    <path d="M-70 -86 L0 -122 L70 -86z" fill="#d9d4c7" />{[-48, -16, 16, 48].map((x) => <rect key={x} x={x - 7} y="-84" width="14" height="70" fill="#efece2" />)}
    <rect x="-76" y="-86" width="152" height="8" fill="#bdb6a6" /><rect x="-80" y="-14" width="160" height="6" fill="#bdb6a6" /><rect x="-86" y="-8" width="172" height="8" fill="#a8a190" />
  </g>
);
/** A hospital with a red cross. */
export const hospital: Drawing = () => (
  <g><rect x="-60" y="-100" width="120" height="100" fill="#f1f4f7" /><Windows x={-50} y={-90} cols={6} rows={2} w={10} gap={8} lit={0.6} /><rect x="-8" y="-60" width="16" height="42" fill="#d83a3a" /><rect x="-21" y="-47" width="42" height="16" fill="#d83a3a" transform="translate(0 -4)" /><rect x="-14" y="-30" width="28" height="30" fill="#8aa2b8" /></g>
);
/** A school with a flag. */
export const school: Drawing = () => (
  <g><rect x="-64" y="-64" width="128" height="64" fill="#e9c46a" /><path d="M-70 -64 L0 -92 L70 -64z" fill="#b5532f" /><Windows x={-52} y={-52} cols={5} rows={1} w={14} h={16} gap={9} lit={0.8} /><rect x="-9" y="-30" width="18" height="30" fill="#6d4429" /><rect x="40" y="-130" width="3" height="60" fill="#777" /><path d="M43 -130 h26 v14 h-26z" fill="#c0392b" /></g>
);
/** A factory with chimneys and smoke. */
export const factory: Drawing = () => (
  <g>
    <rect x="-64" y="-56" width="128" height="56" fill="#6d7686" />{[-44, -8, 28].map((x) => <path key={x} d={`M${x} -56 l12 -24 v24z`} fill="#58606e" />)}
    <rect x="30" y="-120" width="16" height="66" fill="#8a4a3a" /><rect x="52" y="-100" width="12" height="46" fill="#8a4a3a" />
    <circle cx="40" cy="-132" r="14" fill="#cfd4dc" opacity="0.85" /><circle cx="56" cy="-150" r="18" fill="#cfd4dc" opacity="0.65" /><circle cx="78" cy="-172" r="22" fill="#cfd4dc" opacity="0.45" />
    <Windows x={-52} y={-42} cols={7} rows={1} w={10} h={12} gap={6} lit={0.5} />
  </g>
);
/** A port crane with stacked containers. */
export const port: Drawing = () => (
  <g>
    {[['#c0392b', -64, 0], ['#2b6cb0', -24, 0], ['#d69e2e', 16, 0], ['#2f855a', -44, -22], ['#6b46c1', -4, -22]].map(([c, x, y], k) => <rect key={k} x={x as number} y={(y as number) - 22} width="36" height="20" fill={c as string} stroke="#0003" />)}
    <path d="M44 0 V-130 H92 V-120 H54 V0z" fill="#e8873a" /><rect x="40" y="-140" width="90" height="8" fill="#e8873a" /><rect x="100" y="-132" width="3" height="46" fill="#333" /><rect x="94" y="-88" width="16" height="14" fill="#555" />
  </g>
);
/** A bridge: an arch over the water, whole or broken. */
export const bridge: Drawing = () => (
  <g><path d="M-110 -30 Q0 -96 110 -30" fill="none" stroke="#a9b2bd" strokeWidth="8" /><rect x="-120" y="-34" width="240" height="10" fill="#7d8794" />{[-70, -35, 0, 35, 70].map((x) => <rect key={x} x={x - 1.5} y={-34 - (1 - Math.abs(x) / 120) * 56 + 8} width="3" height={(1 - Math.abs(x) / 120) * 56 - 6} fill="#a9b2bd" />)}<rect x="-122" y="-34" width="10" height="34" fill="#6a737f" /><rect x="112" y="-34" width="10" height="34" fill="#6a737f" /></g>
);
export const brokenBridge: Drawing = () => (
  <g>
    <rect x="-130" y="-34" width="90" height="10" fill="#7d8794" /><rect x="-136" y="-34" width="10" height="34" fill="#6a737f" /><path d="M-40 -34 l-8 18 l-10 -4 l-2 -14z" fill="#7d8794" />
    <rect x="48" y="-34" width="82" height="10" fill="#7d8794" transform="rotate(6 48 -34)" /><rect x="126" y="-34" width="10" height="34" fill="#6a737f" />
    <rect x="-12" y="-14" width="26" height="8" fill="#7d8794" transform="rotate(18)" /><circle cx="-4" cy="-8" r="5" fill="#c9cfd8" opacity="0.7" />
  </g>
);
/** A Borneo longhouse on tall posts. */
export const longhouse: Drawing = () => (
  <g>{Array.from({ length: 8 }, (_, k) => <rect key={k} x={-92 + k * 26} y="-34" width="4" height="34" fill="#5b3a24" />)}<rect x="-100" y="-70" width="200" height="38" fill="#b9814a" /><path d="M-112 -68 L-90 -98 H90 L112 -68z" fill="#7a4a2e" />{Array.from({ length: 6 }, (_, k) => <rect key={k} x={-84 + k * 30} y="-62" width="14" height="22" fill="#3b2a1d" />)}<rect x="-100" y="-34" width="200" height="4" fill="#8a5d33" /></g>
);
/** A market stall under a striped awning. */
export const market: Drawing = () => (
  <g><rect x="-46" y="-50" width="4" height="50" fill="#6b4a32" /><rect x="42" y="-50" width="4" height="50" fill="#6b4a32" />{Array.from({ length: 6 }, (_, k) => <path key={k} d={`M${-52 + k * 17.4} -76 h17.4 l-3 26 h-17.4z`} fill={k % 2 ? '#fff' : '#d8504a'} />)}<rect x="-46" y="-26" width="92" height="26" fill="#9a6a3c" />{[['#e0463a', -30], ['#f2c230', -10], ['#4aa35a', 12], ['#e08a2e', 32]].map(([c, x]) => <circle key={x as number} cx={x as number} cy="-32" r="7" fill={c as string} />)}</g>
);
/** A football goal and ball on grass. */
export const goal: Drawing = () => (
  <g><path d="M-50 0 V-60 H50 V0" fill="none" stroke="#fff" strokeWidth="5" />{Array.from({ length: 7 }, (_, k) => <path key={k} d={`M${-44 + k * 14.7} -58 V0`} stroke="#fff6" strokeWidth="1.5" />)}<circle cx="74" cy="-10" r="10" fill="#fff" stroke="#222" strokeWidth="2" /></g>
);
/** Hills far off. */
export const hills: Drawing = () => (
  <g><path d="M-420 0 L-300 -90 L-210 -30 L-100 -120 L10 -40 L120 -100 L230 -34 L330 -84 L440 0z" fill="#5a7f8f" opacity="0.5" /><path d="M-440 0 L-340 -50 L-230 -10 L-120 -70 L0 -10 L130 -56 L250 -10 L360 -52 L460 0z" fill="#4d7367" opacity="0.7" /></g>
);
/** Palm trees. */
export const palms: Drawing = () => (
  <g>{[[-26, 1], [22, 0.8]].map(([x, s]) => <g key={x} transform={`translate(${x} 0) scale(${s})`}><path d="M0 0 Q6 -50 -2 -96" fill="none" stroke="#7a5a3a" strokeWidth="7" strokeLinecap="round" />{[-70, -30, 20, 60, 100].map((a) => <path key={a} d="M-2 -96 q30 -22 54 6 q-34 -8 -54 -6" fill="#3c8a52" transform={`rotate(${a} -2 -96)`} />)}</g>)}</g>
);
/** A road across the picture. */
export const road: Drawing = () => (
  <g><rect x="-460" y="0" width="920" height="46" fill="#4b4f58" />{Array.from({ length: 12 }, (_, k) => <rect key={k} x={-440 + k * 80} y="21" width="44" height="4" fill="#e8e2c8" />)}</g>
);
/** A railway line. */
export const rails: Drawing = () => (
  <g><rect x="-460" y="12" width="920" height="4" fill="#80858f" /><rect x="-460" y="30" width="920" height="4" fill="#80858f" />{Array.from({ length: 28 }, (_, k) => <rect key={k} x={-450 + k * 34} y="8" width="10" height="30" fill="#6a4a30" />)}</g>
);
/** A modern train. */
export const train: Drawing = () => (
  <g>{[0, 1, 2].map((k) => <g key={k} transform={`translate(${k * 104 - 104} 0)`}><rect x="-50" y="-52" width="100" height="44" rx={k === 0 ? 22 : 6} fill="#f2f4f7" /><rect x="-50" y="-26" width="100" height="6" fill="var(--primary, #c0392b)" />{[-32, -12, 8, 28].map((x) => <rect key={x} x={x} y="-44" width="14" height="12" rx="3" fill="#3a5a7a" />)}</g>)}</g>
);
/** A car. */
export const car: Drawing = ({ i }) => (
  <g><path d="M-44 -14 L-36 -34 H12 L34 -22 H48 V-8 H-44z" fill={['#b23a48', '#2b5f9e', '#d08a2e', '#3a8fa0'][i % 4]} /><path d="M-30 -30 H8 L24 -22 H-34z" fill="#cfe6f2" /><circle cx="-26" cy="-8" r="9" fill="#1f2229" /><circle cx="28" cy="-8" r="9" fill="#1f2229" /></g>
);
/** A lorry with a load. */
export const truck: Drawing = () => (
  <g><rect x="-70" y="-62" width="92" height="50" fill="#dce2e8" /><path d="M22 -42 h30 l12 16 v14 h-42z" fill="#2b5f9e" /><rect x="30" y="-38" width="18" height="12" fill="#cfe6f2" /><circle cx="-40" cy="-10" r="10" fill="#1f2229" /><circle cx="-8" cy="-10" r="10" fill="#1f2229" /><circle cx="44" cy="-10" r="10" fill="#1f2229" /></g>
);
/** A fishing boat, or a patrol boat when it has a flag. */
export const boat: Drawing = ({ i }) => (
  <g><path d="M-60 -22 H60 L44 0 H-44z" fill={i % 2 ? '#c0392b' : '#2b5f9e'} /><rect x="-18" y="-50" width="30" height="28" fill="#eef1f5" /><rect x="-6" y="-70" width="3" height="22" fill="#555" /><path d="M-3 -70 h18 v10 h-18z" fill="#c0392b" /></g>
);
/** A big ship. */
export const ship: Drawing = () => (
  <g><path d="M-120 -34 H120 L96 0 H-96z" fill="#3a4a5e" /><rect x="-96" y="-58" width="118" height="26" fill="#e8e2d2" />{[['#c0392b', -90], ['#2b6cb0', -62], ['#d69e2e', -34], ['#2f855a', -6]].map(([c, x]) => <rect key={x as number} x={x as number} y="-52" width="26" height="18" fill={c as string} />)}<rect x="50" y="-88" width="40" height="54" fill="#f3f0e8" /><rect x="58" y="-80" width="24" height="10" fill="#3a5a7a" /></g>
);
/** A plane. */
export const plane: Drawing = () => (
  <g><path d="M-80 -10 L60 -22 Q92 -22 96 -12 Q92 -4 60 -4z" fill="#f4f6f9" /><path d="M-10 -14 L-40 -60 L-24 -60 L16 -14z" fill="#c9d0d9" /><path d="M-70 -12 L-90 -44 L-76 -44 L-52 -12z" fill="#c9d0d9" /><rect x="40" y="-17" width="30" height="5" fill="#3a5a7a" /></g>
);
/** A crane at a building site. */
export const crane: Drawing = () => (
  <g><rect x="-3" y="-190" width="6" height="190" fill="#e8873a" />{Array.from({ length: 8 }, (_, k) => <path key={k} d={`M-3 ${-k * 24} L3 ${-k * 24 - 24}`} stroke="#c06a24" strokeWidth="2" />)}<rect x="-70" y="-198" width="160" height="7" fill="#e8873a" /><rect x="-96" y="-200" width="26" height="14" fill="#555" /><path d="M60 -191 v50" stroke="#333" strokeWidth="2" /><rect x="52" y="-141" width="16" height="10" fill="#d83a3a" /></g>
);
/** A row of tin-roofed homes by a river. */
export const squatters: Drawing = () => (
  <g>{[-50, 0, 50].map((x, k) => <g key={x} transform={`translate(${x} 0)`}><rect x="-22" y="-34" width="44" height="34" fill={['#c9a56a', '#9bb0a0', '#b98a6a'][k]} /><path d="M-28 -34 L0 -52 L28 -34z" fill="#8f9aa6" /><rect x="-5" y="-22" width="10" height="22" fill="#4a3a2a" /></g>)}</g>
);
/** A stage with a backdrop and lights: a rally or a party assembly. */
export const stage: Drawing = () => (
  <g><rect x="-120" y="-24" width="240" height="24" fill="#4a4f5c" /><rect x="-120" y="-120" width="240" height="96" fill="var(--primary, #c0392b)" opacity="0.9" /><path d="M-120 -120 H120 L100 -100 H-100z" fill="#00000030" />{[-90, -30, 30, 90].map((x) => <circle key={x} cx={x} cy="-130" r="6" fill="#ffe9a8" />)}</g>
);
/** An interior wall, as a kopitiam or a party office has it: plaster above and tiles below, a window or two, posters on the wall. */
export const wallroom: Drawing = ({ i }) => (
  <g>
    <rect x="-440" y="-460" width="880" height="460" fill="#cdbb98" />
    <rect x="-440" y="-92" width="880" height="92" fill="#8f9a86" />
    <rect x="-440" y="-96" width="880" height="7" fill="#6f7a66" />
    {Array.from({ length: 30 }, (_, k) => <path key={k} d={`M${-430 + k * 30} -88 v88`} stroke="#6f7a66" strokeOpacity="0.5" strokeWidth="1.3" />)}
    {[-310, 90].map((x) => <g key={x}><rect x={x - 46} y="-250" width="92" height="104" rx="4" fill="#e2e0cc" /><path d={`M${x} -250 v104 M${x - 46} -198 h92`} stroke="#2a2623" strokeWidth="2.4" /></g>)}
    {[-160, 250].map((x, k) => (
      <g key={x} transform={`translate(${x} -150)`}>
        <rect x="-26" y="-92" width="52" height="64" rx="2" fill={['#e8e0cc', '#e9d3a0'][(i + k) % 2]} />
        <rect x="-26" y="-92" width="52" height="13" fill={['#2f4f96', '#b4342d', '#2f7d5b'][(i + k) % 3]} />
        <circle cx="0" cy="-56" r="14" fill="#d9a977" /><path d="M-8 -52 q8 11 16 0" fill="#f3ead2" stroke="#2a2623" strokeWidth="1.5" /><path d="M-7 -63 l4 1 M7 -63 l-4 1" stroke="#2a2623" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    ))}
  </g>
);
