import type { World } from '../election';
import { clamp, zeros2 } from '../math';
import { BLOC_IDS, N_BLOCS, N_PARTIES, PARTY_IDS, type BlocId, type PartyId } from '../types';
import { ISSUE_IDS, N_ISSUES, type Campaign, type Career, type IssueId, type PledgeId } from './types';

// Every stance runs from -2 to 2 between two poles; the translations name
// them. Roughly: subsidies (targeted .. for everyone), wages (business first ..
// workers first), taxes (low taxes .. tax wealth), graft (move on .. zero
// tolerance), reform (leave the institutions .. remake them), liberties (order
// first .. freedoms first), health (private .. public), transport (roads ..
// public transport), studentDebt (repay .. write off), values (liberal ..
// conservative public life), federalism (strong centre .. autonomy for the
// states), rural (cities first .. villages first).

export type IssueGroup = 'bread' | 'governance' | 'services' | 'identity';
export const ISSUE_GROUPS: { group: IssueGroup; issues: IssueId[] }[] = [
  { group: 'bread', issues: ['subsidies', 'wages', 'taxes'] },
  { group: 'governance', issues: ['graft', 'reform', 'liberties'] },
  { group: 'services', issues: ['health', 'transport', 'studentDebt'] },
  { group: 'identity', issues: ['values', 'federalism', 'rural'] },
];

type Row = [ideal: number, salience: number];
const row = (...r: Row[]) => r;

/**
 * Where each bloc would like a party to stand on each issue, and how much it
 * cares. Design numbers, in the order of ISSUE_IDS. Every stance pleases some
 * blocs and costs others.
 */
const BLOC_VIEWS: Record<BlocId, Row[]> = {
  //                 subsidies  wages      taxes       graft      reform      liberties  health     transport  debt       values      federal     rural
  undi18:        row([1, .4],   [1.5, .6], [0, .1],    [1, .4],   [1, .4],    [1, .5],   [.5, .2],  [1, .4],   [2, .9],   [.5, .3],   [0, .1],    [0, .1]),
  heartland:     row([2, .7],   [.5, .3],  [0, .2],    [.5, .3],  [-.5, .2],  [-1, .3],  [1, .4],   [-.5, .2], [.5, .2],  [2, .9],    [-1, .2],   [1.5, .6]),
  felda:         row([2, .7],   [0, .2],   [0, .1],    [0, .3],   [-1, .2],   [-1, .2],  [1, .4],   [-1, .2],  [.5, .2],  [1.5, .6],  [-.5, .1],  [2, 1]),
  agri:          row([2, .8],   [0, .2],   [0, .1],    [0, .2],   [-.5, .1],  [-.5, .2], [1, .5],   [-1, .2],  [.5, .1],  [1, .5],    [.5, .3],   [2, 1]),
  civil:         row([1, .4],   [1, .4],   [.5, .2],   [-.5, .3], [-1.5, .6], [-1, .4],  [1.5, .5], [0, .2],   [.5, .2],  [1, .5],    [-1.5, .4], [.5, .2]),
  urban_b40:     row([2, .9],   [2, .8],   [1, .3],    [.5, .3],  [.5, .2],   [0, .2],   [2, .7],   [1.5, .6], [1, .4],   [.5, .3],   [0, .1],    [-.5, .2]),
  gig:           row([1.5, .7], [2, .9],   [.5, .2],   [.5, .3],  [.5, .3],   [.5, .3],  [1.5, .5], [1, .5],   [1.5, .6], [0, .2],    [0, .1],    [-.5, .1]),
  m40:           row([0, .5],   [.5, .3],  [-1, .7],   [1.5, .6], [1, .5],    [.5, .3],  [1, .5],   [1.5, .6], [.5, .4],  [0, .3],    [0, .1],    [-.5, .2]),
  urban_lib:     row([-1, .4],  [.5, .3],  [0, .3],    [2, .9],   [2, .9],    [2, .9],   [1, .4],   [2, .6],   [.5, .3],  [-2, .9],   [.5, .2],   [-.5, .1]),
  smallbiz:      row([-.5, .4], [-1.5, .8], [-1.5, .8], [1, .5],  [.5, .3],   [.5, .3],  [0, .3],   [.5, .3],  [0, .2],   [-1, .5],   [0, .1],    [-.5, .1]),
  seniors:       row([1.5, .6], [0, .1],   [-.5, .3],  [0, .3],   [-1, .4],   [-1, .4],  [2, .9],   [.5, .3],  [-.5, .2], [1, .5],    [-.5, .2],  [.5, .3]),
  borneo_native: row([1.5, .6], [.5, .2],  [0, .1],    [0, .2],   [0, .1],    [0, .2],   [1.5, .6], [0, .3],   [.5, .2],  [-.5, .5],  [2, 1],     [2, .8]),
  borneo_urban:  row([0, .3],   [.5, .3],  [-.5, .4],  [1.5, .6], [1, .5],    [1, .5],   [1, .4],   [1, .4],   [.5, .3],  [-1.5, .7], [2, .9],    [0, .2]),
};
const IDEAL = BLOC_IDS.map((b) => BLOC_VIEWS[b].map((r) => r[0]));
const CARE = BLOC_IDS.map((b) => BLOC_VIEWS[b].map((r) => r[1]));

