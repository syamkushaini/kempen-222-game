import type { World } from '../election';
import { lastElection, majorityLine } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { scaled } from './actions';
import { relation, shiftRelation, shiftUnity } from './diplomacy';
import { confidenceCount, openTalks } from './govern';
import { pushNews, ref } from './news';
import { inGov } from './office';
import { isEnacted } from './policy';
import type { Campaign } from './types';

// The government of the day can be brought down without an election: an opposition that can persuade enough of the members of the parties that
// keep it in office to change sides takes their seats with it, and a government that has lost its majority must give way to talks. It is
// risky, costly, and only worth trying against a government that is already shaky. The law against changing parties, if it has been passed,
// makes members far less willing.

/** How many times the usual sum a persuader can offer. A bigger offer works more often, and is louder if it comes out. */
export const CROSS_STAKES = [1, 2, 4] as const;
export type CrossStake = (typeof CROSS_STAKES)[number];
const doublings = (stake: number) => Math.log2(Math.max(1, stake));

/** What a stake of one costs, at general-election scale. */
export const CROSS_MONEY = 150_000;
/** The share of a party's seats that cross over, at a stake of one; and what each doubling of the offer adds. */
export const CROSS_SHARE = { base: 0.1, perDoubling: 0.05 };
/** Weeks between one attempt and the next, and the earliest week of the term for the first. */
export const CROSS_GAP = 26;
export const CROSS_FROM = 26;
/** A government with more than this above a majority, and steady, is too firmly in the saddle to be tried. */
export const CROSS_SLACK = 25;
export const CROSS_STEADY = 60;
/** What the law against changing parties does to the chance. */
export const BAN_FACTOR = 0.4;

export type CrossRefusal = 'phase' | 'busy' | 'inGovernment' | 'target' | 'few' | 'steady' | 'wait' | 'funds' | 'early' | 'stake';

/** The seats a party holds in the House now, weakest hold first. */
export function seatsHeldBy(world: World, c: Campaign, party: number): string[] {
  const last = lastElection(world);
  const house = c.career?.house ?? {};
  return world.seats
    .map((s, i) => ({ id: s.id, holder: house[s.id] ?? last.seats[i].winner, margin: last.seats[i].margin }))
    .filter((x) => x.holder === party)
    .sort((a, b) => a.margin - b.margin || a.id.localeCompare(b.id))
    .map((x) => x.id);
}

/** How many members cross over if it works, at a stake. */
export function crossCount(world: World, c: Campaign, party: number, stake: CrossStake): number {
  const held = seatsHeldBy(world, c, party).length;
  return clamp(Math.ceil(held * (CROSS_SHARE.base + CROSS_SHARE.perDoubling * doublings(stake))), 1, held);
}

/** The chance that the members of a governing party can be talked into crossing over. */
export function crossChance(_world: World, c: Campaign, party: number, stake: CrossStake): number {
  const k = c.career!;
  const unity = c.parties[party]?.unity ?? 70;
  const base = 0.2 + ((70 - unity) / 100) * 0.5 + relation(c, c.player, party) / 400 + 0.1 * doublings(stake) - (k.government.stability - 50) / 400;
  return clamp(base * (isEnacted(k, 'partyHopBan') ? BAN_FACTOR : 1), 0.05, 0.8);
}

/** Whether the government is shaky enough to try: its stability low, or its majority thin. */
export function shaky(world: World, c: Campaign): boolean {
  const g = c.career!.government;
  return g.stability < CROSS_STEADY || confidenceCount(world, c) < majorityLine(world) + CROSS_SLACK;
}

export function canCross(world: World, c: Campaign, party: number, stake: CrossStake = 1): { ok: true } | { ok: false; reason: CrossRefusal; weeks?: number } {
  const k = c.career;
  if (!k || c.phase !== 'term' || world.seats.length < 2) return { ok: false, reason: 'phase' };
  if (c.inbox.length > 0) return { ok: false, reason: 'busy' };
  if (inGov(c, c.player)) return { ok: false, reason: 'inGovernment' };
  if (!(CROSS_STAKES as readonly number[]).includes(stake)) return { ok: false, reason: 'stake' };
  if (party !== k.government.pm && !k.government.partners.includes(party)) return { ok: false, reason: 'target' };
  if (seatsHeldBy(world, c, party).length < 3) return { ok: false, reason: 'few' };
  if (k.week < CROSS_FROM) return { ok: false, reason: 'early' };
  if (k.crossWeek !== undefined && k.week - k.crossWeek < CROSS_GAP) return { ok: false, reason: 'wait', weeks: CROSS_GAP - (k.week - k.crossWeek) };
  if (!shaky(world, c)) return { ok: false, reason: 'steady' };
  if (scaled(world, CROSS_MONEY) * stake > (c.parties[c.player]?.funds ?? 0)) return { ok: false, reason: 'funds' };
  return { ok: true };
}

/**
 * The player's party tries to bring members of a governing party across. If it works, their seats become the player's; if that leaves the government
 * without a majority it falls and the talks open, and if not it is shaken. If it does not work, it may leak.
 */
export function crossTheFloor(world: World, c: Campaign, party: number, stake: CrossStake = 1): 'fell' | 'shaken' | 'failed' | 'leaked' | null {
  if (!canCross(world, c, party, stake).ok) return null;
  const k = c.career!;
  const me = c.player;
  const pc = c.parties[me]!;
  pc.funds -= scaled(world, CROSS_MONEY) * stake;
  k.crossWeek = k.week;
  const rng = new Rng((c.rng ^ 0x5e4a70) + k.week * 31 + party);
  const chance = crossChance(world, c, party, stake);
  const works = rng.next() < chance;
  const leaked = !works && rng.next() < 0.3 * (1 + 0.25 * doublings(stake));
  // Every approach leaves a trail, more when it worked.
  k.trail = (k.trail ?? 0) + (works ? stake : 0.5 * stake);
  const vars = { party: ref.party(party) };
  if (works) {
    const n = crossCount(world, c, party, stake);
    const house = (k.house ??= {});
    for (const id of seatsHeldBy(world, c, party).slice(0, n)) house[id] = me;
    shiftUnity(c, party, -4);
    shiftRelation(c, me, party, -15);
    k.credibility = clamp(k.credibility - 2, 0, 100);
    if (confidenceCount(world, c) < majorityLine(world)) {
      k.record.toppled++;
      pushNews(c, { party: me, key: 'news.cross.fell', vars: { ...vars, n }, tone: 'good' });
      openTalks(world, c);
      return 'fell';
    }
    k.government.stability = clamp(k.government.stability - 6, 5, 95);
    pushNews(c, { party: me, key: 'news.cross.shaken', vars: { ...vars, n }, tone: 'good' });
    return 'shaken';
  }
  if (leaked) {
    k.credibility = clamp(k.credibility - 4, 0, 100);
    shiftRelation(c, me, party, -10);
    pushNews(c, { party: me, key: 'news.cross.leaked', vars, tone: 'bad' });
    return 'leaked';
  }
  pushNews(c, { party: me, key: 'news.cross.failed', vars, tone: 'neutral' });
  return 'failed';
}

/** The government's majority as the opposition sees it: how many seats above or below a majority it can count on. */
export const governmentMargin = (world: World, c: Campaign): number => confidenceCount(world, c) - majorityLine(world);
