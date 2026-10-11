import type { BlocId } from '../types';
import type { Effect, EventDef } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'cred' | 'stability' | 'trust' | 'fiscal', n: number): Effect => ({ t, n });
const nat = (health = 0, education = 0, standing = 0): Effect => ({ t: 'nation', health, education, standing });
const econ = (growth: number, inflation = 0): Effect => ({ t: 'economy', growth, inflation });
const debt = (n: number): Effect => ({ t: 'debt', n });

/**
 * The ladder of a debt that is not paid down: an alarm, then a crisis, then bankruptcy (see debt.ts). They are raised by the game
 * when the debt passes each rung, never by chance, and are put to the head of the government.
 */
export const DEBT_EVENTS: Record<string, EventDef> = {
  debtAlarm: {
    role: 'pm', topic: 'economy', weight: 0,
    choices: [
      { effects: [eff('fiscal', -2), debt(-1.5), nat(-2, -2, 3), mood('all', -0.015), eff('cred', 2)] },
      { effects: [debt(-3), econ(-0.2), nat(0, 0, -2), eff('trust', -3)] },
      { effects: [], gamble: { chance: 0.4, win: [eff('cred', 1)], lose: [debt(2), econ(-0.5), nat(0, 0, -6), eff('cred', -3)] } },
    ],
  },
  debtCrisis: {
    role: 'pm', topic: 'economy', weight: 0,
    choices: [
      { effects: [{ t: 'austerity' }, debt(-8), econ(-1), nat(-4, -4, 5), eff('cred', 2), eff('trust', -6), eff('stability', -6), mood('all', -0.03)] },
      { effects: [debt(-15), econ(-1.5), nat(0, 0, -20), eff('cred', -10), eff('trust', -8), mood('all', -0.04)] },
      { effects: [], gamble: { chance: 0.35, win: [nat(0, 0, -5), eff('cred', -2)], lose: [{ t: 'bankrupt' }] } },
    ],
  },
};
