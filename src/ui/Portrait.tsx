import { PARTY_IDS } from '../sim/types';
import { adviserPortrait, emblem, hasOwnLook, leaderPortrait, ministerPortrait, type Emblem } from './faces';

// Painted portraits of the party leaders, by party id, for those that have one. A leader without one, a leader the
// player has given a look of their own, and everyone else in the game keep the drawn bust.
const PAINTED = Object.fromEntries(
  Object.entries(import.meta.glob('../assets/portraits/*.jpg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>)
    .map(([path, url]) => [path.replace(/^.*\/(\w+)\.jpg$/, '$1'), url]),
);
const paintedLeader = (party: number): string | null => (hasOwnLook(party) ? null : PAINTED[PARTY_IDS[party]] ?? null);

type Who = { leader: number } | { minister: number; party: number } | { adviser: true } | { emblem: Emblem };

/** A round picture of one of the game's invented people, or of a place. Decorative: the name is always written beside it. */
export function Portrait(props: Who & { size?: number; className?: string }) {
  const src = 'leader' in props ? paintedLeader(props.leader) ?? leaderPortrait(props.leader)
    : 'minister' in props ? ministerPortrait(props.minister, props.party)
    : 'adviser' in props ? adviserPortrait()
    : emblem(props.emblem);
  if (!src) return null;
  const size = props.size ?? 40;
  return <img className={`portrait ${props.className ?? ''}`} src={src} width={size} height={size} alt="" draggable={false} />;
}
