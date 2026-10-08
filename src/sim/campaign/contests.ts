import { lastElection, majorityLine, type World } from '../election';
import { clamp, zeros, zeros2 } from '../math';
import { projectSeat } from '../project';
import { Rng } from '../rng';
import { N_BLOCS, N_PARTIES, PARTY_IDS, type Dynamics, type StateId } from '../types';
import { effectiveDynamics, scaled } from './actions';
import { addScene, shiftUnity } from './diplomacy';
import { pushNews, ref } from './news';
import type { Campaign, Scene, StateVote } from './types';

// Contests fought inside a term: a by-election when a seat falls vacant, and
// the rounds of state polls. Both are fought with one decision and the
// standing orders, not a full campaign, and both are settled by the same
// voter model as everything else.

const OTH = PARTY_IDS.indexOf('oth');

// ---------- the House as it now sits ----------

/** Who held a seat when the last general election was declared. */
const elected = (world: World, i: number) => lastElection(world).seats[i].winner;

/** Who holds a seat now: whoever won it at the general election, unless a by-election since has changed that. */
export function holderOf(world: World, c: Campaign, seat: string): number {
  return c.career?.house[seat] ?? elected(world, world.seatIndex.get(seat)!);
}

/** The ids of the seats a party holds now (looks the last election up once, which holderOf does for every seat). */
export function seatsHeldBy(world: World, c: Campaign, p: number): string[] {
  const last = lastElection(world);
  return world.seats.filter((s, i) => (c.career?.house[s.id] ?? last.seats[i].winner) === p).map((s) => s.id);
}

/** Seats in the House by party, as it sits today. */
export function houseTally(world: World, c: Campaign): number[] {
  const tally = [...lastElection(world).tally];
  for (const [seat, now] of Object.entries(c.career?.house ?? {})) {
    const was = elected(world, world.seatIndex.get(seat)!);
    if (was === now) continue;
    tally[was]--;
    tally[now]++;
  }
  return tally;
}

/** A copy of what is moving voters now, with room to add to it. */
function withNoise(c: Campaign): Dynamics {
  return structuredClone(effectiveDynamics(c));
}

// ---------- by-elections ----------

/** What each level of effort costs and adds: everything the party has, a candidate and a small budget, or the local branch on its own. */
export const BY_EFFORT = [{ money: 150_000, lift: 0.25 }, { money: 50_000, lift: 0.1 }, { money: 0, lift: -0.05 }];
const BY_NOISE = 0.12;

/** Picks the seat that has fallen vacant: one the player's party fights, wherever it is. */
export function vacantSeat(world: World, c: Campaign, rng: Rng): string {
  const fought = world.seats.filter((_, i) => world.baseline.contesting[i][c.player]);
  return (fought.length ? fought : world.seats)[rng.int(fought.length || world.seats.length)].id;
}

/**
 * A by-election the party calls on itself: one of its members resigns the seat so that it can be fought for. It costs
 * the party some goodwill with the voters for the trouble; won, it shows the party's strength, and lost, it is a seat
 * thrown away.
 */
export const FORCE = { money: 30_000, credibility: 3, unity: 2, won: 5, lost: 3 };

export type ForceRefusal = 'phase' | 'seat' | 'funds' | 'again';

export function canForce(world: World, c: Campaign, seat: string): { ok: true } | { ok: false; reason: ForceRefusal } {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k || !pc || c.phase !== 'term' || c.inbox.length > 0 || world.rules.kind === 'state') return { ok: false, reason: 'phase' };
  if (!world.seatIndex.has(seat) || holderOf(world, c, seat) !== c.player) return { ok: false, reason: 'seat' };
  if (k.flags.includes(`force${k.term}`)) return { ok: false, reason: 'again' };
  if (pc.funds < scaled(world, FORCE.money)) return { ok: false, reason: 'funds' };
  return { ok: true };
}

/** Has the member for a seat resign, and the by-election called. Once a parliament. */
export function forceByElection(world: World, c: Campaign, seat: string): boolean {
  if (!canForce(world, c, seat).ok) return false;
  const k = c.career!;
  c.parties[c.player]!.funds -= scaled(world, FORCE.money);
  k.credibility = clamp(k.credibility - FORCE.credibility, 0, 100);
  shiftUnity(c, c.player, -FORCE.unity);
  k.flags.push(`force${k.term}`);
  k.forced = seat;
  pushNews(c, { party: c.player, key: 'news.by.forced', vars: { seat: ref.seat(seat) }, tone: 'neutral' });
  addScene(c, { kind: 'event', from: null, event: 'byElection', seat });
  return true;
}

export interface ByResult { seat: string; winner: number; was: number; margin: number }

