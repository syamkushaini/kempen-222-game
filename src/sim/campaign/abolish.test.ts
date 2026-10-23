import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { lineReadout } from '../../ui/LineSlider';
import { BLOC_IDS } from '../types';
import { TAX_IDS } from './econPlansData';
import { setRate } from './econTools';
import { setTax } from './econPlans';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { publicFinance } from './gdp';
import { ABOLISH, LINE_MAX, LINE_MIN, aidAbolished, isLineDial, lineMult } from './lineDial';
import { deficit, economyWeek, looseness, setBudget, tableBudget } from './office';
import { pestelTargets } from './pestel';
import { lineWeekly, takingsWeekly } from './treasury';
import { LINE_IDS, type Campaign } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const world = getWorld('career')!;
const career = (seed = 5): Campaign => {
  const c = startCareer(world, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  return c;
};

describe('a line of the budget, in fifths from nothing to double', () => {
  it('is its middle size at hold, none of it when abolished, and twice it at the top', () => {
    expect([LINE_MIN, LINE_MAX, ABOLISH]).toEqual([-5, 5, -5]);
    expect(lineMult(ABOLISH)).toBe(0);
    expect(lineMult(-1)).toBeCloseTo(0.8);
    expect(lineMult(0)).toBe(1);
    expect(lineMult(LINE_MAX)).toBeCloseTo(2);
    for (const id of LINE_IDS) {
      const hold = lineWeekly(world, id, 0);
      expect(lineWeekly(world, id, ABOLISH)).toBe(0);
      expect(lineWeekly(world, id, 5)).toBeCloseTo(2 * hold);
      expect(lineWeekly(world, id, -2)).toBeCloseTo(0.6 * hold);
    }
  });

  it('can be set to any whole number of steps, for any line, by the head of government', () => {
    const c = career();
    for (const id of LINE_IDS.filter((x) => x !== 'defence')) {
      for (const v of [-5, -3, 0, 2, 5]) { expect(setBudget(c, { line: id, value: v }), `${id} ${v}`).toBe(true); expect(c.career!.budget.lines[id]).toBe(v); }
      for (const v of [-6, 6, 0.5, 100]) expect(setBudget(c, { line: id, value: v }), `${id} ${v}`).toBe(false);
    }
    expect(isLineDial(3)).toBe(true);
    expect(isLineDial(3.5)).toBe(false);
  });
  it('moves the budget’s looseness one step a step, and the deficit with it', () => {
    const c = career();
    const k = c.career!;
    const at = (aid: number) => ({ ...k.budget, lines: { ...k.budget.lines, aid } });
    expect(looseness(k, at(-5))).toBe(looseness(k, at(0)) - 5);
    expect(looseness(k, at(3))).toBe(looseness(k, at(0)) + 3);
    expect(deficit(k, at(-5))).toBeLessThan(deficit(k, at(-1)));
    expect(deficit(k, at(-1))).toBeLessThan(deficit(k, at(3)));
    k.tabled.lines.aid = ABOLISH;
    expect(publicFinance(world, k).lines.aid).toBe(0);
    k.tabled.lines.aid = 5;
    expect(publicFinance(world, k).lines.aid).toBeGreaterThan(0);
  });

  it('hurts what a line pays for when it is taken away, and helps when it is doubled', () => {
    const c = career();
    const k = c.career!;
    const tech = (education: number) => { k.tabled.lines.education = education; return pestelTargets(k).tech; };
    expect(tech(-5)).toBeLessThan(tech(-1));
    expect(tech(-1)).toBeLessThan(tech(0));
    expect(tech(0)).toBeLessThan(tech(3));
  });
});

describe('abolishing subsidies', () => {
  it('costs the government its steadiness, the poor’s goodwill and the shelves’ prices, more than a cut does', () => {
    const run = (dial: number) => {
      const c = career();
      const k = c.career!;
      const before = { stability: k.government.stability, mood: k.mood.map((row) => [...row]) };
      tableBudget(c, { ...k.budget, lines: { ...k.budget.lines, aid: dial } });
      const rng = new Rng(3);
      for (let w = 0; w < 104; w++) economyWeek(c, rng);
      const moodShift = k.mood.reduce((a, row, b) => a + (row[PS] - before.mood[b][PS]), 0);
      return { stability: k.government.stability - before.stability, moodShift, inflation: k.economy.inflation, news: c.news.some((n) => n.key === 'news.gov.subsidy.abolished'), abolished: aidAbolished(k.tabled) };
    };
    const hold = run(0), cut = run(-1), deep = run(-4), gone = run(ABOLISH);
    expect(gone.abolished).toBe(true);
    expect(gone.news).toBe(true);
    expect(cut.news || deep.news).toBe(false);
    // The deeper the cut the more it costs, and taking all of it away is a step further than any cut.
    expect(gone.moodShift).toBeLessThan(deep.moodShift);
    expect(deep.moodShift).toBeLessThan(cut.moodShift);
    expect(cut.moodShift).toBeLessThan(hold.moodShift + 1e-9);
    expect(gone.stability).toBeLessThan(deep.stability);
    expect(gone.inflation).toBeGreaterThan(cut.inflation);
    expect(gone.inflation).toBeGreaterThan(hold.inflation);
  });
});

describe('a saved budget', () => {
  it('may hold any whole number of steps in any line, and nothing else', () => {
    const c = career();
    c.career!.budget.lines.aid = ABOLISH;
    c.career!.tabled.lines.health = 5;
    c.career!.budget.lines.education = -3;
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    for (const bad of [6, -6, 0.5, 'x']) {
      const g = JSON.parse(JSON.stringify(c));
      g.career.budget.lines.health = bad;
      expect(isValidCampaign(g, world), String(bad)).toBe(false);
    }
  });
});

describe('what a setting of a line says', () => {
  const t = ((key: string, v: Record<string, string | number> = {}) => `${key}:${Object.entries(v).map(([a, b]) => `${a}=${b}`).join(',')}`) as never;
  const rm = (n: number) => `RM${Math.round(n)}`;
  const amountAt = (d: number) => 100 * lineMult(d);
  it('names it, says what it takes off or adds in ringgit and per cent, and what it comes to', () => {
    expect(lineReadout(t, rm, amountAt, -5)).toEqual({ name: 'dial.abolish:', change: 'stop.takes:rm=RM100,pct=−100', total: 'stop.comesTo:rm=RM0' });
    expect(lineReadout(t, rm, amountAt, -2)).toEqual({ name: 'dial.cutBy:n=40', change: 'stop.takes:rm=RM40,pct=−40', total: 'stop.comesTo:rm=RM60' });
    expect(lineReadout(t, rm, amountAt, 0)).toEqual({ name: 'dial.hold:', change: 'stop.noChange:', total: 'stop.comesTo:rm=RM100' });
    expect(lineReadout(t, rm, amountAt, 3)).toEqual({ name: 'dial.boostBy:n=60', change: 'stop.adds:rm=RM60,pct=+60', total: 'stop.comesTo:rm=RM160' });
  });
});

describe('the other settings a government makes in steps', () => {
  it('give the tax in the budget tenths of what it takes, from half to half as much again, and move the books a step at a time', () => {
    const c = career();
    const k = c.career!;
    for (const v of [-5, -1, 0, 1, 5]) { expect(setBudget(c, { tax: true, value: v }), String(v)).toBe(true); expect(k.budget.tax).toBe(v); }
    for (const v of [-6, 6, 0.5]) expect(setBudget(c, { tax: true, value: v }), String(v)).toBe(false);
    const hold = takingsWeekly(world, c, 0);
    // Five tenths more of what the tax takes, and five tenths less.
    expect(takingsWeekly(world, c, 5) / hold).toBeCloseTo(1.5, 6);
    expect(takingsWeekly(world, c, -5) / hold).toBeCloseTo(0.5, 6);
    expect(takingsWeekly(world, c, -5)).toBeLessThan(takingsWeekly(world, c, -1));
    expect(takingsWeekly(world, c, -1)).toBeLessThan(hold);
    expect(hold).toBeLessThan(takingsWeekly(world, c, 1));
    expect(takingsWeekly(world, c, 1)).toBeLessThan(takingsWeekly(world, c, 5));
    const at = (tax: number) => ({ ...k.budget, tax });
    expect(looseness(k, at(5))).toBe(looseness(k, at(0)) - 10);
    expect(looseness(k, at(-3))).toBe(looseness(k, at(0)) + 6);
  });

  it('cost the small firms and the middle class more the more tax is raised, and please them more the more it is cut', () => {
    const shift = (tax: number) => {
      const c = career();
      const k = c.career!;
      const b = ['smallbiz', 'm40'].map((x) => BLOC_IDS.indexOf(x as never));
      const before = b.map((i) => k.mood[i][PS]);
      tableBudget(c, { ...k.budget, tax });
      return b.reduce((a, i, j) => a + k.mood[i][PS] - before[j], 0);
    };
    expect(shift(1)).toBeLessThan(0);
    expect(shift(5)).toBeCloseTo(5 * shift(1), 6);
    expect(shift(-4)).toBeCloseTo(4 * shift(-1), 6);
    expect(shift(-2)).toBeGreaterThan(0);
  });

  it('give each tax of the plan up to five steps either way, and the policy rate three, where the head of government may set it', () => {
    const c = career();
    for (const id of TAX_IDS) {
      for (const v of [-5, -2, 0, 3, 5]) expect(setTax(c, id, v), `${id} ${v}`).toBe(true);
      for (const v of [-6, 6, 1.5]) expect(setTax(c, id, v), `${id} ${v}`).toBe(false);
    }
    // The central bank sets the rate in the federation; a state's head of government sets it.
    expect(setRate(c, 2)).toBe(false);
    const state = startCareer(getWorld('career:perak')!, { player: PS, difficulty: 'normal', seed: 5 });
    state.career!.obligations = [];
    if (state.career!.government.pm === PS) {
      for (const v of [-3, -1, 0, 2, 3]) expect(setRate(state, v), String(v)).toBe(true);
      for (const v of [-4, 4, 0.5]) expect(setRate(state, v), String(v)).toBe(false);
    }
  });

  it('are valid in a saved game only within their scales', () => {
    const c = career();
    c.career!.budget.tax = 5;
    c.career!.taxMix = { sales: 5, income: -5, corporate: 0, luxury: 2 };
    c.career!.rate = -3;
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    const bad = (edit: (k: Record<string, any>) => void) => { const g = JSON.parse(JSON.stringify(c)); edit(g.career); return isValidCampaign(g, world); };
    expect(bad((k) => { k.budget.tax = 6; })).toBe(false);
    expect(bad((k) => { k.taxMix.sales = 6; })).toBe(false);
    expect(bad((k) => { k.rate = 4; })).toBe(false);
  });

  it('are read as what they do: the name of the setting and what it takes off or adds', () => {
    const t = ((key: string, v: Record<string, string | number> = {}) => `${key}:${Object.entries(v).map(([a, b]) => `${a}=${b}`).join(',')}`) as never;
    const rm = (n: number) => `RM${Math.round(n)}`;
    const amountAt = (d: number) => 1000 * (1 + 0.1 * d);
    const tax = { pctPerStep: 10, raiseKey: 'dial.raiseBy' } as const;
    expect(lineReadout(t, rm, amountAt, -5, tax)).toEqual({ name: 'dial.cutBy:n=50', change: 'stop.takes:rm=RM500,pct=−50', total: 'stop.comesTo:rm=RM500' });
    expect(lineReadout(t, rm, amountAt, 3, tax)).toEqual({ name: 'dial.raiseBy:n=30', change: 'stop.adds:rm=RM300,pct=+30', total: 'stop.comesTo:rm=RM1300' });
    expect(lineReadout(t, rm, amountAt, 0, tax).name).toBe('dial.hold:');
  });
});
