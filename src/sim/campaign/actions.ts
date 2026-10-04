import { BLOC_IDS, N_BLOCS, N_PARTIES, type BlocId, type Dynamics, type ElectionOutcome, type RegionId, type SeatKind } from '../types';
import { combineDynamics } from '../dynamics';
import { projectElection, type World } from '../election';
import { zeros, zeros2 } from '../math';
import { Rng } from '../rng';
import { addEndorsements } from './endorserData';
import { travelCost } from './geo';
import { edge, fundsBoost, gaffeCut, mediaBoost, stat } from './perks';
import type {
  ActionId, ActionReport, ActionTarget, Campaign, ChiefLevel, Family, PartyCampaign, Quality, TargetKind,
} from './types';

export interface ActionDef {
  family: Family;
  target: TargetKind;
  /** Days of the leader's and headquarters' attention. */
  days: number;
  /** The leader must be in the state, so travel may be added. */
  presence: boolean;
  /** How many times per week (per target, where there is one). */
  perWeek: number;
}

export const ACTIONS: Record<ActionId, ActionDef> = {
  ceramah:    { family: 'ground',    target: 'seat',  days: 1,   presence: true,  perWeek: 1 },
  walkabout:  { family: 'ground',    target: 'seat',  days: 0.5, presence: true,  perWeek: 1 },
  megarally:  { family: 'ground',    target: 'state', days: 2,   presence: true,  perWeek: 1 },
  canvass:    { family: 'machinery', target: 'state', days: 1,   presence: false, perWeek: 1 },
  gotv:       { family: 'machinery', target: 'state', days: 1,   presence: false, perWeek: 1 },
  build:      { family: 'machinery', target: 'state', days: 1,   presence: false, perWeek: 1 },
  tv:         { family: 'media',     target: 'none',  days: 1,   presence: false, perWeek: 1 },
  social:     { family: 'media',     target: 'none',  days: 0.5, presence: false, perWeek: 2 },
  billboards: { family: 'media',     target: 'state', days: 0.5, presence: false, perWeek: 1 },
  attack:     { family: 'media',     target: 'party', days: 0.5, presence: false, perWeek: 1 },
  dinner:     { family: 'funds',     target: 'state', days: 1,   presence: true,  perWeek: 1 },
  crowdfund:  { family: 'funds',     target: 'none',  days: 0.5, presence: false, perWeek: 1 },
  tycoon:     { family: 'funds',     target: 'none',  days: 0.5, presence: false, perWeek: 1 },
};

/**
 * A chief runs the ground campaign in one region without the leader: it takes
 * none of the leader's days and no travel, but a chief's ceramah or walkabout
 * draws half the leader's crowd.
 */
export const CHIEF = { draw: 0.5 };
/** What a chief can do on their own. */
export const CHIEF_ACTIONS: readonly ActionId[] = ['ceramah', 'walkabout', 'canvass', 'billboards', 'build', 'gotv'];
/** Operations a week at each level of freedom. */
export const CHIEF_OPS: Record<ChiefLevel, number> = { 1: 1, 2: 2, 3: 4 };

/** Get-out-the-vote drives only work in the last weeks: two in a long campaign, one in a short one. */
export const gotvWeeks = (c: Campaign) => Math.max(1, Math.round(c.totalWeeks / 4));

// ---------- tuning ----------
// Support numbers are logit units: +0.10 in a seat is roughly a 2.5-point gain
// in vote share in a close two-way race.

/** How well in-person events land by seat type. Rallies are a rural art; walkabouts suit towns. */
const KIND_FACTOR: Record<'ceramah' | 'walkabout', Record<SeatKind, number>> = {
  ceramah:   { rural: 1, semi: 0.8, urban: 0.45 },
  walkabout: { rural: 0.8, semi: 1, urban: 0.9 },
};

const blocTable = (t: Record<BlocId, number>) => BLOC_IDS.map((b) => t[b]);

