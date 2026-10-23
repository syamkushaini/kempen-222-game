import type { World } from '../election';
import { clamp, zeros2 } from '../math';
import { N_BLOCS, N_PARTIES, type RegionId } from '../types';
import { contestsState, scaled } from './actions';
import { STATE_GOVERNMENT_INCOME, statesHeld } from './contests';
import { stanceCost } from './stances';
import { isFederalWorld, procurementMult } from './defence';
import { figuresOf, sectorShares, STATE_PUBLIC } from './gdp';
import { DEBT_FLOOR, MEASURES, RATE, inGov, isPm } from './office';
import { builtEffects, projectsCost, taxEffects } from './econPlansData';
import { patronageMult } from './patronage';
import { pushNews, ref } from './news';
import { SECTOR_IDS, type SectorId } from './sectors';
import { LINE_IDS, type Budget, type Campaign, type LineId } from './types';
import { lineMult } from './lineDial';

// The government's money is not the party's. Governing brings a weekly allocation into a treasury of its own: large for the
// head of government, smaller for a partner, and a little for every state the party governs, at the centre or not. It
// can be spent only on development grants in the places the party has chosen, which win it goodwill there. The only way
// it reaches the party's own purse is to be diverted, which is what "state resources" is, with the risks that always had.
// The treasury is the government's, so a party that governs nowhere leaves it behind, and in an election campaign it is
// frozen: nothing is received, granted or diverted until the new term.

/**
 * The government's money is counted in millions and billions, not in the party's tens of thousands: an amount written at the party's
 * scale (the way the game's figures have always been written) is multiplied by this to be what the government spends. In a state it is
 * a fortieth of that, so that a state's treasury is a state's and not the country's.
 */
export const GOV_SCALE = 30_000;
export const STATE_SHARE = 0.025;
const GOV_ROUND = 100_000;
/** What an amount written at the party's general-election scale is, as the government's own money, in this contest. */
export const govMoney = (world: World, n: number): number => {
  if (n === 0) return 0;
  const sign = Math.sign(n);
  return sign * Math.max(GOV_ROUND, Math.round((Math.abs(n) * GOV_SCALE * (world.rules.kind === 'state' ? STATE_SHARE : 1)) / GOV_ROUND) * GOV_ROUND);
};

/** What each level of development grants costs a week, at the party's scale (the government's is `govMoney` of it); and what a level of diversion moves, which is the party's. */
export const GRANT_STEP = 10_000;
export const DIVERT_STEP = 10_000;
/** The weekly allocation of a head of government, and of a partner in government, at the party's general-election scale. */
export const ALLOCATION = { pm: 36_000, partner: 14_000 } as const;
/** The treasury holds at most this many weeks of its allocation: what is not spent is not saved up for ever. */
export const TREASURY_WEEKS = 26;
/** Goodwill: how much grant money buys a point of it, how much of it fades each week, and what a point is worth to the party's standing. */
export const GRANT_PER_POINT = 8_000;
export const GOODWILL_FADE = 0.015;
export const GOODWILL_EFFECT = 0.0006;
export const GOODWILL_MAX = 100;

export const treasuryOf = (c: Campaign): number => c.career?.treasury ?? 0;

/** Whether the player's party has public money to handle: it is in the government at the centre, or governs a state. */
export const hasPublicMoney = (c: Campaign): boolean => !!c.career && (inGov(c, c.player) || statesHeld(c, c.player) > 0);

/**
 * What the government would take in each week with a plain budget, in the head of government's case; a partner's share, and what
 * the states the party governs bring in, are fixed. The treasury keeps at most `TREASURY_WEEKS` of it.
 */
export function baseAllocation(world: World, c: Campaign): number {
  if (!c.career || c.phase !== 'term') return 0;
  const centre = inGov(c, c.player) ? govMoney(world, isPm(c) ? ALLOCATION.pm : ALLOCATION.partner) : 0;
  return centre + Math.round(govMoney(world, STATE_GOVERNMENT_INCOME) * statesHeld(c, c.player) * patronageMult(c.career!));
}

// ---------- the head of government's books ----------
// A government that the player heads takes in money from the economy (taxes, and each of the four sectors) and spends it on the
// lines of the budget, on what it has paid for in particular, on its standing commitments (the programmes and policies it has
// taken on, and the deals it has made) and on the interest on the debt. With a plain budget and a middling economy, what is left
// is the allocation the treasury has always had; a looser budget leaves less, a stronger economy more. What the treasury cannot
// cover is borrowed, and the debt grows by it.

