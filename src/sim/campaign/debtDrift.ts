import type { World } from '../election';
import { deficit, isPm } from './office';
import { debtEased, govBooks } from './treasury';
import type { Campaign } from './types';

/** The share of national income a government can run as a deficit before the debt starts to climb (see economyWeek in office.ts). */
export const DEFICIT_CARRIED = 3.5;

export interface DebtDrift {
  /** The budget's deficit as a share of national income. */
  deficit: number;
  /** What each cause moves the debt in a year, in points of national income: positive is more debt. */
  budget: number;
  growth: number;
  repay: number;
  net: number;
}

/**
 * Why the national debt moves, in a year at the present pace. The debt does not follow the treasury's money. The treasury is what the government
 * has to spend; the debt climbs when the budget's deficit is above what the economy can carry, falls when growth is strong, and falls by what
 * the debt plan sets aside. (A decision that costs debt at once, such as selling bonds, is on top of this, and is shown before it is taken.)
 */
export function debtDrift(world: World, c: Campaign): DebtDrift | null {
  const k = c.career;
  if (!k || c.phase !== 'term' || !isPm(c)) return null;
  const d = deficit(k);
  const budget = (d - DEFICIT_CARRIED) * 1.5;
  const growth = -(k.economy.growth - 4) * 0.01 * 52;
  const set = govBooks(world, c)?.spend.find((x) => x.id === 'repay')?.amount ?? 0;
  const repay = -debtEased(world, c, set) * 52;
  return { deficit: d, budget, growth, repay, net: budget + growth + repay };
}
