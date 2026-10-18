import type { BlocId } from '../types';
import type { Effect, EventDef, Who } from './events';

const mood = (blocs: BlocId[], n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'fiscal', n: number): Effect => ({ t, n });
const rel = (who: Who, n: number): Effect => ({ t: 'relation', who, n });

/**
 * Eight stories of Sarawak, told for whoever stands where each belongs: a federal prime minister and a partner in the coalition (the power
 * grid and a festival), the opposition (a leaked tape), and the leader of the state (native land maps, a timber tax and a resettlement trust that
 * comes back for audit), with a pothole bounty for the opposition in the state. Every place, company and person is invented, and what is the
 * state's to decide stays the state's. Text lives in `src/i18n/events23.ts`.
 */
export const SARAWAK_STORIES: Record<string, EventDef> = {
  sarawakGridHandshake: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'federation', needs: { partners: true },
    choices: [
      { effects: [eff('fiscal', -0.7), mood(['borneo_urban'], 0.04), mood(['borneo_native'], 0.02), rel('partners', 3), eff('cred', -1)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('trust', 2), mood(['smallbiz'], 0.03), eff('fiscal', 0.2)], lose: [mood(['borneo_urban'], -0.04), eff('stability', -2), eff('cred', -2)] } },
      { effects: [eff('unity', 2), mood(['borneo_native'], -0.03), mood(['borneo_urban'], -0.02), eff('stability', -1)] },
    ],
  },
  borneoLanternPact: {
    role: 'gov', seats: ['gov'], weight: 4, topic: 'party', needs: { partners: true, early: true },
    choices: [
      { effects: [eff('funds', -80_000), mood(['borneo_urban'], 0.04), eff('unity', -3), rel('pm', 2)] },
      { effects: [mood(['urban_lib'], 0.02), mood(['borneo_urban'], -0.02), eff('cred', 1), rel('pm', -1)] },
      { effects: [], gamble: { chance: 'unity', win: [rel('pm', 4), mood(['borneo_native'], 0.03), eff('funds', -20_000)], lose: [rel('pm', -3), eff('unity', -4), mood(['borneo_urban'], -0.03)] } },
    ],
  },
  longhouseLeakApology: {
    role: 'opp', seats: ['lead', 'opp'], weight: 3, topic: 'media',
    choices: [
      { effects: [mood(['borneo_native'], 0.04), mood(['borneo_urban'], 0.02), eff('cred', 1), eff('unity', -2)] },
      { effects: [mood(['urban_lib'], 0.03), mood(['borneo_native'], -0.04), eff('trust', -2), eff('stability', 1)] },
      { effects: [], gamble: { chance: 'cred', win: [mood(['borneo_native'], 0.05), mood(['heartland'], 0.02), eff('cred', 2)], lose: [mood(['borneo_native'], -0.03), eff('cred', -3), eff('funds', -30_000)] } },
    ],
  },
  sarawakNativeMapChoice: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'sarawak' },
    choices: [
      { effects: [mood(['civil'], 0.03), mood(['borneo_native'], -0.03), eff('trust', 2)] },
      { effects: [mood(['borneo_native'], 0.05), eff('unity', -3), eff('trust', -1), eff('funds', -30_000)] },
      { effects: [mood(['borneo_urban'], 0.03), mood(['smallbiz'], 0.02), eff('cred', -1), eff('funds', -90_000)] },
    ],
  },
  sarawakPotholeBounty: {
    role: 'opp', seats: ['opp', 'lead'], weight: 4, topic: 'local', needs: { holds: 'sarawak' },
    choices: [
      { effects: [mood(['borneo_urban'], 0.05), mood(['m40'], 0.02), eff('cred', 1), eff('funds', -15_000)] },
      { effects: [mood(['borneo_native'], 0.02), mood(['smallbiz'], 0.03), eff('unity', 2), eff('trust', -1)] },
      { effects: [], gamble: { chance: 0.5, win: [mood(['borneo_urban'], 0.06), eff('cred', 2)], lose: [mood(['borneo_urban'], -0.02), eff('cred', -2), rel('partners', -2)] } },
    ],
  },
  sarawakTimberSalesTaxTweak: {
    role: 'pm', seats: ['pm'], weight: 2, topic: 'federation', needs: { holds: 'sarawak' },
    choices: [
      { effects: [eff('fiscal', 0.6), mood(['borneo_native'], -0.02), mood(['smallbiz'], -0.03), rel('pm', -2)] },
      { effects: [mood(['borneo_native'], 0.04), mood(['borneo_urban'], 0.02), eff('fiscal', -0.4), eff('cred', 1)] },
      { effects: [], gamble: { chance: 'cred', win: [eff('fiscal', 0.3), mood(['borneo_urban'], 0.03), eff('trust', 2)], lose: [eff('fiscal', -0.2), mood(['smallbiz'], -0.04), eff('stability', -2)] } },
    ],
  },
  hydroVillageTrustFund: {
    role: 'pm', seats: ['pm'], weight: 2, topic: 'local', needs: { holds: 'sarawak' },
    choices: [
      { effects: [eff('fiscal', -0.5), mood(['borneo_native'], 0.05), eff('trust', 2), eff('unity', -2)], then: { event: 'hydroVillageTrustReturns', after: 8 } },
      { effects: [eff('funds', -50_000), mood(['borneo_native'], 0.02), eff('cred', 1)], then: { event: 'hydroVillageTrustReturns', after: 8 } },
      { effects: [mood(['borneo_urban'], 0.03), eff('fiscal', 0.2), mood(['borneo_native'], -0.03)] },
    ],
  },
  hydroVillageTrustReturns: {
    role: 'pm', seats: ['pm'], weight: 0, topic: 'scandal', needs: { holds: 'sarawak' },
    choices: [
      { effects: [eff('trust', -2), mood(['borneo_native'], -0.02), eff('cred', 1)] },
      { effects: [eff('fiscal', -0.3), mood(['borneo_native'], 0.04), eff('unity', -2)] },
      { effects: [], gamble: { chance: 'stability', win: [eff('trust', 3), mood(['borneo_native'], 0.03)], lose: [eff('trust', -3), eff('stability', -2)] } },
    ],
  },
};
