import type { Career } from './types';
import { ECONOMY_PULL, economyTargets } from './office';
import { TOOLS } from './econTools';
import { SECTOR } from './sectors';

// What a leader should know about steering an economy, worked out from the numbers the economy runs on, so that what the game says
// of how hard it is cannot drift from how hard it is.

/** Weeks for the economy to close this share of the gap to where it is heading, at the pace it closes it. */
export const weeksToClose = (share: number): number => Math.round(Math.log(1 - share) / Math.log(1 - ECONOMY_PULL));

export interface SteeringFacts {
  /** The share of the gap closed each week, in per cent; and the weeks to get halfway and most of the way (nine tenths). */
  pull: number; half: number; most: number;
  /** Years in ten that a sector is hit by a shock, the size it can be (points out of 100), and the weeks it takes to fade by half. */
  shockYears: number; shockMin: number; shockMax: number; fade: number;
  /** The most growth one of the growth levers adds, and the weeks before it can be used again. */
  best: number; wait: number;
}

export function steeringFacts(): SteeringFacts {
  const growthOf = (effects: (typeof TOOLS)[number]['effects']) => effects.reduce((a, e) => (e.t === 'economy' ? a + (e.growth ?? 0) : a), 0);
  const growthTools = TOOLS.filter((t) => t.goal === 'growth');
  const strongest = growthTools.reduce((a, b) => (growthOf(b.effects) > growthOf(a.effects) ? b : a));
  return {
    pull: Math.round(ECONOMY_PULL * 100), half: weeksToClose(0.5), most: weeksToClose(0.9),
    shockYears: Math.round((1 - (1 - SECTOR.shock) ** 52) * 10), shockMin: SECTOR.shockMin, shockMax: SECTOR.shockMax,
    fade: Math.round(Math.log(0.5) / Math.log(1 - SECTOR.pull)),
    best: growthOf(strongest.effects), wait: strongest.wait,
  };
}

/** Where growth stands and where the budget and the rate are taking it. */
export const headingFor = (k: Career): { now: number; to: number } => ({ now: k.economy.growth, to: economyTargets(k).growth });
