import type { AchievementId } from './achievements';
import { ACHIEVEMENT_IDS } from './achievements';

// What each achievement is worth to the leaderboard score of the career it was earned in. Easy ones are worth 10, notable ones 25,
// hard ones 50 and the rare ones 100. A career's score is what it did (see `legacyOf`) plus these, with no ceiling.

export const ACHIEVEMENT_POINTS: Record<AchievementId, number> = {
  // what a night can bring
  firstWin: 10, photoFinish: 25, stateWon: 25, majority: 40, cleanHands: 40, ruthless: 50, sweep: 60, landslide: 75, giantKiller: 50, zeroDeposit: 30,
  // winning in a way of your own
  weekly: 20, challenger: 30, blindfolded: 40, brokeVictor: 40, shoestring: 50,
  // firsts
  newGround: 25, wideReach: 60, hungRule: 75, borneoTop: 100, fromNothing: 100,
  // the country laughing at itself
  absurd: 25, pollsWrong: 30, exactMajority: 50,
  // pacts, coalitions, mergers
  pactMaker: 15, partner: 15, premier: 25, katak: 30, bigTent: 30, alliance: 30, minority: 35, merged: 35, bedfellows: 40, rainbow: 40, unityGov: 50, kingmaker: 35,
  // errands taken on and finished
  firstMission: 10, hardMission: 40, tenMissions: 50, fullHouse: 60, finalMission: 75,
  // a career, and how it ends
  knives: 5, fullTerm: 15, mandate: 20, survivor: 25, toppler: 30, longArm: 30, bowOut: 30, secondMandate: 40, hawk: 40, machine: 40,
  magnate: 40, outsider: 50, collector: 60, decade: 75, promiseKeeper: 80, statesman: 100,
};

/** The points of a set of achievements. */
export const pointsOf = (ids: readonly AchievementId[]): number => ids.reduce((sum, id) => sum + (ACHIEVEMENT_POINTS[id] ?? 0), 0);

/** The most any score may be on the board: far above what a real career reaches, so that a made-up one is still turned away. */
export const SCORE_MAX = 10_000;

export const ALL_POINTS = pointsOf(ACHIEVEMENT_IDS);
