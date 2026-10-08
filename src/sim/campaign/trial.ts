import type { Campaign } from './types';
import { addScene } from './diplomacy';
import type { BackstoryId } from './teamTypes';

// A leader's past does not stay in the past. Each year of the career the courts may come for a leader whose record is
// not clean: more for those whose lives were lived close to the law, and more for a party that has bought members,
// taken foreign money or padded its rolls. A case is answered with a fight, a settlement or a resignation; and a case lost ends the career.

/** The yearly chance of a case from what the leader was, before anything the party has done. */
export const CASE_BASE: Record<BackstoryId, number> = { organiser: 0.01, technocrat: 0.005, firebrand: 0.03, tycoon: 0.05, fixer: 0.07, activist: 0.03 };
/** What the party's conduct adds: for each point of the trail of bought members, for foreign money taken, for a padded roll. The most the chance can be. */
export const CASE = { perTrail: 0.012, foreign: 0.04, padded: 0.02, max: 0.3 };

/** The chance this year that a case is brought against the leader. */
export function caseChance(c: Campaign): number {
  const k = c.career!;
  const base = CASE_BASE[c.team.leader.backstory ?? 'organiser'] ?? 0.01;
  return Math.min(CASE.max, base + CASE.perTrail * (k.trail ?? 0) + (k.foreign ? CASE.foreign : 0) + (k.padded ? CASE.padded : 0));
}

/** The chance a fight in court is won: a believed leader, with a record that holds up. */
export const fightOdds = (c: Campaign): number => Math.min(0.85, Math.max(0.15, 0.3 + c.career!.credibility / 200 - 0.02 * (c.career!.trail ?? 0)));

/** Once a year, from the second year of a term, the courts may come for the leader. At most one case in a parliament. */
export function trialWeek(c: Campaign): void {
  const k = c.career!;
  if (k.week < 52 || k.week % 52 !== 0 || c.phase !== 'term' || c.inbox.length > 0 || k.ending) return;
  const flag = `case${k.term}`;
  if (k.flags.includes(flag)) return;
  // A fixed roll from the week and the seed, so that a case is not a matter of when the player saves.
  const roll = (((c.seed ^ (k.week * 2654435761) ^ (k.term * 40503)) >>> 0) % 10_000) / 10_000;
  if (roll >= caseChance(c)) return;
  k.flags.push(flag);
  addScene(c, { kind: 'event', from: null, event: 'courtCase' });
}
