import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { ledger, startCareer, termIncome, termSpending } from './career';
import { ALLOCATION, allocation, govMoney } from './treasury';
import { STATE_GOVERNMENT_INCOME, seatsHeldBy, statesHeld } from './contests';
import {
  CHIEF_NAMES, DEPUTY_EDGE, WALKOUT, challengerLeaves, deputyChance, deputyOf, factionsOf, factionsWeek, leaveChance, partyPoll, pollOdds, resolvePartyPoll,
} from './factions';
import { PATRONAGE, patronageChance, patronageMult, patronageWeek, setPatronage } from './patronage';
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
/** Gives the player's party the government of three states. */
const withStates = (c: Campaign) => { const k = c.career!; for (const st of base.states.slice(0, 3)) k.states[st] = PS; };

describe('the states as a purse', () => {
  it('pay more the more freely they are drawn on, and only to a party that governs a state', () => {
    const c = career();
    const k = c.career!;
    for (const st of Object.keys(k.states)) if (k.states[st] === PS) k.states[st] = 0 === PS ? 1 : 0;
    expect(statesHeld(c, PS)).toBe(0);
    expect(setPatronage(c, 1)).toBe(false);
    withStates(c);
    expect(statesHeld(c, PS)).toBeGreaterThan(0);
    // What the states bring in goes to the government's treasury, on top of the head of government's share.
    const income = (level: number) => { setPatronage(c, level); return allocation(base, c) - govMoney(base, ALLOCATION.pm); };
    const [a, b, d] = [income(0), income(1), income(2)];
    expect(a).toBe(Math.round(govMoney(base, STATE_GOVERNMENT_INCOME) * statesHeld(c, PS)));
    expect(b).toBeGreaterThan(a);
    expect(d).toBeGreaterThan(b);
    expect(patronageMult(k)).toBe(PATRONAGE.mult[2]);
    expect(setPatronage(c, 3)).toBe(false);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });
  it('invite an inquiry that costs money, credibility and unity and puts the party back to little', () => {
    const c = career();
    withStates(c);
    const k = c.career!;
    setPatronage(c, 0);
    expect(patronageChance(c)).toBe(0);
    setPatronage(c, 1);
    const one = patronageChance(c);
    setPatronage(c, 2);
    expect(patronageChance(c)).toBeGreaterThan(one);
    const [funds, cred, unity] = [c.parties[PS]!.funds, k.credibility, c.parties[PS]!.unity];
    const rng = new Rng(2);
    for (let w = 0; w < 2000 && k.patronage; w++) patronageWeek(c, rng);
    expect(k.patronage).toBeUndefined();
    expect(c.parties[PS]!.funds).toBeLessThan(funds);
    expect(k.credibility).toBe(cred - PATRONAGE.credibility);
    expect(c.parties[PS]!.unity).toBeLessThan(unity);
    expect(c.news.at(-1)).toMatchObject({ key: 'news.patronage', tone: 'bad' });
  });
  it('drop to little by themselves when the party has no state left', () => {
    const c = career();
    withStates(c);
    setPatronage(c, 2);
    for (const st of Object.keys(c.career!.states)) c.career!.states[st] = PARTY_IDS.indexOf('bp');
    patronageWeek(c, new Rng(1));
    expect(c.career!.patronage).toBeUndefined();
  });
});

describe('the books', () => {
  it('list every source and every cost, and the net', () => {
    const c = career();
    const books = ledger(base, c);
    const i = termIncome(base, c);
    const s = termSpending(base, c);
    expect(books.income.reduce((a, l) => a + l.amount, 0)).toBe(i.total);
    expect(books.spending.reduce((a, l) => a + l.amount, 0)).toBe(s.total);
    expect(books.net).toBe(i.total - s.total);
    expect(books.income.every((l) => l.amount !== 0)).toBe(true);
    for (const l of [...books.income, ...books.spending]) expect(STRINGS.en[`ledger.${l.id}` as StringKey], l.id).toBeTruthy();
  });
});