/** How far door-to-door work reaches each bloc. */
export const GROUND_REACH = blocTable({
  undi18: 0.4, heartland: 1, felda: 1, agri: 1, civil: 0.7, urban_b40: 0.6, gig: 0.5,
  m40: 0.5, urban_lib: 0.35, smallbiz: 0.6, seniors: 1, borneo_native: 1, borneo_urban: 0.5,
});
/** How much each bloc watches television and reads the papers. */
export const TV_REACH = blocTable({
  undi18: 0.25, heartland: 1, felda: 1, agri: 1, civil: 1, urban_b40: 0.7, gig: 0.4,
  m40: 0.8, urban_lib: 0.5, smallbiz: 0.8, seniors: 1.2, borneo_native: 0.8, borneo_urban: 0.7,
});
/** How much each bloc lives on its phone. */
export const SOCIAL_REACH = blocTable({
  undi18: 1.5, heartland: 0.3, felda: 0.2, agri: 0.2, civil: 0.5, urban_b40: 0.9, gig: 1.2,
  m40: 0.7, urban_lib: 1, smallbiz: 0.5, seniors: 0.1, borneo_native: 0.2, borneo_urban: 0.8,
});

export const EFFECT = {
  ceramah: 0.18, ceramahMotivation: 0.08,
  walkabout: 0.08,
  megarally: 0.06, megarallyMotivation: 0.12,
  canvass: 0.05,
  gotv: 0.2,
  build: 10,
  tv: 0.03,
  social: 0.018,
  billboards: 0.012,
  attack: 0.025, attackMotivation: 0.03, attackBackfire: 0.02, attackBackfireChance: 0.3,
  lateSwing: 0.04,
  tycoon: 900_000, tycoonExposeChance: 0.12, tycoonHit: 0.08, tycoonMotivationHit: 0.1,
};

/** How much of each kind of campaign effect survives into the next week. */
export const DECAY = { seat: 0.85, state: 0.9, nat: 0.92, motivation: 0.9 };

/** Effects stop growing once a party's boost in a place reaches these. */
export const CAP = { seat: 0.6, state: 0.3, nat: 0.3, seatTurnout: 0.4, stateTurnout: 0.5, lateSwing: 0.25 };

const MONEY = {
  ceramah: 30_000, walkabout: 8_000, megarally: 150_000, build: 60_000,
  tv: 350_000, social: 50_000,
};

/** An amount of money scaled to the size of the contest and rounded to a tidy figure. */
export function scaled(world: World, amount: number): number {
  const step = world.rules.econ >= 1 ? 1000 : 500;
  return Math.max(step, Math.round((amount * world.rules.econ) / step) * step);
}

/** What the law lets a party spend on a campaign. */
export const spendingLimit = (world: World) => scaled(world, 2_600_000);

// ---------- helpers ----------

const stateIndex = (world: World, st: RegionId) => world.states.indexOf(st);
const partyOf = (c: Campaign, p: number): PartyCampaign => {
  const pc = c.parties[p];
  if (!pc) throw new Error(`Party ${p} does not campaign`);
  return pc;
};

/** The state an action happens in, if any. */
export function actionState(world: World, id: ActionId, target: ActionTarget): RegionId | null {
  const def = ACTIONS[id];
  if (def.target === 'seat') return target.seat ? world.seats[world.seatIndex.get(target.seat)!].state : null;
  if (def.target === 'state') return target.state ?? null;
  return null;
}

function usageKey(id: ActionId, target: ActionTarget): string {
  const def = ACTIONS[id];
  return def.target === 'seat' ? `${id}:${target.seat}` : def.target === 'state' ? `${id}:${target.state}` : id;
}

/** Whether a party has a candidate in a seat: it stood there last time and has not stood aside under a pact. */
export function contests(world: World, c: Campaign, i: number, p: number): boolean {
  return world.baseline.contesting[i][p] && (c.standDowns[world.seats[i].id]?.[p] ?? -1) < 0;
}

export function contestsState(world: World, c: Campaign, p: number, st: RegionId): boolean {
  return world.seatsByState[st].some((i) => contests(world, c, i, p));
}

