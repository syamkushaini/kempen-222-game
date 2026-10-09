import type { World } from '../election';
import { Rng } from '../rng';
import { clamp } from '../math';
import { scaled } from './actions';
import { seatOf } from './events';
import { pushNews } from './news';
import { aides, freeName } from './office';
import { PORTFOLIO_IDS, type Campaign, type PortfolioId } from './types';

// The opposition has a cabinet of its own, waiting. Each post can be given to someone, who is good or not so good at it;
// the more of them there are, the more the party looks like a government, in the papers and to itself. And when it
// comes to power, the person who was shadowing a post is on the list of people to fill it.

/** What it costs to name one: a press conference, a briefing room, a few staff. At general-election scale. */
export const SHADOW_COST = 25_000;
/** The weekly lift to the party's profile of a full shadow cabinet of ordinary people, and the credibility earned by half of one and by all of one. */
export const SHADOW_PROFILE = 0.0005;
export const SHADOW_CRED = { half: 2, full: 3 };

export const shadowOf = (c: Campaign) => c.career?.shadow ?? {};
export const namedCount = (c: Campaign) => Object.keys(shadowOf(c)).length;

/** Whether the player can name a shadow minister now: in the years between elections, from the opposition benches, with the money. */
export function canShadow(world: World, c: Campaign): boolean {
  const pc = c.parties[c.player];
  return !!c.career && !!pc && c.phase === 'term' && seatOf(c) === 'opp' && pc.funds >= scaled(world, SHADOW_COST);
}

/** Names someone to shadow a portfolio, or replaces whoever does. Their ability is a matter of who they turn out to be. */
export function nameShadow(world: World, c: Campaign, portfolio: PortfolioId): boolean {
  if (!canShadow(world, c) || !PORTFOLIO_IDS.includes(portfolio)) return false;
  const k = c.career!;
  const had = k.shadow?.[portfolio];
  const rng = new Rng((c.seed ^ 0x5ad0) + k.term * 131 + PORTFOLIO_IDS.indexOf(portfolio) * 17 + k.week);
  const name = freeName(rng, new Set([...Object.values(k.shadow ?? {}).map((s) => s.name), ...aides(k)]));
  const skill = 2 + rng.int(4);
  c.parties[c.player]!.funds -= scaled(world, SHADOW_COST);
  (k.shadow ??= {})[portfolio] = { name, skill };
  const n = namedCount(c);
  // A cabinet taking shape earns respect, at the half way mark and when it is whole; replacing someone does not count twice.
  if (!had && n === PORTFOLIO_IDS.length / 2 && !k.flags.includes(`shadowHalf${k.term}`)) { k.flags.push(`shadowHalf${k.term}`); k.credibility = clamp(k.credibility + SHADOW_CRED.half, 0, 100); }
  if (!had && n === PORTFOLIO_IDS.length && !k.flags.includes(`shadowFull${k.term}`)) { k.flags.push(`shadowFull${k.term}`); k.credibility = clamp(k.credibility + SHADOW_CRED.full, 0, 100); }
  pushNews(c, { party: c.player, key: 'news.shadow.named', vars: { portfolio: `@portfolio:${portfolio}` }, tone: 'good' });
  return true;
}

/** A week with a shadow cabinet: the party looks like a government, and is talked of like one. */
export function shadowWeek(c: Campaign): void {
  const k = c.career;
  if (!k?.shadow || seatOf(c) !== 'opp') return;
  const people = Object.values(k.shadow);
  const mean = people.reduce((a, s) => a + s.skill, 0) / people.length;
  k.profile[c.player] = Math.min(0.08, k.profile[c.player] + SHADOW_PROFILE * (mean / 3) * (people.length / PORTFOLIO_IDS.length));
}
