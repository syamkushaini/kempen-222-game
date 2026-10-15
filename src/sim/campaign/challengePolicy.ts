import type { World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { BLOC_IDS, type BlocId } from '../types';
import { scaled } from './actions';
import { CHAMBER, speakerOf } from './chamber';
import { strikeDown } from './courts';
import { seatOf } from './events';
import { programmesOf } from './govern';
import { pushNews } from './news';
import { PLEDGES, blocSizes } from './policy';
import type { Campaign, PledgeId } from './types';

// The opposition may contest any policy of the government: an Act on the books, a programme running, or a bill before the House.
// There are three ways: to debate it in the House, to take an Act to the court, and to take the argument to the public. Each costs
// money and some of the dossier, each can fail, and the opposition may only do it once in a while and once for each policy.

export type Method = 'debate' | 'court' | 'public';
export const METHODS: readonly Method[] = ['debate', 'court', 'public'];

export const CHALLENGE = {
  /** Weeks between challenges. */
  every: 8,
  /** Money (at general-election scale) and dossier each method spends. */
  money: { debate: 10_000, court: 40_000, public: 30_000 } as Record<Method, number>,
  dossier: { debate: 8, court: 20, public: 10 } as Record<Method, number>,
  /** A debate that carries delays a bill this many weeks, and costs the government trust. A failed one costs the opposition credibility. */
  delay: 8, trust: 3, won: 1, lost: 2, courtLost: 3,
  /** What taking the argument to the public moves in a group that is set against the policy, per unit of how hard it is set against. */
  swing: 0.4, backlash: 2,
};

export type Refusal = 'phase' | 'seat' | 'wait' | 'again' | 'dossier' | 'funds' | 'method';

/** Every policy of the government that can be challenged, as a promise id: Acts on the books, programmes running, and bills before the House. */
export function targets(c: Campaign): PledgeId[] {
  const k = c.career!;
  const bills = k.bills.filter((b) => b.id.startsWith('pledge:')).map((b) => b.id.slice(7) as PledgeId);
  return [...new Set([...(k.laws ?? []), ...programmesOf(k).map(([id]) => id), ...bills])].filter((id) => PLEDGES[id]);
}

export const isAct = (c: Campaign, id: PledgeId): boolean => !!c.career?.laws?.includes(id);
export const isBill = (c: Campaign, id: PledgeId): boolean => !!c.career?.bills.some((b) => b.id === `pledge:${id}`);

/** How hard the voters, group by group and weighted by size, are set against a policy: above zero when it is unpopular, below when it is liked. */
export function opposition(world: World, id: PledgeId): number {
  const size = blocSizes(world);
  return -BLOC_IDS.reduce((a, b, i) => a + size[i] * (PLEDGES[id].appeal[b as BlocId] ?? 0), 0);
}

export const challengeWait = (c: Campaign): number => {
  const last = c.career?.challenged?.last;
  return last === undefined ? 0 : Math.max(0, last + CHALLENGE.every - c.career!.week);
};

/** Whether the opposition may challenge this policy this way now, and if not, why. */
export function canChallenge(world: World, c: Campaign, id: PledgeId, method: Method): { ok: true } | { ok: false; reason: Refusal } {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k || !pc || c.phase !== 'term' || c.inbox.length > 0) return { ok: false, reason: 'phase' };
  if (seatOf(c) !== 'opp') return { ok: false, reason: 'seat' };
  if (!targets(c).includes(id)) return { ok: false, reason: 'method' };
  if (challengeWait(c) > 0) return { ok: false, reason: 'wait' };
  if (k.challenged?.done.includes(id)) return { ok: false, reason: 'again' };
  // A debate is on a bill before the House; the court looks only at an Act that is not the voters' own.
  if (method === 'debate' && !isBill(c, id) && !isAct(c, id)) return { ok: false, reason: 'method' };
  if (method === 'court' && (!isAct(c, id) || k.mandated?.includes(id))) return { ok: false, reason: 'method' };
  if (k.dossier < CHALLENGE.dossier[method]) return { ok: false, reason: 'dossier' };
  if (pc.funds < scaled(world, CHALLENGE.money[method])) return { ok: false, reason: 'funds' };
  return { ok: true };
}

