import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { CASE, GRAFT, caseChance, fightOdds, graftWeek } from './trial';
import { hasPublicMoney } from './treasury';
import { endCareer } from './legacy';
import { isValidCampaign } from './validate';
import type { Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps');
const world = getWorld('career')!;
const career = (): Campaign => { const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 }); c.inbox = []; return c; };
const weeks = (c: Campaign, n: number) => { for (let i = 0; i < n; i++) graftWeek(c); };

describe('running the party on public money builds up a record the courts follow', () => {
  it('rises each week the state is drawn on or donors are pressed hard, and not otherwise', () => {
    const c = career();
    expect(hasPublicMoney(c)).toBe(true);
    weeks(c, 20);
    expect(c.career!.graft).toBeUndefined();
    c.career!.orders.state = 6;
    weeks(c, 20);
    const a = c.career!.graft!;
    expect(a).toBeGreaterThan(5);
    c.career!.orders.donors = 6;
    weeks(c, 20);
    expect(c.career!.graft!).toBeGreaterThan(a * 1.5);
    // Donors up to the third level are ordinary fundraising.
    const d = career(); d.career!.orders.donors = GRAFT.donorsFrom; weeks(d, 40);
    expect(d.career!.graft).toBeUndefined();
  });

  it('eases slowly once it stops, and is gone in the end', () => {
    const c = career();
    c.career!.graft = 40;
    weeks(c, 52);
    expect(c.career!.graft!).toBeLessThan(40);
    expect(c.career!.graft!).toBeGreaterThan(20);
    weeks(c, 2000);
    expect(c.career!.graft).toBeUndefined();
  });

  it('is warned of in the news, once at each of two levels', () => {
    const c = career();
    c.career!.orders.state = 6;
    weeks(c, 400);
    const said = (key: string) => c.news.filter((n) => n.key === key).length;
    expect(said('news.graft.warn')).toBe(1);
    expect(said('news.graft.alarm')).toBe(1);
    expect(STRINGS.en['news.graft.warn' as never]).toBeDefined();
    expect(STRINGS.ms['news.graft.alarm' as never]).toBeDefined();
  });

  it('raises the chance of a case and lowers the chance of winning one, up to a limit', () => {
    const c = career();
    const base = caseChance(c);
    const odds = fightOdds(c);
    c.career!.graft = 50;
    expect(caseChance(c)).toBeCloseTo(Math.min(CASE.max, base + CASE.perGraft * 50), 9);
    expect(fightOdds(c)).toBeLessThan(odds);
    c.career!.graft = 1000;
    expect(caseChance(c)).toBe(CASE.max);
    expect(fightOdds(c)).toBeGreaterThanOrEqual(0.15);
  });

  it('ends a career in prison when a case is lost, and the game accepts and keeps such a career', () => {
    const c = career();
    c.career!.graft = 30;
    expect(isValidCampaign(structuredClone(c), world)).toBe(true);
    endCareer(c, 'jailed');
    expect(c.career!.ending?.kind).toBe('jailed');
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    expect(STRINGS.en['ending.jailed' as never]).toBeDefined();
    expect(STRINGS.ms['ending.jailed' as never]).toBeDefined();
  });
});
