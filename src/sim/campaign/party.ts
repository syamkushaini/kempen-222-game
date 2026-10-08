import type { World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { BLOC_IDS, type BlocId } from '../types';
import { contestsState, scaled } from './actions';
import { factionsOf } from './factions';
import { lastShares } from './field';
import { pushNews, ref } from './news';
import { shiftUnity } from './diplomacy';
import type { Campaign, Career } from './types';

// The party between elections is more than a purse. It has members, who pay their dues and go door to door; it has
// businesses, which pay a return and carry a risk of their own; and it has things it does with its time and money
// before a campaign begins: a recruitment drive, an assembly, a school for cadres.

// ---------- what the party owns ----------

export const HOLDING_IDS = ['property', 'hotel', 'media', 'plantation', 'college'] as const;
export type HoldingId = (typeof HOLDING_IDS)[number];

export interface HoldingDef {
  /** Weekly return on what is held. Negative for what costs money to run. */
  yield: number;
  /** Chance each week, with a fair amount held, that something goes wrong. */
  risk: number;
  /** The share of the holding lost when it does. */
  loss: number;
  /** Credibility lost with it. */
  stain: number;
}

/** Weekly return on the money the party had in "businesses" before there were kinds of them. It is what an unnamed holding earns. */
export const BASE_YIELD = 0.0025;

export const HOLDINGS: Record<HoldingId, HoldingDef> = {
  // Shop lots and land: the quiet money.
  property:  { yield: BASE_YIELD, risk: 0.002, loss: 0.04, stain: 0 },
  // Where deals get done, and where the cameras sometimes are.
  hotel:     { yield: 0.0034, risk: 0.007, loss: 0.06, stain: 2 },
  // A newspaper and a website: little money in it, a good deal of reach, and a libel suit now and then.
  media:     { yield: 0.001, risk: 0.005, loss: 0.1, stain: 1 },
  // Palm oil and rubber, in the countryside the party depends on. The price goes where it likes.
  plantation: { yield: 0.0028, risk: 0.008, loss: 0.08, stain: 0 },
  // A training college: it loses money every week and grows the party.
  college:   { yield: -0.001, risk: 0.001, loss: 0.02, stain: 0 },
};

/** How much of a holding has its full effect: the side effects come in at this many lots and grow up to half as much again. */
const FULL_AT_LOTS = 4;

export const holdingsOf = (k: Career): Record<HoldingId, number> => {
  const out = Object.fromEntries(HOLDING_IDS.map((id) => [id, k.holdings?.[id] ?? 0])) as Record<HoldingId, number>;
  // Money put into businesses before they had kinds sits in property.
  const named = HOLDING_IDS.reduce((a, id) => a + out[id], 0);
  out.property += Math.max(0, k.assets - named);
  return out;
};

/** How strongly a holding's side effect is felt, from nothing to one and a half. */
export function holdingScale(world: World, k: Career, id: HoldingId): number {
  return Math.min(1.5, holdingsOf(k)[id] / (scaled(world, ASSET_UNIT) * FULL_AT_LOTS));
}
/** One lot, before scaling to the size of the contest. */
export const ASSET_UNIT = 100_000;

/** What the party's holdings bring in each week. */
export function holdingsYield(k: Career): number {
  const held = holdingsOf(k);
  return Math.round(HOLDING_IDS.reduce((a, id) => a + held[id] * HOLDINGS[id].yield, 0));
}

/** Scales every holding by the same factor, as when a venture does well or badly across the board, and keeps the total honest. */
export function scaleHoldings(k: Career, factor: number): void {
  const held = holdingsOf(k);
  const next: Partial<Record<HoldingId, number>> = {};
  for (const id of HOLDING_IDS) if (held[id] > 0) next[id] = Math.max(0, Math.round(held[id] * factor));
  k.holdings = next;
  k.assets = HOLDING_IDS.reduce((a, id) => a + (next[id] ?? 0), 0);
}

/** Buys or sells lots of one kind of holding. Selling in a hurry loses a tenth. */
export function trade(world: World, c: Campaign, id: HoldingId, lots: number): boolean {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k || !pc || c.phase !== 'term' || !(HOLDING_IDS as readonly string[]).includes(id) || !Number.isInteger(lots) || lots === 0) return false;
  const amount = scaled(world, ASSET_UNIT) * Math.abs(lots);
  const held = holdingsOf(k);
  if (lots > 0) {
    if (amount > pc.funds) return false;
    pc.funds -= amount;
    held[id] += amount;
  } else {
    if (amount > held[id]) return false;
    held[id] -= amount;
    pc.funds += Math.round(amount * 0.9);
  }
  k.holdings = Object.fromEntries(HOLDING_IDS.filter((x) => held[x] > 0).map((x) => [x, held[x]]));
  k.assets = HOLDING_IDS.reduce((a, x) => a + held[x], 0);
  return true;
}