/** What each line of a plain budget is of the spending, and how far a notch of the dial moves it. */
const LINE_WEIGHT: Record<LineId, number> = { aid: 0.3, health: 0.2, education: 0.25, rural: 0.1, civil: 0.15, defence: 0.1 };
/**
 * What a line is of the spending in a given place. A country's armed forces take a tenth, and the other lines share the rest in the
 * same proportions as before, so that a plain budget costs what it always did; a state has no defence line and keeps the old shares.
 */
const lineWeight = (world: World, id: LineId): number =>
  !isFederalWorld(world) ? (id === 'defence' ? 0 : LINE_WEIGHT[id]) : id === 'defence' ? LINE_WEIGHT.defence : LINE_WEIGHT[id] * (1 - LINE_WEIGHT.defence);
/** A plain budget takes in three times the allocation, and spends two: lines 1.85, interest 0.15. */
const TAKINGS = 3;
const LINES_SPEND = 1.85;
const INTEREST = 0.15;
/** What a notch of taxes moves the takings; what a point of growth, and of joblessness, does. */
const TAX_STEP = 0.1;
const GROWTH_PULL = 0.06;
const JOBS_PULL = 0.02;
/** What a unit of a particular measure, and of standing commitment, costs a week, as a share of the allocation. */
const MEASURE_UNIT = 0.08;
const COMMITMENT_UNIT = 0.06;
/** Where the takings come from: taxes, and the sectors by what each makes. */
const TAX_SHARE = 0.4;

/** Weeks to a month: the books are shown by the month. */
export const MONTH = 52 / 12;
/** What a line of the budget costs a week at a setting of its dial (-1 cut, 0 hold, 1 boost). */
export const lineWeekly = (world: World, id: LineId, dial: number): number => govMoney(world, ALLOCATION.pm) * LINES_SPEND * lineWeight(world, id) * lineMult(dial);
/** What one particular measure costs a week. */
export const measureWeekly = (world: World, m: keyof typeof MEASURES): number => govMoney(world, ALLOCATION.pm) * MEASURE_UNIT * MEASURES[m].cost;
/** What a number of units of standing commitment cost a week: a policy, a programme or a deal adds some. */
export const commitmentWeekly = (world: World, units: number): number => govMoney(world, ALLOCATION.pm) * COMMITMENT_UNIT * units;

export interface BookFlow { id: 'tax' | 'states' | SectorId | LineId | 'measures' | 'commitments' | 'interest' | 'projects' | 'stances' | 'repay'; amount: number }
export interface Books {
  income: BookFlow[];
  spend: BookFlow[];
  /** What is left each week before grants and what the standing orders divert: negative when the books do not balance. */
  net: number;
}

/** The books of a government the player heads, for a budget (the one in force, unless another is given), a week at a time. Null for anyone else. */
export function govBooks(world: World, c: Campaign, budget?: Budget): Books | null {
  const k = c.career;
  if (!k || c.phase !== 'term' || !isPm(c)) return null;
  const b = budget ?? k.tabled;
  const unit = govMoney(world, ALLOCATION.pm);
  const e = k.economy;
  const econ = clamp(1 + GROWTH_PULL * (e.growth - 4) - JOBS_PULL * (e.jobless - 3.5), 0.7, 1.3);
  const takings = unit * TAKINGS * econ * (1 + TAX_STEP * b.tax + taxEffects(k).takings + builtEffects(k).takings);
  const shares = sectorShares(world, k);
  const income: BookFlow[] = [{ id: 'tax', amount: takings * TAX_SHARE }, ...SECTOR_IDS.map((id) => ({ id, amount: takings * (1 - TAX_SHARE) * shares[id] }))];
  // The patronage of the states the party governs also goes into the government's treasury.
  const patronage = Math.round(govMoney(world, STATE_GOVERNMENT_INCOME) * statesHeld(c, c.player) * patronageMult(k));
  if (patronage > 0) income.push({ id: 'states', amount: patronage });
  const spend: BookFlow[] = [
    // The armed forces' line is the country's only, and costs more where they have a great say over what they buy.
    ...LINE_IDS.filter((id) => id !== 'defence' || isFederalWorld(world)).map((id) => ({
      id, amount: unit * LINES_SPEND * lineWeight(world, id) * lineMult(b.lines[id] ?? 0) * (id === 'defence' ? procurementMult(k) : 1),
    })),
    { id: 'measures', amount: unit * MEASURE_UNIT * (b.measures ?? []).reduce((a, m) => a + MEASURES[m].cost, 0) },
    { id: 'commitments', amount: unit * COMMITMENT_UNIT * Math.max(0, k.fiscal) },
    { id: 'interest', amount: unit * INTEREST * (e.debt / 63) * (1 + RATE.interest * (k.rate ?? 0)) },
    { id: 'projects', amount: unit * projectsCost(k) },
    // What the sliders for the meters cost a week: pushing costs, easing off saves a little. A state has no armed forces to pay for.
    { id: 'stances', amount: unit * stanceCost(k, undefined, isFederalWorld(world)) },
  ];
  const sum = (xs: BookFlow[]) => xs.reduce((a, x) => a + x.amount, 0);
  // What the plan sets aside for the debt is a share of what is left, and goes to it each week (see treasuryWeek).
  const left = sum(income) - sum(spend);
  const repay = Math.max(0, left) * (k.repayShare ?? 0);
  spend.push({ id: 'repay', amount: repay });
  return { income, spend, net: left - repay };
}

