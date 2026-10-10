import type { World } from '../election';
import { clamp } from '../math';
import type { StandDowns } from '../transfer';
import { N_PARTIES, PARTY_IDS, isFielded, isMinor, type FieldedId, type PartyId, type RegionId } from '../types';
import { purseOf, scaled } from './actions';
import { FOUNDING_SLOT } from './founding';
import { START_UNITY } from './cast';
import { DAYS_PER_WEEK, type Campaign, type Pact, type PartyCampaign } from './types';

// Who takes the field in a contest, and what each brings on the first day: which
// parties campaign, which of them a player can lead, their money and branches,
// and any pact the contest opens under. All of it is read from the last result.

/** Parties that can be played, where they campaign in the contest. */
const PLAYABLE_IDS: PartyId[] = ['ps', 'bp', 'pt'];
/** The parties of Sabah and Sarawak that can be led across the whole country, in a general election or a career. */
const KINGMAKER_IDS: PartyId[] = ['gbk', 'gbs', 'legasi'];
/** The home ground of the parties of Sabah and Sarawak. The larger of them can be played there: in a state election or a by-election. */
const HOME_GROUND: Partial<Record<PartyId, string>> = { gbk: 'sarawak', gbs: 'sabah', legasi: 'sabah', cahaya: 'sarawak', suara: 'sabah' };
/** A national party brings a share of its chest to a local contest; a party fighting on its home ground brings far more of its own. */
const HOME_CHEST = 3;

/** A party with no seat campaigns in a contest only if it won at least this share of the vote there last time. */
const MIN_SHARE_TO_CAMPAIGN = 0.05;

const START: Record<FieldedId, { funds: number; home: RegionId; machineryBonus: number; days: number }> = {
  ps:     { funds: 1_200_000, home: 'selangor', machineryBonus: 0,  days: DAYS_PER_WEEK },
  bp:     { funds: 1_600_000, home: 'kl',       machineryBonus: 10, days: DAYS_PER_WEEK },
  pt:     { funds: 1_100_000, home: 'kelantan', machineryBonus: 5,  days: DAYS_PER_WEEK },
  // Regional parties run smaller headquarters.
  gbk:    { funds: 700_000,   home: 'sarawak',  machineryBonus: 10, days: 5 },
  gbs:    { funds: 400_000,   home: 'sabah',    machineryBonus: 5,  days: 4 },
  legasi: { funds: 300_000,   home: 'sabah',    machineryBonus: 0,  days: 4 },
  // The small parties run on a shoestring.
  genba:  { funds: 90_000,    home: 'johor',    machineryBonus: 0,  days: 5 },
  cahaya: { funds: 80_000,    home: 'sarawak',  machineryBonus: 5,  days: 4 },
  suara:  { funds: 60_000,    home: 'sabah',    machineryBonus: 5,  days: 4 },
};

interface LastShares { national: number[]; state: Record<RegionId, number[]> }
const shareCache = new WeakMap<World, LastShares>();

/** Each party's share of the vote last time, across the contest and by region. */
export function lastShares(world: World): LastShares {
  const cached = shareCache.get(world);
  if (cached) return cached;
  const national = new Array<number>(N_PARTIES).fill(0);
  const state: Record<RegionId, number[]> = Object.fromEntries(world.states.map((st) => [st, new Array<number>(N_PARTIES).fill(0)]));
  for (const seat of world.seats) {
    seat.last.votes.forEach((v, p) => { national[p] += v; state[seat.state][p] += v; });
  }
  const norm = (a: number[]) => { const t = a.reduce((x, y) => x + y, 0); return a.map((v) => (t ? v / t : 0)); };
  const result = { national: norm(national), state: Object.fromEntries(world.states.map((st) => [st, norm(state[st])])) };
  shareCache.set(world, result);
  return result;
}

/**
 * Whether a party runs a campaign in this contest: it holds a seat or has real
 * support. Token presences and the pooled independents do not.
 */
export function campaigns(world: World, p: number): boolean {
  if (!isFielded(PARTY_IDS[p])) return false;
  const holdsSeat = world.seats.some((s) => s.last.votes[p] > 0 && s.last.votes[p] === Math.max(...s.last.votes));
  if (holdsSeat) return true;
  // A party the player founded in a career is on every ballot from the first day, with too few votes yet to count as a following.
  if (PARTY_IDS[p] === FOUNDING_SLOT && world.rules.career && world.seats.every((s) => s.last.votes[p] > 0)) return true;
  // A party's following is what it would poll with everyone standing: a pact that kept it off most ballots did not make its voters vanish.
  let mine = 0, all = 0;
  for (const s of world.seats) for (const [q, v] of (s.basis?.votes ?? s.last.votes).entries()) { all += v; if (q === p) mine += v; }
  return all > 0 && mine / all >= MIN_SHARE_TO_CAMPAIGN;
}

