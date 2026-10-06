import type { World } from '../election';
import { termIncome } from './career';
import { weeklyIncome } from './field';
import { pushNews, ref } from './news';
import { incomeBoost } from './perks';
import type { Campaign, PartyCampaign } from './types';

// A way out of an empty chest with a price: a lender advances the next few
// weeks of the party's income at a discount, and takes that income as it comes
// in. Nothing can be borrowed against income that will never arrive, so there
// is no loan in the last week of a contest, and none while one is owed.

/** What the lender pays out for each ringgit of income signed over. */
const ADVANCE = 0.8;
/** How many weeks of income can be signed over: in a campaign, and in the years between. */
const WEEKS = { campaign: 3, term: 8 };

export interface LoanOffer { weeks: number; advance: number; owed: number }

/** What a week brings in for the player as things stand. */
function weekly(world: World, c: Campaign): number {
  return c.phase === 'term' ? termIncome(world, c).total : Math.round(weeklyIncome(world, c.player, c) * incomeBoost(c, c.player));
}

/** What a lender would advance now, or nothing if there is a loan already or no income left to lend against. */
export function loanOffer(world: World, c: Campaign): LoanOffer | null {
  const pc = c.parties[c.player];
  if (!pc || pc.loan || (c.phase !== 'campaign' && c.phase !== 'term')) return null;
  // Income arrives at the end of every week but the last.
  const left = c.phase === 'term' ? (c.career ? c.career.length - c.career.week : 0) : c.totalWeeks - c.week;
  const weeks = Math.min(c.phase === 'term' ? WEEKS.term : WEEKS.campaign, left);
  const owed = weeks * weekly(world, c);
  const advance = Math.floor((owed * ADVANCE) / 500) * 500;
  return weeks > 0 && advance > 0 ? { weeks, advance, owed } : null;
}

/** Takes the loan on offer. */
export function borrow(world: World, c: Campaign): boolean {
  const offer = loanOffer(world, c);
  const pc = c.parties[c.player];
  if (!offer || !pc) return false;
  pc.funds += offer.advance;
  pc.loan = offer.owed;
  pushNews(c, { party: c.player, key: 'news.loan.taken', vars: { rm: ref.rm(offer.advance), n: offer.weeks }, tone: 'neutral' });
  return true;
}

/** Income arriving: the lender is paid first. Returns what is left for the party. */
export function afterLender(c: Campaign, pc: PartyCampaign, income: number): number {
  if (!pc.loan) return income;
  const paid = Math.min(pc.loan, Math.max(0, income));
  pc.loan -= paid;
  if (pc.loan <= 0) {
    delete pc.loan;
    pushNews(c, { party: c.player, key: 'news.loan.cleared', tone: 'good' });
  }
  return income - paid;
}
