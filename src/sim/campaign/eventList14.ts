import type { BlocId } from '../types';
import type { Effect, EventDef, Who } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'fiscal', n: number): Effect => ({ t, n });
const rel = (who: Who, n: number): Effect => ({ t: 'relation', who, n });

/**
 * Eleven quarrels of the Selangor state government, told for the leader of the state (the head of its government, who has a career in
 * Selangor): land, local councils, drainage, heritage, water and the coast. Every place, company and person is invented, and each stays within
 * the state's own business. Text lives in `src/i18n/events21.ts`.
 */
export const SELANGOR_STORIES: Record<string, EventDef> = {
  riverfrontLease: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'selangor' },
    choices: [
      { effects: [eff('funds', -25_000), mood(['urban_b40'], 0.03)] },
      { effects: [eff('funds', 30_000), mood(['m40'], 0.03), mood(['urban_b40'], -0.03)] },
      { effects: [eff('cred', 1), eff('funds', -12_000), mood(['urban_b40'], -0.02)] },
    ],
  },
  hillSlopeAudit: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'selangor' },
    choices: [
      { effects: [eff('funds', -40_000), eff('stability', 1), mood(['urban_b40'], 0.03)] },
      { effects: [eff('cred', 1), eff('funds', -10_000), rel('opp', -1)] },
      { effects: [eff('stability', 1), mood(['m40'], -0.03)] },
    ],
  },
  marketStallLottery: {
    role: 'pm', seats: ['pm'], weight: 4, topic: 'local', needs: { holds: 'selangor' },
    choices: [
      { effects: [eff('cred', 1), mood(['smallbiz'], -0.02)] },
      { effects: [eff('funds', -15_000), mood(['smallbiz'], 0.03), eff('cred', -1)] },
      { effects: [eff('funds', -8_000), eff('cred', 1), mood(['smallbiz'], -0.03)] },
    ],
  },
  heritageShopfronts: {
    role: 'pm', seats: ['pm'], weight: 2, topic: 'local', needs: { holds: 'selangor' },
    choices: [
      { effects: [eff('funds', -60_000), mood(['smallbiz'], 0.03), mood(['urban_lib'], 0.02)] },
      { effects: [eff('cred', 1), mood(['urban_lib'], 0.03), mood(['smallbiz'], -0.04)] },
      { effects: [eff('funds', -18_000), mood(['smallbiz'], 0.02), eff('cred', -1)] },
    ],
  },
  strayAnimalContract: {
    role: 'pm', seats: ['pm'], weight: 2, topic: 'local', needs: { holds: 'selangor' },
    choices: [
      { effects: [eff('cred', 1), mood(['urban_b40'], 0.02)] },
      { effects: [eff('funds', -20_000), eff('stability', 1), mood(['smallbiz'], 0.02), mood(['urban_b40'], -0.02)] },
      { effects: [eff('funds', -50_000), mood(['urban_b40'], 0.03), eff('cred', -1)] },
    ],
  },
  drainageReserve: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'selangor' },
    choices: [
      { effects: [eff('funds', -85_000), eff('stability', 1), mood(['urban_b40'], -0.03)] },
      { effects: [eff('cred', 1), mood(['urban_b40'], 0.03)] },
      { effects: [eff('funds', -100_000), mood(['m40'], -0.03), mood(['urban_lib'], 0.03)] },
    ],
  },
  waterMeterDispute: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'selangor' },
    choices: [
      { effects: [eff('funds', -35_000), eff('trust', 2), mood(['urban_b40'], 0.03)] },
      { effects: [eff('funds', -18_000), eff('trust', 1), mood(['urban_b40'], 0.02), eff('cred', -1)] },
      { effects: [rel('partners', 1), eff('trust', -2), mood(['m40'], 0.02), mood(['urban_b40'], -0.03)] },
    ],
  },
  quarryRoute: {
    role: 'pm', seats: ['pm'], weight: 2, topic: 'local', needs: { holds: 'selangor' },
    choices: [
      { effects: [eff('cred', 1), mood(['agri'], 0.03), mood(['smallbiz'], -0.02)] },
      { effects: [eff('funds', 25_000), eff('stability', 1), mood(['agri'], -0.02)] },
      { effects: [eff('funds', -90_000), mood(['smallbiz'], 0.02), mood(['m40'], -0.02)] },
    ],
  },
  coastalMangrove: {
    role: 'pm', seats: ['pm'], weight: 2, topic: 'local', needs: { holds: 'selangor' },
    choices: [
      { effects: [eff('funds', -30_000), mood(['smallbiz'], 0.03), mood(['agri'], -0.03), eff('cred', -1)] },
      { effects: [eff('cred', 1), mood(['agri'], 0.04), mood(['smallbiz'], -0.04)] },
      { effects: [eff('funds', -25_000), mood(['smallbiz'], 0.02), mood(['agri'], 0.01)] },
    ],
  },
  localPlanGamble: {
    role: 'pm', seats: ['pm'], weight: 2, topic: 'local', needs: { holds: 'selangor' },
    choices: [
      { effects: [], gamble: { chance: 'cred', win: [eff('cred', 2), { t: 'economy', growth: 0.2 }, mood(['m40'], 0.02)], lose: [eff('funds', -45_000), eff('trust', -2), mood(['urban_b40'], -0.03)] } },
      { effects: [eff('funds', -22_000), eff('trust', 1), mood(['urban_b40'], 0.02), { t: 'economy', growth: -0.1 }] },
      { effects: [eff('funds', -30_000), eff('cred', 1), mood(['m40'], -0.02)] },
    ],
  },
  leaseholdHomes: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'selangor' },
    choices: [
      { effects: [eff('funds', -25_000), mood(['urban_b40'], 0.04), eff('cred', -1)] },
      { effects: [eff('funds', -18_000), eff('trust', 2), mood(['urban_b40'], 0.02), mood(['smallbiz'], -0.02)] },
      { effects: [eff('cred', 1), mood(['m40'], 0.02), mood(['urban_b40'], -0.02)] },
    ],
  },
};