/** Everything moving voters right now: the hidden drift plus the campaign so far. */
export function effectiveDynamics(c: Campaign): Dynamics {
  const dyn = combineDynamics(c.drift, c.dyn);
  addEndorsements(c, dyn);
  return dyn;
}

/** How the contest would be decided today. Hidden from the player. */
export function truth(world: World, c: Campaign): ElectionOutcome {
  return projectElection(world, effectiveDynamics(c), c.standDowns);
}

/** Growth slows as the existing boost nears the cap. */
const room = (current: number, cap: number) => Math.max(0, 1 - current / cap);

export interface Cost { days: number; money: number; travelDays: number }

/** What an action costs the leader, or (with `chief`) what it costs when the region's chief does it instead. */
export function actionCost(world: World, c: Campaign, p: number, id: ActionId, target: ActionTarget, chief = false): Cost {
  const def = ACTIONS[id];
  const pc = partyOf(c, p);
  const st = actionState(world, id, target);
  let money = 0;
  switch (id) {
    case 'ceramah': case 'walkabout': case 'megarally': case 'build': case 'tv': case 'social':
      money = scaled(world, MONEY[id]);
      break;
    // Operations across a region cost more the more seats it has.
    case 'canvass': case 'gotv':
      money = st ? scaled(world, 15_000 + 4_000 * world.seatsByState[st].length) : 0;
      break;
    case 'billboards':
      money = st ? scaled(world, 20_000 + 3_500 * world.seatsByState[st].length) : 0;
      break;
    default:
      money = 0;
  }
  if (chief) return { days: 0, money, travelDays: 0 };
  let travelDays = 0;
  if (def.presence && st) {
    const trip = travelCost(world, pc.location, st);
    travelDays = trip.days;
    money += trip.money;
  }
  return { days: def.days + travelDays, money, travelDays };
}

export type Refusal =
  | 'noTarget' | 'notContesting' | 'days' | 'funds' | 'usedThisWeek'
  | 'tooEarly' | 'once' | 'self' | 'noCampaign';

export function canDo(world: World, c: Campaign, p: number, id: ActionId, target: ActionTarget, chief = false): { ok: true } | { ok: false; reason: Refusal } {
  const no = (reason: Refusal) => ({ ok: false as const, reason });
  const def = ACTIONS[id];
  const pc = c.parties[p];
  if (!pc || !world.rules.actions.includes(id)) return no('noCampaign');
  if (chief && !CHIEF_ACTIONS.includes(id)) return no('noCampaign');

  if (def.target === 'seat') {
    const i = target.seat === undefined ? undefined : world.seatIndex.get(target.seat);
    if (i === undefined) return no('noTarget');
    if (!contests(world, c, i, p)) return no('notContesting');
  } else if (def.target === 'state') {
    if (!target.state) return no('noTarget');
    // Fundraising dinners work anywhere; everything else needs candidates in the state.
    if (id !== 'dinner' && !contestsState(world, c, p, target.state)) return no('notContesting');
  } else if (def.target === 'party') {
    if (target.party === undefined || !c.parties[target.party]) return no('noTarget');
    if (target.party === p) return no('self');
  }

  if (id === 'gotv' && c.week <= c.totalWeeks - gotvWeeks(c)) return no('tooEarly');
  if (id === 'tycoon' && pc.tycoon !== 0) return no('once');
  if ((pc.used[usageKey(id, target)] ?? 0) >= def.perWeek) return no('usedThisWeek');

  const cost = actionCost(world, c, p, id, target, chief);
  if (cost.days > pc.days + 1e-9) return no('days');
  if (cost.money > pc.funds - (chief ? pc.chiefFloor : 0)) return no('funds');
  // Rival parties keep within the legal limit on spending. The player may go past it, and take the risk.
  if (p !== c.player && pc.spent + cost.money > spendingLimit(world)) return no('funds');
  return { ok: true };
}

// ---------- effects ----------

