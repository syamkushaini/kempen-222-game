import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { skipAhead, startCareer } from './career';
import { isPm } from './office';
import { projectFor, rateFor, repayFor, rivalPmWeek, taxFor, toolFor, needOf } from './rivalPm';
import type { Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps');
const PT = PARTY_IDS.indexOf('pt');
const world = getWorld('career')!;

/** A game in which somebody else leads the government and the player sits across the floor. */
function opposition(seed = 5): Campaign {
  const c = startCareer(world, { player: PS, difficulty: 'normal', seed });
  c.inbox = [];
  const k = c.career!;
  k.appointments = []; k.obligations = [];
  k.government.pm = PT;
  k.government.partners = [];
  return c;
}
const set = (c: Campaign, e: Partial<NonNullable<Campaign['career']>['economy']>) => Object.assign(c.career!.economy, e);

describe('the head of government when the player is not', () => {
  it('raises the rate against high prices and cuts it in a slump', () => {
    const c = opposition();
    set(c, { inflation: 6, growth: 4 });
    expect(rateFor(c)).toBe(1);
    set(c, { inflation: 3, growth: 1 });
    expect(rateFor(c)).toBe(-1);
    set(c, { inflation: 3, growth: 4 });
    expect(rateFor(c)).toBe(0);
  });

  it('taxes more and pays down the debt when it is heavy, and eases taxes when it is light and growth is weak', () => {
    const c = opposition();
    set(c, { debt: 95, inflation: 3 });
    expect(taxFor(c).income).toBe(1);
    expect(repayFor(c)).toBeGreaterThan(0.3 - 1e-9);
    set(c, { debt: 50, growth: 2 });
    expect(taxFor(c).corporate).toBe(-1);
    expect(repayFor(c)).toBe(0);
  });

  it('picks the act and the project that match what the country needs', () => {
    const c = opposition();
    set(c, { inflation: 7, growth: 4, debt: 60 });
    expect(needOf(c)).toBe('prices');
    expect(['priceControls', 'importCuts', 'foodAid']).toContain(toolFor(c, 'prices')!.id);
    expect(['foodSecurity', 'energyGrid', 'localProduction']).toContain(projectFor(c, 'prices'));
  });

  it('makes the choices on its own as weeks pass: rate, a tool, a project, news of it', () => {
    const c = opposition();
    const k = c.career!;
    expect(isPm(c)).toBe(false);
    set(c, { inflation: 7, growth: 4, debt: 60 });
    const debtBefore = k.economy.debt;
    for (let i = 0; i < 24; i++) { k.week += 1; rivalPmWeek(c); }
    expect(k.rate).toBe(1);
    expect(Object.keys(k.toolsUsed ?? {}).length).toBeGreaterThan(0);
    expect(c.news.some((n) => n.key === 'news.rate.up')).toBe(true);
    expect(c.news.some((n) => n.key === 'news.tool.used')).toBe(true);
    expect(k.economy.debt).not.toBe(debtBefore);
  });

  it('never touches the player\'s own purse, credibility or standing commitments', () => {
    const c = opposition();
    const k = c.career!;
    set(c, { inflation: 7, growth: 0.5, debt: 95 });
    const before = { funds: c.parties[PS]!.funds, cred: k.credibility, fiscal: k.fiscal };
    for (let i = 0; i < 60; i++) { k.week += 1; rivalPmWeek(c); }
    expect({ funds: c.parties[PS]!.funds, cred: k.credibility, fiscal: k.fiscal }).toEqual(before);
  });

  it('does nothing when the player is the head of government, and keeps the ordinary game on its course', () => {
    const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 9 });
    c.inbox = [];
    const k = c.career!;
    if (!isPm(c)) { k.government.pm = PS; k.government.partners = []; }
    set(c, { inflation: 7, growth: 4 });
    skipAhead(world, c, 8);
    expect(k.rate).toBeUndefined();
  });

  it('runs a whole term in opposition without breaking the economy', () => {
    const c = opposition(11);
    for (let i = 0; i < 12 && c.phase === 'term'; i++) { c.inbox = []; skipAhead(world, c, 52); }
    const e = c.career!.economy;
    for (const v of [e.growth, e.inflation, e.debt, e.jobless]) expect(Number.isFinite(v)).toBe(true);
    expect(e.debt).toBeGreaterThanOrEqual(30);
    expect(e.debt).toBeLessThanOrEqual(120);
  });
});
