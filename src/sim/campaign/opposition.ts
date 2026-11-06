import type { World } from '../election';
import { lastElection } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { N_BLOCS, N_PARTIES } from '../types';
import { rebuilding, scaled } from './actions';
import { CHALLENGE, opposition as unpopularity, type Method } from './challengePolicy';
import { freeName } from './office';
import { pushNews } from './news';
import { PLEDGES } from './policy';
import { SHADOW_COST } from './shadow';
import { PLEDGE_IDS, PORTFOLIO_IDS, type Campaign, type Opposition, type PledgeId, type PortfolioId } from './types';

// The years of rebuilding after a defeat in the Career Campaign. There is no parliament, budget or bills to hold a government to account in, so the
// party that won the contest stands in for the government, with a few policies of its own to be challenged. What an opposition does in a career
// (a cabinet in waiting, a dossier, a challenge in the House or before the public) is done here in a smaller way, with the same prices.

/** The main posts the opposition shadows here. */
export const SHADOW_POSTS: readonly PortfolioId[] = PORTFOLIO_IDS.slice(0, 8);
/** How the opposition may challenge here: in the House, or before the public (there is no court to go to). */
export const OPP_METHODS: readonly Method[] = ['debate', 'public'];
/** Days a committee hearing takes, and the dossier it adds. */
export const COMMITTEE = { days: 1, dossier: 20 };
const POLICIES_SHOWN = 4;

/** Begins the opposition's affairs: the government is whoever won the contest, and has some policies. */
export function startOpposition(world: World, c: Campaign): void {
  const votes = lastElection(world).votes;
  let govt = -1;
  for (let p = 0; p < N_PARTIES; p++) if (p !== c.player && c.parties[p] && (govt < 0 || votes[p] > votes[govt])) govt = p;
  const rng = new Rng((c.seed ^ 0x0ff1ce) >>> 0);
  const pool = [...PLEDGE_IDS].filter((id) => PLEDGES[id]);
  const policies: PledgeId[] = [];
  while (policies.length < POLICIES_SHOWN && pool.length) policies.push(pool.splice(rng.int(pool.length), 1)[0]);
  c.opposition = { govt: Math.max(0, govt), policies, shadow: {}, dossier: 0, credibility: 30, challenged: [], lastChallenge: -CHALLENGE.every, used: [], flags: [], won: 0, lost: 0 };
}

const open = (c: Campaign): c is Campaign & { opposition: Opposition } => !!c.opposition && rebuilding(c) && c.phase === 'campaign';

export const namedCount = (o: Opposition) => Object.keys(o.shadow).length;

/** Whether the player can name someone to shadow a post now: in the weeks of rebuilding, with the money. */
export function canShadowHere(world: World, c: Campaign): boolean {
  return open(c) && (c.parties[c.player]?.funds ?? 0) >= scaled(world, SHADOW_COST);
}

/** Names someone to shadow a post, or replaces whoever does. How good they are is a matter of who they turn out to be. */
export function nameShadowHere(world: World, c: Campaign, post: PortfolioId): boolean {
  if (!canShadowHere(world, c) || !SHADOW_POSTS.includes(post)) return false;
  const o = c.opposition!;
  const had = o.shadow[post];
  const rng = new Rng(((c.seed ^ 0x5ad0) + c.week * 131 + SHADOW_POSTS.indexOf(post) * 17) >>> 0);
  const name = freeName(rng, new Set(Object.values(o.shadow).map((s) => s!.name)));
  c.parties[c.player]!.funds -= scaled(world, SHADOW_COST);
  o.shadow[post] = { name, skill: 2 + rng.int(4) };
  const n = namedCount(o);
  if (!had && n === Math.floor(SHADOW_POSTS.length / 2) && !o.flags.includes('half')) { o.flags.push('half'); o.credibility = clamp(o.credibility + 2, 0, 100); }
  if (!had && n === SHADOW_POSTS.length && !o.flags.includes('full')) { o.flags.push('full'); o.credibility = clamp(o.credibility + 3, 0, 100); }
  pushNews(c, { party: c.player, key: 'news.shadow.named', vars: { portfolio: `@portfolio:${post}` }, tone: 'good' });
  return true;
}

/** Calls a minister before a committee: a day's work, once a week, that digs something up. */
export function committeeHere(c: Campaign): boolean {
  if (!open(c)) return false;
  const pc = c.parties[c.player]!;
  const o = c.opposition;
  if (o.used.includes('committee') || pc.days < COMMITTEE.days) return false;
  pc.days -= COMMITTEE.days;
  o.used.push('committee');
  o.dossier = Math.min(100, o.dossier + COMMITTEE.dossier);
  o.credibility = clamp(o.credibility + 1, 0, 100);
  pushNews(c, { party: c.player, key: 'news.opp.committee', vars: { party: `@party:${o.govt}` }, tone: 'good' });
  return true;
}

export type ChallengeRefusal = 'phase' | 'wait' | 'again' | 'dossier' | 'funds';

