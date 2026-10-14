import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { Rng } from '../rng';
import { DEFICIT_CARRIED, debtDrift } from './debtDrift';
import { startCareer } from './career';
import { economyWeek } from './office';
import { treasuryWeek } from './treasury';
import type { Campaign } from './types';

const world = getWorld('career')!;
const pm = (fiscal: number, repay: number): Campaign => {
  const c = startCareer(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5 });
  c.inbox = [];
  const k = c.career!;
  k.government.pm = c.player; k.government.partners = [];
  k.fiscal = fiscal; if (repay) k.repayShare = repay;
  k.economy.debt = 60; k.economy.growth = 6; k.treasury = 0;
  return c;
};
/** What a year of the game does to the debt, with growth held where it is. */
function simulate(c: Campaign): number {
  const k = c.career!, rng = new Rng(9), start = k.economy.debt;
  for (let i = 0; i < 52; i++) { k.economy.growth = 6; economyWeek(c, rng); treasuryWeek(world, c); }
  return k.economy.debt - start;
}

describe('why the debt moves', () => {
  it('says what a year at this pace does to the debt, and the game then does it', () => {
    for (const [fiscal, repay] of [[0, 0], [6, 0], [6, 0.3], [12, 0.5]] as const) {
      const c = pm(fiscal, repay);
      const d = debtDrift(world, c)!;
      expect(d.net).toBeCloseTo(d.budget + d.growth + d.repay, 9);
      expect(simulate(c)).toBeCloseTo(d.net, 0);
    }
  });

  it('shows more promises raising the deficit and the debt, even while the treasury has plenty', () => {
    const plain = debtDrift(world, pm(0, 0))!, loaded = debtDrift(world, pm(8, 0))!;
    expect(loaded.deficit).toBeGreaterThan(plain.deficit);
    expect(loaded.net).toBeGreaterThan(plain.net);
    expect(plain.deficit).toBeLessThan(DEFICIT_CARRIED + 1);
    expect(debtDrift(world, pm(6, 0.3))!.repay).toBeLessThan(0);
  });

  it('is only for the head of government', () => {
    const c = pm(0, 0);
    c.career!.government.pm = (c.player + 1) % PARTY_IDS.length;
    expect(debtDrift(world, c)).toBeNull();
  });
});
