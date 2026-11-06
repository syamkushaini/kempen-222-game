import type { World } from '../election';
import type { StateId } from '../types';
import { majorityLine } from '../election';
import { spendingLimit } from './actions';
import { inGovernment } from './career';
import { summarise } from './night';
import { electionResult } from './turn';
import type { Campaign } from './types';

/**
 * The journey (the Career Campaign): a new party climbs a ladder of levels grouped in chapters, each level a contest with a goal of its own (see
 * `STEPS`). Chapter 1 is Selangor: a first seat, a stronghold, a seat won on a shoestring, kingmaker in the state election, and a place in its
 * government. Every contest is the ordinary one; the goals only say what counts.
 */

/** Levels in the chapters built so far (the length of `STEPS`). */
const STEPS_COUNT = 7;

/** DUN by-elections to win in a state before its state election is offered. */
export const DUN_LEVELS = 3;

/** The state the journey is recommended to begin in. */
export const FIRST_STATE: StateId = 'selangor';

/** The order states are recommended in when no neighbour of the last one governed is left. */
export const STATE_ROUTE: StateId[] = [
  'selangor', 'nsembilan', 'melaka', 'johor', 'pahang', 'perak', 'penang', 'kedah', 'perlis', 'terengganu', 'kelantan', 'sabah', 'sarawak',
];

/** States that share a border (Sabah and Sarawak are neighbours of each other). A neighbour of the state just governed is recommended first. */
const NEIGHBOURS: Partial<Record<StateId, StateId[]>> = {
  selangor: ['nsembilan', 'perak', 'pahang'],
  nsembilan: ['selangor', 'melaka', 'johor', 'pahang'],
  melaka: ['nsembilan', 'johor'],
  johor: ['melaka', 'nsembilan', 'pahang'],
  pahang: ['selangor', 'nsembilan', 'johor', 'perak', 'kelantan', 'terengganu'],
  perak: ['selangor', 'pahang', 'kelantan', 'kedah', 'penang'],
  penang: ['kedah', 'perak'],
  kedah: ['penang', 'perak', 'perlis'],
  perlis: ['kedah'],
  terengganu: ['kelantan', 'pahang'],
  kelantan: ['terengganu', 'pahang', 'perak'],
  sabah: ['sarawak'],
  sarawak: ['sabah'],
};

export interface Journey {
  /** The state the DUN by-elections are being won in; null before the first one is won, or once a state has been taken. */
  state: StateId | null;
  /** DUN by-elections won in that state. */
  dunWon: number;
  /** The by-election scenarios already won in that state, so that none is offered twice and none counts twice. */
  fought: string[];
  /** The states the player has taken, by winning enough of their seats, in the order they were taken. */
  governed: StateId[];
  /** Levels of the chapters cleared (see `STEPS`). Absent in a journey saved before the chapters: worked out from the fields above. */
  step?: number;
}

export const emptyJourney = (): Journey => ({ state: null, dunWon: 0, fought: [], governed: [] });

const dunState = (scenario: string): StateId => scenario.split(':')[2] as StateId;

/** The state to recommend next: an untaken neighbour of the last state governed, else the first untaken on the route. Null when every state is taken. */
export function recommendState(governed: readonly StateId[]): StateId | null {
  const last = governed[governed.length - 1];
  const left = (st: StateId) => !governed.includes(st);
  return (last ? NEIGHBOURS[last]?.find(left) : undefined) ?? STATE_ROUTE.find(left) ?? null;
}

/** What a finished contest was worth to the journey. */
export interface Result { won: boolean; governed: boolean }

/** The journey after a contest that cleared `steps` levels. The same journey if it cleared none. */
export function record(j: Journey, steps: number): Journey {
  if (steps <= 0) return j;
  return { ...j, step: Math.min(STEPS.length, journeyStep(j) + steps) };
}

/**
 * What to offer after this contest: the next level's contest, if this one cleared a level and the chapters have more. Null otherwise (a contest
 * not cleared is tried again, or rebuilt; see Aside). `seats` are the DUN by-election scenarios of a state, closest fights first.
 */
