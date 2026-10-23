import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { signed } from '../../ui/StopSlider';
import { PARTY_IDS } from '../types';
import { DONOR_CRED_COST, STATE_TRUST_COST, donorsAt, startCareer, termIncome } from './career';
import { MONTH, divertedAt, diverted, grantGoodwillAt, grantsCost, grantsCostAt, lineWeekly, takingsWeekly } from './treasury';
import { LINE_IDS } from './types';

const PS = PARTY_IDS.indexOf('ps');
const world = getWorld('career')!;
const career = (seed = 5) => startCareer(world, { player: PS, difficulty: 'normal', seed });

describe('the figures a slider shows at each of its stops', () => {
  it('are the ones the game goes on to use, at the level that is set', () => {
    const c = career();
    const k = c.career!;
    for (const level of [0, 1, 2, 3] as const) {
      k.orders.donors = level;
      expect(donorsAt(world, c, level)).toBe(termIncome(world, c).donors);
      k.orders.state = level;
      expect(divertedAt(world, c, level)).toBe(diverted(world, c));
      k.orders.grants = level;
      expect(grantsCostAt(world, c, level)).toBe(grantsCost(world, c));
    }
  });

  it('rise with the level, from nothing, and carry a price for the higher ones', () => {
    const c = career();
    expect(donorsAt(world, c, 0)).toBe(0);
    expect(donorsAt(world, c, 3)).toBe(3 * donorsAt(world, c, 1));
    expect(grantsCostAt(world, c, 0)).toBe(0);
    expect(grantGoodwillAt(world, c, 2)).toBeGreaterThan(grantGoodwillAt(world, c, 1));
    expect(DONOR_CRED_COST).toBeGreaterThan(0);
    expect(STATE_TRUST_COST).toBeGreaterThan(0);
  });

  it('put a cut below holding and a boost above it in every line of the budget, and the same for taxes taken', () => {
    const c = career();
    for (const id of LINE_IDS) {
      expect(lineWeekly(world, id, -1) * MONTH).toBeLessThan(lineWeekly(world, id, 0) * MONTH);
      expect(lineWeekly(world, id, 1)).toBeGreaterThan(lineWeekly(world, id, 0));
    }
    expect(takingsWeekly(world, c, -1)).toBeLessThan(takingsWeekly(world, c, 0));
    expect(takingsWeekly(world, c, 1)).toBeGreaterThan(takingsWeekly(world, c, 0));
  });

  it('are written with their sign', () => {
    expect(signed(0.3)).toBe('+0.3');
    expect(signed(-0.6)).toBe('−0.6');
    expect(signed(0)).toBe('0.0');
    expect(signed(-0.04)).toBe('0.0');
    expect(signed(-20, 0)).toBe('−20');
    expect(signed(0.123, 2)).toBe('+0.12');
  });
});
