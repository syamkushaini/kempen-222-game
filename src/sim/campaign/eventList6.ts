import type { BlocId, PartyId } from '../types';
import type { Effect, EventDef, Who } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'fiscal', n: number): Effect => ({ t, n });
const rel = (who: Who, n: number): Effect => ({ t: 'relation', who, n });
const nat = (health = 0, education = 0, standing = 0): Effect => ({ t: 'nation', health, education, standing });
const BORNEO: BlocId[] = ['borneo_native', 'borneo_urban'];
const gbk: PartyId = 'gbk';
const gbs: PartyId = 'gbs';
const CITY: BlocId[] = ['urban_b40', 'm40', 'urban_lib', 'gig'];

/**
 * Two stories told over a parliament, in chapters, about who owns what in the federation: one for the government of the
 * country (the Borneo states' claims) and one for the government of a state (a grant the centre will not pay), and three
 * events of the federal territories. Text lives in `src/i18n/events6.ts`.
 */
export const FEDERATION_EVENTS: Record<string, EventDef> = {
  // ----- the country: the claims of the Borneo states -----
  claimsTalks: {
    role: 'gov', weight: 3,
    choices: [
      { effects: [rel(gbk, 6), rel(gbs, 4), mood(BORNEO, 0.02)], then: { event: 'claimsStalled', after: 10 } },
      { effects: [mood(BORNEO, 0.005)], then: { event: 'claimsStalled', after: 14 } },
      { effects: [mood(BORNEO, -0.04), rel(gbk, -8), rel(gbs, -6), eff('stability', -2)] },
    ],
  },
  claimsStalled: {
    role: 'gov', weight: 0,
    choices: [
      { effects: [eff('fiscal', 1), mood(BORNEO, 0.03), rel(gbk, 6)], then: { event: 'claimsVerdict', after: 12 } },
      { effects: [], gamble: { chance: 'stability', win: [mood(BORNEO, 0.01)], lose: [mood(BORNEO, -0.03), rel(gbk, -6), rel(gbs, -4)] }, then: { event: 'claimsVerdict', after: 12 } },
      { effects: [eff('funds', -60_000), eff('cred', 1)], then: { event: 'claimsVerdict', after: 12 } },
    ],
  },
  claimsVerdict: {
    role: 'gov', weight: 0,
    choices: [
      { effects: [mood(BORNEO, 0.04), eff('cred', 2), nat(0, 0, 1), rel(gbk, 6)] },
      { effects: [eff('stability', -3), mood(BORNEO, -0.03), rel(gbk, -8), rel(gbs, -6)] },
    ],
  },

  // ----- a state: the grant the centre will not pay -----
  fedGrantCut: {
    role: 'any', weight: 3,
    choices: [
      { effects: [eff('cred', 1), rel('pm', -8), mood('all', 0.01)], then: { event: 'fedTalks', after: 8 } },
      { effects: [rel('pm', 4)], then: { event: 'fedTalks', after: 8 } },
      { effects: [eff('fiscal', 1), eff('cred', -2)] },
    ],
  },
  fedTalks: {
    role: 'any', weight: 0,
    choices: [
      { effects: [eff('funds', -80_000), eff('cred', 1)], then: { event: 'fedSettlement', after: 12 } },
      { effects: [rel('pm', 10), eff('unity', -2)], then: { event: 'fedSettlement', after: 12 } },
      { effects: [eff('cred', -1), mood('all', -0.005)] },
    ],
  },
  fedSettlement: {
    role: 'any', weight: 0,
    choices: [
      { effects: [eff('funds', 100_000), eff('cred', 1)] },
      { effects: [], gamble: { chance: 'cred', win: [eff('funds', 180_000), eff('cred', 2)], lose: [eff('cred', -3), mood('all', -0.01)] } },
    ],
  },

  // ----- the federal territories -----
  cityHousing: {
    role: 'gov', weight: 2,
    choices: [
      { effects: [eff('funds', -100_000), mood(CITY, 0.03), eff('fiscal', 0.5)] },
      { effects: [mood(['m40', 'urban_lib'], 0.02), mood(['urban_b40', 'gig'], -0.02)] },
      { effects: [mood(CITY, -0.03), eff('cred', -1)] },
    ],
  },
  flashFloods: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('funds', -70_000), mood(CITY, 0.02), eff('cred', 1)] },
      { effects: [], gamble: { chance: 'stability', win: [mood(CITY, 0.01)], lose: [mood(CITY, -0.03), eff('cred', -2)] } },
      { effects: [mood(CITY, -0.02)] },
    ],
  },
  mayorRow: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('unity', 1), mood(['urban_lib', 'm40'], -0.02), rel('pm', 3)] },
      { effects: [eff('unity', -2), mood(['urban_lib', 'm40'], 0.03), eff('cred', 1)] },
      { effects: [] },
    ],
  },
};