/** A week of the party's businesses: the hotel's guests, the paper's readers, the college's students, and whatever goes wrong. */
export function holdingsWeek(world: World, c: Campaign, rng: Rng): void {
  const k = c.career!;
  const me = c.player;
  const held = holdingsOf(k);
  for (const id of HOLDING_IDS) {
    if (held[id] <= 0) continue;
    const scale = holdingScale(world, k, id);
    const def = HOLDINGS[id];
    // The paper gets the party seen; the college builds its membership and its unity.
    if (id === 'media') k.profile[me] = Math.min(0.08, k.profile[me] + 0.0006 * scale);
    if (id === 'college') {
      k.rolls = rollsOf(world, c) * (1 + 0.0006 * scale);
      const pc = c.parties[me];
      if (pc) pc.unity = clamp(pc.unity + 0.02 * scale, 0, 100);
    }
    // Something goes wrong, more often with more at stake.
    if (rng.next() < def.risk * Math.max(0.3, scale)) {
      held[id] = Math.round(held[id] * (1 - def.loss));
      k.credibility = clamp(k.credibility - def.stain, 0, 100);
      pushNews(c, { party: me, key: `news.holding.${id}`, vars: {}, tone: 'bad' });
    }
  }
  k.holdings = Object.fromEntries(HOLDING_IDS.filter((x) => held[x] > 0).map((x) => [x, held[x]]));
  k.assets = HOLDING_IDS.reduce((a, x) => a + held[x], 0);
  probeWeek(world, c, rng);
}

/** Investigators may come to the party's businesses: the more it owns the likelier, and they leave with part of the largest. */
function probeWeek(world: World, c: Campaign, rng: Rng): void {
  const k = c.career!;
  if (k.assets <= 0 || rng.next() >= probeChance(world, k)) return;
  const held = holdingsOf(k);
  const biggest = HOLDING_IDS.reduce((a, id) => (held[id] > held[a] ? id : a), HOLDING_IDS[0]);
  const lost = Math.round(held[biggest] * (PROBE.loss[0] + (PROBE.loss[1] - PROBE.loss[0]) * rng.next()));
  held[biggest] -= lost;
  k.holdings = Object.fromEntries(HOLDING_IDS.filter((x) => held[x] > 0).map((x) => [x, held[x]]));
  k.assets = HOLDING_IDS.reduce((a, x) => a + held[x], 0);
  k.credibility = clamp(k.credibility - 3, 0, 100);
  if (k.government.pm === c.player || k.government.partners.includes(c.player)) k.government.trust = clamp(k.government.trust - 2, 0, 100);
  pushNews(c, { party: c.player, key: 'news.probe', vars: { rm: `@rm:${lost}`, what: `@holding:${biggest}` }, tone: 'bad' });
}

// ---------- who belongs ----------

/** What share of a party's voters carry its card. */
const MEMBER_RATE = 0.05;
/** The share of the electorate that turns out, for sizing a party's rolls. */
const TURNOUT = 0.75;

/** How many members a party of this size would have with ordinary branches, ordinary unity and ordinary standing. */
export function baseRolls(world: World, c: Campaign): number {
  const share = lastShares(world).national[c.player] ?? 0;
  return Math.max(200, Math.round(world.totalElectorate * TURNOUT * share * MEMBER_RATE));
}

/** The party's members now. A career that has not set them yet has the ordinary number. */
export const rollsOf = (world: World, c: Campaign): number => Math.round(c.career?.rolls ?? baseRolls(world, c));

/** How the rolls compare with the ordinary number: above one, more dues and more hands for the door-knocking. */
export const rollsFactor = (world: World, c: Campaign): number => rollsOf(world, c) / baseRolls(world, c);

