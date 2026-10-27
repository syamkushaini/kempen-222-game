import type { Choice, Effect, EventDef } from './events';
import type { StoryStyle } from './types';

// The beats of the three storylines (see storyline.ts). Each is an ordinary decision with three answers, raised by the arc and never by chance
// (weight 0). An answer leaves a flag, `sb:<beat>:<n>`, which is how the arc knows a chapter is over and which way it went. Every beat leaves one
// answer that costs no money, and none of them needs a particular seat to be sat in: a story is told to whoever is playing it. The people in it are
// invented, and the same few come back in every arc: Puan Sri Mariam (the party's eldest elder), Farid (the chief of staff), Dato' Lazim (who
// pays for things) and Kak Dewi (an editor).

const eff = (t: 'unity' | 'funds' | 'cred' | 'dossier', n: number): Effect => ({ t, n });
const mood = (blocs: 'all' | Extract<Effect, { t: 'mood' }>['blocs'], n: number): Effect => ({ t: 'mood', blocs, n });
const graft = (n: number): Effect => ({ t: 'graft', n });
const rel = (who: 'pm' | 'partners', n: number): Effect => ({ t: 'relation', who, n });
const gamble = (chance: 'cred' | 'unity', win: Effect[], lose: Effect[], effects: Effect[] = []): Choice => ({ effects, gamble: { chance, win, lose } });

const beat = (...choices: Choice[]): EventDef => ({ role: 'any', weight: 0, topic: 'story', choices });

/** How each answer of each beat reads: by the book, by the gamble, or by the back door. */
export const BEAT_STYLES: Record<string, [StoryStyle, StoryStyle, StoryStyle]> = {
  natInheritance: ['steady', 'shady', 'bold'],
  natFirstCrack: ['steady', 'bold', 'shady'],
  natPaperTrail: ['steady', 'bold', 'shady'],
  natAfterGov: ['steady', 'shady', 'bold'],
  natAfterOpp: ['steady', 'bold', 'shady'],
  natLastPage: ['steady', 'bold', 'shady'],
  stateKeys: ['steady', 'shady', 'bold'],
  stateHandshake: ['steady', 'shady', 'bold'],
  stateTrade: ['steady', 'shady', 'bold'],
  stateAfterGov: ['steady', 'bold', 'shady'],
  stateAfterOpp: ['steady', 'bold', 'shady'],
  stateKeeper: ['steady', 'bold', 'shady'],
  foundHall: ['steady', 'shady', 'bold'],
  foundOffer: ['steady', 'shady', 'bold'],
  foundCheque: ['steady', 'shady', 'bold'],
  foundBreakthrough: ['steady', 'shady', 'bold'],
  foundWall: ['steady', 'shady', 'bold'],
  foundGovernment: ['steady', 'bold', 'shady'],
};

/** The beats only the country's story tells, and only a state's. The founded story is told in either. */
export const NAT_BEATS = ['natInheritance', 'natFirstCrack', 'natPaperTrail', 'natAfterGov', 'natAfterOpp', 'natLastPage'];
export const STATE_BEATS = ['stateKeys', 'stateHandshake', 'stateTrade', 'stateAfterGov', 'stateAfterOpp', 'stateKeeper'];
export const FOUNDED_BEATS = ['foundHall', 'foundOffer', 'foundCheque', 'foundBreakthrough', 'foundWall', 'foundGovernment'];

