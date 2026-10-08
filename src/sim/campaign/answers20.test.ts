import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS, BLOC_IDS } from '../types';
import { scaled } from './actions';
import { STYLE_IDS, styleOf } from './ai';
import { startCareer } from './career';
import { REALISM, realistic, resolveEvent, rollEvent } from './events';
import { LAW_SCORE, REFORM_LAWS, endCareer, legacyOf } from './legacy';
import { Rng } from '../rng';
import { newCampaign } from './turn';
import { WHATIF, WHATIF_IDS, applyWhatIf, isWhatIf, leadingParty } from './whatif';
import { isValidCampaign } from './validate';
import type { Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps');
const BP = PARTY_IDS.indexOf('bp');
const PT = PARTY_IDS.indexOf('pt');
const GBK = PARTY_IDS.indexOf('gbk');
const careerWorld = getWorld('career')!;
const general = getWorld('general')!;
const career = (seed = 5, difficulty: 'easy' | 'normal' | 'hard' = 'normal'): Campaign => {
  const c = startCareer(careerWorld, { player: PS, difficulty, seed });
  c.career!.obligations = [];
  c.parties[PS]!.funds = scaled(careerWorld, 5_000_000);
  return c;
};

describe('how a rival campaigns, as a player can read it', () => {
  it('names one or two styles for each party, from how it is known to play', () => {
    for (const id of ['ps', 'bp', 'pt', 'gbk', 'gbs', 'legasi'] as const) {
      const styles = styleOf(PARTY_IDS.indexOf(id));
      expect(styles.length, id).toBeGreaterThanOrEqual(1);
      expect(styles.length, id).toBeLessThanOrEqual(2);
      for (const s of styles) expect(STYLE_IDS).toContain(s);
    }
    expect(styleOf(PT)).toContain('populist');
    expect(styleOf(BP)).toContain('machine');
    expect(styleOf(BP)).toContain('shady');
    expect(styleOf(GBK)).toContain('cautious');
    expect(styleOf(PS)).toContain('online');
    expect(styleOf(PARTY_IDS.indexOf('oth'))).toEqual([]);
    for (const id of STYLE_IDS) for (const key of [`style.${id}`, `style.${id}.desc`] as StringKey[]) { expect(STRINGS.en[key], key).toBeTruthy(); expect(STRINGS.ms[key], key).toBeTruthy(); }
  });
});

describe('a harder level is a crueller country', () => {
  it('scales losses and gains by level, and leaves the normal level as it was', () => {
    const [easy, normal, hard] = (['easy', 'normal', 'hard'] as const).map((d) => career(5, d));
    expect(realistic(normal, -4)).toBe(-4);
    expect(realistic(normal, 4)).toBe(4);
    expect(realistic(hard, -4)).toBeLessThan(-4);
    expect(realistic(hard, 4)).toBeLessThan(4);
    expect(realistic(easy, -4)).toBeGreaterThan(-4);
    expect(realistic(easy, 4)).toBeGreaterThan(4);
    expect(REALISM.hard.chance).toBeGreaterThan(REALISM.easy.chance);
  });
  it('makes the same event cost more on the hard level', () => {
    const cost = (d: 'easy' | 'normal' | 'hard') => {
      const c = career(5, d);
      c.career!.credibility = 60;
      const scene = { id: 1, kind: 'event' as const, from: null, event: 'courtCase' };
      resolveEvent(careerWorld, c, scene, 1);
      return 60 - c.career!.credibility;
    };
    expect(cost('hard')).toBeGreaterThan(cost('normal'));
    expect(cost('normal')).toBeGreaterThan(cost('easy'));
  });
  it('brings trouble more often on the hard level', () => {
    const trouble = (d: 'easy' | 'normal' | 'hard') => {
      let n = 0;
      for (let seed = 1; seed <= 400; seed++) {
        const c = career(5, d);
        c.career!.government.pm = PS;
        c.career!.week = 30 + (seed % 20);
        c.career!.quietUntil = 0;
        c.career!.fired = [];
        if (rollEvent(c, new Rng(seed))) n++;
      }
      return n;
    };
    expect(trouble('hard')).toBeGreaterThan(trouble('easy'));
  }, 120_000);
});

describe('history, with one thing changed', () => {
  const start = (id?: string) => newCampaign(general, { player: PS, difficulty: 'normal', seed: 3, ...(id ? { challenge: { whatIf: id } } : {}) });
  it('has four changes, each with words in both languages', () => {
    expect(WHATIF_IDS).toHaveLength(4);
    expect(isWhatIf('turnout')).toBe(true);
    expect(isWhatIf('nonsense')).toBe(false);
    for (const id of WHATIF_IDS) for (const key of [`whatif.${id}`, `whatif.${id}.desc`] as StringKey[]) { expect(STRINGS.en[key]).toBeTruthy(); expect(STRINGS.ms[key]).toBeTruthy(); }
  });
  it('lifts the young’s turnout, sours the leading party’s year, disgraces it, or gives the player a better year', () => {
    const lead = leadingParty(general);
    const other = lead === PS ? BP : PS;
    const base = start();
    const turnout = start('turnout');
    expect(turnout.drift.turnout.nat[BLOC_IDS.indexOf('undi18')] - base.drift.turnout.nat[BLOC_IDS.indexOf('undi18')]).toBeCloseTo(WHATIF.youthTurnout, 9);
    expect(turnout.drift.turnout.nat[BLOC_IDS.indexOf('heartland')]).toBe(base.drift.turnout.nat[BLOC_IDS.indexOf('heartland')]);
    const rec = start('recession');
    expect(base.drift.support.nat[0][lead] - rec.drift.support.nat[0][lead]).toBeCloseTo(WHATIF.recession, 9);
    expect(rec.drift.support.nat[0][other]).toBe(base.drift.support.nat[0][other]);
    const sc = start('scandal');
    expect(base.drift.support.nat[0][lead] - sc.drift.support.nat[0][lead]).toBeCloseTo(WHATIF.scandal, 9);
    expect(base.parties[lead]!.unity - sc.parties[lead]!.unity).toBe(WHATIF.scandalUnity);
    const sg = start('surge');
    expect(sg.drift.support.nat[0][PS] - base.drift.support.nat[0][PS]).toBeCloseTo(WHATIF.surge, 9);
    expect(sg.challenge?.whatIf).toBe('surge');
    expect(isValidCampaign(JSON.parse(JSON.stringify(sg)), general)).toBe(true);
  });
  it('does nothing for a change that is not one, or in a career', () => {
    const c = start();
    const before = JSON.stringify(c.drift.support.nat);
    applyWhatIf(general, c, 'nothing');
    expect(JSON.stringify(c.drift.support.nat)).toBe(before);
    const k = newCampaign(careerWorld, { player: PS, difficulty: 'normal', seed: 3, challenge: { whatIf: 'surge' } });
    expect(k.challenge?.whatIf).toBeUndefined();
  });
});

describe('a legacy counts the laws that are still law', () => {
  it('adds to the score for each Act left standing, and shows how many in the ending', () => {
    const c = career();
    const k = c.career!;
    k.record.weeksPm = 200; k.record.weeksGov = 200; k.record.victories = 1;
    const none = legacyOf(c);
    expect(none.laws).toBe(0);
    k.laws = ['termLimit', 'infoAct', 'gigRights'];
    const some = legacyOf(c);
    expect(some.laws).toBe(3);
    expect(some.score).toBe(Math.min(100, none.score + 3 * LAW_SCORE));
    endCareer(c, 'retired');
    expect(k.ending!.laws).toBe(3);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), careerWorld)).toBe(true);
  });
  it('makes a reformer of a leader whose reforms are still on the books, even if they were not promised', () => {
    const c = career();
    const k = c.career!;
    k.record.weeksPm = 200; k.record.weeksGov = 200; k.record.victories = 1;
    k.laws = ['gigRights'];
    expect(legacyOf(c).legacy).not.toBe('reformer');
    k.laws = ['partyHopBan', 'fixedTerm'];
    expect(REFORM_LAWS).toContain('partyHopBan');
    expect(legacyOf(c).legacy).toBe('reformer');
    // A repealed Act no longer counts.
    k.laws = ['partyHopBan'];
    expect(legacyOf(c).legacy).not.toBe('reformer');
    expect(STRINGS.en['legacy.laws' as StringKey]).toContain('{n}');
    expect(STRINGS.ms['legacy.laws' as StringKey]).toContain('{n}');
  });
});
