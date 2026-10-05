import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { Rng } from '../rng';
import { BLOC_IDS, PARTY_IDS } from '../types';
import { answerEvent, nextTerm, skipAhead, startCareer } from './career';
import { eligible, EVENTS, resolveEvent } from './events';
import { GOVERNING_EVENTS } from './eventList3';
import { endDay } from './formation';
import { answersFor, nationOf, nationTargets, nationWeek, shiftNation, START_NATION } from './nation';
import { closeNight, endWeek } from './turn';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const [PS, , PT] = PARTY_IDS.map((_, i) => i);
const base = getWorld('career')!;
const career = (player = PS, seed = 5): Campaign => startCareer(base, { player, difficulty: 'normal', seed });
const weeks = (c: Campaign, n: number, seed = 1) => { const rng = new Rng(seed); for (let i = 0; i < n; i++) nationWeek(c, rng); };

describe('the state of the country', () => {
  it('starts in the middle, is set for a game saved without it, and stays between 0 and 100', () => {
    const c = career();
    expect(nationOf(c.career!)).toEqual(START_NATION);
    delete c.career!.nation;
    expect(nationOf(c.career!)).toEqual(START_NATION);
    shiftNation(c.career!, { health: 500, education: -500, standing: 3 });
    expect(c.career!.nation).toEqual({ health: 100, education: 0, standing: 58 });
  });

  it('follows the budget: boosting the health line lifts health, cutting it lowers it, and the others are not touched', () => {
    const up = career(), down = career();
    up.career!.tabled.lines.health = 1;
    down.career!.tabled.lines.health = -1;
    expect(nationTargets(up.career!).health).toBeGreaterThan(nationTargets(down.career!).health + 20);
    expect(nationTargets(up.career!).education).toBe(nationTargets(down.career!).education);
    weeks(up, 150); weeks(down, 150);
    expect(nationOf(up.career!).health).toBeGreaterThan(60);
    expect(nationOf(down.career!).health).toBeLessThan(50);
  });

  it('is helped by a capable minister and by a steady, believed government, and hurt by heavy debt', () => {
    const c = career();
    const k = c.career!;
    const minister = k.cabinet.find((m) => m.portfolio === 'health')!;
    minister.skill = 1;
    const here = nationTargets(k);
    minister.skill = 5;
    expect(nationTargets(k).health).toBeGreaterThan(here.health);
    k.government.stability = 90; k.credibility = 95;
    expect(nationTargets(k).standing).toBeGreaterThan(here.standing);
    k.economy.debt = 110;
    const heavy = nationTargets(k);
    expect(heavy.standing).toBeLessThan(nationTargets({ ...k, economy: { ...k.economy, debt: 60 } }).standing);
    expect(heavy.health).toBeLessThan(nationTargets({ ...k, economy: { ...k.economy, debt: 60 } }).health);
  });

  it('is answered for by those who govern: voters reward the prime minister when it is good and punish them when it is bad', () => {
    const good = career(), bad = career();
    good.career!.nation = { health: 85, education: 85, standing: 85 };
    bad.career!.nation = { health: 20, education: 20, standing: 20 };
    for (const c of [good, bad]) { c.career!.tabled.lines = { aid: 0, health: 0, education: 0, rural: 0, civil: 0 }; }
    const before = (c: Campaign) => BLOC_IDS.map((_, b) => c.career!.mood[b][PS]);
    const g0 = before(good), b0 = before(bad);
    weeks(good, 1); weeks(bad, 1);
    const seniors = BLOC_IDS.indexOf('seniors');
    expect(good.career!.mood[seniors][PS]).toBeGreaterThan(g0[seniors]);
    expect(bad.career!.mood[seniors][PS]).toBeLessThan(b0[seniors]);
    // The opposition is not blamed or credited for what it does not run.
    expect(good.career!.mood[seniors][PT]).toBe(0);
    expect(answersFor(good)).toBe(true);
    expect(answersFor(career(PT))).toBe(false);
  });
});

