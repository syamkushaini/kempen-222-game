import type { World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { BLOC_IDS, N_PARTIES, PARTY_IDS, type BlocId, type PartyId } from '../types';
import { scaled } from './actions';
import { stat } from './perks';
import { pushNews } from './news';
import { gaffeCut } from './perks';
import { OUTLET_IDS, type Campaign, type OutletId } from './types';

export interface OutletDef {
  /** Who reads, watches or scrolls it. */
  audience: BlocId[];
  /** [party]: its habitual leaning, -2 to 2. */
  lean: Partial<Record<PartyId, number>>;
  /** Sides with whoever governs, whoever that is. */
  official?: boolean;
}

export const OUTLETS: Record<OutletId, OutletDef> = {
  // Berita Perdana, the state broadcaster. The government of the day is always doing well.
  perdana: { audience: ['seniors', 'heartland', 'felda', 'civil', 'agri'], lean: {}, official: true },
  // Harian Warisan, the old establishment daily.
  warisan: { audience: ['heartland', 'civil', 'seniors'], lean: { bp: 2, ps: -1 } },
  // The Ledger, read in boardrooms.
  ledger: { audience: ['smallbiz', 'm40'], lean: { bp: 1, pt: -1 } },
  // KiniSemasa, the independent news site.
  kini: { audience: ['urban_lib', 'm40', 'undi18'], lean: { ps: 1, legasi: 1, bp: -2, pt: -1 } },
  // Borneo Tribune, which covers the peninsula as foreign news.
  tribune: { audience: ['borneo_native', 'borneo_urban'], lean: { gbk: 2, gbs: 1, legasi: 1, pt: -1 } },
  // ViralKini-kini, where everything is content.
  viral: { audience: ['undi18', 'gig', 'urban_b40'], lean: {} },
};

/** What a step of friendlier or cooler coverage does to a party each week among the outlet's audience, in logit units. */
const WEEKLY = 0.008;
const INTERVIEW_DAYS = 0.5;
const TROOPER_COST = 100_000;
const TROOPER_EXPOSURE = 0.2;
const index = (id: OutletId) => OUTLET_IDS.indexOf(id);

/** Who governs as far as the state broadcaster is concerned: the government in a career, the coalition the last election produced otherwise. */
function officialLean(c: Campaign): number[] {
  const g = c.career?.government;
  const pm = g ? g.pm : PARTY_IDS.indexOf('ps');
  const partners = g ? g.partners : (['bp', 'gbk', 'gbs', 'legasi'] as const).map((id) => PARTY_IDS.indexOf(id));
  return PARTY_IDS.map((id, p) => (id === 'oth' ? 0 : p === pm ? 2 : partners.includes(p) ? 1 : -1));
}

/** How every outlet habitually treats every party. Coverage only moves voters where it differs from this. */
export function usualCoverage(c: Campaign): number[][] {
  return OUTLET_IDS.map((id) => (OUTLETS[id].official ? officialLean(c) : PARTY_IDS.map((pid) => OUTLETS[id].lean[pid] ?? 0)));
}

export const coverage = (c: Campaign, id: OutletId, p: number) => c.team.media[index(id)]?.[p] ?? 0;

function shift(c: Campaign, id: OutletId, p: number, by: number): void {
  const row = c.team.media[index(id)];
  if (row) row[p] = clamp(row[p] + by, -2, 2);
}

/** Something happened that the press will hold against a party, or for it. Only outlets that follow that sort of story react. */
export function pressReacts(c: Campaign, p: number, by: number, outlets: OutletId[] = ['kini', 'viral']): void {
  for (const id of outlets) shift(c, id, p, by);
}

export type InterviewRefusal = 'closed' | 'days' | 'usedThisWeek';
export function canInterview(c: Campaign, id: OutletId): { ok: true } | { ok: false; reason: InterviewRefusal } {
  const pc = c.parties[c.player];
  if (c.phase !== 'campaign' || !pc) return { ok: false, reason: 'closed' };
  if (pc.used[`interview:${id}`]) return { ok: false, reason: 'usedThisWeek' };
  if (pc.days < INTERVIEW_DAYS) return { ok: false, reason: 'days' };
  return { ok: true };
}

/** The chances of an interview: that it wins the outlet round, and that the leader says something they should not. */
export function interviewOdds(c: Campaign, id: OutletId): { good: number; gaffe: number } {
  const me = c.player;
  const hostile = coverage(c, id, me) < 0 ? 0.1 : 0;
  return {
    good: clamp(0.5 + 0.1 * (stat(c, me, 'charisma') - 3) - hostile, 0.1, 0.9),
    gaffe: clamp(0.12 - gaffeCut(c, me) + hostile / 2, 0.02, 0.3),
  };
}

/** The leader sits down with an outlet. It may warm to them, stay as it was, or get its headline. */
export function interview(c: Campaign, id: OutletId) {
  if (!canInterview(c, id).ok) return null;
  const me = c.player;
  const pc = c.parties[me]!;
  pc.days -= INTERVIEW_DAYS;
  pc.used[`interview:${id}`] = 1;
  const odds = interviewOdds(c, id);
  const rng = new Rng(c.rng);
  const roll = rng.next();
  c.rng = rng.state;
  const result = roll < odds.gaffe ? 'gaffe' : roll < odds.gaffe + odds.good ? 'good' : 'flat';
  if (result !== 'flat') shift(c, id, me, result === 'good' ? 1 : -1);
  return pushNews(c, { party: me, key: `news.media.interview.${result}`, vars: { outlet: `@outlet:${id}` }, tone: result === 'good' ? 'good' : result === 'gaffe' ? 'bad' : 'neutral' });
}

export const trooperCost = (world: World) => scaled(world, TROOPER_COST);
export function canHireTroopers(world: World, c: Campaign): boolean {
  const pc = c.parties[c.player];
  return c.phase === 'campaign' && !!pc && c.team.troopers === 0 && pc.funds >= trooperCost(world);
}

/** Pays for accounts that push the party's line online. It works until someone traces the money. */
export function hireTroopers(world: World, c: Campaign) {
  if (!canHireTroopers(world, c)) return null;
  const me = c.player;
  const pc = c.parties[me]!;
  pc.funds -= trooperCost(world);
  pc.spent += trooperCost(world);
  c.team.troopers = 1;
  c.team.media[index('viral')][me] = 2;
  return pushNews(c, { party: me, key: 'news.media.troopers', tone: 'neutral' });
}

/**
 * The press's week: coverage kinder or harsher than an outlet's habit moves
 * its audience, rivals work the newsrooms too, and paid accounts may be traced.
 */
export function mediaWeek(world: World, c: Campaign, rng: Rng): void {
  const usual = usualCoverage(c);
  OUTLET_IDS.forEach((id, o) => {
    for (let p = 0; p < N_PARTIES; p++) {
      const delta = (c.team.media[o]?.[p] ?? usual[o][p]) - usual[o][p];
      if (delta === 0 || !c.parties[p]) continue;
      for (const bloc of OUTLETS[id].audience) c.dyn.support.nat[BLOC_IDS.indexOf(bloc)][p] += WEEKLY * delta;
    }
  });

  // Rival leaders give interviews as well. Now and then one lands.
  c.parties.forEach((pc, p) => {
    if (!pc || p === c.player || world.seats.length === 1 || rng.next() >= 0.12) return;
    const id = OUTLET_IDS[rng.int(OUTLET_IDS.length)];
    if (coverage(c, id, p) < 2) shift(c, id, p, 1);
  });

  if (c.team.troopers === 1 && rng.next() < TROOPER_EXPOSURE) {
    const me = c.player;
    c.team.troopers = 2;
    c.team.media[index('viral')][me] = -2;
    shift(c, 'kini', me, -1);
    for (const row of c.dyn.support.nat) row[me] -= 0.03;
    if (c.career) c.career.credibility = Math.max(0, c.career.credibility - 5);
    pushNews(c, { party: me, key: 'news.media.troopersExposed', tone: 'bad' });
  }
}