/** Where the parties stand as a career opens, in the order of ISSUE_IDS. */
const START_STANCES: Record<PartyId, number[]> = {
  ps:     [-1, 1, 0, 2, 2, 1, 1, 1, 1, -1, 0, -1],
  bp:     [1, 0, -1, -1, -1, -1, 0, -1, 0, 1, -1, 1],
  pt:     [2, 0, 0, 1, -1, -1, 1, 0, 1, 2, -2, 1],
  gbk:    [0, 0, -1, 0, 0, 0, 1, 0, 0, -1, 2, 1],
  gbs:    [1, 0, 0, -1, 0, 0, 1, 0, 0, 0, 2, 1],
  legasi: [1, 1, 0, 1, 1, 1, 1, 0, 1, -1, 2, 0],
  oth:    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  genba:  [-1, 1, 1, 2, 2, 1, 1, 1, 2, -1, 0, -1],
  cahaya: [0, 0, -1, 0, 0, 0, 1, 0, 0, -1, 2, 1],
  suara:  [1, 0, 0, -1, 0, 0, 1, 0, 0, 0, 2, 1],
};
export const startStances = (): number[][] => PARTY_IDS.map((p) => [...START_STANCES[p]]);

/** How much one step of distance on an issue a bloc fully cares about moves that bloc, in logit units. */
const STEP = 0.035;

// ---------- pledges ----------

export interface PledgeDef {
  /** What it costs the treasury each year, in rough units. */
  cost: number;
  /** [bloc]: how the promise lands, in logit units. */
  appeal: Partial<Record<BlocId, number>>;
  /** A stance the promise only makes sense with: the issue, and which side of the middle. */
  needs?: [IssueId, 1 | -1];
  /** An Act of Parliament: once passed it stays on the books, and no party need promise it again. A programme is paid for year after year and can be promised again. */
  law?: true;
}

