import { calibrate, type Baseline } from './baseline';
import { GENERAL_RULES, type Rules } from './campaign/rules';
import { emptyDynamics } from './dynamics';
import { zeros } from './math';
import { classify, projectSeat, type SeatShock } from './project';
import type { Rng } from './rng';
import type { StandDowns } from './transfer';
import {
  BLOC_IDS, N_PARTIES, PARTY_IDS, STATE_IDS,
  type Dynamics, type ElectionOutcome, type RegionId, type SeatData, type SeatOutcome,
} from './types';

/** One contest: its seats, the fitted baseline, and the rules that scale the campaign to it. */
export interface World {
  /** Scenario id, stored in saves so a game reloads into the right contest. */
  id: string;
  rules: Rules;
  seats: SeatData[];
  seatIndex: Map<string, number>;
  /** Regions that have seats, in display order. */
  states: RegionId[];
  /** Display names for regions that are not states (their names come from the translations). */
  regionNames: Record<RegionId, string> | null;
  baseline: Baseline;
  totalElectorate: number;
  /** Seat indexes in each region. */
  seatsByState: Record<RegionId, number[]>;
  /** Registered voters in each region. */
  stateElectorate: Record<RegionId, number>;
  /**
   * The last election as it actually went, where it cannot be recovered from
   * the baseline alone because pacts kept parties off the ballot.
   */
  last: ElectionOutcome | null;
}

export interface SeatFile {
  partyIds: readonly string[];
  blocIds: readonly string[];
  /** Names of regions, where they are not states. */
  regions?: Record<string, string>;
  seats: SeatData[];
}

export function createWorld(file: SeatFile, rules: Rules = GENERAL_RULES, id = 'general'): World {
  // The data file stores per-party and per-bloc arrays by position, so a
  // mismatch in order would silently scramble every seat.
  if (file.partyIds.join() !== PARTY_IDS.join()) throw new Error('Seat file party order does not match PARTY_IDS; run `npm run data`');
  if (file.blocIds.join() !== BLOC_IDS.join()) throw new Error('Seat file bloc order does not match BLOC_IDS; run `npm run data`');

  const seats = file.seats;
  const states: RegionId[] = [];
  for (const s of seats) if (!states.includes(s.state)) states.push(s.state);
  // States have a conventional order; other regions keep the order of the data.
  const stateOrder = STATE_IDS as string[];
  if (states.every((st) => stateOrder.includes(st))) states.sort((x, y) => stateOrder.indexOf(x) - stateOrder.indexOf(y));

  const seatsByState: Record<RegionId, number[]> = Object.fromEntries(states.map((st) => [st, [] as number[]]));
  const stateElectorate: Record<RegionId, number> = Object.fromEntries(states.map((st) => [st, 0]));
  seats.forEach((s, i) => {
    seatsByState[s.state].push(i);
    stateElectorate[s.state] += s.electorate;
  });
  const world: World = {
    id,
    rules,
    seats,
    seatIndex: new Map(seats.map((s, i) => [s.id, i])),
    states,
    regionNames: file.regions ?? null,
    baseline: calibrate(seats),
    totalElectorate: seats.reduce((a, s) => a + s.electorate, 0),
    seatsByState,
    stateElectorate,
    last: null,
  };
  if (seats.some((s) => s.basis)) world.last = summarise(world, seats.map(recorded));
  return world;
}

/** A seat's last result as an outcome, straight from the record. */
function recorded(seat: SeatData): SeatOutcome {
  const votes = seat.last.votes;
  const valid = votes.reduce((a, b) => a + b, 0);
  let winner = 0, runnerUp = -1;
  for (let p = 1; p < N_PARTIES; p++) if (votes[p] > votes[winner]) winner = p;
  for (let p = 0; p < N_PARTIES; p++) if (p !== winner && votes[p] > 0 && (runnerUp === -1 || votes[p] > votes[runnerUp])) runnerUp = p;
  const margin = valid > 0 ? (votes[winner] - (runnerUp === -1 ? 0 : votes[runnerUp])) / valid : 0;
  return { seatId: seat.id, votes, valid, turnout: seat.last.turnout, winner, runnerUp, margin, cls: classify(margin), undecided: 0, blocs: [] };
}

function summarise(world: World, seats: SeatOutcome[]): ElectionOutcome {
  const tally = zeros(N_PARTIES);
  const votes = zeros(N_PARTIES);
  let issued = 0;
  seats.forEach((o, i) => {
    tally[o.winner]++;
    for (let p = 0; p < N_PARTIES; p++) votes[p] += o.votes[p];
    issued += o.turnout * world.seats[i].electorate;
  });
  return { seats, tally, votes, turnout: issued / world.totalElectorate };
}

/** The expected result if the election were held today, with no randomness. */
export function projectElection(world: World, dyn: Dynamics, standDowns?: StandDowns): ElectionOutcome {
  return summarise(world, world.seats.map((s, i) => projectSeat(s, i, world.baseline, dyn, undefined, standDowns?.[s.id])));
}

/** How unpredictable polling day is. Standard deviations in logit units. */
export interface ElectionNoise {
  nationalSupport: number;
  stateSupport: number;
  seatSupport: number;
  nationalTurnout: number;
  seatTurnout: number;
}

export const DEFAULT_NOISE: ElectionNoise = {
  nationalSupport: 0.06,
  stateSupport: 0.05,
  seatSupport: 0.1,
  nationalTurnout: 0.05,
  seatTurnout: 0.08,
};

/**
 * Holds the election: the projection plus polling-day randomness that is
 * correlated nationally and within each state, so surprises come in waves
 * rather than seat by seat.
 */
export function runElection(
  world: World,
  dyn: Dynamics,
  rng: Rng,
  noise: ElectionNoise = DEFAULT_NOISE,
  standDowns?: StandDowns,
): ElectionOutcome {
  const draw = (sd: number) => Array.from({ length: N_PARTIES }, () => rng.normal(0, sd));
  const national = draw(noise.nationalSupport);
  const byState = new Map<RegionId, number[]>();
  for (const st of world.states) byState.set(st, draw(noise.stateSupport));
  const nationalTurnout = rng.normal(0, noise.nationalTurnout);

  const seats = world.seats.map((seat, i) => {
    const st = byState.get(seat.state)!;
    const local = draw(noise.seatSupport);
    const shock: SeatShock = {
      support: local.map((v, p) => v + national[p] + st[p]),
      turnout: nationalTurnout + rng.normal(0, noise.seatTurnout),
    };
    return projectSeat(seat, i, world.baseline, dyn, shock, standDowns?.[seat.id]);
  });
  return summarise(world, seats);
}

/** The outcome of the last real election, straight from the data. */
export function lastElection(world: World): ElectionOutcome {
  if (world.last) return world.last;
  // Projecting it afresh is costly and it is asked for seat by seat, so it is kept for as long as the world is.
  let out = projected.get(world);
  if (!out) projected.set(world, (out = projectElection(world, emptyDynamics())));
  return out;
}
const projected = new WeakMap<World, ElectionOutcome>();

/** The closest contests, tightest first. */
export function hotSeats(outcome: ElectionOutcome, count: number): SeatOutcome[] {
  return [...outcome.seats].sort((a, b) => a.margin - b.margin).slice(0, count);
}

/** Seats needed for a simple majority. */
export function majorityLine(world: World): number {
  return Math.floor(world.seats.length / 2) + 1;
}
