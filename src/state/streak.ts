/**
 * A run of days played. It is kept gently: one missed day in a row is forgiven, so a busy Tuesday does not undo a month,
 * and a longer break only starts a new run (the best is kept). Nothing here ever takes anything away from the player.
 */
export interface Streak {
  /** The local day last played, as YYYY-MM-DD. */
  last: string;
  /** Days in the current run. */
  days: number;
  best: number;
}

const DAY_MS = 86_400_000;
/** A gap of this many days or fewer between two plays keeps the run going (one missed day is forgiven). */
export const FORGIVEN_GAP = 2;

/** The local calendar day of a time, as YYYY-MM-DD. */
export function dayKey(now: number): string {
  const d = new Date(now);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const dayNumber = (key: string): number => { const [y, m, d] = key.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / DAY_MS); };

/** The streak after playing at `now`. The same object if today is already counted. */
export function notePlay(streak: Streak | undefined, now: number): Streak {
  const today = dayKey(now);
  if (!streak) return { last: today, days: 1, best: 1 };
  const gap = dayNumber(today) - dayNumber(streak.last);
  if (gap <= 0) return streak;
  const days = gap <= FORGIVEN_GAP ? streak.days + 1 : 1;
  return { last: today, days, best: Math.max(streak.best, days) };
}

/** The run to show: a run that has lapsed past the forgiven gap reads as none, though it is only replaced by the next play. */
export function liveDays(streak: Streak | undefined, now: number): number {
  if (!streak) return 0;
  return dayNumber(dayKey(now)) - dayNumber(streak.last) <= FORGIVEN_GAP ? streak.days : 0;
}

export function parseStreak(x: unknown): Streak | undefined {
  if (typeof x !== 'object' || x === null) return undefined;
  const s = x as Record<string, unknown>;
  const ok = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 100_000;
  if (typeof s.last !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s.last) || !ok(s.days) || !ok(s.best)) return undefined;
  return { last: s.last, days: s.days, best: Math.max(s.best, s.days) };
}
