import type { World } from '../election';
import type { ActionId, Campaign } from './types';
import { stateOf } from './agenda';

// The weather decides who comes to a rally. Each state has its own week: usually fair, sometimes rain, now and then a flood, more
// often on the east coast if the election has fallen in the monsoon. What is done outdoors suffers for it; what is done indoors or on
// a phone does not.

export type Weather = 'fair' | 'rain' | 'flood';
/** What is done outdoors, and so is at the mercy of the sky. */
export const OUTDOOR: readonly ActionId[] = ['ceramah', 'walkabout', 'megarally', 'charity', 'youth', 'festival', 'local', 'canvass'];
/** How much of an outdoor action's effect is left in each weather. */
export const WEATHER_EFFECT: Record<Weather, number> = { fair: 1, rain: 0.75, flood: 0.45 };
export const WEATHER_CHANCE = { rain: 0.2, flood: 0.04, monsoonRain: 0.18, monsoonFlood: 0.1 };
const EAST_COAST = ['kelantan', 'terengganu', 'pahang'];

/** Whether this campaign falls in the monsoon: three in ten do. */
export const inMonsoon = (c: Campaign): boolean => (c.seed >>> 0) % 10 < 3;

const hash = (...n: (number | string)[]): number => {
  let h = 2166136261;
  for (const x of n) for (const ch of String(x)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10_000) / 10_000;
};

/** The weather in a state this week. The same for everyone, and the same every time it is looked at. */
export function weatherIn(world: World, c: Campaign, state: string): Weather {
  const place = stateOf(world) ?? state;
  const east = EAST_COAST.includes(place) && inMonsoon(c);
  const roll = hash(c.seed, c.week, place);
  const flood = WEATHER_CHANCE.flood + (east ? WEATHER_CHANCE.monsoonFlood : 0);
  const rain = WEATHER_CHANCE.rain + (east ? WEATHER_CHANCE.monsoonRain : 0);
  return roll < flood ? 'flood' : roll < flood + rain ? 'rain' : 'fair';
}

/** How much of an action's effect the weather leaves it in the state it is done in. */
export const weatherFactor = (world: World, c: Campaign, id: ActionId, state: string | null | undefined): number =>
  state && OUTDOOR.includes(id) ? WEATHER_EFFECT[weatherIn(world, c, state)] : 1;
