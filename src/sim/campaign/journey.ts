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
const STEPS_COUNT = 19;

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
  const clearedHere = STEPS.some((_, i) => i < k && isStepContest(i, scenario, seats));
  return clearedHere ? stepScenario(k, seats) : null;
}


/**
 * How many levels the contest that has just ended cleared, from the level the journey is on: none, one, or two (kingmaker and a place in the
 * government can come in the same state election). Null while it is not over, or if it is not this level's contest.
 */
export function journeyResult(world: World, c: Campaign, j: Journey | undefined, seats: (st: StateId) => string[]): number | null {
  if (c.career) return termResult(world, c, journeyStep(j ?? emptyJourney()), seats);
  if (!c.newParty || (c.phase !== 'formation' && c.phase !== 'done') || !c.election) return null;
  const result = electionResult(world, c);
  if (!result) return null;
  let k = journeyStep(j ?? emptyJourney());
  let cleared = 0;
  while (k < STEPS.length && isStepContest(k, c.scenario, seats) && goalMet(world, c, STEPS[k], result.tally)) { cleared++; k++; }
  return cleared;
}

/**
 * A term of government in the Career Campaign: served when the election at its end begins with the party still in the government (the
 * term's own), and defended when the next term opens with the party in the government again. Null while neither has come.
 */
function termResult(world: World, c: Campaign, from: number, seats: (st: StateId) => string[]): number | null {
  const k = c.career!;
  if (!k.founded) return null;
  const p = c.player;
  const pm = k.government.pm === p;
  // The party's own seats in the House as the last election left them.
  const own = () => (k.results ? k.results.votes.filter((row) => row.indexOf(Math.max(...row)) === p).length : 0);
  const met = (goal: Goal): boolean => {
    // A career that has ended counts only for leaving office well.
    if (k.ending) return goal === 'retire' && k.ending.kind === 'retired';
    switch (goal) {
      case 'serveTerm': return k.term === 1 && c.phase !== 'term' && inGovernment(c, p);
      case 'reElected': return k.term === 2 && c.phase === 'term' && inGovernment(c, p);
      case 'headGovt': return pm;
      case 'yearAsPm': return k.record.weeksPm >= PM_WEEKS.year;
      case 'fullTermPm': return pm && c.phase !== 'term' && k.record.weeksPm >= PM_WEEKS.term;
      case 'winAsPm': return k.record.victories >= 1 && pm && c.phase === 'term';
      case 'ownMajority': return c.phase === 'term' && own() >= majorityLine(world);
      case 'promises': return k.record.kept.length >= PROMISES_KEPT && k.record.kept.length > k.record.broken;
      default: return false;
    }
  };
  let i = from;
  let cleared = 0;
  while (i < STEPS.length && stepScenario(i, seats) === c.scenario && met(STEPS[i].goal)) { cleared++; i++; }
  return cleared;
}

