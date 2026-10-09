import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { answerEvent, startCareer, termIncome } from './career';
import { FORCE, canForce, forceByElection, holderOf } from './contests';
import { factionsOf, factionsWeek } from './factions';
import { CROWD_INCOME, PADDING, canPad, crowdIncome, genuineRolls, padChance, padRolls, paddedOf, paddedWeek, rollsOf } from './party';
import { SAFE, applySafe, canGrantSafe, grantSafe, revokeSafe } from './safeseat';
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
const heldSeat = (c: Campaign, mine = true) => base.seats.find((s) => (holderOf(base, c, s.id) === PS) === mine)!.id;
/** Puts the player's party out of government. */
const opposition = (c: Campaign) => { const g = c.career!.government; if (g.pm === PS) g.pm = PARTY_IDS.indexOf('bp'); g.partners = g.partners.filter((p) => p !== PS); };

describe('small donors', () => {
  it('give nothing in government and more to a respected, poor opposition party', () => {
    const c = career();
    c.career!.government.pm = PS;
    expect(crowdIncome(base, c)).toBe(0);
    opposition(c);
    c.career!.credibility = 70;
    c.parties[PS]!.funds = 0;
    const poor = crowdIncome(base, c);
    expect(poor).toBeGreaterThan(0);
    c.parties[PS]!.funds = scaled(base, 8_000_000);
    expect(crowdIncome(base, c)).toBeLessThan(poor);
    c.parties[PS]!.funds = 0;
    c.career!.credibility = 20;
    expect(crowdIncome(base, c)).toBe(0);
    c.career!.credibility = 100;
    expect(crowdIncome(base, c)).toBeGreaterThan(poor);
    expect(crowdIncome(base, c)).toBeLessThanOrEqual(Math.round(scaled(base, CROWD_INCOME) * 1.25 * 1.5));
  });
  it('are part of the weekly income', () => {
    const c = career();
    opposition(c);
    c.career!.credibility = 80;
    const inc = termIncome(base, c);
    expect(inc.crowd).toBeGreaterThan(0);
    expect(inc.total).toBe(inc.members + inc.donors + inc.crowd + inc.diverted + inc.assets);
  });
});

describe('members on paper', () => {
  it('swell the rolls once a parliament, without making them real', () => {
    const c = career();
    const before = rollsOf(base, c);
    expect(canPad(c)).toBe(true);
    expect(padRolls(base, c)).toBe(true);
    expect(rollsOf(base, c)).toBe(before + Math.round(before * PADDING.share));
    expect(genuineRolls(base, c)).toBe(before);
    expect(canPad(c)).toBe(false);
    expect(padRolls(base, c)).toBe(false);
    expect(padChance(base, c)).toBeGreaterThan(0);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });
  it('fade, or come out and cost credibility, unity and members', () => {
    const c = career();
    const k = c.career!;
    padRolls(base, c);
    const cred = k.credibility;
    const unity = c.parties[PS]!.unity;
    const grown = rollsOf(base, c);
    const rng = new Rng(4);
    for (let w = 0; w < 3000 && paddedOf(k) > 0; w++) paddedWeek(base, c, rng);
    expect(paddedOf(k)).toBe(0);
    if (c.news.some((n) => n.key === 'news.padded')) {
      expect(k.credibility).toBe(cred - PADDING.credibility);
      expect(c.parties[PS]!.unity).toBeLessThan(unity);
      expect(rollsOf(base, c)).toBeLessThan(grown);
    }
  });
  it('are found out in the end if the roll is padded again and again', () => {
    let out = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const c = career(seed);
      padRolls(base, c);
      const rng = new Rng(seed);
      for (let w = 0; w < 200 && paddedOf(c.career!) > 0; w++) paddedWeek(base, c, rng);
      if (c.news.some((n) => n.key === 'news.padded')) out++;
    }
    expect(out).toBeGreaterThan(3);
    expect(out).toBeLessThan(40);
  });
});

