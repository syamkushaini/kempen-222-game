import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer, termWeek } from './career';
import { ALLOCATION, DEBT_FLOOR, govBooks, govMoney, treasuryOf } from './treasury';
import type { Campaign } from './types';

const [PS, BP] = PARTY_IDS.map((_, i) => i);
const world = getWorld('career')!;
const career = (player = PS): Campaign => {
  const c = startCareer(world, { player, difficulty: 'normal', seed: 5 });
  const e = c.career!.economy;
  e.growth = 4; e.jobless = 3.5; e.debt = 63;
  return c;
};
const total = (xs: { amount: number }[]) => xs.reduce((a, x) => a + x.amount, 0);

describe('the head of government’s books', () => {
  it('leave the plain allocation with a plain budget and a middling economy', () => {
    const books = govBooks(world, career())!;
    const patronage = books.income.find((x) => x.id === 'states')?.amount ?? 0;
    expect(Math.round(books.net - patronage)).toBe(govMoney(world, ALLOCATION.pm));
    expect(total(books.income) - total(books.spend)).toBeCloseTo(books.net, 0);
  });

  it('are the head’s alone', () => {
    expect(govBooks(world, career(BP))).toBeNull();
  });

  it('take in more from higher taxes and a stronger economy, and less from looser spending, commitments and a heavy debt', () => {
    const base = govBooks(world, career())!.net;
    const taxed = career(); taxed.career!.tabled.tax = 1;
    expect(govBooks(world, taxed)!.net).toBeGreaterThan(base);
    const growing = career(); growing.career!.economy.growth = 6;
    expect(govBooks(world, growing)!.net).toBeGreaterThan(base);
    const generous = career(); generous.career!.tabled.lines.aid = 1;
    expect(govBooks(world, generous)!.net).toBeLessThan(base);
    const committed = career(); committed.career!.fiscal = 5;
    expect(govBooks(world, committed)!.net).toBeLessThan(base);
    const indebted = career(); indebted.career!.economy.debt = 100;
    expect(govBooks(world, indebted)!.net).toBeLessThan(base);
  });

  it('plan the next budget separately from the one in force', () => {
    const c = career();
    c.career!.budget.lines.health = 1;
    const now = govBooks(world, c)!, next = govBooks(world, c, c.career!.budget)!;
    expect(next.net).toBeLessThan(now.net);
  });

  it('borrow what the treasury cannot cover, and the debt grows', () => {
    const c = career();
    const k = c.career!;
    k.tabled.lines = { aid: 1, health: 1, education: 1, rural: 1, civil: 1 };
    k.fiscal = 12;
    k.states = {};
    expect(govBooks(world, c)!.net).toBeLessThan(0);
    k.treasury = 0;
    c.inbox = [];
    const debt = k.economy.debt;
    termWeek(world, c);
    expect(treasuryOf(c)).toBe(0);
    expect(k.economy.debt).toBeGreaterThan(debt);
    expect(k.economy.debt).toBeGreaterThanOrEqual(DEBT_FLOOR);
  });
});
