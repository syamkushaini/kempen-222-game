import { clamp } from '../math';
import type { BlocId } from '../types';
import { isFederal } from './defence';
import { ministerName, isPm, lift } from './office';
import { pushNews } from './news';
import type { Campaign, Career, Minister, PortfolioId } from './types';

// Standing policy for the meters the budget does not reach: a slider for each, from -2 (ease off) to 2 (push hard), left where it is until the
// head of government moves it. Each notch shifts where its meter is heading, costs (or, eased off, saves) a little every week, and is liked by some
// voters and not by others, with a price of its own besides: growth, steadiness, or another meter. Nothing is free, and nothing is for ever. The
// armed forces' two are a country's only.

export const STANCE_IDS = ['cohesion', 'tech', 'environment', 'law', 'readiness', 'influence'] as const;
export type StanceId = (typeof STANCE_IDS)[number];
/** From -2 (ease off) to 2 (push hard). */
export type Notch = -2 | -1 | 0 | 1 | 2;
export const NOTCHES: readonly Notch[] = [-2, -1, 0, 1, 2];
export const FORCES_STANCES: readonly StanceId[] = ['readiness', 'influence'];

export interface StanceDef {
  /** What a notch moves where the meter is heading, in points (for the influence slider, a notch up is civilian control, and lowers the armed forces' say). */
  shift: number;
  /** What a notch up costs a week, as a share of the head of government's allocation; easing off saves half as much. */
  cost: number;
  /** Who is pleased by a notch up (and displeased by easing off), and who is the other way about. */
  likes: BlocId[]; dislikes: BlocId[];
  /** What a notch up does each week besides: a drift to growth (a point a year), and to the government's steadiness. */
  growth?: number; stability?: number;
}

export const STANCES: Record<StanceId, StanceDef> = {
  cohesion: { shift: 3, cost: 0.04, likes: ['urban_b40', 'heartland', 'borneo_native', 'civil'], dislikes: ['urban_lib'] },
  tech: { shift: 3, cost: 0.05, likes: ['undi18', 'gig', 'm40', 'smallbiz'], dislikes: ['civil'], growth: 0.04 },
  environment: { shift: 3, cost: 0.03, likes: ['urban_lib', 'undi18', 'borneo_native'], dislikes: ['agri', 'smallbiz', 'felda'], growth: -0.05 },
  law: { shift: 3, cost: 0.03, likes: ['urban_lib', 'm40', 'civil'], dislikes: ['smallbiz'], stability: -0.012 },
  readiness: { shift: 3, cost: 0.05, likes: ['heartland', 'felda', 'seniors', 'borneo_native'], dislikes: ['urban_lib', 'undi18'] },
  influence: { shift: -3, cost: 0.02, likes: ['urban_lib', 'civil', 'undi18'], dislikes: ['heartland', 'felda'], stability: -0.015 },
};
/** Per notch: what each voter group feels each week, and the share of readiness that a notch of civilian control costs. */
const FEEL = 0.0004;
export const CONTROL_COST_TO_READINESS = 0.5;
/** How much more a notch of push costs than a notch of easing off saves. */
const SAVING = 0.5;

export const stanceOf = (k: Career, id: StanceId): Notch => (k.stance?.[id] ?? 0) as Notch;
/** Whether a slider is on offer where the career is. */
export const stanceAvailable = (scenario: string, id: StanceId): boolean => !FORCES_STANCES.includes(id) || isFederal(scenario);

// ---------- political capital ----------
// Pushing or easing off takes effort: every notch away from the middle costs a point of political capital, and there is only so much. A leader
// who is believed has more. Over the limit (credibility falls with the sliders where they were) everything is stretched thin.

export const CAPITAL_BASE = 8;
/** The political capital a head of government has: 8 at an ordinary credibility, a point more for each ten above 60, and fewer below. */
export const capitalOf = (k: Career): number => clamp(Math.round(CAPITAL_BASE + (k.credibility - 60) / 10), 5, 12);
/** The capital the sliders take now, or would with one moved to a notch. */
export const capitalUsed = (k: Career, change?: [StanceId, number]): number =>
  STANCE_IDS.reduce((a, id) => a + Math.abs(change && change[0] === id ? change[1] : stanceOf(k, id)), 0);
