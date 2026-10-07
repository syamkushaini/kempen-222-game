import { useId } from 'react';
import { LOGO_BLUES, LOGO_GOLD, logoDots, TWO, TWOS } from './mark';

const DOTS = logoDots();

/**
 * The game's mark: the chamber over the number. With `lively`, the seats take their places one after another when it
 * first appears, as a House fills; otherwise it is still. It is a picture beside the game's name, never instead of it.
 */
export function Logo({ size = 34, lively = false }: { size?: number; lively?: boolean }) {
  const id = useId();
  return (
    <svg className={lively ? 'logo lively' : 'logo'} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={LOGO_BLUES[0]} /><stop offset="1" stopColor={LOGO_BLUES[1]} />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="26" fill={`url(#${id})`} />
      {DOTS.map((d, i) => (
        <circle key={i} className={`logo-seat ${d.kind}`} cx={d.x} cy={d.y} r="2.6" fill={d.kind === 'gold' ? LOGO_GOLD : '#fff'} fillOpacity={d.kind === 'dim' ? 0.32 : 1} style={lively ? { animationDelay: `${120 + i * 28}ms` } : undefined} />
      ))}
      <g className="logo-number" transform={`translate(${TWOS.x} ${TWOS.y}) scale(${TWOS.scale})`} fill="none" stroke="#fff" strokeWidth={TWOS.width} strokeLinecap="round" strokeLinejoin="round">
        {[0, 1, 2].map((i) => <path key={i} d={TWO} transform={`translate(${i * TWOS.gap} 0)`} />)}
      </g>
    </svg>
  );
}
