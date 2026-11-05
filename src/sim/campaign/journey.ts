import type { World } from '../election';
import type { StateId } from '../types';
import { summarise } from './night';
import { electionResult } from './turn';
import type { Campaign } from './types';

/**
 * The journey: a new party starts small, wins a few assembly (DUN) by-elections in one state, then fights that state's election.
 * Win a majority and head the government, and the game recommends the next state to take on, starting with Selangor. It only
 * chooses what to offer next: every contest is the ordinary one, and nothing here changes a rule of play.
 */

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
  /** The states whose government the player has headed after a majority, in the order they were taken. */
  governed: StateId[];
}

export const emptyJourney = (): Journey => ({ state: null, dunWon: 0, fought: [], governed: [] });

const isDun = (scenario: string): boolean => scenario.startsWith('byelection:dun:');
const dunState = (scenario: string): StateId => scenario.split(':')[2] as StateId;
const stateOf = (scenario: string): StateId | null => (scenario.startsWith('state:') ? (scenario.slice(6) as StateId) : null);

/** The state to recommend next: an untaken neighbour of the last state governed, else the first untaken on the route. Null when every state is taken. */
export function recommendState(governed: readonly StateId[]): StateId | null {
  const last = governed[governed.length - 1];
  const left = (st: StateId) => !governed.includes(st);
  return (last ? NEIGHBOURS[last]?.find(left) : undefined) ?? STATE_ROUTE.find(left) ?? null;
}

/** What a finished contest was worth to the journey. */
export interface Result { won: boolean; governed: boolean }

/** The journey after a contest: a won DUN by-election counts once, and a state election won with the player heading the government takes the state. */
export function record(j: Journey, scenario: string, r: Result): Journey {
  if (isDun(scenario) && r.won) {
    const st = dunState(scenario);
    const base: Journey = j.state === st ? j : { ...j, state: st, dunWon: 0, fought: [] };
    if (base.fought.includes(scenario)) return base === j ? j : base;
    return { ...base, dunWon: base.dunWon + 1, fought: [...base.fought, scenario] };
  }
  const st = stateOf(scenario);
  if (st && r.governed && !j.governed.includes(st)) return { state: null, dunWon: 0, fought: [], governed: [...j.governed, st] };
  return j;
}

/**
 * What to offer after this contest, or null to leave it to the usual rule (`nextContest`):
 * another DUN by-election in the same state until `DUN_LEVELS` are won, then that state's election; after a state taken, the
 * recommended state's election, or the general election once every state is taken.
 * `seats` are the DUN by-election scenarios of the state, best fights first.
 */
export function nextStep(j: Journey, scenario: string, seats: (st: StateId) => string[]): string | null {
  if (isDun(scenario)) {
    const st = dunState(scenario);
    if (j.state !== st || !j.fought.includes(scenario)) return null;
    if (j.dunWon >= DUN_LEVELS) return `state:${st}`;
    return seats(st).find((s) => !j.fought.includes(s)) ?? `state:${st}`;
  }
  const st = stateOf(scenario);
  if (st && j.governed.includes(st)) {
    const next = recommendState(j.governed);
    return next ? `state:${next}` : 'general';
  }
  return null;
}

/**
 * The contest a player who did not win this one can carry on to, or null if there is none: the same contest again, at the next election
 * (the same DUN seat, the same state), so that the player keeps fighting it until it is won. It starts from the result just had (the vote
 * won becomes the party's following and stronghold, as when a win leads on), where "try this again" starts from nothing. The level is
 * not touched (see `record`): it rises only for a contest won. A general election or a state already taken has nothing to carry on to.
 */
export function nextAfterLoss(j: Journey, scenario: string): string | null {
  if (isDun(scenario)) return scenario;
  const st = stateOf(scenario);
  return st && !j.governed.includes(st) ? scenario : null;
}

/** How the contest that has just ended went for the journey, or null while it is not over (as `clearedHeat` does for the heat ladder). */
export function journeyResult(world: World, c: Campaign): Result | null {
  if (!c.newParty || c.career || (c.phase !== 'formation' && c.phase !== 'done') || !c.election) return null;
  const result = electionResult(world, c);
  if (!result) return null;
  const verdict = summarise(world, c, result).verdict;
  if (world.rules.kind === 'byelection') return { won: verdict === 'won', governed: false };
  // A state is taken only when the party has a majority of its own and heads the government that comes out of the talks.
  return { won: verdict === 'majority', governed: verdict === 'majority' && c.phase === 'done' && c.formation?.outcome?.pm === c.player };
}

/** The most levels a journey can reach: four for each of the thirteen states (three DUN by-elections and the state election), and the first. */
export const MAX_LEVEL = STATE_ROUTE.length * (DUN_LEVELS + 1) + 1;

/** The level the player is on: 1 at the start, one more for each DUN by-election won, and a further one for each state taken. */
export const journeyLevel = (j: Journey | undefined): number => {
  const k = j ?? emptyJourney();
  return Math.min(MAX_LEVEL, k.governed.length * (DUN_LEVELS + 1) + k.dunWon + 1);
};

/** The contest a career campaign starts or resumes with: the first DUN by-election of Selangor, then wherever the journey has got to. */
export function resumeScenario(j: Journey | undefined, seats: (st: StateId) => string[]): string {
  const k = j ?? emptyJourney();
  if (k.state) return k.dunWon >= DUN_LEVELS ? `state:${k.state}` : seats(k.state).find((s) => !k.fought.includes(s)) ?? `state:${k.state}`;
  if (k.governed.length > 0) { const next = recommendState(k.governed); return next ? `state:${next}` : 'general'; }
  return seats(FIRST_STATE)[0] ?? `state:${FIRST_STATE}`;
}

/** The state a scenario is played in, or null (a general election). */
export const scenarioState = (scenario: string): StateId | null =>
  scenario.startsWith('state:') ? (scenario.slice(6) as StateId) : scenario.startsWith('byelection:dun:') ? dunState(scenario) : null;

/** The ways to play apart from the career campaign itself. They stay locked until the campaign has got far enough. */
export type ModeId = 'byelection' | 'challenges' | 'state' | 'career' | 'general' | 'hung' | 'simulator';

/**
 * The level of the career campaign (see `journeyLevel`) at which each way to play opens, in stages:
 * one state's three DUN seats (level 4) open single by-elections; the first state taken (5) opens state elections and the weekly challenges;
 * three states (13) open the general election, the hung parliament and a career of one's own; five states (21) open the simulator.
 */
export const MODE_UNLOCKS: Record<ModeId, number> = {
  byelection: DUN_LEVELS + 1,
  state: DUN_LEVELS + 2,
  challenges: DUN_LEVELS + 2,
  general: 3 * (DUN_LEVELS + 1) + 1,
  hung: 3 * (DUN_LEVELS + 1) + 1,
  career: 3 * (DUN_LEVELS + 1) + 1,
  simulator: 5 * (DUN_LEVELS + 1) + 1,
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
