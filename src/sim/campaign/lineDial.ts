// A line of the budget is set in steps of a fifth of its size, from taking all of it away (abolishing, -5) to doubling it (+5); the middle is
// holding it. The tax has only the three settings it always had (see `Dial`). Taking the subsidies away altogether has a price of its own.

export const LINE_MIN = -5;
export const LINE_MAX = 5;
/** The size of one step, as a share of the line. */
export const LINE_STEP = 0.2;
/** A whole number of steps from LINE_MIN to LINE_MAX. */
export type LineDial = number;
/** Taking all of a line away. */
export const ABOLISH = LINE_MIN;
/** Points added to the prices the economy is heading for while subsidies are abolished: what the shelves cost without them. */
export const ABOLISH_PRICES = 1;

export const isLineDial = (x: unknown): x is LineDial => typeof x === 'number' && Number.isInteger(x) && x >= LINE_MIN && x <= LINE_MAX;
/** How much of its middle size a line is at a setting, with a step of this size: none at all when it is abolished. */
export const lineMult = (d: number, step: number = LINE_STEP): number => Math.max(0, 1 + step * d);
/** Whether a budget has abolished subsidies. */
export const aidAbolished = (b: { lines: { aid?: number } }): boolean => b.lines.aid === ABOLISH;

// The other settings a government makes in steps have their own scales: the tax in the budget in tenths of what it takes (from half as
// much to half as much again), each tax of the plan in its own steps, and the policy rate, which a state's government sets, in notches.
export const BUDGET_TAX_MIN = -5;
export const BUDGET_TAX_MAX = 5;
export const PLAN_TAX_MIN = -5;
export const PLAN_TAX_MAX = 5;
export const RATE_MIN = -3;
export const RATE_MAX = 3;
/** A whole number of steps within a scale. */
export const isStep = (x: unknown, min: number, max: number): x is number => typeof x === 'number' && Number.isInteger(x) && x >= min && x <= max;
