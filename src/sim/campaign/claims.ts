import { clamp } from '../math';
import { Rng } from '../rng';
import { DEMANDS } from './cast';
import { relation, shiftRelation, shiftUnity } from './diplomacy';
import { dueWeeks } from './govern';
import { pushNews, ref } from './news';
import { inGov, isPm } from './office';
import type { Campaign, Claim } from './types';

// When the player's party is a partner in a government somebody else leads, the head of government promised it things at the talks: the posts
// and the senior post are given at once, but its demands are to be kept over the years. They are listed here with the weeks they fall due, the
// head of government keeps some of them in time, and the player can press for any of them, at the price of the head of government's goodwill if
// they will not be hurried.

/** Weeks between one press for the same promise and the next. */
export const CLAIM_GAP = 8;
/** What a press for a promise costs the head of government's goodwill when it works, and when it does not. */
export const CLAIM_GOODWILL = { granted: 6, refused: -5 };

/** Lists what the head of government owes the player's party, when it is a partner. */
export function makeClaims(c: Campaign): void {
  const k = c.career!;
  delete k.claims;
  if (isPm(c) || !inGov(c, c.player) || k.limited) return;
  const owed = (k.government.deals[c.player]?.demands ?? []).map((demand) => ({ party: k.government.pm, demand }));
  if (owed.length === 0) return;
  const due = dueWeeks(k.week, k.length, owed.length);
  k.claims = owed.map((o, i) => ({ ...o, due: due[i], done: false }));
}

/** The chance that a press for a promise works: better with a head of government who likes the party and has the numbers, and once it has fallen due. */
export function claimChance(c: Campaign, claim: Claim): number {
  const k = c.career!;
  const warmth = relation(c, c.player, k.government.pm) / 100;
  const steady = (k.government.stability - 50) / 200;
  const overdue = k.week > claim.due ? 0.15 : 0;
  return clamp(0.35 + 0.35 * warmth + steady + overdue, 0.1, 0.9);
}

export type ClaimRefusal = 'none' | 'phase' | 'pm' | 'done' | 'busy' | 'wait';
export function canClaim(c: Campaign, index: number): { ok: true } | { ok: false; reason: ClaimRefusal; weeks?: number } {
  const k = c.career;
  const claim = k?.claims?.[index];
  if (!k || !claim) return { ok: false, reason: 'none' };
  if (c.phase !== 'term') return { ok: false, reason: 'phase' };
  if (isPm(c) || !inGov(c, c.player)) return { ok: false, reason: 'pm' };
  if (claim.done) return { ok: false, reason: 'done' };
  if (c.inbox.length > 0) return { ok: false, reason: 'busy' };
  if (claim.asked !== undefined && k.week - claim.asked < CLAIM_GAP) return { ok: false, reason: 'wait', weeks: CLAIM_GAP - (k.week - claim.asked) };
  return { ok: true };
}

/** The player presses the head of government for a promise. It is kept, or the head of government is put out. */
export function claim(c: Campaign, index: number): 'granted' | 'refused' | null {
  if (!canClaim(c, index).ok) return null;
  const k = c.career!;
  const item = k.claims![index];
  const pm = k.government.pm;
  const rng = new Rng((c.rng ^ 0xc1a1) + k.week * 17 + index);
  const works = rng.next() < claimChance(c, item);
  item.asked = k.week;
  if (works) {
    item.done = true;
    shiftRelation(c, c.player, pm, CLAIM_GOODWILL.granted);
    shiftUnity(c, c.player, 2);
    pushNews(c, { party: c.player, key: 'news.claim.granted', vars: { party: ref.party(pm), demand: `@demand:${item.demand}` }, tone: 'good' });
    return 'granted';
  }
  shiftRelation(c, c.player, pm, CLAIM_GOODWILL.refused);
  pushNews(c, { party: c.player, key: 'news.claim.refused', vars: { party: ref.party(pm), demand: `@demand:${item.demand}` }, tone: 'bad' });
  return 'refused';
}

/**
 * A week of the promises: the head of government keeps a promise in its time now and then, more often when it is fond of the party; and a
 * promise that falls due unkept is noted once, and the party's own members notice.
 */
export function claimsWeek(c: Campaign, rng: Rng): void {
  const k = c.career;
  if (!k?.claims || isPm(c)) return;
  const pm = k.government.pm;
  for (const item of k.claims) {
    if (item.done) continue;
    if (k.week >= item.due && rng.next() < 0.01 + 0.03 * Math.max(0, relation(c, c.player, pm)) / 100) {
      item.done = true;
      shiftRelation(c, c.player, pm, 4);
      pushNews(c, { party: c.player, key: 'news.claim.kept', vars: { party: ref.party(pm), demand: `@demand:${item.demand}` }, tone: 'good' });
    } else if (k.week > item.due && !item.late) {
      item.late = true;
      shiftUnity(c, c.player, -2);
      pushNews(c, { party: c.player, key: 'news.claim.late', vars: { party: ref.party(pm), demand: `@demand:${item.demand}` }, tone: 'bad' });
    }
  }
}

/** What a kept promise is worth to the player, for showing: the demand's own name is in the strings; whether it costs the treasury or trust is the head of government's affair. */
export const claimNote = (demand: Claim['demand']): { treasury: boolean; trust: number } => ({ treasury: DEMANDS[demand].treasury, trust: DEMANDS[demand].trust });
