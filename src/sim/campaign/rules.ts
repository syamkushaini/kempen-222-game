import { ZONE } from './geo';
import { ACTION_IDS, type ActionId, type PollScope, type SeniorId } from './types';

export type ContestKind = 'general' | 'state' | 'byelection' | 'hung';

/**
 * What differs between kinds of contest. The voter model and the campaign
 * rules are the same everywhere; these settings scale them to the size of the
 * fight.
 */
export interface Rules {
  kind: ContestKind;
  /** Multiplier on every amount of money, relative to a general election. */
  econ: number;
  /** Length of the campaign in weekly turns. */
  weeks: number;
  /** Actions on offer. */
  actions: readonly ActionId[];
  /** Kinds of poll the player can commission. */
  pollScopes: readonly PollScope[];
  /** Travel zone of each region, or null when everywhere is within easy reach. */
  zones: Record<string, string> | null;
  /** Leaders deal with each other during the campaign: pacts, understandings, defections. */
  diplomacy: boolean;
  /** How a government is formed afterwards, or null where the contest forms none. */
  formation: { cabinet: number; seniors: readonly SeniorId[]; days: number } | null;
  /** The contest is one election in a career: a term of years comes before it, and another after. */
  career: boolean;
}

const FEDERAL = { cabinet: 28, seniors: ['dpm', 'finance', 'home'], days: 5 } as const;

export const GENERAL_RULES: Rules = {
  kind: 'general',
  econ: 1,
  weeks: 8,
  actions: ACTION_IDS,
  pollScopes: ['national', 'state', 'seat'],
  zones: ZONE,
  diplomacy: true,
  formation: FEDERAL,
  career: false,
};

export const STATE_RULES: Rules = {
  kind: 'state',
  econ: 0.3,
  weeks: 6,
  actions: ACTION_IDS,
  pollScopes: ['national', 'state', 'seat'],
  zones: null,
  diplomacy: true,
  formation: { cabinet: 10, seniors: ['deputy'], days: 3 },
  career: false,
};

export const BYELECTION_RULES: Rules = {
  kind: 'byelection',
  econ: 0.1,
  weeks: 3,
  // One seat: nothing statewide, no television, no time to build branches.
  actions: ['ceramah', 'walkabout', 'canvass', 'gotv', 'social', 'attack', 'dinner', 'crowdfund'],
  pollScopes: ['seat'],
  zones: null,
  diplomacy: false,
  formation: null,
  career: false,
};

/** The votes are already counted and nobody has won: only the talks are played. */
export const HUNG_RULES: Rules = {
  kind: 'hung',
  // Campaign funds are mostly spent by now.
  econ: 0.25,
  weeks: 1,
  actions: [],
  pollScopes: [],
  zones: null,
  diplomacy: false,
  formation: FEDERAL,
  career: false,
};

/** A career: general elections five years apart, with the years between played too. */
export const CAREER_RULES: Rules = { ...GENERAL_RULES, career: true };
