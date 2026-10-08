import { majorityLine, type World } from '../election';
import { clamp } from '../math';
import { scaled } from './actions';
import { WANTS } from './cast';
import { houseTally } from './contests';
import { relation, shiftRelation } from './diplomacy';
import { pushNews, ref } from './news';
import { isPm } from './office';
import { PARTY_IDS, type PartyId } from '../types';

const OTH_INDEX = PARTY_IDS.indexOf('oth');
import type { Campaign, DemandId } from './types';

// A government need not be a coalition. A party that will not sit in the cabinet may still keep it in office from outside,
// for a price and for a year at a time: it votes with the government on confidence and on the budget, and the
// government's life rests on a deal that comes up for review. Nothing is signed that cannot be unsigned.

/** How long a deal runs before it is reviewed. */
export const SUPPLY_WEEKS = 52;
/** The most parties the government can have behind it in this way. */
export const MAX_SUPPLY = 2;
/** What a cash price is, at general-election scale. */
export const SUPPLY_CASH = 200_000;
/** How warm the other party's leader must be towards the government for it to listen. */
export const SUPPLY_WARMTH = 20;
/** A government with a majority this comfortable has no need of one. */
export const SUPPLY_COMFORT = 8;

export type SupplyPrice = 'cash' | 'policy';
export const supportersOf = (c: Campaign): number[] => (c.career?.supply ?? []).map((s) => s.party);
export const supports = (c: Campaign, p: number): boolean => supportersOf(c).includes(p);

/** The one thing a party wants most from a government, and so what it asks for in return when it is not paid in cash. */
export function wantedDemand(p: number): DemandId {
  const demands = Object.entries(WANTS[PARTY_IDS[p] as PartyId].demands) as [DemandId, number][];
  return demands.sort((a, b) => b[1] - a[1])[0][0];
}

export type SupplyRefusal = 'phase' | 'comfortable' | 'warmth' | 'full' | 'already' | 'funds' | 'none';

/** Whether the head of government can ask this party to keep the government in office from outside. */
export function canSupply(world: World, c: Campaign, p: number, price: SupplyPrice): { ok: true } | { ok: false; reason: SupplyRefusal } {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k || !pc || c.phase !== 'term' || !isPm(c) || c.inbox.length > 0) return { ok: false, reason: 'phase' };
  const g = k.government;
  const seats = houseTally(world, c);
  if (p === g.pm || g.partners.includes(p) || p === c.player || !c.parties[p] || (seats[p] ?? 0) <= 0 || p === OTH_INDEX) return { ok: false, reason: 'none' };
  if (supports(c, p)) return { ok: false, reason: 'already' };
  if (supportersOf(c).length >= MAX_SUPPLY) return { ok: false, reason: 'full' };
  if (g.seats >= majorityLine(world) + SUPPLY_COMFORT) return { ok: false, reason: 'comfortable' };
  if (relation(c, c.player, p) < SUPPLY_WARMTH) return { ok: false, reason: 'warmth' };
  if (price === 'cash' && pc.funds < scaled(world, SUPPLY_CASH)) return { ok: false, reason: 'funds' };
  return { ok: true };
}

/** The government's own seats and the seats of those who keep it in office from outside. */
export function supportedSeats(world: World, c: Campaign): number {
  const seats = houseTally(world, c);
  return c.career!.government.seats + supportersOf(c).reduce((a, p) => a + (seats[p] ?? 0), 0);
}

/** Signs a confidence and supply deal with a party: it keeps the government in office for a year, in return for money or for what it wants most. */
export function signSupply(world: World, c: Campaign, p: number, price: SupplyPrice): boolean {
  if (!canSupply(world, c, p, price).ok) return false;
  const k = c.career!;
  const pc = c.parties[c.player]!;
  if (price === 'cash') pc.funds -= scaled(world, SUPPLY_CASH);
  else k.obligations.push({ party: p, demand: wantedDemand(p), due: k.week + 30, done: false });
  (k.supply ??= []).push({ party: p, until: k.week + SUPPLY_WEEKS, price });
  k.government.stability = clamp(k.government.stability + 6, 5, 95);
  shiftRelation(c, c.player, p, 5);
  pushNews(c, { party: c.player, key: 'news.supply.signed', vars: { party: ref.party(p), n: SUPPLY_WEEKS }, tone: 'good' });
  return true;
}

/** A week of the deals: each one comes up for review when its year is out, and lapses unless it is made again. */
export function supplyWeek(c: Campaign): void {
  const k = c.career;
  if (!k?.supply) return;
  for (const s of [...k.supply]) {
    if (k.week < s.until) continue;
    k.supply = k.supply.filter((x) => x !== s);
    k.government.stability = clamp(k.government.stability - 4, 5, 95);
    shiftRelation(c, c.player, s.party, -3);
    pushNews(c, { party: s.party, key: 'news.supply.ended', vars: { party: ref.party(s.party) }, tone: 'bad' });
  }
  if (k.supply.length === 0) delete k.supply;
}
