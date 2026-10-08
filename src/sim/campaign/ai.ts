import type { World } from '../election';
import { Rng } from '../rng';
import { N_PARTIES, PARTY_IDS, isMinor, type ElectionOutcome, type FieldedId, type RegionId, type SeatKind } from '../types';
import {
  CAP, CHARITY_REACH, CHIEF, CHIEF_OPS, DECAY, EFFECT, MANIFESTO_REACH, RADIO_REACH, TOWNHALL_KIND, TV_REACH, YOUTH_REACH,
  actionCost, canDo, contests, contestsState, doAction, expectedYield, gotvWeeks,
} from './actions';
import { stat } from './perks';
import { bestAim } from './segments';
import type { ActionId, ActionReport, ActionTarget, Campaign, Difficulty } from './types';

/** What makes each rival campaign differently. Weights multiply how attractive a kind of action looks. */
export interface Profile {
  ground: number;
  machinery: number;
  media: number;
  attack: number;
  /** Starts fundraising when funds fall below this. */
  reserve: number;
  /** Willing to take tycoon money when short. */
  shady: boolean;
}

const PROFILES: Record<FieldedId, Profile> = {
  // Reformists: media-savvy, urban, short of cash.
  ps:     { ground: 0.9, machinery: 0.7, media: 1.4, attack: 1.0, reserve: 250_000, shady: false },
  // The old establishment: deep machinery and deep pockets.
  bp:     { ground: 0.9, machinery: 1.5, media: 0.9, attack: 0.7, reserve: 400_000, shady: true },
  // Heartland conservatives: tireless ceramah circuit, strong online.
  pt:     { ground: 1.4, machinery: 1.0, media: 1.0, attack: 1.2, reserve: 200_000, shady: false },
  // Borneo blocs: defend home ground through machinery.
  gbk:    { ground: 1.0, machinery: 1.4, media: 0.5, attack: 0.3, reserve: 150_000, shady: false },
  gbs:    { ground: 1.1, machinery: 1.2, media: 0.5, attack: 0.5, reserve: 100_000, shady: true },
  legasi: { ground: 1.3, machinery: 0.9, media: 0.7, attack: 0.8, reserve: 80_000, shady: false },
  // The small parties: the young reformers live online; the Borneo locals knock on doors and avoid fights.
  genba:  { ground: 1.1, machinery: 0.6, media: 1.6, attack: 0.6, reserve: 40_000, shady: false },
  cahaya: { ground: 1.2, machinery: 1.2, media: 0.5, attack: 0.3, reserve: 40_000, shady: false },
  suara:  { ground: 1.2, machinery: 1.2, media: 0.4, attack: 0.3, reserve: 30_000, shady: false },
};

/** The ways a rival campaigns that a player can learn to read, from what they do. */
export const STYLE_IDS = ['aggressive', 'populist', 'machine', 'online', 'cautious', 'shady'] as const;
export type StyleId = (typeof STYLE_IDS)[number];

/**
 * How a rival is known to campaign, in the one or two words that fit it best: aggressive (goes for the throat), populist (the
 * ceramah circuit), a machine (branches and money), online (lives on the phone), cautious (avoids fights) and shady (takes the
 * money that comes with strings). The player reads them off what the party does week by week.
 */
export function styleOf(p: number): StyleId[] {
  const pr = PROFILES[PARTY_IDS[p] as FieldedId];
  if (!pr) return [];
  const out: [StyleId, number][] = [
    ['aggressive', pr.attack - 0.9], ['populist', pr.ground - 1.15], ['machine', pr.machinery - 1.25], ['online', pr.media - 1.25],
    ['cautious', 0.55 - pr.attack], ['shady', pr.shady ? 0.3 : -1],
  ];
  return out.filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([id]) => id);
}

/** Difficulty changes how well rivals read the race and choose, never their resources. */
const SKILL: Record<Difficulty, { noise: number; blunder: number }> = {
  easy:   { noise: 0.08, blunder: 0.4 },
  normal: { noise: 0.04, blunder: 0.15 },
  hard:   { noise: 0.015, blunder: 0.03 },
};

