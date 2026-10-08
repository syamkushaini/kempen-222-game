import type { World } from '../election';
import { clamp, zeros } from '../math';
import { N_PARTIES } from '../types';
import { holderOf } from './contests';
import { shiftUnity } from './diplomacy';
import { FACTION_IDS, SAFE_TARGET, factionsOf } from './factions';
import { pushNews, ref } from './news';
import type { Campaign } from './types';

// A seat the party holds can be given to a faction's senior figure as a reward. It buys the faction's goodwill, and
// for as long as the seat stays given the faction is better disposed to the leader. The price is the seat itself: a
// candidate who was not chosen for being the best does not work as hard for it.

export const SAFE = { max: 3, mood: 10, unity: 2, target: SAFE_TARGET, revokeMood: 12, revokeUnity: 2, complacent: 0.06 };

export const safeSeats = (c: Campaign): Record<string, number> => c.career?.safe ?? {};

export type SafeRefusal = 'phase' | 'seat' | 'faction' | 'full' | 'given';

/** Whether a seat can be given to a faction's figure: one the party holds, in the years between elections, up to three at a time. */
export function canGrantSafe(world: World, c: Campaign, seat: string, faction: number): { ok: true } | { ok: false; reason: SafeRefusal } {
  const k = c.career;
  if (!k || c.phase !== 'term') return { ok: false, reason: 'phase' };
  if (!world.seatIndex.has(seat) || holderOf(world, c, seat) !== c.player) return { ok: false, reason: 'seat' };
  if (!Number.isInteger(faction) || faction < 0 || faction >= FACTION_IDS.length) return { ok: false, reason: 'faction' };
  if (seat in safeSeats(c)) return { ok: false, reason: 'given' };
  if (Object.keys(safeSeats(c)).length >= SAFE.max) return { ok: false, reason: 'full' };
  return { ok: true };
}

export function grantSafe(world: World, c: Campaign, seat: string, faction: number): boolean {
  if (!canGrantSafe(world, c, seat, faction).ok) return false;
  const k = c.career!;
  (k.safe ??= {})[seat] = faction;
  const f = factionsOf(c);
  f.mood[faction] = clamp(f.mood[faction] + SAFE.mood, 0, 100);
  shiftUnity(c, c.player, SAFE.unity);
  pushNews(c, { party: c.player, key: 'news.safe.given', vars: { seat: ref.seat(seat), faction: `@faction:${FACTION_IDS[faction]}` }, tone: 'neutral' });
  return true;
}

/** Takes a seat back from a figure it was given to: the faction does not forget it. */
export function revokeSafe(c: Campaign, seat: string): boolean {
  const k = c.career;
  if (!k || c.phase !== 'term' || !k.safe || !(seat in k.safe)) return false;
  const faction = k.safe[seat];
  delete k.safe[seat];
  if (Object.keys(k.safe).length === 0) delete k.safe;
  const f = factionsOf(c);
  f.mood[faction] = clamp(f.mood[faction] - SAFE.revokeMood, 0, 100);
  shiftUnity(c, c.player, -SAFE.revokeUnity);
  pushNews(c, { party: c.player, key: 'news.safe.revoked', vars: { seat: ref.seat(seat), faction: `@faction:${FACTION_IDS[faction]}` }, tone: 'bad' });
  return true;
}

/**
 * At the start of a campaign: seats given as rewards that the party has since lost are dropped; the rest are fought
 * with a candidate who was not chosen to win them.
 */
export function applySafe(world: World, c: Campaign): void {
  const k = c.career;
  if (!k?.safe) return;
  for (const seat of Object.keys(k.safe)) {
    if (holderOf(world, c, seat) !== c.player) { delete k.safe[seat]; continue; }
    (c.drift.support.seat[seat] ??= zeros(N_PARTIES))[c.player] -= SAFE.complacent;
  }
  if (Object.keys(k.safe).length === 0) delete k.safe;
}
