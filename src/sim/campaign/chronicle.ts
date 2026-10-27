import type { Campaign } from './types';

// A compact memory of what the player chose, so an early compromise can catch up with them
// later. Capped so a long career does not grow it without bound.

export interface ChronicleEntry {
  week: number;
  tag: string;
  note: string;
}

export const CHRONICLE_CAP = 24;

/** Notes a choice, keeping only the most recent ones. */
export function logChoice(c: Campaign, tag: string, note: string): void {
  const arr = (c.chronicle ??= []);
  arr.push({ week: c.week, tag, note });
  if (arr.length > CHRONICLE_CAP) arr.shift();
}

/** Whether a choice tagged like this was ever logged. */
export const chose = (c: Campaign, tag: string): boolean => (c.chronicle ?? []).some((e) => e.tag === tag);

/**
 * Fires a consequence of an earlier choice, once: if `tag` was logged and `firedTag` was not
 * yet, logs `firedTag` and runs `effect`. Returns whether it fired.
 */
export function chronicleConsequence(c: Campaign, tag: string, firedTag: string, note: string, effect: () => void): boolean {
  if (!chose(c, tag) || chose(c, firedTag)) return false;
  logChoice(c, firedTag, note);
  effect();
  return true;
}
