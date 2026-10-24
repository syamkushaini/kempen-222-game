import { clamp } from '../math';
import { Rng } from '../rng';
import { shiftRelation } from './diplomacy';
import { pressReacts } from './media';
import { ONLINE } from './netizens';
import { pushNews } from './news';
import { inGov, lift } from './office';
import { isEnacted } from './policy';
import { endCareer } from './legacy';
import { statesHeld } from './contests';
import { BLOC_IDS } from '../types';
import type { Campaign, Career } from './types';

// The corruption meter ("graft"), 0 to 100, for the player's party. Dubious money and favours raise it; clean conduct, reform and
// coming clean lower it, slowly. While it is high the press, the netizens, the voters, the rivals and the partners turn on the party,
// and a party that has let it climb to the top and then loses power can be prosecuted. Everything here is a pure function of numbers,
// so that the thresholds and the odds can be read, tested and shown to the player (see DESIGN.md, "The corruption meter").
//
// It lives on the campaign (`Campaign.graft`), not on the career: the campaign outlasts every term, so nothing needs carrying.

export const GRAFT_MAX = 100;
/** The meter's levels: clean, whispers, shady, scandalous, notorious. A level begins at its number. */
export const GRAFT_LEVELS = [0, 20, 40, 60, 80] as const;
export type GraftLevel = 0 | 1 | 2 | 3 | 4;
/** At this level or above the agency can bring charges when power is lost. */
export const PROSECUTABLE: GraftLevel = 3;

export const graftOf = (c: Campaign): number => clamp(c.graft ?? 0, 0, GRAFT_MAX);
export function graftLevel(g: number): GraftLevel {
  let level = 0;
  GRAFT_LEVELS.forEach((from, i) => { if (g >= from) level = i; });
  return level as GraftLevel;
}

/** What raises the meter at once, by how it came about. */
export const RISE = {
  /** A tycoon's cheque in a campaign, and what it adds if it leaks (see actions.ts, turn.ts). */
  tycoon: 12, tycoonLeak: 12,
  /** Paid accounts online, and what it adds if they are traced (see media.ts). */
  troopers: 6, troopersLeak: 10,
  /** A foreign-tinted or otherwise bought defector, in the same terms as the events (see `graft` effects in the event lists). */
  event: 6,
};

/** What lifts and lowers the meter each week between elections, per step of each order. */
export const DRIFT = {
  donors: 0.07, state: 0.12, patronage: 0.16,
  /** All dubious orders at nothing: the slow way back. */
  clean: -0.12,
  /** A week in which all five conduct checks held (see conduct.ts). */
  sound: -0.06,
  /** The Anti-Graft Commission Act, once it is law. */
  commission: -0.08,
};

export interface DriftInputs { donors: number; state: number; patronage: number; clean: boolean; sound: boolean; commission: boolean }
/** The change in the meter for a week between elections. Pure. */
export function graftDrift(i: DriftInputs): number {
  const up = i.donors * DRIFT.donors + i.state * DRIFT.state + i.patronage * DRIFT.patronage;
  const down = (i.clean ? DRIFT.clean : 0) + (i.sound ? DRIFT.sound : 0) + (i.commission ? DRIFT.commission : 0);
  return up + down;
}

/** What each level does, each week. Index by level. */
export interface GraftEffects {
  /** Credibility, and the government's public trust (only while governing), lost each week. */
  cred: number; trust: number;
  /** Stability of the government lost each week (only while governing). */
  stability: number;
  /** Standing lost each week with the voters at large, and the extra with those who are online. */
  mood: number; online: number;
  /** The chance each week of a bad headline, and of the press turning one step colder to the party. */
  headline: number; press: number;
  /** The chance each week of a rival or a partner marking the party down, and of a scandal landing on the desk. */
  rivals: number; scandal: number;
  /** What the campaign loses each week, in the voters' logit units. */
  campaign: number;
}
const NONE: GraftEffects = { cred: 0, trust: 0, stability: 0, mood: 0, online: 0, headline: 0, press: 0, rivals: 0, scandal: 0, campaign: 0 };
export const EFFECTS: readonly GraftEffects[] = [
  NONE,
  { ...NONE, headline: 0.04, online: 0.0003, campaign: 0.002 },
  { cred: 0.03, trust: 0.02, stability: 0, mood: 0.0003, online: 0.0007, headline: 0.1, press: 0.03, rivals: 0.03, scandal: 0.008, campaign: 0.005 },
  { cred: 0.08, trust: 0.06, stability: 0.05, mood: 0.0008, online: 0.0016, headline: 0.2, press: 0.06, rivals: 0.06, scandal: 0.016, campaign: 0.01 },
  { cred: 0.15, trust: 0.12, stability: 0.12, mood: 0.0016, online: 0.003, headline: 0.35, press: 0.1, rivals: 0.1, scandal: 0.03, campaign: 0.02 },
];
export const effectsOf = (g: number): GraftEffects => EFFECTS[graftLevel(g)];