/** The chance a debate carries or the court strikes the Act down. (A campaign for the public does not depend on chance.) */
export function challengeOdds(world: World, c: Campaign, id: PledgeId, method: Method): number {
  const k = c.career!;
  const unpopular = opposition(world, id);
  const believed = k.credibility / 400 + k.dossier / 300;
  if (method === 'court') return clamp(0.08 + (k.shaky?.includes(id) ? 0.25 : 0) + believed / 2 + unpopular * 2, 0.05, 0.6);
  return clamp(0.3 + believed + unpopular * 2 - speakerOf(c).lean * CHAMBER.committee, 0.1, 0.8);
}

/**
 * The opposition challenges a policy. A debate delays a bill (or, against an Act, shames the government into giving ground),
 * a court case may strike an Act down, and a campaign turns the groups set against it. Whatever the result, the money and
 * dossier are spent, and the opposition may not challenge again for a while or take on the same policy twice.
 */
export function challenge(world: World, c: Campaign, id: PledgeId, method: Method): boolean {
  if (!canChallenge(world, c, id, method).ok) return false;
  const k = c.career!;
  const g = k.government;
  const me = c.player;
  c.parties[me]!.funds -= scaled(world, CHALLENGE.money[method]);
  k.dossier = Math.max(0, k.dossier - CHALLENGE.dossier[method]);
  k.challenged = { last: k.week, done: [...(k.challenged?.done ?? []), id] };
  const bill = `@bill:pledge:${id}`;
  const rng = new Rng((c.rng ^ 0xc4a11) + k.week);
  const roll = rng.next();
  c.rng = rng.state;

  if (method === 'public') {
    const against = opposition(world, id);
    if (against > 0) {
      // Groups that dislike the policy turn towards the opposition and away from the government's head.
      for (const b of BLOC_IDS) {
        const v = PLEDGES[id].appeal[b as BlocId] ?? 0;
        if (v >= 0) continue;
        const i = BLOC_IDS.indexOf(b);
        k.mood[i][me] += -v * CHALLENGE.swing * 0.05;
        k.mood[i][g.pm] -= -v * CHALLENGE.swing * 0.025;
      }
      k.credibility = clamp(k.credibility + CHALLENGE.won, 0, 100);
      pushNews(c, { party: me, key: 'news.contest.public.won', vars: { bill }, tone: 'good' });
    } else {
      // The voters like it: the campaign was against them.
      k.credibility = clamp(k.credibility - CHALLENGE.backlash, 0, 100);
      pushNews(c, { party: me, key: 'news.contest.public.lost', vars: { bill }, tone: 'bad' });
    }
    return true;
  }

  const won = roll < challengeOdds(world, c, id, method);
  if (method === 'court') {
    if (won) {
      strikeDown(c, id);
      k.credibility = clamp(k.credibility + CHALLENGE.won + 1, 0, 100);
      pushNews(c, { party: me, key: 'news.contest.court.won', vars: { bill }, tone: 'good' });
    } else {
      k.credibility = clamp(k.credibility - CHALLENGE.courtLost, 0, 100);
      pushNews(c, { party: me, key: 'news.contest.court.lost', vars: { bill }, tone: 'bad' });
    }
    return true;
  }

  // A debate in the House.
  if (won) {
    const pending = k.bills.find((b) => b.id === `pledge:${id}`);
    if (pending) pending.weeks += CHALLENGE.delay;
    g.trust = clamp(g.trust - CHALLENGE.trust, 0, 100);
    k.credibility = clamp(k.credibility + CHALLENGE.won, 0, 100);
    pushNews(c, { party: me, key: pending ? 'news.contest.debate.delayed' : 'news.contest.debate.won', vars: { bill }, tone: 'good' });
  } else {
    k.credibility = clamp(k.credibility - CHALLENGE.lost, 0, 100);
    pushNews(c, { party: me, key: 'news.contest.debate.lost', vars: { bill }, tone: 'bad' });
  }
  return true;
}
