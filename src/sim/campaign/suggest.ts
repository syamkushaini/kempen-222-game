import { lastElection, type World } from '../election';
import { Rng } from '../rng';
import type { ElectionOutcome } from '../types';
import { rankOptions, readRace, type Option, type Profile, type Reading } from './ai';
import { latestSeatIntel } from './polls';
import type { ActionId, ActionTarget, Campaign } from './types';

/**
 * How the player's own advisers weigh things. Even-handed between kinds of
 * action, wary of attacks (they cost nothing, so would otherwise lead every
 * list, yet three in ten backfire), and never inclined to take a tycoon's money.
 */
const ADVISER: Profile = { ground: 1, machinery: 1, media: 1, attack: 0.4, reserve: 250_000, shady: false };

/** A seat counts as worth fighting for at this value or more; the scale is the one the rivals use. */
const CLOSE = 0.3;

/**
 * What the player can see of the race: the last election, and for any seat
 * they have paid to have polled, that poll. Nothing hidden is used, so a
 * suggestion is only as good as the player's information, and polling more
 * seats sharpens it.
 */
export function believedRace(world: World, c: Campaign): Reading {
  const last = lastElection(world);
  const polled = latestSeatIntel(c.polls);
  const seen: ElectionOutcome = {
    ...last,
    seats: last.seats.map((o) => {
      const intel = polled.get(o.seatId);
      return intel ? { ...o, votes: intel.shares.map((share) => share * o.valid) } : o;
    }),
  };
  return readRace(world, c, c.player, seen, new Rng(1), 0, []);
}

/** Why an action is on the list. */
export type Why = 'close' | 'state' | 'national' | 'attack' | 'funds' | 'gotv';

export interface Suggestion {
  id: ActionId;
  target: ActionTarget;
  why: Why;
  /** For `state`: how many seats there look close. */
  close?: number;
}

const FUNDS: ActionId[] = ['dinner', 'crowdfund', 'tycoon'];

function reason(world: World, reading: Reading, o: Option): Suggestion {
  const { id, target } = o;
  if (FUNDS.includes(id)) return { id, target, why: 'funds' };
  if (id === 'attack') return { id, target, why: 'attack' };
  if (id === 'tv' || id === 'social') return { id, target, why: 'national' };
  if (id === 'ceramah' || id === 'walkabout') return { id, target, why: 'close' };
  if (id === 'gotv') return { id, target, why: 'gotv' };
  const seats = target.state ? world.seatsByState[target.state] ?? [] : [];
  return { id, target, why: 'state', close: seats.filter((i) => reading.value[i] >= CLOSE).length };
}

/**
 * The best few things to do with the rest of this week, most valuable first,
 * each of a different kind where possible. They are ordinary actions the
 * player can do now, so one drops off the list once it is done or can no
 * longer be afforded.
 */
export function suggestions(world: World, c: Campaign, count = 3): Suggestion[] {
  if (c.phase !== 'campaign') return [];
  const reading = believedRace(world, c);
  const ranked = rankOptions(world, c, c.player, reading, ADVISER);
  const chosen: Option[] = [];
  for (const o of ranked) if (chosen.length < count && !chosen.some((x) => x.id === o.id)) chosen.push(o);
  for (const o of ranked) if (chosen.length < count && !chosen.includes(o)) chosen.push(o);
  return chosen.map((o) => reason(world, reading, o));
}