/** How much of what the sliders would do they do: all of it within the capital, and a share of it beyond. */
export const stretch = (k: Career): number => { const used = capitalUsed(k); return used <= capitalOf(k) ? 1 : capitalOf(k) / used; };

/** Moves a slider. Only the head of government, during a term; the armed forces' only in a country; and never past the capital there is. */
export function setStance(c: Campaign, id: StanceId, notch: number): boolean {
  const k = c.career;
  if (!k || c.phase !== 'term' || !isPm(c) || !STANCE_IDS.includes(id) || !NOTCHES.includes(notch as Notch)) return false;
  if (!stanceAvailable(c.scenario, id)) return false;
  const now = capitalUsed(k);
  const then = capitalUsed(k, [id, notch]);
  // What takes more capital than there is may not be asked for; what takes less may always be done.
  if (then > capitalOf(k) && then > now) return false;
  const stance = (k.stance ??= {});
  if (notch === 0) delete stance[id]; else stance[id] = notch as Notch;
  if (Object.keys(stance).length === 0) delete k.stance;
  return true;
}

// ---------- combinations ----------
// Some sliders work together and some against each other. A combination is in play while both its sliders are held the way it needs: pushed (a notch
// or more up) or eased (a notch or more down). The first time one comes into play it is in the news.

type Way = 'push' | 'ease';
export interface Combo {
  id: string; kind: 'bonus' | 'clash';
  needs: [[StanceId, Way], [StanceId, Way]];
  /** What it does to where the meters are heading, in points. */
  shift?: Partial<Record<StanceId, number>>;
  /** What it does each week to the government's steadiness and to public trust, and to growth (a point a year). */
  stability?: number; trust?: number; growth?: number;
}
export const COMBOS: Combo[] = [
  { id: 'digitalIntegrity', kind: 'bonus', needs: [['tech', 'push'], ['law', 'push']], shift: { tech: 2, law: 2 } },
  { id: 'greenGrowth', kind: 'bonus', needs: [['environment', 'push'], ['tech', 'push']], shift: { environment: 2 }, growth: 0.05 },
  { id: 'nationalPride', kind: 'bonus', needs: [['readiness', 'push'], ['cohesion', 'push']], shift: { cohesion: 2, readiness: 1 } },
  { id: 'professionalArmy', kind: 'bonus', needs: [['readiness', 'push'], ['influence', 'push']], shift: { readiness: 2 } },
  { id: 'surveillanceState', kind: 'clash', needs: [['tech', 'push'], ['law', 'ease']], shift: { law: -3 }, trust: -0.03 },
  { id: 'praetorian', kind: 'clash', needs: [['readiness', 'push'], ['influence', 'ease']], shift: { influence: 3 }, stability: -0.02 },
];
const held = (k: Career, [id, way]: [StanceId, Way]): boolean => (way === 'push' ? stanceOf(k, id) >= 1 : stanceOf(k, id) <= -1);
/** The combinations in play now. */
export const activeCombos = (k: Career): Combo[] => COMBOS.filter((x) => x.needs.every((n) => held(k, n)));

/** Where each slider (and each combination in play) moves where its meter is heading, in points, stretched thin when capital is short. */
export function stanceShift(k: Career): Record<StanceId, number> {
  const out = Object.fromEntries(STANCE_IDS.map((id) => [id, STANCES[id].shift * stanceOf(k, id)])) as Record<StanceId, number>;
  for (const combo of activeCombos(k)) for (const [id, n] of Object.entries(combo.shift ?? {})) out[id as StanceId] += n;
  const s = stretch(k);
  for (const id of STANCE_IDS) out[id] = out[id] * s || 0;
  return out;
}

/** What the sliders cost the treasury a week, as a share of the head of government's allocation: pushing costs, easing off saves a little. */
export function stanceCost(k: Career, only?: StanceId, federal = true): number {
  return (only ? [only] : [...STANCE_IDS]).reduce<number>((a, id) => {
    if (!federal && FORCES_STANCES.includes(id)) return a;
    const n = stanceOf(k, id);
    return a + STANCES[id].cost * (n > 0 ? n : n * SAVING);
  }, 0);
}

