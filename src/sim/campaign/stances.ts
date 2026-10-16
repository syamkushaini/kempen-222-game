import { clamp } from '../math';
import type { BlocId } from '../types';
import { isFederal } from './defence';
import { isPm, lift } from './office';
import type { Campaign, Career } from './types';

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

/** Moves a slider. Only the head of government, during a term; the armed forces' only in a country. */
export function setStance(c: Campaign, id: StanceId, notch: number): boolean {
  const k = c.career;
  if (!k || c.phase !== 'term' || !isPm(c) || !STANCE_IDS.includes(id) || !NOTCHES.includes(notch as Notch)) return false;
  if (!stanceAvailable(c.scenario, id)) return false;
  const stance = (k.stance ??= {});
  if (notch === 0) delete stance[id]; else stance[id] = notch as Notch;
  if (Object.keys(stance).length === 0) delete k.stance;
  return true;
}

/** Where each slider moves where its meter is heading, in points. */
export function stanceShift(k: Career): Record<StanceId, number> {
  return Object.fromEntries(STANCE_IDS.map((id) => [id, STANCES[id].shift * stanceOf(k, id) || 0])) as Record<StanceId, number>;
}

/** What the sliders cost the treasury a week, as a share of the head of government's allocation: pushing costs, easing off saves a little. */
export function stanceCost(k: Career, only?: StanceId, federal = true): number {
  return (only ? [only] : [...STANCE_IDS]).reduce<number>((a, id) => {
    if (!federal && FORCES_STANCES.includes(id)) return a;
    const n = stanceOf(k, id);
    return a + STANCES[id].cost * (n > 0 ? n : n * SAVING);
  }, 0);
}

/** What the sliders add to the pull on growth, in points a year. */
export const stanceGrowth = (k: Career): number => STANCE_IDS.reduce((a, id) => a + (STANCES[id].growth ?? 0) * stanceOf(k, id), 0);

/** One week: voters feel what the head of government is pushing or easing off, and some of it wears on the government. */
export function stanceWeek(c: Campaign): void {
  const k = c.career!;
  const g = k.government;
  for (const id of STANCE_IDS) {
    const n = stanceOf(k, id);
    if (n === 0 || !stanceAvailable(c.scenario, id)) continue;
    const def = STANCES[id];
    for (const [blocs, sign] of [[def.likes, 1], [def.dislikes, -1]] as const) {
      lift(k, g.pm, blocs, FEEL * n * sign);
      for (const p of g.partners) lift(k, p, blocs, (FEEL * n * sign) / 2);
    }
    if (def.stability && n > 0) g.stability = clamp(g.stability + def.stability * n, 5, 95);
  }
}