export function nextStep(j: Journey, scenario: string, seats: (st: StateId) => string[]): string | null {
  const k = journeyStep(j);
  if (k >= STEPS.length) return null;
  const clearedHere = STEPS.some((_, i) => i < k && stepScenario(i, seats) === scenario);
  return clearedHere ? stepScenario(k, seats) : null;
}


/**
 * How many levels the contest that has just ended cleared, from the level the journey is on: none, one, or two (kingmaker and a place in the
 * government can come in the same state election). Null while it is not over, or if it is not this level's contest.
 */
export function journeyResult(world: World, c: Campaign, j: Journey | undefined, seats: (st: StateId) => string[]): number | null {
  if (c.career) return termResult(c, journeyStep(j ?? emptyJourney()), seats);
  if (!c.newParty || (c.phase !== 'formation' && c.phase !== 'done') || !c.election) return null;
  const result = electionResult(world, c);
  if (!result) return null;
  let k = journeyStep(j ?? emptyJourney());
  let cleared = 0;
  while (k < STEPS.length && stepScenario(k, seats) === c.scenario && goalMet(world, c, STEPS[k].goal, result.tally)) { cleared++; k++; }
  return cleared;
}

/**
 * A term of government in the Career Campaign: served when the election at its end begins with the party still in the government (the
 * term's own), and defended when the next term opens with the party in the government again. Null while neither has come.
 */
function termResult(c: Campaign, from: number, seats: (st: StateId) => string[]): number | null {
  const k = c.career!;
  if (!k.founded || k.ending) return null;
  let i = from;
  let cleared = 0;
  const met = (goal: Goal) =>
    goal === 'serveTerm' ? k.term === 1 && c.phase !== 'term' && inGovernment(c, c.player)
    : goal === 'reElected' ? k.term === 2 && c.phase === 'term' && inGovernment(c, c.player)
    : false;
  while (i < STEPS.length && stepScenario(i, seats) === c.scenario && met(STEPS[i].goal)) { cleared++; i++; }
  return cleared;
}

/** Whether a goal was met in a finished contest. */
function goalMet(world: World, c: Campaign, goal: Goal, tally: number[]): boolean {
  const p = c.player;
  if (goal === 'win' || goal === 'winShoestring') {
    const won = summarise(world, c, electionResult(world, c)!).verdict === 'won';
    return won && (goal === 'win' || c.parties[p]!.spent <= spendingLimit(world) / 2);
  }
  if (goal === 'kingmaker') return tally[p] >= stateSeatsNeeded(world.seats.length) && Math.max(...tally) < majorityLine(world);
  // A place in the government: heading it or a partner in it once the talks are over, or a majority of one's own.
  if (tally[p] >= majorityLine(world)) return true;
  const o = c.formation?.outcome;
  return c.phase === 'done' && !!o && (o.pm === p || o.partners.includes(p));
}

/** The seats a new party must win in a state election to take the state: 8% of them (5 of Selangor's 56), and never fewer than 3. */
export const stateSeatsNeeded = (seats: number): number => Math.max(3, Math.ceil(seats * 0.08));

/** The most levels a journey can reach: one for each level of the chapters, and the first. */
export const MAX_LEVEL = STEPS_COUNT + 1;

/** The level the player is on: 1 at the start, one more for each level of the chapters cleared. */
export const journeyLevel = (j: Journey | undefined): number => Math.min(MAX_LEVEL, journeyStep(j ?? emptyJourney()) + 1);

/** The contest a career campaign starts or resumes with: the level the journey is on, or the last one once the chapters are done. */
export function resumeScenario(j: Journey | undefined, seats: (st: StateId) => string[]): string {
  return stepScenario(Math.min(journeyStep(j ?? emptyJourney()), STEPS.length - 1), seats);
}

/** The state a scenario is played in, or null (a general election). */
export const scenarioState = (scenario: string): StateId | null =>
  scenario.startsWith('state:') ? (scenario.slice(6) as StateId) : scenario.startsWith('byelection:dun:') ? dunState(scenario) : null;

/** The ways to play apart from the career campaign itself. They stay locked until the campaign has got far enough. */
export type ModeId = 'byelection' | 'challenges' | 'state' | 'career' | 'general' | 'hung' | 'simulator';

