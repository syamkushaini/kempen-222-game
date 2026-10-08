import type { World } from '../election';
import { clamp } from '../math';
import { houseTally } from './contests';
import { relation, shiftRelation } from './diplomacy';
import { pushNews, ref } from './news';
import { isPm } from './office';
import type { Campaign } from './types';
import { PARTY_IDS } from '../types';

// When a government is falling and the country is in trouble, the head of government may ask every party that matters into
// the cabinet, for a while: a government of national unity. It steadies the House and leaves no opposition to speak of, and it
// is not forgiven by the voters, who like to have someone to vote against. It lasts a year and a half and then comes apart.

export const GRAND = {
  /** The government is this shaky or less, or has no majority of its own, for it to be asked for. */
  shaky: 35,
  /** A party must hold at least this share of the House to be asked, and be no colder than this to the head of government to say yes. */
  share: 0.08, warmth: -20,
  /** How many weeks it lasts. */
  weeks: 78,
  /** What it does to the government’s steadiness and trust while it lasts, and what the voters take off the members each week and give to those who stayed out. */
  stability: 65, trust: 8, resent: 0.0006, protest: 0.001,
  /** What it costs when it ends: the steadiness lost, and the goodwill of those who leave. */
  breakup: 8, parting: -5,
};

const OTH = PARTY_IDS.indexOf('oth');

export const grandOf = (c: Campaign) => c.career?.grand;

export type GrandRefusal = 'phase' | 'calm' | 'once' | 'none';

/** The parties that would join: the big ones outside the government, which do not hate its head. */
export function wouldJoin(world: World, c: Campaign): number[] {
  const g = c.career!.government;
  const seats = houseTally(world, c);
  const total = seats.reduce((a, b) => a + b, 0);
  return seats.map((n, p) => ({ n, p })).filter(({ n, p }) => p !== OTH && p !== g.pm && !g.partners.includes(p) && !!c.parties[p] && n / total >= GRAND.share && relation(c, g.pm, p) >= GRAND.warmth).map(({ p }) => p);
}

export function canUnite(world: World, c: Campaign): { ok: true } | { ok: false; reason: GrandRefusal } {
  const k = c.career;
  if (!k || c.phase !== 'term' || c.inbox.length > 0 || !isPm(c)) return { ok: false, reason: 'phase' };
  if (k.grand || k.flags.includes(`grand${k.term}`)) return { ok: false, reason: 'once' };
  if (k.government.stability > GRAND.shaky && !k.government.minority) return { ok: false, reason: 'calm' };
  if (wouldJoin(world, c).length === 0) return { ok: false, reason: 'none' };
  return { ok: true };
}

/** Asks the big parties in. Those that say yes sit in the cabinet for a year and a half; the House is steadier, and the voters sourer. */
export function formUnity(world: World, c: Campaign): boolean {
  if (!canUnite(world, c).ok) return false;
  const k = c.career!;
  const g = k.government;
  const members = wouldJoin(world, c);
  const seats = houseTally(world, c);
  for (const p of members) {
    g.partners.push(p);
    g.deals[p] = { posts: 0, senior: null, demands: [], cash: 0 };
    g.seats += seats[p] ?? 0;
    shiftRelation(c, g.pm, p, 5);
  }
  g.stability = Math.max(g.stability, GRAND.stability);
  g.trust = clamp(g.trust + GRAND.trust, 0, 100);
  g.minority = false;
  k.grand = { until: k.week + GRAND.weeks, members };
  k.flags.push(`grand${k.term}`);
  pushNews(c, { party: c.player, key: 'news.grand.formed', vars: { parties: members.map((p) => ref.party(p)).join(', ') }, tone: 'neutral' });
  return true;
}

/** A week of unity: the members are taxed by the voters for having joined, and those left outside gain; at the end it comes apart. */
export function grandWeek(world: World, c: Campaign): void {
  const k = c.career;
  const gr = k?.grand;
  if (!k || !gr) return;
  const g = k.government;
  if (g.pm !== c.player) { delete k.grand; return; }
  const members = gr.members.filter((p) => g.partners.includes(p));
  for (const p of members) for (const row of k.mood) row[p] -= GRAND.resent;
  const outside = c.parties.map((pc, p) => (pc && p !== g.pm && !g.partners.includes(p) ? p : -1)).filter((p) => p >= 0);
  for (const p of outside) for (const row of k.mood) row[p] += GRAND.protest;
  if (k.week < gr.until) return;
  // It was for a crisis, and the crisis is over: they go, and the government is less steady for it.
  const seats = houseTally(world, c);
  for (const p of members) {
    g.partners = g.partners.filter((q) => q !== p);
    g.deals[p] = null;
    g.seats -= seats[p] ?? 0;
    shiftRelation(c, g.pm, p, GRAND.parting);
  }
  g.stability = clamp(g.stability - GRAND.breakup, 5, 95);
  delete k.grand;
  pushNews(c, { party: c.player, key: 'news.grand.ended', vars: {}, tone: 'neutral' });
}
