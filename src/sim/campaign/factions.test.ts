import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { answerEvent, startCareer, termWeek } from './career';
import {
  FACTION_IDS, PARTY_POLL_EVERY, POLL_ANSWERS, WING_IDS, backing, challengeChance, factionsOf, factionsWeek, partyPoll, partyPollWeek, pollOdds,
} from './factions';
import { Rng } from '../rng';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const base = getWorld('career')!;
const career = (seed = 5): Campaign => {
  const c = startCareer(base, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  return c;
};
const setBacking = (c: Campaign, mood: number) => { const f = factionsOf(c); f.mood = f.mood.map(() => mood); f.wing = f.wing.map(() => mood); };

describe('the party’s factions and wings', () => {
  it('are three of each, each with a head, and the party’s members add up', () => {
    const c = career();
    const f = factionsOf(c);
    expect(f.size).toHaveLength(FACTION_IDS.length);
    expect(f.size.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
    expect(f.wing).toHaveLength(WING_IDS.length);
    expect(new Set(f.chief).size).toBe(6);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
    for (const lang of ['en', 'ms'] as const) for (const k of [...FACTION_IDS.flatMap((i) => [`faction.${i}`, `faction.${i}.desc`]), ...WING_IDS.flatMap((i) => [`wing.${i}`, `wing.${i}.desc`])]) expect(STRINGS[lang][k as StringKey], k).toBeTruthy();
  });

  it('feel what the leader earns: a believed, united party warms to them, a disbelieved one cools', () => {
    const good = career();
    good.career!.credibility = 95; good.parties[PS]!.unity = 95;
    for (let i = 0; i < 150; i++) factionsWeek(good);
    const bad = career();
    bad.career!.credibility = 10; bad.parties[PS]!.unity = 20;
    for (let i = 0; i < 150; i++) factionsWeek(bad);
    expect(backing(good)).toBeGreaterThan(backing(bad) + 20);
    expect(backing(good)).toBeGreaterThan(65);
  });

  it('shift with the line the leader takes: the reformers like reform, the veterans do not', () => {
    const reformer = career(); reformer.career!.stances[PS][3] = 2; reformer.career!.stances[PS][4] = 2;
    const standpat = career(); standpat.career!.stances[PS][3] = -2; standpat.career!.stances[PS][4] = -2;
    for (const c of [reformer, standpat]) for (let i = 0; i < 200; i++) factionsWeek(c);
    const mood = (c: Campaign, id: (typeof FACTION_IDS)[number]) => factionsOf(c).mood[FACTION_IDS.indexOf(id)];
    expect(mood(reformer, 'reformers')).toBeGreaterThan(mood(standpat, 'reformers'));
    expect(mood(reformer, 'veterans')).toBeLessThan(mood(standpat, 'veterans'));
  });
});

describe('the party’s meeting', () => {
  it('comes once a term, three years in, and not before', () => {
    const c = career();
    c.career!.week = PARTY_POLL_EVERY - 1;
    expect(partyPollWeek(c)).toBe(false);
    c.career!.week = PARTY_POLL_EVERY;
    expect(partyPollWeek(c)).toBe(true);
    partyPoll(c, new Rng(1));
    expect(partyPollWeek(c)).toBe(false);
  });

  it('returns a leader the party backs without a contest', () => {
    const c = career();
    setBacking(c, 90);
    expect(challengeChance(c)).toBe(0);
    c.career!.week = PARTY_POLL_EVERY;
    const unity = c.parties[PS]!.unity;
    partyPoll(c, new Rng(2));
    expect(c.inbox).toHaveLength(0);
    expect(c.parties[PS]!.unity).toBe(Math.min(100, unity + 3));
    expect(c.news.some((n) => n.key === 'news.partyPoll.unopposed')).toBe(true);
  });

  it('puts a challenge to a leader the party does not back, from the faction most set against them', () => {
    const c = career();
    setBacking(c, 5);
    factionsOf(c).mood[1] = 0;
    expect(challengeChance(c)).toBe(1);
    c.career!.week = PARTY_POLL_EVERY;
    partyPoll(c, new Rng(3));
    expect(c.inbox).toHaveLength(1);
    expect(c.inbox[0]).toMatchObject({ kind: 'partyPoll', event: 'reformers' });
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('is likelier won with courting and a deal than on the record alone, and costs money to court', () => {
    const c = career();
    setBacking(c, 40);
    const [court, deal, record] = [0, 1, 2].map((i) => pollOdds(c, i));
    expect(court).toBeGreaterThan(deal);
    expect(deal).toBeGreaterThan(record);
    expect(POLL_ANSWERS[0].money).toBeGreaterThan(0);
  });

  it('can be lost, and a leader who loses is out; a leader who wins carries on, a little more united', () => {
    let lost = 0, won = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const c = career(seed);
      setBacking(c, 10);
      c.parties[PS]!.funds = 5_000_000;
      c.career!.week = PARTY_POLL_EVERY;
      partyPoll(c, new Rng(seed));
      const scene = c.inbox.shift()!;
      answerEvent(base, c, scene, 2);
      if (c.career!.ending) { lost++; expect(c.career!.ending.kind).toBe('ousted'); } else won++;
    }
    expect(lost).toBeGreaterThan(5);
    expect(won).toBeGreaterThan(3);
  });

  it('comes up by itself in a term, as soon as nothing else is waiting on the leader', () => {
    const c = career(7);
    setBacking(c, 5);
    c.career!.week = PARTY_POLL_EVERY;
    for (let i = 0; i < 12 && !c.inbox.some((sc) => sc.kind === 'partyPoll'); i++) {
      // Whatever else is waiting is answered, as a player would; the weeks of a round of state polls were skipped past.
      while (c.inbox.length && c.inbox[0].kind !== 'partyPoll') answerEvent(base, c, c.inbox.shift()!, 0);
      if (c.inbox.length) break;
      setBacking(c, 5);
      termWeek(base, c);
    }
    expect(c.inbox.some((sc) => sc.kind === 'partyPoll')).toBe(true);
    expect(c.career!.flags).toContain(`partyPoll${c.career!.term}`);
  });
});
