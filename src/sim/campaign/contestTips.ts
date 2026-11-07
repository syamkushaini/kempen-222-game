import type { World } from '../election';
import { scaled, spendingLimit } from './actions';
import type { StepDef } from './journey';
import type { Campaign } from './types';

// While a level of the Career Campaign is fought, the campaign manager says one thing a week: what needs doing now if something does (the
// chest is nearly empty, the budget of a shoestring level is running out, Get out the vote is open and not yet done), and otherwise one of the
// level's own tips, a different one each week.

/** How many tips each level has (`tip.<level>.<n>`), the same ones shown when the level is not cleared. */
export const TIPS_PER_LEVEL = 3;
/** Below this much in the chest (at general-election scale: a ceramah's worth) the manager asks for money to be raised. */
export const LOW_FUNDS = 30_000;
/** The share of a shoestring level's budget spent after which the manager warns about it. */
export const BUDGET_WARN = 0.75;

export interface ContestTip { key: string; vars?: Record<string, number> }

/** What the campaign manager says this week, in a contest that is a level of the Career Campaign. Null outside a campaign's weeks. */
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
  return { key: `tip.${step.id}.${((Math.max(1, c.week) - 1) % TIPS_PER_LEVEL) + 1}` };
}
