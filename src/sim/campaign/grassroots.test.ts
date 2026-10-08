import { describe, expect, it } from 'vitest';
import { getWorld, worldOf } from '../../data/world';
import { PARTY_IDS } from '../types';
import { projectElection } from '../election';
import { answerEvent, nextTerm, resumeTerm, skipAhead, startCareer, TERM_LIMIT, canDissolve } from './career';
import { effectiveDynamics } from './actions';
import { endDay } from './formation';
import { GRASSROOTS_MAX, baseRolls, grassrootsLift } from './party';
import { isEnacted } from './policy';
import { seatOf } from './events';
import { isPm } from './office';
import { closeNight, endWeek } from './turn';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const base = getWorld('career')!;
const career = (seed = 5): Campaign => startCareer(base, { player: PS, difficulty: 'normal', seed });

describe('an organisation built over the years', () => {
  it('is worth nothing for the members and branches a party starts with, and the full amount for sixty per cent more members and strong branches', () => {
    const c = career();
    expect(grassrootsLift(base, c)).toBe(0);
    const strong = career();
    strong.parties[PS]!.machinery = strong.parties[PS]!.machinery.map((m) => (m > 0 ? 90 : 0));
    strong.career!.rolls = baseRolls(base, strong) * 1.7;
    expect(grassrootsLift(base, strong)).toBeCloseTo(GRASSROOTS_MAX, 6);
    // Both halves are needed.
    const members = career();
    members.career!.rolls = baseRolls(base, members) * 1.7;
    members.parties[PS]!.machinery = members.parties[PS]!.machinery.map((m) => (m > 0 ? 30 : 0));
    expect(grassrootsLift(base, members)).toBe(0);
    const branches = career();
    branches.parties[PS]!.machinery = branches.parties[PS]!.machinery.map((m) => (m > 0 ? 90 : 0));
    expect(grassrootsLift(base, branches)).toBe(0);
  });

  it('adds seats at the next election: enough to matter, not enough to win on its own at once', () => {
    const seats = (lift: number) => {
      const c = career();
      for (const row of c.drift.support.nat) row[PS] += lift;
      return projectElection(base, effectiveDynamics(c), c.standDowns).tally[PS];
    };
    const none = seats(0), full = seats(GRASSROOTS_MAX);
    expect(full - none).toBeGreaterThanOrEqual(8);
    expect(full).toBeLessThan(112 + 25);
  });
});

describe('a term limit that has become law', () => {
  /** Plays a term out and into the next, as the winner of the election. */
  const nextParliament = (c: Campaign) => {
    let world = worldOf(c) ?? base;
    for (let g = 0; g < 4000 && c.phase !== 'campaign'; g++) {
      if (c.phase === 'term') { if (c.inbox.length) answerEvent(world, c, c.inbox.shift()!, 0); else skipAhead(world, c, 26); }
      else if (c.phase === 'formation') endDay(world, c);
      else if (c.phase === 'done') resumeTerm(c);
    }
    while (c.phase === 'campaign') endWeek(world, c);
    closeNight(world, c);
    for (let d = 0; d < 10 && c.phase === 'formation'; d++) endDay(world, c);
    // The player's party is made to come out on top, so that only the law can stop the leader.
    c.formation!.outcome = { ...c.formation!.outcome!, pm: PS };
    expect(nextTerm(world, c)).toBe(true);
    world = worldOf(c)!;
    return world;
  };

  it('lets a leader head two parliaments in a row, and holds them out of the third', () => {
    const c = career();
    c.career!.laws = ['termLimit'];
    expect(isEnacted(c.career!, 'termLimit')).toBe(true);
    expect(c.career!.pmRun).toBe(1);
    expect(isPm(c)).toBe(true);
    nextParliament(c);
    expect(c.career!.pmRun).toBe(2);
    expect(c.career!.limited).toBeUndefined();
    expect(isPm(c)).toBe(true);
    // Carry the law over: it was written into the career, and travels with it.
    c.career!.laws = ['termLimit'];
    const world = nextParliament(c);
    expect(c.career!.pmRun).toBe(3);
    expect(TERM_LIMIT).toBe(2);
    expect(c.career!.limited).toBe(true);
    // The party governs, the leader does not.
    expect(c.career!.government.pm).toBe(PS);
    expect(isPm(c)).toBe(false);
    expect(seatOf(c)).toBe('gov');
    c.career!.week = 200;
    expect(canDissolve(c)).toBe(false);
    expect(c.news.some((n) => n.key === 'news.term.limited')).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  }, 60_000);

  it('does not bind a leader whose party has not made it law', () => {
    const c = career();
    nextParliament(c);
    nextParliament(c);
    expect(c.career!.pmRun).toBe(3);
    expect(c.career!.limited).toBeUndefined();
    expect(isPm(c)).toBe(true);
  }, 60_000);
});
