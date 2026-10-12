import type { BlocId } from '../types';
import type { Effect, EventDef, Who } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'fiscal', n: number): Effect => ({ t, n });
const rel = (who: Who, n: number): Effect => ({ t: 'relation', who, n });
const BORNEO: BlocId[] = ['borneo_native', 'borneo_urban'];
const VILLAGE: BlocId[] = ['heartland', 'felda', 'agri'];
const URBAN: BlocId[] = ['m40', 'urban_lib', 'urban_b40'];

/**
 * One story for each state that had none of its own: the quarrels a state's government has with the pipes, the river, the royalty, the
 * border and the ministry in the capital. They are told with invented companies and people, take no side against anyone's faith or
 * community, and come only to the player who governs the state or has a career in it. Text lives in `src/i18n/events19.ts`.
 */
export const STATE_STORIES: Record<string, EventDef> = {
  waterMains: {
    role: 'any', weight: 3, topic: 'local', needs: { holds: 'kelantan' },
    choices: [
      { effects: [eff('funds', -80_000), mood(['heartland', 'urban_b40'], 0.03), eff('cred', 1)] },
      { effects: [], gamble: { chance: 0.5, win: [mood(['heartland', 'urban_b40'], 0.03), eff('cred', 1), rel('pm', 2)], lose: [eff('cred', -2), mood(['heartland', 'urban_b40'], -0.02)] } },
      { effects: [mood(VILLAGE, 0.01), eff('cred', -1), eff('stability', 1)] },
    ],
  },
  royaltyAccount: {
    role: 'any', weight: 3, topic: 'local', needs: { holds: 'terengganu' },
    choices: [
      { effects: [mood(VILLAGE, 0.03), rel('pm', -4), eff('cred', 1)] },
      { effects: [rel('pm', 3), mood(['m40'], 0.01), eff('trust', 1)] },
      { effects: [], gamble: { chance: 'cred', win: [mood(VILLAGE, 0.03), eff('cred', 2)], lose: [mood(VILLAGE, -0.03), rel('pm', -3)] } },
    ],
  },
  zoneIncentives: {
    role: 'any', weight: 3, topic: 'local', needs: { holds: 'johor' },
    choices: [
      { effects: [mood(['smallbiz', 'm40'], 0.03), mood(VILLAGE, -0.02), eff('fiscal', 0.5)] },
      { effects: [mood(['urban_b40', 'gig'], 0.03), mood(['smallbiz'], -0.02), eff('funds', -50_000)] },
      { effects: [eff('cred', 1), mood('all', -0.005), eff('stability', 1)] },
    ],
  },
  riverFines: {
    role: 'any', weight: 3, topic: 'local', needs: { holds: 'selangor' },
    choices: [
      { effects: [mood(URBAN, 0.03), mood(['smallbiz'], -0.03), eff('cred', 1)] },
      { effects: [mood(['smallbiz', 'urban_b40'], 0.02), mood(['urban_lib'], -0.02), eff('cred', -1)] },
      { effects: [], gamble: { chance: 0.5, win: [mood(URBAN, 0.02), eff('trust', 2)], lose: [mood(URBAN, -0.03), eff('cred', -2)] } },
    ],
  },
  digUp: {
    role: 'any', weight: 3, topic: 'local', needs: { holds: 'penang' },
    choices: [
      { effects: [eff('funds', -70_000), mood(['smallbiz', 'm40'], 0.03), eff('cred', 1)] },
      { effects: [mood(['urban_b40', 'm40'], 0.02), mood(['smallbiz'], -0.03)] },
      { effects: [eff('stability', 1), mood('all', -0.005), eff('cred', -1)] },
    ],
  },
  techValley: {
    role: 'any', weight: 3, topic: 'local', needs: { holds: 'perak' },
    choices: [
      { effects: [mood(['gig', 'undi18', 'm40'], 0.03), mood(['urban_lib'], -0.02), eff('fiscal', 0.5)] },
      { effects: [mood(['urban_lib', 'm40'], 0.02), mood(['gig'], -0.02), eff('cred', 1)] },
      { effects: [], gamble: { chance: 0.5, win: [mood(['gig', 'undi18'], 0.03), eff('cred', 1)], lose: [mood(['urban_lib', 'gig'], -0.03), eff('cred', -2)] } },
    ],
  },
  padiGrants: {
    role: 'any', weight: 3, topic: 'local', needs: { holds: 'kedah' },
    choices: [
      { effects: [eff('funds', -90_000), mood(['agri', 'heartland'], 0.03), eff('cred', 1)] },
      { effects: [rel('pm', -5), mood(['agri', 'heartland'], 0.02), eff('cred', 1)] },
      { effects: [rel('pm', 3), mood(['agri'], -0.02), eff('stability', 1)] },
    ],
  },
  highlandFarms: {
    role: 'any', weight: 3, topic: 'local', needs: { holds: 'pahang' },
    choices: [
      { effects: [mood(URBAN, 0.02), mood(['agri'], -0.03), eff('cred', 2)] },
      { effects: [mood(['agri'], 0.03), mood(['urban_lib', 'm40'], -0.02), eff('cred', -2)] },
      { effects: [eff('funds', -60_000), mood(['agri'], 0.01), mood(URBAN, 0.01)] },
    ],
  },
  appointedSeats: {
    role: 'any', weight: 3, topic: 'local', needs: { holds: 'melaka' },
    choices: [
      { effects: [eff('unity', 2), mood(['urban_lib', 'm40'], -0.03), eff('cred', -2)] },
      { effects: [mood(['urban_lib', 'm40'], 0.02), eff('unity', -2), eff('cred', 1)] },
      { effects: [], gamble: { chance: 'unity', win: [eff('unity', 3), eff('cred', 1)], lose: [eff('unity', -4), eff('stability', -2)] } },
    ],
  },
  sittingOverdue: {
    role: 'any', weight: 3, topic: 'house', needs: { holds: 'nsembilan' },
    choices: [
      { effects: [eff('cred', 2), eff('stability', -1), mood(['urban_lib', 'm40'], 0.02)] },
      { effects: [eff('stability', 1), eff('cred', -2), mood(['urban_lib', 'm40'], -0.02)] },
      { effects: [], gamble: { chance: 'stability', win: [eff('cred', 1), eff('trust', 2)], lose: [eff('cred', -3), eff('stability', -2)] } },
    ],
  },
  borderStalls: {
    role: 'any', weight: 3, topic: 'local', needs: { holds: 'perlis' },
    choices: [
      { effects: [mood(['smallbiz', 'agri'], 0.03), eff('funds', -40_000), eff('cred', 1)] },
      { effects: [mood(['heartland', 'urban_b40'], 0.02), mood(['smallbiz'], -0.02)] },
      { effects: [eff('stability', 1), eff('cred', -1), mood('all', -0.005)] },
    ],
  },
  plantationPapers: {
    role: 'any', weight: 3, topic: 'local', needs: { holds: 'sabah' },
    choices: [
      { effects: [mood(BORNEO, 0.02), mood(['smallbiz', 'agri'], -0.02), eff('cred', 1)] },
      { effects: [mood(['smallbiz', 'agri'], 0.03), mood(BORNEO, -0.02), eff('cred', -1)] },
      { effects: [rel('pm', -3), eff('cred', 1), mood(BORNEO, 0.01)] },
    ],
  },
  carbonStorage: {
    role: 'any', weight: 3, topic: 'local', needs: { holds: 'sarawak' },
    choices: [
      { effects: [eff('fiscal', -0.5), mood(['m40', 'urban_lib'], 0.02), mood(BORNEO, -0.02), eff('cred', 1)] },
      { effects: [mood(BORNEO, 0.03), eff('funds', -50_000), eff('cred', 1)] },
      { effects: [], gamble: { chance: 0.5, win: [mood(['m40', 'urban_lib', ...BORNEO], 0.02), eff('cred', 2)], lose: [mood(BORNEO, -0.03), eff('cred', -2)] } },
    ],
  },
  buildingCode: {
    role: 'any', weight: 3, topic: 'local',
    choices: [
      { effects: [mood(['smallbiz'], -0.03), mood(URBAN, 0.02), eff('cred', 2)] },
      { effects: [mood(['smallbiz'], 0.01), eff('cred', 1), eff('stability', 1)] },
      { effects: [mood(['smallbiz'], 0.03), eff('cred', -2), mood(URBAN, -0.02)] },
    ],
  },
  schoolClosures: {
    role: 'any', weight: 3, topic: 'local',
    choices: [
      { effects: [mood(['m40', 'urban_lib', 'seniors'], 0.03), eff('funds', -30_000), eff('cred', 1)] },
      { effects: [mood(['m40', 'urban_b40'], 0.02), eff('trust', 1), eff('stability', 1)] },
      { effects: [], gamble: { chance: 0.6, win: [mood('all', 0.01), eff('cred', 1)], lose: [mood(['m40', 'urban_lib', 'seniors'], -0.04), eff('cred', -3)] } },
    ],
  },
};
