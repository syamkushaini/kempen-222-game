import { beforeEach, describe, expect, it } from 'vitest';
import '../data/allStates';
import { dunByElections } from '../data/world';
import { FOUNDING_SLOT } from '../sim/campaign/founding';
import { DUN_LEVELS, FIRST_LEVEL_FOLLOWING, emptyJourney, journeyLevel, stepScenario } from '../sim/campaign/journey';
import { PARTY_IDS } from '../sim/types';
import { useStore } from './store';

const store = () => useStore.getState();

describe('the journey, played through the store', () => {
  beforeEach(() => { useStore.setState((s) => ({ profile: { ...s.profile, journey: undefined } })); });

  it('starts in Selangor and moves the level up only for a DUN by-election won', () => {
    const seats = dunByElections('selangor');
    expect(seats.length).toBeGreaterThan(DUN_LEVELS);
    const first = stepScenario(0, dunByElections);
    const outcomes: boolean[] = [];
    for (let seed = 1; seed <= 12; seed++) {
      useStore.setState((s) => ({ profile: { ...s.profile, journey: undefined } }));
      store().quitToTitle();
      store().startCampaign({ name: 'T', scenario: first, player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, seed, founded: true, journey: true, following: FIRST_LEVEL_FOLLOWING });
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

describe('Chapter 3: beyond Selangor', () => {
  it('starts Perak as it is, then Sabah with polls that cannot be trusted', async () => {
    const player = PARTY_IDS.indexOf(FOUNDING_SLOT);
    store().quitToTitle();
    store().startCampaign({ name: 'T', scenario: dunByElections('selangor')[0], player, difficulty: 'easy', backstory: null, founded: true, journey: true });
    useStore.setState((s) => ({ profile: { ...s.profile, journey: { ...emptyJourney(), step: 7 } } }));
    await store().playLevel();
    expect(store().game!.campaign.scenario).toBe('state:perak');
    expect(store().game!.campaign.challenge).toBeUndefined();
    useStore.setState((s) => ({ profile: { ...s.profile, journey: { ...emptyJourney(), step: 8 } } }));
    await store().playLevel();
    expect(store().game!.campaign.scenario).toBe('state:sabah');
    expect(store().game!.campaign.challenge).toMatchObject({ fog: true, noisy: true });
    expect(store().game!.start?.journey).toBe(true);
  });
});

describe('pulling candidates out in a Career Campaign state election', () => {
  it('lets a new party pull a candidate out of a seat and put it back, free, until nomination day, and the seat is left uncontested', async () => {
    const slate = await import('../sim/campaign/slate');
    const { worldOf } = await import('../data/world');
    const { contests } = await import('../sim/campaign/actions');
    const player = PARTY_IDS.indexOf(FOUNDING_SLOT);
    store().quitToTitle();
    store().startCampaign({ name: 'T', scenario: 'state:selangor', player, difficulty: 'easy', backstory: null, seed: 5, founded: true, journey: true });
    const c = () => store().game!.campaign;
    const world = () => worldOf(c())!;
    const seat = world().seats[3].id;
    expect(slate.picksSeats(world(), c())).toBe(true);
    expect(contests(world(), c(), 3, player)).toBe(true);
    const funds = c().parties[player]!.funds;
    store().withdrawSeat(seat);
    expect(contests(world(), c(), 3, player)).toBe(false);
    expect(c().parties[player]!.funds).toBe(funds);
    store().fieldSeat(seat);
    expect(contests(world(), c(), 3, player)).toBe(true);
    expect(c().parties[player]!.funds).toBe(funds);
    store().withdrawSeat(seat);
    for (let i = 0; i < 20 && slate.pullsOpen(world(), c()); i++) store().endWeek();
    expect(slate.pullsOpen(world(), c())).toBe(false);
    store().fieldSeat(seat);
    expect(contests(world(), c(), 3, player)).toBe(false);
  });
  it('is not offered in a by-election, which has a single seat', async () => {
    const slate = await import('../sim/campaign/slate');
    const { worldOf } = await import('../data/world');
    store().quitToTitle();
    store().startCampaign({ name: 'T', scenario: dunByElections('selangor')[0], player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, founded: true, journey: true });
    expect(slate.picksSeats(worldOf(store().game!.campaign)!, store().game!.campaign)).toBe(false);
  });
});

describe('Chapter 4: the nation', () => {
  it('starts the general election after Sabah, and opens a federal term from it with the party in government', async () => {
    const { recordAsideResults } = await import('../sim/campaign/results');
    const { enterTerm, inGovernment } = await import('../sim/campaign/career');
    const { journeyResult, STEPS } = await import('../sim/campaign/journey');
    const { worldOf } = await import('../data/world');
    const player = PARTY_IDS.indexOf(FOUNDING_SLOT);
    store().quitToTitle();
    store().startCampaign({ name: 'T', scenario: dunByElections('selangor')[0], player, difficulty: 'easy', backstory: null, founded: true, journey: true });
    useStore.setState((s) => ({ profile: { ...s.profile, journey: { ...emptyJourney(), step: STEPS.findIndex((x) => x.id === 'generalElection') } } }));
    await store().playLevel();
    expect(store().game!.campaign.scenario).toBe('general');
    useStore.setState((s) => ({ game: { ...s.game!, tutorial: null } }));
    store().finishWithTeam();
    const ge = store().game!.campaign;
    const world = worldOf(ge)!;
    const results = recordAsideResults(world, ge)!;
    const rival = PARTY_IDS.findIndex((_, p) => p !== player && ge.parties[p]);
    const outcome = { pm: rival, partners: [player], seats: 120, minority: false, stability: 60, trust: 60, deals: new Array(PARTY_IDS.length).fill(null), day: 0 };
    store().startCampaign({ name: 'T', scenario: 'career', player, difficulty: 'easy', backstory: null, founded: true, journey: true });
    const term = structuredClone(store().game!.campaign);
    term.career!.results = results;
    enterTerm(worldOf(term)!, term, outcome as never);
    expect(inGovernment(term, player)).toBe(true);
    const at = { ...emptyJourney(), step: STEPS.findIndex((x) => x.id === 'governCountry') };
    term.phase = 'campaign';
    expect(journeyResult(worldOf(term)!, term, at, dunByElections)).toBe(1);
  }, 120000);
});

describe('Chapters 5 to 7: Prime Minister, a second term, a legacy', () => {
  it('counts heading the government, a year and a term at the top, a win as PM, promises kept and a good retirement', async () => {
    const { journeyResult, STEPS, PM_WEEKS, PROMISES_KEPT } = await import('../sim/campaign/journey');
    const { worldOf } = await import('../data/world');
    const player = PARTY_IDS.indexOf(FOUNDING_SLOT);
    store().quitToTitle();
    store().startCampaign({ name: 'T', scenario: 'career', player, difficulty: 'easy', backstory: null, founded: true, journey: true });
    const c = structuredClone(store().game!.campaign);
    const w = worldOf(c)!;
    const at = (id: string) => ({ ...emptyJourney(), step: STEPS.findIndex((s) => s.id === id) });
    expect(journeyResult(w, c, at('primeMinister'), dunByElections)).toBe(0);
    c.career!.government = { ...c.career!.government, pm: player, partners: [] };
    expect(journeyResult(w, c, at('primeMinister'), dunByElections)).toBe(1);
    c.career!.record.weeksPm = PM_WEEKS.year;
    expect(journeyResult(w, c, at('primeMinister'), dunByElections)).toBe(2);
    c.career!.record.weeksPm = PM_WEEKS.term;
    c.phase = 'campaign';
    expect(journeyResult(w, c, at('primeMinister'), dunByElections)).toBe(3);
    c.phase = 'term';
    c.career!.record.victories = 1;
    expect(journeyResult(w, c, at('secondTerm'), dunByElections)).toBeGreaterThanOrEqual(1);
    c.career!.record.kept = new Array(PROMISES_KEPT).fill('cashAid');
    c.career!.record.broken = 1;
    expect(journeyResult(w, c, at('promisesKept'), dunByElections)).toBe(1);
    c.career!.ending = { kind: 'retired', legacy: c.career!.ending?.legacy ?? ('statesman' as never), score: 1 };
    expect(journeyResult(w, c, at('retireWell'), dunByElections)).toBe(1);
    c.career!.ending = { kind: 'ousted', legacy: 'statesman' as never, score: 1 };
    expect(journeyResult(w, c, at('retireWell'), dunByElections)).toBe(0);
  }, 120000);
});
