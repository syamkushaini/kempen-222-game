import { BYELECTION_SEATS, byElectionId, STATE_SCENARIOS } from '../../data/world';
import { Rng } from '../rng';
import type { PartyId } from '../types';
import { encodeChallenge, type ChallengeSpec } from './challengeCode';

// The challenge of the week: one contest, with rules, for everybody, that changes every Monday. Nothing is fetched and
// nothing is kept on a server: the week gives the seed, the seed gives the challenge, so everyone who opens the game in the
// same week is offered the very same election, and its board (the code of the challenge) is shared. A week runs from Monday
// at midnight to the next Monday, Malaysian time.

export const WEEK_MS = 7 * 24 * 3_600_000;
const MYT = 8 * 3_600_000;
/** A Monday: 5 January 1970. */
const MONDAY = Date.UTC(1970, 0, 5);

/** The number of the week that `now` (milliseconds) falls in. */
export const weekIndex = (now: number): number => Math.floor((now + MYT - MONDAY) / WEEK_MS);
/** When a week begins and ends, in milliseconds. */
export const weekStart = (n: number): number => MONDAY + n * WEEK_MS - MYT;
export const weekEnd = (n: number): number => weekStart(n + 1);

/** The parties offered: the three that can be led in every contest but Sarawak's. */
const PARTIES: PartyId[] = ['ps', 'bp', 'pt'];
const SARAWAK: PartyId[] = ['ps', 'gbk'];
/** The contests, and how many times each comes up in the draw: the general election often, a by-election (null) often, each state once. A hung parliament has no campaign to set rules for. */
const CONTESTS: { scenario: string | null; weight: number }[] = [
  { scenario: 'general', weight: 4 }, { scenario: null, weight: 6 },
  ...STATE_SCENARIOS.map((s) => ({ scenario: `state:${s}`, weight: 1 })),
];
/** The rules a week can carry: none, one, or two together. */
const RULES: Pick<ChallengeSpec, 'fog' | 'noisy' | 'lean' | 'weeks'>[] = [
  { fog: false, noisy: false, lean: false }, { fog: true, noisy: false, lean: false }, { fog: false, noisy: true, lean: false }, { fog: false, noisy: false, lean: true },
  { fog: true, noisy: true, lean: false }, { fog: false, noisy: false, lean: true, weeks: 5 }, { fog: true, noisy: false, lean: true }, { fog: false, noisy: true, lean: true },
];

function draw(n: number, attempt: number): ChallengeSpec {
  const rng = new Rng((Math.imul(n + 1, 0x9e3779b1) ^ Math.imul(attempt + 1, 0x85ebca6b) ^ 0x4b32) >>> 0);
  rng.next();
  const total = CONTESTS.reduce((a, c) => a + c.weight, 0);
  let at = rng.int(total);
  const picked = CONTESTS.find((c) => (at -= c.weight) < 0)!;
  const scenario = picked.scenario ?? byElectionId(BYELECTION_SEATS[rng.int(BYELECTION_SEATS.length)]);
  // Sarawak has no Barisan or Perikatan to lead: its own coalition, and the Pakatan.
  const offered = scenario === 'state:sarawak' ? SARAWAK : PARTIES;
  const party = offered[rng.int(offered.length)];
  const rules = RULES[rng.int(RULES.length)];
  return { scenario, party, seed: Math.floor(rng.next() * 0xffffffff), difficulty: rng.next() < 0.4 ? 'normal' : 'hard', ...rules };
}

/** The challenge of a week. It is never the same contest and party as the week before. */
export function weeklySpec(n: number): ChallengeSpec {
  const before = n > 0 ? draw(n - 1, 0) : null;
  for (let attempt = 0; attempt < 8; attempt++) {
    const spec = draw(n, attempt);
    if (!before || spec.scenario !== before.scenario || spec.party !== before.party) return spec;
  }
  return draw(n, 8);
}

export const weeklyCode = (n: number): string => encodeChallenge(weeklySpec(n));

/** The first week the game had a challenge of the week (the week of 5 October 2026), and how many weeks after it a code is looked for. */
export const FIRST_WEEK = weekIndex(Date.UTC(2026, 9, 6));
const SPAN = 520;

/** The week a challenge's code is the challenge of, if it is one of the weekly challenges (the first ten years of them); null for any other. */
export function weekOfCode(code: string): number | null {
  for (let n = FIRST_WEEK; n < FIRST_WEEK + SPAN; n++) if (weeklyCode(n) === code) return n;
  return null;
}

/** Whether the week a code is the challenge of is over, as of `now`. A challenge that was not a challenge of the week never ends. */
export function weekEnded(code: string, now: number): boolean {
  const n = weekOfCode(code);
  return n !== null && weekEnd(n) <= now;
}

/** Milliseconds left in the week that `now` falls in. */
export const timeLeft = (now: number): number => weekEnd(weekIndex(now)) - now;
