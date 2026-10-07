// The game's mark: the chamber of seats over the number 222, the majority lit and one gold seat at the line. Its
// geometry is here, apart from any drawing, so that the screen, the result card and the tests all use the same one.

/** One 2, drawn as a single stroke in a cell 40 wide and 56 tall. */
export const TWO = 'M10 18 A10 10 0 1 1 28.5 25 L10 44 H32';
/** Where the three 2s sit in the 120-unit square, and how they are drawn. */
export const TWOS = { x: 21, y: 62, scale: 0.92, gap: 28, width: 7.5 };
/** The mark's two blues, lighter at the top left. */
export const LOGO_BLUES = ['#7480ea', '#3d47a8'] as const;
export const LOGO_GOLD = '#ffd166';

export interface LogoDot { x: number; y: number; kind: 'lit' | 'gold' | 'dim' }

const BENCHES = [7, 10, 13], INNER = 22, OUTER = 44, CENTRE = 60;
/** The share of the seats that is lit: just over half, as a majority is. */
const LIT = 0.54;

/** The seats of the mark's chamber, from the far left round to the far right: lit up to the majority, the last of those gold. */
export function logoDots(): LogoDot[] {
  const seats: { turn: number; x: number; y: number }[] = [];
  BENCHES.forEach((n, row) => {
    const r = INNER + ((OUTER - INNER) * row) / (BENCHES.length - 1);
    for (let j = 0; j < n; j++) {
      const turn = (j + 0.5) / n, a = Math.PI * (1 - turn);
      seats.push({ turn, x: Math.round((CENTRE + r * Math.cos(a)) * 10) / 10, y: Math.round((CENTRE - r * Math.sin(a)) * 10) / 10 });
    }
  });
  seats.sort((a, b) => a.turn - b.turn);
  const lit = Math.round(seats.length * LIT);
  return seats.map((s, i) => ({ x: s.x, y: s.y, kind: i === lit - 1 ? 'gold' : i < lit ? 'lit' : 'dim' }));
}

/** The mark as a picture in text, for where there is no page to draw it in: the result card's canvas. */
export function logoSvg(): string {
  const dots = logoDots().map((d) => `<circle cx="${d.x}" cy="${d.y}" r="2.6" fill="${d.kind === 'gold' ? LOGO_GOLD : '#fff'}"${d.kind === 'dim' ? ' fill-opacity="0.32"' : ''}/>`).join('');
  const twos = [0, 1, 2].map((i) => `<path d="${TWO}" transform="translate(${i * TWOS.gap} 0)"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${LOGO_BLUES[0]}"/><stop offset="1" stop-color="${LOGO_BLUES[1]}"/></linearGradient></defs>`
    + `<rect width="120" height="120" rx="26" fill="url(#g)"/>${dots}`
    + `<g transform="translate(${TWOS.x} ${TWOS.y}) scale(${TWOS.scale})" fill="none" stroke="#fff" stroke-width="${TWOS.width}" stroke-linecap="round" stroke-linejoin="round">${twos}</g></svg>`;
}
