import type { World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { type BlocId } from '../types';
import { shiftRelation } from './diplomacy';
import { pushNews } from './news';
import { isPm, lift } from './office';
import type { Campaign, Career } from './types';

// The economy is not one number. Four sectors of it have their own seasons, and each is felt by the people who live by
// it: oil by the Borneo coast and the civil service it pays for, electronics by the factory towns and the gig economy,
// tourism by the small businesses and the islands, farming by the villages. A government is credited with all of it and
// can lend one sector a hand; but it cannot lend all of them one, and a shock in one does not wait for it.

export const SECTOR_IDS = ['oil', 'electronics', 'tourism', 'farming'] as const;
export type SectorId = (typeof SECTOR_IDS)[number];

/** Who lives by each sector, and how much each of them counts towards the country's growth. */
export const SECTORS: Record<SectorId, { blocs: BlocId[]; growth: number }> = {
  oil: { blocs: ['borneo_native', 'borneo_urban', 'civil'], growth: 0.3 },
  electronics: { blocs: ['urban_b40', 'gig', 'm40'], growth: 0.35 },
  tourism: { blocs: ['smallbiz', 'borneo_urban', 'gig'], growth: 0.15 },
  farming: { blocs: ['agri', 'felda', 'heartland'], growth: 0.2 },
};

export const SECTOR = {
  /** How fast a sector goes back to the middle each week, and how much it wanders. */
  pull: 0.012, wander: 1.4,
  /** The weekly chance of a shock to some sector, and its size. */
  shock: 0.007, shockMin: 14, shockMax: 26,
  /** The mood, in logit, a sector at its best or worst gives the government among those who live by it each week; its share of growth. */
  mood: 0.0008, growth: 0.03,
  /** Help for a sector: how far it lifts it, what it costs the treasury, and the weeks before it can be given again. */
  aid: 12, fiscal: 1, every: 26,
};

export const sectorsOf = (k: Career): Record<SectorId, number> =>
  Object.fromEntries(SECTOR_IDS.map((id) => [id, k.sectors?.[id] ?? 50])) as Record<SectorId, number>;

/** A week of the sectors: each drifts, now and then one is shocked, and the government is credited with how those do who live by them. */
export function sectorsWeek(c: Campaign, rng: Rng): void {
  const k = c.career!;
  const now = sectorsOf(k);
  for (const id of SECTOR_IDS) now[id] = clamp(now[id] + (50 - now[id]) * SECTOR.pull + rng.normal(0, SECTOR.wander), 0, 100);
  if (rng.next() < SECTOR.shock) {
    const id = SECTOR_IDS[rng.int(SECTOR_IDS.length)];
    const size = SECTOR.shockMin + rng.next() * (SECTOR.shockMax - SECTOR.shockMin);
    const up = rng.next() < 0.5;
    now[id] = clamp(now[id] + (up ? size : -size), 0, 100);
    pushNews(c, { party: null, key: `news.sector.${id}.${up ? 'up' : 'down'}`, vars: {}, tone: up ? 'good' : 'bad' });
  }
  k.sectors = now;
  const g = k.government;
  let growth = 0;
  for (const id of SECTOR_IDS) {
    const d = (now[id] - 50) / 50;
    growth += SECTORS[id].growth * d;
    lift(k, g.pm, SECTORS[id].blocs, SECTOR.mood * d);
    for (const p of g.partners) lift(k, p, SECTORS[id].blocs, (SECTOR.mood * d) / 2);
  }
  k.economy.growth = clamp(k.economy.growth + SECTOR.growth * growth, -6, 9);
}

export type SectorRefusal = 'phase' | 'wait' | 'sector';

export function canAid(_world: World, c: Campaign, id: SectorId): { ok: true } | { ok: false; reason: SectorRefusal } {
  const k = c.career;
  if (!k || c.phase !== 'term' || c.inbox.length > 0 || !isPm(c)) return { ok: false, reason: 'phase' };
  if (!(SECTOR_IDS as readonly string[]).includes(id)) return { ok: false, reason: 'sector' };
  const last = k.sectorAid?.[id];
  if (last !== undefined && k.week - last < SECTOR.every) return { ok: false, reason: 'wait' };
  return { ok: true };
}

/** The head of government helps a sector: it is lifted, the treasury pays, and the others, who were not helped, notice. */
export function aidSector(world: World, c: Campaign, id: SectorId): boolean {
  if (!canAid(world, c, id).ok) return false;
  const k = c.career!;
  const now = sectorsOf(k);
  now[id] = clamp(now[id] + SECTOR.aid, 0, 100);
  k.sectors = now;
  (k.sectorAid ??= {})[id] = k.week;
  k.fiscal += SECTOR.fiscal;
  for (const p of k.government.partners) shiftRelation(c, c.player, p, 1);
  pushNews(c, { party: c.player, key: `news.sector.${id}.aid`, vars: {}, tone: 'good' });
  return true;
}
