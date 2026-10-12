import type { BlocId } from '../types';
import type { Effect, EventDef } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'cred' | 'stability' | 'trust' | 'unity', n: number): Effect => ({ t, n });
const sack: Effect = { t: 'minister', act: 'sack' };
const keep: Effect = { t: 'minister', act: 'keep' };

/**
 * How a decision about a minister under fire comes back. What the leader did on the day (sacked them, stood by them, suspended them) decides
 * which of three later stories they face, so the decision has a sequel and not only an immediate price.
 */
export const FOLLOW_UPS: Record<string, Record<number, { event: string; after: number }>> = {
  ministerScandal: { 0: { event: 'ministerSacked', after: 10 }, 1: { event: 'ministerReview', after: 12 }, 2: { event: 'ministerVerdict', after: 9 } },
};

export const FOLLOW_EVENTS: Record<string, EventDef> = {
  ministerSacked: {
    role: 'gov', topic: 'scandal', weight: 0,
    choices: [
      { effects: [eff('unity', -1), mood('all', -0.004)] },
      { effects: [eff('trust', -3), eff('unity', 2), eff('stability', 1)] },
      { effects: [], gamble: { chance: 'cred', win: [eff('cred', 2), eff('trust', 1)], lose: [eff('cred', -3), eff('stability', -3)] } },
    ],
  },
  ministerReview: {
    role: 'gov', topic: 'scandal', weight: 0,
    choices: [
      { effects: [], gamble: { chance: 0.45, win: [eff('cred', 1), eff('stability', 2)], lose: [sack, eff('cred', -5), eff('trust', -4), eff('stability', -3)] } },
      { effects: [sack, eff('cred', -2), eff('unity', -1)] },
      { effects: [eff('trust', 2), eff('cred', 1), eff('stability', -1)] },
    ],
  },
  ministerVerdict: {
    role: 'gov', topic: 'scandal', weight: 0,
    choices: [
      { effects: [], gamble: { chance: 0.6, win: [keep, eff('cred', 2)], lose: [sack, eff('cred', -3), eff('trust', -3)] } },
      { effects: [sack, eff('cred', 1), eff('unity', -1)] },
      { effects: [eff('unity', -1), eff('stability', 1)] },
    ],
  },
};
