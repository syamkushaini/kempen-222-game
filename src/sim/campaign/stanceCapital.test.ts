import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { defenceTargets } from './defence';
import { pestelTargets } from './pestel';
import {
  CAPITAL_BASE, COMBOS, GRUMBLE_WEEKS, STANCE_IDS, STANCE_PORTFOLIO, activeCombos, capitalOf, capitalUsed, ministerFor, ministerMood, setStance, stanceGrowth, stanceOf, stanceShift,
  stanceWeek, stretch,
} from './stances';
import { isValidCampaign } from './validate';
import type { Campaign } from './types';

const world = getWorld('career')!;
const career = (): Campaign => startCareer(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5 });

describe('political capital', () => {
  it('is eight at an ordinary credibility, more for a leader who is believed and fewer for one who is not', () => {
    const k = career().career!;
    k.credibility = 60;
    expect(capitalOf(k)).toBe(CAPITAL_BASE);
    k.credibility = 95;
    expect(capitalOf(k)).toBeGreaterThan(CAPITAL_BASE);
    k.credibility = 10;
    expect(capitalOf(k)).toBeLessThan(CAPITAL_BASE);
    for (const cred of [0, 30, 60, 100]) { k.credibility = cred; expect(capitalOf(k)).toBeGreaterThanOrEqual(5); expect(capitalOf(k)).toBeLessThanOrEqual(12); }
  });

  it('is spent a point a notch away from the middle, either way, and cannot be overspent', () => {
    const c = career();
    c.career!.credibility = 60;
    expect(capitalUsed(c.career!)).toBe(0);
    expect(setStance(c, 'law', 2)).toBe(true);
    expect(setStance(c, 'tech', -2)).toBe(true);
    expect(capitalUsed(c.career!)).toBe(4);
    expect(setStance(c, 'environment', 2)).toBe(true);
    expect(setStance(c, 'cohesion', 2)).toBe(true);
    expect(capitalUsed(c.career!)).toBe(8);
    // All spent: pushing further is refused, and easing something off to make room is not.
    expect(setStance(c, 'readiness', 1)).toBe(false);
    expect(setStance(c, 'law', 1)).toBe(true);
    expect(setStance(c, 'readiness', 1)).toBe(true);
    expect(capitalUsed(c.career!)).toBe(8);
  });

  it('stretches everything thin when credibility falls and leaves the sliders over what there is', () => {
    const c = career();
    const k = c.career!;
    k.credibility = 60;
    for (const id of ['law', 'tech', 'environment', 'cohesion'] as const) setStance(c, id, 2);
    expect(stretch(k)).toBe(1);
    const full = stanceShift(k).environment;
    k.credibility = 20;
    expect(capitalOf(k)).toBeLessThan(capitalUsed(k));
    expect(stretch(k)).toBeLessThan(1);
    expect(stanceShift(k).environment).toBeLessThan(full);
    // Easing off is always allowed, even over the limit.
    expect(setStance(c, 'law', 1)).toBe(true);
  });
});

describe('combinations of sliders', () => {
  const set = (c: Campaign, notches: Partial<Record<(typeof STANCE_IDS)[number], number>>) => { for (const [id, n] of Object.entries(notches)) expect(setStance(c, id as never, n as number), id).toBe(true); };

  it('are six, three that pay and clashes that cost, each needing two sliders held the way it asks', () => {
    expect(COMBOS).toHaveLength(6);
    expect(COMBOS.filter((x) => x.kind === 'bonus')).toHaveLength(4);
    expect(COMBOS.filter((x) => x.kind === 'clash')).toHaveLength(2);
    const c = career();
    expect(activeCombos(c.career!)).toEqual([]);
    set(c, { tech: 1 });
    expect(activeCombos(c.career!)).toEqual([]);
    set(c, { law: 1 });
    expect(activeCombos(c.career!).map((x) => x.id)).toEqual(['digitalIntegrity']);
    set(c, { law: -1 });
    expect(activeCombos(c.career!).map((x) => x.id)).toEqual(['surveillanceState']);
  });

  it('move the meters, growth, steadiness and trust, and are in the news the first time', () => {
    const c = career();
    const k = c.career!;
    const law = pestelTargets(k).law;
    set(c, { tech: 1, law: 1 });
    const alone = pestelTargets(k).law - law;
    expect(alone).toBeGreaterThanOrEqual(3 + 2 - 0.001);
    stanceWeek(c);
    expect(k.combos).toEqual(['digitalIntegrity']);
    expect(k.combosSeen).toEqual(['digitalIntegrity']);
    expect(c.news.some((n) => n.key === 'news.combo.digitalIntegrity' && n.tone === 'good')).toBe(true);
    const count = c.news.length;
    stanceWeek(c);
    expect(c.news.length).toBe(count);
    // A clash costs trust each week, and is bad news.
    set(c, { law: -1 });
    const trust = k.government.trust;
    for (let w = 0; w < 10; w++) stanceWeek(c);
    expect(k.government.trust).toBeLessThan(trust);
    expect(c.news.some((n) => n.key === 'news.combo.surveillanceState' && n.tone === 'bad')).toBe(true);
    expect(pestelTargets(k).law).toBeLessThan(law + 3 * -1 + 3);
    expect(k.combosSeen).toEqual(['digitalIntegrity', 'surveillanceState']);
    // Green growth spares growth some of the cost of strict environment rules.
    const d = career();
    set(d, { environment: 2 });
    const price = stanceGrowth(d.career!);
    set(d, { tech: 1 });
    expect(stanceGrowth(d.career!)).toBeGreaterThan(price);
  });

  it('keep the armed forces’ ones to the armed forces’ sliders', () => {
    const c = career();
    set(c, { readiness: 1, influence: 1 });
    expect(activeCombos(c.career!).map((x) => x.id)).toEqual(['professionalArmy']);
    const before = defenceTargets(c.career!).readiness;
    set(c, { influence: -1 });
    expect(activeCombos(c.career!).map((x) => x.id)).toEqual(['praetorian']);
    expect(defenceTargets(c.career!).influence).toBeGreaterThan(before - 100);
    const stab = c.career!.government.stability;
    for (let w = 0; w < 20; w++) stanceWeek(c);
    expect(c.career!.government.stability).toBeLessThan(stab);
  });
});

