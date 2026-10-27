import type { Rng } from '../rng';
import { chronicleConsequence } from './chronicle';
import type { Campaign } from './types';

// Every ten to fifteen years the constitution is tested. A state assembly is deadlocked, two men both say they are the chief minister, and
// the question goes to the Speaker, the courts and the ruler's Palace, in that order, with the nation watching. It is not the player's
// to decide: it is the player's to survive. Three events follow one another (see eventListCrisis.ts), a few weeks apart.

export const CRISIS = { min: 10, max: 15 };

const gap = (rng: Rng) => 52 * (CRISIS.min + Math.floor(rng.next() * (CRISIS.max - CRISIS.min + 1)));

/** Sets the clock for the first, and for each crisis after it, and raises the crisis when its week comes. */
export function crisisWeek(c: Campaign, rng: Rng): void {
  const k = c.career!;
  if (k.crisis === undefined) { k.crisis = k.week + gap(rng); return; }
  if (k.week < k.crisis) return;
  k.crisis = k.week + gap(rng);
  k.queue.push({ event: 'constCrisis', week: k.week });
  // An earlier floor-crossing is the sort of thing a constitutional crisis drags back into the light.
  chronicleConsequence(c, 'crossedFloor', 'crossedFloorCrisis', 'The crisis dredges up an old crossing', () => {
    k.credibility = Math.max(0, k.credibility - 5);
  });
}
