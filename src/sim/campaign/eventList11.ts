import type { BlocId } from '../types';
import type { Effect, EventDef } from './events';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'unity' | 'funds' | 'cred' | 'machinery', n: number): Effect => ({ t, n });

/**
 * Four decisions that come to a party of any size: a donor with strings attached, volunteers who do not turn up, a mistake in the
 * manifesto, and a district asking where its money is. Written for the player's own list of dilemmas; the numbers are theirs
 * (a point of credibility is a point; a point of "momentum" is four thousandths of every bloc's mood; "capacity" is the branches).
 * Text lives in `src/i18n/events15.ts`. Every person and company in them is invented.
 */
export const DESK_EVENTS: Record<string, EventDef> = {
  // A rich supporter, and what he expects. Refusing costs the money that was never yours, so it takes nothing from the purse.
  donorStrings: {
    role: 'any', topic: 'scandal', weight: 3,
    choices: [
      { effects: [eff('cred', 3)] },
      { effects: [eff('funds', 100_000), eff('cred', -4)], gamble: { chance: 0.6, win: [], lose: [eff('cred', -6), mood('all', -0.02)] } },
      { effects: [eff('cred', 2)], gamble: { chance: 0.6, win: [eff('funds', 100_000), mood('all', 0.008)], lose: [] } },
    ],
  },
  missingVolunteers: {
    role: 'any', topic: 'party', weight: 3, needs: { late: true },
    choices: [
      { effects: [eff('funds', -15_000), eff('machinery', 2)] },
      { effects: [], gamble: { chance: 0.5, win: [eff('machinery', 2)], lose: [eff('unity', -3)] } },
      { effects: [mood('all', -0.004), eff('unity', 1)] },
    ],
  },
  manifestoMistake: {
    role: 'any', topic: 'campaign', weight: 3, needs: { late: true },
    choices: [
      { effects: [eff('cred', 2), mood('all', -0.004)] },
      { effects: [], gamble: { chance: 0.6, win: [], lose: [eff('cred', -4)] } },
      { effects: [eff('cred', -2), eff('unity', -2)] },
    ],
  },
  // Only a party across the floor can blame "the incumbent", and only one that hopes to win can promise to deliver after winning.
  manaPeruntukan: {
    role: 'opp', seats: ['lead', 'opp'], topic: 'local', weight: 3,
    choices: [
      { effects: [eff('cred', 2)] },
      { effects: [mood('all', 0.008)], gamble: { chance: 'cred', win: [], lose: [eff('cred', -2)] } },
      { effects: [mood('all', 0.004)], gamble: { chance: 0.5, win: [], lose: [eff('cred', -2)] } },
    ],
  },
};
