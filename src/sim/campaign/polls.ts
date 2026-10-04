import type { World } from '../election';
import type { Rng } from '../rng';
import { N_PARTIES, type ElectionOutcome, type Region } from '../types';
import { scaled } from './actions';
import { now } from './news';
import type { Campaign, Poll, PollQuality, PollScope } from './types';

/** One standard deviation of polling error, as a share of the vote. */
const SIGMA: Record<PollScope, Record<PollQuality, number>> = {
  national: { quick: 0.02, full: 0.01 },
  // A state poll samples every seat thinly, so each seat's figure is rough.
  state: { quick: 0.05, full: 0.03 },
  seat: { quick: 0.035, full: 0.02 },
};

export function pollCost(world: World, scope: PollScope, target: string | null, quality: PollQuality): number {
  const full = quality === 'full';
  if (scope === 'national') return scaled(world, full ? 150_000 : 60_000);
  if (scope === 'seat') return scaled(world, full ? 30_000 : 12_000);
  const seats = world.seatsByState[target!].length;
  return scaled(world, (full ? 20_000 : 8_000) * seats);
}

/** Adds sampling error to true shares and renormalises. Parties with no support stay at zero. */
function noisy(shares: number[], sigma: number, rng: Rng): number[] {
  const out = shares.map((s) => (s > 0 ? Math.max(0.001, s + rng.normal(0, sigma)) : 0));
  const sum = out.reduce((a, b) => a + b, 0);
  return out.map((v) => Math.round((v / sum) * 1000) / 1000);
}

const sharesOf = (votes: number[]) => {
  const total = votes.reduce((a, b) => a + b, 0);
  return votes.map((v) => (total > 0 ? v / total : 0));
};

/**
 * Takes a poll of the true state of the race. `truth` is the projection of how
 * the country would vote today.
 */
export function takePoll(
  world: World, c: Campaign, truth: ElectionOutcome, rng: Rng,
  scope: PollScope, target: string | null, quality: PollQuality, isPublic: boolean, precision = 1,
): Poll {
  // A poll of a one-seat contest is a seat poll, whatever it is called.
  // `precision` below 1 is a poll run by someone who knows how: the same sample, less error.
  const sigma = (scope === 'national' && world.seats.length === 1 ? SIGMA.seat[quality] : SIGMA[scope][quality]) * precision;
  const poll: Poll = {
    id: c.polls.length + 1, week: now(c), scope, target, quality, public: isPublic, moe: 2 * sigma,
  };

  if (scope === 'national') {
    const byRegion: Record<Region, number[]> = {
      peninsular: new Array(N_PARTIES).fill(0), sabah: new Array(N_PARTIES).fill(0), sarawak: new Array(N_PARTIES).fill(0),
    };
    truth.seats.forEach((o, i) => {
      const r = byRegion[world.seats[i].region];
      for (let p = 0; p < N_PARTIES; p++) r[p] += o.votes[p];
    });
    poll.national = noisy(sharesOf(truth.votes), sigma, rng);
    // A countrywide poll also breaks down by region. Sub-samples are smaller, so they are noisier.
    if (world.rules.kind === 'general') {
      poll.regions = {
        peninsular: noisy(sharesOf(byRegion.peninsular), sigma * 1.2, rng),
        sabah: noisy(sharesOf(byRegion.sabah), sigma * 2.5, rng),
        sarawak: noisy(sharesOf(byRegion.sarawak), sigma * 2.5, rng),
      };
    }
  } else {
    const indexes = scope === 'seat' ? [world.seatIndex.get(target!)!] : world.seatsByState[target!];
    poll.seats = {};
    for (const i of indexes) poll.seats[world.seats[i].id] = noisy(sharesOf(truth.seats[i].votes), sigma, rng);
  }
  return poll;
}

export interface SeatIntel { shares: number[]; week: number; moe: number }

/** The most recent poll reading for each seat that has one. */
export function latestSeatIntel(polls: Poll[]): Map<string, SeatIntel> {
  const out = new Map<string, SeatIntel>();
  for (const poll of polls) {
    if (!poll.seats) continue;
    for (const [seat, shares] of Object.entries(poll.seats)) {
      const prev = out.get(seat);
      // Prefer newer polls; within a week prefer the more precise one.
      if (!prev || poll.week > prev.week || (poll.week === prev.week && poll.moe <= prev.moe)) {
        out.set(seat, { shares, week: poll.week, moe: poll.moe });
      }
    }
  }
  return out;
}

export function latestNationalPoll(polls: Poll[]): Poll | null {
  for (let i = polls.length - 1; i >= 0; i--) if (polls[i].scope === 'national') return polls[i];
  return null;
}
