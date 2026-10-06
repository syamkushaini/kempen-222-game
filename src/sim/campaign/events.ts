import { clamp } from '../math';
import { Rng } from '../rng';
import { BLOC_IDS, N_BLOCS, PARTY_IDS, type BlocId, type PartyId } from '../types';
import { EVENTS as CORE_EVENTS } from './eventList';
import { MORE_EVENTS } from './eventList2';
import { GOVERNING_EVENTS } from './eventList3';
import { STORY_EVENTS } from './eventList4';
import { BY_EFFORT, STATE_EFFORT, statesHeld } from './contests';
import type { World } from '../election';
import { scaled } from './actions';
import { addScene, shiftRelation, shiftUnity } from './diplomacy';
import { nationOf, shiftNation } from './nation';
import { pushNews } from './news';
import { ISSUE_IDS, type BackstoryId, type Campaign, type IssueId, type Level, type Scene } from './types';

/** Everything that can happen between elections. */
export const EVENTS: Record<string, EventDef> = { ...CORE_EVENTS, ...MORE_EVENTS, ...GOVERNING_EVENTS, ...STORY_EVENTS };

/** Where the player sits: heading the government, a partner in it, or across the floor. */
export type Seat = 'pm' | 'gov' | 'opp';
export function seatOf(c: Campaign): Seat {
  const g = c.career!.government;
  return g.pm === c.player ? 'pm' : g.partners.includes(c.player) ? 'gov' : 'opp';
}

export type Who = 'pm' | 'partners' | 'opp' | PartyId;

/** One consequence of a choice. Amounts of money are at general-election scale. */
export type Effect =
  | { t: 'mood'; blocs: BlocId[] | 'all'; n: number }
  | { t: 'rival'; who: Who; n: number }
  | { t: 'unity' | 'funds' | 'cred' | 'stability' | 'trust' | 'machinery' | 'dossier' | 'donors' | 'state' | 'fiscal'; n: number }
  | { t: 'economy'; growth?: number; inflation?: number }
  | { t: 'nation'; health?: number; education?: number; standing?: number }
  | { t: 'assets'; pct: number }
  | { t: 'dividend'; pct: number }
  | { t: 'relation'; who: Who; n: number }
  | { t: 'salience'; issue: IssueId; n: number }
  | { t: 'flag'; id: string }
  | { t: 'falls' };

export interface Choice {
  effects: Effect[];
  /** A gamble on top: the chance of it coming off (a number, or the player's unity or credibility as a percentage). */
  gamble?: { chance: number | 'unity' | 'cred' | 'stability'; win: Effect[]; lose: Effect[] };
  /** A later event this choice sets in motion, and after how many weeks. */
  then?: { event: string; after: number };
}

export interface EventDef {
  /** 'gov' means anyone in the government, including its head; 'partner' means in it but not leading it. */
  role: 'any' | 'gov' | 'partner' | 'pm' | 'opp';
  /** Relative chance among random events. 0: never at random, only when scheduled. */
  weight: number;
  /** Fires in this week of the term. */
  at?: number;
  /** Fires in this week of every year of the term. */
  yearly?: number;
  /** May happen this many times a term; once if not given. */
  times?: number;
  needs?: {
    flag?: string; notFlag?: string;
    donors?: boolean; state?: boolean; assets?: boolean; partners?: boolean;
    /** The government's stability is below this. */
    shaky?: number;
    /** The national debt is above this share of national income. */
    debt?: number;
    /** The care of the country's health, schooling, or standing among nations is below this (0-100). */
    health?: number; education?: number; standing?: number;
    /** The player's leader has this past. */
    backstory?: BackstoryId;
    /** The player has hired at least one of their people. */
    staff?: boolean;
    /** The player's party governs at least one state. */
    states?: boolean;
  };
  choices: Choice[];
}

/** How many weeks pass, at least, between one random event and the next. */
const QUIET_WEEKS = 3;
const EVENT_CHANCE = 0.06;

