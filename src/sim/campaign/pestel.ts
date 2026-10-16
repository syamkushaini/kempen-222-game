import { clamp } from '../math';
import type { Rng } from '../rng';
import type { BlocId } from '../types';
import { nationOf } from './nation';
import { inGov, isPm, lift } from './office';
import { isEnacted } from './policy';
import type { Campaign, Career, Economy, PortfolioId } from './types';

// PESTEL: six ways of looking at how a country, or a state, is doing. Three of them are the figures the game already kept: the
// political (how steady and trusted the government is, and its standing), the economic (growth, prices, jobs and debt) and part of the
// social (health and schooling). Four meters are new, each from 0 to 100 like the nation's: how well people hold together, how far the
// country has gone digital, how well its land, water and air are kept, and how far the law is respected and the powerful answer to it.
// They move slowly with the budget, the ministers who hold the posts that matter to each, the laws passed and how those in office
// behave, and jump when something happens. Voters notice. Only those in government answer for them.

export interface Pestel { cohesion: number; tech: number; environment: number; law: number }
export const PESTEL_KEYS = ['cohesion', 'tech', 'environment', 'law'] as const;
export type PestelKey = (typeof PESTEL_KEYS)[number];

export const START_PESTEL: Pestel = { cohesion: 55, tech: 50, environment: 55, law: 55 };
/** The groups of the analysis and the meters each shows. Economic ones are worked out from the economy's own figures. */
export const PESTEL_GROUPS = [
  { id: 'political', meters: ['stability', 'trust', 'standing'] },
  { id: 'economic', meters: ['growth', 'inflation', 'jobless', 'debt'] },
  { id: 'social', meters: ['health', 'education', 'cohesion'] },
  { id: 'technological', meters: ['tech'] },
  { id: 'environmental', meters: ['environment'] },
  { id: 'legal', meters: ['law'] },
] as const;
export type PestelGroup = (typeof PESTEL_GROUPS)[number]['id'];

/** A career's figures, set to their starting values in a game saved before they existed. */
export const pestelOf = (k: Career): Pestel => (k.pestel ??= { ...START_PESTEL });

/** Moves the figures by the amounts given, keeping each between 0 and 100. */
export function shiftPestel(k: Career, patch: Partial<Pestel>): void {
  const p = pestelOf(k);
  for (const key of PESTEL_KEYS) if (patch[key]) p[key] = clamp(p[key] + patch[key]!, 0, 100);
}

const skill = (k: Career, id: PortfolioId) => k.cabinet.find((m) => m.portfolio === id)?.skill ?? 3;

/**
 * Where each figure is heading, given the budget in force, the ministers in the posts that matter to it, the laws on the books and
 * how those in office behave. `believed` is how far the head of the government is believed.
 */
export function pestelTargets(k: Career, believed: number = k.credibility): Pestel {
  const lines = k.tabled.lines;
  const e = k.economy;
  const squeeze = Math.max(0, e.debt - 80) * 0.15;
  const built = k.built?.length ?? 0;
  const strain = (k.projects?.length ?? 0) * 2;
  return {
    // People hold together when the poor are looked after, jobs and prices are tolerable, and those who look after the family and the young are good at it.
    cohesion: clamp(55 + 8 * lines.aid + 2 * (skill(k, 'women') - 3) + 1.5 * (skill(k, 'youth') - 3) + (skill(k, 'religion') - 3)
      - 0.8 * Math.max(0, e.jobless - 4) - 0.4 * Math.max(0, e.inflation - 3) + 0.1 * (k.government.trust - 50) - squeeze, 15, 90),
    // A country goes digital on its schooling, its research and the ministers who run them, and on what has been built.
    tech: clamp(50 + 6 * lines.education + 3 * (skill(k, 'digital') - 3) + 2 * (skill(k, 'science') - 3) + (skill(k, 'comms') - 3)
      + 1.5 * (skill(k, 'highered') - 3) + 2 * Math.min(5, built) + 0.05 * (believed - 60) - squeeze, 15, 90),
    // Land, water and air are kept by those whose posts they are, by the laws for them, and not by a country in a rush to build.
    environment: clamp(55 + 3 * (skill(k, 'environment') - 3) + 2 * (skill(k, 'energy') - 3) + (skill(k, 'agri') - 3) + 6 * Number(isEnacted(k, 'greenGrid'))
      - strain - 0.4 * Math.max(0, e.growth - 5), 15, 90),
    // The law is respected where the ministers in charge of it are able, where reforms stand on the books, and where those in office do not lean on state money, donors or the institutions.
    law: clamp(55 + 3 * (skill(k, 'law') - 3) + 1.5 * (skill(k, 'home') - 3) + 8 * Number(isEnacted(k, 'graftCommission')) + 4 * Number(isEnacted(k, 'infoAct'))
      - 3 * k.orders.state - 2 * k.orders.donors + 0.1 * (k.government.trust - 50), 15, 90),
  };
}

