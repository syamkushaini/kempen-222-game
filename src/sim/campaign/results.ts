import { emptyDynamics } from '../dynamics';
import { projectElection, type World } from '../election';
import { ENTERS, STANDS, type StandDowns } from '../transfer';
import { N_BLOCS, N_PARTIES, type Dynamics, type SeatData } from '../types';
import { stanceEffect } from './policy';
import { GOODWILL_EFFECT } from './treasury';
import { electionResult } from './turn';
import { PETITION_FROM, PETITION_MAX, PETITION_PER_TENTH, spendingLimit } from './spending';
import type { Campaign, SeatResults } from './types';

// Carrying an election's result into the next term, so that "the last
// election" always means the last one played.

/**
 * Where the voters stand once the campaign is over, as offsets from the last election: what has really changed their minds
 * since then (the mood of the years between, where the parties have moved on the issues, the slow drift of opinion, a
 * member who crossed the floor) and nothing that belonged to the campaign itself. Rallies and posters fade, as they did
 * week by week while it ran; a candidate, an endorsement, a promise and the luck of polling day were that election's.
 */
export function settledOpinion(c: Campaign): Dynamics {
  const k = c.career!;
  const out = emptyDynamics();
  const stance = stanceEffect(c);
  for (let b = 0; b < N_BLOCS; b++) for (let p = 0; p < N_PARTIES; p++) out.support.nat[b][p] = k.mood[b][p] + stance[b][p];
  for (const [st, rows] of Object.entries(c.drift.support.state)) out.support.state[st] = rows.map((row) => [...row]);
  // Goodwill bought with grants is kept apart and added again each parliament for as long as it lasts: it is not counted here as well.
  for (const [st, points] of Object.entries(k.goodwillApplied ?? {})) {
    const rows = out.support.state[st];
    if (rows) for (const row of rows) row[c.player] -= points * GOODWILL_EFFECT;
  }
  for (const [seat, row] of Object.entries(c.drift.support.seat)) out.support.seat[seat] = [...row];
  return out;
}

/**
 * The result of the election just held, seat by seat, in the form the next term is fitted to. The votes are the ones cast;
 * `basis` is what the next parliament's picture of the voters is drawn from: every party standing that has a candidate to
 * stand (no pact, and a newcomer where one was put up), and opinion as it has settled (see `settledOpinion`). Without that,
 * every campaign's effects stayed for good and were added to at the next, and the map hardened term by term.
 */
export function recordResults(world: World, c: Campaign): SeatResults {
  const result = electionResult(world, c)!;
  // A party that put up a candidate where it had none stands there from now on; pacts and seats left unfielded end with the election.
  const entrants: StandDowns = {};
  for (const [seat, row] of Object.entries(c.standDowns)) if (row.some((v) => v === ENTERS)) entrants[seat] = row.map((v) => (v === ENTERS ? ENTERS : STANDS));
  const settled = projectElection(world, settledOpinion(c), entrants);
  return {
    votes: result.seats.map((s) => s.votes),
    turnout: result.seats.map((s) => s.turnout),
    basis: settled.seats.map((s) => ({ votes: s.votes, turnout: s.turnout })),
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
  const lost: string[] = [];
  for (const x of wins) {
    // The seat is awarded to the runner-up: the votes are moved so that they lead by a nose. A seat nobody else fought has no one to award it to.
    const row = votes[x.i];
    const runner = x.second > 0 ? row.findIndex((v, p) => p !== c.player && v === x.second) : -1;
    if (runner < 0) continue;
    const [a, b] = [row[c.player], row[runner]];
    row[c.player] = b - 1 > 0 ? b - 1 : b;
    row[runner] = a + 1;
    lost.push(world.seats[x.i].id);
  }
  return { results: { ...results, votes }, lost };
}