describe('the deputy', () => {
  it('is a named person from a faction, the same every time they are looked at', () => {
    const c = career();
    const d = deputyOf(c);
    expect(CHIEF_NAMES[d.name]).toBeTruthy();
    expect(factionsOf(c).chief).not.toContain(d.name);
    expect(d.ambition).toBeGreaterThanOrEqual(30);
    expect(d.ambition).toBeLessThanOrEqual(70);
    expect(deputyOf(c)).toBe(d);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });
  it('grows more ambitious when the party doubts the leader', () => {
    const c = career();
    const f = factionsOf(c);
    f.mood = [20, 20, 20];
    f.wing = [20, 20, 20];
    const before = deputyOf(c).ambition;
    for (let w = 0; w < 100; w++) { f.mood = [20, 20, 20]; f.wing = [20, 20, 20]; factionsWeek(c); }
    expect(deputyOf(c).ambition).toBeGreaterThan(before);
    f.mood = [95, 95, 95];
    f.wing = [95, 95, 95];
    const high = deputyOf(c).ambition;
    for (let w = 0; w < 200; w++) { f.mood = [95, 95, 95]; f.wing = [95, 95, 95]; factionsWeek(c); }
    expect(deputyOf(c).ambition).toBeLessThan(high);
  });
  it('is likelier to be the challenger the more ambitious they are, and is harder to beat', () => {
    const c = career();
    deputyOf(c).ambition = 30;
    const mild = deputyChance(c);
    deputyOf(c).ambition = 90;
    expect(deputyChance(c)).toBeGreaterThan(mild);
    expect(pollOdds(c, 2, true)).toBeCloseTo(pollOdds(c, 2) - DEPUTY_EDGE, 9);
  });
  it('puts itself up at the party’s election sometimes, and sometimes a faction does', () => {
    const who = new Set<string>();
    for (let seed = 1; seed <= 40; seed++) {
      const c = career(seed);
      factionsOf(c).mood = [20, 20, 20];
      factionsOf(c).wing = [20, 20, 20];
      partyPoll(c, new Rng(seed));
      const scene = c.inbox.find((s) => s.kind === 'partyPoll');
      if (scene) who.add(scene.event === 'deputy' ? 'deputy' : 'faction');
    }
    expect([...who].sort()).toEqual(['deputy', 'faction']);
  });
});

describe('the one who lost', () => {
  const opposed = (c: Campaign) => { const g = c.career!.government; g.pm = PARTY_IDS.indexOf('bp'); g.partners = []; };
  it('is likelier to leave if a deputy, and unlikelier if a deal was struck', () => {
    const c = career();
    expect(leaveChance(c, true, false)).toBeGreaterThan(leaveChance(c, false, false));
    expect(leaveChance(c, false, true)).toBeLessThan(leaveChance(c, false, false));
  });
  it('takes seats away to the largest outside party or to sit as independents, and costs unity and the faction’s mood', () => {
    let left = 0, stayed = 0;
    const destinations = new Set<number>();
    const proto = career();
    opposed(proto);
    deputyOf(proto);
    for (let seed = 1; seed <= 60; seed++) {
      const c = structuredClone(proto);
      c.rng = seed * 7919;
      const k = c.career!;
      const mine = seatsHeldBy(base, c, PS).length;
      const [unity, mood] = [c.parties[PS]!.unity, factionsOf(c).mood[1]];
      const d = deputyOf(c);
      const outcome = challengerLeaves(base, c, true, d.faction, false);
      if (!outcome) {
        stayed++;
        expect(Object.keys(k.house)).toHaveLength(0);
        continue;
      }
      left++;
      const moved = Object.entries(k.house);
      expect(moved.length).toBe(WALKOUT.deputySeats);
      expect(seatsHeldBy(base, c, PS).length).toBe(mine - WALKOUT.deputySeats);
      for (const [, to] of moved) destinations.add(to);
      expect(c.parties[PS]!.unity).toBeLessThan(unity);
      expect(factionsOf(c).mood[d.faction]).toBeLessThan(d.faction === 1 ? mood : factionsOf(c).mood[d.faction] + 1);
      expect(factionsOf(c).deputy).toBeUndefined();
      expect(c.news.at(-1)!.key).toMatch(/^news\.partyPoll\.left/);
    }
    expect(left).toBeGreaterThan(5);
    expect(stayed).toBeGreaterThan(5);
    expect(destinations.has(PARTY_IDS.indexOf('oth'))).toBe(true);
    expect(destinations.size).toBeGreaterThan(1);
  });
  it('is part of winning a challenge at the party’s election', () => {
    let seen = false;
    const proto = career();
    opposed(proto);
    factionsOf(proto).mood = [90, 90, 90];
    factionsOf(proto).wing = [90, 90, 90];
    proto.parties[PS]!.unity = 90;
    for (let seed = 1; seed <= 60 && !seen; seed++) {
      const c = structuredClone(proto);
      c.rng = seed * 104729;
      const scene = { id: 1, kind: 'partyPoll' as const, from: null, event: 'deputy' };
      resolvePartyPoll(base, c, scene, 0);
      if (c.news.some((n) => n.key.startsWith('news.partyPoll.left'))) seen = true;
    }
    expect(seen).toBe(true);
  });
});

describe('strings', () => {
  it('exist in both languages', () => {
    const keys = ['orders.patronage', 'orders.patronage.desc', 'orders.patronage.0', 'orders.patronage.1', 'orders.patronage.2', 'orders.patronage.risk', 'orders.ledger', 'party.deputy', 'partyPoll.deputy', 'news.patronage', 'news.partyPoll.left', 'news.partyPoll.leftIndep'] as StringKey[];
    for (const key of keys) { expect(STRINGS.en[key], key).toBeTruthy(); expect(STRINGS.ms[key], key).toBeTruthy(); }
    for (const id of ['members', 'donors', 'crowd', 'state', 'assets', 'states', 'machinery', 'media', 'research', 'wages']) {
      expect(STRINGS.ms[`ledger.${id}` as StringKey], id).toBeTruthy();
    }
  });
});
