import type { World } from '../election';
import type { RegionId, StateId } from '../types';

/** Travel zones. Moving within a zone is free; crossing zones costs time. */
export type Zone = 'north' | 'east' | 'central' | 'south' | 'sabah' | 'sarawak';

export const ZONE: Record<StateId, Zone> = {
  perlis: 'north', kedah: 'north', penang: 'north', perak: 'north',
  kelantan: 'east', terengganu: 'east', pahang: 'east',
  selangor: 'central', kl: 'central', putrajaya: 'central', nsembilan: 'central', melaka: 'central',
  johor: 'south',
  sabah: 'sabah', labuan: 'sabah',
  sarawak: 'sarawak',
};

const isBorneo = (z: string) => z === 'sabah' || z === 'sarawak';

/** Days and money to move the leader between two regions. Free where the contest has no travel zones. */
export function travelCost(world: World, from: RegionId, to: RegionId): { days: number; money: number } {
  const zones = world.rules.zones;
  const a = zones?.[from], b = zones?.[to];
  if (!a || !b || a === b) return { days: 0, money: 0 };
  if (isBorneo(a) !== isBorneo(b)) return { days: 1, money: 25_000 };  // flight across the South China Sea
  if (isBorneo(a)) return { days: 0.5, money: 12_000 };                 // Sabah <-> Sarawak
  return { days: 0.5, money: 3_000 };                                   // by road on the peninsula
}
