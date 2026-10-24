import type { Effect, EventDef } from './events';

const graft = (n: number): Effect => ({ t: 'graft', n });
const eff = (t: 'cred' | 'unity' | 'trust' | 'funds', n: number): Effect => ({ t, n });
const net = (n: number): Effect => ({ t: 'net', n });

/**
 * The scandals that the corruption meter brings (see graft.ts). None comes by chance: `graftWeek` puts one on the desk when the meter is high
 * enough for it, from the level at which each is possible (a whisper at 'shady', a recording at 'scandalous', the agency at 'notorious').
 * Each can be answered for free; coming clean is the way down, and it is never painless.
 */
export const GRAFT_EVENTS: Record<string, EventDef> = {
  graftTip: {
    role: 'any', topic: 'scandal', weight: 0, times: 2,
    choices: [
      { effects: [graft(-6), eff('unity', -2), eff('cred', 1)] },
      { effects: [], gamble: { chance: 'cred', win: [net(4)], lose: [graft(6), eff('cred', -4), net(-8)] } },
      { effects: [graft(3), net(-4)] },
    ],
  },
  graftLeak: {
    role: 'any', topic: 'scandal', weight: 0, times: 2,
    choices: [
      { effects: [], gamble: { chance: 0.45, win: [net(4)], lose: [graft(6), eff('cred', -6), net(-12), eff('unity', -3)] } },
      { effects: [eff('cred', 1), graft(-8), net(-4), eff('unity', -2)] },
      { effects: [eff('unity', -4), graft(-5), eff('cred', -2)] },
    ],
  },
  graftProbe: {
    role: 'any', topic: 'scandal', weight: 0, times: 2,
    choices: [
      { effects: [graft(-15), eff('unity', -3), eff('cred', 2)] },
      { effects: [eff('funds', -200_000), graft(-6), eff('cred', -1)] },
      { effects: [graft(6), eff('cred', -4), eff('trust', -3), net(-6)] },
    ],
  },
};