function seatSupport(c: Campaign, seat: string): number[] {
  return (c.dyn.support.seat[seat] ??= zeros(N_PARTIES));
}
function seatTurnout(c: Campaign, seat: string): number[] {
  return (c.dyn.turnout.seat[seat] ??= zeros(N_PARTIES));
}
function stateSupport(c: Campaign, st: RegionId): number[][] {
  return (c.dyn.support.state[st] ??= zeros2(N_BLOCS, N_PARTIES));
}
function stateTurnout(c: Campaign, st: RegionId): number[] {
  return (c.dyn.turnout.state[st] ??= zeros(N_PARTIES));
}

/** Adds to each bloc's support for a party, scaled by reach and slowed near the cap. */
function boostBlocs(rows: number[][], p: number, amount: number, reach: number[] | null, cap: number) {
  for (let b = 0; b < N_BLOCS; b++) {
    const r = reach ? reach[b] : 1;
    rows[b][p] += amount * r * (amount > 0 ? room(rows[b][p], cap * Math.max(r, 0.2)) : 1);
  }
}

const inFinalStretch = (c: Campaign) => c.week > c.totalWeeks - gotvWeeks(c);
const addLateSwing = (c: Campaign, p: number, scale: number) => {
  if (!inFinalStretch(c)) return;
  c.dyn.lateSwing[p] = Math.min(CAP.lateSwing, c.dyn.lateSwing[p] + EFFECT.lateSwing * scale);
};

/** What a fundraising action would bring in before luck. */
export function expectedYield(world: World, c: Campaign, p: number, id: 'dinner' | 'crowdfund' | 'tycoon', st?: RegionId): number {
  const pc = partyOf(c, p);
  const econ = world.rules.econ;
  if (id === 'tycoon') return EFFECT.tycoon * econ;
  if (id === 'crowdfund') return 150_000 * econ * 0.6 ** pc.crowdfunds;
  const seats = world.seatsByState[st!];
  const wealth = seats.reduce((a, i) => a + world.seats[i].urbanity, 0) / seats.length;
  return (100_000 + 250_000 * wealth) * econ * 0.6 ** (pc.dinners[st!] ?? 0);
}

/**
 * Carries out an action: pays for it, moves the leader if needed, and applies
 * its effects. With `chief`, the region's chief does it and the leader stays
 * put. The caller must have checked `canDo`.
 */