/**
 * The level of the career campaign (see `journeyLevel`) at which each way to play opens: three Selangor seats won (level 4) open single
 * by-elections; Chapter 1 finished (level 6) opens state elections and the challenges; Chapter 2 finished (level 8) opens the rest. They will
 * move up as the later chapters are built.
 */
export const MODE_UNLOCKS: Record<ModeId, number> = {
  byelection: 4,
  state: 6,
  challenges: 6,
  general: 8,
  hung: 8,
  career: 8,
  simulator: 8,
};

/** Whether a way to play is open at this level. */
export const modeOpen = (mode: ModeId, level: number): boolean => level >= MODE_UNLOCKS[mode];

/** The lowest level at which any other way to play opens. */
export const FIRST_UNLOCK = Math.min(...Object.values(MODE_UNLOCKS));

/** The stages at which ways to play open, lowest level first, each with the modes it opens. */
export function unlockStages(): { level: number; modes: ModeId[] }[] {
  const byLevel = new Map<number, ModeId[]>();
  for (const m of Object.keys(MODE_UNLOCKS) as ModeId[]) byLevel.set(MODE_UNLOCKS[m], [...(byLevel.get(MODE_UNLOCKS[m]) ?? []), m]);
  return [...byLevel.entries()].sort((a, b) => a[0] - b[0]).map(([level, modes]) => ({ level, modes }));
}

/** The next stage still shut at this level, or null once everything is open. */
export const nextUnlock = (level: number): { level: number; modes: ModeId[] } | null => unlockStages().find((s) => s.level > level) ?? null;

// ---------- the chapters ----------

/** What a level asks: to win the seat, to win it spending at most half the legal limit, to be kingmaker in a hung assembly, or to be in government. */
export type Goal = 'win' | 'winShoestring' | 'kingmaker' | 'inGovernment' | 'serveTerm' | 'reElected';

export interface StepDef {
  id: 'firstSeat' | 'stronghold' | 'shoestring' | 'kingmaker' | 'intoGovt' | 'govern' | 'defend';
  chapter: number;
  goal: Goal;
  /** The contest: a DUN by-election of Selangor (the closest fight, the safest seat, or the second closest), or Selangor's state election. */
  contest: 'closest' | 'safest' | 'second' | 'state' | 'career';
}

/** The levels of the chapters, in order. Chapter 1 is Selangor. */
export const STEPS: readonly StepDef[] = [
  { id: 'firstSeat', chapter: 1, goal: 'win', contest: 'closest' },
  { id: 'stronghold', chapter: 1, goal: 'win', contest: 'safest' },
  { id: 'shoestring', chapter: 1, goal: 'winShoestring', contest: 'second' },
  { id: 'kingmaker', chapter: 1, goal: 'kingmaker', contest: 'state' },
  { id: 'intoGovt', chapter: 1, goal: 'inGovernment', contest: 'state' },
  // Chapter 2, In charge: a term in Selangor's government, then the election at the end of it.
  { id: 'govern', chapter: 2, goal: 'serveTerm', contest: 'career' },
  { id: 'defend', chapter: 2, goal: 'reElected', contest: 'career' },
];

/** The contest of a level. */
export function stepScenario(i: number, seats: (st: StateId) => string[]): string {
  const step = STEPS[Math.max(0, Math.min(i, STEPS.length - 1))];
  const dun = seats(FIRST_STATE);
  if (step.contest === 'career') return `career:${FIRST_STATE}`;
  if (step.contest === 'state' || dun.length === 0) return `state:${FIRST_STATE}`;
  if (step.contest === 'closest') return dun[0];
  if (step.contest === 'safest') return dun[dun.length - 1];
  return dun[Math.min(1, dun.length - 1)];
}

/** Levels cleared: as saved, or, for a journey saved before the chapters, worked out from it (a state taken finished Chapter 1). */
export function journeyStep(j: Journey): number {
  if (j.step !== undefined) return Math.max(0, Math.min(STEPS.length, j.step));
  return j.governed.length > 0 ? STEPS.length : Math.min(3, j.dunWon);
}
