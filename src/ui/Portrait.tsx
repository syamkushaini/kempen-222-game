import { adviserPortrait, emblem, leaderLook, leaderPortrait, ministerLook, ministerPortrait, staffPortrait, type Emblem, type ROLE_ACCENT } from './faces';
import { Person3D } from './Person';

type Who = { leader: number } | { minister: number; party: number } | { adviser: true } | { staff: number; role: keyof typeof ROLE_ACCENT } | { emblem: Emblem };

/** A round picture of one of the game's invented people, or of a place. Decorative: the name is always written beside it. */
export function Portrait(props: Who & { size?: number; className?: string; talking?: boolean }) {
  const size = props.size ?? 40;
  // Party leaders and ministers are drawn in 3D (a leader whose face is a photo the player uploaded keeps the photo); the flat portrait stands in until then.
  const solid = 'leader' in props ? leaderLook(props.leader) : 'minister' in props ? ministerLook(props.minister, props.party) : null;
  const src = 'leader' in props ? leaderPortrait(props.leader)
    : 'minister' in props ? ministerPortrait(props.minister, props.party)
    : 'adviser' in props ? adviserPortrait()
    : 'staff' in props ? staffPortrait(props.staff, props.role)
    : emblem(props.emblem);
  if (!src) return null;
  if (solid) return <Person3D look={solid.look} accent={solid.accent} size={size} flat={src} className={props.className} talking={props.talking} />;
  return <img className={`portrait ${props.className ?? ''}`} src={src} width={size} height={size} alt="" draggable={false} />;
}
