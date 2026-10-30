import type { BlocId } from '../types';
import type { Effect, EventDef } from './events';
import { ONLINE } from './netizens';

const eff = (t: 'cred' | 'unity' | 'trust' | 'funds', n: number): Effect => ({ t, n });
const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const net = (n: number): Effect => ({ t: 'net', n });

/**
 * Seven short surprises from the road between elections: a leaked recording, a rally in the rain, a rival's walkout. Each has
 * a safe answer, a bold one that is a gamble, and a cheap one that costs something else.
 */
export const TRAIL_EVENTS: Record<string, EventDef> = {
  leakedVoiceNote: {
    role: 'any', topic: 'trail', weight: 1,
    choices: [
      { effects: [], gamble: { chance: 'cred', win: [eff('cred', 2), net(6)], lose: [eff('cred', -3), net(-6)] } },
      { effects: [eff('cred', -1), eff('unity', 1)] },
      { effects: [eff('trust', 1), mood(ONLINE, -0.01)] },
    ],
  },
  rainyRally: {
    role: 'any', topic: 'trail', weight: 1,
    choices: [
      { effects: [eff('funds', -60_000), eff('cred', 1), mood('all', 0.008)] },
      { effects: [], gamble: { chance: 0.5, win: [mood('all', 0.02), net(5)], lose: [eff('cred', -2), mood('all', -0.006)] } },
      { effects: [eff('unity', -1)] },
    ],
  },
  rivalWalkout: {
    role: 'any', topic: 'trail', weight: 1,
    choices: [
      { effects: [eff('cred', 2), eff('unity', 1)] },
      { effects: [], gamble: { chance: 0.45, win: [eff('cred', 3), mood('all', 0.012)], lose: [eff('trust', -3), eff('cred', -2)] } },
      { effects: [eff('cred', -1)] },
    ],
  },
  youngVolunteers: {
    role: 'any', topic: 'trail', weight: 1,
    choices: [
      { effects: [eff('funds', -40_000), eff('unity', 2), mood(ONLINE, 0.02)] },
      { effects: [eff('unity', 1)] },
      { effects: [eff('unity', -2), mood(ONLINE, -0.012)] },
    ],
  },
  surveyFlash: {
    role: 'any', topic: 'trail', weight: 1,
    choices: [
      { effects: [eff('trust', 2)] },
      { effects: [], gamble: { chance: 0.5, win: [mood('all', 0.015), net(4)], lose: [eff('cred', -3), net(-5)] } },
      { effects: [] },
    ],
  },
  widowsPetition: {
    role: 'any', topic: 'trail', weight: 1,
    choices: [
      { effects: [eff('funds', -80_000), eff('trust', 3), mood('all', 0.008)] },
      { effects: [eff('cred', 1), eff('trust', 1)] },
      { effects: [eff('trust', -2), net(-4)] },
    ],
  },
  midnightRoadshow: {
    role: 'any', topic: 'trail', weight: 1,
    choices: [
      { effects: [eff('funds', -50_000), mood('all', 0.01), eff('unity', 1)] },
      { effects: [], gamble: { chance: 0.55, win: [mood('all', 0.022), eff('cred', 1)], lose: [eff('unity', -3), eff('cred', -1)] } },
      { effects: [] },
    ],
  },
};