const RAW: Record<string, EventDef> = {
  // ---- the country ----
  natInheritance: beat(
    { effects: [eff('cred', 2), eff('unity', 1)] },
    { effects: [eff('funds', 80_000), eff('cred', -2), graft(6), mood(['smallbiz'], 0.02)] },
    gamble('cred', [eff('unity', 3), eff('cred', 1)], [eff('unity', -3), eff('cred', -1)], [eff('funds', -20_000)]),
  ),
  natFirstCrack: beat(
    { effects: [eff('cred', 2), eff('unity', 1)] },
    { effects: [eff('funds', -30_000), eff('dossier', 6), eff('unity', -2)] },
    { effects: [eff('funds', 40_000), eff('cred', -2), graft(5), eff('dossier', 4)] },
  ),
  natPaperTrail: beat(
    { effects: [eff('cred', 3), graft(-8), eff('unity', -1), mood(['civil'], 0.02)] },
    gamble('cred', [eff('cred', 2), mood(['heartland'], 0.03)], [eff('cred', -3), mood(['civil'], -0.03)]),
    { effects: [eff('funds', -40_000), graft(-4)] },
  ),
  natAfterGov: beat(
    { effects: [eff('cred', 2), eff('unity', -2)] },
    { effects: [eff('unity', 3), eff('cred', -1)] },
    gamble('unity', [eff('cred', 2), eff('unity', 1), mood(['civil'], 0.02)], [eff('unity', -3), eff('cred', -1)]),
  ),
  natAfterOpp: beat(
    { effects: [eff('cred', 2), eff('dossier', 4)] },
    { effects: [eff('funds', -30_000), eff('dossier', 6), mood(['heartland'], 0.02), eff('cred', -1)] },
    { effects: [rel('partners', 4), graft(3), eff('cred', -1), eff('unity', 1)] },
  ),
  natLastPage: beat(
    { effects: [eff('cred', 3), eff('unity', 1), mood(['civil'], 0.02)] },
    gamble('unity', [eff('cred', 2), mood('all', 0.015)], [eff('unity', -3), eff('cred', -2)]),
    { effects: [eff('funds', 60_000), eff('cred', -2), graft(6), eff('unity', 2)] },
  ),

  // ---- a state ----
  stateKeys: beat(
    { effects: [eff('cred', 2), eff('unity', 1)] },
    { effects: [eff('funds', 60_000), eff('cred', -1), graft(5), mood(['smallbiz'], 0.02)] },
    gamble('cred', [eff('cred', 2), mood(['agri', 'heartland'], 0.03)], [eff('cred', -3), eff('unity', -2)]),
  ),
  stateHandshake: beat(
    { effects: [eff('cred', 2), eff('unity', 1)] },
    { effects: [eff('funds', 70_000), eff('cred', -1), graft(2), mood(['heartland'], 0.01)] },
    gamble('cred', [eff('cred', 2), mood(['heartland'], 0.03)], [eff('cred', -2), rel('pm', -4)]),
  ),
  stateTrade: beat(
    { effects: [eff('funds', -25_000), eff('cred', 2), eff('unity', 1), mood(['heartland', 'smallbiz'], 0.02)] },
    { effects: [eff('funds', 50_000), eff('cred', -2), graft(6), mood(['smallbiz'], 0.02)] },
    gamble('unity', [eff('cred', 2), eff('unity', 2), mood(['heartland'], 0.03)], [eff('cred', -1), eff('unity', -2)]),
  ),
  stateAfterGov: beat(
    { effects: [eff('cred', 2), eff('unity', 1)] },
    gamble('unity', [eff('unity', 3), eff('cred', 1), mood(['m40'], 0.02)], [eff('unity', -4), eff('cred', -1)]),
    { effects: [eff('funds', -20_000), eff('unity', 3), eff('cred', -1), graft(4)] },
  ),
  stateAfterOpp: beat(
    { effects: [eff('cred', 2), eff('dossier', 3)] },
    { effects: [eff('funds', -20_000), eff('dossier', 5), mood(['heartland'], 0.02), eff('unity', -1)] },
    { effects: [rel('partners', 4), graft(3), eff('cred', -1), eff('unity', 1)] },
  ),
  stateKeeper: beat(
    { effects: [eff('cred', 3), eff('unity', 1)] },
    gamble('cred', [eff('cred', 2), eff('unity', 2), mood('all', 0.015)], [eff('cred', -2), eff('unity', -2)]),
    { effects: [eff('funds', 60_000), eff('cred', -2), graft(6)] },
  ),

  // ---- a party from nothing ----
  foundHall: beat(
    { effects: [eff('cred', 2), eff('unity', 3)] },
    { effects: [eff('funds', 30_000), graft(5), eff('cred', -1)] },
    gamble('cred', [mood('all', 0.012), eff('cred', 1)], [eff('cred', -1), eff('unity', -1)], [eff('funds', -30_000)]),
  ),
  foundOffer: beat(
    { effects: [eff('cred', 2), eff('unity', 2)] },
    { effects: [rel('pm', 4), eff('funds', 30_000), eff('unity', -1), eff('cred', -1)] },
    gamble('cred', [eff('cred', 3), mood(['civil'], 0.03)], [eff('cred', -2), rel('pm', -4)]),
  ),
  foundCheque: beat(
    { effects: [eff('cred', 3), graft(-3)] },
    { effects: [eff('funds', 60_000), eff('cred', -1), graft(3)] },
    gamble('unity', [eff('funds', 60_000), eff('cred', 2), eff('unity', 2)], [eff('unity', -2), eff('cred', -1)]),
  ),
  foundBreakthrough: beat(
    { effects: [eff('cred', 2), eff('unity', 1)] },
    { effects: [eff('funds', 80_000), eff('cred', -3), graft(7)] },
    gamble('cred', [eff('cred', 2), eff('unity', 2), rel('pm', 3)], [eff('unity', -2), eff('cred', -1)]),
  ),
  foundWall: beat(
    { effects: [eff('cred', 2), eff('unity', 3)] },
    { effects: [rel('pm', 3), eff('funds', 40_000), eff('cred', -2), eff('unity', -2)] },
    gamble('cred', [mood('all', 0.012), eff('cred', 1), eff('unity', 2)], [eff('unity', -2), eff('cred', -1)], [eff('funds', -25_000)]),
  ),
  foundGovernment: beat(
    { effects: [eff('cred', 3), eff('unity', 1)] },
    gamble('unity', [mood('all', 0.02), eff('cred', 1)], [eff('unity', -3), eff('cred', -2)], [eff('funds', -40_000)]),
    { effects: [eff('funds', 80_000), eff('cred', -3), graft(8)] },
  ),
};

/** Every answer leaves its mark, so that the arc can tell which way a chapter went. */
export const STORY_EVENTS: Record<string, EventDef> = Object.fromEntries(Object.entries(RAW).map(([id, def]) => [
  id,
  { ...def, choices: def.choices.map((ch, i) => ({ ...ch, effects: [...ch.effects, { t: 'flag' as const, id: `sb:${id}:${i}` }] })) },
]));
