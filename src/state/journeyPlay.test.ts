import { beforeEach, describe, expect, it } from 'vitest';
import '../data/allStates';
import { dunByElections } from '../data/world';
import { FOUNDING_SLOT } from '../sim/campaign/founding';
import { DUN_LEVELS, journeyLevel } from '../sim/campaign/journey';
import { PARTY_IDS } from '../sim/types';
import { useStore } from './store';

const store = () => useStore.getState();

describe('the journey, played through the store', () => {
  beforeEach(() => { useStore.setState((s) => ({ profile: { ...s.profile, journey: undefined } })); });

  it('starts in Selangor and moves the level up only for a DUN by-election won', () => {
    const seats = dunByElections('selangor');
    expect(seats.length).toBeGreaterThan(DUN_LEVELS);
    const outcomes: boolean[] = [];
    for (let seed = 1; seed <= 12; seed++) {
      useStore.setState((s) => ({ profile: { ...s.profile, journey: undefined } }));
      store().quitToTitle();
      store().startCampaign({ name: 'T', scenario: seats[0], player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, seed, founded: true });
      useStore.setState((s) => ({ game: { ...s.game!, tutorial: null } }));
      store().finishWithTeam();
      store().finishNight();
      const level = journeyLevel(store().profile.journey);
      outcomes.push(level === 2);
      expect([1, 2]).toContain(level);
    }
    // a lost contest leaves the level where it was, a won one adds one
    expect(outcomes.some(Boolean)).toBe(true);
    expect(outcomes.some((w) => !w)).toBe(true);
  });
});
