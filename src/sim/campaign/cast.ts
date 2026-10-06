import { N_PARTIES, PARTY_IDS, type FieldedId, type PartyId } from '../types';
import type { ContestKind } from './rules';
import type { DemandId, Offer, SeniorId } from './types';

type Real = Exclude<PartyId, 'oth'>;

/**
 * The leaders of the parties. All are invented. Names are proper nouns and are
 * the same in every language. The player takes the place of their own party's
 * leader.
 */
export const LEADERS: Record<Real, string> = {
  ps: 'Datuk Seri Hakim Zulkarnain',
  bp: 'Datuk Seri Rahmat Kassim',
  pt: 'Tan Sri Baharom Salleh',
  gbk: 'Datuk Patinggi Wan Sulaiman Jalil',
  gbs: 'Datuk Seri Harun Majid',
  legasi: 'Datuk Seri Jaafar Usman',
  genba: 'Cik Nurin Sofea',
  cahaya: 'Datuk Dennis Lapok',
  suara: 'Puan Dorothy Gimbad',
};

/**
 * What each leader is good at, in the order charisma, organisation, cunning, integrity. Each adds up to twelve, the
 * same as an ordinary leader and as every backstory, so a rival's leader is a different opponent, not a stronger one.
 * The player's own leader takes the place of their party's.
 */
export const LEADER_STATS: Record<Real, number[]> = {
  // The reformer: fills a hall and is believed; the branches are another matter.
  ps: [4, 2, 2, 4],
  // The old hand: knows where every division chief is buried.
  bp: [2, 4, 4, 2],
  // The preacher of the heartland: a ceramah a night, and not much given to schemes.
  pt: [4, 3, 2, 3],
  // The patriarch: nothing in the state moves without him.
  gbk: [2, 5, 3, 2],
  // The dealmaker: every arrangement has an exit.
  gbs: [3, 3, 4, 2],
  // The proud native son.
  legasi: [4, 2, 2, 4],
  // The idealist with a ring light.
  genba: [5, 1, 2, 4],
  cahaya: [3, 3, 2, 4],
  suara: [3, 4, 1, 4],
};

/**
 * How each leader takes what the player does to them: how hard an insult lands (`grudge`) and how readily a kindness
 * is returned (`warmth`). One is ordinary. It scales every change in their relations with the player.
 */
export const TEMPER: Record<Real, { grudge: number; warmth: number }> = {
  ps: { grudge: 1, warmth: 1.2 },      // an idealist: easy to befriend
  bp: { grudge: 0.7, warmth: 1 },      // transactional: nothing is personal
  pt: { grudge: 1.4, warmth: 0.8 },    // proud: slow to warm, quick to take offence
  gbk: { grudge: 0.6, warmth: 0.7 },   // patient: hard to move either way
  gbs: { grudge: 0.6, warmth: 1.3 },   // an opportunist: yesterday is forgotten
  legasi: { grudge: 1.5, warmth: 0.7 },// wary of anyone from across the sea
  genba: { grudge: 1.2, warmth: 1.3 }, // earnest: takes everything to heart
  cahaya: { grudge: 0.8, warmth: 1 },
  suara: { grudge: 1.3, warmth: 0.9 },
};

const pairs = <T>(rows: [Real, Real, T][], blank: T): T[][] => {
  const m = Array.from({ length: N_PARTIES }, () => new Array<T>(N_PARTIES).fill(blank));
  for (const [a, b, v] of rows) {
    const i = PARTY_IDS.indexOf(a), j = PARTY_IDS.indexOf(b);
    m[i][j] = v; m[j][i] = v;
  }
  return m;
};

/** How the leaders get on as the campaign opens, -100 to 100. Changes with what they do to each other. */
export const startRelations = (): number[][] => pairs<number>([
  ['ps', 'bp', -25], ['ps', 'pt', -50], ['bp', 'pt', -5],
  ['ps', 'gbk', 0], ['bp', 'gbk', 25], ['pt', 'gbk', -15],
  ['ps', 'gbs', -5], ['bp', 'gbs', 30], ['pt', 'gbs', 20],
  ['ps', 'legasi', 15], ['bp', 'legasi', -10], ['pt', 'legasi', -20],
  ['gbk', 'gbs', 10], ['gbk', 'legasi', 0], ['gbs', 'legasi', -40],
  // The small parties: the young reformers lean to Pakatan Sinar, the Borneo locals are wary of their bigger neighbours.
  ['ps', 'genba', 10], ['bp', 'genba', -20], ['pt', 'genba', -30], ['gbk', 'genba', -5], ['gbs', 'genba', 0], ['legasi', 'genba', 5],
  ['ps', 'cahaya', 5], ['bp', 'cahaya', 0], ['pt', 'cahaya', -20], ['gbk', 'cahaya', -25], ['gbs', 'cahaya', 0], ['legasi', 'cahaya', 0],
  ['ps', 'suara', 0], ['bp', 'suara', 10], ['pt', 'suara', -10], ['gbk', 'suara', 0], ['gbs', 'suara', -25], ['legasi', 'suara', 5],
  ['genba', 'cahaya', 5], ['genba', 'suara', 5], ['cahaya', 'suara', 5],
], 0);