const GROUND_KIND: Record<SeatKind, number> = { rural: 1, semi: 0.75, urban: 0.45 };
const CERAMAH_KIND: Record<SeatKind, number> = { rural: 1, semi: 0.8, urban: 0.45 };
const WALK_KIND: Record<SeatKind, number> = { rural: 0.8, semi: 1, urban: 0.9 };

export interface Option { id: ActionId; target: ActionTarget; score: number }

/** What a day of the leader's time is worth in money, at full funds. */
const DAY_VALUE = 80_000;

const room = (current: number, cap: number) => Math.max(0, 1 - current / cap);
const mean = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);

/**
 * How a campaign reads the race: how much each seat is worth fighting for
 * (highest where the party is neck and neck, fading to nothing where it is
 * far ahead or far behind) and who stands in the way there. The real picture
 * is seen through `noise`.
 */
export function readRace(world: World, c: Campaign, p: number, truth: ElectionOutcome, rng: Rng, noise: number, watched: string[]) {
  const value = new Array<number>(world.seats.length).fill(0);
  const mainRival = new Array<number>(world.seats.length).fill(-1);
  truth.seats.forEach((o, i) => {
    if (!contests(world, c, i, p)) return;
    const own = o.votes[p] / o.valid + rng.normal(0, noise);
    let best = -1, bestShare = -Infinity;
    for (let q = 0; q < N_PARTIES; q++) {
      if (q === p || !contests(world, c, i, q)) continue;
      const s = o.votes[q] / o.valid + rng.normal(0, noise);
      if (s > bestShare) { bestShare = s; best = q; }
    }
    const gap = own - bestShare;
    value[i] = Math.exp(-((gap / 0.07) ** 2));
    if (watched.includes(world.seats[i].id) && Math.abs(gap) < 0.1) value[i] *= 1.3;
    mainRival[i] = best;
  });
  return { value, mainRival };
}

/** How a party reads the race: how much each seat is worth fighting for, and who stands in the way there. */
export interface Reading {
  value: number[];
  mainRival: number[];
  /** The race as it stands, where the reader has it: lets a party aim a seat event at the group that will move most. */
  truth?: ElectionOutcome;
}

/**
 * Every action open to party `p` right now, best value for effort first.
 * Value is what an action is expected to do in the seats worth fighting for,
 * per unit of the leader's time and money. Used by the rivals' weekly play,
 * and by the suggestions shown to the player.
 */
