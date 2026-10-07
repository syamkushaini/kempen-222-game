import type { ReactNode } from 'react';
import type { PinKind } from '../sim/campaign/layers';

/** The outline of each mark, in a square from -7 to 7. Drawn twice, once fat in the map's own colour so that it shows on any seat. */
function shape(kind: PinKind, color: string, halo: boolean): ReactNode {
  const w = (n: number) => (halo ? n + 2.6 : n);
  const stroke = halo ? 'var(--map-halo, var(--bg))' : color;
  const fill = (solid: boolean) => (halo ? 'var(--map-halo, var(--bg))' : solid ? color : 'none');
  switch (kind) {
    case 'ring': return <circle r="4.6" fill="none" stroke={stroke} strokeWidth={w(2)} />;
    case 'dot': return <circle r="3.4" fill={fill(true)} stroke={stroke} strokeWidth={halo ? 2.6 : 0} />;
    case 'bullseye': return <><circle r="5" fill="none" stroke={stroke} strokeWidth={w(1.7)} /><circle r="1.9" fill={fill(true)} stroke={stroke} strokeWidth={halo ? 2.6 : 0} /></>;
    case 'square': return <rect x="-3.4" y="-3.4" width="6.8" height="6.8" rx="1" fill={fill(true)} stroke={stroke} strokeWidth={halo ? 2.6 : 0} />;
    case 'diamond': return <path d="M0 -5.2L5.2 0L0 5.2L-5.2 0Z" fill="none" stroke={stroke} strokeWidth={w(1.9)} strokeLinejoin="round" />;
    case 'down': return <path d="M-4.8 -3.6H4.8L0 4.4Z" fill="none" stroke={stroke} strokeWidth={w(1.9)} strokeLinejoin="round" />;
    case 'up': return <path d="M-4.8 3.6H4.8L0 -4.4Z" fill={fill(true)} stroke={stroke} strokeWidth={halo ? 2.6 : 0} strokeLinejoin="round" />;
    case 'flag': return <><path d="M-3 5.2V-5.2" fill="none" stroke={stroke} strokeWidth={w(1.7)} strokeLinecap="round" /><path d="M-3 -5.2L4.6 -2.4L-3 0.4Z" fill={fill(true)} stroke={stroke} strokeWidth={halo ? 2.6 : 0} strokeLinejoin="round" /></>;
    case 'hex': return <path d="M0 -5L4.3 -2.5V2.5L0 5L-4.3 2.5V-2.5Z" fill={fill(true)} stroke={stroke} strokeWidth={halo ? 2.6 : 0} strokeLinejoin="round" />;
  }
}

/** One mark, to sit inside an svg whose units are the mark's own. */
export function PinGlyph({ kind, color }: { kind: PinKind; color: string }) {
  return <g className="pin-glyph" aria-hidden="true">{shape(kind, color, true)}{shape(kind, color, false)}</g>;
}

/** A mark on its own, for the key and the list of layers. */
export function PinKey({ kind, color, size = 16 }: { kind: PinKind; color: string; size?: number }) {
  return <svg className="pin-key" width={size} height={size} style={{ width: size, height: size }} viewBox="-7 -7 14 14" aria-hidden="true"><PinGlyph kind={kind} color={color} /></svg>;
}
