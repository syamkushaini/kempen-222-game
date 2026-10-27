import type { Effect, EventDef } from './events';

const eff = (t: 'cred' | 'unity' | 'trust', n: number): Effect => ({ t, n });
const graft = (n: number): Effect => ({ t: 'graft', n });
const mood = (n: number): Effect => ({ t: 'mood', blocs: 'all', n });
const net = (n: number): Effect => ({ t: 'net', n });
const note = (tag: string, text: string): Effect => ({ t: 'chronicle', tag, note: text });

/**
 * Two small dilemmas whose choice is written into the Campaign Chronicle (see chronicle.ts) rather than settled on the spot: what the
 * player did with the developer's envelope, and what they promised about subsidies, each catch up with them later, win or lose.
 */
export const CHRONICLE_EVENTS: Record<string, EventDef> = {
  envelopeOffer: {
    role: 'any', topic: 'chronicle', weight: 3,
    choices: [
      { effects: [graft(5), note('tookEnvelope', 'Took a developer’s envelope for a land-use favour')] },
      { effects: [eff('cred', 2), eff('unity', -2), note('refusedEnvelope', 'Refused the envelope and said so, loudly')] },
      { effects: [] },
    ],
  },
  envelopeReturns: {
    role: 'any', topic: 'chronicle', weight: 2, times: 1,
    needs: { chronicle: 'tookEnvelope' },
    choices: [
      { effects: [eff('cred', -4), eff('trust', -2), graft(-8)] },
      { effects: [], gamble: { chance: 0.4, win: [net(4)], lose: [eff('cred', -8), eff('trust', -4), net(-10)] } },
    ],
  },
  subsidyPledge: {
    role: 'any', topic: 'chronicle', weight: 3,
    choices: [
      { effects: [mood(0.01), eff('unity', 1), note('overpromisedSubsidy', 'Promised to freeze fuel prices for the whole term')] },
      { effects: [eff('cred', 2), mood(0.003)] },
    ],
  },
  subsidyPriceShock: {
    role: 'any', topic: 'chronicle', weight: 2, times: 1,
    needs: { chronicle: 'overpromisedSubsidy' },
    choices: [
      { effects: [eff('cred', -3), mood(-0.01), net(-6)] },
      { effects: [eff('trust', 3), eff('cred', -1), mood(-0.004)] },
    ],
  },
};
