import { clamp } from '../math';
import { Rng } from '../rng';
import { statesHeld } from './contests';
import { shiftUnity } from './diplomacy';
import { pushNews } from './news';
import type { Campaign, Career } from './types';

// A state government is a purse: contracts to give out, land to alienate. A party may draw on the states it governs more
// or less freely. The more freely, the more it brings in, and the likelier it is that the anti-graft agency comes asking
// where it all went.

export const PATRONAGE = {
  /** What the states' income is multiplied by, at each level. */
  mult: [1, 2, 3.5],
  /** The weekly chance of an inquiry, for each state governed at each level, and the most it can be. */
  risk: 0.0015,
  max: 0.04,
  /** What an inquiry costs: a share of the funds, credibility, unity, and mood everywhere. */
  fine: 0.15,
  credibility: 8,
  unity: 4,
  mood: 0.02,
};

export const patronageOf = (k: Career): number => k.patronage ?? 0;
export const patronageMult = (k: Career): number => PATRONAGE.mult[patronageOf(k)] ?? 1;

/** The weekly chance that the agency looks into the states' contracts: nothing at the lowest level, or with no state to draw on. */
export const patronageChance = (c: Campaign): number => {
  const k = c.career;
  if (!k) return 0;
  return Math.min(PATRONAGE.max, statesHeld(c, c.player) * patronageOf(k) * PATRONAGE.risk);
};

/** Sets how freely the party draws on its states. Only in the years between elections, and only if it governs a state for anything above the lowest. */
export function setPatronage(c: Campaign, level: number): boolean {
  const k = c.career;
  if (!k || c.phase !== 'term' || !Number.isInteger(level) || level < 0 || level >= PATRONAGE.mult.length) return false;
  if (level > 0 && statesHeld(c, c.player) === 0) return false;
  if (level === 0) delete k.patronage; else k.patronage = level;
  return true;
}

/** A week of drawing on the states: the agency may come, and then the party is back to the lowest level, poorer and shamed. */
export function patronageWeek(c: Campaign, rng: Rng): void {
  const k = c.career!;
  if (!k.patronage) return;
  if (statesHeld(c, c.player) === 0) { delete k.patronage; return; }
  if (rng.next() >= patronageChance(c)) return;
  const pc = c.parties[c.player]!;
  const fine = Math.round(pc.funds * PATRONAGE.fine);
  pc.funds -= fine;
  k.credibility = clamp(k.credibility - PATRONAGE.credibility, 0, 100);
  shiftUnity(c, c.player, -PATRONAGE.unity);
  for (const row of k.mood) row[c.player] -= PATRONAGE.mood;
  delete k.patronage;
  pushNews(c, { party: c.player, key: 'news.patronage', vars: { rm: `@rm:${fine}` }, tone: 'bad' });
}
