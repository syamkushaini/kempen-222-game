import type { World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { spendingLimit } from './actions';
import { pushNews, ref } from './news';
import type { Campaign } from './types';

/** What the Election Commission fines a party: what it overspent, and half as much again. */
export const FINE_SHARE = 1.5;
const HIT = 0.05;
/** How far over the limit a party's campaign must go for the courts to unseat winners on petition, and how many seats a tenth over costs. */
export const PETITION_FROM = 1.4;
export const PETITION_PER_TENTH = 1;
export const PETITION_MAX = 8;

export { spendingLimit };

/** How much a party can still spend within the law. Rival parties never go past it; the player may, at a risk. */
export const withinLimit = (world: World, c: Campaign, p: number) => Math.max(0, spendingLimit(world) - (c.parties[p]?.spent ?? 0));

/** The weekly chance that the Election Commission acts on a party's overspending. Nothing below the limit. */
export function probeChance(world: World, c: Campaign, p: number): number {
  const pc = c.parties[p];
  const limit = spendingLimit(world);
  if (!pc || pc.fined || pc.spent <= limit) return 0;
  return clamp(0.3 + 2.5 * (pc.spent / limit - 1), 0.3, 0.9);
}

/**
 * The Election Commission's week. A party over the limit may be found out:
 * it is fined one and a half times what it overspent, and the story costs it votes.
 */
export function spendingWeek(world: World, c: Campaign, rng: Rng): void {
  c.parties.forEach((pc, p) => {
    if (!pc || rng.next() >= probeChance(world, c, p)) return;
    pc.fined = true;
    const fine = Math.min(pc.funds, Math.round(((pc.spent - spendingLimit(world)) * FINE_SHARE) / 500) * 500);
    pc.funds -= fine;
    for (const row of c.dyn.support.nat) row[p] -= HIT;
    if (c.career && p === c.player) c.career.credibility = Math.max(0, c.career.credibility - 6);
    pushNews(c, { party: p, key: p === c.player ? 'news.ec.finedYou' : 'news.ec.fined', vars: { party: ref.party(p), rm: ref.rm(fine) }, tone: p === c.player ? 'bad' : 'neutral' });
  });
}
