import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { briefingOf, SNAP_EVERY } from './briefing';
import { startCareer, termWeek } from './career';
import { remindersOf } from './reminders';
import { addScene } from './diplomacy';
import { isValidCampaign } from './validate';
import type { Campaign } from './types';

const [PS, , PT] = PARTY_IDS.map((_, i) => i);
const world = getWorld('career')!;
const career = (player = PS): Campaign => { const c = startCareer(world, { player, difficulty: 'normal', seed: 5 }); c.inbox = []; c.career!.appointments = []; return c; };
const weeks = (c: Campaign, n: number) => { for (let w = 0; w < n; w++) { c.inbox = []; termWeek(world, c); } };

describe('the briefing', () => {
  it('keeps two snapshots a month apart, no more', () => {
    const c = career();
    weeks(c, SNAP_EVERY * 5);
    const snaps = c.career!.snaps!;
    expect(snaps).toHaveLength(2);
    expect(snaps[1].week - snaps[0].week).toBeGreaterThanOrEqual(SNAP_EVERY);
  });

  it('says only what moved: nothing is invented, and what is said is what the figures show', () => {
    const c = career();
    weeks(c, SNAP_EVERY * 2);
    const k = c.career!;
    expect(briefingOf(world, c)!.changed.every((x) => Math.abs(x.to - x.from) > 0)).toBe(true);
    k.snaps = [{ ...k.snaps![0], inflation: 2.0, debt: 60, unity: 80 }, k.snaps![1]];
    k.economy.inflation = 3.4; k.economy.debt = 64; c.parties[PS]!.unity = 70;
    const changed = briefingOf(world, c)!.changed;
    const by = Object.fromEntries(changed.map((x) => [x.id, x]));
    expect(by.inflation).toMatchObject({ from: 2.0, to: 3.4, better: false });
    expect(by.unity).toMatchObject({ from: 80, to: 70, better: false });
    expect(changed.length).toBeLessThanOrEqual(4);
    // The debt, when it is all that moved, is said.
    const alone = career(); weeks(alone, SNAP_EVERY * 2);
    alone.career!.snaps = alone.career!.snaps!.map((x) => ({ ...x, debt: 60, unity: alone.parties[PS]!.unity, credibility: alone.career!.credibility, stability: alone.career!.government.stability, trust: alone.career!.government.trust, funds: alone.parties[PS]!.funds, growth: alone.career!.economy.growth, inflation: alone.career!.economy.inflation, jobless: alone.career!.economy.jobless, treasury: alone.career!.treasury ?? 0 }));
    alone.career!.economy.debt = 64;
    expect(briefingOf(world, alone)!.changed).toEqual([expect.objectContaining({ id: 'debt', from: 60, to: 64, better: false })]);
    // A move too small to mention is left out.
    k.snaps = [{ ...k.snaps![0], inflation: k.economy.inflation - 0.1 }, k.snaps![1]];
    expect(briefingOf(world, c)!.changed.find((x) => x.id === 'inflation')).toBeUndefined();
  });

  it('puts a decision waiting, and an urgent matter, under what needs the player, apart from what is only worth watching', () => {
    const c = career();
    weeks(c, 6);
    addScene(c, { kind: 'event', from: null, event: 'flood' });
    c.career!.appointments = [{ portfolio: 'health', options: [] }];
    c.career!.economy.debt = 82;
    const b = briefingOf(world, c)!;
    expect(b.attention.map((x) => x.id)).toEqual(expect.arrayContaining(['decision', 'appoint']));
    expect(b.attention.every((x) => x.level === 'urgent')).toBe(true);
    expect(b.watch.map((x) => x.id)).toContain('debt');
    expect(b.watch.every((x) => x.level !== 'urgent')).toBe(true);
  });

  it('suggests what to do only where the player could do it, and is quiet when there is nothing to say', () => {
    const c = career();
    c.career!.economy.inflation = 4.4;
    expect(briefingOf(world, c)!.can.map((x) => x.id)).toContain('canPrices');
    const opposition = career(PT);
    opposition.career!.economy.inflation = 4.4;
    expect(briefingOf(world, opposition)!.can.map((x) => x.id)).not.toContain('canPrices');
    expect(briefingOf(world, { ...c, phase: 'campaign' } as Campaign)).toBeNull();
  });

  it('has words in both languages for everything it can say', () => {
    const c = career();
    const ids = new Set<string>();
    for (const w of [4, 30, 60, 150, 240]) {
      const d = career();
      d.career!.week = w; d.career!.appointments = [{ portfolio: 'health', options: [] }]; d.career!.economy.debt = 97; d.career!.economy.inflation = 5; d.career!.conduct = { week: w, ok: [true, false, false, false, false], delta: -1 }; d.career!.launched = false;
      d.parties[PS]!.funds = 1; d.parties[PS]!.unity = 40; d.career!.missions = { active: [], offers: [{ id: 1, kind: 'credibility', main: false, tier: 1, need: 70, ttl: 3 } as never], seq: 1, done: [], unseen: [] };
      const b = briefingOf(world, d)!;
      b.attention.forEach((x) => ids.add(`brief.a.${x.id}`));
      b.watch.forEach((x) => ids.add(`brief.w.${x.id}`));
      b.can.forEach((x) => ids.add(`brief.can.${x.id}`));
    }
    for (const r of remindersOf(world, c)) ids.add(`brief.w.${r.id}`);
    for (const id of ['unity', 'credibility', 'stability', 'trust', 'funds', 'growth', 'inflation', 'jobless', 'debt', 'treasury']) ids.add(`brief.c.${id}`);
    for (const key of ['brief.title', 'brief.quiet', 'brief.attention', 'brief.changed', 'brief.watch', 'brief.can', 'brief.a.decision']) ids.add(key);
    for (const key of ids) {
      expect(STRINGS.en[key as StringKey], `en ${key}`).toBeTruthy();
      expect(STRINGS.ms[key as StringKey], `ms ${key}`).toBeTruthy();
    }
  });

  it('is saved with the game, and a game saved before it still loads', () => {
    const c = career();
    weeks(c, SNAP_EVERY * 3);
    const copy = JSON.parse(JSON.stringify(c));
    expect(isValidCampaign(copy, world)).toBe(true);
    expect(copy.career.snaps).toHaveLength(2);
    delete copy.career.snaps; delete copy.career.eventWeeks;
    expect(isValidCampaign(copy, world)).toBe(true);
    const old = copy as Campaign;
    expect(briefingOf(world, old)!.changed).toEqual([]);
  });
});