/** Whether a goal was met in a finished contest. */
function goalMet(world: World, c: Campaign, step: StepDef, tally: number[]): boolean {
  const goal = step.goal;
  const p = c.player;
  if (goal === 'win' || goal === 'winShoestring') {
    const won = summarise(world, c, electionResult(world, c)!).verdict === 'won';
    return won && (goal === 'win' || c.parties[p]!.spent <= spendingLimit(world) / 2);
  }
  if (goal === 'seatsOrShare') return tally[p] >= (step.need ?? stateSeatsNeeded(world.seats.length)) || summarise(world, c, electionResult(world, c)!).voteShare >= (step.share ?? SHARE_NEEDED);
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
export type Goal = 'win' | 'winShoestring' | 'kingmaker' | 'inGovernment' | 'serveTerm' | 'reElected' | 'seatsOrShare'
  | 'headGovt' | 'yearAsPm' | 'fullTermPm' | 'winAsPm' | 'ownMajority' | 'promises' | 'retire';

export interface StepDef {
  id: 'firstSeat' | 'stronghold' | 'shoestring' | 'kingmaker' | 'intoGovt' | 'govern' | 'defend' | 'secondFront' | 'borneoBlind' | 'generalElection' | 'hungParliament' | 'governCountry'
    | 'primeMinister' | 'firstYear' | 'fullTerm' | 'secondTerm' | 'ownMajority' | 'promisesKept' | 'retireWell';
  chapter: number;
  goal: Goal;
  /** The contest: a DUN by-election of Selangor (the closest fight, the safest seat, or the second closest), or Selangor's state election. */
  contest: 'first' | 'closest' | 'safest' | 'second' | 'state' | 'career' | 'general' | 'federal';
  /** The state of a state election away from Selangor, and how many seats its assembly has. */
  state?: StateId;
  seats?: number;
  /** A seats-or-share level's own bar, where it is not the usual (see `stateSeatsNeeded` and `SHARE_NEEDED`). */
  need?: number;
  share?: number;
  /** A twist on the contest: polls whose chances are hidden (fog) and whose errors are doubled (noisy). */
  twist?: { fog: boolean; noisy: boolean };
}

/** The levels of the chapters, in order. Chapter 1 is Selangor. */
export const STEPS: readonly StepDef[] = [
  { id: 'firstSeat', chapter: 1, goal: 'win', contest: 'first' },
  { id: 'stronghold', chapter: 1, goal: 'win', contest: 'safest' },
  { id: 'shoestring', chapter: 1, goal: 'winShoestring', contest: 'second' },
  { id: 'kingmaker', chapter: 1, goal: 'kingmaker', contest: 'state' },
  { id: 'intoGovt', chapter: 1, goal: 'inGovernment', contest: 'state' },
  // Chapter 2, In charge: a term in Selangor's government, then the election at the end of it.
  { id: 'govern', chapter: 2, goal: 'serveTerm', contest: 'career' },
  { id: 'defend', chapter: 2, goal: 'reElected', contest: 'career' },
  // Chapter 3, Beyond Selangor: a state where the party is unknown, then Borneo with polls that cannot be trusted.
  { id: 'secondFront', chapter: 3, goal: 'seatsOrShare', contest: 'state', state: 'perak', seats: 59 },
  { id: 'borneoBlind', chapter: 3, goal: 'seatsOrShare', contest: 'state', state: 'sabah', seats: 73, twist: { fog: true, noisy: true } },
  // Chapter 4, The nation: the general election, the talks of a hung parliament, and a term in the federal government.
  { id: 'generalElection', chapter: 4, goal: 'seatsOrShare', contest: 'general', seats: 222, need: 20, share: 0.2 },
  { id: 'hungParliament', chapter: 4, goal: 'inGovernment', contest: 'general' },
  { id: 'governCountry', chapter: 4, goal: 'serveTerm', contest: 'federal' },
  // Chapter 5, Prime Minister: head the government, a year in charge, a whole term at the top. All in the federal career that goes on from Chapter 4.
  { id: 'primeMinister', chapter: 5, goal: 'headGovt', contest: 'federal' },
  { id: 'firstYear', chapter: 5, goal: 'yearAsPm', contest: 'federal' },
  { id: 'fullTerm', chapter: 5, goal: 'fullTermPm', contest: 'federal' },
  // Chapter 6, Second term: win a general election as Prime Minister, then one with a majority of the party's own.
  { id: 'secondTerm', chapter: 6, goal: 'winAsPm', contest: 'federal' },
  { id: 'ownMajority', chapter: 6, goal: 'ownMajority', contest: 'federal' },
  // Chapter 7, Legacy: keep the promises, and leave office on the party's own terms.
  { id: 'promisesKept', chapter: 7, goal: 'promises', contest: 'federal' },
  { id: 'retireWell', chapter: 7, goal: 'retire', contest: 'federal' },
];

/** What the later chapters ask in numbers: weeks at the head of the government (a year, then three), and promises kept. */
export const PM_WEEKS = { year: 52, term: 156 };
export const PROMISES_KEPT = 5;

/** The vote share that clears a seats-or-share level in place of the seats: what a new party that is heard everywhere and wins little gets. */
export const SHARE_NEEDED = 0.15;

/**
 * The following a new party starts Level 1 with: a little more than a single by-election gives (25%), so a first game is one a new player can
 * win while learning. At the cap a carried following may have (see `MAX_FOLLOWING`); the team playing on its own wins about one game in five.
 */
export const FIRST_LEVEL_FOLLOWING = 0.3;

/**
 * The seat of Level 1: Bukit Melawati, the Selangor DUN where a new party has the best chance (the team playing alone won it in a little over
 * half its games, against about 1 in 7 in Sungai Air Tawar, the closest fight). Not one any later level uses.
 */
export const FIRST_SEAT = 'N.10';

/** The contest of a level. */
export function stepScenario(i: number, seats: (st: StateId) => string[]): string {
  const step = STEPS[Math.max(0, Math.min(i, STEPS.length - 1))];
  const dun = seats(FIRST_STATE);
  if (step.contest === 'career') return `career:${FIRST_STATE}`;
  if (step.contest === 'general') return 'general';
  if (step.contest === 'federal') return 'career';
  if (step.contest === 'state' || dun.length === 0) return `state:${step.state ?? FIRST_STATE}`;
  if (step.contest === 'first') return dun.find((id) => id.endsWith(`:${FIRST_SEAT}`)) ?? dun[0];
  if (step.contest === 'closest') return dun[0];
  if (step.contest === 'safest') return dun[dun.length - 1];
  return dun[Math.min(1, dun.length - 1)];
}

/**
 * Whether a contest is the one of a level. Level 1 was once the closest fight (the first of the state's seats): a game begun there before it
 * moved to Bukit Melawati still counts.
 */
export function isStepContest(i: number, scenario: string, seats: (st: StateId) => string[]): boolean {
  if (stepScenario(i, seats) === scenario) return true;
  return STEPS[i]?.contest === 'first' && seats(FIRST_STATE)[0] === scenario;
}

/** Levels cleared: as saved, or, for a journey saved before the chapters, worked out from it. */
export function journeyStep(j: Journey): number {
  if (j.step !== undefined) return Math.max(0, Math.min(STEPS.length, j.step));
  // One state or two finished Chapter 1; three (which opened everything else under the old ladder) finished Chapter 2, so nothing locks again.
  if (j.governed.length >= 3) return STEPS.findIndex((s) => s.chapter === 3);
  return j.governed.length > 0 ? STEPS.findIndex((s) => s.chapter === 2) : Math.min(3, j.dunWon);
}

/** The contest that leads into a term of government: a state's election for a state's term, the general election for the federal one. */
export const termLeadIn = (scenario: string): string => (scenario === 'career' ? 'general' : scenario.startsWith('career:') ? `state:${scenario.slice(7)}` : scenario);
/** Whether a scenario is a term of government (a career), entered from the talks. */
export const isTerm = (scenario: string): boolean => scenario === 'career' || scenario.startsWith('career:');