export function doAction(world: World, c: Campaign, p: number, id: ActionId, target: ActionTarget, chief = false): ActionReport {
  const def = ACTIONS[id];
  const pc = partyOf(c, p);
  const rng = new Rng(c.rng);
  const cost = actionCost(world, c, p, id, target, chief);
  const st = actionState(world, id, target);

  pc.days -= cost.days;
  pc.funds -= cost.money;
  pc.spent += cost.money;
  if (def.presence && st && !chief) pc.location = st;
  const key = usageKey(id, target);
  pc.used[key] = (pc.used[key] ?? 0) + 1;

  // Luck: how well it went on the day.
  const roll = 0.6 + 0.8 * rng.next();
  let quality: Quality = roll < 0.85 ? 'weak' : roll < 1.2 ? 'ok' : 'great';
  let raised: number | undefined;
  // A divided party's branches do not turn out for it.
  const machinery = st ? (pc.machinery[stateIndex(world, st)] / 60) * Math.min(1, 0.5 + pc.unity / 100) : 0;
  const tidy = (amount: number) => Math.round(amount / 500) * 500;
  // What the leader is like, and who works for them. All of these are 1 for rival parties.
  const presence = chief ? 1 : edge(c, p, 'charisma');
  const organised = edge(c, p, 'organisation');
  const onAir = mediaBoost(c, p);

  switch (id) {
    case 'ceramah':
    case 'walkabout': {
      const seat = world.seats[world.seatIndex.get(target.seat!)!];
      const s = seatSupport(c, seat.id);
      const base = (id === 'ceramah' ? EFFECT.ceramah : EFFECT.walkabout) * (chief ? CHIEF.draw : 1);
      s[p] += base * presence * KIND_FACTOR[id][seat.kind] * roll * room(s[p], CAP.seat);
      if (id === 'ceramah') {
        const t = seatTurnout(c, seat.id);
        t[p] += EFFECT.ceramahMotivation * (chief ? CHIEF.draw : 1) * roll * room(t[p], CAP.seatTurnout);
      }
      if (!chief && !pc.visits.includes(seat.id)) pc.visits.push(seat.id);
      break;
    }
    case 'megarally': {
      boostBlocs(stateSupport(c, st!), p, EFFECT.megarally * presence * roll, null, CAP.state);
      const t = stateTurnout(c, st!);
      t[p] += EFFECT.megarallyMotivation * roll * room(t[p], CAP.stateTurnout);
      addLateSwing(c, p, 1);
      break;
    }
    case 'canvass':
      boostBlocs(stateSupport(c, st!), p, EFFECT.canvass * organised * machinery * roll, GROUND_REACH, CAP.state);
      break;
    case 'gotv': {
      const t = stateTurnout(c, st!);
      t[p] += EFFECT.gotv * organised * machinery * roll * room(t[p], CAP.stateTurnout);
      break;
    }
    case 'build': {
      const i = stateIndex(world, st!);
      pc.machinery[i] = Math.min(100, pc.machinery[i] + Math.round(EFFECT.build * organised));
      quality = 'ok';
      break;
    }
    case 'tv':
      boostBlocs(c.dyn.support.nat, p, EFFECT.tv * presence * onAir * roll, TV_REACH, CAP.nat);
      addLateSwing(c, p, 1);
      break;
    case 'social': {
      // Social media is a lottery: mostly fine, sometimes huge, sometimes a self-own.
      const r = rng.next();
      // Someone who knows the medium reads a post before it goes out.
      const flop = 0.1 - gaffeCut(c, p);
      const mult = r < flop ? -0.3 : r < 0.7 ? 1 : r < 0.95 ? 1.8 : 3.5;
      quality = r < flop ? 'flop' : r < 0.7 ? 'ok' : r < 0.95 ? 'great' : 'viral';
      boostBlocs(c.dyn.support.nat, p, EFFECT.social * mult * (mult > 0 ? onAir : 1), SOCIAL_REACH, CAP.nat);
      if (mult > 1) addLateSwing(c, p, 0.5);
      break;
    }
    case 'billboards':
      boostBlocs(stateSupport(c, st!), p, EFFECT.billboards * onAir * roll, null, CAP.state);
      break;
    case 'attack': {
      // In a career, what the party has dug up over the years makes an attack sharper and safer. Each one uses some up.
      const dossier = p === c.player && c.career ? c.career.dossier : 0;
      if (c.career && p === c.player) c.career.dossier = Math.max(0, dossier - 20);
      // A cunning leader picks the moment; a leader known to be clean is harder to smear.
      const misfire = EFFECT.attackBackfireChance - dossier / 500 - 0.03 * (stat(c, p, 'cunning') - 3) - gaffeCut(c, p);
      const shield = 1 - 0.1 * (stat(c, target.party!, 'integrity') - 3);
      if (rng.next() < misfire) {
        boostBlocs(c.dyn.support.nat, p, -EFFECT.attackBackfire, null, CAP.nat);
        quality = 'backfire';
      } else {
        boostBlocs(c.dyn.support.nat, target.party!, -EFFECT.attack * edge(c, p, 'cunning') * shield * roll * (1 + dossier / 100), null, CAP.nat);
        c.dyn.turnout.party[target.party!] -= EFFECT.attackMotivation * roll;
        quality = 'ok';
      }
      break;
    }
    case 'dinner':
      raised = tidy(expectedYield(world, c, p, 'dinner', st!) * fundsBoost(c, p) * roll);
      pc.dinners[st!] = (pc.dinners[st!] ?? 0) + 1;
      break;
    case 'crowdfund':
      raised = tidy(expectedYield(world, c, p, 'crowdfund') * fundsBoost(c, p) * roll);
      pc.crowdfunds++;
      break;
    case 'tycoon':
      raised = tidy(expectedYield(world, c, p, 'tycoon'));
      pc.tycoon = 1;
      quality = 'ok';
      break;
  }
  if (raised !== undefined) pc.funds += raised;

  c.rng = rng.state;
  return { id, party: p, target, quality, raised };
}