/**
 * Holds a by-election. The player has chosen how hard to fight it (0, 1 or
 * 2); the voters of that seat decide with the mood of the country as it is
 * today. Whoever wins sits in the House from now on.
 */
export function resolveByElection(world: World, c: Campaign, scene: Scene, choice: number): ByResult | null {
  const k = c.career;
  const pc = c.parties[c.player];
  const i = scene.seat === undefined ? undefined : world.seatIndex.get(scene.seat);
  const effort = BY_EFFORT[choice];
  if (!k || !pc || i === undefined || !effort) return null;
  const me = c.player;
  const seat = world.seats[i];
  const rng = new Rng(c.rng);

  // Money buys effort only as far as there is money.
  const price = scaled(world, effort.money);
  const paid = Math.min(pc.funds, price);
  pc.funds -= paid;
  const dyn = withNoise(c);
  const local = (dyn.support.seat[seat.id] ??= zeros(N_PARTIES));
  for (let p = 0; p < N_PARTIES; p++) local[p] += rng.normal(0, BY_NOISE);
  local[me] += effort.lift * (price > 0 ? paid / price : 1);
  c.rng = rng.state;

  const out = projectSeat(seat, i, world.baseline, dyn);
  const was = holderOf(world, c, seat.id);
  const winner = out.winner;
  if (winner !== was) {
    if (winner === elected(world, i)) delete k.house[seat.id]; else k.house[seat.id] = winner;
    const g = k.government;
    const inGov = (p: number) => p === g.pm || g.partners.includes(p);
    g.seats += (inGov(winner) ? 1 : 0) - (inGov(was) ? 1 : 0);
    if (inGov(was) && !inGov(winner)) g.stability = clamp(g.stability - 3, 5, 95);
    for (let b = 0; b < N_BLOCS; b++) { k.mood[b][winner] += 0.008; k.mood[b][was] -= 0.006; }
  }
  if (winner === me) shiftUnity(c, me, was === me ? 1 : 3);
  else if (was === me) shiftUnity(c, me, -3);
  else if (choice === 0) shiftUnity(c, me, -1);

  if (k.forced === seat.id) {
    delete k.forced;
    if (winner === me) k.credibility = clamp(k.credibility + FORCE.won, 0, 100);
    else k.credibility = clamp(k.credibility - FORCE.lost, 0, 100);
  }

  const key = winner === me ? (was === me ? 'news.by.held' : 'news.by.won') : was === me ? 'news.by.lost' : 'news.by.other';
  pushNews(c, {
    party: winner, key, tone: winner === me ? 'good' : was === me ? 'bad' : 'neutral',
    vars: { seat: ref.seat(seat.id), party: ref.party(winner), from: ref.party(was), pct: (out.margin * 100).toFixed(1) },
  });
  return { seat: seat.id, winner, was, margin: out.margin };
}

// ---------- state polls ----------

/** The states go to the polls in three rounds through the term. The federal territories have no assembly. */
export const ROUNDS: { week: number; states: StateId[] }[] = [
  { week: 70, states: ['sabah', 'sarawak'] },
  { week: 130, states: ['kedah', 'kelantan', 'terengganu', 'penang', 'selangor', 'nsembilan'] },
  { week: 190, states: ['perlis', 'perak', 'pahang', 'melaka', 'johor'] },
];
export const STATE_EFFORT = [{ money: 300_000, lift: 0.1, branches: 4 }, { money: 100_000, lift: 0.04, branches: 0 }, { money: 0, lift: -0.03, branches: 0 }];
const STATE_NOISE = 0.06;
/** What a state government is worth to the party that holds it, each week. */
export const STATE_GOVERNMENT_INCOME = 2_000;

/** The party with the most seats in each state: who would form its government. Ties go to whoever is in office. */
export function leaders(world: World, winners: number[], states: readonly string[], incumbent: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const st of states) {
    const count = new Array<number>(N_PARTIES).fill(0);
    for (const i of world.seatsByState[st] ?? []) count[winners[i]]++;
    count[OTH] = 0;
    const best = Math.max(...count);
    if (best === 0) continue;
    const holder = incumbent[st];
    out[st] = holder !== undefined && count[holder] === best ? holder : count.indexOf(best);
  }
  return out;
}

/** The seats each party holds in a state, by party, given who won each seat of the country. */
export function seatsInState(world: World, winners: readonly number[], state: string): number[] {
  const count = new Array<number>(N_PARTIES).fill(0);
  for (const i of world.seatsByState[state] ?? []) count[winners[i]]++;
  return count;
}

/** What a state election gave the general election's seats in that state: the seats then, and the seats now. */
export function stateVoteOf(world: World, now: readonly number[], state: string, inPerson = false): Omit<StateVote, 'week'> {
  const before = seatsInState(world, lastElection(world).seats.map((o) => o.winner), state);
  return { seats: seatsInState(world, now, state), before, ...(inPerson ? { inPerson } : {}) };
}