describe('safe seats', () => {
  it('can be given from a seat the party holds, three at a time, and lift the faction', () => {
    const c = career();
    const mine = base.seats.filter((s) => holderOf(base, c, s.id) === PS).map((s) => s.id);
    expect(mine.length).toBeGreaterThan(3);
    const mood = factionsOf(c).mood[2];
    expect(canGrantSafe(base, c, heldSeat(c, false), 2)).toEqual({ ok: false, reason: 'seat' });
    expect(canGrantSafe(base, c, mine[0], 5)).toEqual({ ok: false, reason: 'faction' });
    expect(grantSafe(base, c, mine[0], 2)).toBe(true);
    expect(factionsOf(c).mood[2]).toBe(Math.min(100, mood + SAFE.mood));
    expect(canGrantSafe(base, c, mine[0], 1)).toEqual({ ok: false, reason: 'given' });
    expect(grantSafe(base, c, mine[1], 0)).toBe(true);
    expect(grantSafe(base, c, mine[2], 1)).toBe(true);
    expect(canGrantSafe(base, c, mine[3], 1)).toEqual({ ok: false, reason: 'full' });
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });
  it('keep the faction better disposed for as long as they stand, and cost it when they are taken back', () => {
    const settle = (gift: boolean) => {
      const c = career();
      factionsOf(c).mood = [50, 50, 50];
      if (gift) grantSafe(base, c, heldSeat(c), 2);
      factionsOf(c).mood = [50, 50, 50];
      for (let w = 0; w < 300; w++) factionsWeek(c);
      return factionsOf(c).mood[2];
    };
    expect(settle(true)).toBeGreaterThan(settle(false));
    const c = career();
    const seat = heldSeat(c);
    grantSafe(base, c, seat, 0);
    const mood = factionsOf(c).mood[0];
    expect(revokeSafe(c, seat)).toBe(true);
    expect(factionsOf(c).mood[0]).toBe(mood - SAFE.revokeMood);
    expect(c.career!.safe).toBeUndefined();
    expect(revokeSafe(c, seat)).toBe(false);
  });
  it('weigh on the seat at the next election, and are dropped if the seat was lost', () => {
    const c = career();
    const [a, b] = base.seats.filter((s) => holderOf(base, c, s.id) === PS).map((s) => s.id);
    grantSafe(base, c, a, 1);
    grantSafe(base, c, b, 1);
    c.career!.house[b] = PARTY_IDS.indexOf('bp');
    const was = c.held?.support.seat[a]?.[PS] ?? 0;
    const wasB = c.held?.support.seat[b]?.[PS] ?? 0;
    applySafe(base, c);
    expect(c.held!.support.seat[a]![PS]).toBeCloseTo(was - SAFE.complacent, 9);
    expect(c.held!.support.seat[b]?.[PS] ?? 0).toBe(wasB);
    expect(c.career!.safe).toEqual({ [a]: 1 });
  });
});

describe('a by-election the party calls', () => {
  it('costs money and goodwill, once a parliament, and only in a seat the party holds', () => {
    const c = career();
    const k = c.career!;
    const seat = heldSeat(c);
    expect(canForce(base, c, heldSeat(c, false))).toEqual({ ok: false, reason: 'seat' });
    const [funds, cred] = [c.parties[PS]!.funds, k.credibility];
    expect(forceByElection(base, c, seat)).toBe(true);
    expect(c.parties[PS]!.funds).toBe(funds - scaled(base, FORCE.money));
    expect(k.credibility).toBe(cred - FORCE.credibility);
    expect(c.inbox.some((s) => s.event === 'byElection' && s.seat === seat)).toBe(true);
    expect(k.forced).toBe(seat);
    expect(canForce(base, c, seat).ok).toBe(false);
  });
  it('pays back credibility when it is won and costs more when it is lost', () => {
    const run = (effort: number, seed: number) => {
      const c = career(seed);
      const seat = heldSeat(c);
      forceByElection(base, c, seat);
      const scene = c.inbox.find((s) => s.event === 'byElection')!;
      const cred = c.career!.credibility;
      answerEvent(base, c, scene, effort);
      return { c, seat, gain: c.career!.credibility - cred, held: holderOf(base, c, seat) === PS };
    };
    let won = 0, lost = 0;
    for (let seed = 1; seed <= 12; seed++) {
      const r = run(0, seed);
      expect(r.c.career!.forced).toBeUndefined();
      if (r.held) { won++; expect(r.gain).toBeGreaterThanOrEqual(FORCE.won); } else { lost++; expect(r.gain).toBeLessThan(0); }
    }
    expect(won + lost).toBe(12);
  });
});

describe('strings', () => {
  it('exist in both languages', () => {
    const keys = ['orders.source.crowd', 'orders.source.crowd.desc', 'party.pad', 'party.pad.desc', 'party.pad.do', 'party.pad.risk', 'slate.safe', 'slate.safe.give', 'slate.safe.revoke', 'slate.force', 'news.padded', 'news.safe.given', 'news.safe.revoked', 'news.by.forced'] as StringKey[];
    for (const key of keys) { expect(STRINGS.en[key], key).toBeTruthy(); expect(STRINGS.ms[key], key).toBeTruthy(); }
  });
});
