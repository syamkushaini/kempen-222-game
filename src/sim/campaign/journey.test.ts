import { describe, expect, it } from 'vitest';
import { nextUnlock, unlockStages, DUN_LEVELS, FIRST_UNLOCK, MAX_LEVEL, MODE_UNLOCKS, emptyJourney, modeOpen, journeyLevel, nextStep, record, recommendState, resumeScenario } from './journey';

const seat = (n: number) => `byelection:dun:selangor:N.0${n}`;
const seats = () => [1, 2, 3, 4, 5].map(seat);
const win = { won: true, governed: false };
const loss = { won: false, governed: false };

describe('the journey', () => {
  it('counts each DUN by-election won once, and not a lost one', () => {
    let j = record(emptyJourney(), seat(1), win);
    expect(j).toMatchObject({ state: 'selangor', dunWon: 1 });
    expect(record(j, seat(1), win)).toBe(j);
    expect(record(j, seat(2), loss)).toBe(j);
    j = record(j, seat(2), win);
    expect(j.dunWon).toBe(2);
  });

  it('offers another DUN by-election until three are won, then the state election', () => {
    let j = emptyJourney();
    for (let n = 1; n < DUN_LEVELS; n++) {
      j = record(j, seat(n), win);
      const next = nextStep(j, seat(n), seats);
      expect(next).toMatch(/^byelection:dun:selangor:/);
      expect(j.fought).not.toContain(next);
    }
    j = record(j, seat(DUN_LEVELS), win);
    expect(nextStep(j, seat(DUN_LEVELS), seats)).toBe('state:selangor');
  });

  it('leaves a by-election that was not won to the usual rule', () => {
    const j = record(emptyJourney(), seat(1), win);
    expect(nextStep(j, seat(2), seats)).toBeNull();
  });

  it('starts again when the first win is in another state', () => {
    const j = record(record(emptyJourney(), seat(1), win), 'byelection:dun:perak:A.01', win);
    expect(j).toMatchObject({ state: 'perak', dunWon: 1 });
  });

  it('takes a state only with a majority and the government, and then recommends a neighbour', () => {
    const j0 = emptyJourney();
    expect(record(j0, 'state:selangor', { won: true, governed: false })).toBe(j0);
    const j = record(j0, 'state:selangor', { won: true, governed: true });
    expect(j).toMatchObject({ state: null, dunWon: 0, governed: ['selangor'] });
    expect(nextStep(j, 'state:selangor', seats)).toBe('state:nsembilan');
    expect(record(j, 'state:selangor', { won: true, governed: true })).toBe(j);
  });

  it('recommends Selangor first, never a state already taken, and the general election at the end', () => {
    expect(recommendState([])).toBe('selangor');
    expect(recommendState(['selangor', 'nsembilan'])).not.toBe('selangor');
    const all = ['selangor', 'nsembilan', 'melaka', 'johor', 'pahang', 'perak', 'penang', 'kedah', 'perlis', 'terengganu', 'kelantan', 'sabah', 'sarawak'] as const;
    expect(recommendState(all)).toBeNull();
    expect(nextStep({ state: null, dunWon: 0, fought: [], governed: [...all] }, 'state:sarawak', seats)).toBe('general');
  });

  it('counts levels: one to begin, one for each DUN win, one more for each state taken', () => {
    expect(journeyLevel(undefined)).toBe(1);
    let j = record(emptyJourney(), seat(1), win);
    expect(journeyLevel(j)).toBe(2);
    j = record(record(j, seat(2), win), seat(3), win);
    expect(journeyLevel(j)).toBe(DUN_LEVELS + 1);
    j = record(j, 'state:selangor', { won: true, governed: true });
    expect(journeyLevel(j)).toBe(DUN_LEVELS + 2);
    expect(MAX_LEVEL).toBe(13 * (DUN_LEVELS + 1) + 1);
  });

  it('resumes at the first DUN of Selangor, then the next seat, the state election, and the recommended state', () => {
    expect(resumeScenario(undefined, seats)).toBe(seat(1));
    // the seats offered are those of Selangor, whatever the state asked for
    const sel = (st: string) => (st === 'selangor' ? seats() : []);
    let j = record(emptyJourney(), seat(1), win);
    expect(resumeScenario(j, sel)).toBe(seat(2));
    j = record(record(j, seat(2), win), seat(3), win);
    expect(resumeScenario(j, sel)).toBe('state:selangor');
    j = record(j, 'state:selangor', { won: true, governed: true });
    expect(resumeScenario(j, sel)).toBe('state:nsembilan');
  });

  it('keeps every other way to play locked at the start, and opens them in stages', () => {
    for (const m of Object.keys(MODE_UNLOCKS) as (keyof typeof MODE_UNLOCKS)[]) expect(modeOpen(m, 1)).toBe(false);
    expect(FIRST_UNLOCK).toBe(DUN_LEVELS + 1);
    expect(modeOpen('byelection', DUN_LEVELS + 1)).toBe(true);
    expect(modeOpen('state', DUN_LEVELS + 1)).toBe(false);
    expect(modeOpen('state', DUN_LEVELS + 2)).toBe(true);
    expect(modeOpen('general', 12)).toBe(false);
    expect(modeOpen('general', 13)).toBe(true);
    expect(modeOpen('simulator', 20)).toBe(false);
    expect(modeOpen('simulator', MAX_LEVEL)).toBe(true);
  });

  it('lists the stages in order and names the next one to open', () => {
    expect(unlockStages().map((x) => x.level)).toEqual([4, 5, 13, 21]);
    expect(unlockStages().flatMap((x) => x.modes)).toHaveLength(Object.keys(MODE_UNLOCKS).length);
    expect(nextUnlock(1)).toMatchObject({ level: 4, modes: ['byelection'] });
    expect(nextUnlock(4)?.level).toBe(5);
    expect(nextUnlock(13)?.level).toBe(21);
    expect(nextUnlock(21)).toBeNull();
  });
});
