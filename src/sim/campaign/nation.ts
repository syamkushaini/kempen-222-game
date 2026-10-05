import { clamp } from '../math';
import type { Rng } from '../rng';
import type { BlocId } from '../types';
import { inGov, isPm, lift } from './office';
import type { Campaign, Career, Nation } from './types';

// The state of the country beyond the budget's headline figures: how well it is
// looked after, and how it stands among other nations. Three numbers from 0 to
// 100 that move slowly with what the government spends, who runs the ministries
// and how it carries itself, and jump when something happens. Policy, not
// detail: nobody counts hospital beds here.

export const START_NATION: Nation = { health: 55, education: 55, standing: 55 };
/** Below this a thing is in trouble; above the second it is doing well. */
export const WEAK = 40, STRONG = 70;

/** A career's figures, set to their starting values in a game saved before they existed. */
export const nationOf = (k: Career): Nation => (k.nation ??= { ...START_NATION });

/** Moves the figures by the amounts given, keeping each between 0 and 100. */
export function shiftNation(k: Career, patch: Partial<Nation>): void {
  const n = nationOf(k);
  for (const key of ['health', 'education', 'standing'] as const) if (patch[key]) n[key] = clamp(n[key] + patch[key]!, 0, 100);
}

const portfolioSkill = (k: Career, portfolio: 'health' | 'education') => k.cabinet.find((m) => m.portfolio === portfolio)?.skill ?? 3;

/** Where each figure is heading, given the budget in force, the ministers, and the state of the books and the government. */
export function nationTargets(k: Career): Nation {
  const lines = k.tabled.lines;
  const e = k.economy;
  const g = k.government;
  // Cutting spending shows in the wards and the classrooms within a few years; a clever minister makes it go further.
  const squeeze = Math.max(0, e.debt - 80) * 0.15;
  return {
    health: clamp(55 + 14 * lines.health + 2 * (portfolioSkill(k, 'health') - 3) - squeeze, 15, 90),
    education: clamp(55 + 14 * lines.education + 2 * (portfolioSkill(k, 'education') - 3) - squeeze, 15, 90),
    // Others look at a government that is steady, believed, solvent and growing.
    standing: clamp(55 + 0.25 * (g.stability - 50) + 0.2 * (k.credibility - 60) - 0.3 * Math.max(0, e.debt - 70) + 0.5 * (e.growth - 4), 15, 90),
  };
}

/** Which groups of voters notice each figure. */
const NOTICE: Record<keyof Nation, BlocId[]> = {
  health: ['seniors', 'urban_b40', 'heartland', 'felda', 'agri', 'borneo_native'],
  education: ['undi18', 'civil', 'm40', 'urban_lib', 'gig'],
  standing: ['smallbiz', 'm40', 'civil', 'urban_lib', 'borneo_urban'],
};
/** The week's change in how voters think of those in office, per point the figure is above or below 55. */
const FEEL = 0.000012;

/** One week: each figure drifts towards its target, and those in office answer for how the country is doing. */
export function nationWeek(c: Campaign, rng: Rng): void {
  const k = c.career!;
  const n = nationOf(k);
  const target = nationTargets(k);
  for (const key of ['health', 'education', 'standing'] as const) {
    n[key] = clamp(n[key] + (target[key] - n[key]) * 0.015 + rng.normal(0, 0.05), 0, 100);
    const feel = (n[key] - START_NATION[key]) * FEEL;
    lift(k, k.government.pm, NOTICE[key], feel);
    for (const p of k.government.partners) lift(k, p, NOTICE[key], feel / 2);
  }
}

/** Whether the player has the country to answer for: leading the government, or sitting in it. */
export const answersFor = (c: Campaign) => isPm(c) || inGov(c, c.player);