/** What the party's branches, unity and standing would hold the rolls at. */
export function rollsTarget(world: World, c: Campaign): number {
  const pc = c.parties[c.player];
  if (!pc) return baseRolls(world, c);
  const k = c.career!;
  const built = pc.machinery.filter((m, i) => m > 0 && contestsState(world, c, c.player, world.states[i]));
  const branches = built.length ? built.reduce((a, m) => a + m, 0) / built.length : 40;
  const governing = k.government.pm === c.player || k.government.partners.includes(c.player);
  return Math.round(baseRolls(world, c) * clamp(0.5 + branches / 100, 0.6, 1.5) * (0.8 + 0.4 * pc.unity / 100) * (governing ? 1.08 : 1) * (0.9 + 0.2 * k.credibility / 100) * (k.drive ?? 1) * (0.92 + 0.16 * factionsOf(c).wing.reduce((a, b) => a + b, 0) / 300 ));
}

/** A week of the rolls moving towards what the party deserves: slowly, a fiftieth of the gap. */
export function rollsWeek(world: World, c: Campaign): void {
  const k = c.career!;
  const now = k.rolls ?? baseRolls(world, c);
  k.rolls = now + (rollsTarget(world, c) - now) * 0.02;
  // A drive's lift fades.
  if (k.drive && k.drive > 1) k.drive = Math.max(1, k.drive - 0.004);
}

// ---------- what the party does ----------

export const ACTIVITY_IDS = ['recruit', 'assembly', 'school'] as const;
export type ActivityId = (typeof ACTIVITY_IDS)[number];

export interface ActivityDef {
  /** Money, at general-election scale. */
  cost: number;
  /** Weeks before it can be done again. */
  every: number;
}

export const ACTIVITIES: Record<ActivityId, ActivityDef> = {
  // A drive for members: a table at every market and mosque, for a month.
  recruit:  { cost: 40_000, every: 26 },
  // The annual general assembly: speeches, resolutions, and a dinner at which everyone is reconciled.
  assembly: { cost: 70_000, every: 52 },
  // Cadres taught how to run a branch, count a vote and keep a record.
  school:   { cost: 50_000, every: 26 },
};

export const activityCost = (world: World, id: ActivityId) => scaled(world, ACTIVITIES[id].cost);

/** Weeks until an activity can be done again; zero if it can be done now. */
export function activityWait(c: Campaign, id: ActivityId): number {
  const k = c.career;
  const last = k?.activity?.[id];
  return k && last !== undefined ? Math.max(0, last + ACTIVITIES[id].every - k.week) : 0;
}

export type ActivityRefusal = 'phase' | 'funds' | 'wait';
export function canDoActivity(world: World, c: Campaign, id: ActivityId): { ok: true } | { ok: false; reason: ActivityRefusal } {
  const pc = c.parties[c.player];
  if (!c.career || !pc || c.phase !== 'term') return { ok: false, reason: 'phase' };
  if (activityWait(c, id) > 0) return { ok: false, reason: 'wait' };
  if (activityCost(world, id) > pc.funds) return { ok: false, reason: 'funds' };
  return { ok: true };
}

/** Does something with the party's time and money: pays for it, and the party is the better for it. */
export function doActivity(world: World, c: Campaign, id: ActivityId): boolean {
  if (!canDoActivity(world, c, id).ok) return false;
  const k = c.career!;
  const pc = c.parties[c.player]!;
  pc.funds -= activityCost(world, id);
  (k.activity ??= {})[id] = k.week;
  switch (id) {
    case 'recruit':
      // The rolls jump, and the lift to the target holds for a while before it fades.
      k.rolls = rollsOf(world, c) * 1.08;
      k.drive = 1.25;
      break;
    case 'assembly':
      shiftUnity(c, c.player, 8);
      k.credibility = clamp(k.credibility + 2, 0, 100);
      k.rolls = rollsOf(world, c) * 1.02;
      break;
    case 'school':
      pc.machinery = pc.machinery.map((m, i) => (m > 0 && contestsState(world, c, c.player, world.states[i]) ? clamp(m + 4, 0, 100) : m));
      break;
  }
  pushNews(c, { party: c.player, key: `news.activity.${id}`, vars: { n: Math.round(rollsOf(world, c)) }, tone: 'good' });
  void ref;
  return true;
}

// ---------- what an organisation built over the years is worth on polling day ----------