/** What the sliders (and combinations) add to the pull on growth, in points a year. */
export const stanceGrowth = (k: Career): number =>
  (STANCE_IDS.reduce((a, id) => a + (STANCES[id].growth ?? 0) * stanceOf(k, id), 0) + activeCombos(k).reduce((a, x) => a + (x.growth ?? 0), 0)) * stretch(k);

// ---------- ministers ----------
// The minister whose post a slider belongs to has a view on where it is set, in their own voice. A minister who is furious about it for half a year
// says so in public, and the government pays for it.

export const STANCE_PORTFOLIO: Record<StanceId, PortfolioId> = { cohesion: 'women', tech: 'digital', environment: 'environment', law: 'law', readiness: 'defence', influence: 'defence' };
export type Mood = 'delighted' | 'pleased' | 'neutral' | 'uneasy' | 'furious';
export const ministerFor = (k: Career, id: StanceId): Minister | undefined => k.cabinet.find((m) => m.portfolio === STANCE_PORTFOLIO[id]);
/** How the minister takes the slider: they want their own post pushed; a defence minister wants the armed forces' say left alone. */
export function ministerMood(k: Career, id: StanceId): Mood {
  const n = stanceOf(k, id) * (id === 'influence' ? -1 : 1);
  return n >= 2 ? 'delighted' : n === 1 ? 'pleased' : n === 0 ? 'neutral' : n === -1 ? 'uneasy' : 'furious';
}
/** Weeks a furious minister puts up with it before saying so. */
export const GRUMBLE_WEEKS = 26;

/** One week: voters feel what the head of government is pushing or easing off, combinations show up, ministers grumble, and some of it wears on the government. */
export function stanceWeek(c: Campaign): void {
  const k = c.career!;
  const g = k.government;
  const s = stretch(k);
  for (const id of STANCE_IDS) {
    const n = stanceOf(k, id);
    if (n === 0 || !stanceAvailable(c.scenario, id)) continue;
    const def = STANCES[id];
    for (const [blocs, sign] of [[def.likes, 1], [def.dislikes, -1]] as const) {
      lift(k, g.pm, blocs, FEEL * n * sign);
      for (const p of g.partners) lift(k, p, blocs, (FEEL * n * sign) / 2);
    }
    if (def.stability && n > 0) g.stability = clamp(g.stability + def.stability * n * s, 5, 95);
  }
  // Combinations: what they do each week, and the news the week they come into play.
  const now = activeCombos(k);
  for (const combo of now) {
    if (combo.stability) g.stability = clamp(g.stability + combo.stability * s, 5, 95);
    if (combo.trust) g.trust = clamp(g.trust + combo.trust * s, 0, 100);
    if (!k.combos?.includes(combo.id)) {
      pushNews(c, { party: c.player, key: `news.combo.${combo.id}`, tone: combo.kind === 'bonus' ? 'good' : 'bad' });
      if (!k.combosSeen?.includes(combo.id)) (k.combosSeen ??= []).push(combo.id);
    }
  }
  if (now.length) k.combos = now.map((x) => x.id); else delete k.combos;
  // A minister left furious by a slider says so, after half a year and every half year after.
  for (const id of STANCE_IDS) {
    const m = ministerFor(k, id);
    if (!stanceAvailable(c.scenario, id) || !m || m.acting || ministerMood(k, id) !== 'furious') { if (k.grumbled) { delete k.grumbled[id]; if (Object.keys(k.grumbled).length === 0) delete k.grumbled; } continue; }
    const since = (k.grumbled ??= {})[id];
    if (since === undefined) { k.grumbled[id] = k.week; continue; }
    if (k.week - since >= GRUMBLE_WEEKS) {
      k.grumbled[id] = k.week;
      k.credibility = clamp(k.credibility - 1, 0, 100);
      g.stability = clamp(g.stability - 1, 5, 95);
      pushNews(c, { party: c.player, key: 'news.grumble', vars: { minister: ministerName(m), slider: `@stance:${id}` }, tone: 'bad' });
    }
  }
}
