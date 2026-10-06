import { PARTY_IDS } from '../sim/types';
import { hasOwnLook } from './faces';

// Painted portraits of the party leaders, by party id, for those that have one. A leader without one, and a leader the
// player has given a look of their own, keep the drawn bust; so does everyone else in the game.
const PAINTED: Record<string, string> = Object.fromEntries(
  Object.entries(import.meta.glob('../assets/portraits/*.jpg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>)
    .map(([path, url]) => [path.replace(/^.*\/(\w+)\.jpg$/, '$1'), url]),
);

/** The painted portrait of a party's leader, or null where there is none or the player has chosen another face. */
export const paintedLeader = (party: number): string | null => (hasOwnLook(party) ? null : PAINTED[PARTY_IDS[party]] ?? null);
