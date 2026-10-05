import { lastElection, type World } from '../election';
import { N_BLOCS } from '../types';
import { alignment } from './policy';
import type { Campaign } from './types';

// A party the player founded starts with one seat and under one per cent of the
// vote. It grows by winning over the groups of voters whose wishes its platform
// matches, a little each week: faster the more people believe the leader and the
// better the branches are built. Where it stands decides where it grows.

/** A founded party takes over the place of this small party: it has no data of its own, so it is built on one that is nearly empty. */
export const FOUNDING_SLOT = 'genba';
/** The key its first-term world is kept under. */
export const FOUNDED = 'career:founded';
/** The share of the vote it starts on in every seat: a name on the ballot and a handful of friends, not yet a movement. */
export const FOUNDING_SEED_SHARE = 0.005;

/** What a founded party starts with in the bank, before scaling to the size of the contest: more than a rival small party, far less than a big one. */
export const FOUNDING_FUNDS = 150_000;

/** Logit lift a week, for a bloc the platform suits perfectly, with the leader fully believed and the branches fully built. */
export const FOUNDING_RATE = 0.015;

/** The share of the vote at which a new party has used up most of the easy converts, and growth is slow. */
export const FOUNDING_LIMIT = 0.3;

/** How much of that rate this week brings, by the leader's credibility and the strength of the branches (0 to 1 each, softened). */
export function foundingPace(c: Campaign): number {
  const k = c.career!;
  const branches = c.parties[c.player]!.machinery;
  const built = branches.length > 0 ? branches.reduce((a, m) => a + m, 0) / branches.length / 100 : 0;
  return (0.5 + k.credibility / 200) * (0.6 + 0.4 * built);
}

/** Growth slows as the party grows: the first friends come easily, the next million do not. Between 1 (a tiny party) and 0.1. */
export function foundingRoom(world: World, c: Campaign): number {
  const last = lastElection(world);
  const total = last.votes.reduce((a, b) => a + b, 0);
  const share = total > 0 ? last.votes[c.player] / total : 0;
  return Math.min(1, Math.max(0.1, 1 - share / FOUNDING_LIMIT));
}

/** The lift, per bloc, this week brings the founded party. Zero for groups whose wishes the platform goes against. */
export function foundingLift(world: World, c: Campaign): number[] {
  const k = c.career!;
  const pace = foundingPace(c) * foundingRoom(world, c);
  return Array.from({ length: N_BLOCS }, (_, b) => FOUNDING_RATE * Math.max(0, alignment(k.stances[c.player], b)) * pace);
}

/** One week of growth, added to what the groups think of the party. */
export function growFoundedParty(world: World, c: Campaign): void {
  const k = c.career;
  if (!k?.founded) return;
  const lift = foundingLift(world, c);
  for (let b = 0; b < N_BLOCS; b++) k.mood[b][c.player] += lift[b];
}
