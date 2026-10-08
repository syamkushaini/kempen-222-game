import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { majorityLine } from '../election';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { startCareer } from './career';
import { canRepeal, confidenceCount, repeal, whipCount } from './govern';
import { MAX_MEASURES, MEASURES, deficit, setBudget, tableBudget } from './office';
import { CROSS_BELOW, PLOT, plotsWeek } from './plots';
import { SUPPLY_CASH, SUPPLY_WEEKS, MAX_SUPPLY, canSupply, signSupply, supplyWeek, supports } from './supply';
import { MEASURE_IDS, type Campaign } from './types';
import { isValidCampaign } from './validate';

const [PS, BP, PT] = PARTY_IDS.map((_, i) => i);
const base = getWorld('career')!;
const career = (player = PS, seed = 5): Campaign => {
  const c = startCareer(base, { player, difficulty: 'normal', seed });
  c.career!.obligations = [];
  return c;
};

describe('a budget that pays for particular things', () => {
  it('lets the head of government choose up to three, each costing a little more than holding the line', () => {
    const c = career();
    const k = c.career!;
    const plain = deficit(k, k.budget);
    expect(setBudget(c, { measure: 'roads', on: true })).toBe(true);
    expect(k.budget.measures).toEqual(['roads']);
    expect(deficit(k, k.budget)).toBeGreaterThan(plain);
    setBudget(c, { measure: 'clinics', on: true });
    setBudget(c, { measure: 'pensions', on: true });
    expect(setBudget(c, { measure: 'cashTopUp', on: true })).toBe(false);
    expect(k.budget.measures).toHaveLength(MAX_MEASURES);
    expect(setBudget(c, { measure: 'roads', on: false })).toBe(true);
    expect(k.budget.measures).toEqual(['clinics', 'pensions']);
    expect(setBudget(c, { measure: 'nonsense' as never, on: true })).toBe(false);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('is noticed by the groups it is for, when it is tabled', () => {
    const c = career();
    const k = c.career!;
    const bloc = (b: string) => ['undi18', 'heartland', 'felda', 'agri', 'civil', 'urban_b40', 'gig', 'm40', 'urban_lib', 'smallbiz', 'seniors', 'borneo_native', 'borneo_urban'].indexOf(b);
    const before = k.mood[bloc('borneo_native')][PS];
    const plan = { ...k.budget, measures: ['roads' as const] };
    tableBudget(c, plan);
    expect(k.mood[bloc('borneo_native')][PS]).toBeGreaterThan(before);
    expect(k.tabled.measures).toEqual(['roads']);
  });

  it('has every measure named in both languages, and one in each of the five lines at least', () => {
    expect(new Set(MEASURE_IDS.map((m) => MEASURES[m].line)).size).toBe(5);
    for (const lang of ['en', 'ms'] as const) for (const m of MEASURE_IDS) for (const k of [`measure.${m}`, `measure.${m}.desc`]) expect(STRINGS[lang][k as StringKey], k).toBeTruthy();
  });

  it('is only for the head of government', () => {
    const c = career(BP);
    expect(setBudget(c, { measure: 'roads', on: true })).toBe(c.career!.government.pm === BP);
  });
});

describe('repealing an Act', () => {
  const withLaw = () => { const c = career(); c.career!.laws = ['termLimit']; return c; };

  it('is for the head of government, once a term, and puts the promise back on the table', () => {
    const c = withLaw();
    const k = c.career!;
    const [trust, cred] = [k.government.trust, k.credibility];
    expect(canRepeal(c, 'termLimit')).toBe(true);
    expect(repeal(c, 'termLimit')).toBe(true);
    expect(k.laws).toBeUndefined();
    expect(k.government.trust).toBe(trust - 3);
    expect(k.credibility).toBe(cred - 3);
    k.laws = ['graftCommission'];
    expect(canRepeal(c, 'graftCommission')).toBe(false);
    expect(repeal(c, 'cashAid')).toBe(false);
  });

  it('is not for a leader who is not in charge', () => {
    const c = career(PT);
    c.career!.laws = ['termLimit'];
    expect(canRepeal(c, 'termLimit')).toBe(false);
  });
});

describe('confidence and supply', () => {
  const minority = (seed = 5) => {
    const c = career(PS, seed);
    c.career!.government = { ...c.career!.government, seats: majorityLine(base) - 6, partners: [], minority: true, stability: 45 };
    c.career!.government.pm = PS;
    c.parties[PS]!.funds = 5_000_000;
    c.relations[PS][PT] = c.relations[PT][PS] = 40;
    return c;
  };

  it('can be asked of a party outside the cabinet that is warm enough, for money or for what it wants, and keeps the government up', () => {
    const c = minority();
    const k = c.career!;
    const before = confidenceCount(base, c);
    expect(canSupply(base, c, PT, 'cash').ok).toBe(true);
    const funds = c.parties[PS]!.funds;
    expect(signSupply(base, c, PT, 'cash')).toBe(true);
    expect(c.parties[PS]!.funds).toBe(funds - scaled(base, SUPPLY_CASH));
    expect(supports(c, PT)).toBe(true);
    expect(k.government.stability).toBe(51);
    expect(confidenceCount(base, c)).toBeGreaterThan(before);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
    const policy = minority();
    signSupply(base, policy, PT, 'policy');
    expect(policy.career!.obligations).toHaveLength(1);
    expect(policy.career!.obligations[0].party).toBe(PT);
  });

  it('counts for the government in a vote on its bills', () => {
    const c = minority();
    const bill = 'pledge:homes';
    const before = whipCount(base, c, bill, PS).yes;
    signSupply(base, c, PT, 'cash');
    c.relations[PS][PT] = c.relations[PT][PS] = 80;
    expect(whipCount(base, c, bill, PS).yes).toBeGreaterThanOrEqual(before);
  });

  it('is refused to a cold party, to a government that has no need, and beyond the number it can keep', () => {
    const cold = minority(); cold.relations[PS][PT] = cold.relations[PT][PS] = -30;
    expect(canSupply(base, cold, PT, 'cash')).toEqual({ ok: false, reason: 'warmth' });
    const comfy = minority(); comfy.career!.government.seats = majorityLine(base) + 20;
    expect(canSupply(base, comfy, PT, 'cash')).toEqual({ ok: false, reason: 'comfortable' });
    const full = minority();
    full.career!.supply = [{ party: PT, until: 999, price: 'cash' }, { party: BP, until: 999, price: 'cash' }];
    expect(MAX_SUPPLY).toBe(2);
    expect(canSupply(base, full, PARTY_IDS.indexOf('gbk'), 'cash')).toEqual({ ok: false, reason: 'full' });
  });

  it('lapses when its year is out, and the government is shaken', () => {
    const c = minority();
    signSupply(base, c, PT, 'cash');
    c.career!.week += SUPPLY_WEEKS - 1;
    supplyWeek(c);
    expect(supports(c, PT)).toBe(true);
    c.career!.week += 1;
    const stability = c.career!.government.stability;
    supplyWeek(c);
    expect(supports(c, PT)).toBe(false);
    expect(c.career!.supply).toBeUndefined();
    expect(c.career!.government.stability).toBe(stability - 4);
    expect(c.news.some((n) => n.key === 'news.supply.ended')).toBe(true);
  });
});

describe('a partner that leaves a falling government', () => {
  const plotting = (stability: number) => {
    const c = career(PS, 7);
    const k = c.career!;
    k.government = { ...k.government, pm: PS, partners: [BP], stability, seats: 100, minority: true };
    k.plots = { [BP]: PLOT.walk - 0.1 };
    c.relations[PS][BP] = c.relations[BP][PS] = -80;
    return c;
  };

  it('crosses to the largest party outside when the government is falling, and is told so first', () => {
    const c = plotting(CROSS_BELOW - 10);
    plotsWeek(base, c);
    expect(c.news.some((n) => n.key === 'news.plot.crossed')).toBe(true);
    expect(c.relations[PS][BP]).toBeLessThan(-80 + 1);
  });

  it('simply walks out of a government that is steady', () => {
    const c = plotting(CROSS_BELOW + 25);
    plotsWeek(base, c);
    expect(c.news.some((n) => n.key === 'news.plot.crossed')).toBe(false);
  });
});