describe('the challenges of governing', () => {
  const ids = Object.keys(GOVERNING_EVENTS);

  it('are sixteen events, all in both languages, and a follow-up that is only ever scheduled', () => {
    expect(ids).toHaveLength(16);
    for (const id of ids) { expect(EVENTS[id]).toBeDefined(); expect(EVENTS_EN[id], id).toBeDefined(); expect(EVENTS_MS[id], id).toBeDefined(); }
    expect(EVENTS.mediationAward.weight).toBe(0);
    expect(EVENTS.seaIncident.choices[2].then).toEqual({ event: 'mediationAward', after: 8 });
  });

  it('come to those in government, and the ones tied to a figure come only when it is low', () => {
    const pm = career(PS), opp = career(PT);
    expect(eligible(pm, 'summitHost')).toBe(true);
    expect(eligible(opp, 'summitHost')).toBe(false);
    expect(eligible(pm, 'twoPowers')).toBe(true); // for the head of government
    pm.career!.nation = { health: 70, education: 70, standing: 70 };
    expect(eligible(pm, 'wardsFull')).toBe(false);
    expect(eligible(pm, 'examResults')).toBe(false);
    pm.career!.nation = { health: 30, education: 30, standing: 70 };
    expect(eligible(pm, 'wardsFull')).toBe(true);
    expect(eligible(pm, 'examResults')).toBe(true);
    pm.career!.economy.debt = 50;
    expect(eligible(pm, 'ratingsWarning')).toBe(false);
    pm.career!.economy.debt = 80;
    expect(eligible(pm, 'ratingsWarning')).toBe(true);
  });

  it('every choice of every one can be taken, keeps the figures between 0 and 100, and reports what happened', () => {
    for (const id of ids) {
      EVENTS[id].choices.forEach((choice, i) => {
        for (const roll of choice.gamble ? [1, 2, 3, 4, 5, 6] : [1]) {
          const c = career(PS, roll);
          const before = c.news.length;
          resolveEvent(base, c, { id: 1, kind: 'event', from: null, event: id }, i);
          const n = nationOf(c.career!);
          for (const v of Object.values(n)) { expect(v, `${id} ${i}`).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(100); }
          expect(c.news.length, `${id} ${i}`).toBe(before + 1);
          expect(c.news.at(-1)!.key).toMatch(new RegExp(`^event\\.${id}\\.r${i}[wl]?$`));
        }
      });
    }
  });

  it('move the figures the way their text promises', () => {
    const c = career();
    resolveEvent(base, c, { id: 1, kind: 'event', from: null, event: 'wardsFull' }, 0);
    expect(nationOf(c.career!).health).toBe(65);
    resolveEvent(base, c, { id: 2, kind: 'event', from: null, event: 'examResults' }, 2);
    expect(nationOf(c.career!).education).toBe(52);
    resolveEvent(base, c, { id: 3, kind: 'event', from: null, event: 'summitHost' }, 2);
    expect(nationOf(c.career!).standing).toBe(50);
    resolveEvent(base, c, { id: 4, kind: 'event', from: null, event: 'seaIncident' }, 2);
    expect(c.career!.queue).toEqual([{ event: 'mediationAward', week: c.career!.week + 8 }]);
  });

  it('are met across a whole term by a prime minister, and the country’s figures survive an election and a save', () => {
    const c = career(PS, 7);
    c.career!.nation = { health: 35, education: 35, standing: 55 };
    c.career!.tabled.lines.health = -1;
    const seen = new Set<string>();
    for (let guard = 0; c.phase === 'term' && guard < 200; guard++) {
      skipAhead(base, c, 400);
      while (c.inbox.length) { const scene = c.inbox.shift()!; if (scene.event) seen.add(scene.event); answerEvent(base, c, scene, 0); }
    }
    expect([...seen].some((id) => ids.includes(id))).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
    const saved = JSON.parse(JSON.stringify(c));
    delete saved.career.nation;
    expect(isValidCampaign(saved, base)).toBe(true);
    while (c.phase === 'campaign') endWeek(base, c);
    closeNight(base, c);
    for (let d = 0; d < 10 && c.phase === 'formation'; d++) endDay(base, c);
    const figures = { ...nationOf(c.career!) };
    expect(nextTerm(base, c)).toBe(true);
    expect(c.career!.nation).toEqual(figures);
  }, 60_000);
});
