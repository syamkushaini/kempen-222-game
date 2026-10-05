import { emptyDynamics } from '../dynamics';
import { projectElection, type World } from '../election';
import { N_BLOCS, type ElectionOutcome, type RegionId } from '../types';
import type { Campaign, Decision } from './types';

// The look back after polling day: which seats turned on a few hundred votes,
// where the party gained and lost ground and how hard it had worked there,
// and how far its own polls were from the count. All of it is read from what
// the campaign already recorded, so it needs nothing extra in a save.

/** Seats closer than this (a share of the valid votes) count as close calls. */
const CLOSE = 0.08;
/** The most close calls listed on each side. */
const CLOSE_SHOWN = 3;
/** The most voter groups listed, and the smallest group (a share of all voters) worth a mention. */
const BLOCS_SHOWN = 5, BLOC_MIN = 0.02;
/** The most decisions listed as helping, and as hurting. */
const BEST_SHOWN = 3, WORST_SHOWN = 2;
/** A change in national vote share smaller than this (a fifth of a point) does not count as a move. */
const MOVE = 0.002;

/** A seat that was settled by few votes. */
export interface CloseCall {
  seat: string;
  /** Votes between the winner and the runner-up. */
  votes: number;
  /** The party on the other side of it. */
  rival: number;
}

/** How the player's party did in one state (or, in a state election, one parliamentary seat). */
export interface StateSwing {
  state: RegionId;
  seatsBefore: number;
  seatsAfter: number;
  /** Change in the party's share of the vote there, as a fraction (0.03 = three points). */
  swing: number;
  /** How many campaign actions the player aimed at this place. */
  actions: number;
}

/** The player's party's share of one voter group's votes nationwide, then and now. */
export interface BlocSwing {
  /** Index into BLOC_IDS. */
  bloc: number;
  before: number;
  after: number;
  /** The group's share of all voters. */
  weight: number;
}