describe('ministers and the sliders', () => {
  it('each slider has the minister of its post, who wants their own post pushed, and a defence minister wants the armed forces’ say left alone', () => {
    const c = career();
    const k = c.career!;
    for (const id of STANCE_IDS) expect(ministerFor(k, id)?.portfolio, id).toBe(STANCE_PORTFOLIO[id]);
    expect(ministerMood(k, 'law')).toBe('neutral');
    setStance(c, 'law', 2); expect(ministerMood(k, 'law')).toBe('delighted');
    setStance(c, 'law', 1); expect(ministerMood(k, 'law')).toBe('pleased');
    setStance(c, 'law', -1); expect(ministerMood(k, 'law')).toBe('uneasy');
    setStance(c, 'law', -2); expect(ministerMood(k, 'law')).toBe('furious');
    setStance(c, 'influence', 2); expect(ministerMood(k, 'influence')).toBe('furious');
    setStance(c, 'influence', -1); expect(ministerMood(k, 'influence')).toBe('pleased');
    expect(stanceOf(k, 'influence')).toBe(-1);
  });

  it('grumble in public after half a year of being overruled, and then every half year, and stop when it is mended', () => {
    const c = career();
    const k = c.career!;
    k.cabinet.find((m) => m.portfolio === 'environment')!.acting = false;
    setStance(c, 'environment', -2);
    const [cred, stab] = [k.credibility, k.government.stability];
    for (let w = 0; w < GRUMBLE_WEEKS - 1; w++) { k.week++; stanceWeek(c); }
    expect(c.news.some((n) => n.key === 'news.grumble')).toBe(false);
    k.week += 2; stanceWeek(c);
    const grumbles = () => c.news.filter((n) => n.key === 'news.grumble');
    expect(grumbles()).toHaveLength(1);
    expect(grumbles()[0].vars?.slider).toBe('@stance:environment');
    expect(k.credibility).toBeLessThan(cred);
    expect(k.government.stability).toBeLessThan(stab);
    k.week += 5; stanceWeek(c);
    expect(grumbles()).toHaveLength(1);
    k.week += GRUMBLE_WEEKS; stanceWeek(c);
    expect(grumbles()).toHaveLength(2);
    setStance(c, 'environment', 0);
    stanceWeek(c);
    expect(k.grumbled).toBeUndefined();
  });

  it('are saved and checked, and every line is in both languages', () => {
    const c = career();
    setStance(c, 'tech', 1); setStance(c, 'law', 1);
    stanceWeek(c);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    const broken = JSON.parse(JSON.stringify(c));
    broken.career.grumbled = { law: 'x' };
    expect(isValidCampaign(broken, world)).toBe(false);
    for (const lang of ['en', 'ms'] as const) {
      for (const key of ['stances.capital', 'stances.capital.desc', 'stances.capital.full', 'stances.capital.over', 'stances.combos', 'combo.found', 'combo.seen', 'combo.unknown', 'combo.hint', 'news.grumble', 'minister.acting']) expect(STRINGS[lang][key as StringKey], `${lang} ${key}`).toBeTruthy();
      for (const x of COMBOS) for (const key of [`combo.${x.id}`, `combo.${x.id}.desc`, `news.combo.${x.id}`]) expect(STRINGS[lang][key as StringKey], `${lang} ${key}`).toBeTruthy();
      for (const mood of ['delighted', 'pleased', 'uneasy', 'furious']) for (const trait of ['expert', 'loyalist', 'rising', 'fixer']) expect(STRINGS[lang][`minister.say.${mood}.${trait}` as StringKey], `${lang} ${mood} ${trait}`).toBeTruthy();
    }
  });
});
