import type { Dial } from './types';

// A line of the budget is set to cut (-1), hold (0) or boost (1), a fifth of its size either way. The line for aid and subsidies can also be
// abolished: all of it taken away, which is five of those steps in one, and has a price of its own in prices and in the poor's goodwill.

export const ABOLISH = -2 as const;
export type LineDial = Dial | typeof ABOLISH;
/** What abolishing stands for in the steps the model counts in (a line's whole size is five fifths). */
export const ABOLISH_NOTCHES = -5;
/** Points added to the prices the economy is heading for while subsidies are abolished: what the shelves cost without them. */
export const ABOLISH_PRICES = 1;

/** The steps a setting stands for. */
export const lineDial = (d: number): number => (d === ABOLISH ? ABOLISH_NOTCHES : d);
/** How much of its middle size a line is at a setting, with a step of this size: none at all when it is abolished. */
export const lineMult = (d: number, step: number): number => (d === ABOLISH ? 0 : 1 + step * d);
/** Whether a budget has abolished subsidies. */
export const aidAbolished = (b: { lines: { aid?: number } }): boolean => b.lines.aid === ABOLISH;