export interface Review {
  closeWins: CloseCall[];
  closeLosses: CloseCall[];
  /** Largest movements first. Empty when the contest is a single seat. */
  states: StateSwing[];
  /** The voter groups the party gained and lost most among, largest movement first. Empty when the result carries no group figures. */
  blocs: BlocSwing[];
  /** The choices that moved the projection most when they were taken, for and against. Empty in a game made before the record was kept. */
  moves: { best: Decision[]; worst: Decision[]; total: number };
  /** The player's share in the last national poll, and the week it was taken; null if none was taken. */
  lastPoll: { week: number; share: number; ownPoll: boolean } | null;
  finalShare: number;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** The places the player's actions were aimed at, counted: "@seat:P.001" and "@state:perak" both name a place. */
export function effortByState(world: World, c: Campaign): Record<RegionId, number> {
  const out: Record<RegionId, number> = Object.fromEntries(world.states.map((st) => [st, 0]));
  for (const n of c.news) {
    if (n.party !== c.player || !n.key.startsWith('news.me.')) continue;
    const seat = typeof n.vars?.seat === 'string' ? world.seatIndex.get(n.vars.seat.replace('@seat:', '')) : undefined;
    const state = seat !== undefined ? world.seats[seat].state : typeof n.vars?.state === 'string' ? n.vars.state.replace('@state:', '') : undefined;
    if (state !== undefined && state in out) out[state]++;
  }
  return out;
}

function closeCalls(c: Campaign, result: ElectionOutcome) {
  const p = c.player;
  const wins: (CloseCall & { gap: number })[] = [], losses: (CloseCall & { gap: number })[] = [];
  result.seats.forEach((o) => {
    if (o.valid <= 0) return;
    if (o.winner === p) {
      const gap = o.votes[p] - o.votes[o.runnerUp];
      wins.push({ seat: o.seatId, votes: gap, rival: o.runnerUp, gap: gap / o.valid });
    } else if (o.votes[p] > 0) {
      const gap = o.votes[o.winner] - o.votes[p];
      losses.push({ seat: o.seatId, votes: gap, rival: o.winner, gap: gap / o.valid });
    }
  });
  const pick = (list: typeof wins) => list.filter((x) => x.gap <= CLOSE).sort((a, b) => a.votes - b.votes).slice(0, CLOSE_SHOWN)
    .map(({ seat, votes, rival }) => ({ seat, votes, rival }));
  return { closeWins: pick(wins), closeLosses: pick(losses) };
}

function stateSwings(world: World, c: Campaign, result: ElectionOutcome): StateSwing[] {
  if (world.states.length < 2) return [];
  const p = c.player;
  const effort = effortByState(world, c);
  const swings = world.states.map((state) => {
    let seatsBefore = 0, seatsAfter = 0, votesBefore = 0, validBefore = 0, votesAfter = 0, validAfter = 0;
    for (const i of world.seatsByState[state]) {
      const last = world.seats[i].last.votes;
      if (last.indexOf(Math.max(...last)) === p) seatsBefore++;
      votesBefore += last[p]; validBefore += sum(last);
      const o = result.seats[i];
      if (o.winner === p) seatsAfter++;
      votesAfter += o.votes[p]; validAfter += o.valid;
    }
    const share = (v: number, valid: number) => (valid > 0 ? v / valid : 0);
    return { state, seatsBefore, seatsAfter, swing: share(votesAfter, validAfter) - share(votesBefore, validBefore), actions: effort[state] };
  });
  return swings.sort((a, b) => Math.abs(b.seatsAfter - b.seatsBefore) - Math.abs(a.seatsAfter - a.seatsBefore) || Math.abs(b.swing) - Math.abs(a.swing));
}

/** How the party did among each voter group, against how the game's model has the country voting before any campaign. */
function blocSwings(world: World, c: Campaign, result: ElectionOutcome): BlocSwing[] {
  if (result.seats.some((o) => o.blocs.length !== N_BLOCS)) return [];
  const p = c.player;
  const base = projectElection(world, emptyDynamics(), {});
  // Votes cast by each group across the country: the group's voters, times how many turn out, times who they back.
  const tally = (o: ElectionOutcome) => {
    const cast = new Array<number>(N_BLOCS).fill(0), mine = new Array<number>(N_BLOCS).fill(0), voters = new Array<number>(N_BLOCS).fill(0);
    for (const seat of o.seats) seat.blocs.forEach((b, i) => { const n = b.voters * b.turnout; cast[i] += n; mine[i] += n * b.shares[p]; voters[i] += b.voters; });
    return { cast, mine, voters };
  };
  const then = tally(base), now = tally(result);
  const everyone = now.voters.reduce((a, b) => a + b, 0);
  const out: BlocSwing[] = [];
  for (let bloc = 0; bloc < N_BLOCS; bloc++) {
    const weight = everyone > 0 ? now.voters[bloc] / everyone : 0;
    if (weight < BLOC_MIN || then.cast[bloc] <= 0 || now.cast[bloc] <= 0) continue;
    out.push({ bloc, before: then.mine[bloc] / then.cast[bloc], after: now.mine[bloc] / now.cast[bloc], weight });
  }
  return out.sort((a, b) => Math.abs(b.after - b.before) - Math.abs(a.after - a.before)).slice(0, BLOCS_SHOWN);
}

/** The decisions that did the most good and the most harm, by seats moved and then by vote share. */
function moves(c: Campaign): Review['moves'] {
  const worth = (d: Decision) => d.seats + d.share * 100;
  const mattered = c.ledger.filter((d) => d.seats !== 0 || Math.abs(d.share) >= MOVE);
  const best = mattered.filter((d) => d.seats > 0 || (d.seats === 0 && d.share > 0)).sort((a, b) => worth(b) - worth(a)).slice(0, BEST_SHOWN);
  const worst = mattered.filter((d) => d.seats < 0 || (d.seats === 0 && d.share < 0)).sort((a, b) => worth(a) - worth(b)).slice(0, WORST_SHOWN);
  return { best, worst, total: c.ledger.length };
}

/** The player's last look at the national race before polling day, public or commissioned. */
function lastPoll(c: Campaign): Review['lastPoll'] {
  // In a career the polls of the years before the campaign are older news.
  const from = c.career ? c.career.length : 0;
  for (let i = c.polls.length - 1; i >= 0; i--) {
    const poll = c.polls[i];
    if (poll.scope === 'national' && poll.national && poll.week > from) return { week: poll.week - from, share: poll.national[c.player], ownPoll: !poll.public };
  }
  return null;
}

export function review(world: World, c: Campaign, result: ElectionOutcome): Review {
  return {
    ...closeCalls(c, result),
    states: stateSwings(world, c, result),
    blocs: blocSwings(world, c, result),
    moves: moves(c),
    lastPoll: lastPoll(c),
    finalShare: sum(result.votes) > 0 ? result.votes[c.player] / sum(result.votes) : 0,
  };
}