/** How far apart the parties' supporters and programmes are, -1 to 1. Does not change. */
export const AFFINITY: number[][] = pairs<number>([
  ['ps', 'bp', -0.2], ['ps', 'pt', -0.6], ['bp', 'pt', 0.1],
  ['ps', 'gbk', 0.1], ['bp', 'gbk', 0.4], ['pt', 'gbk', -0.3],
  ['ps', 'gbs', 0], ['bp', 'gbs', 0.4], ['pt', 'gbs', 0.2],
  ['ps', 'legasi', 0.3], ['bp', 'legasi', 0], ['pt', 'legasi', -0.3],
  ['gbk', 'gbs', 0.3], ['gbk', 'legasi', 0.1], ['gbs', 'legasi', -0.4],
  ['ps', 'genba', 0.4], ['bp', 'genba', -0.4], ['pt', 'genba', -0.5], ['gbk', 'genba', -0.1], ['gbs', 'genba', 0], ['legasi', 'genba', 0.1],
  ['ps', 'cahaya', 0.1], ['bp', 'cahaya', 0.1], ['pt', 'cahaya', -0.3], ['gbk', 'cahaya', -0.2], ['gbs', 'cahaya', 0.2], ['legasi', 'cahaya', 0.2],
  ['ps', 'suara', 0], ['bp', 'suara', 0.2], ['pt', 'suara', -0.1], ['gbk', 'suara', 0.2], ['gbs', 'suara', -0.3], ['legasi', 'suara', 0.2],
  ['genba', 'cahaya', 0.2], ['genba', 'suara', 0.2], ['cahaya', 'suara', 0.2],
], 0);

export const START_UNITY: Record<FieldedId, number> = { ps: 70, bp: 60, pt: 70, gbk: 80, gbs: 55, legasi: 65, genba: 65, cahaya: 75, suara: 70 };

/** What a party's leader looks for when asked to support a government. Weights add up towards 1, the point of agreement. */
export interface Wants {
  /** Worth of a fair share of cabinet posts. */
  posts: number;
  /** A party that knows it is the kingmaker expects more than its share. */
  premium: number;
  /** The senior post they have their eye on, and what it is worth to them. */
  senior: SeniorId | null;
  seniorWorth: number;
  /** Worth of a full envelope. */
  cash: number;
  demands: Partial<Record<DemandId, number>>;
}

export const WANTS: Record<PartyId, Wants> = {
  ps:     { posts: 0.5, premium: 1, senior: 'dpm', seniorWorth: 0.3, cash: 0, demands: { reformAgenda: 0.35, subsidies: 0.1, speaker: 0.1, devFunds: 0.1, localPosts: 0.15 } },
  bp:     { posts: 0.5, premium: 1, senior: 'dpm', seniorWorth: 0.3, cash: 0.15, demands: { courtCases: 0.4, reformPause: 0.3, subsidies: 0.15, speaker: 0.15, devFunds: 0.1, localPosts: 0.3 } },
  pt:     { posts: 0.5, premium: 1, senior: 'dpm', seniorWorth: 0.3, cash: 0, demands: { valuesAgenda: 0.35, subsidies: 0.2, oilRoyalty: 0.15, speaker: 0.1, devFunds: 0.1, localPosts: 0.2 } },
  gbk:    { posts: 0.45, premium: 1.2, senior: 'dpm', seniorWorth: 0.25, cash: 0.05, demands: { autonomy: 0.4, oilRoyalty: 0.3, speaker: 0.15, devFunds: 0.1 } },
  gbs:    { posts: 0.5, premium: 1, senior: null, seniorWorth: 0.15, cash: 0.3, demands: { sabahCm: 0.4, autonomy: 0.3, oilRoyalty: 0.2, devFunds: 0.1 } },
  legasi: { posts: 0.5, premium: 1, senior: null, seniorWorth: 0.15, cash: 0.2, demands: { sabahCm: 0.45, autonomy: 0.3, oilRoyalty: 0.15, devFunds: 0.1 } },
  oth:    { posts: 0.3, premium: 1, senior: null, seniorWorth: 0.1, cash: 0.5, demands: { devFunds: 0.4, localPosts: 0.3 } },
  // Each small party's one or two members vote as a bloc, for what its voters sent them to Parliament to get.
  genba:  { posts: 0.4, premium: 1, senior: null, seniorWorth: 0.1, cash: 0.05, demands: { reformAgenda: 0.45, speaker: 0.1, devFunds: 0.1 } },
  cahaya: { posts: 0.45, premium: 1, senior: null, seniorWorth: 0.1, cash: 0.2, demands: { autonomy: 0.4, oilRoyalty: 0.3, devFunds: 0.15 } },
  suara:  { posts: 0.45, premium: 1, senior: null, seniorWorth: 0.1, cash: 0.25, demands: { autonomy: 0.3, sabahCm: 0.2, devFunds: 0.3 } },
};

