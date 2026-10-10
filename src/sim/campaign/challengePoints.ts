import { majorityLine, type World } from '../election';
import { challengeKey } from './challengeCode';
import { summarise } from './night';
import { electionResult } from './turn';
import type { Campaign, Difficulty } from './types';

// Points for a challenge: one number for how well a campaign went, so that the results of one challenge can be ranked on
// its board, and the points of all of them added up on the player's profile. It is worked out from the result and the rules,
// nothing else, so that two people who face the same election are measured by the same figure.
//
//   seats     up to 70 for the seats won, in proportion, reaching the full 70 at a majority; up to 10 more for a majority past the line
//   the vote  up to 20 for the share of the vote, reaching the full 20 at half
//   level     the rivals' level: easygoing 0.8, competent 1, ruthless 1.25
//   rules     every rule taken on (hidden odds, noisy polls, a lean purse, a shorter campaign) adds a tenth

export const POINTS_MAX = 300;
export const LEVEL_FACTOR: Record<Difficulty, number> = { easy: 0.8, normal: 1, hard: 1.25 };
export const RULE_BONUS = 0.1;

export interface Showing {
  seats: number;
  /** The seats in the contest, and the seats it takes to govern it. */
  total: number;
  line: number;
  /** The party's share of the vote, 0 to 1. */
  share: number;
  difficulty: Difficulty;
  /** How many rules were taken on. */
  rules: number;
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

/** The points for a showing, a whole number from 0 up to about 175. */
export function pointsFor(s: Showing): number {
  const seatPart = 70 * clamp(s.seats / Math.max(1, s.line), 0, 1);
  const spare = s.total > s.line ? clamp((s.seats - s.line) / (s.total - s.line), 0, 1) : s.seats >= s.line ? 1 : 0;
  const votePart = 20 * clamp(s.share / 0.5, 0, 1);
  const base = seatPart + 10 * spare + votePart;
  return clamp(Math.round(base * LEVEL_FACTOR[s.difficulty] * (1 + RULE_BONUS * s.rules)), 0, POINTS_MAX);
}

/** The rules a campaign was played under, counted. */
export function rulesTaken(world: World, c: Pick<Campaign, 'challenge' | 'totalWeeks'>): number {
  const ch = c.challenge;
  return (ch?.fog ? 1 : 0) + (ch?.noisy ? 1 : 0) + (ch?.lean ? 1 : 0) + (c.totalWeeks < world.rules.weeks ? 1 : 0);
}

/** The points of a campaign of a challenge, given the seats and share of the vote the party finished with. */
export function challengePoints(world: World, c: Pick<Campaign, 'challenge' | 'totalWeeks' | 'difficulty'>, seats: number, share: number): number {
  return pointsFor({ seats, total: world.seats.length, line: majorityLine(world), share, difficulty: c.difficulty, rules: rulesTaken(world, c) });
}

/** What a finished challenge came to: its key, the seats and share of the vote, and the points. Null for a game that is no challenge, or one whose votes are not yet counted. */
export function finishedChallenge(world: World, c: Campaign): { key: string; seats: number; share: number; points: number } | null {
  const key = challengeKey(c);
  if (!key || (c.phase !== 'formation' && c.phase !== 'done') || !c.election) return null;
  const result = electionResult(world, c);
  if (!result) return null;
  const summary = summarise(world, c, result);
  return { key, seats: summary.seats, share: summary.voteShare, points: challengePoints(world, c, summary.seats, summary.voteShare) };
}
