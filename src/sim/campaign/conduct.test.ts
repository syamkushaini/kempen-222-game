import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer, termWeek } from './career';
import { CEILING, checksOf, conductWeek } from './conduct';
import { hire } from './staff';
import type { Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps');
const base = getWorld('career')!;
const career = (): Campaign => startCareer(base, { player: PS, difficulty: 'normal', seed: 5 });
/** A leader doing everything right: a team hired and paid, orders clean, stances as the manifesto left them. */
const sound = (c: Campaign) => {
  hire(c, 'manager', 0);
  c.career!.orders.donors = 0; c.career!.orders.state = 0;
  delete c.team.unpaid;
};

describe('the weekly judgement of conduct', () => {
  it('has five checks, and a leader who has done nothing wrong but hired no one fails one of them and so earns nothing', () => {
    const c = career();
    const ok = checksOf(base, c, 1);
    expect(ok).toHaveLength(5);
    expect(ok.filter(Boolean).length).toBe(4);
    expect(ok[3]).toBe(false);
    const idle = career();
    idle.career!.credibility = 50; idle.parties[PS]!.unity = 50;
    for (let w = 0; w < 20; w++) { idle.inbox = []; termWeek(base, idle); }
    expect(idle.career!.conduct!.delta).toBe(0);
    expect(idle.career!.credibility).toBeLessThan(55);
  });

  it('earns a point of credibility and unity for a sound week, and records it', () => {
    const c = career();
    sound(c);
    const k = c.career!;
    k.credibility = 50; c.parties[PS]!.unity = 50;
    conductWeek(base, c, 1);
    expect(k.credibility).toBe(51);
    expect(c.parties[PS]!.unity).toBe(51);
    expect(k.conduct).toMatchObject({ delta: 1 });
    expect(k.conduct!.ok.every(Boolean)).toBe(true);
    expect(c.news.some((n) => n.key === 'news.conduct.good')).toBe(true);
  });

  it('costs a point of each for a poor week, and nothing for a middling one', () => {
    const c = career();
    const k = c.career!;
    k.credibility = 50; c.parties[PS]!.unity = 50;
    k.orders.donors = 2; k.orders.state = 1;
    k.stances[PS] = k.stances[PS].map((s) => Math.max(-2, Math.min(2, s + 2 * (s > 0 ? -1 : 1)))); // a U-turn on every issue
    c.team.unpaid = true;
    conductWeek(base, c, 0.5);
    expect(k.conduct!.delta).toBe(-1);
    expect(k.credibility).toBe(49);
    expect(c.parties[PS]!.unity).toBe(49);
    expect(c.news.some((n) => n.key === 'news.conduct.bad')).toBe(true);
    // Four of five: nothing moves.
    const d = career();
    sound(d);
    d.career!.credibility = 50; d.parties[PS]!.unity = 50;
    d.career!.orders.donors = 1;
    conductWeek(base, d, 1);
    expect(d.career!.conduct!.delta).toBe(0);
    expect(d.career!.credibility).toBe(50);
  });

  it('builds credibility up to a good name and no further, but does not stop a loss', () => {
    const c = career();
    sound(c);
    const k = c.career!;
    k.credibility = CEILING; c.parties[PS]!.unity = CEILING;
    conductWeek(base, c, 1);
    expect(k.credibility).toBe(CEILING);
    expect(c.parties[PS]!.unity).toBe(CEILING);
    k.credibility = 95;
    k.orders.donors = 2; k.orders.state = 1; c.team.unpaid = true;
    k.stances[PS] = k.stances[PS].map((s) => Math.max(-2, Math.min(2, s + 2 * (s > 0 ? -1 : 1))));
    conductWeek(base, c, 0);
    expect(k.credibility).toBe(94);
  });

  it('does not say the same thing every week: the news is for a turn, not for each week', () => {
    const c = career();
    sound(c);
    c.career!.credibility = 40;
    conductWeek(base, c, 1); conductWeek(base, c, 1); conductWeek(base, c, 1);
    expect(c.news.filter((n) => n.key === 'news.conduct.good')).toHaveLength(1);
  });

  it('is part of every week of a term, and a leader who plays soundly climbs back from a low', () => {
    const c = career();
    sound(c);
    const k = c.career!;
    k.credibility = 20;
    for (let w = 0; w < 30; w++) { c.inbox = []; termWeek(base, c); }
    expect(k.credibility).toBeGreaterThan(30);
    expect(k.conduct).toBeDefined();
  });
});