// ---------- prosecution ----------

/** How the player stands when power is lost or given up. */
export type Fall = 'lost' | 'partner' | 'retired' | 'won';

export const JAIL = {
  /** At the first prosecutable point (60), the chance on losing the election; then a further share per point, up to a ceiling. */
  base: 0.12, perPoint: 0.0135, max: 0.65,
  /** Out of the government's top seat but still in it, as a partner; or leaving of one's own accord. */
  partner: 0.4, retired: 0.5,
};

/**
 * The chance that the agency brings charges and the court convicts, given the meter and how power ended. Nothing below the
 * prosecutable level and nothing for a party that won (the agency answers to those in power: a win is a shield, not an
 * acquittal, and the scandals still come). A partner in a government is half-protected; a leader who retires is not safe.
 */
export function prosecutionChance(g: number, fall: Fall): number {
  if (graftLevel(g) < PROSECUTABLE || fall === 'won') return 0;
  const lost = clamp(JAIL.base + (g - GRAFT_LEVELS[PROSECUTABLE]) * JAIL.perPoint, 0, JAIL.max);
  return lost * (fall === 'partner' ? JAIL.partner : fall === 'retired' ? JAIL.retired : 1);
}

/** Whether a roll in [0, 1) lands the party in the dock. */
export const convicted = (g: number, fall: Fall, roll: number): boolean => roll < prosecutionChance(g, fall);

// ---------- moving the meter ----------

/** Adds to the meter (or takes from it), and tells the press when a level is crossed. */
export function addGraft(c: Campaign, n: number): void {
  c.graft = clamp(graftOf(c) + n, 0, GRAFT_MAX);
  if (c.graft === 0) delete c.graft;
  announce(c);
}

/** The meter has crossed into a new level since the player was last told. */
function announce(c: Campaign): void {
  const now = graftLevel(graftOf(c));
  const seen = c.graftSeen ?? 0;
  if (now === seen) return;
  if (now === 0) delete c.graftSeen; else c.graftSeen = now;
  pushNews(c, { party: c.player, key: `news.graft.${now > seen ? 'up' : 'down'}.${now}`, tone: now > seen ? 'bad' : 'good' });
}

const salt = (c: Campaign, week: number, k = 0) => (c.rng ^ 0x6a4f7) + week * 31 + k * 977;

/** The scandals that can land on the desk, from the mildest level that allows each. */
export const SCANDALS = ['graftTip', 'graftLeak', 'graftProbe'] as const;
const COOL = 18;

/**
 * The bite of the meter on a week, whether between elections or in a campaign: headlines, a colder press, rivals and partners marking the
 * party down. Uses a random stream of its own, so that a clean game plays out as it always did.
 */
function bite(c: Campaign, rng: Rng, e: GraftEffects): void {
  const me = c.player;
  if (e.headline > 0 && rng.next() < e.headline) {
    pushNews(c, { party: me, key: `news.graft.press.${1 + rng.int(3)}`, tone: 'bad' });
  }
  if (e.press > 0 && rng.next() < e.press) pressReacts(c, me, -1, ['kini', 'viral', 'ledger', 'tribune']);
  if (e.rivals > 0 && rng.next() < e.rivals) {
    const rivals = c.parties.map((pc, p) => (pc && p !== me ? p : -1)).filter((p) => p >= 0);
    if (rivals.length > 0) {
      const p = rivals[rng.int(rivals.length)];
      shiftRelation(c, me, p, -2);
      pushNews(c, { party: p, key: 'news.graft.rival', vars: { party: `@party:${p}` }, tone: 'neutral' });
    }
  }
}

