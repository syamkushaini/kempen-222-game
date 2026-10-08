import type { BlocId } from '../types';
import type { Effect, EventDef } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'fiscal', n: number): Effect => ({ t, n });
const econ = (growth: number, inflation = 0): Effect => ({ t: 'economy', growth, inflation });
const nat = (health = 0, education = 0, standing = 0): Effect => ({ t: 'nation', health, education, standing });
const sack: Effect = { t: 'minister', act: 'sack' };
const end = (kind: 'ousted' | 'retired'): Effect => ({ t: 'end', kind });
const keep: Effect = { t: 'minister', act: 'keep' };

/**
 * A scandal at the cabinet table, other nations' quarrels that land on the government's desk, and the seasons that come
 * round every year whoever is in office. Text lives in `src/i18n/events5.ts`.
 */
export const SEASON_EVENTS: Record<string, EventDef> = {
  // ----- the cabinet -----
  // Raised by a minister's past catching up with them (see cabinetWeek): the player answers at the press conference.
  ministerScandal: {
    role: 'gov', weight: 0,
    choices: [
      { effects: [sack, eff('cred', -3), eff('trust', -2)] },
      { effects: [], gamble: { chance: 'cred', win: [keep, eff('cred', 1), mood('all', 0.004)], lose: [sack, eff('cred', -7), eff('trust', -5), eff('stability', -3)] } },
      { effects: [sack, eff('cred', -2), eff('trust', -1), eff('stability', -2)] },
    ],
  },

  // The courts come for the leader (see trial.ts). A case lost ends the career.
  courtCase: {
    role: 'any', weight: 0,
    choices: [
      { effects: [eff('funds', -150_000)], gamble: { chance: 'case', win: [eff('cred', 4), mood('all', 0.01)], lose: [end('ousted')] } },
      { effects: [eff('funds', -200_000), eff('cred', -8), eff('unity', -4)] },
      { effects: [end('retired')] },
    ],
  },

  // The head of the civil service writes to the head of government once a year (see ksu.ts).
  ksuMemo: {
    role: 'pm', weight: 0, yearly: 35,
    choices: [
      { effects: [{ t: 'ksu', act: 'follow' }, eff('cred', 1)] },
      { effects: [{ t: 'ksu', act: 'override' }, eff('stability', 1)] },
      { effects: [{ t: 'ksu', act: 'replace' }, eff('cred', -1)] },
    ],
  },
  // An adviser who has said the same thing three times asks for a word (see advisers.ts).
  adviserUltimatum: {
    role: 'any', weight: 0,
    choices: [
      { effects: [{ t: 'adviser', act: 'listen' }] },
      { effects: [{ t: 'adviser', act: 'ignore' }] },
      { effects: [{ t: 'adviser', act: 'dismiss' }] },
    ],
  },
  // The Speaker rules on a motion, and the House waits to see whether the government will accept it.
  speakerRuling: {
    role: 'any', weight: 2,
    choices: [
      { effects: [eff('stability', 1), eff('cred', 1)] },
      { effects: [], gamble: { chance: 'stability', win: [eff('cred', 2), mood('all', 0.005)], lose: [eff('cred', -3), eff('stability', -3)] } },
      { effects: [eff('unity', 1), eff('cred', -1)] },
    ],
  },

  // ----- other nations -----
  borderStandoff: {
    role: 'gov', weight: 3,
    choices: [
      { effects: [], gamble: { chance: 0.5, win: [mood(['heartland', 'felda', 'agri'], 0.03), nat(0, 0, 1)], lose: [eff('stability', -3), nat(0, 0, -4)] } },
      { effects: [nat(0, 0, 2), mood(['heartland'], -0.01), eff('cred', 1)] },
      { effects: [nat(0, 0, 1)], then: { event: 'mediationAward', after: 8 } },
    ],
  },
  sanctionsThreat: {
    role: 'gov', weight: 3,
    choices: [
      { effects: [econ(0.2), nat(0, 0, -3), eff('cred', -2), mood(['smallbiz'], 0.02)] },
      { effects: [], gamble: { chance: 'cred', win: [nat(0, 0, 3), mood(['heartland', 'felda'], 0.02)], lose: [econ(-0.6, 0.3), mood(['smallbiz'], -0.04)] } },
      { effects: [eff('funds', -50_000), econ(-0.1), nat(0, 0, 1)] },
    ],
  },
  strandedAbroad: {
    role: 'gov', weight: 3,
    choices: [
      { effects: [eff('funds', -120_000), eff('cred', 2), mood(['seniors', 'm40'], 0.02), nat(0, 0, 1)] },
      { effects: [eff('cred', -2), mood(['seniors', 'm40'], -0.02)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('cred', 2), mood(['undi18', 'm40'], 0.02)], lose: [eff('cred', -2), mood('all', -0.005)] } },
    ],
  },

  // ----- the year's own seasons -----
  monsoon: {
    role: 'any', weight: 0, yearly: 47,
    choices: [
      { effects: [eff('funds', -90_000), mood(['heartland', 'agri', 'felda', 'urban_b40'], 0.03), eff('cred', 2)] },
      { effects: [], gamble: { chance: 'stability', win: [mood('all', 0.01)], lose: [eff('cred', -4), mood(['heartland', 'agri', 'felda'], -0.03)] } },
      { effects: [mood('all', -0.01), eff('unity', -1)] },
    ],
  },
  haze: {
    role: 'any', weight: 0, yearly: 31,
    choices: [
      { effects: [eff('funds', -60_000), econ(-0.2), mood(['m40', 'urban_lib', 'seniors'], 0.02)] },
      { effects: [nat(0, 0, -1), mood(['m40', 'urban_lib'], 0.01), eff('cred', 1)] },
      { effects: [mood(['m40', 'urban_lib', 'seniors', 'undi18'], -0.02), nat(-2, 0, 0)] },
    ],
  },
  priceSurge: {
    role: 'any', weight: 0, yearly: 20,
    choices: [
      { effects: [eff('fiscal', 1), mood(['urban_b40', 'heartland', 'gig'], 0.03), mood(['smallbiz'], -0.04)] },
      { effects: [eff('funds', -70_000), mood(['urban_b40', 'gig'], 0.03), eff('cred', 1)] },
      { effects: [eff('cred', -2), mood('all', -0.01)] },
    ],
  },
};
