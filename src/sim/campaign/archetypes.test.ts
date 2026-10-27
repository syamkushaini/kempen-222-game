import { describe, expect, it } from 'vitest';
import { ARCHETYPES, archetypeOf, unlockedArchetypes } from './archetypes';

describe('archetypes', () => {
  it('has the four named archetypes, each with a cost and a backstory', () => {
    const ids = ARCHETYPES.map((a) => a.id);
    expect(ids).toEqual(['technocratPlus', 'grassrootsJaguh', 'youthIcon', 'partyWarlord']);
    for (const a of ARCHETYPES) {
      expect(a.cost).toBeGreaterThan(0);
      expect(a.backstory).toBeTruthy();
    }
  });

  it('looks an archetype up by id', () => {
    expect(archetypeOf('youthIcon')?.label).toBe('Youth Icon');
    expect(archetypeOf('nope')).toBeUndefined();
  });

  it('filters to what a profile has actually unlocked', () => {
    expect(unlockedArchetypes([]).length).toBe(0);
    expect(unlockedArchetypes(['partyWarlord']).map((a) => a.id)).toEqual(['partyWarlord']);
  });
});
