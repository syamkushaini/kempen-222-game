import type { World } from '../election';
import { clamp } from '../math';
import { playable } from './field';
import { inGovernment, syncOpinion, takeOffice } from './career';
import { pushNews, ref } from './news';
import type { Campaign } from './types';

// A leader their own party has thrown out need not be the end of the game: another party may take them in. They arrive as an
// outsider, trusted by few, with their word marked down for having walked out, and lead the party that takes them as they led the last.

/** What changing parties costs the leader's word, and the new party's faith in them (it starts well below a leader who grew up in it). */
export const SWITCH_COST = { credibility: 15, unity: 45 };

/** The parties that would take the leader in: any party they can lead in this contest other than the one that threw them out. */
export function takers(world: World, c: Campaign): number[] {
  if (!canSwitch(c)) return [];
  return playable(world).filter((p) => p !== c.player);
}

/** Whether the career ended because the leader's own party removed them, which is the only ending another party can undo. */
export const canSwitch = (c: Campaign): boolean => !!c.career && c.career.ending?.kind === 'ousted' && c.phase === 'term' && !c.career.midterm;

/**
 * The ousted leader joins another party and the career goes on. What belonged to the old party's leadership (its cabinet, its bills and
 * promises to partners, its factions and businesses) is left behind; what belongs to the leader (their past, the record) goes with them.
 * Returns false if this cannot be done.
 */
export function switchParty(world: World, c: Campaign, to: number): boolean {
  const k = c.career;
  if (!k || !takers(world, c).includes(to)) return false;
  const from = c.player;
  k.previous = [...(k.previous ?? []), { party: from, term: k.term, week: k.week }];
  k.ending = null;
  c.player = to;
  k.credibility = clamp(k.credibility - SWITCH_COST.credibility, 0, 100);
  c.parties[to]!.unity = Math.min(c.parties[to]!.unity, SWITCH_COST.unity);
  // The old party's side of the leader's work is not theirs any more.
  k.orders = { ...k.orders, courting: null, donors: 0, state: 0, grants: 0, focusStates: [] };
  k.cabinet = [];
  k.bills = [];
  k.obligations = [];
  k.assets = 0;
  for (const key of ['appointments', 'claims', 'shadow', 'plots', 'members', 'early', 'supply', 'alliance', 'factions', 'holdings', 'grass', 'adviserPending', 'founded', 'own', 'slate', 'foundedSeat'] as const) delete k[key];
  k.promises = [...k.manifesto[to]];
  k.govRun = inGovernment(c, to) ? 1 : 0;
  k.pmRun = k.government.pm === to ? 1 : 0;
  k.flags.push('switched');
  takeOffice(c);
  syncOpinion(c);
  pushNews(c, { party: to, key: 'news.switched', vars: { party: ref.party(to), from: ref.party(from) }, tone: 'neutral' });
  return true;
}
