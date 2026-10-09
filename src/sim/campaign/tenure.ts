import { lastElection, type World } from '../election';
import { zeros } from '../math';
import { N_PARTIES } from '../types';
import { heldOf } from './actions';
import { holderOf } from './contests';
import type { Campaign, SeatResults } from './types';

// A member who has held a seat for years is known there: by the people who call at the constituency office, by the
// village heads, by those who went to their funerals and weddings. That is a vote of its own, and it does not follow the
// swing of the country. It is built in terms and lost with the member.

export const TENURE = { perTerm: 0.035, max: 0.105 };

/** The personal vote of a member who has held the seat for this many terms in a row, in logit units: nothing for the first. */
export const personalVote = (terms: number): number => Math.min(TENURE.max, Math.max(0, terms - 1) * TENURE.perTerm);

/** How many terms in a row the party that holds a seat has held it (at least one). */
export const termsHeld = (c: Campaign, seat: string): number => c.career?.tenure?.[seat]?.[1] ?? 1;

/** Notes who won each seat at an election: a party that wins a seat again has held it one more term, any other begins at one. */
export function recordTenure(world: World, c: Campaign, results: SeatResults): void {
  const k = c.career;
  if (!k) return;
  const next: Record<string, [number, number]> = {};
  const last = lastElection(world);
  world.seats.forEach((seat, i) => {
    const row = results.votes[i];
    if (!row) return;
    const winner = row.indexOf(Math.max(...row));
    // The career begins in the middle of things: a seat that was won by a wide margin has had its member a while.
    const was = last.seats[i];
    const before = k.tenure?.[seat.id] ?? ([was.winner, was.margin >= 0.2 ? 3 : was.margin >= 0.1 ? 2 : 1] as [number, number]);
    next[seat.id] = [winner, before && before[0] === winner ? before[1] + 1 : 1];
  });
  k.tenure = next;
}

/** At the start of a campaign, every seat with a member of several terms' standing is lifted for their party. */
export function applyTenure(world: World, c: Campaign): void {
  const k = c.career;
  if (!k?.tenure) return;
  for (const [seat, [party, terms]] of Object.entries(k.tenure)) {
    const bonus = personalVote(terms);
    if (bonus <= 0 || !world.seatIndex.has(seat) || holderOf(world, c, seat) !== party) continue;
    (heldOf(c).support.seat[seat] ??= zeros(N_PARTIES))[party] += bonus;
  }
}

/** The personal vote a new candidate throws away when they replace the sitting member: half of it. */
export function retireIncumbent(c: Campaign, seat: string): number {
  const t = c.career?.tenure?.[seat];
  if (!t || t[0] !== c.player) return 0;
  const lost = personalVote(t[1]) / 2;
  if (lost <= 0) return 0;
  (heldOf(c).support.seat[seat] ??= zeros(N_PARTIES))[c.player] -= lost;
  return lost;
}
