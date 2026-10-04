import { runElection, type World } from '../election';
import { Rng } from '../rng';
import type { SeatData } from '../types';
import { effectiveDynamics } from './actions';
import { electionResult } from './turn';
import type { Campaign, SeatResults } from './types';

// Carrying an election's result into the next term, so that "the last
// election" always means the last one played.

/** The result of the election just held, seat by seat, in the form the next term is fitted to. */
export function recordResults(world: World, c: Campaign): SeatResults {
  const result = electionResult(world, c)!;
  // Where a pact kept parties off the ballot, also work out what would have happened with everyone standing.
  const full = Object.keys(c.standDowns).length
    ? runElection(world, effectiveDynamics(c), new Rng(c.election!.rng))
    : null;
  return {
    votes: result.seats.map((s) => s.votes),
    turnout: result.seats.map((s) => s.turnout),
    basis: result.seats.map((s, i) => (full && c.standDowns[s.seatId] ? { votes: full.seats[i].votes, turnout: full.seats[i].turnout } : null)),
  };
}

/** The seats of a career's world: the data's seats, with the last election replaced by the career's own. */
export function seatsAfter(base: SeatData[], results: SeatResults): SeatData[] {
  return base.map((s, i) => ({
    ...s,
    last: { votes: results.votes[i], turnout: results.turnout[i], validRate: s.last.validRate },
    basis: results.basis[i] ?? undefined,
  }));
}

