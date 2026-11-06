import { beforeEach, describe, expect, it } from 'vitest';
import '../data/allStates';
import { dunByElections, getWorld, nextContest } from '../data/world';
import { FOUNDING_SLOT } from '../sim/campaign/founding';
import { emptyJourney, nextAfterLoss, nextStep, record } from '../sim/campaign/journey';
import { PARTY_IDS } from '../sim/types';
import { useStore } from './store';

const dun = () => dunByElections('selangor')[0];

describe('advancing along the journey', () => {
  it('offers nothing after a by-election that was not won (the old rule would offer the state election)', () => {
    const j = emptyJourney();
    expect(nextStep(j, dun(), dunByElections)).toBeNull();
    // what the old fallback would have done: carry the player on regardless
    expect(nextContest(dun(), getWorld(dun())!)).toBe('state:selangor');
  });
  it('offers nothing after a state election that did not take the state', () => {
    expect(nextStep(emptyJourney(), 'state:selangor', dunByElections)).toBeNull();
    expect(nextStep(record(emptyJourney(), 'state:selangor', { won: true, governed: false }), 'state:selangor', dunByElections)).toBeNull();
  });
});

describe('carrying on after a loss', () => {
  const seats = dunByElections('selangor');
  it('offers the same by-election again, whichever seat it was', () => {
    expect(nextAfterLoss(emptyJourney(), seats[0])).toBe(seats[0]);
    expect(nextAfterLoss(emptyJourney(), seats[2])).toBe(seats[2]);
  });
  it('offers the same state election again until the state is taken, and nothing for a state taken or a general election', () => {
    expect(nextAfterLoss(emptyJourney(), 'state:selangor')).toBe('state:selangor');
    const j = record(emptyJourney(), 'state:selangor', { won: true, governed: true });
    expect(nextAfterLoss(j, 'state:selangor')).toBeNull();
    expect(nextAfterLoss(emptyJourney(), 'general')).toBeNull();
  });
  it('does not change the level by itself', () => {
    expect(record(emptyJourney(), seats[0], { won: false, governed: false })).toEqual(emptyJourney());
  });
});

describe('a Career Campaign game', () => {
  beforeEach(() => useStore.getState().quitToTitle());
  it('remembers that it is one, through starting again', () => {
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, seed: 3, founded: true, journey: true });
    expect(useStore.getState().game!.start?.journey).toBe(true);
    useStore.getState().restart();
    expect(useStore.getState().game!.start?.journey).toBe(true);
  });
  it('carries on to the same contest after a loss without raising the level', async () => {
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, seed: 3, founded: true, journey: true });
    useStore.setState((s) => ({ game: { ...s.game!, tutorial: null }, profile: { ...s.profile, journey: undefined } }));
    useStore.getState().finishWithTeam();
    useStore.getState().finishNight();
    const before = useStore.getState().game!;
    await useStore.getState().climb();
    const j = useStore.getState().profile.journey;
    const won = (j?.fought.length ?? 0) > 0;
    if (!won) {
      // nothing was won for this seed: a new game of the same contest starts, and the level is still the first
      const after = useStore.getState().game!;
      expect(after.id).not.toBe(before.id);
      expect(after.campaign.scenario).toBe(before.campaign.scenario);
      expect(after.start?.journey).toBe(true);
      expect(j?.dunWon ?? 0).toBe(0);
    }
  });
});