export const PLEDGES: Record<PledgeId, PledgeDef> = {
  cashAid:         { cost: 4, appeal: { urban_b40: .08, heartland: .05, felda: .05, agri: .05, gig: .05, seniors: .04, borneo_native: .05, m40: -.03, smallbiz: -.03 } },
  fuelSubsidy:     { cost: 4, appeal: { heartland: .06, urban_b40: .06, gig: .08, agri: .05, undi18: .04, m40: .02, urban_lib: -.03 }, needs: ['subsidies', 1] },
  minWage:         { cost: 1, appeal: { gig: .08, urban_b40: .07, undi18: .05, smallbiz: -.08 }, needs: ['wages', 1] },
  taxCut:          { cost: 3, appeal: { smallbiz: .08, m40: .06, borneo_urban: .03 }, needs: ['taxes', -1] },
  graftCommission: { cost: 1, appeal: { urban_lib: .08, m40: .05, borneo_urban: .05, undi18: .03, civil: -.03 }, needs: ['graft', 1] },
  termLimit:       { cost: 0, appeal: { urban_lib: .07, m40: .04, undi18: .03 }, needs: ['reform', 1] },
  hospitals:       { cost: 3, appeal: { seniors: .08, borneo_native: .06, urban_b40: .05, agri: .04, heartland: .03 } },
  transitPass:     { cost: 2, appeal: { urban_b40: .06, m40: .06, gig: .05, undi18: .05, urban_lib: .04 }, needs: ['transport', 1] },
  debtWriteOff:    { cost: 3, appeal: { undi18: .12, gig: .06, m40: .03, seniors: -.02, smallbiz: -.02 }, needs: ['studentDebt', 1] },
  civilPay:        { cost: 3, appeal: { civil: .12, seniors: .03, smallbiz: -.03, m40: -.02 } },
  borneoFund:      { cost: 3, appeal: { borneo_native: .1, borneo_urban: .1, heartland: -.02 }, needs: ['federalism', 1] },
  settlerDebt:     { cost: 2, appeal: { felda: .15, agri: .03 }, needs: ['rural', 1] },
  floorPrices:     { cost: 2, appeal: { agri: .12, felda: .05, borneo_native: .04 }, needs: ['rural', 1] },
  valuesSchools:   { cost: 1, appeal: { heartland: .08, civil: .03, felda: .03, urban_lib: -.1, borneo_urban: -.05, smallbiz: -.04, borneo_native: -.03 }, needs: ['values', 1] },
  repealLaws:      { cost: 0, appeal: { urban_lib: .08, undi18: .04, borneo_urban: .03, heartland: -.03, civil: -.03 }, needs: ['liberties', 1] },
  homes:           { cost: 3, appeal: { urban_b40: .07, m40: .05, undi18: .05, gig: .04 } },
  // Acts: a promise of law costs the treasury nothing, and is kept for good once it passes.
  partyHopBan:     { cost: 0, appeal: { m40: .06, urban_lib: .05, civil: .03, heartland: .03, undi18: .03 }, needs: ['reform', 1], law: true },
  fixedTerm:       { cost: 0, appeal: { urban_lib: .06, m40: .04, civil: .02, undi18: .03 }, needs: ['reform', 1], law: true },
  infoAct:         { cost: 0, appeal: { urban_lib: .07, m40: .05, undi18: .04, borneo_urban: .04, civil: -.04 }, needs: ['graft', 1], law: true },
  localVote:       { cost: 1, appeal: { urban_lib: .06, m40: .05, borneo_urban: .04, civil: -.03, heartland: -.02 }, needs: ['reform', 1], law: true },
  gigRights:       { cost: 1, appeal: { gig: .1, urban_b40: .05, undi18: .05, smallbiz: -.05 }, needs: ['wages', 1], law: true },
  oilRoyalty:      { cost: 2, appeal: { borneo_native: .1, borneo_urban: .08, heartland: .03, civil: -.02 }, needs: ['federalism', 1], law: true },
  // Programmes: each year's money, and each can be promised again.
  schoolMeals:     { cost: 2, appeal: { urban_b40: .06, heartland: .04, agri: .04, felda: .04, borneo_native: .05, undi18: .02 } },
  healthCover:     { cost: 4, appeal: { seniors: .07, urban_b40: .06, m40: .05, gig: .04, smallbiz: -.04 }, needs: ['health', 1] },
  greenGrid:       { cost: 2, appeal: { m40: .05, urban_lib: .05, undi18: .04, borneo_urban: .03, felda: -.02 } },
  villageRoads:    { cost: 3, appeal: { agri: .08, felda: .06, borneo_native: .1, heartland: .05, urban_lib: -.02 }, needs: ['rural', 1] },
  smeLoans:        { cost: 2, appeal: { smallbiz: .1, gig: .04, m40: .03, borneo_urban: .02 } },
  seniorPension:   { cost: 3, appeal: { seniors: .1, heartland: .03, felda: .03, agri: .03, undi18: -.02 } },
};
// The Acts that were promised before there were any others: they are laws too.
for (const id of ['graftCommission', 'termLimit', 'repealLaws', 'minWage'] as const) PLEDGES[id].law = true;

/** Whether a promise has already become law in this career, so that nobody need promise it again. */
export const isEnacted = (career: Career, id: PledgeId): boolean => career.laws?.includes(id) ?? false;

/** A manifesto without what is already law. */
export const withoutLaws = (career: Career, manifesto: readonly PledgeId[]): PledgeId[] => manifesto.filter((id) => !isEnacted(career, id));

