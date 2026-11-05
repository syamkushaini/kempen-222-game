import { beforeEach, describe, expect, it } from 'vitest';
import '../data/allStates';
import { dunByElections, getWorld, nextContest } from '../data/world';
import { FOUNDING_SLOT } from '../sim/campaign/founding';
import { emptyJourney, nextStep, record } from '../sim/campaign/journey';
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

describe('a Career Campaign game', () => {
  beforeEach(() => useStore.getState().quitToTitle());
  it('remembers that it is one, through starting again', () => {
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, seed: 3, founded: true, journey: true });
    expect(useStore.getState().game!.start?.journey).toBe(true);
    useStore.getState().restart();
    expect(useStore.getState().game!.start?.journey).toBe(true);
  });
  it('does not climb after a loss, whatever the old rule says', async () => {
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, seed: 3, founded: true, journey: true });
    useStore.setState((s) => ({ game: { ...s.game!, tutorial: null }, profile: { ...s.profile, journey: undefined } }));
    useStore.getState().finishWithTeam();
    useStore.getState().finishNight();
    const id = useStore.getState().game!.id;
    await useStore.getState().climb();
    // the journey has no next step (nothing was won for this seed), so the game must be the same one still
    const won = (useStore.getState().profile.journey?.fought.length ?? 0) > 0;
    if (!won) expect(useStore.getState().game!.id).toBe(id);
  });
});
