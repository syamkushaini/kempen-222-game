import { PARTY_IDS } from '../types';
import type { Campaign, StateVote } from './types';

const OTH = PARTY_IDS.indexOf('oth');

/** Seats a party took in a state election, less the seats it held there at the last general election. */
export const swing = (v: StateVote, party: number): number => (v.seats[party] ?? 0) - (v.before[party] ?? 0);

/** The party with the most seats in a state election; ties go to the first. Nobody counts as the leader of "others". */
export function topParty(v: StateVote): number {
  let best = -1;
  for (let p = 0; p < v.seats.length; p++) if (p !== OTH && (best < 0 || v.seats[p] > v.seats[best])) best = p;
  return best;
}

/** A state election's lean for a party: up, down or flat. */
export const lean = (v: StateVote, party: number): -1 | 0 | 1 => Math.sign(swing(v, party)) as -1 | 0 | 1;

export interface Pulse {
  /** How many states have voted this term. */
  states: number;
  /** The player's seats in those states, and what they were at the last general election. */
  seats: number;
  before: number;
  /** The party that gained most seats across those states, and by how many (null if none gained). */
  gainer: { party: number; seats: number } | null;
}

/** What the state elections held so far say about the mood of the country, for the player's party. */
export function pulse(c: Campaign): Pulse | null {
  const votes = Object.values(c.career?.stateVotes ?? {});
  if (votes.length === 0) return null;
  const net = new Array<number>(votes[0].seats.length).fill(0);
  for (const v of votes) for (let p = 0; p < net.length; p++) if (p !== OTH) net[p] += swing(v, p);
  const best = net.reduce((b, n, p) => (n > net[b] ? p : b), 0);
  return {
    states: votes.length,
    seats: votes.reduce((a, v) => a + (v.seats[c.player] ?? 0), 0),
    before: votes.reduce((a, v) => a + (v.before[c.player] ?? 0), 0),
    gainer: net[best] > 0 ? { party: best, seats: net[best] } : null,
  };
}

/** The states that have voted this term, the most recent first. */
export const votedStates = (c: Campaign): [string, StateVote][] =>
  Object.entries(c.career?.stateVotes ?? {}).sort((a, b) => b[1].week - a[1].week);
