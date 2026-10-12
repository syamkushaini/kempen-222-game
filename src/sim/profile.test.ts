import { describe, expect, it } from 'vitest';
import { getWorld } from '../data/world';
import { profileOf } from './profile';

describe('the profile of a contest', () => {
  it('describes the whole country in a general election', () => {
    const w = getWorld('general')!;
    const p = profileOf(w);
    expect(p.seats).toBe(222);
    expect(p.voters).toBe(w.totalElectorate);
    expect(p.places.urban + p.places.semi + p.places.rural).toBeCloseTo(1, 3);
    expect(p.groups.reduce((a, g) => a + g.share, 0)).toBeCloseTo(1, 3);
    for (let i = 1; i < p.groups.length; i++) expect(p.groups[i - 1].share).toBeGreaterThanOrEqual(p.groups[i].share);
    expect(p.leaders.reduce((a, l) => a + l.seats, 0)).toBe(222);
    expect(p.turnout).toBeGreaterThan(0.5);
    expect(p.turnout).toBeLessThan(1);
    expect(p.largest.voters).toBeGreaterThan(p.smallest.voters);
    expect(p.regions.length).toBe(3);
  });

  it('describes one state in a state election, with that state’s own voters', () => {
    const country = profileOf(getWorld('general')!);
    for (const st of ['perak', 'sarawak', 'perlis'] as const) {
      const p = profileOf(getWorld(`state:${st}`)!);
      expect(p.seats).toBeGreaterThan(10);
      expect(p.seats).toBeLessThan(country.seats);
      expect(p.voters).toBeLessThan(country.voters);
      expect(p.groups.reduce((a, g) => a + g.share, 0)).toBeCloseTo(1, 3);
      expect(p.marginal + p.safe).toBeLessThanOrEqual(p.seats);
    }
    expect(profileOf(getWorld('state:sarawak')!).places.rural).toBeGreaterThan(profileOf(getWorld('state:penang')!).places.rural);
  });
});
