import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { applyEffects } from './events';
import { Rng } from '../rng';
import { DEBT_FLOOR, economyWeek } from './office';
import { repayDebt, repayLimit, treasuryOf } from './treasury';

const world = getWorld('career')!;
const game = () => {
  const c = startCareer(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5 });
  c.career!.government.pm = c.player; c.career!.government.partners = [];
  return c;
};

describe('the national debt can be paid off, as it can in life', () => {
  it('has no floor above nothing', () => {
    expect(DEBT_FLOOR).toBe(0);
  });

  it('can be repaid below the old floor of 30% of national income, and all the way down', () => {
    const c = game(), k = c.career!;
    k.economy.debt = 40;
    k.treasury = 1e12;
    const room = repayLimit(world, c);
    expect(room).toBeGreaterThan(0);
    expect(repayDebt(world, c, room)).toBe(true);
    expect(k.economy.debt).toBeLessThan(30 + 1e-9);
    expect(k.economy.debt).toBeGreaterThanOrEqual(0);
    // Pay everything left: the debt is gone, and there is nothing more to pay.
    k.treasury = 1e12;
    repayDebt(world, c, repayLimit(world, c));
    expect(k.economy.debt).toBeCloseTo(0, 0);
    expect(repayLimit(world, c)).toBe(0);
    expect(treasuryOf(c)).toBeGreaterThan(0);
  });

  it('is not held up at 30 by the economy or by a decision', () => {
    const c = game(), k = c.career!;
    k.economy.debt = 20;
    applyEffects(world, c, [{ t: 'debt', n: -5 }]);
    expect(k.economy.debt).toBe(15);
    k.economy.growth = 7;
    for (let i = 0; i < 20; i++) economyWeek(c, new Rng(i + 1));
    expect(k.economy.debt).toBeLessThan(15);
    applyEffects(world, c, [{ t: 'debt', n: -50 }]);
    expect(k.economy.debt).toBe(0);
  });
});
