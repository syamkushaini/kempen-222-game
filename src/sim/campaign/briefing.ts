import type { World } from '../election';
import { termIncome, termSpending } from './career';
import { remindersOf, type Reminder } from './reminders';
import { isPm } from './office';
import { treasuryCap, treasuryOf } from './treasury';
import type { Campaign, Career } from './types';

// The week's briefing: what has changed since a few weeks ago, what needs the player now, what is worth watching, and what they could do
// about it. Every line is worked out from the state of the game and a snapshot of it taken a month earlier, and says nothing that did not happen.

export { SNAP_EVERY, briefWeek, snapshot, type Snap } from './snaps';
import { snapshot } from './snaps';

export type ChangeId = 'unity' | 'credibility' | 'stability' | 'trust' | 'funds' | 'growth' | 'inflation' | 'jobless' | 'debt' | 'treasury';
/** How big a move has to be to be worth saying, and whether going up is good. */
const CHANGES: { id: ChangeId; least: number; good: boolean | null; tab: string }[] = [
  { id: 'unity', least: 3, good: true, tab: 'party' },
  { id: 'credibility', least: 3, good: true, tab: 'policy' },
  { id: 'stability', least: 4, good: true, tab: 'orders' },
  { id: 'trust', least: 4, good: true, tab: 'orders' },
  { id: 'growth', least: 0.4, good: true, tab: 'economy' },
  { id: 'inflation', least: 0.4, good: false, tab: 'economy' },
  { id: 'jobless', least: 0.4, good: false, tab: 'economy' },
  { id: 'debt', least: 1, good: false, tab: 'economy' },
  { id: 'funds', least: 0, good: true, tab: 'orders' },
  { id: 'treasury', least: 0, good: true, tab: 'economy' },
];

export interface Change { id: ChangeId; from: number; to: number; better: boolean | null; tab: string }
export interface Item { id: string; tab: string; vars?: Record<string, number>; level: Reminder['level'] }
export interface Briefing { changed: Change[]; attention: Item[]; watch: Item[]; can: Item[] }

/** Money moves count when they are a fifth of what there was or more; everything else by its own size. */
function moved(id: ChangeId, from: number, to: number, least: number): boolean {
  if (id === 'funds') return Math.abs(to - from) >= Math.max(1, Math.abs(from)) * 0.2;
  if (id === 'treasury') return Math.abs(to - from) >= Math.max(1, Math.abs(from)) * 0.2;
  return Math.abs(to - from) >= least;
}

export function briefingOf(world: World, c: Campaign): Briefing | null {
  const k = c.career;
  if (!k || c.phase !== 'term' || k.ending) return null;
  const now = snapshot(c);
  const then = k.snaps && k.snaps.length ? k.snaps[0] : null;
  const changed: Change[] = [];
  if (then && then.week < k.week) {
    for (const spec of CHANGES) {
      const from = then[spec.id], to = now[spec.id];
      if (!moved(spec.id, from, to, spec.least)) continue;
      changed.push({ id: spec.id, from, to, better: spec.good === null ? null : (to > from) === spec.good, tab: spec.tab });
    }
    // The ones that moved most, in a share of their own range, first; no more than four.
    changed.sort((a, b) => Math.abs(b.to - b.from) / Math.max(1, Math.abs(b.from)) - Math.abs(a.to - a.from) / Math.max(1, Math.abs(a.from)));
    changed.length = Math.min(changed.length, 4);
  }
  const reminders = remindersOf(world, c);
  const attention: Item[] = [];
  if (c.inbox.length > 0) attention.push({ id: 'decision', tab: 'desk', level: 'urgent', vars: { n: c.inbox.length } });
  for (const r of reminders.filter((x) => x.level === 'urgent')) attention.push({ id: r.id, tab: r.tab, level: r.level, vars: r.vars });
  const watch: Item[] = reminders.filter((x) => x.level !== 'urgent').map((r) => ({ id: r.id, tab: r.tab, level: r.level, vars: r.vars }));
  const week = ((k.week - 1) % 52) + 1;
  if (isPm(c) && week > 8 && week <= 40 && !watch.some((w) => w.id === 'budget')) watch.push({ id: 'budgetNear', tab: 'economy', level: 'note', vars: { weeks: 40 - week } });
  const toVote = k.length - k.week;
  if (toVote <= 30 && toVote > 0) watch.push({ id: 'election', tab: 'policy', level: 'warn', vars: { weeks: toVote } });
  // Where a figure has been rising for three months, say so before it is a problem.
  const trend = k.trend ?? [];
  if (trend.length >= 4) {
    const last = trend.slice(-4);
    if (last[3].debt - last[0].debt >= 1 && last[3].debt > 70) watch.push({ id: 'debtRising', tab: 'economy', level: 'warn', vars: { debt: Math.round(last[3].debt) } });
    if (last[3].inflation - last[0].inflation >= 0.6 && last[3].inflation > 3) watch.push({ id: 'pricesRising', tab: 'economy', level: 'warn', vars: { pct: Math.round(last[3].inflation * 10) / 10 } });
  }
  // What the player could do about what has been said.
  const can: Item[] = [];
  const net = termIncome(world, c).total - termSpending(world, c).total;
  if (isPm(c) && k.economy.inflation >= 3.6) can.push({ id: 'canPrices', tab: 'acts', level: 'note' });
  if (isPm(c) && k.economy.debt >= 70 && !k.repayShare) can.push({ id: 'canDebt', tab: 'acts', level: 'note' });
  if (isPm(c) && treasuryCap(world, c) > 0 && treasuryOf(c) >= 0.9 * treasuryCap(world, c)) can.push({ id: 'canSpend', tab: 'economy', level: 'note' });
  if (net < 0) can.push({ id: 'canFunds', tab: 'orders', level: 'note' });
  if (c.parties[c.player]!.unity < 60) can.push({ id: 'canUnity', tab: 'party', level: 'note' });
  const seen = new Set<string>();
  const unique = (xs: Item[]) => xs.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
  return { changed, attention: unique(attention), watch: unique(watch).slice(0, 4), can: can.slice(0, 2) };
}

export const hasSnaps = (k: Career): boolean => (k.snaps?.length ?? 0) > 0;
