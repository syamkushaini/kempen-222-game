import type { World } from '../election';
import { clamp, zeros2 } from '../math';
import { N_BLOCS, N_PARTIES, type RegionId } from '../types';
import { contestsState, scaled } from './actions';
import { STATE_GOVERNMENT_INCOME, statesHeld } from './contests';
import { inGov, isPm } from './office';
import { patronageMult } from './patronage';
import type { Campaign } from './types';

// The government's money is not the party's. Governing brings a weekly allocation into a treasury of its own: large for the
// head of government, smaller for a partner, and a little for every state the party governs, at the centre or not. It
// can be spent only on development grants in the places the party has chosen, which win it goodwill there. The only way
// it reaches the party's own purse is to be diverted, which is what "state resources" is, with the risks that always had.
// The treasury is the government's, so a party that governs nowhere leaves it behind, and in an election campaign it is
// frozen: nothing is received, granted or diverted until the new term.

/** What each level of development grants costs a week, and what a level of diversion moves, at general-election scale. */
export const GRANT_STEP = 10_000;
export const DIVERT_STEP = 10_000;
/** The weekly allocation of a head of government, and of a partner in government, at general-election scale. */
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
 * What comes into the player's party's treasury each week of a term: the head of government's share, or a partner's, and the
 * patronage of each state the party governs, whether or not it is in government at the centre. Nothing for a party with neither.
 */
export function allocation(world: World, c: Campaign): number {
  if (!c.career || c.phase !== 'term') return 0;
  const centre = inGov(c, c.player) ? scaled(world, isPm(c) ? ALLOCATION.pm : ALLOCATION.partner) : 0;
  return centre + Math.round(scaled(world, STATE_GOVERNMENT_INCOME) * statesHeld(c, c.player) * patronageMult(c.career!));
}

/** The most the treasury keeps. */
export const treasuryCap = (world: World, c: Campaign) => allocation(world, c) * TREASURY_WEEKS;

/** What the standing orders would divert to the party this week: no more than the treasury will have. */
export function diverted(world: World, c: Campaign): number {
  const k = c.career;
  if (!k || c.phase !== 'term' || !hasPublicMoney(c)) return 0;
  const planned = scaled(world, DIVERT_STEP) * k.orders.state;
  return Math.min(planned, Math.min(treasuryCap(world, c), treasuryOf(c) + allocation(world, c)));
}

/** What the grants would cost this week at the level chosen. */
export function grantsCost(world: World, c: Campaign): number {
  const k = c.career;
  if (!k || c.phase !== 'term' || !hasPublicMoney(c)) return 0;
  return scaled(world, GRANT_STEP) * (k.orders.grants ?? 0);
}

/** Where grants go: the regions chosen as targets, or everywhere the party stands. */
export function grantTargets(world: World, c: Campaign): RegionId[] {
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

  k.treasury = clamp(treasuryOf(c) + allocation(world, c), 0, treasuryCap(world, c));
  const toParty = Math.min(diverted(world, c), k.treasury);
  k.treasury -= toParty;

  const cost = grantsCost(world, c);
  const spent = Math.min(cost, k.treasury);
  if (spent > 0) {
    k.treasury -= spent;
    const targets = grantTargets(world, c);
    for (const st of targets) goodwill[st] = clamp((goodwill[st] ?? 0) + spent / targets.length / scaled(world, GRANT_PER_POINT), 0, GOODWILL_MAX);
  }
  return toParty;
}
