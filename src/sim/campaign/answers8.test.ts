import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { startCareer } from './career';
import {
  FAVOUR_IDS, FOREIGN, TRAIL, canTakeForeign, exposureChance, foreignWeek, inquiryChance, takeForeign, trailWeek,
} from './party';
import { petition } from './results';
import { PETITION_FROM, PETITION_MAX, probeChance, spendingLimit } from './spending';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const base = getWorld('career')!;
const career = (seed = 5): Campaign => {
  const c = startCareer(base, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  c.parties[PS]!.funds = scaled(base, 5_000_000);
  return c;
};

describe('the trail of bought defections', () => {
  it('is nothing until members are bought, and makes an inquiry likelier the more there are', () => {
    const c = career();
    expect(inquiryChance(c.career!)).toBe(0);
    c.career!.trail = 2;
    const two = inquiryChance(c.career!);
    c.career!.trail = 8;
    expect(inquiryChance(c.career!)).toBeGreaterThan(two);
    c.career!.trail = 1000;
    expect(inquiryChance(c.career!)).toBe(TRAIL.max);
  });
  it('ends in an inquiry that costs money, credibility and unity, and halves the trail', () => {
    const c = career();
    const k = c.career!;
    k.trail = 10;
    const [funds, cred, unity] = [c.parties[PS]!.funds, k.credibility, c.parties[PS]!.unity];
    const rng = new Rng(1);
    for (let w = 0; w < 400 && !c.news.some((n) => n.key === 'news.inquiry'); w++) trailWeek(base, c, rng);
    expect(c.news.some((n) => n.key === 'news.inquiry')).toBe(true);
    expect(c.parties[PS]!.funds).toBeLessThan(funds);
    expect(k.credibility).toBe(cred - TRAIL.credibility);
    expect(c.parties[PS]!.unity).toBeLessThan(unity);
    expect(k.trail ?? 0).toBeLessThan(6);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });
  it('fades by itself when left alone', () => {
    const c = career();
    c.career!.trail = 1;
    const rng = new Rng(2);
    for (let w = 0; w < 1000 && c.career!.trail; w++) trailWeek(base, c, rng);
    expect(c.career!.trail).toBeUndefined();
  });
});

describe('money from abroad', () => {
  it('pays at once, once a parliament, and moves the party’s line for the donor', () => {
    const c = career();
    const k = c.career!;
    expect(canTakeForeign(c)).toBe(true);
    const funds = c.parties[PS]!.funds;
    const before = k.stances[PS].slice();
    expect(takeForeign(base, c, 'tax')).toBe(true);
    expect(c.parties[PS]!.funds).toBe(funds + scaled(base, FOREIGN.sum));
    expect(k.stances[PS].some((v, i) => v !== before[i])).toBe(true);
    expect(canTakeForeign(c)).toBe(false);
    expect(takeForeign(base, c, 'trade')).toBe(false);
    expect(k.foreign).toBe(1);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });
  it('knows only the favours on offer', () => {
    expect(FAVOUR_IDS).toHaveLength(3);
    expect(takeForeign(base, career(), 'nope' as never)).toBe(false);
  });
  it('is likelier to come out the more was taken, and when it does it is a scandal', () => {
    const c = career();
    const k = c.career!;
    k.foreign = 1;
    const one = exposureChance(k);
    k.foreign = 5;
    expect(exposureChance(k)).toBeGreaterThan(one);
    const [funds, cred] = [c.parties[PS]!.funds, k.credibility];
    const rng = new Rng(3);
    for (let w = 0; w < 2000 && k.foreign; w++) foreignWeek(base, c, rng);
    expect(k.foreign).toBeUndefined();
    expect(c.parties[PS]!.funds).toBeLessThan(funds);
    expect(k.credibility).toBe(cred - FOREIGN.credibility);
    expect(c.news.at(-1)).toMatchObject({ key: 'news.foreign.exposed', tone: 'bad' });
  });
});

describe('overspending', () => {
  it('is caught more surely the further past the limit it goes', () => {
    const c = career();
    const limit = spendingLimit(base);
    const pc = c.parties[PS]!;
    pc.spent = limit;
    expect(probeChance(base, c, PS)).toBe(0);
    pc.spent = limit * 1.1;
    const a = probeChance(base, c, PS);
    pc.spent = limit * 1.3;
    expect(probeChance(base, c, PS)).toBeGreaterThan(a);
    pc.spent = limit * 5;
    expect(probeChance(base, c, PS)).toBe(0.9);
  });
  it('unseats the narrowest winners on petition, only for a fined party far past the limit', () => {
    const c = career();
    const pc = c.parties[PS]!;
    const limit = spendingLimit(base);
    const votes = base.seats.map((_, i) => {
      const row = Array(PARTY_IDS.length).fill(10);
      row[PS === 0 ? 1 : 0] = 100;
      if (i < 12) row[PS] = 1000 + i * 100;
      return row;
    });
    const results = { votes, turnout: base.seats.map(() => 0.7) } as never;
    pc.spent = limit * 2;
    pc.fined = false;
    expect(petition(base, c, results).lost).toEqual([]);
    pc.fined = true;
    pc.spent = limit * (PETITION_FROM - 0.1);
    expect(petition(base, c, results).lost).toEqual([]);
    pc.spent = limit * 2;
    const out = petition(base, c, results);
    expect(out.lost.length).toBeGreaterThan(0);
    expect(out.lost.length).toBeLessThanOrEqual(PETITION_MAX);
    expect(out.lost[0]).toBe(base.seats[0].id);
    for (const id of out.lost) {
      const i = base.seatIndex.get(id)!;
      expect(out.results.votes[i][PS]).toBeLessThan(Math.max(...out.results.votes[i]));
    }
  });
});

describe('strings', () => {
  it('exist in both languages', () => {
    for (const key of ['party.foreign', 'party.foreign.desc', 'party.foreign.risk', 'party.foreign.trade', 'party.foreign.tax', 'party.foreign.values', 'party.trail', 'news.inquiry', 'news.foreign.taken', 'news.foreign.exposed', 'news.petition'] as StringKey[]) {
      expect(STRINGS.en[key], key).toBeTruthy();
      expect(STRINGS.ms[key], key).toBeTruthy();
    }
  });
});
