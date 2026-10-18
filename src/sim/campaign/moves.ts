import type { World } from '../election';
import { Rng } from '../rng';
import type { BlocId } from '../types';
import { isFederal } from './defence';
import { applyEffects, type Effect } from './events';
import { pushNews } from './news';
import { ONLINE } from './netizens';
import { inGov, isPm } from './office';
import type { Campaign } from './types';

// The leader's own moves: things a head of government (or any leader) can do that are not in the budget or the House. Each has a price,
// and each can be made again only after a rest of ten to fifteen weeks. Every one buys something now with something later.

export const MOVE_IDS = ['palace', 'un', 'neighbour', 'influencer', 'closed', 'quiet'] as const;
export type MoveId = (typeof MOVE_IDS)[number];

export const REST = { min: 10, max: 15 };

const mood = (blocs: BlocId[] | 'all', n: number): Effect => ({ t: 'mood', blocs, n });
const eff = (t: 'cred' | 'stability' | 'trust' | 'unity', n: number): Effect => ({ t, n });
const nat = (health = 0, education = 0, standing = 0): Effect => ({ t: 'nation', health, education, standing });
const net = (n: number): Effect => ({ t: 'net', n });

export interface MoveDef {
  /** Who may make it: the head of government, anyone in government, or any leader. */
  who: 'pm' | 'gov' | 'any';
  /** A move the federation alone can make. */
  federal?: true;
  /** What it does for sure. */
  effects: Effect[];
  /** What may go wrong or right on top: the chance of it coming off. */
  gamble?: { chance: number; win: Effect[]; lose: Effect[] };
}

export const MOVES: Record<MoveId, MoveDef> = {
  // An audience at the Palace: the throne is a place of respect, and respect is what is gained and what is owed. Nothing is asked of it.
  palace: { who: 'gov', federal: true, effects: [eff('stability', 4), mood(['heartland', 'felda', 'seniors'], 0.012), mood(['urban_lib'], -0.008), eff('cred', -1)] },
  // A speech at the UN: standing abroad, a polite audience at home, and a week of the leader's time and the country's money.
  un: { who: 'pm', federal: true, effects: [nat(0, 0, 4), mood(['urban_lib', 'm40'], 0.015), mood(['heartland'], -0.006), { t: 'public', n: -120_000 }] },
  // Confront a neighbour over an old claim: the flag is a good distraction, and a cheap one until the neighbour answers.
  neighbour: { who: 'pm', federal: true, effects: [mood('all', 0.012), mood(['heartland', 'felda', 'seniors'], 0.02), net(5), nat(0, 0, -2)], gamble: { chance: 0.6, win: [eff('stability', 2)], lose: [nat(0, 0, -4), { t: 'economy', growth: -0.3 }, eff('cred', -2), net(-8)] } },
  // A collaboration with an influencer, chosen by a producer who has never met you.
  influencer: { who: 'any', effects: [], gamble: { chance: 0.55, win: [mood(ONLINE, 0.04), net(12), eff('cred', 1)], lose: [mood(ONLINE, -0.035), net(-14), eff('cred', -2)] } },
  // A closed-door meeting with allies and the party's members: it settles people, and the room has a phone in it.
  closed: { who: 'any', effects: [eff('unity', 4), eff('stability', 3), eff('trust', -2)], gamble: { chance: 0.75, win: [], lose: [eff('unity', -3), eff('cred', -2), net(-8)] } },
  // A quiet word with reporters and commentators: fewer bad headlines this month, and a reputation for it.
  quiet: { who: 'gov', effects: [eff('stability', 3), mood('all', 0.008), eff('trust', -5), eff('cred', -2), net(-12)], gamble: { chance: 0.7, win: [], lose: [mood('all', -0.03), net(-15), eff('unity', -2)] } },
};

export type MoveRefusal = 'phase' | 'role' | 'federal' | 'rest';

export function moveRefusal(c: Campaign, id: MoveId): MoveRefusal | null {
  const k = c.career;
  if (!k || c.phase !== 'term') return 'phase';
  const def = MOVES[id];
  if (def.federal && !isFederal(c.scenario)) return 'federal';
  if (def.who === 'pm' && !isPm(c)) return 'role';
  if (def.who === 'gov' && !inGov(c, c.player)) return 'role';
  if ((k.moves?.[id] ?? 0) > k.week) return 'rest';
  return null;
}

export const moveWait = (c: Campaign, id: MoveId): number => Math.max(0, (c.career?.moves?.[id] ?? 0) - (c.career?.week ?? 0));

/** Makes a move. The rest it must have afterwards is ten to fifteen weeks, drawn when it is made. */
export function makeMove(world: World, c: Campaign, id: MoveId): boolean {
  if (moveRefusal(c, id)) return false;
  const k = c.career!;
  const def = MOVES[id];
  const rng = new Rng((c.rng ^ 0xa0b1c) + k.week * 17 + MOVE_IDS.indexOf(id));
  c.rng = rng.state;
  applyEffects(world, c, def.effects);
  let worked = true;
  if (def.gamble) {
    worked = rng.next() < def.gamble.chance;
    applyEffects(world, c, worked ? def.gamble.win : def.gamble.lose);
  }
  (k.moves ??= {})[id] = k.week + REST.min + Math.floor(rng.next() * (REST.max - REST.min + 1));
  pushNews(c, { party: c.player, key: `news.move.${id}.${worked ? 'ok' : 'bad'}`, vars: {}, tone: worked ? 'good' : 'bad' });
  return true;
}
