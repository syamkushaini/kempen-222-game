import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { DEBT_FLOOR, debtEased, repayDebt, repayLimit, treasuryOf } from './treasury';

const PS = PARTY_IDS.indexOf('ps');
const world = getWorld('career')!;

describe('paying the national debt from the treasury', () => {
  it('takes the amount out of the treasury and lowers the debt by its share of national income', () => {
    const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
    const k = c.career!;
    k.treasury = 10_000_000_000;
    const debt = k.economy.debt;
    const pay = 5_000_000_000;
    expect(repayLimit(world, c)).toBeGreaterThanOrEqual(pay);
    const eased = debtEased(world, c, pay);
    expect(repayDebt(world, c, pay)).toBe(true);
    expect(treasuryOf(c)).toBe(5_000_000_000);
    expect(k.economy.debt).toBeCloseTo(debt - eased, 6);
    expect(c.news.at(-1)?.key).toBe('news.debt.repaid');
  });

  it('will not pay more than the treasury holds, or take the debt below its floor, or when not heading the government', () => {
    const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
    const k = c.career!;
    k.treasury = 1_000_000_000;
    expect(repayDebt(world, c, 2_000_000_000)).toBe(false);
    expect(repayDebt(world, c, 0)).toBe(false);
    k.treasury = 1e15;
    k.economy.debt = DEBT_FLOOR;
    expect(repayLimit(world, c)).toBe(0);
    k.economy.debt = 60;
    k.government.pm = PS === 0 ? 1 : 0;
    expect(repayLimit(world, c)).toBe(0);
  });
});
