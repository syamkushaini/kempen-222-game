import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { HOPEFUL_NAMES, HOPEFUL_TRAITS, makeKeySeats } from './candidates';
import { startCareer } from './career';

describe('the names of hopefuls', () => {
  it('are many and none is repeated, and each has its traits', () => {
    expect(HOPEFUL_NAMES.length).toBeGreaterThanOrEqual(100);
    expect(new Set(HOPEFUL_NAMES).size).toBe(HOPEFUL_NAMES.length);
    expect(HOPEFUL_TRAITS).toHaveLength(HOPEFUL_NAMES.length);
    // The first ones keep their places, as saved games point at them by number.
    expect(HOPEFUL_NAMES[0]).toBe('Zainal Abidin Hamzah');
    expect(HOPEFUL_NAMES[23]).toBe('Dayang Norlia Sapawi');
    for (const ethnic of ['malay', 'chinese', 'indian', 'bumi']) expect(HOPEFUL_TRAITS.filter((t) => t.ethnic === ethnic).length).toBeGreaterThan(20);
    expect(HOPEFUL_TRAITS.some((t) => t.woman)).toBe(true);
    expect(HOPEFUL_TRAITS.some((t) => t.young)).toBe(true);
  });

  it('do not run out when every close seat has four hopefuls: no two in a campaign share a name', () => {
    const world = getWorld('career')!;
    for (const player of PARTY_IDS.slice(0, 3).map((_, i) => i)) {
      const c = startCareer(world, { player, difficulty: 'normal', seed: 3 });
      const keys = makeKeySeats(world, c, new Rng(11));
      const names = keys.flatMap((k) => k.options.map((o) => o.name));
      expect(names.length).toBeGreaterThanOrEqual(24);
      expect(new Set(names).size).toBe(names.length);
    }
  });
});