export function rankOptions(world: World, c: Campaign, p: number, reading: Reading, profile: Profile): Option[] {
  const pc = c.parties[p];
  if (!pc) return [];
  const { value, mainRival } = reading;
  const stateValue = (st: RegionId, weight: (i: number) => number) =>
    world.seatsByState[st].reduce((a, i) => a + value[i] * weight(i), 0);
  const totalValue = value.reduce((a, b) => a + b, 0);
  const ranked = value.map((v, i) => ({ v, i })).filter((x) => x.v > 0.05).sort((a, b) => b.v - a.v).slice(0, 14);
  const myStates = world.states.filter((st) => contestsState(world, c, p, st));
  const finalStretch = c.week > c.totalWeeks - gotvWeeks(c);
  const econ = world.rules.econ;
  const reserve = profile.reserve * econ;
  const weeksLeft = c.totalWeeks - c.week;

  const options: Option[] = [];
  // Money is worth more when there is little of it.
  const moneyPerDay = DAY_VALUE * econ * Math.min(1.5, Math.max(0.25, pc.funds / (600_000 * econ)));
  const consider = (id: ActionId, target: ActionTarget, benefit: number, weight: number) => {
    if (benefit <= 0 || !canDo(world, c, p, id, target).ok) return;
    const cost = actionCost(world, c, p, id, target);
    options.push({ id, target, score: (benefit * weight) / (cost.days + cost.money / moneyPerDay) });
  };
  for (const { v, i } of ranked) {
    const seat = world.seats[i];
    const boost = c.dyn.support.seat[seat.id]?.[p] ?? 0;
    // A party that can read the seat aims at the group that will move most, and a party that cannot holds a plain event.
    const aim = reading.truth && c.difficulty !== 'easy' ? bestAim(seat, reading.truth.seats[i], p) : null;
    const worth = aim ? aim.ratio : 1;
    const at: ActionTarget = aim ? { seat: seat.id, segment: aim.segment } : { seat: seat.id };
    consider('ceramah', at, v * EFFECT.ceramah * CERAMAH_KIND[seat.kind] * room(boost, CAP.seat) * worth, profile.ground);
    consider('walkabout', at, v * EFFECT.walkabout * WALK_KIND[seat.kind] * room(boost, CAP.seat) * worth, profile.ground);
    // A town hall is worth what it gains less the one time in five it goes wrong on camera.
    consider('townhall', at, v * EFFECT.townhall * TOWNHALL_KIND[seat.kind] * (1 - EFFECT.townhallFlopChance) * room(boost, CAP.seat) * worth, profile.ground);
  }
  for (const st of myStates) {
    const m = pc.machinery[world.states.indexOf(st)] / 60;
    const ground = stateValue(st, (i) => GROUND_KIND[world.seats[i].kind]);
    const flat = stateValue(st, () => 1);
    consider('canvass', { state: st }, ground * EFFECT.canvass * m, profile.machinery);
    consider('billboards', { state: st }, flat * EFFECT.billboards, profile.media);
    consider('megarally', { state: st }, flat * EFFECT.megarally * (finalStretch ? 1.5 : 1), profile.ground);
    // Turnout moves share about a third as much as persuasion does.
    if (finalStretch) consider('gotv', { state: st }, flat * EFFECT.gotv * m * 0.35, profile.machinery);
    // The newer ways to work a state, each reaching the groups it reaches.
    consider('charity', { state: st }, flat * EFFECT.charity * mean(CHARITY_REACH) * (1 - EFFECT.charityScandalChance), profile.ground);
    consider('youth', { state: st }, flat * EFFECT.youth * mean(YOUTH_REACH), profile.media);
    consider('festival', { state: st }, flat * EFFECT.festival, profile.ground);
    consider('radio', { state: st }, ground * EFFECT.radio * mean(RADIO_REACH), profile.media);
  }
  // National media pays off late, when it no longer has time to fade.
  const lateness = weeksLeft <= c.totalWeeks / 2.5 ? 1 : 0.4;
  consider('tv', {}, totalValue * EFFECT.tv * 0.8 * lateness, profile.media);
  consider('social', {}, totalValue * EFFECT.social * 0.7 * lateness, profile.media);
  consider('manifesto', {}, totalValue * EFFECT.manifesto * mean(MANIFESTO_REACH) * lateness, profile.media);
  // A day on the party itself is for a party that is coming apart.
  if (pc.unity < 50) consider('conference', {}, totalValue * 0.004 * (50 - pc.unity), profile.machinery);

  // Attack whichever party stands in the way in the most valuable seats.
  const blocking = new Array<number>(N_PARTIES).fill(0);
  // A national attack is a big party's weapon: a party of one seat does not run them, and is not worth one.
  mainRival.forEach((q, i) => { if (q >= 0 && (!isMinor(q) || q === c.player)) blocking[q] += value[i]; });
  const foe = blocking.indexOf(Math.max(...blocking));
  if (!isMinor(p) && c.parties[foe]) consider('attack', { party: foe }, blocking[foe] * EFFECT.attack * 0.5, profile.attack);
  // A debate with whoever stands in the way: worth it for the better speaker, a risk for the worse one.
  if (!isMinor(p) && c.parties[foe]) {
    const odds = Math.min(0.8, Math.max(0.15, EFFECT.debateBase + EFFECT.debatePerPoint * (stat(c, p, 'charisma') - stat(c, foe, 'charisma'))));
    consider('debate', { party: foe }, totalValue * (odds * EFFECT.debate * mean(TV_REACH) - (1 - odds) * EFFECT.debateLoss) * EFFECT.debateRepeat ** (pc.plays?.debate ?? 0), profile.media);
  }

  // Fundraise when short; the lower the funds, the more urgent.
  const need = Math.max(0, 1.6 - pc.funds / reserve);
  if (need > 0) {
    const here = pc.location;
    const dayValue = DAY_VALUE * econ;
    consider('dinner', { state: here }, (expectedYield(world, c, p, 'dinner', here) / dayValue) * need, 1);
    consider('crowdfund', {}, (expectedYield(world, c, p, 'crowdfund') / dayValue) * need, 1);
    if (profile.shady && pc.funds < reserve / 2) consider('tycoon', {}, (expectedYield(world, c, p, 'tycoon') / dayValue) * need * 0.5, 1);
  }

  return options.sort((a, b) => b.score - a.score);
}

