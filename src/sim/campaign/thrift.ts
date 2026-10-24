// Thrift: a campaign that won on less money did better than one that won by spending all it had. What counts is the share of the money
// a party had that it spent, not the sum, so that a poor party and a rich one are measured alike: a party that spent a tenth of what it
// had is thrifty whatever the figure. The money a party "had" is what it spent plus what it still holds when the votes are counted.
//
//   use      the share of its money the party spent, 0 to 1
//   factor   what the score is multiplied by: 1.10 for a party that spent nothing, down to 0.80 for one that spent everything

export const THRIFT = { best: 1.1, worst: 0.8 };

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** The share of its money a party spent in a campaign: its campaign spending over that and what it holds. 0 when it had nothing at all. */
export function useOf(spent: number, funds: number): number {
  const had = Math.max(0, spent) + Math.max(0, funds);
  return had > 0 ? clamp01(Math.max(0, spent) / had) : 0;
}

/** What the score of a campaign is multiplied by, given the share of its money the party spent. */
export const thriftFactor = (use: number): number => THRIFT.best - (THRIFT.best - THRIFT.worst) * clamp01(use);

/** The average share across the elections of a career, or null when none was recorded (a career saved before this was kept). */
export function careerUse(terms: readonly { use?: number }[] | undefined): number | null {
  const seen = (terms ?? []).map((t) => t.use).filter((u): u is number => typeof u === 'number' && Number.isFinite(u));
  return seen.length > 0 ? seen.reduce((a, b) => a + b, 0) / seen.length : null;
}
