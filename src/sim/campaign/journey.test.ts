import { describe, expect, it } from 'vitest';
import { nextUnlock, unlockStages, FIRST_UNLOCK, MAX_LEVEL, MODE_UNLOCKS, STEPS, emptyJourney, journeyLevel, journeyStep, modeOpen, nextStep, record, resumeScenario, stepScenario } from './journey';

const seat = (n: number) => `byelection:dun:selangor:N.9${n}`;
const seats = () => [1, 2, 3, 4, 5].map(seat);

describe('the chapters of the journey', () => {
  it('runs Chapter 1 in Selangor: three DUN seats (the closest, safest and second closest where its own are missing), then the state election twice', () => {
    expect(STEPS.map((s) => s.id)).toEqual(['firstSeat', 'stronghold', 'shoestring', 'kingmaker', 'intoGovt', 'govern', 'defend', 'secondFront', 'borneoBlind', 'generalElection', 'hungParliament', 'governCountry', 'primeMinister', 'firstYear', 'fullTerm', 'secondTerm', 'ownMajority', 'promisesKept', 'retireWell']);
    expect(STEPS.map((_, i) => stepScenario(i, seats))).toEqual([seat(1), seat(5), seat(2), 'state:selangor', 'state:selangor', 'career:selangor', 'career:selangor', 'state:perak', 'state:sabah', 'general', 'general', 'career', 'career', 'career', 'career', 'career', 'career', 'career', 'career']);
    expect(STEPS.find((s) => s.id === 'borneoBlind')?.twist).toEqual({ fog: true, noisy: true });
  });
  it('records the levels a contest cleared, and nothing for none', () => {
    expect(record(emptyJourney(), 0)).toEqual(emptyJourney());
    expect(journeyStep(record(emptyJourney(), 1))).toBe(1);
    expect(journeyStep(record({ ...emptyJourney(), step: 3 }, 2))).toBe(5);
    expect(journeyStep(record({ ...emptyJourney(), step: 4 }, 99))).toBe(STEPS.length);
  });
  it('offers the next level only after this one was cleared, and nothing once the chapters are done', () => {
    expect(nextStep(emptyJourney(), seat(1), seats)).toBeNull();
    expect(nextStep({ ...emptyJourney(), step: 1 }, seat(1), seats)).toBe(seat(5));
    expect(nextStep({ ...emptyJourney(), step: 4 }, 'state:selangor', seats)).toBe('state:selangor');
    expect(nextStep({ ...emptyJourney(), step: STEPS.length }, 'state:selangor', seats)).toBeNull();
  });
  it('counts levels from one, and resumes at the level reached', () => {
    expect(journeyLevel(undefined)).toBe(1);
    expect(journeyLevel({ ...emptyJourney(), step: 3 })).toBe(4);
    expect(journeyLevel({ ...emptyJourney(), step: 99 })).toBe(MAX_LEVEL);
    expect(resumeScenario(undefined, seats)).toBe(seat(1));
    expect(resumeScenario({ ...emptyJourney(), step: 2 }, seats)).toBe(seat(2));
    expect(resumeScenario({ ...emptyJourney(), step: STEPS.length }, seats)).toBe('career');
  });
  it('keeps a journey saved before the chapters: DUN seats won carry over, a state taken finishes Chapter 1, and three finish Chapter 2', () => {
    expect(journeyStep({ state: 'selangor', dunWon: 2, fought: [], governed: [] })).toBe(2);
    expect(journeyStep({ state: 'selangor', dunWon: 3, fought: [], governed: [] })).toBe(3);
    expect(journeyStep({ state: null, dunWon: 0, fought: [], governed: ['selangor'] })).toBe(5);
    expect(journeyLevel({ state: null, dunWon: 0, fought: [], governed: ['selangor', 'perak', 'johor'] })).toBe(8);
  });
  it('keeps every other way to play locked at the start, and opens them at level 4, when Chapter 1 is done and when Chapter 2 is', () => {
    expect(FIRST_UNLOCK).toBe(4);
    expect(modeOpen('byelection', 3)).toBe(false);
    expect(modeOpen('byelection', 4)).toBe(true);
    for (const m of Object.keys(MODE_UNLOCKS) as (keyof typeof MODE_UNLOCKS)[]) expect(modeOpen(m, MAX_LEVEL)).toBe(true);
    expect(unlockStages().map((s) => s.level)).toEqual([4, 6, 8]);
    expect(nextUnlock(1)?.level).toBe(4);
    expect(nextUnlock(MAX_LEVEL)).toBeNull();
  });
});