/** The most an organisation built over years can add to the party's support everywhere, in logit units (about three and a half points of vote). */
export const GRASSROOTS_MAX = 0.14;
/** Members, against the ordinary roll, at which the roll's side of it is complete: a party with sixty per cent more members than usual. */
const FULL_ROLLS = 1.6;
/** Branch strength at which the branches' side of it begins, and is complete at the other end. */
const BRANCHES_FROM = 40, BRANCHES_TO = 80;

/**
 * What the party's members and branches add at the next election, to every group of voters: nothing for a party with
 * the members and branches it started with, the full amount for one with sixty per cent more members and strong branches
 * everywhere it stands. Both halves have to be there, so it is built over terms, with drives, schools and branches,
 * and not bought in a week. It is what lets a party in the end win a majority on its own.
 */
export function grassrootsLift(world: World, c: Campaign): number {
  const pc = c.parties[c.player];
  if (!c.career || !pc) return 0;
  const built = pc.machinery.filter((m, i) => m > 0 && contestsState(world, c, c.player, world.states[i]));
  const branches = built.length ? built.reduce((a, m) => a + m, 0) / built.length : 0;
  const members = clamp((rollsFactor(world, c) - 1) / (FULL_ROLLS - 1), 0, 1);
  return GRASSROOTS_MAX * members * clamp((branches - BRANCHES_FROM) / (BRANCHES_TO - BRANCHES_FROM), 0, 1);
}

// ---------- what staying in power does ----------

/** How much voters tire of a party for every parliament in a row it has sat in government beyond the first, in logit units across all groups. */
export const FATIGUE_PER_TERM = 0.05;

/** The weariness voters feel at the start of this parliament: nothing for a first term in government, and more with each one after. */
export const fatigueOf = (run: number): number => FATIGUE_PER_TERM * Math.max(0, run - 1);

/** A party that wins this share of the seats has won more than is good for it. */
export const LANDSLIDE = 0.675;

/** What a landslide does to the party that wins it: the factions grow bold, the party grows careless, and everyone wants their share. */
export const LANDSLIDE_HIT = { unity: 10, faction: 10, wing: 5 };

/** Applies a landslide to the player's party. */
export function landslide(c: Campaign): void {
  const k = c.career!;
  const f = factionsOf(c);
  f.mood = f.mood.map((m) => clamp(m - LANDSLIDE_HIT.faction, 0, 100));
  f.wing = f.wing.map((m) => clamp(m - LANDSLIDE_HIT.wing, 0, 100));
  shiftUnity(c, c.player, -LANDSLIDE_HIT.unity);
  pushNews(c, { party: c.player, key: 'news.landslide', vars: {}, tone: 'bad' });
  void k;
}

// ---------- the war chest ----------

/** What it costs to take money back out of the chest before a campaign has begun. */
export const CHEST_PENALTY = 0.15;
/** What the chest earns by the time a campaign begins: donors match what a party has shown it is ready to put in. */
export const CHEST_BONUS = 0.1;

/** Sets aside (positive lots) or takes back (negative) money for the next campaign. */
export function setAside(world: World, c: Campaign, lots: number): boolean {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k || !pc || c.phase !== 'term' || !Number.isInteger(lots) || lots === 0) return false;
  const amount = scaled(world, ASSET_UNIT) * Math.abs(lots);
  const chest = k.chest ?? 0;
  if (lots > 0) {
    if (amount > pc.funds) return false;
    pc.funds -= amount;
    k.chest = chest + amount;
  } else {
    if (amount > chest) return false;
    k.chest = chest - amount;
    pc.funds += Math.round(amount * (1 - CHEST_PENALTY));
    if (k.chest === 0) delete k.chest;
  }
  return true;
}

/** The campaign begins: what was set aside comes out, with what the donors add. */
export function openChest(c: Campaign): number {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k?.chest || !pc) return 0;
  const sum = Math.round(k.chest * (1 + CHEST_BONUS));
  pc.funds += sum;
  delete k.chest;
  pushNews(c, { party: c.player, key: 'news.chest.opened', vars: { rm: `@rm:${sum}` }, tone: 'good' });
  return sum;
}

// ---------- the law's interest in what the party owns ----------

/** The weekly chance of a probe into the party's businesses, for each RM100k at general-election scale it owns, and the most it can be. */
export const PROBE = { perLot: 0.0004, max: 0.02, loss: [0.1, 0.25] as const };

