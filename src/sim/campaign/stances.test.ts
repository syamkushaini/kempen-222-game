import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { BLOC_IDS, PARTY_IDS } from '../types';
import { startCareer } from './career';
import { defenceOf, defenceTargets } from './defence';
import { playable } from './field';
import { pestelTargets } from './pestel';
import { STANCES, STANCE_IDS, setStance, stanceCost, stanceGrowth, stanceOf, stanceShift, stanceWeek } from './stances';
import { govBooks } from './treasury';
import { isValidCampaign } from './validate';
import type { Campaign } from './types';

const world = getWorld('career')!;
const PS = PARTY_IDS.indexOf('ps');
const career = (player = PS): Campaign => startCareer(world, { player, difficulty: 'normal', seed: 5 });
const stateCareer = (): Campaign => {
  const w = getWorld('career:perak')!;
  const c = playable(w).map((player) => startCareer(w, { player, difficulty: 'normal', seed: 5 })).find((x) => x.career!.government.pm === x.player)!;
  return c;
};

describe('policy sliders for the meters', () => {
  it('are six, from -2 to 2, set only by the head of government in a term, and left out of the save at the middle', () => {
    expect(STANCE_IDS).toHaveLength(6);
    const c = career();
    expect(stanceOf(c.career!, 'law')).toBe(0);
    expect(setStance(c, 'law', 2)).toBe(true);
    expect(stanceOf(c.career!, 'law')).toBe(2);
    expect(setStance(c, 'law', 3)).toBe(false);
    expect(setStance(c, 'law', 0.5)).toBe(false);
    expect(setStance(c, 'nonsense' as never, 1)).toBe(false);
    expect(setStance(c, 'law', 0)).toBe(true);
    expect(c.career!.stance).toBeUndefined();
    expect(setStance(career(PARTY_IDS.indexOf('pt')), 'law', 1)).toBe(false);
    const campaigning = career();
    campaigning.phase = 'campaign';
    expect(setStance(campaigning, 'law', 1)).toBe(false);
  });

  it('move where the meter is heading, up when pushed and down when eased off', () => {
    const k = career().career!;
    const base = { ...pestelTargets(k), ...defenceTargets(k) };
    for (const id of STANCE_IDS) {
      const c = career();
      setStance(c, id, 2);
      const up = { ...pestelTargets(c.career!), ...defenceTargets(c.career!) }[id];
      setStance(c, id, -2);
      const down = { ...pestelTargets(c.career!), ...defenceTargets(c.career!) }[id];
      // For the armed forces' influence, pushing is civilian control, which lowers it.
      if (id === 'influence') { expect(up, id).toBeLessThan(base[id]); expect(down, id).toBeGreaterThan(base[id]); }
      else { expect(up, id).toBeGreaterThan(base[id]); expect(down, id).toBeLessThan(base[id]); }
    }
    expect(stanceShift(k)).toEqual({ cohesion: 0, tech: 0, environment: 0, law: 0, readiness: 0, influence: 0 });
  });

  it('cost money to push and save a little to ease off, and show in the government’s books', () => {
    const c = career();
    const k = c.career!;
    const plain = govBooks(world, c)!.spend.find((x) => x.id === 'stances')!.amount;
    expect(plain).toBe(0);
    setStance(c, 'tech', 2);
    expect(stanceCost(k)).toBeGreaterThan(0);
    expect(govBooks(world, c)!.spend.find((x) => x.id === 'stances')!.amount).toBeGreaterThan(0);
    setStance(c, 'tech', -2);
    expect(stanceCost(k)).toBeLessThan(0);
    // Easing off saves less than pushing costs.
    expect(Math.abs(stanceCost(k, 'tech'))).toBeLessThan(STANCES.tech.cost * 2);
    expect(Math.abs(stanceCost(k, 'tech'))).toBeCloseTo(STANCES.tech.cost);
  });

  it('are felt by the voters they please and not by the ones they do not, week by week', () => {
    const c = career();
    setStance(c, 'environment', 2);
    const k = c.career!;
    const at = (b: string) => k.mood[BLOC_IDS.indexOf(b as never)][k.government.pm];
    const [urban, agri] = [at('urban_lib'), at('agri')];
    for (let w = 0; w < 20; w++) stanceWeek(c);
    expect(at('urban_lib')).toBeGreaterThan(urban);
    expect(at('agri')).toBeLessThan(agri);
    // And the other way about when eased off.
    const d = career();
    setStance(d, 'environment', -2);
    const [u2, a2] = [d.career!.mood[BLOC_IDS.indexOf('urban_lib')][d.career!.government.pm], d.career!.mood[BLOC_IDS.indexOf('agri')][d.career!.government.pm]];
    for (let w = 0; w < 20; w++) stanceWeek(d);
    expect(d.career!.mood[BLOC_IDS.indexOf('urban_lib')][d.career!.government.pm]).toBeLessThan(u2);
    expect(d.career!.mood[BLOC_IDS.indexOf('agri')][d.career!.government.pm]).toBeGreaterThan(a2);
  });

  it('carry a price of their own: growth for the environment and technology, steadiness for the law and civilian control, readiness for control', () => {
    const c = career();
    setStance(c, 'environment', 2);
    expect(stanceGrowth(c.career!)).toBeLessThan(0);
    setStance(c, 'environment', 0); setStance(c, 'tech', 2);
    expect(stanceGrowth(c.career!)).toBeGreaterThan(0);
    const stab = c.career!.government.stability;
    setStance(c, 'law', 2); setStance(c, 'influence', 2);
    for (let w = 0; w < 30; w++) stanceWeek(c);
    expect(c.career!.government.stability).toBeLessThan(stab);
    const k = career().career!;
    const readiness = defenceTargets(k).readiness;
    k.stance = { influence: 2 };
    expect(defenceTargets(k).readiness).toBeLessThan(readiness);
  });

  it('keep the armed forces’ two to a country, and a state’s books carry none of them', () => {
    const state = stateCareer();
    expect(setStance(state, 'readiness', 1)).toBe(false);
    expect(setStance(state, 'influence', 1)).toBe(false);
    expect(setStance(state, 'law', 1)).toBe(true);
    expect(defenceOf(career().career!)).toBeDefined();
    expect(state.career!.defence).toBeUndefined();
  });

  it('are saved, checked, and have words in both languages', () => {
    const c = career();
    setStance(c, 'cohesion', -1); setStance(c, 'law', 2);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    for (const bad of [{ law: 3 }, { nonsense: 1 }, { law: 'x' }]) {
      const broken = JSON.parse(JSON.stringify(c));
      broken.career.stance = bad;
      expect(isValidCampaign(broken, world)).toBe(false);
    }
    for (const lang of ['en', 'ms'] as const) {
      for (const key of ['stances.title', 'stances.desc', 'stances.forecast', 'stances.cost', 'stances.saves', 'stances.pleases', 'stances.displeases', 'books.stances']) expect(STRINGS[lang][key as StringKey], `${lang} ${key}`).toBeTruthy();
      for (const n of [-2, -1, 0, 1, 2]) expect(STRINGS[lang][`stances.notch.${n}` as StringKey], `${lang} ${n}`).toBeTruthy();
      for (const id of STANCE_IDS) for (const suffix of ['', '.desc', '.lo', '.hi']) expect(STRINGS[lang][`stance.${id}${suffix}` as StringKey], `${lang} ${id}${suffix}`).toBeTruthy();
    }
  });
});