/**
 * A week between elections. Moves the meter by what the orders and the conduct say, then applies what its level costs. Called after the
 * week's conduct is judged. The only random draws are from a stream of its own.
 */
export function graftWeek(c: Campaign): void {
  const k = c.career as Career;
  const rng = new Rng(salt(c, k.week, k.term));
  const governing = inGov(c, c.player);
  const o = k.orders;
  const drift = graftDrift({
    donors: o.donors, state: o.state, patronage: statesHeld(c, c.player) > 0 ? k.patronage ?? 0 : 0,
    clean: o.donors === 0 && o.state === 0 && !k.patronage, sound: k.conduct?.delta === 1, commission: isEnacted(k, 'graftCommission'),
  });
  if (drift !== 0 || c.graft !== undefined) addGraft(c, drift);
  const e = effectsOf(graftOf(c));
  if (e === NONE) return;
  const me = c.player;
  k.credibility = clamp(k.credibility - e.cred, 0, 100);
  if (governing) {
    k.government.trust = clamp(k.government.trust - e.trust, 0, 100);
    k.government.stability = clamp(k.government.stability - e.stability, 5, 95);
  }
  for (const row of k.mood) row[me] -= e.mood;
  lift(k, me, ONLINE, -e.online);
  bite(c, rng, e);
  // A scandal lands on the desk now and then: only if nothing is waiting, and not twice in a row.
  if (e.scandal > 0 && c.inbox.length === 0 && !k.queue.some((q) => (SCANDALS as readonly string[]).includes(q.event)) && rng.next() < e.scandal) {
    const level = graftLevel(graftOf(c));
    const pool = SCANDALS.filter((id, i) => i < level - 1 && !((k.eventWeeks?.[id] ?? -999) > k.week - COOL));
    if (pool.length > 0) k.queue.push({ event: pool[rng.int(pool.length)], week: k.week + 1 });
  }
}

/** A week of a campaign: the meter does not move on its own, but the voters, the press and the rivals feel it. */
export function graftCampaignWeek(c: Campaign): void {
  const g = graftOf(c);
  const e = effectsOf(g);
  if (e === NONE) return;
  const rng = new Rng(salt(c, c.week, 0));
  for (let b = 0; b < BLOC_IDS.length; b++) c.dyn.support.nat[b][c.player] -= e.campaign * (ONLINE.includes(BLOC_IDS[b]) ? 1.5 : 1);
  bite(c, rng, { ...e, rivals: e.rivals * 2 });
}

// ---------- prosecution ----------

/** How the player's party stands when the votes are counted and the government is made. */
export function fallOf(c: Campaign, pm: number, partners: readonly number[]): Fall {
  return pm === c.player ? 'won' : partners.includes(c.player) ? 'partner' : 'lost';
}

/** A fixed roll for the verdict of a given term, so that the answer is the same however the game is saved and loaded. */
export function verdictRoll(c: Campaign, term: number): number {
  return new Rng((c.seed ^ 0x6a11) + term * 7919).next();
}

/**
 * Power is lost or given up: the agency may bring charges. If it does, the career is over (see `endCareer`, kind 'jailed'). `salt` keeps
 * the roll of a retirement apart from that of an election in the same term. Returns whether the leader was jailed.
 */
export function prosecute(c: Campaign, fall: Fall, term: number, salt = 0): boolean {
  const g = graftOf(c);
  if (graftLevel(g) < PROSECUTABLE || fall === 'won') return false;
  if (!convicted(g, fall, verdictRoll(c, term * 2 + salt))) {
    pushNews(c, { party: c.player, key: 'news.graft.escaped', tone: 'neutral' });
    return false;
  }
  pushNews(c, { party: c.player, key: 'news.graft.jailed', tone: 'bad' });
  endCareer(c, 'jailed');
  return true;
}
