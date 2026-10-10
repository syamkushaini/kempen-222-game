import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { majorityLine } from '../election';
import { PARTY_IDS } from '../types';
import { challengePoints, finishedChallenge, LEVEL_FACTOR, POINTS_MAX, pointsFor, rulesTaken, type Showing } from './challengePoints';
import { closeNight, autoPlayWeek, endWeek, newCampaign } from './turn';
import { recordPoints, totalPoints, emptyProfile, parseProfile } from '../../state/profile';

const show = (over: Partial<Showing> = {}): Showing => ({ seats: 112, total: 222, line: 112, share: 0.5, difficulty: 'normal', rules: 0, ...over });

describe('the points of a challenge', () => {
  it('are nothing for no seats and no votes, and a hundred for a majority and half the vote, on the usual level', () => {
    expect(pointsFor(show({ seats: 0, share: 0 }))).toBe(0);
    expect(pointsFor(show({ seats: 112, share: 0.5 }))).toBe(90);
    // A landslide adds up to ten more.
    expect(pointsFor(show({ seats: 222, share: 0.5 }))).toBe(100);
    // Seats count in proportion up to the majority, and not above it for that part.
    expect(pointsFor(show({ seats: 56, share: 0 }))).toBe(35);
    expect(pointsFor(show({ seats: 112, share: 0 }))).toBe(70);
    expect(pointsFor(show({ seats: 150, share: 0 }))).toBeGreaterThan(70);
  });

  it('grow with each seat, each point of the vote, a tougher level and each rule taken, and never past the limit of the table', () => {
    let last = -1;
    for (let seats = 0; seats <= 222; seats += 6) { const p = pointsFor(show({ seats })); expect(p).toBeGreaterThanOrEqual(last); last = p; }
    last = -1;
    for (let share = 0; share <= 1; share += 0.05) { const p = pointsFor(show({ seats: 80, share })); expect(p).toBeGreaterThanOrEqual(last); last = p; }
    const base = show({ seats: 100, share: 0.4 });
    expect(pointsFor({ ...base, difficulty: 'easy' })).toBeLessThan(pointsFor(base));
    expect(pointsFor({ ...base, difficulty: 'hard' })).toBeGreaterThan(pointsFor(base));
    for (let rules = 0; rules < 4; rules++) expect(pointsFor({ ...base, rules: rules + 1 })).toBeGreaterThan(pointsFor({ ...base, rules }));
    expect(LEVEL_FACTOR.easy).toBeLessThan(LEVEL_FACTOR.normal);
    const best = pointsFor(show({ seats: 222, share: 1, difficulty: 'hard', rules: 4 }));
    expect(best).toBeLessThanOrEqual(POINTS_MAX);
    expect(best).toBeGreaterThan(150);
    expect(pointsFor(show({ seats: 9999, share: 5, difficulty: 'hard', rules: 99 }))).toBe(POINTS_MAX);
  });

  it('count a by-election as a seat won or lost, and the vote', () => {
    const seat = { total: 1, line: 1 };
    expect(pointsFor(show({ ...seat, seats: 1, share: 0.45 }))).toBe(98);
    expect(pointsFor(show({ ...seat, seats: 0, share: 0.45 }))).toBe(18);
    expect(pointsFor(show({ ...seat, seats: 0, share: 0.3 }))).toBe(12);
  });

  it('are the same for everyone who plays the same challenge, and count the rules the game was played under', () => {
    const world = getWorld('state:perlis')!;
    const make = (rules: { fog?: boolean; noisy?: boolean; lean?: boolean }, totalWeeks?: number) =>
      newCampaign(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'hard', seed: 5, ...(totalWeeks ? { totalWeeks } : {}), challenge: { fog: !!rules.fog, noisy: !!rules.noisy, lean: !!rules.lean, code: 'x~y~z~w' } });
    expect(rulesTaken(world, make({}))).toBe(0);
    expect(rulesTaken(world, make({ fog: true, noisy: true, lean: true }, world.rules.weeks - 1))).toBe(4);
    const plain = challengePoints(world, make({}), 8, 0.4);
    expect(challengePoints(world, make({}), 8, 0.4)).toBe(plain);
    expect(challengePoints(world, make({ fog: true }), 8, 0.4)).toBeGreaterThan(plain);
    expect(plain).toBe(pointsFor({ seats: 8, total: world.seats.length, line: majorityLine(world), share: 0.4, difficulty: 'hard', rules: 0 }));
  });

  it('are worked out only once the votes are counted, and only for a challenge', () => {
    const world = getWorld('state:perlis')!;
    const c = newCampaign(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5, challenge: { fog: false, noisy: false, code: '1~state:perlis~ps~5~n~~' } });
    expect(finishedChallenge(world, c)).toBeNull();
    while (c.phase === 'campaign') { autoPlayWeek(world, c); endWeek(world, c); }
    expect(finishedChallenge(world, c)).toBeNull();
    closeNight(world, c);
    const done = finishedChallenge(world, c)!;
    expect(done.key).toBe('1~state:perlis~ps~5~n~~');
    expect(done.points).toBe(challengePoints(world, c, done.seats, done.share));
    // The same game, if it was no challenge, has none.
    const plain = newCampaign(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5 });
    while (plain.phase === 'campaign') endWeek(world, plain);
    closeNight(world, plain);
    expect(finishedChallenge(world, plain)).toBeNull();
  });
});

describe('the points on a profile', () => {
  it('keep the best of each challenge, add up across challenges, and survive being saved and read back', () => {
    let p = emptyProfile();
    expect(totalPoints(p)).toBe(0);
    p = recordPoints(p, 'set:perlis', 60);
    expect(recordPoints(p, 'set:perlis', 50)).toBe(p);
    expect(recordPoints(p, 'set:perlis', 60)).toBe(p);
    p = recordPoints(p, 'set:perlis', 75);
    p = recordPoints(p, '1~general~ps~1~h~~', 40);
    expect(p.challengePoints).toEqual({ 'set:perlis': 75, '1~general~ps~1~h~~': 40 });
    expect(totalPoints(p)).toBe(115);
    expect(parseProfile(JSON.stringify(p)).challengePoints).toEqual(p.challengePoints);
    // Nonsense is dropped rather than trusted.
    const bad = parseProfile(JSON.stringify({ challengePoints: { ok_key: 10, no: 5, 'set:x1': -3, 'set:x2': 9999, 'set:x3': 'many', 'set:fine': 20 } }));
    expect(bad.challengePoints).toEqual({ ok_key: 10, 'set:fine': 20 });
    expect(parseProfile(JSON.stringify({ challengePoints: 'lots' })).challengePoints).toBeUndefined();
  });

  it('keep at most two hundred challenges, the newest among them', () => {
    let p = emptyProfile();
    for (let i = 0; i < 230; i++) p = recordPoints(p, `set:challenge${i}`, 10 + (i % 50));
    expect(Object.keys(p.challengePoints!)).toHaveLength(200);
    expect(p.challengePoints!['set:challenge229']).toBeDefined();
    expect(p.challengePoints!['set:challenge0']).toBeUndefined();
  });
});
