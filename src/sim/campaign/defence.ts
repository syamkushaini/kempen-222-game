import type { World } from '../election';
import { clamp } from '../math';
import type { Rng } from '../rng';
import type { BlocId } from '../types';
import { WEAK, STRONG } from './nation';
import { builtMeters } from './econPlansData';
import { isPm, lift, skillOf } from './office';
import { isEnacted } from './policy';
import { CONTROL_COST_TO_READINESS, stanceShift } from './stances';
import { pestelOf } from './pestel';
import type { Budget, Campaign, Career, DefenceFigures, Dial } from './types';

// Defence: the armed forces, for a country and not for a state. Two meters from 0 to 100, kept like the nation's figures. How ready they
// are follows what the budget spends on them and the minister who runs them, and falls when they are starved. How much say they have in
// the government's business grows with the same spending, and is held back by a country where the law is respected. A weak force makes
// trouble at the border and at sea worse and the country less well thought of abroad; a force with a great deal of say asks more of the
// government, charges it more for what it buys, and leaves it less room. All of it invented, and none of it about anyone real.

export const START_DEFENCE: DefenceFigures = { readiness: 55, influence: 40 };
export const DEFENCE_KEYS = ['readiness', 'influence'] as const;
export type DefenceKey = (typeof DEFENCE_KEYS)[number];

/** Whether a scenario is the country's own (the defence of the realm is the federation's, not a state's). */
export const isFederal = (scenario: string): boolean => !scenario.startsWith('career:') && !scenario.startsWith('state:');
export const isFederalWorld = (world: World): boolean => world.rules.kind !== 'state';
/** Whether the defence line and its meters are the player's to see: a head of the federal government only. */
export const defenceShown = (c: Campaign): boolean => isFederal(c.scenario) && isPm(c);

/** A career's figures, set to their starting values in a game saved before they existed. */
export const defenceOf = (k: Career): DefenceFigures => (k.defence ??= { ...START_DEFENCE });

/** Moves the figures by the amounts given, keeping each between 0 and 100. A state has no armed forces to move. */
export function shiftDefence(c: Campaign, patch: Partial<DefenceFigures>): void {
  if (!isFederal(c.scenario)) return;
  const d = defenceOf(c.career!);
  for (const key of DEFENCE_KEYS) if (patch[key]) d[key] = clamp(d[key] + patch[key]!, 0, 100);
}

/** A budget's setting for the defence line: held where it has none. */
export const defenceDial = (b: Budget): Dial => b.lines.defence ?? 0;

/**
 * Where each figure is heading, given the budget in force, the minister at defence, the state of the books and the rule of law.
 * Readiness rises with spending and a capable minister; influence rises with spending too, and is held back where the law is strong.
 */
export function defenceTargets(k: Career): DefenceFigures {
  const dial = defenceDial(k.tabled);
  const skill = skillOf(k, 'defence');
  const squeeze = Math.max(0, k.economy.debt - 80) * 0.15;
  const d = defenceOf(k);
  // Programmes finished, and the Act that has civilians watch the armed forces, hold the figures up or down for good.
  const built = builtMeters(k);
  const s = stanceShift(k);
  return {
    readiness: clamp(50 + 16 * dial + 2.5 * (skill - 3) + built.readiness + s.readiness + CONTROL_COST_TO_READINESS * Math.min(0, s.influence) - squeeze, 15, 90),
    influence: clamp(40 + 15 * dial + 0.12 * (d.readiness - 50) - 1.5 * (skill - 3) - 0.2 * (pestelOf(k).law - 55) + built.influence + s.influence - 8 * Number(isEnacted(k, 'defenceOversight')), 10, 90),
  };
}

/**
 * A capable minister speeds readiness up and slows its fall; a poor one does the reverse. Influence has no such help, and a poor
 * minister lets the officers do as they please.
 */
const BASE_RATE = 0.015;
export function readinessRate(k: Career, rising: boolean): number {
  const lean = 0.2 * (skillOf(k, 'defence') - 3);
  return BASE_RATE * clamp(1 + (rising ? lean : -lean), 0.3, 1.8);
}

/** Which groups of voters notice a figure, and the week's change in how they think of those in office, per point above or below its start. */
const NOTICE: Record<DefenceKey, BlocId[]> = {
  readiness: ['heartland', 'felda', 'seniors', 'borneo_native', 'smallbiz'],
  // Those who watch how the armed forces are kept in their place.
  influence: ['urban_lib', 'civil', 'undi18', 'm40'],
};
const FEEL = 0.00001;

/** What the armed forces charge the government above the plain price of what they buy, once their say is great: up to a fifth more. */
export const procurementMult = (k: Career): number => 1 + 0.2 * clamp((defenceOf(k).influence - STRONG) / (100 - STRONG), 0, 1);

/** One week of a federal career: each figure drifts to its target, voters credit or blame those in office, and a force with great say leaves the government less room. */
export function defenceWeek(c: Campaign, rng: Rng): void {
  if (!isFederal(c.scenario)) return;
  const k = c.career!;
  const d = defenceOf(k);
  const target = defenceTargets(k);
  for (const key of DEFENCE_KEYS) {
    const rate = key === 'readiness' ? readinessRate(k, target[key] > d[key]) : BASE_RATE;
    d[key] = clamp(d[key] + (target[key] - d[key]) * rate + rng.normal(0, 0.05), 0, 100);
    // Readiness is welcome; the armed forces having a say is not.
    const feel = (key === 'readiness' ? d[key] - START_DEFENCE[key] : START_DEFENCE[key] - d[key]) * FEEL;
    lift(k, k.government.pm, NOTICE[key], feel);
    for (const p of k.government.partners) lift(k, p, NOTICE[key], feel / 2);
  }
  // Less room: a government that the armed forces have a great say over steadies itself less.
  if (d.influence > STRONG) k.government.stability = clamp(k.government.stability - (d.influence - STRONG) * 0.004, 5, 95);
}

/** Cutting the armed forces' line when they have the say to resent it: the government pays for it in steadiness. */
export function resentCut(c: Campaign, plan: Budget): void {
  if (!isFederal(c.scenario) || defenceDial(plan) >= 0 || defenceOf(c.career!).influence < STRONG) return;
  const g = c.career!.government;
  g.stability = clamp(g.stability - 4, 5, 95);
}

/** The border and the sea: how badly these go depends on how ready the armed forces are. */
export const BORDER_SEA: ReadonlySet<string> = new Set(['borderStandoff', 'seaIncident', 'refugeeBoats', 'twoPowers']);
/** How much worse the losses in such an event are when the force is weak. */
export const WEAK_FORCE = 1.4;
/** Whether the armed forces are too weak for the border and sea to be safe. */
export const forceWeak = (c: Campaign): boolean => isFederal(c.scenario) && defenceOf(c.career!).readiness < WEAK;
