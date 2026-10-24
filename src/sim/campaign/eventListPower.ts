import type { BlocId } from '../types';
import type { Effect, EventDef, Who } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust', n: number): Effect => ({ t, n });
const pub = (n: number): Effect => ({ t: 'public', n });
const rel = (who: Who, n: number): Effect => ({ t: 'relation', who, n });
const rival = (who: Who, n: number): Effect => ({ t: 'rival', who, n });

/**
 * Trouble that comes with winning. A government that is stable, trusted and not in debt had little to fear, so that a full treasury was
 * also a quiet game. These come only to such a government (`needs.secure`): partners who see how much they are needed, a deputy's camp,
 * backbenchers who want their share, a contractor who is too generous, a wedding that is too lavish, an opposition that finally agrees,
 * and the comfort of being ahead. Text lives in `src/i18n/events29.ts`. Every person and place is invented.
 */
export const POWER_EVENTS: Record<string, EventDef> = {
  powerPartnerPortfolios: {
    role: 'pm', seats: ['pm'], weight: 6, topic: 'house', needs: { partners: true, secure: true },
    choices: [
      { effects: [rel('partners', 2), eff('unity', -2), eff('stability', 1)] },
      { effects: [rel('partners', -3), eff('stability', -3), eff('cred', 1)] },
      { effects: [pub(-150_000), rel('partners', 1), eff('stability', 1)] },
    ],
  },
  powerPartnerProject: {
    role: 'pm', seats: ['pm'], weight: 6, topic: 'economy', needs: { partners: true, secure: true },
    choices: [
      { effects: [pub(-300_000), rel('partners', 3), mood(['heartland', 'felda'], 0.01)] },
      { effects: [rel('partners', -2), eff('stability', -2), eff('trust', 1)] },
      { effects: [], gamble: { chance: 'cred', win: [rel('partners', 1), eff('stability', 2), eff('trust', 1)], lose: [rel('partners', -4), eff('stability', -3)] } },
    ],
  },
  powerDeputyCamp: {
    role: 'pm', seats: ['pm'], weight: 6, topic: 'party', needs: { secure: true },
    choices: [
      { effects: [eff('unity', 2), eff('funds', -50_000), eff('cred', -1)] },
      { effects: [eff('cred', 2), eff('unity', -2)] },
      { effects: [], gamble: { chance: 'cred', win: [eff('unity', 3), eff('stability', 1)], lose: [eff('unity', -4), eff('cred', -2), eff('stability', -2)] } },
    ],
  },
  powerBackbench: {
    role: 'gov', seats: ['pm', 'gov'], weight: 6, topic: 'party', needs: { secure: true },
    choices: [
      { effects: [pub(-200_000), eff('unity', 2), mood(['civil'], 0.01)] },
      { effects: [eff('unity', -2), eff('cred', 2), eff('trust', 1)] },
      { effects: [eff('unity', 1), eff('trust', -2), mood(['urban_lib'], -0.01)] },
    ],
  },
  powerContractor: {
    role: 'gov', seats: ['pm', 'gov'], weight: 6, topic: 'scandal', needs: { secure: true },
    choices: [
      { effects: [eff('cred', 2), eff('trust', 3), eff('unity', -2)] },
      { effects: [], gamble: { chance: 'cred', win: [eff('stability', 1), eff('cred', 1)], lose: [eff('cred', -4), eff('trust', -4), mood('all', -0.01)] } },
      { effects: [pub(-80_000), eff('trust', -2), eff('stability', 1)] },
    ],
  },
  powerWedding: {
    role: 'gov', seats: ['pm', 'gov'], weight: 5, topic: 'scandal', needs: { secure: true },
    choices: [
      { effects: [eff('cred', 1), eff('unity', -1), mood(['urban_b40', 'gig'], 0.01)] },
      { effects: [eff('trust', -2), mood(['urban_b40', 'gig', 'heartland'], -0.015)] },
      { effects: [eff('trust', 1), eff('cred', 2), pub(-60_000)] },
    ],
  },
  powerOppUnites: {
    role: 'gov', seats: ['pm', 'gov'], weight: 6, topic: 'house', needs: { secure: true },
    choices: [
      { effects: [pub(-100_000), mood('all', 0.005), rival('opp', -0.005)] },
      { effects: [rival('opp', 0.01), eff('stability', -1), eff('cred', 1)] },
      { effects: [], gamble: { chance: 'cred', win: [rival('opp', -0.015), eff('unity', 1), eff('stability', 1)], lose: [rival('opp', 0.02), eff('stability', -2), eff('cred', -1)] } },
    ],
  },
  powerComfort: {
    role: 'pm', seats: ['pm'], weight: 5, topic: 'party', needs: { secure: true, late: true },
    choices: [
      { effects: [eff('unity', 2), eff('funds', -40_000), eff('cred', 1)] },
      { effects: [eff('trust', -1), eff('stability', 1), mood(['smallbiz'], 0.01)] },
      { effects: [], gamble: { chance: 'cred', win: [eff('cred', 2), eff('trust', 2), eff('unity', 1)], lose: [eff('cred', -3), eff('unity', -2)] } },
    ],
  },
};
