import type { World } from '../election';
import { scaled, spendingLimit } from './actions';
import { SHARE_NEEDED, stateSeatsNeeded, type StepDef } from './journey';
import type { Campaign } from './types';

// While a level of the Career Campaign is fought, the campaign manager speaks only when it matters for the level: in its first week, what this
// level needs (its briefing), and after that only when something needs doing now (the chest is nearly empty, the budget of a shoestring level is
// running out, Get out the vote is open and not yet done in the last week). Otherwise the manager is quiet.

/** How many tips each level has for a player who did not clear it (`tip.<level>.<n>`), shown under the result. */
export const TIPS_PER_LEVEL = 3;
/** Below this much in the chest (at general-election scale: a ceramah's worth) the manager asks for money to be raised. */
export const LOW_FUNDS = 30_000;
/** The share of a shoestring level's budget spent after which the manager warns about it. */
export const BUDGET_WARN = 0.75;

export interface ContestTip { key: string; vars?: Record<string, number> }

/** What the campaign manager says this week, in a contest that is a level of the Career Campaign: the level's briefing, a warning, or nothing. */
export function contestTip(world: World, c: Campaign, step: StepDef): ContestTip | null {
  const pc = c.parties[c.player];
  if (!pc || c.phase !== 'campaign' || c.career) return null;
  if (step.goal === 'winShoestring') {
    const cap = spendingLimit(world) / 2;
    if (pc.spent >= BUDGET_WARN * cap) return { key: 'ctip.budget', vars: { pct: Math.min(100, Math.round((pc.spent / cap) * 100)) } };
  }
  const gotvDone = Object.keys(pc.used).some((k) => k.startsWith('gotv'));
  if (c.week >= c.totalWeeks && world.rules.actions.includes('gotv') && !gotvDone) return { key: 'ctip.gotv' };
  if (c.week < c.totalWeeks && pc.funds < scaled(world, LOW_FUNDS)) return { key: 'ctip.funds' };
  // The briefing: what this level needs, said once, in its first week.
  if (c.week <= 1) return { key: `ltip.${step.id}`, vars: { n: step.need ?? stateSeatsNeeded(step.seats ?? world.seats.length), pct: Math.round((step.share ?? SHARE_NEEDED) * 100), rm: Math.round(spendingLimit(world) / 2) } };
  return null;
}
