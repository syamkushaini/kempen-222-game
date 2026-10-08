import type { World } from '../election';
import { clamp } from '../math';
import { lastElection } from '../election';
import { houseTally } from './contests';
import { clashSeats, draftPact, relation, shiftRelation, signPact, beforeNomination, type PactProposal } from './diplomacy';
import { pushNews, ref } from './news';
import type { Campaign } from './types';

// A pact about seats is easier to keep, and to defend to the members who give up a seat for it, when it is made in the year
// before the election and not in the week before the candidates are named. It is agreed now and signed when the campaign opens;
// the other leader holds you to it, and an early pact that is dropped is not forgiven.

export const EARLY = { window: 52, warmth: 20, max: 3, relation: 10, dropped: -25, credibility: 3 };

/** The seats proposed in an early pact, by party, kept until the campaign opens. */
export const earlyPacts = (c: Campaign): Record<number, PactProposal> => c.career?.early ?? {};

export type EarlyRefusal = 'phase' | 'window' | 'none' | 'cold' | 'full' | 'already' | 'empty';

/** Whether the player can agree seats with this party now: in the last year of the term, with a leader who is not cold, up to three. */
export function canAgreeEarly(world: World, c: Campaign, p: number): { ok: true } | { ok: false; reason: EarlyRefusal } {
  const k = c.career;
  if (!k || c.phase !== 'term' || c.inbox.length > 0 || world.rules.kind !== 'general') return { ok: false, reason: 'phase' };
  if (k.week < k.length - EARLY.window) return { ok: false, reason: 'window' };
  if (p === c.player || !c.parties[p] || (houseTally(world, c)[p] ?? 0) <= 0) return { ok: false, reason: 'none' };
  if (k.early?.[p]) return { ok: false, reason: 'already' };
  if (Object.keys(k.early ?? {}).length >= EARLY.max) return { ok: false, reason: 'full' };
  if (relation(c, c.player, p) < EARLY.warmth) return { ok: false, reason: 'cold' };
  if (clashSeats(world, c, c.player, p).length === 0) return { ok: false, reason: 'empty' };
  return { ok: true };
}

/** What a pact with this party would be, as the seats stand: who would stand aside where. */
export function draftEarly(world: World, c: Campaign, p: number): PactProposal {
  return draftPact(world, c, c.player, p, 'targeted', lastElection(world));
}

/** Agrees seats with a party now. Nothing is signed yet, but the other leader takes it as given. */
export function agreeEarly(world: World, c: Campaign, p: number): boolean {
  if (!canAgreeEarly(world, c, p).ok) return false;
  const prop = draftEarly(world, c, p);
  if (prop.give.length + prop.get.length < 2) return false;
  (c.career!.early ??= {})[p] = prop;
  shiftRelation(c, c.player, p, EARLY.relation);
  pushNews(c, { party: p, key: 'news.early.agreed', vars: { party: ref.party(p), n: prop.give.length + prop.get.length }, tone: 'good' });
  return true;
}

/** The player thinks better of it: the other leader does not like being told, a year out. */
export function dropEarly(c: Campaign, p: number): boolean {
  const k = c.career;
  if (!k?.early?.[p] || c.phase !== 'term') return false;
  delete k.early[p];
  if (Object.keys(k.early).length === 0) delete k.early;
  shiftRelation(c, c.player, p, EARLY.dropped);
  k.credibility = clamp(k.credibility - EARLY.credibility, 0, 100);
  pushNews(c, { party: p, key: 'news.early.dropped', vars: { party: ref.party(p) }, tone: 'bad' });
  return true;
}

/**
 * When the campaign opens, the early pacts are signed: the seats that still clash are stood aside as agreed, with goodwill for
 * having said so early. A pact that no longer has anything in it is let go, and one with a party that is no longer there.
 */
export function signEarlyPacts(world: World, c: Campaign): void {
  const k = c.career;
  if (!k?.early || !beforeNomination(c)) { if (k) delete k.early; return; }
  for (const [key, prop] of Object.entries(k.early)) {
    const p = Number(key);
    const clash = new Set(clashSeats(world, c, c.player, p).map((i) => world.seats[i].id));
    const live: PactProposal = { give: prop.give.filter((s) => clash.has(s)), get: prop.get.filter((s) => clash.has(s)) };
    if (!c.parties[p] || live.give.length + live.get.length === 0) continue;
    signPact(world, c, c.player, p, live);
    // It was said early, and kept: the members who gave up a seat were told in good time.
    shiftRelation(c, c.player, p, EARLY.relation);
    c.parties[c.player]!.unity = clamp(c.parties[c.player]!.unity + 2, 0, 100);
  }
  delete k.early;
}
