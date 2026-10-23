import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { Rng } from '../rng';
import { BLOC_IDS, PARTY_IDS } from '../types';
import { startCareer } from './career';
import {
  BORDER_SEA, START_DEFENCE, defenceOf, defenceShown, defenceTargets, defenceWeek, forceWeak, isFederal, procurementMult, readinessRate, shiftDefence,
} from './defence';
import { EVENTS, applyEffects, eligible, resolveEvent, worsen } from './events';
import { nationTargets } from './nation';
import { setBudget, tableBudget } from './office';
import { playable } from './field';
import { groupScore, pestelScores } from './pestel';
import { govBooks } from './treasury';
import { publicFinance } from './gdp';
import { isValidCampaign } from './validate';
import type { Campaign } from './types';

const world = getWorld('career')!;
const PT = PARTY_IDS.indexOf('pt');
const career = (player = PARTY_IDS.indexOf('ps')): Campaign => startCareer(world, { player, difficulty: 'normal', seed: 5 });
const post = (c: Campaign) => c.career!.cabinet.find((m) => m.portfolio === 'defence')!;
const run = (c: Campaign, weeks: number, seed = 3) => { const rng = new Rng(seed); for (let w = 0; w < weeks; w++) defenceWeek(c, rng); };

describe('defence', () => {
  it('starts at fair levels, and sets them on a game that did not have them', () => {
    const k = career().career!;
    expect(k.defence).toBeUndefined();
    expect(defenceOf(k)).toEqual(START_DEFENCE);
    delete k.defence;
    expect(defenceOf(k)).toEqual(START_DEFENCE);
  });

  it('belongs to the federal head of government alone', () => {
    const c = career();
    expect(isFederal(c.scenario)).toBe(true);
    expect(defenceShown(c)).toBe(true);
    expect(defenceShown(career(PT))).toBe(false);
    const w = getWorld('career:perak')!;
    const state = startCareer(w, { player: playable(w)[0], difficulty: 'normal', seed: 5 });
    expect(defenceShown(state)).toBe(false);
    expect(setBudget(state, { line: 'defence', value: 1 })).toBe(false);
    expect(setBudget(career(PT), { line: 'defence', value: 1 })).toBe(false);
    expect(setBudget(c, { line: 'defence', value: 1 })).toBe(true);
    // A state keeps no armed forces: nothing moves, nothing is kept, and its books carry no such line.
    shiftDefence(state, { readiness: 30 });
    defenceWeek(state, new Rng(1));
    expect(state.career!.defence).toBeUndefined();
    expect(publicFinance(w, state.career!).lines.defence).toBeUndefined();
    expect((govBooks(w, state)?.spend ?? []).some((x) => x.id === 'defence')).toBe(false);
    expect(publicFinance(world, c.career!).lines.defence).toBeGreaterThan(0);
  });

  it('is raised by spending and lowered by cuts, readiness and influence both', () => {
    const k = career().career!;
    const hold = defenceTargets(k);
    k.tabled.lines.defence = 1;
    const boost = defenceTargets(k);
    expect(boost.readiness).toBeGreaterThan(hold.readiness);
    expect(boost.influence).toBeGreaterThan(hold.influence);
    k.tabled.lines.defence = -1;
    const cut = defenceTargets(k);
    expect(cut.readiness).toBeLessThan(hold.readiness);
    expect(cut.influence).toBeLessThan(hold.influence);
  });

  it('is slowed or sped by the minister, and a capable one is paid for in readiness', () => {
    const c = career();
    const k = c.career!;
    post(c).skill = 5;
    expect(readinessRate(k, true)).toBeGreaterThan(readinessRate(k, false));
    const able = defenceTargets(k).readiness;
    post(c).skill = 1;
    expect(readinessRate(k, true)).toBeLessThan(readinessRate(k, false));
    expect(defenceTargets(k).readiness).toBeLessThan(able);
    // Starved of money, a poor minister lets it fall faster than a good one.
    const fall = (skill: number) => {
      const d = career();
      post(d).skill = skill;
      d.career!.tabled.lines.defence = -1;
      run(d, 150);
      return defenceOf(d.career!).readiness;
    };
    expect(fall(5)).toBeGreaterThan(fall(1));
    // And a boost climbs faster with a good one.
    const climb = (skill: number) => {
      const d = career();
      post(d).skill = skill;
      d.career!.tabled.lines.defence = 1;
      run(d, 60);
      return defenceOf(d.career!).readiness;
    };
    expect(climb(5)).toBeGreaterThan(climb(1));
  });

  it('drifts towards its target each week, between 0 and 100', () => {
    const c = career();
    c.career!.tabled.lines.defence = 1;
    run(c, 200);
    const d = defenceOf(c.career!);
    expect(d.readiness).toBeGreaterThan(START_DEFENCE.readiness + 5);
    for (const v of [d.readiness, d.influence]) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(100); }
    shiftDefence(c, { readiness: 500, influence: -500 });
    expect(defenceOf(c.career!)).toEqual({ readiness: 100, influence: 0 });
  });

  it('a country whose armed forces are weak is thought less of abroad', () => {
    const k = career().career!;
    const base = nationTargets(k).standing;
    k.defence = { readiness: 20, influence: 40 };
    expect(nationTargets(k).standing).toBeLessThan(base - 5);
    k.defence = { readiness: 80, influence: 40 };
    expect(nationTargets(k).standing).toBe(base);
  });

  it('makes the border and the sea worse when the force is weak, and leaves gains alone', () => {
    for (const id of BORDER_SEA) expect(EVENTS[id], id).toBeTruthy();
    const hurt = worsen([{ t: 'stability', n: -4 }, { t: 'cred', n: 2 }, { t: 'nation', standing: -6 }, { t: 'funds', n: -100 }]);
    expect(hurt[0]).toEqual({ t: 'stability', n: -5.6 });
    expect(hurt[1]).toEqual({ t: 'cred', n: 2 });
    expect((hurt[2] as { standing: number }).standing).toBeCloseTo(-8.4);
    expect(hurt[3]).toEqual({ t: 'funds', n: -100 });
    // The standoff's second choice is certain: a little anger in the heartland, which a weak force makes worse.
    const heartland = BLOC_IDS.indexOf('heartland');
    const anger = (readiness: number) => {
      const c = career();
      c.career!.defence = { readiness, influence: 40 };
      const before = c.career!.mood[heartland][c.player];
      resolveEvent(world, c, { id: 1, kind: 'event', from: null, event: 'borderStandoff' }, 1);
      return before - c.career!.mood[heartland][c.player];
    };
    expect(anger(70)).toBeCloseTo(0.01);
    expect(anger(20)).toBeCloseTo(0.014);
    // And a state's own events are not touched.
    expect(forceWeak(startCareer(getWorld('career:perak')!, { player: playable(getWorld('career:perak')!)[0], difficulty: 'normal', seed: 5 }))).toBe(false);
  });

  it('gives a force with a great say its price: dearer purchases, less room, and a cut it resents', () => {
    const c = career();
    const k = c.career!;
    expect(procurementMult(k)).toBe(1);
    k.defence = { readiness: 55, influence: 100 };
    expect(procurementMult(k)).toBeCloseTo(1.2);
    const dear = govBooks(world, c)!.spend.find((x) => x.id === 'defence')!.amount;
    k.defence = { readiness: 55, influence: 40 };
    expect(govBooks(world, c)!.spend.find((x) => x.id === 'defence')!.amount).toBeLessThan(dear);
    // Less room: the government steadies itself less.
    k.defence = { readiness: 55, influence: 95 };
    const stab = k.government.stability;
    run(c, 20);
    expect(k.government.stability).toBeLessThan(stab);
    // A cut they resent costs steadiness; the same cut with a quiet force costs nothing.
    const cutWith = (influence: number) => {
      const d = career();
      d.career!.defence = { readiness: 55, influence };
      const before = d.career!.government.stability;
      d.career!.budget.lines.defence = -1;
      tableBudget(d, d.career!.budget);
      return before - d.career!.government.stability;
    };
    expect(cutWith(85)).toBeGreaterThan(cutWith(30));
  });

  it('does not change what a plain budget costs', () => {
    const c = career();
    const books = govBooks(world, c)!;
    const lines = books.spend.filter((x) => ['aid', 'health', 'education', 'rural', 'civil', 'defence'].includes(x.id)).reduce((a, x) => a + x.amount, 0);
    const unit = books.spend.find((x) => x.id === 'interest')!.amount / 0.15 / (c.career!.economy.debt / 63);
    expect(lines / unit).toBeCloseTo(1.85, 5);
  });

  it('is moved by an event, and an event can ask for the force to be ready or to have a say', () => {
    const c = career();
    applyEffects(world, c, [{ t: 'defence', readiness: -30, influence: 20 }]);
    expect(defenceOf(c.career!)).toEqual({ readiness: 25, influence: 60 });
    const k = c.career!;
    const gate = { role: 'any' as const, weight: 1, needs: { readiness: 40 }, choices: [] };
    EVENTS.__weak = gate; EVENTS.__loud = { ...gate, needs: { influence: 50 } };
    try {
      expect(eligible(c, '__weak')).toBe(true);
      expect(eligible(c, '__loud')).toBe(true);
      k.defence = { readiness: 70, influence: 30 };
      expect(eligible(c, '__weak')).toBe(false);
      expect(eligible(c, '__loud')).toBe(false);
    } finally { delete EVENTS.__weak; delete EVENTS.__loud; }
  });

  it('shows in the political group for a prime minister only, and an old save reads and validates', () => {
    const c = career();
    const k = c.career!;
    expect(Number.isFinite(pestelScores(k).readiness)).toBe(true);
    k.defence = { readiness: 90, influence: 90 };
    // High influence counts against the group; the group without the meters is as it was.
    const without = groupScore(k, 'political');
    expect(groupScore(k, 'political', true)).not.toBe(without);
    k.defence = { readiness: 90, influence: 10 };
    expect(groupScore(k, 'political', true)).toBeGreaterThan(without);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    k.defence = undefined;
    const old = JSON.parse(JSON.stringify(c));
    expect('defence' in old.career.budget.lines).toBe(false);
    expect(isValidCampaign(old, world)).toBe(true);
    for (const bad of [{ readiness: 120, influence: 10 }, { readiness: 'x', influence: 10 }]) {
      const broken = JSON.parse(JSON.stringify(c));
      broken.career.defence = bad;
      expect(isValidCampaign(broken, world)).toBe(false);
    }
    const bogus = JSON.parse(JSON.stringify(c));
    bogus.career.budget.lines.defence = 6;
    expect(isValidCampaign(bogus, world)).toBe(false);
    bogus.career.budget.lines.defence = -1;
    expect(isValidCampaign(bogus, world)).toBe(true);
  });

  it('has words in both languages', () => {
    for (const lang of ['en', 'ms'] as const) {
      for (const key of ['line.defence', 'line.defence.desc', 'books.defence', 'pestel.readiness', 'pestel.influence', 'pestel.defence.note']) {
        expect(STRINGS[lang][key as StringKey], `${lang} ${key}`).toBeTruthy();
      }
    }
  });
});
