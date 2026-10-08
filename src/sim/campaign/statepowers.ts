import type { World } from '../election';
import { clamp } from '../math';
import { scaled } from './actions';
import { shiftNation } from './nation';
import { pushNews } from './news';
import { isPm, lift } from './office';
import type { Campaign } from './types';
import type { BlocId } from '../types';

// The Menteri Besar or the Chief Minister has what the Federation left to the states: the land, the forests and the state’s own
// development money. Each can be used to pay for the government and for the party, and each leaves a trail and a grievance.
// Only in a career in one state.

export const POWER_IDS = ['land', 'timber', 'grants'] as const;
export type PowerId = (typeof POWER_IDS)[number];

const VILLAGE: BlocId[] = ['heartland', 'felda', 'agri', 'borneo_native'];
export const POWERS: Record<PowerId, { every: number; money: number; trail: number; credibility: number; mood: [BlocId[], number][] }> = {
  // Land released for development: the state is paid, the traders are pleased, and the villages remember whose land it was.
  land: { every: 26, money: 150_000, trail: 1, credibility: -2, mood: [[['smallbiz', 'm40'], 0.02], [VILLAGE, -0.02]] },
  // Timber concessions: money, and a forest, and the cities and the interior do not like the sound of it.
  timber: { every: 26, money: 120_000, trail: 0.5, credibility: -1, mood: [[['m40', 'urban_lib', 'borneo_native'], -0.02]] },
  // Development money to the constituencies: it costs, and the villages are glad of it.
  grants: { every: 13, money: -100_000, trail: 0, credibility: 1, mood: [[VILLAGE, 0.03]] },
};

export const inStateCareer = (c: Campaign): boolean => c.scenario.startsWith('career:');
export const powerWait = (c: Campaign, id: PowerId): number => {
  const last = c.career?.powers?.[id];
  return last === undefined ? 0 : Math.max(0, last + POWERS[id].every - c.career!.week);
};

export type PowerRefusal = 'phase' | 'wait' | 'funds';
export function canUse(world: World, c: Campaign, id: PowerId): { ok: true } | { ok: false; reason: PowerRefusal } {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k || !pc || c.phase !== 'term' || c.inbox.length > 0 || !inStateCareer(c) || !isPm(c)) return { ok: false, reason: 'phase' };
  if (powerWait(c, id) > 0) return { ok: false, reason: 'wait' };
  if (POWERS[id].money < 0 && pc.funds < scaled(world, -POWERS[id].money)) return { ok: false, reason: 'funds' };
  return { ok: true };
}

/** Uses a power of the state: money in or out, a mood among the groups it touches, a trail for the agency to follow, and a mark on the leader’s name. */
export function usePower(world: World, c: Campaign, id: PowerId): boolean {
  if (!canUse(world, c, id).ok) return false;
  const k = c.career!;
  const def = POWERS[id];
  const pc = c.parties[c.player]!;
  pc.funds = Math.max(0, pc.funds + Math.sign(def.money) * scaled(world, Math.abs(def.money)));
  for (const [blocs, n] of def.mood) lift(k, c.player, blocs, n);
  if (def.trail > 0) k.trail = (k.trail ?? 0) + def.trail;
  k.credibility = clamp(k.credibility + def.credibility, 0, 100);
  if (id === 'timber') shiftNation(k, { health: -1 });
  (k.powers ??= {})[id] = k.week;
  pushNews(c, { party: c.player, key: `news.power.${id}`, vars: {}, tone: def.credibility < 0 ? 'bad' : 'good' });
  return true;
}