/** What a party promises if nobody thinks about it: roughly what it promised last time. */
const DEFAULT_MANIFESTO: Record<PartyId, PledgeId[]> = {
  ps: ['graftCommission', 'termLimit', 'transitPass', 'minWage', 'homes'],
  bp: ['cashAid', 'civilPay', 'settlerDebt', 'hospitals'],
  pt: ['fuelSubsidy', 'valuesSchools', 'floorPrices', 'debtWriteOff'],
  gbk: ['borneoFund', 'hospitals'],
  gbs: ['borneoFund', 'cashAid'],
  legasi: ['borneoFund', 'graftCommission'],
  oth: [],
  genba: [], cahaya: [], suara: [],
};
export const defaultManifestos = (): PledgeId[][] => PARTY_IDS.map((p) => [...DEFAULT_MANIFESTO[p]]);

/** A manifesto holds this many promises at most. */
export const MAX_PLEDGES = 6;
/** What the treasury can bear before commentators start laughing. */
export const FISCAL_ROOM = 10;

export const manifestoCost = (pledges: PledgeId[]) => pledges.reduce((a, id) => a + PLEDGES[id].cost, 0);

/** Whether a promise fits where the party stands. Promising what you argue against convinces nobody. */
export function fits(career: Career, p: number, id: PledgeId): boolean {
  const needs = PLEDGES[id].needs;
  if (!needs) return true;
  const stance = career.stances[p][ISSUE_IDS.indexOf(needs[0])];
  return needs[1] > 0 ? stance >= 1 : stance <= -1;
}

function pledgeAppeal(career: Career, p: number, pledges: PledgeId[]): number[] {
  const out = new Array<number>(N_BLOCS).fill(0);
  for (const id of pledges) {
    const weight = fits(career, p, id) ? 1 : 0.5;
    for (const [bloc, v] of Object.entries(PLEDGES[id].appeal)) out[BLOC_IDS.indexOf(bloc as BlocId)] += v * weight;
  }
  // A manifesto that costs more than the country has is discounted across the board.
  const over = Math.max(0, manifestoCost(pledges) - FISCAL_ROOM);
  return out.map((v) => (v > 0 ? v * Math.max(0.4, 1 - 0.12 * over) : v));
}

// ---------- how positions move voters ----------

function stanceAppeal(career: Career, stances: number[], b: number): number {
  let a = 0;
  for (let i = 0; i < N_ISSUES; i++) a -= CARE[b][i] * career.salience[i] * Math.abs(stances[i] - IDEAL[b][i]);
  return a * STEP;
}

/**
 * How well a platform sits with one bloc, from -1 (the opposite of what it wants) through 0 to 1 (exactly
 * what it wants), weighting each issue by how much that bloc cares about it.
 */
export function alignment(stances: number[], b: number): number {
  let gap = 0, care = 0;
  for (let i = 0; i < N_ISSUES; i++) { gap += CARE[b][i] * Math.abs(stances[i] - IDEAL[b][i]); care += CARE[b][i]; }
  return Math.max(-1, Math.min(1, 1 - gap / care / 2));
}

/** Voters discount a leader they have stopped believing. Rival parties are taken at an average rate. */
const belief = (c: Campaign, p: number) => (p === c.player ? 0.5 + c.career!.credibility / 200 : 0.8);

/**
 * [bloc][party]: how each party's positions and promises have moved each bloc
 * since the last election. Zero for a party that stands where it stood and
 * promises what it always promised.
 */
export function policyEffect(c: Campaign): number[][] {
  const career = c.career!;
  const out = zeros2(N_BLOCS, N_PARTIES);
  for (let p = 0; p < N_PARTIES; p++) {
    if (!c.parties[p]) continue;
    const mine = p === c.player;
    // Rivals publish when the election is called; the player when they choose to.
    const published = mine ? career.launched : c.phase !== 'term';
    const promised = published ? pledgeAppeal(career, p, career.manifesto[p]) : null;
    // What is already law is in neither: it is not a promise any more, and dropping it from the manifesto is not a broken one.
    const usual = published ? pledgeAppeal(career, p, withoutLaws(career, DEFAULT_MANIFESTO[PARTY_IDS[p]])) : null;
    for (let b = 0; b < N_BLOCS; b++) {
      const shift = stanceAppeal(career, career.stances[p], b) - stanceAppeal(career, career.stances0[p], b);
      out[b][p] = (shift + (promised ? promised[b] - usual![b] : 0)) * belief(c, p);
    }
  }
  return out;
}

