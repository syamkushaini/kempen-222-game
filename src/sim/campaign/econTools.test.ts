import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { TOOLS, canUseTool, setRate, toolCost, toolOf, useTool } from './econTools';
import { economyWeek } from './office';
import { govBooks, treasuryOf } from './treasury';
import type { Campaign } from './types';

const [PS, BP] = PARTY_IDS.map((_, i) => i);
const world = getWorld('career')!;
const career = (player = PS): Campaign => { const c = startCareer(world, { player, difficulty: 'normal', seed: 5 }); c.inbox = []; c.career!.appointments = []; return c; };

describe('the economic tools', () => {
  it('have an act for each of the debt, prices, growth and the books', () => {
    for (const goal of ['debt', 'prices', 'growth', 'books']) expect(TOOLS.filter((t) => t.goal === goal).length).toBeGreaterThanOrEqual(2);
    expect(TOOLS.length).toBeGreaterThanOrEqual(12);
  });

  it('lower the debt, bring prices down or lift growth as they say, and then must rest', () => {
    const c = career();
    const k = c.career!;
    const debt = k.economy.debt;
    expect(useTool(world, c, 'sellAssets')).toBe(true);
    expect(k.economy.debt).toBeLessThan(debt);
    const again = canUseTool(world, c, 'sellAssets');
    expect(again.ok).toBe(false);
    if (!again.ok) { expect(again.reason).toBe('wait'); expect(again.weeks).toBe(toolOf('sellAssets')!.wait); }
    expect(useTool(world, c, 'sellAssets')).toBe(false);
    k.week += toolOf('sellAssets')!.wait;
    expect(canUseTool(world, c, 'sellAssets').ok).toBe(true);
    const p = k.economy.inflation;
    k.treasury = 5e10;
    useTool(world, c, 'priceControls');
    expect(k.economy.inflation).toBeLessThan(p);
    const g = k.economy.growth;
    useTool(world, c, 'infrastructure');
    expect(k.economy.growth).toBeGreaterThan(g);
  });

  it('are paid for from the treasury, and refused when it cannot pay', () => {
    const c = career();
    c.career!.treasury = 0;
    const check = canUseTool(world, c, 'infrastructure');
    expect(check.ok).toBe(false);
    expect(toolCost(world, c, 'infrastructure')).toBeGreaterThan(0);
    c.career!.treasury = toolCost(world, c, 'infrastructure');
    expect(canUseTool(world, c, 'infrastructure').ok).toBe(true);
    const before = treasuryOf(c);
    useTool(world, c, 'infrastructure');
    expect(treasuryOf(c)).toBeLessThan(before);
    // Raising money goes the other way.
    const levy = career(); const t0 = treasuryOf(levy); useTool(world, levy, 'levy');
    expect(treasuryOf(levy)).toBeGreaterThan(t0);
  });

  it('are for the head of government alone', () => {
    const c = career(BP);
    const check = canUseTool(world, c, 'sellAssets');
    expect(check.ok).toBe(false);
    expect(setRate(c, 1)).toBe(false);
  });

  it('leave the policy rate to the central bank, whoever governs', () => {
    const c = career();
    expect(setRate(c, 1)).toBe(false);
    expect(c.career!.rate).toBeUndefined();
  });

  it('give a policy rate that trades prices against growth and the cost of the debt', () => {
    const settle = (rate: -1 | 0 | 1) => {
      const c = career();
      // The policy rate is the central bank's in the federation: the economy answers to it all the same.
      if (rate === 0) delete c.career!.rate; else c.career!.rate = rate;
      for (let w = 0; w < 400; w++) economyWeek(c, new Rng(3 + w));
      return { e: c.career!.economy, interest: govBooks(world, c)!.spend.find((x) => x.id === 'interest')!.amount };
    };
    const cut = settle(-1), hold = settle(0), raised = settle(1);
    expect(raised.e.inflation).toBeLessThan(hold.e.inflation);
    expect(cut.e.inflation).toBeGreaterThan(hold.e.inflation);
    expect(raised.e.growth).toBeLessThan(hold.e.growth);
    expect(cut.e.growth).toBeGreaterThan(hold.e.growth);
    expect(raised.interest).toBeGreaterThan(cut.interest);
  });
});

describe('the acts for a treasury with nothing left to build', () => {
  it('a rebate spends a full treasury to please every bloc, at the price of prices and trust', () => {
    const c = career();
    const k = c.career!;
    k.treasury = 5e10;
    const before = treasuryOf(c);
    const inflation = k.economy.inflation;
    const trust = k.government.trust;
    expect(toolCost(world, c, 'rebate')).toBeGreaterThan(toolCost(world, c, 'infrastructure'));
    expect(useTool(world, c, 'rebate')).toBe(true);
    expect(treasuryOf(c)).toBeLessThan(before);
    expect(k.economy.inflation).toBeGreaterThan(inflation);
    expect(k.government.trust).toBeLessThan(trust);
    expect(canUseTool(world, c, 'rebate').ok).toBe(false);
  });

  it('a wealth fund costs money and takes a little off the debt and the standing bill', () => {
    const c = career();
    const k = c.career!;
    k.treasury = 5e10;
    const before = treasuryOf(c);
    const debt = k.economy.debt;
    k.fiscal = 3;
    expect(useTool(world, c, 'wealthFund')).toBe(true);
    expect(treasuryOf(c)).toBeLessThan(before);
    expect(k.economy.debt).toBeLessThan(debt);
    expect(k.fiscal).toBeLessThan(3);
  });

  it('are refused when the treasury cannot pay', () => {
    const c = career();
    c.career!.treasury = 0;
    expect(canUseTool(world, c, 'rebate')).toMatchObject({ ok: false, reason: 'money' });
    expect(canUseTool(world, c, 'wealthFund')).toMatchObject({ ok: false, reason: 'money' });
  });
});