describe('what takes a state', () => {
  it('is 8% of its seats, and never fewer than 3', async () => {
    const { stateSeatsNeeded } = await import('./journey');
    expect(stateSeatsNeeded(56)).toBe(5);
    expect(stateSeatsNeeded(15)).toBe(3);
    expect(stateSeatsNeeded(73)).toBe(6);
    expect(stateSeatsNeeded(5)).toBe(3);
  });
});

describe('leading into a term', () => {
  it('plays the state election before a state term, and the general election before the federal one', async () => {
    const { termLeadIn, isTerm } = await import('./journey');
    expect(termLeadIn('career:selangor')).toBe('state:selangor');
    expect(termLeadIn('career')).toBe('general');
    expect(termLeadIn('state:perak')).toBe('state:perak');
    expect(isTerm('career')).toBe(true);
    expect(isTerm('general')).toBe(false);
  });
});

describe('Level 1', () => {
  it('starts a new party stronger than a single by-election does, within what a carried following may be', async () => {
    const { FIRST_LEVEL_FOLLOWING } = await import('./journey');
    const { MAX_FOLLOWING, NEW_PARTY_SHARE } = await import('./founding');
    expect(FIRST_LEVEL_FOLLOWING).toBeGreaterThan(NEW_PARTY_SHARE.byelection);
    expect(FIRST_LEVEL_FOLLOWING).toBeLessThanOrEqual(MAX_FOLLOWING);
  });
});

describe('Level 2', () => {
  it('starts a new party with a little less following than Level 1, and later levels with what they carry', async () => {
    const { FIRST_LEVEL_FOLLOWING, SECOND_LEVEL_FOLLOWING, levelFollowing } = await import('./journey');
    const { NEW_PARTY_SHARE } = await import('./founding');
    expect(levelFollowing(0)).toBe(FIRST_LEVEL_FOLLOWING);
    expect(levelFollowing(1)).toBe(SECOND_LEVEL_FOLLOWING);
    expect(SECOND_LEVEL_FOLLOWING).toBeLessThan(FIRST_LEVEL_FOLLOWING);
    expect(SECOND_LEVEL_FOLLOWING).toBeGreaterThan(NEW_PARTY_SHARE.byelection);
    for (let i = 2; i < STEPS.length; i++) expect(levelFollowing(i)).toBeUndefined();
  });
});

describe('the seats of the DUN levels', () => {
  it('are Bukit Melawati, Sekinchan and Paya Jaras where the state offers them, and the closest fight otherwise', () => {
    const melawati = 'byelection:dun:selangor:N.10';
    expect(stepScenario(0, () => [seat(1), melawati, seat(2)])).toBe(melawati);
    expect(stepScenario(0, seats)).toBe(seat(1));
  });
  it('are real Selangor by-elections, each a different seat', async () => {
    const { dunByElections } = await import('../../data/world');
    const dun = dunByElections('selangor');
    const picked = [0, 1, 2].map((i) => stepScenario(i, dunByElections));
    expect(picked.map((id) => id.split(':')[3])).toEqual(['N.10', 'N.04', 'N.38']);
    for (const id of picked) expect(dun).toContain(id);
    expect(new Set(picked).size).toBe(3);
  });
  it('still count a game begun in a level\'s old seat, unless that seat is now another level\'s', async () => {
    const { isStepContest } = await import('./journey');
    const { dunByElections } = await import('../../data/world');
    const dun = dunByElections('selangor');
    expect(isStepContest(0, dun[0], dunByElections)).toBe(true);
    expect(isStepContest(1, dun[dun.length - 1], dunByElections)).toBe(true);
    // Sekinchan was the third level's seat and is now the second's: it clears the second only.
    expect(dun[1]).toBe('byelection:dun:selangor:N.04');
    expect(isStepContest(1, dun[1], dunByElections)).toBe(true);
    expect(isStepContest(2, dun[1], dunByElections)).toBe(false);
    expect(isStepContest(0, dun[dun.length - 1], dunByElections)).toBe(false);
  });
});

describe('the bars of the levels', () => {
  it('ask for more as the chapters go on', () => {
    const at = (id: string) => STEPS.find((s) => s.id === id)!;
    expect(at('kingmaker')).toMatchObject({ goal: 'seats', need: 6 });
    expect(at('intoGovt')).toMatchObject({ goal: 'inGovernment', need: 6 });
    expect(at('intoGovt').need!).toBeGreaterThanOrEqual(at('kingmaker').need!);
    expect(at('secondFront')).toMatchObject({ need: 9, share: 0.24 });
    expect(at('borneoBlind')).toMatchObject({ need: 18, share: 0.25 });
    expect(at('generalElection')).toMatchObject({ need: 22, share: 0.24 });
    // Each later state asks for a larger share of its seats than the one before, or as much.
    const part = (id: string) => at(id).need! / at(id).seats!;
    expect(part('borneoBlind')).toBeGreaterThanOrEqual(part('secondFront'));
  });
});
