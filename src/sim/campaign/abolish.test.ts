import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { publicFinance } from './gdp';
import { ABOLISH, aidAbolished, lineDial, lineMult } from './lineDial';
import { deficit, economyWeek, looseness, setBudget, tableBudget } from './office';
import { lineWeekly } from './treasury';
import { LINE_IDS, type Campaign } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const world = getWorld('career')!;
const career = (seed = 5): Campaign => {
  const c = startCareer(world, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  return c;
};

describe('abolishing subsidies', () => {
  it('takes the whole of the line away, in the money and in the steps the model counts in', () => {
    expect(lineMult(ABOLISH, 0.2)).toBe(0);
    expect(lineMult(-1, 0.2)).toBeCloseTo(0.8);
    expect(lineDial(ABOLISH)).toBe(-5);
    expect(lineWeekly(world, 'aid', ABOLISH)).toBe(0);
    expect(lineWeekly(world, 'aid', -1)).toBeGreaterThan(0);
    // Five cuts of a fifth are all of it, which is what abolishing is.
    expect(lineWeekly(world, 'aid', 0) * (1 + 0.2 * lineDial(ABOLISH))).toBeCloseTo(0);
  });

  it('can be chosen for the subsidies only, and only by the head of government', () => {
    const c = career();
    expect(c.career!.government.pm).toBe(PS);
    expect(setBudget(c, { line: 'aid', value: ABOLISH })).toBe(true);
    expect(c.career!.budget.lines.aid).toBe(ABOLISH);
    for (const id of LINE_IDS.filter((x) => x !== 'aid')) expect(setBudget(c, { line: id, value: ABOLISH }), id).toBe(false);
    expect(setBudget(c, { tax: true, value: ABOLISH })).toBe(false);
    expect(setBudget(c, { line: 'aid', value: -1 })).toBe(true);
    expect(c.career!.budget.lines.aid).toBe(-1);
  });

  it('tightens the budget by five steps, and saves what the subsidies cost', () => {
    const c = career();
    const k = c.career!;
    const held = looseness(k, { ...k.budget, lines: { ...k.budget.lines, aid: 0 } });
    const gone = looseness(k, { ...k.budget, lines: { ...k.budget.lines, aid: ABOLISH } });
    expect(gone).toBe(held - 5);
    expect(deficit(k, { ...k.budget, lines: { ...k.budget.lines, aid: ABOLISH } })).toBeLessThan(deficit(k, { ...k.budget, lines: { ...k.budget.lines, aid: 0 } }));
    k.tabled.lines.aid = ABOLISH;
    expect(publicFinance(world, k).lines.aid).toBe(0);
  });

  it('costs the government its steadiness, the poor’s goodwill and the shelves’ prices, more than a cut does', () => {
    const run = (dial: -2 | -1 | 0) => {
      const c = career();
      const k = c.career!;
      const before = { stability: k.government.stability, mood: k.mood.map((row) => [...row]) };
      const plan = { ...k.budget, lines: { ...k.budget.lines, aid: dial } };
      tableBudget(c, plan);
      const rng = new Rng(3);
      for (let w = 0; w < 104; w++) economyWeek(c, rng);
      const moodShift = k.mood.reduce((a, row, b) => a + (row[PS] - before.mood[b][PS]), 0);
      return { stability: k.government.stability - before.stability, moodShift, inflation: k.economy.inflation, news: c.news.some((n) => n.key === 'news.gov.subsidy.abolished'), abolished: aidAbolished(k.tabled) };
    };
    const hold = run(0), cut = run(-1), gone = run(ABOLISH);
    expect(gone.abolished).toBe(true);
    expect(gone.news).toBe(true);
    expect(cut.news).toBe(false);
    expect(gone.stability).toBeLessThan(cut.stability);
    expect(gone.moodShift).toBeLessThan(cut.moodShift);
    expect(cut.moodShift).toBeLessThan(hold.moodShift + 1e-9);
    // Prices run higher with the subsidies gone than with them cut, and than with them held.
    expect(gone.inflation).toBeGreaterThan(cut.inflation);
    expect(gone.inflation).toBeGreaterThan(hold.inflation);
  });

  it('is kept in a saved game, and a game that has it anywhere else is not valid', () => {
    const c = career();
    c.career!.budget.lines.aid = ABOLISH;
    c.career!.tabled.lines.aid = ABOLISH;
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    const bad = JSON.parse(JSON.stringify(c));
    bad.career.budget.lines.health = -2;
    expect(isValidCampaign(bad, world)).toBe(false);
  });
});
