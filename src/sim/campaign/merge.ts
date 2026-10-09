import type { World } from '../election';
import { clamp } from '../math';
import { ENTERS, MERGED, STANDS, WITHDRAWN } from '../transfer';
import { BLOC_IDS, N_PARTIES, PARTY_IDS } from '../types';
import { AFFINITY } from './cast';
import { holderOf, houseTally } from './contests';
import { relation, shiftUnity } from './diplomacy';
import { pushNews, ref } from './news';
import { vacate } from './office';
import { rollsOf } from './party';
import { ISSUE_IDS, type Campaign, type SeatResults } from './types';

// A party can swallow an ally. The small party stops existing: its seats in the House become the player's, its members
// and its voters go with them, and at the next election it does not stand, its voters following the player's party.
// What it costs is the party's own unity, some of its credibility, and a step on policy towards the party it has taken in.

/** An ally's leader must be at least this warm towards the player, and the ally no more than this share of the player's seats. */
export const MERGER = { warmth: 50, size: 0.35, unity: 8, credibility: 3, mood: 0.5 };
/** How many parties one career can take in. */
export const MAX_MERGERS = 3;

export const mergedOf = (c: Campaign): number[] => c.career?.merged ?? [];

export type MergerRefusal = 'phase' | 'none' | 'warmth' | 'size' | 'full' | 'already';

/** Whether the player can take in this party: a small ally, in the years between elections. */
export function canMerge(world: World, c: Campaign, p: number): { ok: true } | { ok: false; reason: MergerRefusal } {
  const k = c.career;
  if (!k || c.phase !== 'term' || c.inbox.length > 0) return { ok: false, reason: 'phase' };
  // The party that heads the government is not one to be swallowed while it does.
  if (p === c.player || !c.parties[p] || PARTY_IDS[p] === 'oth' || p === k.government.pm) return { ok: false, reason: 'none' };
  if (mergedOf(c).includes(p)) return { ok: false, reason: 'already' };
  if (mergedOf(c).length >= MAX_MERGERS) return { ok: false, reason: 'full' };
  if (relation(c, c.player, p) < MERGER.warmth) return { ok: false, reason: 'warmth' };
  const seats = houseTally(world, c);
  if (seats[p] <= 0 || seats[p] > MERGER.size * Math.max(1, seats[c.player])) return { ok: false, reason: 'size' };
  return { ok: true };
}

/** The issue on which a party stands furthest from the player, and the player's step towards it. */
function nearestStep(c: Campaign, p: number): { issue: number; to: number } | null {
  const k = c.career!;
  let found: { issue: number; to: number } | null = null;
  let widest = 0;
  for (let i = 0; i < ISSUE_IDS.length; i++) {
    const mine = k.stances[c.player][i], theirs = k.stances[p][i];
    const gap = Math.abs(mine - theirs);
    if (gap > widest) { widest = gap; found = { issue: i, to: mine + Math.sign(theirs - mine) }; }
  }
  return found;
}

/** Takes the party in. */
export function merge(world: World, c: Campaign, p: number): boolean {
  if (!canMerge(world, c, p).ok) return false;
  const k = c.career!;
  const me = c.player;
  const g = k.government;
  // Its seats in the House are the player's now: they sit where the player's party sits, in the government or across from it.
  const taken = houseTally(world, c)[p] ?? 0;
  const inGov = (q: number) => q === g.pm || g.partners.includes(q);
  g.seats += (inGov(me) ? taken : 0) - (inGov(p) ? taken : 0);
  world.seats.forEach((seat) => { if (holderOf(world, c, seat.id) === p) k.house[seat.id] = me; });
  // A partner that no longer exists holds no posts, is owed nothing and plots nothing.
  if (g.partners.includes(p)) {
    g.partners = g.partners.filter((x) => x !== p);
    g.deals[p] = null;
    vacate(c, p);
  }
  k.obligations = k.obligations.filter((o) => o.party !== p);
  if (k.supply) { k.supply = k.supply.filter((s) => s.party !== p); if (k.supply.length === 0) delete k.supply; }
  if (k.alliance?.members.includes(p)) { k.alliance.members = k.alliance.members.filter((m) => m !== p); if (k.alliance.members.length <= 1) delete k.alliance; }
  // Its voters and its standing go with it.
  for (let b = 0; b < BLOC_IDS.length; b++) k.mood[b][me] += Math.max(0, k.mood[b][p]) * MERGER.mood;
  k.profile[me] = Math.max(k.profile[me], k.profile[p]);
  // The party takes a step towards what the one it has swallowed believes.
  const step = nearestStep(c, p);
  if (step) { k.stances[me][step.issue] = step.to; k.stances0[me][step.issue] = step.to; }
  // Its members join the roll: in proportion to its seats against the player's.
  const seats = houseTally(world, c);
  k.rolls = rollsOf(world, c) * (1 + 0.5 * (taken / Math.max(1, seats[me] - taken)));
  shiftUnity(c, me, -MERGER.unity - 20 * Math.max(0, -AFFINITY[me][p]));
  k.credibility = clamp(k.credibility - MERGER.credibility, 0, 100);
  (k.merged ??= []).push(p);
  pushNews(c, { party: me, key: 'news.merger', vars: { party: ref.party(p) }, tone: 'good' });
  return true;
}

/**
 * The campaign begins: the parties that were taken in do not stand, and their voters follow the one that took them.
 * Where that party had no candidate of its own, the merged party's candidate is now its candidate: otherwise the seats
 * the merged party held would be given up without a vote, and its voters would have no one to follow.
 */
export function standMerged(world: World, c: Campaign): void {
  const me = c.player;
  for (const p of mergedOf(c)) {
    world.seats.forEach((seat, i) => {
      if (!world.baseline.contesting[i][p]) return;
      const row = c.standDowns[seat.id] ?? (c.standDowns[seat.id] = new Array<number>(N_PARTIES).fill(STANDS));
      row[p] = MERGED + me;
      if (row[me] === WITHDRAWN) row[me] = STANDS;
      else if (row[me] === STANDS && !world.baseline.contesting[i][me]) row[me] = ENTERS;
    });
  }
}

/** The election is over: what the merged parties won is the player's party's, and they are gone from the ballot for good. */
export function foldMerged(c: Campaign, results: SeatResults): SeatResults {
  const merged = mergedOf(c);
  if (merged.length === 0) return results;
  const fold = (row: number[]) => { const out = [...row]; for (const p of merged) { out[c.player] += out[p]; out[p] = 0; } return out; };
  return {
    votes: results.votes.map(fold),
    turnout: results.turnout,
    basis: results.basis.map((b) => (b ? { votes: fold(b.votes), turnout: b.turnout } : b)),
  };
}
