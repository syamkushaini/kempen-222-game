import { describe, expect, it } from 'vitest';
import { getWorld, loadScenario } from '../../data/world';
import { PARTY_IDS } from '../types';
import { earned } from './achievements';
import { autoPlayWeek, endWeek, newCampaign, closeNight } from './turn';
import { decodeChallenge, encodeChallenge } from './challengeCode';
import { playable } from './field';
import { FIRST_WEEK, timeLeft, weekEnd, weekEnded, weekIndex, weekOfCode, weeklyCode, weeklySpec, weekStart, WEEK_MS } from './weekly';

const mytMonday = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d) - 8 * 3_600_000;

describe('the week', () => {
  it('begins on Monday at midnight in Malaysia and runs for seven days', () => {
    const monday = mytMonday(2026, 10, 12);
    expect(weekStart(weekIndex(monday))).toBe(monday);
    expect(weekIndex(monday - 1)).toBe(weekIndex(monday) - 1);
    expect(weekIndex(monday + WEEK_MS - 1)).toBe(weekIndex(monday));
    expect(weekIndex(monday + WEEK_MS)).toBe(weekIndex(monday) + 1);
    expect(weekEnd(weekIndex(monday)) - weekStart(weekIndex(monday))).toBe(WEEK_MS);
    // Sunday evening in Kuala Lumpur is still the old week, though it is Sunday afternoon in London and Monday in Auckland.
    expect(weekIndex(Date.UTC(2026, 9, 11, 15, 59))).toBe(weekIndex(monday) - 1);
    expect(weekIndex(Date.UTC(2026, 9, 11, 16, 0))).toBe(weekIndex(monday));
    expect(timeLeft(monday + 3_600_000)).toBe(WEEK_MS - 3_600_000);
  });
});

describe('the challenge of the week', () => {
  const now = mytMonday(2026, 10, 12) + 1000;
  const n = weekIndex(now);

  it('is the same for everyone in a week, and changes with the week', () => {
    expect(weeklySpec(n)).toEqual(weeklySpec(n));
    expect(weeklyCode(n)).toBe(encodeChallenge(weeklySpec(n)));
    const codes = new Set(Array.from({ length: 104 }, (_, i) => weeklyCode(n + i)));
    expect(codes.size).toBe(104);
    expect(new Set(Array.from({ length: 104 }, (_, i) => weeklySpec(n + i).seed)).size).toBeGreaterThan(100);
  });

  it('is never the contest and party of the week before', () => {
    for (let i = 0; i < 200; i++) {
      const a = weeklySpec(n + i), b = weeklySpec(n + i + 1);
      expect(a.scenario === b.scenario && a.party === b.party, `week ${n + i}`).toBe(false);
    }
  });

  it('is a code the game reads back, a contest that can be played, and a party that can be led in it, for a year and more of weeks', async () => {
    const seen = { scenarios: new Set<string>(), rules: new Set<string>(), levels: new Set<string>(), parties: new Set<string>() };
    for (let i = 0; i < 120; i++) {
      const spec = weeklySpec(n + i);
      expect(decodeChallenge(weeklyCode(n + i)), `week ${n + i}`).toEqual(spec);
      await loadScenario(spec.scenario);
      const world = getWorld(spec.scenario);
      expect(world, spec.scenario).not.toBeNull();
      expect(world!.rules.career).toBeFalsy();
      expect(world!.rules.kind).not.toBe('hung');
      expect(playable(world!).map((p) => PARTY_IDS[p]), `${spec.scenario} ${spec.party}`).toContain(spec.party);
      seen.scenarios.add(spec.scenario.startsWith('byelection') ? 'byelection' : spec.scenario.startsWith('state') ? 'state' : spec.scenario);
      seen.rules.add(`${spec.fog}${spec.noisy}${spec.lean}${spec.weeks ?? ''}`);
      seen.levels.add(spec.difficulty);
      seen.parties.add(spec.party);
    }
    // Over time it is every kind of contest, the parties that can be led, both levels of rival, and the rules in their combinations.
    expect([...seen.scenarios].sort()).toEqual(['byelection', 'general', 'state']);
    expect(seen.rules.size).toBeGreaterThanOrEqual(6);
    expect(seen.levels.size).toBe(2);
    expect(seen.parties.size).toBe(4);
  }, 60_000);

  it('is known by its code, from the first week the game had one for ten years, and by nothing else', () => {
    expect(weekOfCode(weeklyCode(n))).toBe(n);
    expect(weekOfCode(weeklyCode(n + 100))).toBe(n + 100);
    expect(weekOfCode(weeklyCode(FIRST_WEEK))).toBe(FIRST_WEEK);
    expect(weekOfCode(weeklyCode(FIRST_WEEK - 1))).toBeNull();
    expect(weekOfCode('1~general~ps~1~h~~')).toBeNull();
    expect(weekOfCode('1~state:perlis~ps~4242~h~f~4')).toBeNull();
  });

  it('is over when its week is, and a challenge that was not the week’s is never over', () => {
    const code = weeklyCode(n);
    expect(weekEnded(code, weekStart(n))).toBe(false);
    expect(weekEnded(code, weekEnd(n) - 1)).toBe(false);
    expect(weekEnded(code, weekEnd(n))).toBe(true);
    expect(weekEnded(code, weekEnd(n) + 100 * WEEK_MS)).toBe(true);
    expect(weekEnded('1~general~ps~1~h~~', weekEnd(n) + 100 * WEEK_MS)).toBe(false);
  });
});

describe('playing the challenge of the week', () => {
  const play = async (code: string) => {
    const spec = decodeChallenge(code)!;
    await loadScenario(spec.scenario);
    const world = getWorld(spec.scenario)!;
    const c = newCampaign(world, { player: PARTY_IDS.indexOf(spec.party), difficulty: spec.difficulty, seed: spec.seed, ...(spec.weeks ? { totalWeeks: spec.weeks } : {}), challenge: { fog: spec.fog, noisy: spec.noisy, lean: spec.lean, code } });
    return { world, c };
  };

  it('earns its badge once the votes are counted, and a challenge that was not the week’s does not', async () => {
    const week = await play(weeklyCode(weekIndex(Date.now())));
    expect(earned(week.world, week.c)).not.toContain('weekly');
    while (week.c.phase === 'campaign') { autoPlayWeek(week.world, week.c); endWeek(week.world, week.c); }
    closeNight(week.world, week.c);
    expect(earned(week.world, week.c)).toContain('weekly');
    const other = await play('1~general~ps~4242~h~~');
    while (other.c.phase === 'campaign') { autoPlayWeek(other.world, other.c); endWeek(other.world, other.c); }
    closeNight(other.world, other.c);
    expect(earned(other.world, other.c)).not.toContain('weekly');
  }, 60_000);
});
