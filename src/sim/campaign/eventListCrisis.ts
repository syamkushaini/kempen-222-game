import type { BlocId } from '../types';
import type { Effect, EventDef } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'cred' | 'stability' | 'trust' | 'unity', n: number): Effect => ({ t, n });
const nat = (health = 0, education = 0, standing = 0): Effect => ({ t: 'nation', health, education, standing });
const net = (n: number): Effect => ({ t: 'net', n });

/**
 * The constitutional crisis (see crisis.ts), in three acts: the deadlock, the court, and the settlement. Every party is in it, and the
 * Palace is a place that decisions are awaited from, with respect, and is never made the villain. What the player chooses is how to
 * behave while the question is open; the answer is not theirs.
 */
export const CRISIS_EVENTS: Record<string, EventDef> = {
  constCrisis: {
    role: 'any', topic: 'crisis', weight: 0, times: 3,
    choices: [
      { effects: [eff('stability', -3), nat(0, 0, 2), eff('cred', 2), mood('all', 0.004)], then: { event: 'constCourt', after: 5 } },
      { effects: [eff('stability', -1), eff('unity', 3), mood('all', -0.006), net(6)], gamble: { chance: 0.5, win: [eff('stability', 4), eff('cred', 1)], lose: [eff('stability', -6), eff('cred', -3), net(-10), nat(0, 0, -3)] }, then: { event: 'constCourt', after: 5 } },
      { effects: [eff('stability', -4), mood('all', -0.012), nat(0, 0, -2), net(-6)], then: { event: 'constCourt', after: 5 } },
    ],
  },
  constCourt: {
    role: 'any', topic: 'crisis', weight: 0, times: 3,
    choices: [
      { effects: [eff('cred', 2), eff('trust', 2), eff('stability', 1)], then: { event: 'constSettled', after: 5 } },
      { effects: [eff('stability', -3), eff('cred', -1), net(4)], then: { event: 'constSettled', after: 5 } },
      { effects: [mood('all', -0.012), eff('unity', 3), eff('trust', -3), net(8)], then: { event: 'constSettled', after: 5 } },
    ],
  },
  constSettled: {
    role: 'any', topic: 'crisis', weight: 0, times: 3,
    choices: [
      { effects: [eff('stability', 4), nat(0, 0, 3), eff('cred', 2), mood('all', 0.01)] },
      { effects: [eff('unity', 3), eff('stability', 2), nat(0, 0, 1)] },
      { effects: [eff('stability', -2), eff('cred', -2), net(-6)] },
    ],
  },
};
