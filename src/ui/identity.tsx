import { ACCESSIBLE_COLORS, PARTIES } from '../data/parties';
import { LEADERS } from '../sim/campaign/cast';
import { PARTY_IDS, type PartyId } from '../sim/types';
import { DEFAULT_EMBLEMS, type EmblemId, type Identity } from '../state/identity';
import { useStore } from '../state/store';
import { PLAYER_LOOKS, setLeaderLook, setLeaderPhoto } from './faces';

type Real = Exclude<PartyId, 'oth'>;
const ORIGINAL = structuredClone(PARTIES);
const ORIGINAL_LEADERS = { ...LEADERS };
const emblems: Partial<Record<PartyId, EmblemId>> = {};
const flags: Partial<Record<PartyId, string>> = {};
let accessible = false;

/**
 * Dresses the player's party in the name, colours and leader they chose, or
 * with null puts every party back as it was. The parties' names and colours
 * are read from one table everywhere, so changing the table changes them all.
 */
export function applyIdentity(player: number | null, identity: Identity | null): void {
  for (const id of PARTY_IDS) {
    Object.assign(PARTIES[id], ORIGINAL[id]);
    if (accessible) PARTIES[id].color = ACCESSIBLE_COLORS[id];
    if (id !== 'oth') { LEADERS[id] = ORIGINAL_LEADERS[id]; setLeaderLook(id, null); setLeaderPhoto(id, null); }
    delete emblems[id];
    delete flags[id];
  }
  const id = player === null ? null : PARTY_IDS[player];
  if (!identity || !id || id === 'oth') return;
  Object.assign(PARTIES[id], { name: identity.name, short: identity.short, color: identity.color });
  LEADERS[id as Real] = identity.leader;
  setLeaderLook(id, PLAYER_LOOKS[identity.look] ?? null);
  setLeaderPhoto(id, identity.photo ?? null);
  emblems[id] = identity.emblem;
  if (identity.flag) flags[id] = identity.flag;
}

let installed = false;
/** Keeps the parties dressed for whichever game is open, in the colours the player asked for. Runs before the screen redraws, so nothing shows the old names. */
export function installIdentity(): void {
  if (installed) return;
  installed = true;
  const sync = (state: ReturnType<typeof useStore.getState>) => {
    accessible = state.settings.palette === 'accessible';
    applyIdentity(state.game?.campaign.player ?? null, state.game?.identity ?? null);
  };
  sync(useStore.getState());
  useStore.subscribe((state, prev) => {
    if (state.game?.id !== prev.game?.id || state.game?.identity !== prev.game?.identity || state.settings.palette !== prev.settings.palette) sync(state);
  });
}

const ART: Record<EmblemId, string> = {
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
  torch: '<path d="M12 3c2.6 2.4 4 4.2 4 6.2a4 4 0 0 1-8 0c0-1.2.6-2.2 1.6-3.2.2 1.3.8 2 1.6 2.2C10.800 6.600 11 4.800 12 3Z"/><path d="M9.500 14h5l-1.200 7h-2.600Z"/>',
  mountain: '<path d="M2.500 19 9 7l3.500 6 2-3 7 9Z"/>',
  wave: '<path d="M2.500 10c2.400-3 4.800-3 7.200 0s4.800 3 7.200 0 3.200-2.200 4.600-1.200M2.500 16c2.400-3 4.800-3 7.200 0s4.800 3 7.200 0 3.200-2.200 4.600-1.200" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>',
  paddy: '<path d="M12 21V8" stroke="#fff" stroke-width="1.800" stroke-linecap="round"/><ellipse cx="12" cy="5" rx="1.700" ry="3"/><ellipse cx="8.300" cy="9" rx="1.600" ry="2.900" transform="rotate(-35 8.300 9)"/><ellipse cx="15.700" cy="9" rx="1.600" ry="2.900" transform="rotate(35 15.700 9)"/><ellipse cx="8" cy="14.500" rx="1.600" ry="2.900" transform="rotate(-35 8 14.500)"/><ellipse cx="16" cy="14.500" rx="1.600" ry="2.900" transform="rotate(35 16 14.500)"/>',
  star: '<path d="m12 2.800 2.700 5.900 6.400.700-4.800 4.300 1.400 6.300L12 16.800 6.300 20l1.400-6.300-4.800-4.300 6.400-.700Z"/>',
  tree: '<circle cx="12" cy="9" r="6.200"/><path d="M10.800 14h2.400v7h-2.400Z"/>',
  bridge: '<path d="M2.500 17h19v2.500h-19Z"/><path d="M4 17c0-5 3.600-8.500 8-8.500s8 3.500 8 8.500h-2.600c0-3.400-2.400-5.900-5.400-5.900S6.600 13.600 6.600 17Z"/>',
};

/** A party's flag: its emblem on its colour. Decorative; the party's name is always written beside it. */
export function PartyMark({ party, size = 28, emblem, color, picture }: { party?: number; size?: number; emblem?: EmblemId; color?: string; picture?: string }) {
  const id = party === undefined ? null : PARTY_IDS[party];
  if (id === 'oth') return null;
  const own = picture ?? (emblem ? undefined : id ? flags[id] : undefined);
  if (own) {
    // A picture of the player's own goes on the party's colour, so a logo with clear corners still looks like a flag.
    return (
      <svg className="party-mark" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill={color ?? (id ? PARTIES[id].color : '#888')} />
        <image href={own} width="24" height="24" preserveAspectRatio="xMidYMid slice" />
      </svg>
    );
  }
  const mark = emblem ?? (id ? emblems[id] ?? DEFAULT_EMBLEMS[id as Real] : 'sun');
  const fill = color ?? (id ? PARTIES[id].color : '#888');
  return (
    <svg className="party-mark" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill={fill} />
      <g fill="#fff" dangerouslySetInnerHTML={{ __html: ART[mark] }} />
    </svg>
  );
}