/** Whether a policy can be challenged now, and why not. */
export function canChallengeHere(world: World, c: Campaign, id: PledgeId, method: Method): { ok: true } | { ok: false; reason: ChallengeRefusal } {
  if (!open(c)) return { ok: false, reason: 'phase' };
  const o = c.opposition;
  if (c.week - o.lastChallenge < CHALLENGE.every) return { ok: false, reason: 'wait' };
  if (o.challenged.includes(id)) return { ok: false, reason: 'again' };
  if (o.dossier < CHALLENGE.dossier[method]) return { ok: false, reason: 'dossier' };
  if ((c.parties[c.player]?.funds ?? 0) < scaled(world, CHALLENGE.money[method])) return { ok: false, reason: 'funds' };
  return { ok: true };
}

/** The chance a challenge carries: better with a dossier and a name for being believed, better against a policy the voters dislike. */
export function challengeChance(world: World, c: Campaign, id: PledgeId, method: Method): number {
  const o = c.opposition!;
  const base = method === 'debate' ? 0.4 : 0.35;
  return clamp(base + o.dossier / 250 + o.credibility / 400 + 1.2 * unpopularity(world, id), 0.1, 0.9);
}

const nudge = (c: Campaign, p: number, amount: number) => {
  const rows = c.dyn.support.nat;
  for (let b = 0; b < N_BLOCS; b++) rows[b][p] = clamp(rows[b][p] + amount, -0.5, 0.3);
};

/** Takes a policy of the government to the House or to the public. It carries or it does not. */
export function challengeHere(world: World, c: Campaign, id: PledgeId, method: Method): boolean | null {
  if (!canChallengeHere(world, c, id, method).ok) return null;
  const o = c.opposition!;
  const rng = new Rng(((c.seed ^ 0xc4a1) + c.week * 977 + PLEDGE_IDS.indexOf(id) * 31) >>> 0);
  const pc = c.parties[c.player]!;
  pc.funds -= scaled(world, CHALLENGE.money[method]);
  o.dossier = Math.max(0, o.dossier - CHALLENGE.dossier[method]);
  o.challenged.push(id);
  o.lastChallenge = c.week;
  const won = rng.next() < challengeChance(world, c, id, method);
  if (won) {
    nudge(c, o.govt, -0.012 * (method === 'public' ? 1.3 : 1));
    nudge(c, c.player, 0.008);
    o.credibility = clamp(o.credibility + CHALLENGE.won, 0, 100);
    o.won++;
  } else {
    o.lost++;
    nudge(c, c.player, -0.004);
    o.credibility = clamp(o.credibility - CHALLENGE.lost, 0, 100);
  }
  pushNews(c, { party: c.player, key: `news.opp.challenge.${method}.${won ? 'won' : 'lost'}`, vars: { party: `@party:${o.govt}`, policy: `@bill:pledge:${id}` }, tone: won ? 'good' : 'bad' });
  return won;
}

/** A week in opposition: a cabinet in waiting lifts the party's standing a little, belief in it settles back, and the week's work is cleared. */
export function oppositionWeek(c: Campaign): void {
  const o = c.opposition;
  if (!o || !rebuilding(c)) return;
  const people = Object.values(o.shadow);
  if (people.length > 0) {
    const mean = people.reduce((a, s) => a + s!.skill, 0) / people.length;
    nudge(c, c.player, 0.0015 * (mean / 3) * (people.length / SHADOW_POSTS.length));
  }
  o.credibility += (30 - o.credibility) * 0.01;
  o.used = [];
  // The weeks pass by themselves until something matters: a quarter ends, or the government stumbles and leaves an opening (the dossier grows).
  if (c.week % QUARTER === 0) o.pause = true;
  if (new Rng(((c.seed ^ 0x09e1) + c.week * 53) >>> 0).next() < OPENING_CHANCE) {
    o.dossier = Math.min(100, o.dossier + OPENING_DOSSIER);
    pushNews(c, { party: c.player, key: 'news.opp.opening', vars: { party: `@party:${o.govt}` }, tone: 'good' });
    o.pause = true;
  }
}

/** Weeks in a quarter of the year; the chance in any week that the government stumbles; and what a stumble adds to the dossier. */
export const QUARTER = 13;
const OPENING_CHANCE = 0.05;
const OPENING_DOSSIER = 25;

/** The most the years of rebuilding can add to the next campaign, in support (logit units, about 2 points of the vote at the most). */
export const REPAIR_MAX = 0.1;

/**
 * The years end and the election campaign begins: what was done in opposition (a party at one, branches built, a cabinet in waiting, a name for being
 * believed, arguments won) lifts the party's standing at the start of it. It is what makes the years worth playing.
 */
export function closeOpposition(c: Campaign): void {
  const o = c.opposition;
  const pc = c.parties[c.player];
  if (!o || !pc || o.result) return;
  const people = Object.values(o.shadow);
  const shadow = people.length === 0 ? 0 : (people.length / SHADOW_POSTS.length) * (people.reduce((a, s) => a + s!.skill, 0) / people.length / 5);
  const score = 0.4 * clamp(pc.unity / 100, 0, 1) + 0.3 * (o.credibility / 100) + 0.3 * shadow;
  const bonus = Math.min(REPAIR_MAX, 0.08 * score + 0.004 * o.won);
  nudge(c, c.player, bonus);
  o.result = { bonus, unity: Math.round(pc.unity), credibility: Math.round(o.credibility), shadow: people.length, won: o.won, lost: o.lost };
  pushNews(c, { party: c.player, key: 'news.opp.result', vars: { pts: Math.round(bonus * 25 * 10) / 10 }, tone: bonus > 0.02 ? 'good' : 'neutral' });
}
