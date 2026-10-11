import type { World } from '../election';
import { SECTOR_IDS, sectorsOf } from './sectors';
import { hasPublicMoney, treasuryCap, treasuryOf } from './treasury';
import type { Campaign, TrendPoint } from './types';

// A month at a time the economy's figures are written down, so that the player can see which way they are going and not only where
// they are: growth, prices, jobs, the debt, how full the treasury is, and how each sector is doing.

/** Weeks between one point and the next, and how many are kept (five years of months, and a little over). */
export const TREND_EVERY = 4;
export const TREND_KEEP = 72;

/** Writes down this month's figures, on the fourth week of each. */
export function trendWeek(world: World, c: Campaign): void {
  const k = c.career;
  if (!k || c.phase !== 'term' || k.week % TREND_EVERY !== 0) return;
  const cap = treasuryCap(world, c);
  const sectors = sectorsOf(k);
  const point: TrendPoint = {
    week: k.week, term: k.term, growth: round(k.economy.growth), inflation: round(k.economy.inflation), jobless: round(k.economy.jobless), debt: round(k.economy.debt),
    treasury: hasPublicMoney(c) && cap > 0 ? Math.round((treasuryOf(c) / cap) * 100) : 0, sectors: SECTOR_IDS.map((id) => Math.round(sectors[id])),
  };
  const all = [...(k.trend ?? []), point];
  k.trend = all.slice(-TREND_KEEP);
}

const round = (n: number) => Math.round(n * 10) / 10;
