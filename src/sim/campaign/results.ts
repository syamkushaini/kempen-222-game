import { runElection, type World } from '../election';
import { Rng } from '../rng';
import type { SeatData } from '../types';
import { effectiveDynamics } from './actions';
import { electionResult } from './turn';
import { PETITION_FROM, PETITION_MAX, PETITION_PER_TENTH, spendingLimit } from './spending';
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



/**
 * The courts after the election. A campaign that went well over the legal limit and was found out is petitioned against:
 * the narrowest of the party's wins are overturned, in favour of whoever came second. Returns the results as the courts
 * left them, and the seats lost.
 */
export function petition(world: World, c: Campaign, results: SeatResults): { results: SeatResults; lost: string[] } {
  const pc = c.parties[c.player];
  const limit = spendingLimit(world);
  if (!pc || !pc.fined || pc.spent < PETITION_FROM * limit) return { results, lost: [] };
  const n = Math.min(PETITION_MAX, Math.round((pc.spent / limit - PETITION_FROM) * 10 * PETITION_PER_TENTH) + 2);
  const wins = results.votes
    .map((row, i) => {
      const w = row.indexOf(Math.max(...row));
      const second = Math.max(...row.filter((_, p) => p !== w));
      return { i, w, second, margin: (row[w] - second) / Math.max(1, row.reduce((a, b) => a + b, 0)) };
    })
    .filter((x) => x.w === c.player)
    .sort((a, b) => a.margin - b.margin)
    .slice(0, n);
  const votes = results.votes.map((row) => [...row]);
  for (const x of wins) {
    // The seat is awarded to the runner-up: the votes are moved so that they lead by a nose.
    const row = votes[x.i];
    const runner = row.findIndex((v, p) => p !== c.player && v === x.second);
    if (runner < 0) continue;
    const [a, b] = [row[c.player], row[runner]];
    row[c.player] = b - 1 > 0 ? b - 1 : b;
    row[runner] = a + 1;
  }
  return { results: { ...results, votes }, lost: wins.map((x) => world.seats[x.i].id) };
}