/** Which groups of voters notice each figure. */
const NOTICE: Record<PestelKey, BlocId[]> = {
  cohesion: ['urban_b40', 'heartland', 'borneo_native', 'civil', 'seniors'],
  tech: ['undi18', 'gig', 'm40', 'urban_lib', 'smallbiz'],
  environment: ['agri', 'felda', 'heartland', 'urban_lib', 'undi18', 'borneo_native'],
  law: ['urban_lib', 'm40', 'civil', 'smallbiz', 'undi18'],
};
/** The week's change in how voters think of those in office, per point the figure is above or below where it began. */
const FEEL = 0.00001;

/** One week: each figure drifts towards its target, and those in office answer for how the country is doing. */
export function pestelWeek(c: Campaign, rng: Rng): void {
  const k = c.career!;
  const p = pestelOf(k);
  const target = pestelTargets(k, isPm(c) ? k.credibility : 60);
  for (const key of PESTEL_KEYS) {
    p[key] = clamp(p[key] + (target[key] - p[key]) * 0.015 + rng.normal(0, 0.05), 0, 100);
    const feel = (p[key] - START_PESTEL[key]) * FEEL;
    lift(k, k.government.pm, NOTICE[key], feel);
    for (const partner of k.government.partners) lift(k, partner, NOTICE[key], feel / 2);
  }
}

/** Whether the player has the country to answer for. */
export const pestelAnswers = (c: Campaign): boolean => isPm(c) || inGov(c, c.player);

/** How well each economic figure is doing, from 0 (in trouble) to 100 (at ease): so that the six groups can be read the same way. */
export function economicScores(e: Economy): Record<'growth' | 'inflation' | 'jobless' | 'debt', number> {
  return {
    growth: clamp(50 + 12 * (e.growth - 4), 0, 100),
    inflation: clamp(100 - 18 * Math.max(0, e.inflation - 1.5), 0, 100),
    jobless: clamp(100 - 12 * Math.max(0, e.jobless - 2.5), 0, 100),
    debt: clamp(100 - 1.1 * Math.max(0, e.debt - 30), 0, 100),
  };
}

/** Every meter on a scale of 0 to 100, in the order of the groups. */
export function pestelScores(k: Career): Record<string, number> {
  const n = nationOf(k);
  const p = pestelOf(k);
  return {
    stability: k.government.stability, trust: k.government.trust, standing: n.standing,
    ...economicScores(k.economy),
    health: n.health, education: n.education, cohesion: p.cohesion, tech: p.tech, environment: p.environment, law: p.law,
  };
}

/** The mean of the meters in a group. */
export function groupScore(k: Career, group: PestelGroup): number {
  const scores = pestelScores(k);
  const meters = PESTEL_GROUPS.find((g) => g.id === group)!.meters as readonly string[];
  return meters.reduce((a, m) => a + scores[m], 0) / meters.length;
}
