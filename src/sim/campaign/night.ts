import type { World } from '../election';
import { Rng } from '../rng';
import type { ElectionOutcome } from '../types';
import { par } from './outlook';
import type { Campaign } from './types';

// How an election night is told: the order the seats declare in, how the
// player did, and how a single seat's count comes in.

/**
 * The order seats declare in on election night: compact urban seats count
 * fast, big and remote ones slow, with some luck.
 */
export function declarationOrder(world: World, c: Campaign): number[] {
  const rng = new Rng((c.election?.rng ?? c.seed) ^ 0x9e3779b9);
  const biggest = Math.max(...world.seats.map((s) => s.electorate));
  return world.seats
    .map((s, i) => ({
      i,
      t: 0.5 * (s.electorate / biggest) + 0.3 * (1 - s.urbanity) + (s.region === 'peninsular' ? 0 : 0.15) + 0.35 * rng.next(),
    }))
    .sort((a, b) => a.t - b.t)
    .map((x) => x.i);
}

/** What a declaration meant: the seat stayed with the same party, changed hands, or (for the player) was won or lost. */
export type Flip = 'hold' | 'flip' | 'gain' | 'loss';
export function flipKind(winner: number, was: number, player: number): Flip {
  return winner === was ? 'hold' : winner === player ? 'gain' : was === player ? 'loss' : 'flip';
}

/**
 * How the night went for the player. The last three are for a single-seat by-election: `creditable` is a seat lost
 * by a party nobody expected to win it, with a share of the vote that beat what was expected.
 */
export type Verdict = 'majority' | 'largest' | 'gained' | 'held' | 'lost' | 'won' | 'creditable' | 'defeated';

export interface Summary {
  seats: number;
  before: number;
  voteShare: number;
  /** 1 = most seats. */
  rank: number;
  verdict: Verdict;
  /** Seat ids won that the party did not hold before. */
  gained: string[];
  /** Seat ids held before and lost. */
  lost: string[];
}

export function summarise(world: World, c: Campaign, result: ElectionOutcome): Summary {
  const p = c.player;
  const lastWinner = (i: number) => world.seats[i].last.votes.indexOf(Math.max(...world.seats[i].last.votes));
  const gained: string[] = [], lost: string[] = [];
  let before = 0;
  result.seats.forEach((o, i) => {
    const was = lastWinner(i) === p, is = o.winner === p;
    if (was) before++;
    if (is && !was) gained.push(o.seatId);
    if (was && !is) lost.push(o.seatId);
  });
  const seats = result.tally[p];
  const voteShare = result.votes[p] / result.votes.reduce((a, b) => a + b, 0);
  const target = par(world, p);
  const rank = 1 + result.tally.filter((n) => n > seats).length;
  const majority = Math.floor(world.seats.length / 2) + 1;
  const verdict: Verdict =
    world.rules.kind === 'byelection' ? (seats > 0 ? 'won' : target !== null && voteShare >= target ? 'creditable' : 'defeated')
    : seats >= majority ? 'majority' : rank === 1 ? 'largest' : seats > before ? 'gained' : seats === before ? 'held' : 'lost';
  return {
    seats, before, rank, verdict, gained, lost, voteShare,
  };
}

/**
 * A single seat's count as it comes in, box by box: cumulative votes per party
 * after each batch. Early boxes can mislead; the last entry is the result.
 */
export function countBatches(c: Campaign, result: ElectionOutcome, batches = 12): number[][] {
  const rng = new Rng((c.election?.rng ?? c.seed) ^ 0x51ed270b);
  const final = result.seats[0].votes;
  // Each box leans its own way; scale so the boxes add up to the final count exactly.
  const raw = Array.from({ length: batches }, () => final.map((v) => v * Math.max(0.2, 1 + rng.normal(0, 0.35))));
  const totals = final.map((_, p) => raw.reduce((a, box) => a + box[p], 0));
  const running = final.map(() => 0);
  return raw.map((box, i) => {
    box.forEach((v, p) => { running[p] += totals[p] > 0 ? (v / totals[p]) * final[p] : 0; });
    return i === batches - 1 ? [...final] : running.map(Math.round);
  });
}


/** What the desk makes of a count so far: still open, leaning one way, or settled because the votes left cannot change it. */
export type CallState = 'open' | 'likely' | 'called';

export interface CountLine {
  /** What happened as this box was added. */
  kind: 'first' | 'flip' | 'halfway' | 'closing' | 'pulling' | 'steady';
  leader: number;
  second: number;
  /** The leader's lead over the runner-up, in votes. */
  lead: number;
  call: CallState;
  /** The desk made a call with this box, took one back, or settled it for good. */
  desk: 'made' | 'withdrawn' | 'settled' | null;
}

/**
 * A commentary on a single seat's count, one line for each box: who leads and by how much, whether the lead changed
 * hands, and what the desk is prepared to say. A call is only final once the lead is more than the votes still out;
 * before that it is a judgement, and a bad box can make the desk take it back.
 */
export function countStory(boxes: number[][]): CountLine[] {
  const all = (boxes.at(-1) ?? []).reduce((a, b) => a + b, 0);
  const lines: CountLine[] = [];
  boxes.forEach((votes, i) => {
    const order = votes.map((v, p) => ({ v, p })).sort((a, b) => b.v - a.v);
    const leader = order[0].p, second = order[1]?.p ?? order[0].p;
    const lead = order[0].v - (order[1]?.v ?? 0);
    const out = all - votes.reduce((a, b) => a + b, 0);
    const call: CallState = lead > out ? 'called' : lead > out / 2 ? 'likely' : 'open';
    const prev = lines[i - 1];
    const kind: CountLine['kind'] =
      !prev ? 'first' : prev.leader !== leader ? 'flip' : i === Math.floor(boxes.length / 2) - 1 ? 'halfway'
      : lead < prev.lead * 0.75 ? 'closing' : lead > prev.lead * 1.25 ? 'pulling' : 'steady';
    const was = prev?.call ?? 'open';
    const desk: CountLine['desk'] =
      call === 'called' && was !== 'called' ? 'settled' : call === 'likely' && (was === 'open' || prev?.leader !== leader) ? 'made' : call === 'open' && was === 'likely' ? 'withdrawn' : null;
    lines.push({ kind, leader, second, lead, call, desk });
  });
  return lines;
}
