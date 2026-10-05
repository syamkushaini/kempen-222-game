import { adviserPortrait, emblem, leaderPortrait, ministerPortrait, type Emblem } from './faces';

type Who = { leader: number } | { minister: number; party: number } | { adviser: true } | { emblem: Emblem };

/** A round picture of one of the game's invented people, or of a place. Decorative: the name is always written beside it. */
export function Portrait(props: Who & { size?: number; className?: string }) {
  const src = 'leader' in props ? leaderPortrait(props.leader)
    : 'minister' in props ? ministerPortrait(props.minister, props.party)
    : 'adviser' in props ? adviserPortrait()
    : emblem(props.emblem);
  if (!src) return null;
  const size = props.size ?? 40;
  return <img className={`portrait ${props.className ?? ''}`} src={src} width={size} height={size} alt="" draggable={false} />;
}