/** What the economy takes in each week with taxes at a setting of their dial (-1 cut, 0 hold, 1 raise); the head of government's books, else zero. */
export function takingsWeekly(world: World, c: Campaign, tax: number): number {
  const k = c.career;
  const books = k ? govBooks(world, c, { ...k.tabled, tax }) : null;
  return books ? books.income.filter((x) => x.id !== 'states').reduce((a, x) => a + x.amount, 0) : 0;
}

/**
 * What comes into the player's party's treasury each week of a term: for the head of government, what the books leave; for a
 * partner, its share; and the patronage of each state the party governs. It can be negative: more goes out than comes in.
 */
export function allocation(world: World, c: Campaign): number {
  if (!c.career || c.phase !== 'term') return 0;
  const books = govBooks(world, c);
  if (!books) return baseAllocation(world, c);
  return Math.round(books.net);
}

/** The most the treasury keeps. */
export const treasuryCap = (world: World, c: Campaign) => baseAllocation(world, c) * TREASURY_WEEKS;

/** What the standing orders would divert to the party this week: no more than the treasury will have. */
export function diverted(world: World, c: Campaign): number {
  return divertedAt(world, c, c.career?.orders.state ?? 0);
}

/** What would be diverted to the party each week if state resources were drawn on at this level. */
export function divertedAt(world: World, c: Campaign, level: number): number {
  const k = c.career;
  if (!k || c.phase !== 'term' || !hasPublicMoney(c)) return 0;
  const planned = scaled(world, DIVERT_STEP) * level;
  return Math.min(planned, Math.min(treasuryCap(world, c), Math.max(0, treasuryOf(c) + allocation(world, c))));
}

/** What the grants would cost this week at the level chosen. */
export function grantsCost(world: World, c: Campaign): number {
  return grantsCostAt(world, c, c.career?.orders.grants ?? 0);
}

/** What the grants would cost each week at a level, and the points of goodwill they buy in all (shared among the target regions). */
export function grantsCostAt(world: World, c: Campaign, level: number): number {
  const k = c.career;
  if (!k || c.phase !== 'term' || !hasPublicMoney(c)) return 0;
  return govMoney(world, GRANT_STEP) * level;
}
export const grantGoodwillAt = (world: World, c: Campaign, level: number): number => grantsCostAt(world, c, level) / govMoney(world, GRANT_PER_POINT);

/** How much of the credit for a state's development a rival state government takes for itself. */
export const RIVAL_CREDIT = 0.3;

/** The share of the goodwill a grant buys that reaches the party: all of it where the party or its allies govern the state, less where a rival does. */
export function creditShare(c: Campaign, st: RegionId): number {
  const k = c.career!;
  const holder = k.states[st];
  if (holder === undefined || holder === c.player || k.government.pm === holder || k.government.partners.includes(holder)) return 1;
  return 1 - RIVAL_CREDIT;
}

/** Where grants go: the states the government chose to develop, else the regions chosen as targets, else everywhere the party stands. */
export function grantTargets(world: World, c: Campaign): RegionId[] {
  const develop = (c.career!.orders.develop ?? []).filter((st) => world.states.includes(st));
  if (develop.length) return develop;
  const chosen = c.career!.orders.focusStates.filter((st) => contestsState(world, c, c.player, st));
  return chosen.length ? chosen : world.states.filter((st) => contestsState(world, c, c.player, st));
}

/**
 * Keeps the party's goodwill in each region in the hidden drift of opinion: what has been added since last time is added again
 * to the party's standing there, with every group of voters. Call whenever opinion is rebuilt.
 */
