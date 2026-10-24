import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { pointsFor, challengePoints, useOfCampaign, type Showing } from './challengePoints';
import { legacyOf } from './legacy';
import { THRIFT, careerUse, thriftFactor, useOf } from './thrift';

const world = getWorld('career')!;
const PS = PARTY_IDS.indexOf('ps');
const showing: Showing = { seats: 120, total: 222, line: 112, share: 0.45, difficulty: 'normal', rules: 0 };

describe('thrift', () => {
  it('is the share of its money a party spent, whatever the sum', () => {
    expect(useOf(0, 500_000)).toBe(0);
    expect(useOf(100_000, 900_000)).toBeCloseTo(0.1, 9);
    expect(useOf(10_000, 90_000)).toBeCloseTo(0.1, 9);
    expect(useOf(500_000, 0)).toBe(1);
    expect(useOf(0, 0)).toBe(0);
    expect(useOf(-5, -5)).toBe(0);
  });

  it('is worth 1.10 for nothing spent and 0.80 for everything, in a straight line', () => {
    expect(thriftFactor(0)).toBeCloseTo(THRIFT.best, 9);
    expect(thriftFactor(1)).toBeCloseTo(THRIFT.worst, 9);
    expect(thriftFactor(0.5)).toBeCloseTo((THRIFT.best + THRIFT.worst) / 2, 9);
    expect(thriftFactor(7)).toBeCloseTo(THRIFT.worst, 9);
    expect(thriftFactor(-1)).toBeCloseTo(THRIFT.best, 9);
  });

  it('gives a challenge more points for spending less of what it had, and the same for a rich party and a poor one', () => {
    const frugal = pointsFor({ ...showing, use: 0.1 });
    const spent = pointsFor({ ...showing, use: 0.9 });
    expect(frugal).toBeGreaterThan(spent);
    expect(pointsFor({ ...showing, use: undefined })).toBe(pointsFor({ ...showing }));
    expect(pointsFor({ ...showing, use: 0.5 })).toBeGreaterThan(spent);
    // The same share is the same points.
    expect(pointsFor({ ...showing, use: useOf(1_000, 9_000) })).toBe(pointsFor({ ...showing, use: useOf(1_000_000, 9_000_000) }));
  });

  it('is read from the campaign itself', () => {
    const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 3 });
    const pc = c.parties[PS]!;
    pc.spent = 0; pc.funds = 400_000;
    const thrifty = challengePoints(world, c, 120, 0.45);
    expect(useOfCampaign(c)).toBe(0);
    pc.spent = 400_000;
    const spendthrift = challengePoints(world, c, 120, 0.45);
    expect(useOfCampaign(c)).toBe(0.5);
    pc.spent = 4_000_000;
    expect(challengePoints(world, c, 120, 0.45)).toBeLessThan(spendthrift);
    expect(thrifty).toBeGreaterThan(spendthrift);
  });

  it('is averaged over the elections of a career, and left out for one that did not keep it', () => {
    expect(careerUse(undefined)).toBeNull();
    expect(careerUse([{}, {}])).toBeNull();
    expect(careerUse([{ use: 0.2 }, { use: 0.6 }, {}])).toBeCloseTo(0.4, 9);
  });

  it('moves the score of a career, and not its legacy bonus', () => {
    const make = (use: number | null) => {
      const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 3 });
      const r = c.career!.record;
      r.elections = 3; r.victories = 2; r.weeksPm = 200; r.bestSeats = 100;
      r.terms = use === null ? [{ seats: 100, pm: true }, { seats: 100, pm: true }] : [{ seats: 100, pm: true, use }, { seats: 100, pm: true, use }];
      return legacyOf(c);
    };
    const none = make(null), thrifty = make(0), spent = make(1);
    expect(thrifty.score).toBeGreaterThan(none.score);
    expect(spent.score).toBeLessThan(none.score);
    expect(thrifty.legacy).toBe(spent.legacy);
  });
});