/** What granting a demand costs the leader who grants it. */
export interface DemandDef {
  kinds: readonly ContestKind[];
  /** Unity lost in the granting party, by party; `all` where it is the same for everyone. */
  unity: Partial<Record<Real | 'all', number>>;
  /** Public trust lost when it comes out. */
  trust: number;
  /** It costs the treasury, which makes governing harder. */
  treasury: boolean;
  /** Can be promised to one party only. */
  exclusive: boolean;
}

const FEDERAL: ContestKind[] = ['general', 'hung'];

export const DEMANDS: Record<DemandId, DemandDef> = {
  autonomy:     { kinds: FEDERAL, unity: { ps: 2, bp: 3, pt: 4 }, trust: 0, treasury: false, exclusive: false },
  oilRoyalty:   { kinds: FEDERAL, unity: {}, trust: 0, treasury: true, exclusive: false },
  sabahCm:      { kinds: FEDERAL, unity: { all: 1 }, trust: 0, treasury: false, exclusive: true },
  subsidies:    { kinds: FEDERAL, unity: {}, trust: 0, treasury: true, exclusive: false },
  reformAgenda: { kinds: FEDERAL, unity: { bp: 6, pt: 3 }, trust: -5, treasury: false, exclusive: false },
  reformPause:  { kinds: FEDERAL, unity: { ps: 8, pt: 2 }, trust: 10, treasury: false, exclusive: false },
  courtCases:   { kinds: FEDERAL, unity: { ps: 8, pt: 5 }, trust: 20, treasury: false, exclusive: false },
  valuesAgenda: { kinds: FEDERAL, unity: { ps: 8, bp: 2 }, trust: 0, treasury: false, exclusive: false },
  devFunds:     { kinds: ['general', 'hung', 'state'], unity: {}, trust: 0, treasury: true, exclusive: false },
  speaker:      { kinds: ['general', 'hung', 'state'], unity: { all: 1 }, trust: 0, treasury: false, exclusive: false },
  localPosts:   { kinds: ['state'], unity: { all: 2 }, trust: 5, treasury: false, exclusive: false },
};

/** Concessions that undo each other. No government can promise both, whether to one partner or to two. */
export const CONTRADICTIONS: readonly (readonly [DemandId, DemandId])[] = [
  ['reformAgenda', 'reformPause'],
  // Anti-corruption laws cannot sit beside a quiet word with the prosecutors.
  ['reformAgenda', 'courtCases'],
];

/** The concession among `others` that a given one contradicts, if there is one. */
export function clashWith(demand: DemandId, others: readonly DemandId[]): DemandId | null {
  for (const [a, b] of CONTRADICTIONS) {
    if (a === demand && others.includes(b)) return b;
    if (b === demand && others.includes(a)) return a;
  }
  return null;
}

/** A list of concessions with any that contradicts an earlier one left out. */
export const consistent = (demands: readonly DemandId[]): DemandId[] =>
  demands.reduce<DemandId[]>((kept, d) => (clashWith(d, kept) ? kept : [...kept, d]), []);

/** Unity a senior post costs the party that gives it away. */
export const SENIOR_COST: Record<SeniorId, number> = { dpm: 3, finance: 5, home: 4, deputy: 3 };

export function demandUnityCost(giver: number, demand: DemandId): number {
  const u = DEMANDS[demand].unity;
  return u[PARTY_IDS[giver] as Real] ?? u.all ?? 0;
}

/** Unity one offer costs its giver for what it gives away: the senior post and the concessions in it. */
export const offerUnityCost = (giver: number, offer: Offer): number =>
  (offer.senior ? SENIOR_COST[offer.senior] : 0) + offer.demands.reduce((a, d) => a + demandUnityCost(giver, d), 0);

/**
 * Unity a set of deals costs the party that leads the government: the senior
 * posts and concessions it gives away, and every cabinet seat its own people
 * go without. `own` is the leading party's seats, `behind` the government's.
 */
export function dealsUnityCost(pm: number, deals: readonly Offer[], cabinet: number, own: number, behind: number): number {
  const given = deals.reduce((a, d) => a + offerUnityCost(pm, d), 0);
  const kept = cabinet - deals.reduce((a, d) => a + d.posts, 0);
  return given + 1.5 * Math.max(0, (cabinet * own) / Math.max(1, behind) - kept);
}
