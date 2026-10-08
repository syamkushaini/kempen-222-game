import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { startCareer } from './career';
import { COMMITTEE, canInquire, committeeWait, inquiryOdds, openInquiry } from './committee';
import { COUNTRY_ONLY, EVENTS, resolveEvent, rollEvent } from './events';
import { cabinetWeek, dismiss } from './office';
import { Rng } from '../rng';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const BP = PARTY_IDS.indexOf('bp');
const world = getWorld('career')!;
const career = (seed = 5): Campaign => {
  const c = startCareer(world, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  c.parties[PS]!.funds = scaled(world, 5_000_000);
  return c;
};
const government = (c: Campaign) => { c.career!.government.pm = PS; c.career!.limited = false; };
const opposition = (c: Campaign) => { c.career!.government.pm = BP; c.career!.government.partners = []; };

describe('a minister in a scandal', () => {
  const withFixer = (seed: number) => {
    const c = career();
    government(c);
    const k = c.career!;
    const m = k.cabinet.find((x) => x.party === PS)!;
    m.trait = 'fixer';
    delete m.done;
    delete m.acting;
    // Make the chance certain by tying the rng to a roll that always comes up.
    return { c, k, m, rng: { next: () => 0, int: () => 0 } as unknown as Rng, seed };
  };
  it('goes to the player as a press conference, not an automatic resignation', () => {
    const { c, k, m, rng } = withFixer(1);
    const cred = k.credibility;
    cabinetWeek(c, rng);
    expect(m.done).toBe(true);
    expect(k.scandal).toBe(m.portfolio);
    expect(c.inbox.some((s) => s.event === 'ministerScandal')).toBe(true);
    // Nothing has been paid until the player answers.
    expect(k.credibility).toBe(cred);
    expect(m.acting).toBeUndefined();
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
  it('is dealt with the old way if something else is already waiting', () => {
    const { c, k, m, rng } = withFixer(1);
    c.inbox.push({ id: 99, kind: 'event', from: null, event: 'flood' });
    const cred = k.credibility;
    cabinetWeek(c, rng);
    expect(k.scandal).toBeUndefined();
    expect(k.credibility).toBe(cred - 8);
    expect(m.acting).toBe(true);
  });
  it('is settled by what the player says: sack, suspend, or stand by them and hope', () => {
    const answer = (choice: number, seed = 1) => {
      const { c, k, m, rng } = withFixer(seed);
      cabinetWeek(c, rng);
      const scene = c.inbox.find((s) => s.event === 'ministerScandal')!;
      const cred = k.credibility;
      resolveEvent(world, c, scene, choice);
      return { c, k, m, change: k.credibility - cred };
    };
    const sacked = answer(0);
    expect(sacked.m.acting).toBe(true);
    expect(sacked.k.scandal).toBeUndefined();
    expect(sacked.change).toBe(-3);
    const suspended = answer(2);
    expect(suspended.m.acting).toBe(true);
    expect(suspended.change).toBe(-2);
    let kept = 0, lost = 0;
    for (let seed = 1; seed <= 24; seed++) {
      const r = answer(1);
      r.c.rng = seed * 7919;
      const again = (() => { const x = withFixer(seed); x.c.rng = seed * 7919; cabinetWeek(x.c, x.rng); const sc = x.c.inbox.find((s) => s.event === 'ministerScandal')!; resolveEvent(world, x.c, sc, 1); return x; })();
      if (again.m.acting) lost++; else kept++;
      expect(again.k.scandal).toBeUndefined();
    }
    expect(kept).toBeGreaterThan(0);
    expect(lost).toBeGreaterThan(0);
    void dismiss;
  });
});

describe('other nations and the year’s seasons', () => {
  it('have words in both languages for every option and result', () => {
    for (const id of ['ministerScandal', 'borderStandoff', 'sanctionsThreat', 'strandedAbroad', 'monsoon', 'haze', 'priceSurge']) {
      const def = EVENTS[id];
      expect(def, id).toBeDefined();
      for (const text of [EVENTS_EN[id], EVENTS_MS[id]]) {
        expect(text, id).toBeDefined();
        expect(text.options, id).toHaveLength(def.choices.length);
        expect(text.results, id).toHaveLength(def.choices.length);
        def.choices.forEach((choice, i) => expect(Array.isArray(text.results[i]), `${id} ${i}`).toBe(!!choice.gamble));
      }
    }
  });
  it('keep the country’s quarrels out of a state’s own career', () => {
    for (const id of ['borderStandoff', 'sanctionsThreat', 'strandedAbroad', 'haze']) expect(COUNTRY_ONLY.has(id), id).toBe(true);
  });
  it('come round every year: the monsoon, the haze and the price of food', () => {
    for (const [id, week] of [['monsoon', 47], ['haze', 31], ['priceSurge', 20]] as const) {
      expect(EVENTS[id].yearly).toBe(week);
      expect(EVENTS[id].weight).toBe(0);
      expect(EVENTS[id].role).toBe('any');
    }
    const c = career();
    government(c);
    const k = c.career!;
    const seen: string[] = [];
    for (const year of [0, 1, 2]) {
      for (const [id, week] of [['priceSurge', 20], ['haze', 31], ['monsoon', 47]] as const) {
        k.week = year * 52 + week;
        c.inbox = [];
        k.quietUntil = 0;
        rollEvent(c, new Rng(1));
        const e = c.inbox.find((s) => s.event === id);
        if (e) seen.push(`${year}:${id}`);
      }
    }
    expect(seen).toEqual(['0:priceSurge', '0:haze', '0:monsoon', '1:priceSurge', '1:haze', '1:monsoon', '2:priceSurge', '2:haze', '2:monsoon']);
  });
  it('are answered by the opposition too', () => {
    const c = career();
    opposition(c);
    c.career!.week = 47;
    c.career!.quietUntil = 0;
    rollEvent(c, new Rng(1));
    expect(c.inbox.some((s) => s.event === 'monsoon')).toBe(true);
  });
});

describe('a select committee', () => {
  it('is for the opposition only, with a dossier, money, and a gap between sittings', () => {
    const c = career();
    government(c);
    expect(canInquire(world, c)).toEqual({ ok: false, reason: 'seat' });
    opposition(c);
    const k = c.career!;
    k.dossier = 10;
    expect(canInquire(world, c)).toEqual({ ok: false, reason: 'dossier' });
    k.dossier = 80;
    c.parties[PS]!.funds = 0;
    expect(canInquire(world, c)).toEqual({ ok: false, reason: 'funds' });
    c.parties[PS]!.funds = scaled(world, 5_000_000);
    expect(canInquire(world, c).ok).toBe(true);
    expect(openInquiry(world, c)).toBe(true);
    expect(k.dossier).toBe(80 - COMMITTEE.spent);
    expect(canInquire(world, c)).toEqual({ ok: false, reason: 'wait' });
    expect(committeeWait(c)).toBe(COMMITTEE.every);
    k.week += COMMITTEE.every;
    expect(committeeWait(c)).toBe(0);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
  it('is likelier to find something with a thick dossier and a believed leader', () => {
    const c = career();
    opposition(c);
    c.career!.dossier = 30;
    c.career!.credibility = 40;
    const thin = inquiryOdds(c);
    c.career!.dossier = 100;
    c.career!.credibility = 90;
    expect(inquiryOdds(c)).toBeGreaterThan(thin);
  });
  it('costs the government trust when it finds something and the opposition credibility when it does not', () => {
    let found = 0, empty = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const c = structuredClone(career());
      c.rng = seed * 31337;
      opposition(c);
      const k = c.career!;
      k.dossier = 60;
      const [trust, cred] = [k.government.trust, k.credibility];
      openInquiry(world, c);
      if (c.news.at(-1)!.key === 'news.committee.found') { found++; expect(k.government.trust).toBe(trust - COMMITTEE.trust); expect(k.credibility).toBe(cred + COMMITTEE.won); }
      else { empty++; expect(k.credibility).toBe(cred - COMMITTEE.lost); expect(k.government.trust).toBe(trust); }
    }
    expect(found).toBeGreaterThan(3);
    expect(empty).toBeGreaterThan(3);
  });
});

describe('strings', () => {
  it('exist in both languages', () => {
    const keys = ['committee.title', 'committee.desc', 'committee.state', 'committee.open', 'committee.no.wait', 'committee.no.dossier', 'committee.no.funds', 'news.committee.found', 'news.committee.empty'] as StringKey[];
    for (const key of keys) { expect(STRINGS.en[key], key).toBeTruthy(); expect(STRINGS.ms[key], key).toBeTruthy(); }
  });
});
