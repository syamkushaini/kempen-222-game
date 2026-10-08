import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { OPPORTUNISM, opportunism, palaceRefusal, startCareer } from './career';
import { COUNTRY_ONLY, EVENTS, STATE_ONLY, eligible } from './events';
import { PRIDE, applyPride, borneoShare, isBornean, prideIn } from './pride';
import type { Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps');
const GBK = PARTY_IDS.indexOf('gbk');
const BP = PARTY_IDS.indexOf('bp');
const world = getWorld('career')!;
const career = (seed = 5): Campaign => {
  const c = startCareer(world, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  c.parties[PS]!.funds = scaled(world, 5_000_000);
  return c;
};

describe('Sabah for the people of Sabah', () => {
  it('lifts the parties of Borneo, and charges the others, only in Borneo, more where the seat is Borneo’s', () => {
    expect(isBornean(GBK)).toBe(true);
    expect(isBornean(PS)).toBe(false);
    const sabah = world.seats.map((s, i) => ({ s, i })).filter(({ s }) => s.state === 'sabah' || s.state === 'sarawak');
    const peninsula = world.seats.findIndex((s) => s.state === 'perak');
    expect(sabah.length).toBeGreaterThan(20);
    expect(prideIn(world, peninsula)).toEqual({ local: 0, away: 0 });
    const heavy = sabah.sort((a, b) => borneoShare(b.s.blocs) - borneoShare(a.s.blocs));
    const first = prideIn(world, heavy[0].i), last = prideIn(world, heavy[heavy.length - 1].i);
    expect(first.local).toBeGreaterThanOrEqual(last.local);
    expect(first.local).toBeLessThanOrEqual(PRIDE.local * 1.5);
    expect(last.local).toBeGreaterThanOrEqual(PRIDE.local * PRIDE.floor);
  });
  it('is added to the seats a party stands in when a campaign opens', () => {
    const c = career();
    const i = world.seats.findIndex((s, n) => s.state === 'sarawak' && world.baseline.contesting[n][GBK] && world.baseline.contesting[n][PS]);
    expect(i).toBeGreaterThanOrEqual(0);
    const id = world.seats[i].id;
    const before = [GBK, PS, BP].map((p) => c.drift.support.seat[id]?.[p] ?? 0);
    applyPride(world, c);
    const after = [GBK, PS, BP].map((p) => c.drift.support.seat[id]![p]);
    const pride = prideIn(world, i);
    expect(after[0] - before[0]).toBeCloseTo(pride.local, 9);
    expect(after[1] - before[1]).toBeCloseTo(-pride.away, 9);
    // And not a thing in the Peninsula.
    const p = world.seats.findIndex((s) => s.state === 'perak');
    expect(c.drift.support.seat[world.seats[p].id]).toEqual(career().drift.support.seat[world.seats[p].id]);
  });
});

describe('going to the country early', () => {
  it('costs a steady government more the earlier it goes, and nothing near the end or when in trouble', () => {
    const c = career();
    const k = c.career!;
    k.government.stability = 80;
    k.week = 156;
    const early = opportunism(c);
    expect(early).toBeGreaterThan(0);
    expect(early).toBeLessThanOrEqual(OPPORTUNISM.max);
    k.week = 156 + 52;
    expect(opportunism(c)).toBeLessThan(early);
    k.week = k.length - OPPORTUNISM.grace;
    expect(opportunism(c)).toBe(0);
    k.week = 156;
    k.government.stability = 40;
    expect(opportunism(c)).toBeCloseTo(early / 2, 9);
    k.government.stability = 20;
    expect(opportunism(c)).toBe(0);
  });
  it('is likelier to be refused by a state’s ruler than by the Palace', () => {
    const c = career();
    const country = palaceRefusal(c);
    c.scenario = 'career:perak';
    expect(palaceRefusal(c)).toBeGreaterThanOrEqual(country);
    expect(palaceRefusal(c)).toBeLessThanOrEqual(0.6);
  });
});

describe('the federation in chapters', () => {
  it('has three chapters in each of two stories, each with words in both languages, and the last without a follow-up', () => {
    const chains = [['claimsTalks', 'claimsStalled', 'claimsVerdict'], ['fedGrantCut', 'fedTalks', 'fedSettlement']];
    for (const chain of chains) {
      chain.forEach((id, n) => {
        const def = EVENTS[id];
        expect(def, id).toBeDefined();
        for (const text of [EVENTS_EN[id], EVENTS_MS[id]]) {
          expect(text.options, id).toHaveLength(def.choices.length);
          expect(text.results, id).toHaveLength(def.choices.length);
          def.choices.forEach((choice, i) => expect(Array.isArray(text.results[i]), `${id} ${i}`).toBe(!!choice.gamble));
        }
        const next = def.choices.map((x) => x.then?.event).filter(Boolean);
        if (n < 2) { expect(next.length, id).toBeGreaterThan(0); for (const e of next) expect(chain[n + 1], id).toBe(e); } else expect(next, id).toHaveLength(0);
        if (n > 0) expect(def.weight, id).toBe(0);
      });
    }
  });
  it('tells the country’s story to a country and a state’s story to a state, and not the other way about', () => {
    for (const id of ['claimsTalks', 'cityHousing', 'flashFloods', 'mayorRow']) expect(COUNTRY_ONLY.has(id), id).toBe(true);
    for (const id of ['fedGrantCut', 'fedTalks', 'fedSettlement']) expect(STATE_ONLY.has(id), id).toBe(true);
    const c = career();
    c.career!.government.pm = PS;
    c.career!.fired = [];
    expect(eligible(c, 'claimsTalks')).toBe(true);
    expect(eligible(c, 'fedGrantCut')).toBe(false);
    c.scenario = 'career:perak';
    expect(eligible(c, 'claimsTalks')).toBe(false);
    expect(eligible(c, 'fedGrantCut')).toBe(true);
  });
  it('gives the capital its own troubles, with words in both languages', () => {
    for (const id of ['cityHousing', 'flashFloods', 'mayorRow']) {
      expect(EVENTS[id].weight).toBeGreaterThan(0);
      expect(EVENTS_EN[id].title).toBeTruthy();
      expect(EVENTS_MS[id].title).toBeTruthy();
    }
  });
});

describe('strings', () => {
  it('exist in both languages', () => {
    expect(STRINGS.en['news.dissolve.opportunist' as StringKey]).toBeTruthy();
    expect(STRINGS.ms['news.dissolve.opportunist' as StringKey]).toBeTruthy();
  });
});
