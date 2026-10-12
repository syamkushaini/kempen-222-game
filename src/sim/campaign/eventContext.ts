import { clamp } from '../math';
import { nationOf } from './nation';
import type { Campaign } from './types';

// Events are gated by `needs` (it cannot happen unless...). This is the softer half: among the events that could happen, the ones that
// fit what is going on are likelier, and the ones that do not are rarer. A kind of trouble is likelier when its cause is there (prices
// rising, a party coming apart, a shaky government, a poor health service) and rarer when it is not. Nothing here forbids an event.

/** The most a kind of trouble is made likelier, and the least. */
export const PRESSURE = { max: 2.6, min: 0.5 } as const;

/** How much likelier (or rarer) a kind of event is, given the state of the game: 1 when nothing in particular speaks for or against it. */
export function pressure(c: Campaign, topic: string): number {
  const k = c.career;
  const me = c.parties[c.player];
  if (!k || !me) return 1;
  const e = k.economy;
  const nation = nationOf(k);
  let x = 1;
  switch (topic) {
    case 'cost': x = 1 + clamp((e.inflation - 2.8) / 1.5, -0.5, 1.5); break;
    case 'economy': x = 1 + clamp((4 - e.growth) / 2, -0.4, 1) + clamp((e.debt - 65) / 25, 0, 1); break;
    case 'party': x = 1 + clamp((70 - me.unity) / 25, -0.4, 1.5); break;
    case 'scandal': x = 1 + clamp((60 - k.government.trust) / 40, -0.4, 1) + clamp((55 - k.credibility) / 50, 0, 0.6); break;
    case 'house': case 'coalition': x = 1 + clamp((60 - k.government.stability) / 40, -0.4, 1.2); break;
    case 'media': x = 1 + clamp((65 - k.credibility) / 50, -0.3, 0.6); break;
    case 'nation': x = 1 + clamp((55 - Math.min(nation.health, nation.education)) / 30, -0.4, 1); break;
    case 'abroad': x = 1 + clamp((55 - nation.standing) / 30, -0.4, 1); break;
    default: x = 1;
  }
  return clamp(x, PRESSURE.min, PRESSURE.max);
}

/** Weeks before the same event can be drawn again by chance in one term, and how much rarer it is for a while after that. */
export const ID_BLOCK = 12;
export const ID_COOL = 52;
export const ID_COOL_FACTOR = 0.2;

/** How the recent past of one event bears on its chance now: never right after it came, rarer for a year, plain after that. */
export function recency(c: Campaign, id: string): number {
  const k = c.career;
  const last = k?.eventWeeks?.[id];
  if (!k || last === undefined) return 1;
  const since = k.week - last;
  return since < ID_BLOCK ? 0 : since < ID_COOL ? ID_COOL_FACTOR : 1;
}
