import type { World } from '../election';
import type { BlocId } from '../types';
import { applyEffects, publicAmount, type Effect } from './events';
import { pushNews } from './news';
import { RATE, isPm } from './office';
import { treasuryOf } from './treasury';
import type { Campaign, Dial } from './types';

// The levers a head of government can pull on the economy, apart from the budget: for the debt, for prices, for growth and jobs, and for the
// books. Each is an act with a price (in money, trust, votes or growth) and a time before it can be done again, and each shows its effects
// before it is used. The policy rate is a standing choice rather than an act. Money is at general-election scale.

export const TOOL_GOALS = ['debt', 'prices', 'growth', 'books'] as const;
export type ToolGoal = (typeof TOOL_GOALS)[number];

export interface Tool { id: string; goal: ToolGoal; /** Weeks before it can be used again. */ wait: number; effects: Effect[] }

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'cred' | 'stability' | 'trust' | 'fiscal', n: number): Effect => ({ t, n });
const nat = (health = 0, education = 0, standing = 0): Effect => ({ t: 'nation', health, education, standing });
const econ = (growth: number, inflation = 0): Effect => ({ t: 'economy', growth, inflation });
const debt = (n: number): Effect => ({ t: 'debt', n });
const pub = (n: number): Effect => ({ t: 'public', n });
const POOR: BlocId[] = ['urban_b40', 'heartland', 'gig', 'felda'];

export const TOOLS: Tool[] = [
  // The debt
  { id: 'sellAssets', goal: 'debt', wait: 52, effects: [debt(-3), eff('trust', -3), nat(0, 0, -2), mood(['civil'], -0.02)] },
  { id: 'levy', goal: 'debt', wait: 78, effects: [pub(150_000), mood(['smallbiz', 'm40'], -0.03), econ(-0.2), eff('trust', -1)] },
  { id: 'rationalise', goal: 'debt', wait: 52, effects: [eff('fiscal', -2), debt(-0.5), mood(POOR, -0.03), econ(0, 0.3), eff('cred', -1)] },
  { id: 'restructure', goal: 'debt', wait: 104, effects: [debt(-1.5), nat(0, 0, -3), eff('cred', -1)] },
  // Prices
  { id: 'priceControls', goal: 'prices', wait: 26, effects: [econ(-0.2, -0.6), mood('all', 0.01), pub(-30_000)] },
  { id: 'importCuts', goal: 'prices', wait: 39, effects: [econ(0, -0.5), pub(-60_000), mood(['agri'], -0.02)] },
  { id: 'foodAid', goal: 'prices', wait: 26, effects: [econ(0, -0.2), pub(-100_000), mood(POOR, 0.02)] },
  // Growth and jobs
  { id: 'infrastructure', goal: 'growth', wait: 52, effects: [pub(-250_000), econ(0.5), eff('fiscal', 1), mood(['heartland', 'agri', 'felda'], 0.02)] },
  { id: 'investors', goal: 'growth', wait: 52, effects: [econ(0.4), eff('trust', -1), mood(['smallbiz'], -0.01), eff('fiscal', 0.5)] },
  { id: 'skills', goal: 'growth', wait: 39, effects: [pub(-100_000), econ(0.3), nat(0, 2, 0), mood(['undi18', 'gig'], 0.02)] },
  // The books
  { id: 'freeze', goal: 'books', wait: 39, effects: [eff('fiscal', -1.5), mood(['civil'], -0.04), eff('cred', 1)] },
  { id: 'bonds', goal: 'books', wait: 26, effects: [pub(200_000), debt(1.5)] },
];

export const toolOf = (id: string): Tool | undefined => TOOLS.find((t) => t.id === id);

export type ToolRefusal = 'phase' | 'notPm' | 'busy' | 'wait' | 'money' | 'none';

/** Whether a tool can be used now, and if not why not; and the weeks left to wait. */
export function canUseTool(world: World, c: Campaign, id: string): { ok: true } | { ok: false; reason: ToolRefusal; weeks?: number } {
  const k = c.career;
  const tool = toolOf(id);
  if (!k || !tool) return { ok: false, reason: 'none' };
  if (c.phase !== 'term') return { ok: false, reason: 'phase' };
  if (!isPm(c)) return { ok: false, reason: 'notPm' };
  if (c.inbox.length > 0) return { ok: false, reason: 'busy' };
  const last = k.toolsUsed?.[id];
  if (last !== undefined && k.week - last < tool.wait) return { ok: false, reason: 'wait', weeks: tool.wait - (k.week - last) };
  // What is spent comes out of the treasury, and the treasury must have it.
  const cost = tool.effects.filter((e): e is Extract<Effect, { t: 'public' }> => e.t === 'public' && e.n < 0).reduce((a, e) => a - publicAmount(world, c, e.n), 0);
  if (cost > treasuryOf(c)) return { ok: false, reason: 'money' };
  return { ok: true };
}

/** The money a tool costs, in the government's amounts, from the treasury. */
export const toolCost = (world: World, c: Campaign, id: string): number =>
  (toolOf(id)?.effects ?? []).filter((e): e is Extract<Effect, { t: 'public' }> => e.t === 'public' && e.n < 0).reduce((a, e) => a - publicAmount(world, c, e.n), 0);

/** Uses a tool: its effects are applied and it must rest before it is used again. */
export function useTool(world: World, c: Campaign, id: string): boolean {
  if (!canUseTool(world, c, id).ok) return false;
  const tool = toolOf(id)!;
  applyEffects(world, c, tool.effects);
  (c.career!.toolsUsed ??= {})[id] = c.career!.week;
  pushNews(c, { party: c.player, key: 'news.tool.used', vars: { tool: `@tool:${id}` }, tone: 'neutral' });
  return true;
}

export { RATE };
/** The policy rate is a standing choice: see RATE in office.ts. */
export const rateOf = (c: Campaign): Dial => c.career?.rate ?? 0;

export function setRate(c: Campaign, value: Dial): boolean {
  const k = c.career;
  if (!k || c.phase !== 'term' || !isPm(c) || ![-1, 0, 1].includes(value)) return false;
  if (value === 0) delete k.rate; else k.rate = value;
  return true;
}
