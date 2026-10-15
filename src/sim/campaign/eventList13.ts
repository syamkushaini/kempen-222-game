import type { BlocId } from '../types';
import type { Effect, EventDef } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'fiscal', n: number): Effect => ({ t, n });

/**
 * Ten quarrels of the Kedah state government, told for the leader of the state (the head of its government, who has a career in Kedah).
 * Every place, office and person is invented, and each stays within the state's own business. Text lives in `src/i18n/events20.ts`.
 */
export const KEDAH_STORIES: Record<string, EventDef> = {
  kedahPaddyDrainage: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'kedah' },
    choices: [
      { effects: [eff('funds', -45_000), mood(['agri'], 0.04), eff('cred', -1)] },
      { effects: [eff('cred', 2), mood(['agri'], -0.03), eff('unity', -1)] },
      { effects: [eff('funds', -12_000), mood(['agri'], 0.02), mood(['civil'], -0.02)] },
    ],
  },
  kedahMarketStalls: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'kedah' },
    choices: [
      { effects: [eff('funds', -60_000), mood(['smallbiz'], 0.04), eff('fiscal', -0.3)] },
      { effects: [eff('cred', 2), mood(['smallbiz'], -0.02), eff('unity', -1)] },
      { effects: [eff('funds', -18_000), mood(['smallbiz'], 0.03), mood(['civil'], -0.02)] },
    ],
  },
  kedahHillQuarryAccess: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'kedah' },
    choices: [
      { effects: [mood(['civil'], 0.03), mood(['smallbiz'], -0.02), { t: 'economy', growth: -0.1 }] },
      { effects: [eff('cred', 1), mood(['agri'], 0.02), eff('funds', -10_000)] },
      { effects: [mood(['smallbiz'], 0.02), eff('cred', -2), eff('stability', -1)] },
    ],
  },
  kedahVillageLease: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'kedah' },
    choices: [
      { effects: [eff('funds', 18_000), mood(['urban_b40'], 0.03), mood(['m40'], -0.02)] },
      { effects: [eff('cred', 1), mood(['urban_b40'], -0.03), eff('stability', 1)] },
      { effects: [eff('cred', 2), eff('unity', -1), mood(['urban_b40'], -0.01)] },
    ],
  },
  kedahFloodRetentionLand: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'kedah' },
    choices: [
      { effects: [eff('funds', 35_000), mood(['smallbiz'], 0.03), mood(['civil'], -0.03)] },
      { effects: [eff('cred', 2), mood(['civil'], 0.04), eff('funds', -20_000)] },
      { effects: [eff('cred', 1), eff('funds', -8_000), mood(['smallbiz'], -0.02), mood(['civil'], 0.02)] },
    ],
  },
  kedahForestTrail: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'kedah' },
    choices: [
      { effects: [eff('cred', 1), mood(['civil'], 0.02), mood(['smallbiz'], -0.03)] },
      { effects: [eff('funds', -12_000), mood(['smallbiz'], 0.04), eff('cred', 1)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('funds', -16_000), mood(['smallbiz'], 0.04), eff('cred', 1)], lose: [eff('funds', -42_000), mood(['civil'], -0.04), eff('cred', -2)] } },
    ],
  },
  kedahLocalParking: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'kedah' },
    choices: [
      { effects: [eff('funds', -22_000), mood(['smallbiz'], 0.03), eff('cred', -1)] },
      { effects: [eff('funds', 12_000), eff('cred', 2), mood(['urban_b40'], -0.02)] },
      { effects: [mood(['urban_b40'], 0.03), mood(['civil'], 0.02), eff('funds', -35_000)] },
    ],
  },
  kedahVillageHall: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'kedah' },
    choices: [
      { effects: [eff('funds', -30_000), eff('cred', 1), mood(['m40'], -0.02)] },
      { effects: [eff('funds', -18_000), mood(['civil'], 0.03), eff('unity', -1)] },
      { effects: [mood(['undi18'], 0.04), mood(['seniors'], -0.02)] },
    ],
  },
  kedahWaterCatchment: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'kedah' },
    choices: [
      { effects: [eff('cred', 1), mood(['civil'], 0.03), mood(['agri'], -0.03)] },
      { effects: [eff('funds', -25_000), mood(['agri'], 0.02), eff('cred', 1)] },
      { effects: [eff('cred', -1), eff('unity', 1), mood(['agri'], 0.02), mood(['civil'], -0.02)] },
    ],
  },
  kedahPublicJetty: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'local', needs: { holds: 'kedah' },
    choices: [
      { effects: [eff('funds', -85_000), eff('cred', 1), mood(['agri'], -0.02)] },
      { effects: [eff('funds', -30_000), mood(['agri'], 0.03), eff('cred', -1)] },
      { effects: [mood(['smallbiz'], 0.03), eff('unity', -1)] },
    ],
  },
};