/** Who governs each state as a career opens: whoever carried it at the last general election. */
export function startStates(world: World): Record<string, number> {
  const all = ROUNDS.flatMap((r) => r.states).filter((st) => world.states.includes(st));
  return leaders(world, lastElection(world).seats.map((o) => o.winner), all, {});
}

/** The round of state polls now due, if any. */
export function roundDue(c: Campaign): number | null {
  const k = c.career;
  if (!k || k.rounds >= ROUNDS.length) return null;
  return k.week >= ROUNDS[k.rounds].week ? k.rounds : null;
}

export interface StateResult { state: string; winner: number; was: number | undefined; vote?: Omit<StateVote, 'week'> }

/**
 * Holds a round of state polls. Each state is decided on its parliamentary
 * seats, with the country's mood as it is today and the effort the player
 * chose (0, 1 or 2). Whoever takes most seats governs the state.
 */
export function resolveStatePolls(world: World, c: Campaign, choice: number, played: readonly string[] = []): StateResult[] {
  const k = c.career;
  const pc = c.parties[c.player];
  const effort = STATE_EFFORT[choice];
  if (!k || !pc || !effort || k.rounds >= ROUNDS.length) return [];
  const me = c.player;
  const inRound = ROUNDS[k.rounds].states.filter((st) => world.states.includes(st));
  // States the player fights in person are not left to the model: their own election settles them (see aside.ts).
  const states = inRound.filter((st) => !played.includes(st));
  k.rounds++;
  const rng = new Rng(c.rng);

  // Where every state of the round is fought in person, there is nothing left for the effort to be spent on.
  const price = states.length > 0 ? scaled(world, effort.money) : 0;
  const paid = Math.min(pc.funds, price);
  pc.funds -= paid;
  const lift = effort.lift * (price > 0 ? paid / price : 1);
  const dyn = withNoise(c);
  const winners = lastElection(world).seats.map((o) => o.winner);
  for (const st of states) {
    const rows = (dyn.support.state[st] ??= zeros2(N_BLOCS, N_PARTIES));
    const swing = PARTY_IDS.map(() => rng.normal(0, STATE_NOISE));
    for (const row of rows) for (let p = 0; p < N_PARTIES; p++) row[p] += swing[p] + (p === me ? lift : 0);
    for (const i of world.seatsByState[st]) winners[i] = projectSeat(world.seats[i], i, world.baseline, dyn).winner;
    if (effort.branches) { const s = world.states.indexOf(st); if (pc.machinery[s] > 0) pc.machinery[s] = Math.min(100, pc.machinery[s] + effort.branches); }
  }
  c.rng = rng.state;

  const now = leaders(world, winners, states, k.states);
  const results: StateResult[] = states.filter((st) => now[st] !== undefined).map((st) => ({ state: st, winner: now[st], was: k.states[st], vote: stateVoteOf(world, winners, st) }));
  applyStateResults(c, results);
  return results;
}

/**
 * What a state changing hands does, however it was decided: it is recorded, a story the whole country reads, and the player's
 * party feels it. One line of news for each party that came out of the round governing somewhere.
 */
export function applyStateResults(c: Campaign, results: StateResult[]): void {
  const k = c.career!;
  const me = c.player;
  for (const r of results) {
    k.states[r.state] = r.winner;
    if (r.vote) (k.stateVotes ??= {})[r.state] = { week: k.week, ...r.vote };
    if (r.was === r.winner) continue;
    for (let b = 0; b < N_BLOCS; b++) { k.mood[b][r.winner] += 0.006; if (r.was !== undefined) k.mood[b][r.was] -= 0.004; }
    if (r.winner === me) shiftUnity(c, me, 2);
    if (r.was === me) shiftUnity(c, me, -3);
  }
  const byWinner = new Map<number, StateResult[]>();
  for (const r of results) byWinner.set(r.winner, [...(byWinner.get(r.winner) ?? []), r]);
  for (const [party, won] of byWinner) {
    const gained = won.filter((r) => r.was !== party);
    pushNews(c, {
      party, key: gained.length ? 'news.states.won' : 'news.states.held',
      vars: { party: ref.party(party), states: `@states:${(gained.length ? gained : won).map((r) => r.state).join(',')}` },
      tone: party === me ? 'good' : gained.some((r) => r.was === me) ? 'bad' : 'neutral',
    });
  }
}

/** How many state governments a party leads. */
export const statesHeld = (c: Campaign, p: number) => Object.values(c.career?.states ?? {}).filter((x) => x === p).length;

/** Whether the government still has the numbers after the House has changed. */
export const hasMajority = (world: World, c: Campaign) => (c.career?.government.seats ?? 0) >= majorityLine(world);
