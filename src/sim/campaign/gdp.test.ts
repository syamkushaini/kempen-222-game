import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { startCareer, termWeek } from './career';
import { PUBLIC_MONEY, EVENTS, resolveEvent } from './events';
import { figuresOf, gdpWeek, LINE_SHARE, NATIONAL_GDP, publicFinance, sectorShares, startFigures } from './gdp';
import { govMoney, treasuryOf } from './treasury';
import { setBudget } from './office';
import { LINE_IDS, type Campaign } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const base = getWorld('career')!;
const career = (world = base, player = PS): Campaign => startCareer(world, { player, difficulty: 'normal', seed: 5 });
const years = (c: Campaign, world = base, n = 1) => { for (let w = 0; w < 52 * n; w++) { c.inbox = []; termWeek(world, c); } };

describe('the size of the economy', () => {
  it('starts at about the country’s own, with each person’s share in the tens of thousands of ringgit', () => {
    const f = startFigures(base);
    expect(f.gdp).toBeGreaterThan(NATIONAL_GDP * 0.99);
    expect(f.gdp).toBeLessThan(NATIONAL_GDP * 1.01);
    expect(f.population).toBeGreaterThan(30_000_000);
    expect(f.perCapita).toBeGreaterThan(40_000);
    expect(f.perCapita).toBeLessThan(80_000);
  });

  it('is a state’s own in a state career, richer per head in Selangor than in Kelantan', () => {
    const sel = getWorld('career:selangor')!, kel = getWorld('career:kelantan')!;
    const a = startFigures(sel), b = startFigures(kel);
    expect(a.gdp).toBeGreaterThan(300e9);
    expect(a.gdp).toBeLessThan(500e9);
    expect(a.gdp).toBeGreaterThan(b.gdp);
    expect(a.perCapita).toBeGreaterThan(b.perCapita * 1.5);
  });

  it('grows with growth and prices week by week, and shrinks in a slump', () => {
    const c = career();
    const k = c.career!;
    const was = figuresOf(base, k).gdp;
    gdpWeek(base, c);
    expect(k.economy.gdp!).toBeGreaterThan(was);
    k.economy.growth = -5; k.economy.inflation = 0;
    const low = k.economy.gdp!;
    gdpWeek(base, c);
    expect(k.economy.gdp!).toBeLessThan(low);
  });

  it('is announced at the end of each year, with the debt, and the report says whether things rose or fell', () => {
    const c = career();
    years(c, base, 2);
    const k = c.career!;
    expect(k.reports).toHaveLength(2);
    expect(k.reports![1].year).toBe(2);
    expect(k.reports![0].gdp).toBeGreaterThan(1e12);
    expect(k.reports![0].debtRm).toBeGreaterThan(5e11);
    const news = c.news.filter((n) => n.key.startsWith('news.gdp.'));
    expect(news).toHaveLength(2);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('puts the state’s own sectors into its output: oil weighs most in Terengganu, electronics in Penang', () => {
    const ter = getWorld('career:terengganu')!, pen = getWorld('career:penang')!;
    const a = sectorShares(ter, career(ter).career!), b = sectorShares(pen, career(pen).career!);
    expect(a.oil).toBeGreaterThan(0.5);
    expect(b.electronics).toBeGreaterThan(0.5);
    // A good year for oil lifts the oil state’s output more than the electronics state’s.
    const cOil = career(ter), cEl = career(pen);
    for (const c of [cOil, cEl]) c.career!.sectors = { oil: 100, electronics: 50, tourism: 50, farming: 50 };
    cOil.career!.economy = { ...cOil.career!.economy }; cEl.career!.economy = { ...cEl.career!.economy };
    const o0 = figuresOf(ter, cOil.career!).gdp / startFigures(ter).gdp, e0 = figuresOf(pen, cEl.career!).gdp / startFigures(pen).gdp;
    gdpWeek(ter, cOil); gdpWeek(pen, cEl);
    expect(cOil.career!.economy.gdp! / startFigures(ter).gdp).toBeGreaterThan(cEl.career!.economy.gdp! / startFigures(pen).gdp);
    expect(o0).toBe(e0);
  });
});

describe('the public finances in ringgit', () => {
  it('give each line of the budget a sum in the billions, and more for a boost than a cut', () => {
    const c = career();
    const k = c.career!;
    const mid = publicFinance(base, k);
    for (const id of LINE_IDS) expect(mid.lines[id]).toBeGreaterThan(1e9);
    expect(mid.lines.education).toBeGreaterThan(mid.lines.rural);
    expect(mid.lines.education).toBeCloseTo(startFigures(base).gdp * LINE_SHARE.education, -6);
    setBudget(c, { line: 'health', value: 1 });
    k.tabled = { ...k.budget, lines: { ...k.budget.lines } };
    expect(publicFinance(base, k).lines.health).toBeGreaterThan(mid.lines.health);
    expect(mid.deficitRm).toBeGreaterThan(1e10);
    expect(mid.debtRm).toBeGreaterThan(1e12 * 0.9);
  });

  it('are a state’s, not the country’s, in a state career', () => {
    const sel = getWorld('career:selangor')!;
    const fin = publicFinance(sel, career(sel).career!);
    expect(fin.budgetRm).toBeGreaterThan(1e9);
    expect(fin.budgetRm).toBeLessThan(20e9);
    expect(fin.debtRm).toBeLessThan(60e9);
  });
});

describe('the government’s money in events', () => {
  it('is the treasury’s, in millions, where the party governs: a flood costs the treasury and not the party', () => {
    const c = career();
    expect(PUBLIC_MONEY.has('flood')).toBe(true);
    const k = c.career!;
    k.treasury = govMoney(base, 1_000_000);
    const funds = c.parties[PS]!.funds;
    const treasury = treasuryOf(c);
    resolveEvent(base, c, { id: 1, kind: 'event', from: null, event: 'flood' }, 0);
    expect(c.parties[PS]!.funds).toBe(funds);
    expect(treasuryOf(c)).toBe(treasury - govMoney(base, 40_000));
    expect(govMoney(base, 40_000)).toBeGreaterThanOrEqual(1e9);
  });

  it('keeps the party’s own money (donors, the party hall) out of the treasury', () => {
    for (const id of ['donorFavour', 'hallFire', 'partyAnniversary', 'memberApp']) expect(PUBLIC_MONEY.has(id), id).toBe(false);
    for (const id of PUBLIC_MONEY) expect(EVENTS[id], id).toBeTruthy();
    const c = career();
    const treasury = treasuryOf(c);
    resolveEvent(base, c, { id: 1, kind: 'event', from: null, event: 'memberApp' }, 1);
    expect(treasuryOf(c)).toBe(treasury);
  });

  it('is a state’s in a state career: millions, not billions', () => {
    const sel = getWorld('career:selangor')!;
    expect(govMoney(sel, 40_000)).toBeGreaterThan(1e6);
    expect(govMoney(sel, 40_000)).toBeLessThan(1e8);
  });
});

void Rng;
