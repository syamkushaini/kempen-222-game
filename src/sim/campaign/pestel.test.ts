import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { PESTEL_GROUPS, PESTEL_KEYS, START_PESTEL, economicScores, groupScore, pestelAnswers, pestelOf, pestelScores, pestelTargets, pestelWeek, shiftPestel } from './pestel';
import { isValidCampaign } from './validate';
import { playable } from './field';
import type { Campaign } from './types';

const world = getWorld('career')!;
const PT = PARTY_IDS.indexOf('pt');
const career = (player = PARTY_IDS.indexOf('ps')): Campaign => startCareer(world, { player, difficulty: 'normal', seed: 5 });
const post = (c: Campaign, id: string) => c.career!.cabinet.find((m) => m.portfolio === id)!;

describe('PESTEL', () => {
  it('starts every new meter at a fair level, and sets them on a game that did not have them', () => {
    const k = career().career!;
    expect(pestelOf(k)).toEqual(START_PESTEL);
    delete k.pestel;
    expect(pestelOf(k)).toEqual(START_PESTEL);
  });

  it('is moved by the ministers whose posts matter to each meter, and by the laws on the books', () => {
    const c = career();
    const k = c.career!;
    const base = pestelTargets(k);
    post(c, 'digital').skill = 5; post(c, 'science').skill = 5;
    expect(pestelTargets(k).tech).toBeGreaterThan(base.tech);
    post(c, 'environment').skill = 5;
    expect(pestelTargets(k).environment).toBeGreaterThan(base.environment);
    post(c, 'law').skill = 1;
    expect(pestelTargets(k).law).toBeLessThan(base.law);
    const before = pestelTargets(k).law;
    k.laws = ['graftCommission'];
    expect(pestelTargets(k).law).toBeGreaterThan(before);
    // Leaning on state money and donors costs the rule of law.
    const clean = pestelTargets(k).law;
    k.orders.state = 3; k.orders.donors = 3;
    expect(pestelTargets(k).law).toBeLessThan(clean);
    for (const key of PESTEL_KEYS) { expect(pestelTargets(k)[key]).toBeGreaterThanOrEqual(15); expect(pestelTargets(k)[key]).toBeLessThanOrEqual(90); }
  });

  it('drifts towards its target a little each week, and voters feel what is above or below where it began', () => {
    const c = career();
    const k = c.career!;
    post(c, 'digital').skill = 5; post(c, 'science').skill = 5; post(c, 'comms').skill = 5; post(c, 'highered').skill = 5;
    k.tabled.lines.education = 1;
    const rng = new Rng(3);
    const start = pestelOf(k).tech;
    const mood = k.mood[0].slice();
    for (let w = 0; w < 200; w++) pestelWeek(c, rng);
    expect(pestelOf(k).tech).toBeGreaterThan(start + 3);
    expect(pestelOf(k).tech).toBeLessThanOrEqual(pestelTargets(k).tech + 3);
    // The party in office is credited.
    expect(k.mood.flat().reduce((a, b) => a + b, 0)).not.toBe(mood.reduce((a, b) => a + b, 0));
  });

  it('is shifted by an event, kept between 0 and 100', () => {
    const k = career().career!;
    shiftPestel(k, { environment: -30, law: 80 });
    expect(pestelOf(k).environment).toBe(25);
    expect(pestelOf(k).law).toBe(100);
    shiftPestel(k, { environment: -90 });
    expect(pestelOf(k).environment).toBe(0);
  });

  it('reads the economy as scores from 0 to 100, and every group has a mean', () => {
    const k = career().career!;
    const good = economicScores({ ...k.economy, growth: 6, inflation: 1.5, jobless: 2.5, debt: 30 });
    expect(good).toEqual({ growth: 74, inflation: 100, jobless: 100, debt: 100 });
    const bad = economicScores({ ...k.economy, growth: -2, inflation: 9, jobless: 10, debt: 120 });
    for (const v of Object.values(bad)) expect(v).toBeLessThan(30);
    const scores = pestelScores(k);
    for (const g of PESTEL_GROUPS) {
      for (const m of g.meters) expect(Number.isFinite(scores[m]), m).toBe(true);
      expect(groupScore(k, g.id)).toBeGreaterThanOrEqual(0);
      expect(groupScore(k, g.id)).toBeLessThanOrEqual(100);
    }
  });

  it('is answered for by the government and not by the opposition, and works in a state career too', () => {
    expect(pestelAnswers(career())).toBe(true);
    expect(pestelAnswers(career(PT))).toBe(false);
    const w = getWorld('career:perak')!;
    const c = startCareer(w, { player: playable(w)[0], difficulty: 'normal', seed: 5 });
    pestelWeek(c, new Rng(1));
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), w)).toBe(true);
  });

  it('has words in both languages for every group, meter and what moves it', () => {
    for (const lang of ['en', 'ms'] as const) {
      for (const key of ['pestel.title', 'pestel.note.gov', 'pestel.note.opp']) expect(STRINGS[lang][key as StringKey], `${lang} ${key}`).toBeTruthy();
      for (const g of PESTEL_GROUPS) {
        for (const suffix of ['', '.letter', '.desc']) expect(STRINGS[lang][`pestel.group.${g.id}${suffix}` as StringKey], `${lang} ${g.id}${suffix}`).toBeTruthy();
        for (const m of g.meters) expect(STRINGS[lang][`pestel.${m}` as StringKey], `${lang} ${m}`).toBeTruthy();
      }
    }
  });
});
