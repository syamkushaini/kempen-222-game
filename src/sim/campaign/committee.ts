import type { World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { scaled } from './actions';
import { CHAMBER, speakerOf } from './chamber';
import { pushNews } from './news';
import { seatOf } from './events';
import type { Campaign } from './types';

// A select committee of the House is the opposition's one place to put the government under oath. It can be used to bring
// out what the party has dug up, but it takes a dossier to carry it, and a committee that finds nothing is a gift to the
// other side.

export const COMMITTEE = {
  /** Weeks between inquiries, and the least a dossier must hold, which an inquiry spends. */
  every: 26, dossier: 30, money: 30_000,
  /** What a success costs the government, and earns the opposition; what a failure costs the opposition. */
  trust: 8, mood: 0.02, won: 3, lost: 4, spent: 30,
};

export type CommitteeRefusal = 'phase' | 'seat' | 'wait' | 'dossier' | 'funds';

export const committeeWait = (c: Campaign): number => {
  const last = c.career?.committee;
  return last === undefined ? 0 : Math.max(0, last + COMMITTEE.every - c.career!.week);
};

export function canInquire(world: World, c: Campaign): { ok: true } | { ok: false; reason: CommitteeRefusal } {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k || !pc || c.phase !== 'term' || c.inbox.length > 0) return { ok: false, reason: 'phase' };
  if (seatOf(c) !== 'opp') return { ok: false, reason: 'seat' };
  if (committeeWait(c) > 0) return { ok: false, reason: 'wait' };
  if (k.dossier < COMMITTEE.dossier) return { ok: false, reason: 'dossier' };
  if (pc.funds < scaled(world, COMMITTEE.money)) return { ok: false, reason: 'funds' };
  return { ok: true };
}

/** The chance a committee brings something out: the dossier is what it works from, and a believed leader gets a hearing. */
export const inquiryOdds = (c: Campaign): number => clamp(0.3 + c.career!.dossier / 200 + c.career!.credibility / 400 - speakerOf(c).lean * CHAMBER.committee, 0.2, 0.85);

/**
 * The opposition calls the government before a committee. If it finds something, the government's trust and the standing of
 * its parties fall and the opposition is credited with it; if not, it was a political stunt, and the opposition is told so.
 */
export function openInquiry(world: World, c: Campaign): boolean {
  if (!canInquire(world, c).ok) return false;
  const k = c.career!;
  c.parties[c.player]!.funds -= scaled(world, COMMITTEE.money);
  k.dossier = Math.max(0, k.dossier - COMMITTEE.spent);
  k.committee = k.week;
  const rng = new Rng((c.rng ^ 0xc0771) + k.week);
  const found = rng.next() < inquiryOdds(c);
  c.rng = rng.state;
  const g = k.government;
  if (found) {
    g.trust = clamp(g.trust - COMMITTEE.trust, 0, 100);
    for (const p of [g.pm, ...g.partners]) for (const row of k.mood) row[p] -= p === g.pm ? COMMITTEE.mood : COMMITTEE.mood / 2;
    k.credibility = clamp(k.credibility + COMMITTEE.won, 0, 100);
    pushNews(c, { party: c.player, key: 'news.committee.found', vars: {}, tone: 'good' });
  } else {
    k.credibility = clamp(k.credibility - COMMITTEE.lost, 0, 100);
    for (const row of k.mood) row[g.pm] += COMMITTEE.mood / 2;
    pushNews(c, { party: c.player, key: 'news.committee.empty', vars: {}, tone: 'bad' });
  }
  return true;
}