/** The chance this week that investigators come to the party's businesses: more with more to look at. */
export function probeChance(world: World, k: Career): number {
  return Math.min(PROBE.max, (k.assets / scaled(world, ASSET_UNIT)) * PROBE.perLot);
}

// ---------- young branches ----------

/** Branch strength a party starts with in a state it has stood in for the first time. */
export const FOOTHOLD = 5;
/** How fast young branches grow, against ordinary ones, and the strength at which they count as established. */
export const YOUNG_BRANCHES = 0.35;
export const MATURE = 40;

// ---------- discipline ----------

export const DISCIPLINE = {
  // A branch that is suspended stops its work for a while: the leadership is heard.
  suspend: { branches: 20, unity: 3, rolls: 0, wings: 0 },
  // A branch that is dissolved is closed and its officers sent home: the leadership is feared.
  dissolve: { branches: 45, unity: 7, rolls: 0.04, wings: 2 },
} as const;
export type Discipline = keyof typeof DISCIPLINE;
/** Weeks before the same state's branches can be disciplined again. */
export const DISCIPLINE_EVERY = 26;

export function canDiscipline(world: World, c: Campaign, state: string): boolean {
  const k = c.career;
  const pc = c.parties[c.player];
  const i = world.states.indexOf(state);
  if (!k || !pc || c.phase !== 'term' || i < 0 || pc.machinery[i] <= FOOTHOLD) return false;
  const last = k.disciplined?.[state];
  return last === undefined || k.week - last >= DISCIPLINE_EVERY;
}

/** Suspends or dissolves a state's branches: they are weaker, and the party is more together for it. */
export function discipline(world: World, c: Campaign, state: string, how: Discipline): boolean {
  if (!canDiscipline(world, c, state) || !(how in DISCIPLINE)) return false;
  const k = c.career!;
  const pc = c.parties[c.player]!;
  const i = world.states.indexOf(state);
  const d = DISCIPLINE[how];
  pc.machinery[i] = Math.max(FOOTHOLD, pc.machinery[i] - d.branches);
  shiftUnity(c, c.player, d.unity);
  if (d.rolls) k.rolls = rollsOf(world, c) * (1 - d.rolls);
  if (d.wings) { const f = factionsOf(c); f.wing = f.wing.map((m) => clamp(m - d.wings, 0, 100)); }
  (k.disciplined ??= {})[state] = k.week;
  // Branches that have been closed have to be built again, from nothing.
  if (how === 'dissolve') (k.fresh ??= []).includes(state) || k.fresh.push(state);
  pushNews(c, { party: c.player, key: `news.discipline.${how}`, vars: { state: `@state:${state}` }, tone: 'neutral' });
  return true;
}

// ---------- a new name ----------

/** What it costs a party to change its name, its colours and its flag, and the credibility it spends. */
export const REBRAND = { funds: 150_000, credibility: 8, rolls: 0.05, lost: 0.03, won: 0.04 };
const LOYAL: BlocId[] = ['heartland', 'felda', 'agri', 'seniors', 'civil'];
const NEW: BlocId[] = ['undi18', 'urban_lib', 'm40', 'gig'];

export function canRebrand(world: World, c: Campaign): boolean {
  const k = c.career;
  const pc = c.parties[c.player];
  return !!k && !!pc && c.phase === 'term' && pc.funds >= scaled(world, REBRAND.funds) && !k.flags.includes(`rebrand${k.term}`);
}

/** The party changes its face: some of its old voters are lost, some new ones are won, it costs money and credibility, and it can be done once a term. */
export function rebrand(world: World, c: Campaign): boolean {
  if (!canRebrand(world, c)) return false;
  const k = c.career!;
  c.parties[c.player]!.funds -= scaled(world, REBRAND.funds);
  k.flags.push(`rebrand${k.term}`);
  k.credibility = clamp(k.credibility - REBRAND.credibility, 0, 100);
  k.rolls = rollsOf(world, c) * (1 - REBRAND.rolls);
  for (const b of LOYAL) k.mood[BLOC_IDS.indexOf(b)][c.player] -= REBRAND.lost;
  for (const b of NEW) k.mood[BLOC_IDS.indexOf(b)][c.player] += REBRAND.won;
  pushNews(c, { party: c.player, key: 'news.rebrand', vars: {}, tone: 'neutral' });
  return true;
}
