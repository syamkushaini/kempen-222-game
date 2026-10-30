import type { World } from '../election';
import { summarise } from './night';
import { electionResult } from './turn';
import type { Campaign, Difficulty } from './types';

/**
 * Heat is a ladder of harder ways to play one contest, taken a rung at a time: clear a rung (win the contest on it) and the next
 * opens. Each rung keeps what the one below it asked and adds one thing: hidden odds, then polls that mislead, then the hard level,
 * then a lean purse. It sets no rule of its own: it only turns on the rules that already exist (see Challenge in types.ts).
 */
export const HEAT_MAX = 4;

export interface HeatRules { difficulty: Difficulty | null; fog: boolean; noisy: boolean; lean: boolean }

/** What a rung asks. A difficulty of null leaves the level to the player. Heat 0 asks nothing. */
export const heatRules = (heat: number): HeatRules => ({ difficulty: heat >= 3 ? 'hard' : null, fog: heat >= 1, noisy: heat >= 2, lean: heat >= 4 });

/** The highest rung a player may start on, given the highest they have cleared (none yet: the first). */
export const heatOpen = (cleared: number | undefined): number => Math.min(HEAT_MAX, (cleared ?? 0) + 1);

/** The rung this contest has cleared, once its votes are counted and the player has won it; null if it was played at no heat, or not (yet) won. */
export function clearedHeat(world: World, c: Campaign): number | null {
  const heat = c.challenge?.heat;
  if (!heat || (c.phase !== 'formation' && c.phase !== 'done') || !c.election) return null;
  const result = electionResult(world, c);
  if (!result) return null;
  const verdict = summarise(world, c, result).verdict;
  return verdict === 'majority' || verdict === 'largest' || verdict === 'won' ? heat : null;
}
