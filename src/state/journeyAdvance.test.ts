import { beforeEach, describe, expect, it } from 'vitest';
import '../data/allStates';
import { dunByElections, getWorld, nextContest } from '../data/world';
import { FOUNDING_SLOT } from '../sim/campaign/founding';
import { emptyJourney, nextStep, record } from '../sim/campaign/journey';
import { PARTY_IDS } from '../sim/types';
import { useStore } from './store';

const dun = () => dunByElections('selangor')[0];

describe('advancing along the journey', () => {
  it('offers nothing after a level that was not cleared (the old rule would offer the state election)', () => {
    expect(nextStep(emptyJourney(), dun(), dunByElections)).toBeNull();
    expect(nextContest(dun(), getWorld(dun())!)).toBe('state:selangor');
  });
  it('offers nothing after a state election that did not clear its level', () => {
    expect(nextStep({ ...emptyJourney(), step: 3 }, 'state:selangor', dunByElections)).toBeNull();
    expect(record(emptyJourney(), 0)).toEqual(emptyJourney());
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
  it('does not carry on after a loss: the player tries again or rebuilds the party', async () => {
    useStore.getState().startCampaign({ name: 'T', scenario: dun(), player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, seed: 3, founded: true, journey: true });
    useStore.setState((s) => ({ game: { ...s.game!, tutorial: null }, profile: { ...s.profile, journey: undefined } }));
    useStore.getState().finishWithTeam();
    useStore.getState().finishNight();
    const before = useStore.getState().game!;
    const cleared = (useStore.getState().profile.journey?.step ?? 0) > 0;
    await useStore.getState().climb();
    if (!cleared) expect(useStore.getState().game!.id).toBe(before.id);
  });
});
