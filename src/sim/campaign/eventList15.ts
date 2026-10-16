import type { BlocId } from '../types';
import type { Effect, EventDef } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'fiscal', n: number): Effect => ({ t, n });
const pest = (p: { cohesion?: number; tech?: number; environment?: number; law?: number }): Effect => ({ t: 'pestel', ...p });
const forces = (readiness: number, influence = 0): Effect => ({ t: 'defence', ...(readiness ? { readiness } : {}), ...(influence ? { influence } : {}) });
const standing = (n: number): Effect => ({ t: 'nation', standing: n });

/**
 * Fifteen decisions that move the PESTEL meters and the two defence meters (see pestel.ts and defence.ts): seven about the armed forces
 * (six for a head of government or a partner in it, one for the opposition) and eight about technology, the environment, the law and
 * how people hold together. Every place, office and person is invented. Each has a choice that costs no money. Text lives in
 * `src/i18n/events22.ts`; the seven about the armed forces belong to a country and not to a state.
 */
export const FORCES_AND_PESTEL: Record<string, EventDef> = {
  // ----- the armed forces: a country's only -----
  navyPatrolBoats: {
    role: 'gov', seats: ['pm', 'gov'], weight: 3, topic: 'forces', needs: { readiness: 60 },
    choices: [
      { effects: [eff('funds', -90_000), forces(5), mood(['borneo_native', 'heartland'], 0.02)] },
      { effects: [forces(-2), eff('cred', 1)] },
      { effects: [], gamble: { chance: 0.5, win: [forces(3), eff('cred', 1)], lose: [forces(-4), eff('stability', -2), standing(-2)] } },
    ],
  },
  forcesProcurementRow: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'forces', needs: { influence: 50 },
    choices: [
      { effects: [pest({ law: 4 }), forces(0, -5), eff('stability', -2), eff('cred', 1)] },
      { effects: [eff('funds', -60_000), forces(2, 4), pest({ law: -3 })] },
      { effects: [eff('cred', -1), forces(0, -1)] },
    ],
  },
  forcesHousingDemand: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'forces', needs: { influence: 65 },
    choices: [
      { effects: [eff('funds', -80_000), forces(3, 5), mood(['civil'], -0.02)] },
      { effects: [eff('stability', -3), forces(0, -4), eff('cred', 2)] },
      { effects: [], gamble: { chance: 'stability', win: [forces(0, -1), eff('cred', 1)], lose: [eff('stability', -2), forces(0, 3)] } },
    ],
  },
  borderSensorsDown: {
    role: 'gov', seats: ['pm', 'gov'], weight: 3, topic: 'forces', needs: { readiness: 45 },
    choices: [
      { effects: [eff('funds', -70_000), forces(5), standing(1), eff('cred', 1)] },
      { effects: [forces(2), mood(['heartland'], -0.02), eff('cred', -1)] },
      { effects: [forces(-2), eff('cred', -2), standing(-2)] },
    ],
  },
  nationalDayFlypast: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'forces',
    choices: [
      { effects: [eff('funds', -60_000), pest({ cohesion: 4 }), forces(0, 2), mood('all', 0.01)] },
      { effects: [pest({ cohesion: 2 }), eff('cred', 1)] },
      { effects: [eff('funds', -30_000), pest({ cohesion: 3 }), forces(0, -2)] },
    ],
  },
  troopsFloodRescue: {
    role: 'gov', seats: ['pm', 'gov'], weight: 3, topic: 'forces',
    choices: [
      { effects: [forces(-3, 3), pest({ cohesion: 5 }), mood(['heartland', 'agri'], 0.03)] },
      { effects: [eff('cred', 1), pest({ cohesion: 2 }), mood(['heartland'], -0.02)] },
      { effects: [], gamble: { chance: 'stability', win: [pest({ cohesion: 4 }), eff('cred', 2)], lose: [pest({ cohesion: -2 }), mood(['heartland'], -0.03)] } },
    ],
  },
  forcesWhitePaper: {
    role: 'opp', seats: ['lead', 'opp'], weight: 3, topic: 'forces',
    choices: [
      { effects: [eff('cred', 1), forces(0, -2), mood(['civil', 'urban_lib'], 0.02)] },
      { effects: [{ t: 'rival', who: 'pm', n: -0.006 }, mood(['m40'], 0.02), eff('cred', -1)] },
      { effects: [eff('unity', 1), eff('cred', -1)] },
    ],
  },

  // ----- technology, the environment, the law and how people hold together -----
  schoolWifiGap: {
    role: 'gov', seats: ['pm', 'gov'], weight: 3, topic: 'digital',
    choices: [
      { effects: [eff('funds', -80_000), pest({ tech: 5 }), mood(['undi18', 'm40'], 0.03)] },
      { effects: [pest({ tech: 3 }), eff('cred', -1)] },
      { effects: [pest({ tech: 1 }), mood(['undi18'], -0.02), eff('cred', 1)] },
    ],
  },
  peatFireSeason: {
    role: 'gov', seats: ['pm', 'gov'], weight: 3, topic: 'green',
    choices: [
      { effects: [eff('funds', -70_000), pest({ environment: 5 }), mood(['agri'], 0.02)] },
      { effects: [pest({ environment: 4, law: 2 }), mood(['agri', 'smallbiz'], -0.03)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('cred', 1)], lose: [pest({ environment: -6 }), mood(['heartland'], -0.03), standing(-2)] } },
    ],
  },
  rooftopRow: {
    role: 'gov', seats: ['pm', 'gov'], weight: 3, topic: 'community',
    choices: [
      { effects: [eff('funds', -20_000), pest({ cohesion: 4 }), mood(['urban_b40'], 0.02), eff('cred', 1)] },
      { effects: [pest({ cohesion: 2, law: 1 })] },
      { effects: [pest({ cohesion: -3 }), eff('cred', -1)] },
    ],
  },
  bodyCameraRollout: {
    role: 'gov', seats: ['pm', 'gov'], weight: 3, topic: 'justice',
    choices: [
      { effects: [eff('funds', -90_000), pest({ law: 5 }), mood(['civil'], 0.02)] },
      { effects: [pest({ law: 2 }), eff('cred', 1)] },
      { effects: [pest({ law: -5 }), eff('cred', -2), mood(['civil', 'urban_lib'], -0.03)] },
    ],
  },
  ministryDataLeak: {
    role: 'gov', seats: ['pm', 'gov'], weight: 3, topic: 'digital',
    choices: [
      { effects: [eff('funds', -50_000), pest({ tech: 3, law: 3 }), eff('cred', 2)] },
      { effects: [pest({ tech: 1, law: -4 }), eff('cred', -1)] },
      { effects: [pest({ tech: 1, law: -1 }), eff('cred', -1)] },
    ],
  },
  riverCleanupPledge: {
    role: 'pm', seats: ['pm'], weight: 3, topic: 'green',
    choices: [
      { effects: [eff('funds', -60_000), pest({ environment: 4 }), mood(['agri'], 0.02)] },
      { effects: [pest({ environment: 4, law: 2 }), mood(['smallbiz'], -0.03), eff('cred', 1)] },
      { effects: [pest({ environment: 1 }), eff('cred', -2)] },
    ],
  },
  courtBacklog: {
    role: 'gov', seats: ['pm', 'gov'], weight: 3, topic: 'justice',
    choices: [
      { effects: [eff('funds', -80_000), pest({ law: 4 }), mood(['smallbiz'], 0.02)] },
      { effects: [pest({ law: 3 }), mood(['civil'], -0.01)] },
      { effects: [], gamble: { chance: 'cred', win: [pest({ law: 3, cohesion: 1 }), eff('cred', 1)], lose: [pest({ law: -2 }), eff('cred', -1)] } },
    ],
  },
  heatwaveSchools: {
    role: 'gov', seats: ['pm', 'gov'], weight: 3, topic: 'green',
    choices: [
      { effects: [eff('funds', -50_000), pest({ environment: 3, cohesion: 2 }), mood(['undi18'], 0.02), eff('cred', 1)] },
      { effects: [pest({ cohesion: -3 }), mood(['undi18'], -0.03), eff('cred', -1)] },
      { effects: [pest({ cohesion: 3, environment: 1 }), mood(['heartland'], 0.01)] },
    ],
  },
};
