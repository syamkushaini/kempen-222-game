import { describe, expect, it } from 'vitest';
import { FEDERAL_SEATS, TIERS, nextTier, pointsToNext, tierForPoints } from './progression';

describe('progression', () => {
  it('starts a fresh player at the bottom tier with one seat', () => {
    expect(tierForPoints(0).id).toBe('activist');
    expect(tierForPoints(0).maxContest).toBe(1);
  });

  it('climbs the ladder as points rise', () => {
    expect(tierForPoints(19).id).toBe('activist');
    expect(tierForPoints(20).id).toBe('organiser');
    expect(tierForPoints(300).id).toBe('leader');
    expect(tierForPoints(10_000).id).toBe('leader');
  });

  it('the top tier can contest every seat in the house', () => {
    expect(TIERS[TIERS.length - 1].maxContest).toBe(FEDERAL_SEATS);
  });

  it('reports the next tier and how far it is', () => {
    expect(nextTier(0)?.id).toBe('organiser');
    expect(pointsToNext(0)).toBe(20);
    expect(pointsToNext(10)).toBe(10);
    expect(nextTier(300)).toBeNull();
    expect(pointsToNext(300)).toBeNull();
  });

  it('tiers are ordered by rising point thresholds', () => {
    for (let i = 1; i < TIERS.length; i++) expect(TIERS[i].minPoints).toBeGreaterThan(TIERS[i - 1].minPoints);
  });
});