/** Whether an event could happen to the player now, by their place in government and by the state of things. */
export function eligible(c: Campaign, id: string): boolean {
  const def = EVENTS[id];
  const k = c.career!;
  const seat = seatOf(c);
  if (def.role === 'pm' && seat !== 'pm') return false;
  if (def.role === 'gov' && seat === 'opp') return false;
  if (def.role === 'partner' && seat !== 'gov') return false;
  if (def.role === 'opp' && seat !== 'opp') return false;
  if (k.fired.filter((x) => x === id).length >= (def.times ?? 1)) return false;
  const n = def.needs;
  if (!n) return true;
  if (n.flag && !k.flags.includes(n.flag)) return false;
  if (n.notFlag && k.flags.includes(n.notFlag)) return false;
  if (n.donors && k.orders.donors < 1) return false;
  if (n.state && k.orders.state < 1) return false;
  if (n.assets && k.assets <= 0) return false;
  if (n.partners && k.government.partners.length === 0) return false;
  if (n.shaky !== undefined && k.government.stability >= n.shaky) return false;
  if (n.debt !== undefined && k.economy.debt <= n.debt) return false;
  if (n.health !== undefined && nationOf(k).health >= n.health) return false;
  if (n.education !== undefined && nationOf(k).education >= n.education) return false;
  if (n.standing !== undefined && nationOf(k).standing >= n.standing) return false;
  if (n.backstory && c.team.leader.backstory !== n.backstory) return false;
  if (n.staff && !c.team.staff.some((s) => s !== null)) return false;
  if (n.states && statesHeld(c, c.player) === 0) return false;
  return true;
}

function fire(c: Campaign, id: string): void {
  c.career!.fired.push(id);
  addScene(c, { kind: 'event', from: null, event: id });
}

/**
 * Decides what, if anything, lands on the leader's desk this week: something
 * set in motion earlier, something on the calendar, or something out of the
 * blue. At most one. Returns whether anything did.
 */
export function rollEvent(c: Campaign, rng: Rng): boolean {
  const k = c.career!;
  const due = k.queue.findIndex((q) => q.week <= k.week);
  if (due >= 0) {
    const [q] = k.queue.splice(due, 1);
    // A follow-up fires whatever the count, but only if it still makes sense.
    if (eligibleFollowUp(c, q.event)) { fire(c, q.event); return true; }
  }
  const weekOfYear = ((k.week - 1) % 52) + 1;
  for (const [id, def] of Object.entries(EVENTS)) {
    const onCalendar = def.at === k.week || (def.yearly === weekOfYear && k.week > 4);
    if (onCalendar && (def.yearly ? eligibleYearly(c, id) : eligible(c, id))) { fire(c, id); return true; }
  }
  if (k.week < k.quietUntil || rng.next() > EVENT_CHANCE) return false;
  const pool = Object.keys(EVENTS).filter((id) => EVENTS[id].weight > 0 && eligible(c, id));
  const total = pool.reduce((a, id) => a + EVENTS[id].weight, 0);
  if (total <= 0) return false;
  let pick = rng.next() * total;
  for (const id of pool) {
    pick -= EVENTS[id].weight;
    if (pick <= 0) { fire(c, id); k.quietUntil = k.week + QUIET_WEEKS; return true; }
  }
  return false;
}

/** Yearly events come round every year; follow-ups come when called. Both still respect the player's role and needs. */
function eligibleYearly(c: Campaign, id: string): boolean {
  const k = c.career!;
  const saved = k.fired;
  k.fired = [];
  const ok = eligible(c, id);
  k.fired = saved;
  return ok;
}
const eligibleFollowUp = eligibleYearly;

function partiesOf(c: Campaign, who: Who): number[] {
  const g = c.career!.government;
  const campaigning = (p: number) => !!c.parties[p] && p !== c.player;
  if (who === 'pm') return [g.pm].filter(campaigning);
  if (who === 'partners') return [g.pm, ...g.partners].filter(campaigning);
  if (who === 'opp') return c.parties.map((_, p) => p).filter((p) => campaigning(p) && p !== g.pm && !g.partners.includes(p));
  return [PARTY_IDS.indexOf(who)].filter(campaigning);
}

