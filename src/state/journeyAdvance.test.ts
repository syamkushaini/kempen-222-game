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

describe('moving on after a loss', () => {
  const seats = dunByElections('selangor');
  it('offers the next seat of the state after a lost by-election, and never the same seat', () => {
    expect(nextAfterLoss(emptyJourney(), seats[0], dunByElections)).toBe(seats[1]);
    // the last seat goes round to the first that is not won
    expect(nextAfterLoss(emptyJourney(), seats[seats.length - 1], dunByElections)).toBe(seats[0]);
  });
  it('skips a seat already won, and goes to the state election when no other seat is open', () => {
    const won = record(emptyJourney(), seats[1], { won: true, governed: false });
    expect(nextAfterLoss(won, seats[0], dunByElections)).toBe(seats[2]);
    const all = seats.slice(1).reduce((j, s) => record(j, s, { won: true, governed: false }), emptyJourney());
    expect(nextAfterLoss(all, seats[0], dunByElections)).toBe('state:selangor');
  });
  it('offers the next untaken state after a state election that did not take it, and nothing after a state already taken', () => {
    expect(nextAfterLoss(emptyJourney(), 'state:selangor', dunByElections)).toBe('state:nsembilan');
    const j = record(emptyJourney(), 'state:nsembilan', { won: true, governed: true });
    expect(nextAfterLoss(j, 'state:selangor', dunByElections)).toBe('state:melaka');
    expect(nextAfterLoss(j, 'state:nsembilan', dunByElections)).toBeNull();
    expect(nextAfterLoss(emptyJourney(), 'general', dunByElections)).toBeNull();
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
  it('moves on to the next election after a loss without raising the level', async () => {
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, seed: 3, founded: true, journey: true });
    useStore.setState((s) => ({ game: { ...s.game!, tutorial: null }, profile: { ...s.profile, journey: undefined } }));
    useStore.getState().finishWithTeam();
    useStore.getState().finishNight();
    const before = useStore.getState().game!;
    await useStore.getState().climb();
    const j = useStore.getState().profile.journey;
    const won = (j?.fought.length ?? 0) > 0;
    if (!won) {
      // nothing was won for this seed: the party carries on to another seat, and the level is still the first
      const after = useStore.getState().game!;
      expect(after.id).not.toBe(before.id);
      expect(after.campaign.scenario).not.toBe(before.campaign.scenario);
      expect(after.start?.journey).toBe(true);
      expect(j?.dunWon ?? 0).toBe(0);
    }
  });
});