export function syncGoodwill(c: Campaign): void {
  const k = c.career;
  if (!k) return;
  const now = k.goodwill ?? {};
  const was = k.goodwillApplied ?? {};
  const me = c.player;
  for (const st of new Set([...Object.keys(now), ...Object.keys(was)])) {
    const delta = ((now[st] ?? 0) - (was[st] ?? 0)) * GOODWILL_EFFECT;
    if (delta === 0) continue;
    const rows = (c.drift.support.state[st] ??= zeros2(N_BLOCS, N_PARTIES));
    for (const row of rows) row[me] += delta;
  }
  k.goodwillApplied = { ...now };
}

/**
 * One week of the government's money, in a term: the allocation comes in, some is diverted to the party (the amount returned),
 * the grants are spent where they were aimed, and goodwill fades. A party with no government leaves nothing behind.
 */
export function treasuryWeek(world: World, c: Campaign): number {
  const k = c.career;
  if (!k || c.phase !== 'term') return 0;
  const goodwill = (k.goodwill ??= {});
  // The goodwill that has been built up fades, whoever governs.
  for (const st of Object.keys(goodwill)) {
    goodwill[st] *= 1 - GOODWILL_FADE;
    if (goodwill[st] < 0.05) delete goodwill[st];
  }
  if (!hasPublicMoney(c)) { k.treasury = 0; return 0; }

  // What the debt plan sets aside goes to the debt as it is earned.
  const set = govBooks(world, c)?.spend.find((x) => x.id === 'repay')?.amount ?? 0;
  if (set > 0) k.economy.debt = Math.max(DEBT_FLOOR, k.economy.debt - debtEased(world, c, set));
  const flow = treasuryOf(c) + allocation(world, c);
  // What the treasury cannot cover is borrowed: the debt grows by its share of national income.
  if (flow < 0) {
    if (treasuryOf(c) > 0) pushNews(c, { party: c.player, key: 'news.treasury.dry', tone: 'bad' });
    const base = figuresOf(world, k).gdp * (world.rules.kind === 'state' ? STATE_PUBLIC : 1);
    k.economy.debt = clamp(k.economy.debt + (-flow / base) * 100, DEBT_FLOOR, 120);
  }
  k.treasury = clamp(flow, 0, treasuryCap(world, c));
  const toParty = Math.min(diverted(world, c), k.treasury);
  k.treasury -= toParty;

  const cost = grantsCost(world, c);
  const spent = Math.min(cost, k.treasury);
  if (spent > 0) {
    k.treasury -= spent;
    const targets = grantTargets(world, c);
    for (const st of targets) goodwill[st] = clamp((goodwill[st] ?? 0) + (spent / targets.length / govMoney(world, GRANT_PER_POINT)) * creditShare(c, st), 0, GOODWILL_MAX);
  }
  return toParty;
}

export { DEBT_FLOOR };

/** The most of the treasury that can go to the debt now: what it holds, and no more than takes the debt to its floor. Zero unless the player heads the government. */
export function repayLimit(world: World, c: Campaign): number {
  const k = c.career;
  if (!k || c.phase !== 'term' || !isPm(c) || c.career!.ending) return 0;
  const base = figuresOf(world, k).gdp * (world.rules.kind === 'state' ? STATE_PUBLIC : 1);
  const room = Math.max(0, ((k.economy.debt - DEBT_FLOOR) / 100) * base);
  return Math.floor(Math.min(treasuryOf(c), room) / GOV_ROUND) * GOV_ROUND;
}

/** How far the debt falls (in points of national income) for an amount repaid out of the treasury. */
export function debtEased(world: World, c: Campaign, amount: number): number {
  const base = figuresOf(world, c.career!).gdp * (world.rules.kind === 'state' ? STATE_PUBLIC : 1);
  return (amount / base) * 100;
}

/** The head of government pays some of the treasury towards the national debt. What is paid is gone from the treasury, and the debt falls by its share of national income. */
export function repayDebt(world: World, c: Campaign, amount: number): boolean {
  const k = c.career;
  const pay = Math.floor(amount / GOV_ROUND) * GOV_ROUND;
  if (!k || pay <= 0 || pay > repayLimit(world, c)) return false;
  const eased = debtEased(world, c, pay);
  k.treasury = Math.max(0, treasuryOf(c) - pay);
  k.economy.debt = Math.max(DEBT_FLOOR, k.economy.debt - eased);
  pushNews(c, { party: c.player, key: 'news.debt.repaid', vars: { rm: ref.rm(pay), pct: eased.toFixed(2) }, tone: 'good' });
  return true;
}