/** Whether the contest is a local one on a regional party's own ground: its state's election, or a by-election there. */
export function atHome(world: World, p: number): boolean {
  const kind = world.rules.kind;
  return (kind === 'state' || kind === 'byelection') && world.seats[0].region === HOME_GROUND[PARTY_IDS[p]];
}

/**
 * Parties of Sabah and Sarawak that can be led in another state's election, as outsiders: they hold no seat there and
 * have to put up candidates in the seats they choose (see entry.ts), starting with no branches in the state.
 */
const OUTSIDER_IDS: PartyId[] = ['gbk', 'gbs', 'legasi'];

/** Whether a party is in this contest as an outsider: led by the player, with no seat or following of its own on this ground. */
export const isOutsider = (world: World, p: number) => world.rules.kind === 'state' && OUTSIDER_IDS.includes(PARTY_IDS[p]) && !campaigns(world, p);

/** Parties the player can lead in this contest: a party on its home ground first, then the national ones. */
export function playable(world: World): number[] {
  const all = PARTY_IDS.map((_, p) => p);
  // Across the whole country the parties of Sabah and Sarawak can be led as kingmakers: they cannot win a majority, but they can decide who governs.
  const national = world.rules.kind === 'general' || world.rules.kind === 'hung';
  const offered = [
    ...all.filter((p) => atHome(world, p) && !isMinor(p)),
    ...all.filter((p) => PLAYABLE_IDS.includes(PARTY_IDS[p])),
    ...(national ? all.filter((p) => KINGMAKER_IDS.includes(PARTY_IDS[p])) : []),
  ];
  // In a one-seat contest the party must also be on that ballot, or it could do nothing there.
  const here = offered.filter((p) => campaigns(world, p) && (world.seats.length > 1 || world.baseline.contesting[0][p]));
  // In another state's election the parties of Sabah and Sarawak may come as outsiders, after everyone else.
  const outsiders = world.rules.kind === 'state' ? all.filter((p) => isOutsider(world, p) && !here.includes(p)) : [];
  return [...here, ...outsiders];
}

export function startingFunds(world: World, p: number): number {
  return scaled(world, START[PARTY_IDS[p] as FieldedId].funds * (atHome(world, p) ? HOME_CHEST : 1));
}

export function weeklyIncome(world: World, p: number, c?: Campaign): number {
  return scaled(world, (40_000 + 300_000 * lastShares(world).national[p]) * purseOf(p, c));
}

/** A party's campaign as it stands on the first day: money in the bank, a rested leader, and branches where it has support. */
export function freshParty(world: World, p: number, outsider = false): PartyCampaign | null {
  const id = PARTY_IDS[p];
  if (!isFielded(id) || (!campaigns(world, p) && !outsider)) return null;
  const shares = lastShares(world);
  const general = world.rules.kind === 'general';
  const start = START[id];
  // Outside a general election, the leader starts where the party is strongest.
  const strongest = world.states.reduce((best, st) => (shares.state[st][p] > shares.state[best][p] ? st : best), world.states[0]);
  const days = general ? start.days : DAYS_PER_WEEK;
  return {
    funds: startingFunds(world, p),
    capacity: days,
    days,
    location: general ? start.home : strongest,
    // Organisation follows past support: strong where the party polled well.
    machinery: world.states.map((st) => {
      const share = shares.state[st][p];
      return share > 0 ? Math.round(clamp(25 + 70 * share ** 0.7 + start.machineryBonus, 10, 95)) : 0;
    }),
    used: {},
    dinners: {},
    crowdfunds: 0,
    tycoon: 0,
    visits: [],
    chiefs: {},
    chiefFloor: 0,
    unity: START_UNITY[id],
    spent: 0,
    fined: false,
  };
}

/**
 * The pact a contest opens under: where the last election was fought with parties standing aside for each other,
 * and leaders can deal with each other in this one, the same arrangement still holds until someone ends it.
 */
export function standingPact(world: World): { standDowns: StandDowns; pacts: Pact[] } {
  const standDowns: StandDowns = {};
  const pacts: Pact[] = [];
  if (!world.rules.diplomacy) return { standDowns, pacts };
  for (const seat of world.seats) {
    if (!seat.stood || seat.stood.every((v) => v < 0)) continue;
    standDowns[seat.id] = [...seat.stood];
    seat.stood.forEach((to, from) => {
      const a = Math.min(from, to), b = Math.max(from, to);
      // Only parties that run a campaign have a leader to hold a pact with.
      if (to >= 0 && campaigns(world, a) && campaigns(world, b) && !pacts.some((x) => x.a === a && x.b === b)) pacts.push({ a, b, week: 0 });
    });
  }
  return { standDowns, pacts };
}
