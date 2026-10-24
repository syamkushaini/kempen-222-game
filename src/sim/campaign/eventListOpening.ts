import { Rng } from '../rng';
import type { BlocId } from '../types';
import type { Effect, EventDef } from './events';

const mood = (blocs: BlocId[], n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'machinery', n: number): Effect => ({ t, n });

/** How many of the opening stories a party founded from nothing is dealt, and the flag each one waits for. */
export const OPENING_DEALT = 3;
export const openingFlag = (id: string) => `opening:${id}`;

/**
 * Eight small stories for the first months of a party founded from nothing. Each game is dealt three of them by its seed, so that two parties
 * founded one after the other do not meet the same people in the same weeks. They come in the first term only, in the opposition, and each
 * waits for its own week, and comes in the first free one after it if another story has that week. Every person and place is invented. Text lives in `src/i18n/events27.ts`.
 */
export const OPENING_STORIES: Record<string, EventDef> = {
  startDonor: {
    role: 'opp', seats: ['lead', 'opp'], weight: 0, after: 3, topic: 'scandal', needs: { flag: openingFlag('startDonor'), first: true },
    choices: [
      { effects: [eff('funds', -10_000), eff('cred', 1), mood(['heartland'], -0.01)] },
      { effects: [eff('funds', 50_000), eff('cred', -2), eff('unity', -1), { t: 'graft', n: 3 }] },
      { effects: [], gamble: { chance: 'cred', win: [eff('funds', 30_000), eff('cred', 1)], lose: [eff('cred', -2)] } },
    ],
  },
  startViral: {
    role: 'opp', seats: ['lead', 'opp'], weight: 0, after: 7, topic: 'media', needs: { flag: openingFlag('startViral'), first: true },
    choices: [
      { effects: [eff('funds', -15_000), mood(['undi18', 'gig'], 0.03), eff('cred', -1)] },
      { effects: [mood(['urban_b40', 'm40'], 0.02), eff('unity', 1)] },
      { effects: [], gamble: { chance: 0.5, win: [mood(['undi18', 'gig', 'urban_b40'], 0.04)], lose: [mood(['undi18'], -0.02), eff('cred', -1)] } },
    ],
  },
  startCouncillor: {
    role: 'opp', seats: ['lead', 'opp'], weight: 0, after: 11, topic: 'party', needs: { flag: openingFlag('startCouncillor'), first: true },
    choices: [
      { effects: [eff('machinery', 3), mood(['heartland', 'civil'], 0.02), eff('cred', -2), eff('unity', -1)] },
      { effects: [eff('cred', 1), eff('unity', 1)] },
      { effects: [eff('machinery', 1), eff('funds', -5_000), eff('cred', 1)] },
    ],
  },
  startShoplot: {
    role: 'opp', seats: ['lead', 'opp'], weight: 0, after: 15, topic: 'local', needs: { flag: openingFlag('startShoplot'), first: true },
    choices: [
      { effects: [eff('machinery', 3), eff('funds', -20_000), mood(['smallbiz'], 0.02)] },
      { effects: [eff('funds', 10_000), eff('machinery', -1), eff('cred', -1)] },
      { effects: [eff('machinery', 1), mood(['urban_b40'], 0.01), eff('unity', 1)] },
    ],
  },
  startNamesake: {
    role: 'opp', seats: ['lead', 'opp'], weight: 0, after: 19, topic: 'party', needs: { flag: openingFlag('startNamesake'), first: true },
    choices: [
      { effects: [eff('unity', 2), eff('machinery', 2), eff('cred', -1)] },
      { effects: [eff('funds', -25_000), eff('cred', 2)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('cred', 2), eff('machinery', 1)], lose: [eff('cred', -2), eff('unity', -1)] } },
    ],
  },
  startStudents: {
    role: 'opp', seats: ['lead', 'opp'], weight: 0, after: 23, topic: 'party', needs: { flag: openingFlag('startStudents'), first: true },
    choices: [
      { effects: [mood(['undi18', 'urban_lib'], 0.03), eff('machinery', 2), eff('cred', -1)] },
      { effects: [mood(['undi18'], 0.015), eff('unity', 1), eff('cred', 1)] },
      { effects: [eff('funds', -10_000), mood(['undi18', 'gig'], 0.025), eff('machinery', 1)] },
    ],
  },
  startPoll: {
    role: 'opp', seats: ['lead', 'opp'], weight: 0, after: 27, topic: 'media', needs: { flag: openingFlag('startPoll'), first: true },
    choices: [
      { effects: [eff('funds', -12_000), eff('cred', 2), mood(['m40', 'urban_lib'], 0.01)] },
      { effects: [eff('funds', -12_000), eff('cred', -2), eff('unity', 1)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('cred', 1), mood(['undi18', 'm40'], 0.02)], lose: [eff('cred', -2), eff('unity', -1)] } },
    ],
  },
  startTreasurer: {
    role: 'opp', seats: ['lead', 'opp'], weight: 0, after: 31, topic: 'party', needs: { flag: openingFlag('startTreasurer'), first: true },
    choices: [
      { effects: [eff('funds', 15_000), eff('cred', 2), eff('machinery', -1)] },
      { effects: [eff('machinery', 2), eff('cred', -2), eff('funds', -10_000)] },
      { effects: [eff('unity', 1), eff('cred', 1)] },
    ],
  },
};

export const OPENING_IDS = Object.keys(OPENING_STORIES);

/** The stories dealt to a party founded under this seed: a few of the eight, always the same few for the same seed. */
export function openingDeal(seed: number): string[] {
  const rng = new Rng((seed ^ 0x0e9a11) >>> 0);
  const pool = [...OPENING_IDS];
  const dealt: string[] = [];
  while (dealt.length < OPENING_DEALT && pool.length) dealt.push(pool.splice(rng.int(pool.length), 1)[0]);
  return dealt;
}
