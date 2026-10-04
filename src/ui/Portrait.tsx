import { PARTIES } from '../data/parties';
import { PARTY_IDS } from '../sim/types';
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

const FLAGS = PARTY_IDS.filter((id) => id !== 'oth').map((id) => PARTIES[id].color);

/** A string of little flags in the parties' colours, as hung across any street in campaign season. Decorative. */
export function Bunting({ count = 36 }: { count?: number }) {
  return (
    <div className="bunting" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => <i key={i} style={{ background: FLAGS[i % FLAGS.length] }} />)}
    </div>
  );
}
