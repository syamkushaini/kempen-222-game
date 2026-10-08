import type { World } from '../election';
import { ENTERS, STANDS } from '../transfer';
import { N_PARTIES } from '../types';
import { contests } from './actions';
import { beforeNomination, shiftRelation } from './diplomacy';
import { nominationCost } from './slate';
import type { Campaign } from './types';

// A party is not tied to where it stood last time. Before nomination day it may put a candidate in any seat it did not
// stand in, as a newcomer: it pays more than a seat it already holds ground in, it starts well behind an established
// party with the same appeal, and the party that held the seat takes it as an affront. Entering a state also lets the
// party open branches there, which is how a party of Sarawak becomes a party of the peninsula.

/** A seat the party has never stood in costs this many times what the same seat costs a party that has. */
export const ENTRY_PREMIUM = 1.5;
/** What the party that held the seat thinks of an intruder: each seat entered costs this much goodwill with it. */
export const ENTRY_OFFENCE = 3;

/** Whether candidates can still be put forward in new seats: a campaign with leaders who deal with each other, before nomination day. */
export const entriesOpen = (world: World, c: Campaign) => c.phase === 'campaign' && world.rules.diplomacy && beforeNomination(c);

/** What a candidate in this seat costs a party that has not stood there before. */
export const entryCost = (world: World, seat: number) => Math.round((nominationCost(world, seat) * ENTRY_PREMIUM) / 100) * 100;

/** Seats where the party has put up a candidate this campaign that it did not have last time. */
export const enteredSeats = (c: Campaign): string[] => Object.keys(c.entered ?? {});

/** Whether a seat is one the player's party has never stood in, and could enter. */
export function canEnter(world: World, c: Campaign, seatId: string): boolean {
  const i = world.seatIndex.get(seatId);
  const pc = c.parties[c.player];
  if (i === undefined || !pc || !entriesOpen(world, c)) return false;
  if (world.baseline.contesting[i][c.player] || seatId in (c.entered ?? {})) return false;
  return pc.funds >= entryCost(world, i);
}

/** Seats the party has never stood in, cheapest first. */
export function newSeats(world: World, c: Campaign): number[] {
  return world.seats.map((_, i) => i)
    .filter((i) => !world.baseline.contesting[i][c.player] && !((world.seats[i].id) in (c.entered ?? {})))
    .sort((a, b) => entryCost(world, a) - entryCost(world, b) || a - b);
}

/** Puts a candidate in a seat the party has not stood in before, and pays for them. False if it cannot be done. */
export function enterSeat(world: World, c: Campaign, seatId: string): boolean {
  if (!canEnter(world, c, seatId)) return false;
  const i = world.seatIndex.get(seatId)!;
  const pc = c.parties[c.player]!;
  const cost = entryCost(world, i);
  pc.funds -= cost;
  pc.spent += cost;
  (c.entered ??= {})[seatId] = cost;
  const row = c.standDowns[seatId] ?? (c.standDowns[seatId] = new Array<number>(N_PARTIES).fill(STANDS));
  row[c.player] = ENTERS;
  // Whoever held the seat does not take an intruder kindly.
  const seat = world.seats[i];
  const holder = seat.last.votes.indexOf(Math.max(...seat.last.votes));
  if (holder !== c.player && c.parties[holder]) shiftRelation(c, c.player, holder, -ENTRY_OFFENCE);
  return true;
}

/** Takes back a candidate put forward in a new seat this campaign, at what they cost. */
export function leaveSeat(world: World, c: Campaign, seatId: string): boolean {
  const cost = c.entered?.[seatId];
  const pc = c.parties[c.player];
  if (cost === undefined || !pc || !entriesOpen(world, c)) return false;
  pc.funds += cost;
  pc.spent = Math.max(0, pc.spent - cost);
  delete c.entered![seatId];
  if (Object.keys(c.entered!).length === 0) delete c.entered;
  const row = c.standDowns[seatId];
  if (row) {
    row[c.player] = STANDS;
    if (row.every((v) => v === STANDS)) delete c.standDowns[seatId];
  }
  return true;
}

/** Whether the player has a candidate in the seat, old or new. */
export const fielded = (world: World, c: Campaign, seatId: string): boolean => {
  const i = world.seatIndex.get(seatId);
  return i !== undefined && contests(world, c, i, c.player);
};
