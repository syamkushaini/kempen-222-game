import { lazy, Suspense, useMemo } from 'react';
import { ADVISER_LOOK, ROLE_ACCENT, STAFF_LOOKS, adviserPortrait, staffPortrait, type Look } from './faces';

const Bust3D = lazy(() => import('./Bust3D'));

/** Whether this browser can draw 3D at all. Where it cannot (or where tests run), the flat portrait stands in. */
export const canDraw3D = (): boolean => {
  try {
    if (typeof document === 'undefined') return false;
    const gl = document.createElement('canvas').getContext('webgl2') ?? document.createElement('canvas').getContext('webgl');
    return !!gl;
  } catch { return false; }
};
let known: boolean | null = null;
const supported = () => (known ??= canDraw3D());

type Role = keyof typeof ROLE_ACCENT;
type Who = { adviser: true } | { staff: number; role: Role };

/** The campaign manager's flat picture, or a member of the team's, for where 3D cannot be drawn and while it loads. */
function Flat({ who, size, talking }: { who: Who; size: number; talking: boolean }) {
  const src = 'adviser' in who ? adviserPortrait() : staffPortrait(who.staff, who.role);
  return <img className={talking ? 'portrait talking' : 'portrait'} src={src} width={size} height={size} alt="" draggable={false} />;
}

/**
 * The campaign manager (the adviser) or one of the people the leader hired, as a 3D bust drawn with React Three Fiber. It is only a picture:
 * the name is always written beside it. At most a handful are on screen at once, since each is a canvas of its own.
 */
export function Manager({ who, size = 46, talking = false }: { who: Who; size?: number; talking?: boolean }) {
  const look: Look = 'adviser' in who ? ADVISER_LOOK : STAFF_LOOKS[who.staff % STAFF_LOOKS.length];
  const accent = 'adviser' in who ? ROLE_ACCENT.manager : ROLE_ACCENT[who.role];
  const calm = useMemo(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  if (!supported()) return <Flat who={who} size={size} talking={talking && !calm} />;
  return (
    <Suspense fallback={<Flat who={who} size={size} talking={talking && !calm} />}>
      <Bust3D look={look} accent={accent} size={size} calm={calm} talking={talking && !calm} />
    </Suspense>
  );
}
