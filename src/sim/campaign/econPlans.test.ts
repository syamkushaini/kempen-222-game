import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { startCareer, termWeek } from './career';
import { MAX_PROJECTS_AT_ONCE, PROJECTS, canStartProject, plansWeek, setRepayShare, setTax, startProject, stopProject } from './econPlans';
import { economyWeek } from './office';
import { govBooks, treasuryWeek } from './treasury';
import type { Campaign } from './types';

const [PS, BP] = PARTY_IDS.map((_, i) => i);
const world = getWorld('career')!;
const career = (player = PS): Campaign => { const c = startCareer(world, { player, difficulty: 'normal', seed: 5 }); c.inbox = []; c.career!.appointments = []; return c; };
const settle = (c: Campaign) => { for (let w = 0; w < 400; w++) economyWeek(c, new Rng(9 + w)); return c.career!.economy; };
const total = (xs: { amount: number }[]) => xs.reduce((a, x) => a + x.amount, 0);

describe('the tax mix', () => {
  it('trades takings against prices and growth, tax by tax', () => {
    const base = govBooks(world, career())!;
    const sales = career(); expect(setTax(sales, 'sales', 1)).toBe(true);
    expect(total(govBooks(world, sales)!.income)).toBeGreaterThan(total(base.income));
    expect(settle(sales).inflation).toBeGreaterThan(settle(career()).inflation);
    const company = career(); setTax(company, 'corporate', 1);
    expect(settle(company).growth).toBeLessThan(settle(career()).growth);
    const cut = career(); setTax(cut, 'sales', -1);
    expect(settle(cut).inflation).toBeLessThan(settle(career()).inflation);
    expect(setTax(career(BP), 'sales', 1)).toBe(false);
  });

  it('leaves no mix behind once every tax is back where it was', () => {
    const c = career();
    setTax(c, 'income', 1); setTax(c, 'income', 0);
    expect(c.career!.taxMix).toBeUndefined();
  });
});

describe('the debt plan', () => {
  it('sets a share of the surplus aside, and pays it to the debt as it is earned', () => {
    const c = career(); c.career!.states = {};
    const plain = govBooks(world, c)!;
    expect(setRepayShare(c, 0.5)).toBe(true);
    const books = govBooks(world, c)!;
    const set = books.spend.find((x) => x.id === 'repay')!.amount;
    expect(set).toBeGreaterThan(0);
    expect(books.net).toBeCloseTo(plain.net - set, 0);
    const debt = c.career!.economy.debt;
    treasuryWeek(world, c);
    expect(c.career!.economy.debt).toBeLessThan(debt);
    expect(setRepayShare(c, 0.9)).toBe(false);
    expect(setRepayShare(career(BP), 0.2)).toBe(false);
  });
});

describe('national projects', () => {
  it('cost money each month while they are built, and pay for good when they are done', () => {
    const c = career();
    const k = c.career!;
    const food = PROJECTS.find((p) => p.id === 'foodSecurity')!;
    expect(startProject(c, 'foodSecurity')).toBe(true);
    expect(govBooks(world, c)!.spend.find((x) => x.id === 'projects')!.amount).toBeGreaterThan(0);
    for (let w = 0; w < food.weeks; w++) plansWeek(c);
    expect(k.built).toEqual(['foodSecurity']);
    expect(k.projects).toBeUndefined();
    expect(govBooks(world, c)!.spend.find((x) => x.id === 'projects')!.amount).toBe(0);
    expect(settle(c).inflation).toBeLessThan(settle(career()).inflation);
    expect(canStartProject(c, 'foodSecurity')).toEqual({ ok: false, reason: 'built' });
  });

  it('are limited to three at once, are started once, and can be called off', () => {
    const c = career();
    for (const id of ['foodSecurity', 'localProduction', 'energyGrid']) expect(startProject(c, id)).toBe(true);
    expect(c.career!.projects).toHaveLength(MAX_PROJECTS_AT_ONCE);
    expect(canStartProject(c, 'railPorts')).toEqual({ ok: false, reason: 'full' });
    expect(canStartProject(c, 'foodSecurity')).toEqual({ ok: false, reason: 'running' });
    expect(stopProject(c, 'energyGrid')).toBe(true);
    expect(canStartProject(c, 'railPorts').ok).toBe(true);
    expect(canStartProject(career(BP), 'railPorts')).toEqual({ ok: false, reason: 'notPm' });
  });

  it('digital government takes standing commitments off when it is done', () => {
    const c = career();
    c.career!.fiscal = 3;
    startProject(c, 'digitalGov');
    for (let w = 0; w < 60; w++) plansWeek(c);
    expect(c.career!.fiscal).toBeCloseTo(1.5, 5);
  });

  it('run through a whole term without spoiling the books', () => {
    const c = career();
    startProject(c, 'taxCollection'); setRepayShare(c, 0.3); setTax(c, 'luxury', 1);
    for (let w = 0; w < 120; w++) { c.inbox = []; if (c.phase !== 'term') break; termWeek(world, c); }
    expect(c.career!.economy.debt).toBeGreaterThanOrEqual(30);
    expect(c.career!.built ?? []).toContain('taxCollection');
  });
});