/** Applies consequences. Returns true if the government has fallen as a result. */
function apply(world: World, c: Campaign, effects: Effect[]): boolean {
  const k = c.career!;
  const me = c.player;
  const pc = c.parties[me]!;
  let falls = false;
  for (const e of effects) {
    switch (e.t) {
      case 'mood': {
        const rows = e.blocs === 'all' ? Array.from({ length: N_BLOCS }, (_, b) => b) : e.blocs.map((b) => BLOC_IDS.indexOf(b));
        for (const b of rows) k.mood[b][me] += e.n;
        break;
      }
      case 'rival': for (const p of partiesOf(c, e.who)) for (let b = 0; b < N_BLOCS; b++) k.mood[b][p] += e.n; break;
      case 'unity': shiftUnity(c, me, e.n); break;
      case 'funds': pc.funds = Math.max(0, pc.funds + Math.sign(e.n) * scaled(world, Math.abs(e.n))); break;
      case 'cred': k.credibility = clamp(k.credibility + e.n, 0, 100); break;
      case 'stability': k.government.stability = clamp(k.government.stability + e.n, 5, 95); break;
      case 'trust': k.government.trust = clamp(k.government.trust + e.n, 0, 100); break;
      case 'machinery': pc.machinery = pc.machinery.map((m) => (m > 0 ? clamp(m + e.n, 0, 100) : 0)); break;
      case 'dossier': k.dossier = clamp(k.dossier + e.n, 0, 100); break;
      case 'donors': k.orders.donors = clamp(k.orders.donors + e.n, 0, 3) as Level; break;
      case 'state': k.orders.state = clamp(k.orders.state + e.n, 0, 3) as Level; break;
      case 'fiscal': k.fiscal = Math.max(0, k.fiscal + e.n); break;
      case 'economy': k.economy.growth += e.growth ?? 0; k.economy.inflation += e.inflation ?? 0; break;
      case 'nation': shiftNation(k, e); break;
      case 'assets': k.assets = Math.max(0, Math.round(k.assets * (1 + e.pct))); break;
      case 'dividend': pc.funds = Math.max(0, pc.funds + Math.round(k.assets * e.pct)); break;
      case 'relation': for (const p of partiesOf(c, e.who)) shiftRelation(c, me, p, e.n); break;
      case 'salience': { const i = ISSUE_IDS.indexOf(e.issue); k.salience[i] = clamp(k.salience[i] + e.n, 0.5, 2); break; }
      case 'flag': if (!k.flags.includes(e.id)) k.flags.push(e.id); break;
      case 'falls': falls = true; break;
    }
  }
  return falls;
}

/** The chance a gamble comes off, as the player would be told it. */
export function gambleChance(c: Campaign, chance: number | 'unity' | 'cred' | 'stability'): number {
  if (chance === 'unity') return clamp(c.parties[c.player]!.unity / 100, 0.1, 0.9);
  if (chance === 'cred') return clamp(c.career!.credibility / 100, 0.1, 0.9);
  if (chance === 'stability') return clamp(c.career!.government.stability / 100, 0.1, 0.9);
  return chance;
}

/** What buying off a partner who has come with an ultimatum costs, at general-election scale. */
export const ULTIMATUM_MONEY = 150_000;

/**
 * What a choice costs on the spot. A by-election and a round of state polls are priced by the effort chosen.
 * What a gamble may lose is not counted: a loss takes what is there.
 */
export function choiceCost(world: World, event: string, choice: number): number {
  // `scaled` rounds up to its smallest step, so an effort priced at nothing is kept at nothing here.
  const effort = event === 'byElection' ? BY_EFFORT[choice] : event === 'statePolls' ? STATE_EFFORT[choice] : undefined;
  if (effort) return effort.money > 0 ? scaled(world, effort.money) : 0;
  if (event === 'ultimatum') return choice === 0 ? scaled(world, ULTIMATUM_MONEY) : 0;
  const net = (EVENTS[event]?.choices[choice]?.effects ?? []).reduce((a, e) => a + (e.t === 'funds' ? Math.sign(e.n) * scaled(world, Math.abs(e.n)) : 0), 0);
  return Math.max(0, -net);
}

/** A choice the party cannot pay for is not on offer: without this, an empty chest bought everything for nothing. */
export function canChoose(world: World, c: Campaign, event: string, choice: number): boolean {
  return choiceCost(world, event, choice) <= (c.parties[c.player]?.funds ?? 0);
}

/**
 * Carries out the player's answer to an event. Returns true if the choice
 * brought the government down, so the caller can open the talks.
 */
export function resolveEvent(world: World, c: Campaign, scene: Scene, choice: number): boolean {
  const def = scene.event ? EVENTS[scene.event] : undefined;
  const picked = def?.choices[choice];
  if (!c.career || !def || !picked) return false;
  let falls = apply(world, c, picked.effects);
  let suffix = '';
  if (picked.gamble) {
    const rng = new Rng(c.rng);
    const won = rng.next() < gambleChance(c, picked.gamble.chance);
    c.rng = rng.state;
    falls = apply(world, c, won ? picked.gamble.win : picked.gamble.lose) || falls;
    suffix = won ? 'w' : 'l';
  }
  if (picked.then) c.career.queue.push({ event: picked.then.event, week: c.career.week + picked.then.after });
  const bad = picked.gamble ? suffix === 'l' : false;
  pushNews(c, { party: c.player, key: `event.${scene.event}.r${choice}${suffix}`, tone: bad ? 'bad' : suffix === 'w' ? 'good' : 'neutral' });
  return falls;
}

/** Puts a particular event on the leader's desk now, whatever the calendar says. */
export function raise(c: Campaign, id: string): void {
  if (EVENTS[id]) fire(c, id);
}