/**
 * Plays one week for a rival party: repeatedly picks the action with the best
 * expected seats-per-effort until the week's days run out.
 *
 * `truth` is the real state of the race; the rival sees it through noise that
 * shrinks with difficulty. `watched` lists seats the player visited this week,
 * which rivals contest harder.
 */
export function playWeek(world: World, c: Campaign, p: number, truth: ElectionOutcome, watched: string[]): ActionReport[] {
  const pc = c.parties[p];
  if (!pc) return [];
  const profile = PROFILES[PARTY_IDS[p] as FieldedId];
  const skill = SKILL[c.difficulty];
  const rng = new Rng(c.rng);
  const reports: ActionReport[] = [];
  const { value, mainRival } = readRace(world, c, p, truth, rng, skill.noise, watched);

  const reading: Reading = { value, mainRival, truth };

  for (let guard = 0; guard < 40 && pc.days >= 0.5; guard++) {
    const options = rankOptions(world, c, p, reading, profile);
    if (options.length === 0) break;
    // A weaker campaign sometimes picks something other than its best idea.
    const pick = rng.next() < skill.blunder ? options[rng.int(Math.min(options.length, 8))] : options[0];
    c.rng = rng.state;
    reports.push(doAction(world, c, p, pick.id, pick.target));
    rng.state = c.rng;
  }

  c.rng = rng.state;
  return reports;
}

// ---------- chiefs ----------

/** A contest with a single region has nobody to delegate to. */
export const hasChiefs = (world: World) => world.states.length > 1;

/** How well the player's own chiefs read their ground. Rivals' chiefs read it as well as their leaders do. */
export const CHIEF_NOISE = 0.04;

export const RIVAL_NOISE: Record<Difficulty, number> = { easy: SKILL.easy.noise, normal: SKILL.normal.noise, hard: SKILL.hard.noise };

/**
 * A chief leaves the money alone when nothing on offer is worth this much per
 * unit of spending, counting only what will still be felt on polling day.
 */
const CHIEF_MIN_SCORE = 0.05;
/** Drives a chief expects to run on the back of newly opened branches. */
const DRIVES_AFTER_BUILD = 2;

export interface ChiefReport { state: RegionId; reports: ActionReport[]; spent: number }

/**
 * The most the party's chiefs may spend between them this week, out of what
 * the party holds above the floor set for them. Spending is weighted towards
 * polling day, in step with how long its effects last; everything is on the
 * table in the final week.
 */
export function chiefAllowance(c: Campaign, p: number): number {
  const pc = c.parties[p];
  if (!pc) return 0;
  let weights = 0;
  for (let left = c.totalWeeks - c.week; left >= 0; left--) weights += DECAY.seat ** left;
  return (Math.max(0, pc.funds - pc.chiefFloor) * DECAY.seat ** (c.totalWeeks - c.week)) / weights;
}

/**
 * Lets every chief the party has appointed run their region for the week.
 * Each proposes their best operations, up to the freedom they were given; the
 * most promising across the country are paid for first, within the week's
 * allowance.
 *
 * Money keeps and campaign effects fade, so chiefs hold back early, when only
 * the closest fights and new branches are worth paying for, and spend freely
 * in the final weeks.
 */
