import type { BlocId } from '../types';
import type { Effect, EventDef } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'cred' | 'stability' | 'trust' | 'fiscal', n: number): Effect => ({ t, n });
const nat = (health = 0, education = 0, standing = 0): Effect => ({ t: 'nation', health, education, standing });
const econ = (growth: number, inflation = 0): Effect => ({ t: 'economy', growth, inflation });
const debt = (n: number): Effect => ({ t: 'debt', n });
const pub = (n: number): Effect => ({ t: 'public', n });

/**
 * Booms and busts that give notice. The central bank sees a windfall or a storm coming, and says so; what the head of government does
 * in the weeks between the warning and the day decides how it lands. A windfall then asks what to do with it (keep it, pay the debt,
 * spend it, cut taxes), and a shock how to meet it (stimulus, austerity, a bank rescue). Money is at general-election scale.
 */
export const SHOCK_EVENTS: Record<string, EventDef> = {
  boomWarn: {
    role: 'pm', topic: 'economy', weight: 1, yearly: 14, chance: 0.35,
    choices: [
      { effects: [eff('cred', 1)], then: { event: 'boom', after: 9 } },
      { effects: [mood('all', 0.012), eff('cred', -1)], then: { event: 'boom', after: 9 } },
      { effects: [], then: { event: 'boom', after: 9 } },
    ],
  },
  boom: {
    role: 'pm', topic: 'economy', weight: 0,
    choices: [
      { effects: [pub(200_000), eff('trust', 2), eff('cred', 2)] },
      { effects: [debt(-3), nat(0, 0, 3), eff('cred', 3), eff('trust', 2)] },
      { effects: [mood('all', 0.02), nat(3, 3, 0), eff('fiscal', 1.5), econ(0.3, 0.2)] },
      { effects: [mood(['smallbiz', 'm40'], 0.04), mood('all', 0.01), econ(0.4, 0.2), eff('fiscal', 1), debt(0.5)] },
    ],
  },
  // Once in four to seven years the markets deliver something nobody planned for (see markets.ts): a windfall, or a black swan.
  marketWindfall: {
    role: 'pm', topic: 'economy', weight: 0,
    choices: [
      { effects: [pub(300_000), eff('trust', 2), eff('cred', 2), mood(['smallbiz', 'm40'], 0.01)] },
      { effects: [debt(-4), nat(0, 0, 4), eff('cred', 3), eff('trust', 2)] },
      { effects: [mood('all', 0.025), nat(3, 3, 0), eff('fiscal', 2), econ(0.4, 0.3)] },
      { effects: [mood(['agri', 'felda', 'gig'], 0.04), mood('all', 0.01), eff('fiscal', 1), econ(0.3, 0.1)] },
    ],
  },
  blackSwan: {
    role: 'pm', topic: 'economy', weight: 0,
    choices: [
      { effects: [econ(-0.5), pub(-300_000), eff('fiscal', 2.5), debt(4), eff('stability', 3), mood('all', 0.01)] },
      { effects: [econ(-1.6), eff('fiscal', -2), mood('all', -0.035), eff('cred', 3), eff('trust', -2)] },
      { effects: [econ(-0.8), debt(6), eff('trust', -6), nat(0, 0, -3), eff('stability', 3)] },
    ],
  },
  stormWarn: {
    role: 'pm', topic: 'economy', weight: 1, yearly: 27, chance: 0.3,
    choices: [
      { effects: [eff('fiscal', -1), mood('all', -0.01), eff('cred', 1)], then: { event: 'dip', after: 9 } },
      { effects: [mood('all', 0.006)], then: { event: 'crash', after: 9 } },
      { effects: [debt(2), nat(0, 0, 2), eff('cred', 1)], then: { event: 'dip', after: 9 } },
    ],
  },
  dip: {
    role: 'pm', topic: 'economy', weight: 0,
    choices: [
      { effects: [econ(-0.3), pub(-80_000), eff('fiscal', 1), mood('all', 0.01), eff('stability', 2)] },
      { effects: [econ(-0.8), eff('cred', 2), eff('trust', 1), mood('all', -0.01)] },
    ],
  },
  crash: {
    role: 'pm', topic: 'economy', weight: 0,
    choices: [
      { effects: [econ(-0.8), pub(-200_000), eff('fiscal', 2.5), debt(3), eff('stability', 2)] },
      { effects: [econ(-1.8), eff('fiscal', -1.5), mood('all', -0.03), eff('cred', 2), eff('trust', -2)] },
      { effects: [econ(-1), debt(5), eff('trust', -6), nat(0, 0, -3), eff('stability', 3)] },
    ],
  },
};
