import type { World } from '../election';
import { N_PARTIES, type ElectionOutcome } from '../types';
import { effortByState, review, type BlocSwing, type CloseCall, type StateSwing } from './review';
import type { Campaign, Decision } from './types';

// The look at a whole election, laid out for a page of charts: how every party did, where the player's party gained and lost
// and how hard it had worked there, how its polls compared with the count, and a few plain sentences about what it all says.
// It is read from the result and what the campaign recorded, so it needs nothing extra in a save.

/** A move in the vote share smaller than this (a tenth of a point) is not worth remarking on. */
const NOTABLE = 0.001;
/** Seats within this many votes of flipping are "lost by a whisker". */
const WHISKER = 1_500;

export interface PartyLine {
  party: number;
  seats: number;
  /** Seats it held in these constituencies at the last election. */
  before: number;
  /** Share of the votes cast, now and at the last election. */
  share: number;
  shareBefore: number;
}

/** One plain sentence about the result. The names it mentions are given as ids, for the page to put in words. */
export interface Insight {
  key: string;
  tone: 'good' | 'bad' | 'neutral';
  vars: Record<string, number | string>;
  state?: string;
  bloc?: number;
  party?: number;
}

export interface Analysis {
  /** The seats in the House, and what makes a majority of them. */
  total: number;
  majority: number;
  seats: number;
  before: number;
  gained: number;
  lost: number;
  held: number;
  /** Every party with seats or a share worth showing, the most seats first. */
  parties: PartyLine[];
  states: StateSwing[];
  blocs: BlocSwing[];
  closeWins: CloseCall[];
  closeLosses: CloseCall[];
  /** The player's last national poll, and how far it was from the count (in share points, positive: it was generous). */
  poll: { week: number; share: number; ownPoll: boolean; error: number } | null;
  /** What the player did: campaign actions taken, polls bought, and the decisions that mattered most. */
  work: { actions: number; polls: number; best: Decision[]; worst: Decision[]; decisions: number; funds: number };
  /** The player's share of the votes, and the share at the last election. */
  share: number;
  shareBefore: number;
  insights: Insight[];
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** The player's campaign actions, as the ledger of the campaign recorded them. */
const actionsTaken = (c: Campaign): number => c.ledger.length;

export function analyse(world: World, c: Campaign, result: ElectionOutcome): Analysis {
  const me = c.player;
  const r = review(world, c, result);
  const total = world.seats.length;
  const majority = Math.floor(total / 2) + 1;

  const now = new Array<number>(N_PARTIES).fill(0), was = new Array<number>(N_PARTIES).fill(0);
  const votes = new Array<number>(N_PARTIES).fill(0), votesWas = new Array<number>(N_PARTIES).fill(0);
  result.seats.forEach((o, i) => {
    now[o.winner]++;
    const last = world.seats[i].last.votes;
    was[last.indexOf(Math.max(...last))]++;
    for (let p = 0; p < N_PARTIES; p++) { votes[p] += o.votes[p]; votesWas[p] += last[p] ?? 0; }
  });
  const [cast, castWas] = [sum(votes), sum(votesWas)];
  const parties: PartyLine[] = now
    .map((seats, party) => ({ party, seats, before: was[party], share: cast > 0 ? votes[party] / cast : 0, shareBefore: castWas > 0 ? votesWas[party] / castWas : 0 }))
    .filter((l) => l.seats > 0 || l.share >= 0.01 || l.party === me)
    .sort((a, b) => b.seats - a.seats || b.share - a.share);
  const mine = parties.find((l) => l.party === me) ?? { party: me, seats: 0, before: 0, share: 0, shareBefore: 0 };

  const lostSeats = result.seats.filter((o, i) => { const last = world.seats[i].last.votes; return last.indexOf(Math.max(...last)) === me && o.winner !== me; }).length;
  const gainedSeats = result.seats.filter((o, i) => { const last = world.seats[i].last.votes; return last.indexOf(Math.max(...last)) !== me && o.winner === me; }).length;
  const held = mine.seats - gainedSeats;

  const poll = r.lastPoll ? { ...r.lastPoll, error: r.lastPoll.share - r.finalShare } : null;
  const work = {
    actions: actionsTaken(c),
    polls: c.polls.filter((p) => !p.public).length,
    best: r.moves.best, worst: r.moves.worst, decisions: r.moves.total,
    funds: c.parties[me]?.funds ?? 0,
  };

  const a: Analysis = {
    total, majority, seats: mine.seats, before: mine.before, gained: gainedSeats, lost: lostSeats, held,
    parties, states: r.states, blocs: r.blocs, closeWins: r.closeWins, closeLosses: r.closeLosses, poll, work,
    share: mine.share, shareBefore: mine.shareBefore, insights: [],
  };
  a.insights = insightsOf(a, effortByState(world, c));
  return a;
}

/** What the result says, in order of how much it matters. At most seven. */
function insightsOf(a: Analysis, effort: Record<string, number>): Insight[] {
  const out: Insight[] = [];
  const change = (s: StateSwing) => s.seatsAfter - s.seatsBefore;

  // The headline: how far from a majority, or how far past it.
  const gap = a.majority - a.seats;
  if (a.seats >= a.majority) out.push({ key: 'analysis.in.majority', tone: 'good', vars: { n: a.seats - a.majority, seats: a.seats } });
  else if (a.seats > 0 || a.before > 0) {
    out.push({ key: 'analysis.in.short', tone: a.seats >= a.before ? 'neutral' : 'bad', vars: { n: gap, seats: a.seats } });
  }

  // The seats that decided it: what flipping the closest losses would have been worth.
  const whiskers = a.closeLosses.filter((x) => x.votes <= WHISKER);
  if (whiskers.length > 0) {
    out.push({
      key: a.seats + whiskers.length >= a.majority && a.seats < a.majority ? 'analysis.in.whisker.majority' : 'analysis.in.whisker',
      tone: 'bad', vars: { n: whiskers.length, votes: Math.max(...whiskers.map((x) => x.votes)) },
    });
  }
  if (a.closeWins.length > 0) out.push({ key: 'analysis.in.thin', tone: 'neutral', vars: { n: a.closeWins.length, votes: Math.max(...a.closeWins.map((x) => x.votes)) } });

  // The best and the worst place for the player's party, and whether the work went where it paid.
  const best = a.states.filter((s) => change(s) > 0).sort((x, y) => change(y) - change(x) || y.swing - x.swing)[0];
  const worst = a.states.filter((s) => change(s) < 0).sort((x, y) => change(x) - change(y) || x.swing - y.swing)[0];
  if (best) out.push({ key: best.actions === 0 ? 'analysis.in.bestNone' : 'analysis.in.best', tone: 'good', state: best.state, vars: { n: change(best), actions: best.actions } });
  if (worst) out.push({ key: worst.actions === 0 ? 'analysis.in.worstNone' : 'analysis.in.worst', tone: 'bad', state: worst.state, vars: { n: Math.abs(change(worst)), actions: worst.actions } });
  const wasted = a.states.filter((s) => s.actions > 0 && change(s) <= 0).sort((x, y) => y.actions - x.actions)[0];
  if (wasted && wasted.actions >= 3 && wasted.state !== worst?.state) out.push({ key: 'analysis.in.wasted', tone: 'neutral', state: wasted.state, vars: { actions: wasted.actions } });
  const neglected = a.states.filter((s) => (effort[s.state] ?? 0) === 0 && change(s) < 0).sort((x, y) => change(x) - change(y))[0];
  if (neglected && neglected.state !== worst?.state) out.push({ key: 'analysis.in.neglected', tone: 'bad', state: neglected.state, vars: { n: Math.abs(change(neglected)) } });

  // The voters: the group the party won most among and the one it lost most among.
  const up = a.blocs.filter((b) => b.after - b.before >= NOTABLE).sort((x, y) => (y.after - y.before) - (x.after - x.before))[0];
  const down = a.blocs.filter((b) => b.before - b.after >= NOTABLE).sort((x, y) => (y.before - y.after) - (x.before - x.after))[0];
  if (up) out.push({ key: 'analysis.in.blocUp', tone: 'good', bloc: up.bloc, vars: { pts: Math.round((up.after - up.before) * 1000) / 10 } });
  if (down) out.push({ key: 'analysis.in.blocDown', tone: 'bad', bloc: down.bloc, vars: { pts: Math.round((down.before - down.after) * 1000) / 10 } });

  // The polls: how well the party knew its own position.
  if (a.poll) {
    const off = Math.round(Math.abs(a.poll.error) * 1000) / 10;
    out.push({ key: off < 1.5 ? 'analysis.in.pollTrue' : a.poll.error > 0 ? 'analysis.in.pollHigh' : 'analysis.in.pollLow', tone: off < 1.5 ? 'good' : 'neutral', vars: { pts: off, said: Math.round(a.poll.share * 1000) / 10 } });
  } else if (a.work.polls === 0) {
    out.push({ key: 'analysis.in.noPoll', tone: 'neutral', vars: {} });
  }
  return out.slice(0, 7);
}
