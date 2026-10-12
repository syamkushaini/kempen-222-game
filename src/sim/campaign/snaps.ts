import type { Campaign } from './types';

// A month at a time the main figures are written down, two deep, so that the briefing can say what has changed (see briefing.ts).

export interface Snap {
  week: number;
  unity: number; credibility: number; stability: number; trust: number;
  funds: number; growth: number; inflation: number; jobless: number; debt: number; treasury: number;
}

/** Weeks between snapshots; the briefing compares the present with the older of the two kept. */
export const SNAP_EVERY = 4;

export function snapshot(c: Campaign): Snap {
  const k = c.career!;
  const me = c.parties[c.player]!;
  return {
    week: k.week, unity: me.unity, credibility: k.credibility, stability: k.government.stability, trust: k.government.trust, funds: me.funds,
    growth: k.economy.growth, inflation: k.economy.inflation, jobless: k.economy.jobless, debt: k.economy.debt, treasury: k.treasury ?? 0,
  };
}

/** Keeps the last two snapshots, a month apart. Called each week of a term. */
export function briefWeek(c: Campaign): void {
  const k = c.career;
  if (!k || c.phase !== 'term') return;
  const snaps = k.snaps ?? [];
  if (snaps.length === 0 || k.week - snaps[snaps.length - 1].week >= SNAP_EVERY || k.week < snaps[snaps.length - 1].week) {
    k.snaps = [...snaps.filter((s) => s.week <= k.week).slice(-1), snapshot(c)];
  }
}