/** What a stance is worth to a party across the whole electorate, weighting each bloc by its size. */
export function nationalAppeal(world: World, career: Career, stances: number[]): number {
  const size = blocSizes(world);
  let a = 0;
  for (let b = 0; b < N_BLOCS; b++) a += size[b] * stanceAppeal(career, stances, b);
  return a;
}

const sizeCache = new WeakMap<World, number[]>();
/** Each bloc's share of the whole electorate. */
export function blocSizes(world: World): number[] {
  let size = sizeCache.get(world);
  if (!size) {
    size = new Array<number>(N_BLOCS).fill(0);
    for (const s of world.seats) for (let b = 0; b < N_BLOCS; b++) size[b] += (s.electorate * s.blocs[b]) / world.totalElectorate;
    sizeCache.set(world, size);
  }
  return size;
}

/** The blocs that most like and most dislike a move to `to` on an issue, for showing the trade-off. */
export function stanceReaction(career: Career, issue: number, from: number, to: number): { bloc: BlocId; change: number }[] {
  return BLOC_IDS.map((bloc, b) => ({
    bloc,
    change: -CARE[b][issue] * career.salience[issue] * (Math.abs(to - IDEAL[b][issue]) - Math.abs(from - IDEAL[b][issue])) * STEP,
  })).filter((x) => Math.abs(x.change) > 0.004).sort((a, b) => b.change - a.change);
}

/** The party's founding position on an issue. Its members resent moves away from it. */
export const foundingStance = (p: number, issue: number) => START_STANCES[PARTY_IDS[p]][issue];

/** What a change of stance costs the player: credibility for the U-turn, unity for leaving the party's roots. */
export function stanceCost(c: Campaign, issue: number, to: number): { credibility: number; unity: number } {
  const career = c.career!;
  const from = career.stances[c.player][issue];
  const steps = Math.abs(to - from);
  // A second change of mind within a year looks like having no mind at all.
  const again = career.turned[issue] > 0 && career.week - career.turned[issue] < 52;
  const root = foundingStance(c.player, issue);
  const away = Math.max(0, Math.abs(to - root) - Math.abs(from - root));
  return { credibility: 3 * steps * (again ? 2 : 1), unity: Math.round(away * (Math.abs(root) === 2 ? 3 : 1)) };
}

export function setStance(c: Campaign, issue: number, to: number): boolean {
  const career = c.career;
  if (!career || (c.phase !== 'term' && c.phase !== 'campaign') || issue < 0 || issue >= N_ISSUES) return false;
  if (!Number.isInteger(to) || to < -2 || to > 2 || to === career.stances[c.player][issue]) return false;
  const cost = stanceCost(c, issue, to);
  career.credibility = clamp(career.credibility - cost.credibility, 0, 100);
  const pc = c.parties[c.player]!;
  pc.unity = clamp(pc.unity - cost.unity, 0, 100);
  career.stances[c.player][issue] = to;
  career.turned[issue] = career.week;
  return true;
}

/** Adds a promise to the player's manifesto or takes it out. Only before it is published. */
export function togglePledge(c: Campaign, id: PledgeId): boolean {
  const career = c.career;
  if (!career || career.launched || !(id in PLEDGES) || isEnacted(career, id)) return false;
  const mine = career.manifesto[c.player];
  if (mine.includes(id)) career.manifesto[c.player] = mine.filter((x) => x !== id);
  else if (mine.length < MAX_PLEDGES) mine.push(id);
  else return false;
  return true;
}

/** Publishes the player's manifesto. Promises that do not add up, or that contradict the party's line, cost credibility. */
export function launchManifesto(c: Campaign): boolean {
  const career = c.career;
  if (!career || career.launched) return false;
  const mine = career.manifesto[c.player];
  const over = Math.max(0, manifestoCost(mine) - FISCAL_ROOM);
  const odd = mine.filter((id) => !fits(career, c.player, id)).length;
  career.credibility = clamp(career.credibility - 3 * over - 4 * odd, 0, 100);
  career.launched = true;
  return true;
}
