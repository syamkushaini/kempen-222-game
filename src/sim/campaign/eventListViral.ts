import type { BlocId } from '../types';
import type { Effect, EventDef } from './events';
import { ONLINE } from './netizens';

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'cred' | 'unity' | 'trust', n: number): Effect => ({ t, n });

/**
 * Things that go viral and have nothing to do with politics: a cat, a durian, a football match. They come to anyone, and each is a
 * chance to be seen to be human, or to be seen trying. Ride it and it may take off or it may look desperate; say something sincere
 * and the netizens shrug kindly; ignore it and nobody minds, much.
 */
const viral = (heat: number): EventDef => ({
  role: 'any', topic: 'viral', weight: 1.2, times: 2,
  choices: [
    { effects: [], gamble: { chance: 0.55, win: [mood(ONLINE, heat), eff('cred', 1)], lose: [mood(ONLINE, -heat * 0.7), eff('cred', -1)] } },
    { effects: [mood(ONLINE, heat * 0.35)] },
    { effects: [] },
  ],
});

export const VIRAL_EVENTS: Record<string, EventDef> = {
  viralCat: viral(0.03),
  viralDurian: viral(0.03),
  viralFootball: viral(0.035),
  viralKopitiam: viral(0.03),
  viralConcert: viral(0.035),
  viralStudent: viral(0.03),
  viralRaya: viral(0.03),
  viralPothole: viral(0.025),
};
