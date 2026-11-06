import { beforeEach, describe, expect, it } from 'vitest';
import '../data/allStates';
import { dunByElections } from '../data/world';
import { FOUNDING_SLOT } from '../sim/campaign/founding';
import { DUN_LEVELS, emptyJourney, journeyLevel } from '../sim/campaign/journey';
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
      store().startCampaign({ name: 'T', scenario: seats[0], player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, seed, founded: true, journey: true });
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

describe('Chapter 2: from the talks into Selangor\'s government', () => {
  it('opens a term with the government the talks made and the seats won held, and counts the term served when the election comes', async () => {
    const { recordAsideResults } = await import('../sim/campaign/results');
    const { enterTerm, inGovernment } = await import('../sim/campaign/career');
    const { journeyResult, STEPS } = await import('../sim/campaign/journey');
    const { worldOf } = await import('../data/world');
    const player = PARTY_IDS.indexOf(FOUNDING_SLOT);
    store().quitToTitle();
    store().startCampaign({ name: 'T', scenario: 'state:selangor', player, difficulty: 'easy', backstory: null, seed: 4, founded: true, journey: true });
    useStore.setState((s) => ({ game: { ...s.game!, tutorial: null } }));
    store().finishWithTeam();
    const state = store().game!.campaign;
    const world = worldOf(state)!;
    const results = recordAsideResults(world, state)!;
    const rival = PARTY_IDS.findIndex((_, p) => p !== player && state.parties[p]);
    const outcome = { pm: rival, partners: [player], seats: 30, minority: false, stability: 60, trust: 60, deals: new Array(PARTY_IDS.length).fill(null), day: 0 };
    store().startCampaign({ name: 'T', scenario: 'career:selangor', player, difficulty: 'easy', backstory: null, founded: true, journey: true });
    const term = structuredClone(store().game!.campaign);
    term.career!.results = results;
    enterTerm(worldOf(term)!, term, outcome as never);
    expect(inGovernment(term, player)).toBe(true);
    expect(term.career!.slate!.held.length).toBe(term.career!.record.bestSeats);
    const at = { ...emptyJourney(), step: STEPS.findIndex((s) => s.id === 'govern') };
    expect(journeyResult(worldOf(term)!, term, at, dunByElections)).toBe(0);
    term.phase = 'campaign';
    expect(journeyResult(worldOf(term)!, term, at, dunByElections)).toBe(1);
  });
});
