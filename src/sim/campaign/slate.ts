import { lastElection, type World } from '../election';
import { N_PARTIES } from '../types';
import { STANDS, stands, WITHDRAWN } from '../transfer';
import { contests } from './actions';
import { beforeNomination } from './diplomacy';
import type { Campaign } from './types';

// A party the player made (founded from nothing, or an existing party made their own) is not tied to where it stood last
// time. It may stand in any seat, and each seat has its own price: a deposit, and a share that grows with the voters and
// with how costly a city is to fight. Seats it stood in at the last election are carried over; any other is filled by
// paying for it, up to what the party can afford, until nominations close.

/** What it costs to nominate in a seat, before the size of the contest: the deposit, and so much for each voter. */
export const NOMINATION_BASE = 1_000;
export const NOMINATION_PER_VOTER = 0.012;

/** Whether the player's party is one they made, and so has a slate to choose. */
export const isOwn = (c: Campaign) => !!c.career?.own;

/** What it costs the party to put a candidate in this seat. Dearer where there are more voters, and in a city. */
export function nominationCost(world: World, seat: number): number {
  const s = world.seats[seat];
  const raw = (NOMINATION_BASE + s.electorate * NOMINATION_PER_VOTER) * (0.8 + 0.5 * s.urbanity) * world.rules.econ;
  return Math.max(100, Math.round(raw / 100) * 100);
}

/** Whether candidates can still be put forward or taken back: until nomination day, in a career's election. */
export const nominationsOpen = (c: Campaign) => isOwn(c) && c.phase === 'campaign' && beforeNomination(c);

/** The seats the player's party has a candidate in. */
export function fieldedSeats(world: World, c: Campaign): number[] {
  return world.seats.map((_, i) => i).filter((i) => contests(world, c, i, c.player));
}

/** Whether a seat is one the party could field a candidate in, and has not: not tied up in a pact. */
export function canField(world: World, c: Campaign, seat: number): boolean {
  const sd = c.standDowns[world.seats[seat].id]?.[c.player];
  return world.baseline.contesting[seat][c.player] && sd === WITHDRAWN;
}

/** The seats the party has left to field, cheapest first. */
export function openSeats(world: World, c: Campaign): number[] {
  return world.seats.map((_, i) => i).filter((i) => canField(world, c, i)).sort((a, b) => nominationCost(world, a) - nominationCost(world, b) || a - b);
}

/** What the party has paid so far for seats it added this time, and what it could still afford. */
export function slateSpent(c: Campaign): number {
  return Object.values(c.career?.slate?.added ?? {}).reduce((a, v) => a + v, 0);
}

/** An election campaign opens: the seats the party did not stand in last time are left unfielded until paid for. */
export function openNominations(world: World, c: Campaign): void {
  const k = c.career;
  if (!k?.own) return;
  const held = new Set(k.slate?.held ?? []);
  k.slate = { held: [...held], added: {} };
  world.seats.forEach((seat, i) => {
    if (held.has(seat.id) || !world.baseline.contesting[i][c.player]) return;
    const row = c.standDowns[seat.id] ?? (c.standDowns[seat.id] = new Array<number>(N_PARTIES).fill(STANDS));
    if (stands(row[c.player])) row[c.player] = WITHDRAWN;
  });
}

/** Puts a candidate in a seat and pays for them. False if nominations are shut, the seat cannot be fielded, or the money is not there. */
export function fieldSeat(world: World, c: Campaign, seatId: string): boolean {
  const i = world.seatIndex.get(seatId);
  const pc = c.parties[c.player];
  if (i === undefined || !pc || !nominationsOpen(c) || !canField(world, c, i)) return false;
  const cost = nominationCost(world, i);
  if (pc.funds < cost) return false;
  pc.funds -= cost;
  const row = c.standDowns[seatId];
  row[c.player] = STANDS;
  if (row.every((v) => v === STANDS)) delete c.standDowns[seatId];
  c.career!.slate!.added[seatId] = cost;
  return true;
}

/** Takes back a candidate put forward this time, at what they cost. Seats the party stood in last time stay as they are. */
export function withdrawSeat(world: World, c: Campaign, seatId: string): boolean {
  const k = c.career;
  const pc = c.parties[c.player];
  const cost = k?.slate?.added[seatId];
  if (!k || !pc || cost === undefined || !nominationsOpen(c) || !world.seatIndex.has(seatId)) return false;
  pc.funds += cost;
  delete k.slate!.added[seatId];
  const row = c.standDowns[seatId] ?? (c.standDowns[seatId] = new Array<number>(N_PARTIES).fill(STANDS));
  row[c.player] = WITHDRAWN;
  return true;
}

/** Fields the cheapest seats left, as many as there is money for, up to `limit`. Returns how many were added. */
export function fieldCheapest(world: World, c: Campaign, limit: number): number {
  let n = 0;
  for (const i of openSeats(world, c)) {
    if (n >= limit) break;
    if (fieldSeat(world, c, world.seats[i].id)) n++;
  }
  return n;
}

/** Fields the cheapest seats left until `budget` is spent (or the money is gone). Returns how many were added. */
export function fieldWithin(world: World, c: Campaign, budget: number): number {
  let n = 0, spent = 0;
  for (const i of openSeats(world, c)) {
    const cost = nominationCost(world, i);
    if (spent + cost > budget) break;
    if (fieldSeat(world, c, world.seats[i].id)) { n++; spent += cost; }
  }
  return n;
}

/** How near the party came to winning a seat last time, from 0 (nowhere) to 1 (it won): its share of the vote against the leader's. */
export function winChance(world: World, c: Campaign, seat: number): number {
  const o = lastElection(world).seats[seat];
  const best = Math.max(...o.votes);
  return best > 0 ? (o.votes[c.player] ?? 0) / best : 0;
}

/** The seats left to field, the likeliest to be won first (the cheaper of two equal chances before the dearer). */
export function openSeatsByChance(world: World, c: Campaign): number[] {
  return openSeats(world, c).sort((a, b) => winChance(world, c, b) - winChance(world, c, a) || nominationCost(world, a) - nominationCost(world, b) || a - b);
}

/** Fields the seats the party has the best chance in, best first, until `budget` is spent (a seat too dear for what is left is passed over for a cheaper one). Returns how many were added. */
export function fieldBest(world: World, c: Campaign, budget: number): number {
  let n = 0, spent = 0;
  for (const i of openSeatsByChance(world, c)) {
    const cost = nominationCost(world, i);
    if (spent + cost > budget) continue;
    if (fieldSeat(world, c, world.seats[i].id)) { n++; spent += cost; }
  }
  return n;
}

/** The share of its money a party puts into candidates when the game fills the slate for it: the rest is left for the campaign. */
export const AUTO_SLATE = 0.4;

/** The election is over: the seats the party stood in are the ones it has candidates in next time. */
export function closeSlate(world: World, c: Campaign): void {
  const k = c.career;
  if (!k?.own) return;
  k.slate = { held: fieldedSeats(world, c).map((i) => world.seats[i].id), added: {} };
}
