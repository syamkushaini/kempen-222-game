import type { BlocId } from '../types';
import type { Effect, EventDef, Who } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'fiscal' | 'donors' | 'dossier', n: number): Effect => ({ t, n });
const rel = (who: Who, n: number): Effect => ({ t: 'relation', who, n });
const rival = (who: Who, n: number): Effect => ({ t: 'rival', who, n });
const econ = (growth: number, inflation = 0): Effect => ({ t: 'economy', growth, inflation });
const flag = (id: string): Effect => ({ t: 'flag', id });

/**
 * Stories told in chapters. Only the first chapter of each comes up by chance; whatever the player chooses, it sets
 * the next one in motion some weeks later, and the last chapter remembers how the story was handled. A chapter with
 * a weight of 0 never arrives on its own.
 */
export const STORY_EVENTS: Record<string, EventDef> = {
  // ----- The accountant's papers: a scandal that touches everyone, the player's own people included -----
  papers: {
    role: 'any', weight: 3,
    choices: [
      { effects: [eff('cred', 3), eff('unity', -3), rival('pm', -0.01)], then: { event: 'papersStory', after: 6 } },
      { effects: [eff('cred', 1)], then: { event: 'papersStory', after: 12 } },
      { effects: [flag('papersBuried')], then: { event: 'papersStory', after: 16 } },
    ],
  },
  papersStory: {
    role: 'any', weight: 0,
    choices: [
      { effects: [eff('unity', -4), eff('cred', 4), mood(['urban_lib', 'm40', 'undi18'], 0.02)], then: { event: 'papersBook', after: 14 } },
      { effects: [eff('unity', 2), eff('cred', -4), flag('papersShielded')], then: { event: 'papersBook', after: 14 } },
      { effects: [], gamble: { chance: 'cred', win: [mood('all', 0.01)], lose: [eff('cred', -3), eff('unity', -2)] }, then: { event: 'papersBook', after: 14 } },
    ],
  },
  papersBook: {
    role: 'any', weight: 0,
    choices: [
      { effects: [eff('cred', 2), mood(['urban_lib', 'undi18'], 0.02), eff('unity', -1)] },
      { effects: [eff('funds', -40_000), eff('cred', -2)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('dossier', 15)], lose: [eff('cred', -2), mood(['urban_lib'], -0.02)] } },
    ],
  },

  // ----- The bridge: four villages, one contract, one ribbon -----
  bridge: {
    role: 'any', weight: 3,
    choices: [
      { effects: [eff('funds', -30_000), mood(['heartland', 'agri', 'felda'], 0.03)], then: { event: 'bridgeContract', after: 10 } },
      { effects: [mood('all', 0.005), rel('pm', -3)], then: { event: 'bridgeContract', after: 10 } },
      { effects: [eff('cred', -2)], then: { event: 'bridgeContract', after: 10 } },
    ],
  },
  bridgeContract: {
    role: 'any', weight: 0,
    choices: [
      { effects: [eff('unity', -3), eff('cred', 3)], then: { event: 'bridgeOpening', after: 14 } },
      { effects: [eff('cred', -1)], then: { event: 'bridgeOpening', after: 14 } },
      { effects: [eff('funds', 80_000), eff('cred', -3), flag('bridgeCut')], then: { event: 'bridgeOpening', after: 14 } },
    ],
  },
  bridgeOpening: {
    role: 'any', weight: 0,
    choices: [
      { effects: [], gamble: { chance: 'cred', win: [mood(['heartland', 'agri', 'felda', 'seniors'], 0.03)], lose: [mood(['heartland', 'agri'], -0.02), eff('cred', -1)] } },
      { effects: [eff('cred', 2), mood(['heartland', 'agri'], 0.01)] },
      { effects: [] },
    ],
  },

  // ----- The rice: a shortage, a price, and an inquiry that names friends -----
  riceShort: {
    role: 'gov', weight: 3,
    choices: [
      { effects: [eff('fiscal', 1), mood(['urban_b40', 'heartland', 'seniors'], 0.02)], then: { event: 'ricePrice', after: 8 } },
      { effects: [], gamble: { chance: 0.5, win: [mood('all', 0.015), eff('cred', 1)], lose: [eff('cred', -2), mood(['smallbiz'], -0.02)] }, then: { event: 'ricePrice', after: 8 } },
      { effects: [mood('all', -0.02), eff('cred', -2)], then: { event: 'ricePrice', after: 8 } },
    ],
  },
  ricePrice: {
    role: 'gov', weight: 0,
    choices: [
      { effects: [mood(['urban_b40', 'gig'], -0.03), mood(['agri', 'felda'], 0.03), econ(0, 0.2)], then: { event: 'riceInquiry', after: 12 } },
      { effects: [eff('fiscal', 1), mood('all', 0.005)], then: { event: 'riceInquiry', after: 12 } },
      { effects: [mood(['agri', 'felda'], -0.02), eff('stability', -2)], then: { event: 'riceInquiry', after: 12 } },
    ],
  },
  riceInquiry: {
    role: 'gov', weight: 0,
    choices: [
      { effects: [eff('donors', -1), eff('cred', 4), eff('trust', 3)] },
      { effects: [eff('funds', 60_000), eff('cred', -2), eff('trust', -1)] },
      { effects: [eff('trust', -4), eff('cred', -3)] },
    ],
  },
};
