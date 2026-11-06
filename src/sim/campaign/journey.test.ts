import { describe, expect, it } from 'vitest';
import { nextUnlock, unlockStages, FIRST_UNLOCK, MAX_LEVEL, MODE_UNLOCKS, STEPS, emptyJourney, journeyLevel, journeyStep, modeOpen, nextStep, record, resumeScenario, stepScenario } from './journey';

const seat = (n: number) => `byelection:dun:selangor:N.0${n}`;
const seats = () => [1, 2, 3, 4, 5].map(seat);

describe('the chapters of the journey', () => {
  it('runs Chapter 1 in Selangor: the closest seat, the safest, the second closest, then the state election twice', () => {
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