export function runChiefs(world: World, c: Campaign, p: number, truth: ElectionOutcome, noise: number): ChiefReport[] {
  const pc = c.parties[p];
  if (!pc || !hasChiefs(world)) return [];
  const states = world.states.filter((st) => pc.chiefs[st] && contestsState(world, c, p, st));
  if (states.length === 0) return [];

  const rng = new Rng(c.rng);
  const { value } = readRace(world, c, p, truth, rng, noise, []);
  c.rng = rng.state;

  const finalStretch = c.week > c.totalWeeks - gotvWeeks(c);
  const weeksLeft = c.totalWeeks - c.week;
  const unit = DAY_VALUE * world.rules.econ;
  const lasting = { seat: DECAY.seat ** weeksLeft, state: DECAY.state ** weeksLeft, motivation: DECAY.motivation ** weeksLeft };
  const plans: (Option & { state: RegionId })[] = [];

  for (const st of states) {
    const seats = world.seatsByState[st];
    const machinery = pc.machinery[world.states.indexOf(st)];
    const m = machinery / 60;
    const ground = seats.reduce((a, i) => a + value[i] * GROUND_KIND[world.seats[i].kind], 0);
    const flat = seats.reduce((a, i) => a + value[i], 0);
    const options: Option[] = [];
    const consider = (id: ActionId, target: ActionTarget, benefit: number) => {
      if (benefit <= 0 || !canDo(world, c, p, id, target, true).ok) return;
      const score = benefit / (actionCost(world, c, p, id, target, true).money / unit);
      if (score >= CHIEF_MIN_SCORE) options.push({ id, target, score });
    };

    for (const i of seats) {
      if (value[i] <= 0.05) continue;
      const seat = world.seats[i];
      const reach = value[i] * CHIEF.draw * room(c.dyn.support.seat[seat.id]?.[p] ?? 0, CAP.seat) * lasting.seat;
      consider('ceramah', { seat: seat.id }, reach * EFFECT.ceramah * CERAMAH_KIND[seat.kind]);
      consider('walkabout', { seat: seat.id }, reach * EFFECT.walkabout * WALK_KIND[seat.kind]);
    }
    consider('canvass', { state: st }, ground * EFFECT.canvass * m * lasting.state);
    consider('billboards', { state: st }, flat * EFFECT.billboards * lasting.state);
    if (finalStretch) consider('gotv', { state: st }, flat * EFFECT.gotv * m * 0.35 * lasting.motivation);
    // New branches last, and pay back through the drives still to come.
    if (weeksLeft >= 2 && machinery < 100) consider('build', { state: st }, ground * EFFECT.canvass * (EFFECT.build / 60) * DRIVES_AFTER_BUILD);

    options.sort((a, b) => b.score - a.score);
    for (const o of options.slice(0, CHIEF_OPS[pc.chiefs[st]])) plans.push({ ...o, state: st });
  }

  plans.sort((a, b) => b.score - a.score);
  let left = chiefAllowance(c, p);
  const byState = new Map<RegionId, ChiefReport>();
  for (const plan of plans) {
    const spent = actionCost(world, c, p, plan.id, plan.target, true).money;
    if (spent > left || !canDo(world, c, p, plan.id, plan.target, true).ok) continue;
    const entry = byState.get(plan.state) ?? { state: plan.state, reports: [], spent: 0 };
    entry.reports.push(doAction(world, c, p, plan.id, plan.target, true));
    entry.spent += spent;
    left -= spent;
    byState.set(plan.state, entry);
  }
  return world.states.filter((st) => byState.has(st)).map((st) => byState.get(st)!);
}

/**
 * How a party run by the computer uses its chiefs: one in every region it
 * contests, drawing on whatever the party holds above its reserve.
 */
export function planChiefs(world: World, c: Campaign, p: number): void {
  const pc = c.parties[p];
  if (!pc || !hasChiefs(world)) return;
  pc.chiefFloor = 1.6 * PROFILES[PARTY_IDS[p] as FieldedId].reserve * world.rules.econ;
  pc.chiefs = Object.fromEntries(world.states.filter((st) => contestsState(world, c, p, st)).map((st) => [st, 2 as const]));
}
