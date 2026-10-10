import { emptyDynamics } from '../dynamics';
import { lastElection, majorityLine, type World } from '../election';
import { clamp, zeros, zeros2 } from '../math';
import { Rng } from '../rng';
import { N_BLOCS, N_PARTIES, PARTY_IDS, type RegionId } from '../types';
import { contestsState, scaled } from './actions';
import { START_UNITY } from './cast';
import { applyStateResults, houseTally, leaders, oppositionLeader, resolveByElection, resolveStatePolls, roundDue, startStates, stateVoteOf, statesHeld, vacantSeat } from './contests';
import { relation, shiftRelation } from './diplomacy';
import { EVENTS, raise, resolveEvent, rollEvent } from './events';
import {
  faceMotion, formCabinet, governWeek, makeObligations, openTalks, reckon, resolveHouseVote, resolveVote, standstill,
  startEconomy, tableBudget, vacate,
} from './govern';
import { endCareer, OUSTED_BELOW } from './legacy';
import { applyBackstory, applyIdeology, type IdeologyId } from './leader';
import { petition, recordResults } from './results';
import { FORMATION_WEEK, pushNews, ref } from './news';
import { FOUNDING_FUNDS, growFoundedParty } from './founding';
import { edge, incomeBoost, mediaBoost, neutralLeader, skill } from './perks';
import { afterLender } from './loan';
import { missionsElection, missionsWeek } from './missions';
import { membersWeek } from './members';
import { plotsWeek, resolveUltimatum } from './plots';
import { payday, staffWeek, wages } from './staff';
import { closeCampaign, openCampaign } from './team';
import { closeSlate, openNominations } from './slate';
import { allocation, diverted, hasPublicMoney, syncGoodwill, treasuryWeek } from './treasury';
import { agendaTerm } from './agenda';
import { foldMerged, standMerged } from './merge';
import { supplyWeek } from './supply';
import { shadowWeek } from './shadow';
import { redraw, redrawWeek, resolveRedraw } from './redraw';
import { factionsWeek, partyPoll, partyPollWeek, resolvePartyPoll } from './factions';
import { allianceBonus, allianceWeek, dropMember } from './alliance';
import { conductWeek } from './conduct';
import { gdpWeek } from './gdp';
import { sectorsWeek } from './sectors';
import { trialWeek } from './trial';
import { advisersWeek } from './advisers';
import { echoWeek } from './echoes';
import { carryStamps, dropStale } from './stamps';
import { ksuWeek } from './ksu';
import { grandWeek } from './grand';
import { signEarlyPacts } from './earlypact';
import { applyPride } from './pride';
import { courtWeek } from './courts';
import { patronageWeek } from './patronage';
import { applyTenure, recordTenure } from './tenure';
import { applySafe } from './safeseat';
import { FOOTHOLD, LANDSLIDE, MATURE, YOUNG_BRANCHES, crowdIncome, fatigueOf, foreignWeek, paddedWeek, grassrootsLift, holdingsWeek, trailWeek, landslide, openChest, holdingsYield, rollsFactor, rollsWeek, trade } from './party';
import { defaultManifestos, launchManifesto, nationalAppeal, policyEffect, startStances, withoutLaws, isEnacted } from './policy';
import {
  freshParty, makeDrift, newCampaign, publishPublicPoll, startingFunds, weeklyIncome, type CampaignOptions,
} from './turn';
import {
  FOCUS_IDS, ISSUE_IDS, N_ISSUES,
  type Campaign, type Career, type Level, type Orders, type Outcome, type Scene, type SeatResults,
} from './types';

const OTH = PARTY_IDS.indexOf('oth');
/** Who won a seat, from its votes: the first of the parties with the most. */
const winnerOf = (row: readonly number[]): number => row.indexOf(Math.max(...row));

/** Weeks of a term before the election campaign begins. With the campaign, a term is five years. */
export const TERM_WEEKS = 252;
/** A head of government may ask for a dissolution once three years have passed. */
export const EARLIEST_DISSOLUTION = 156;

/** Weekly spending at each level of effort, at general-election scale. */
export const BUDGET: Record<keyof Orders['budget'], number[]> = {
  machinery: [0, 6_000, 12_000, 24_000],
  media: [0, 4_000, 8_000, 16_000],
  research: [0, 3_000, 6_000, 12_000],
};
/** Between elections, donations run at this share of what a campaign brings in. */
const PEACETIME = 0.1;
const DONOR_INCOME = 8_000;
/** Weekly return on money invested in party businesses. */
/** Businesses are bought and sold in lots of this size; selling loses a tenth. */
export const ASSET_LOT = 100_000;
const MAX_FOCUS_STATES = 3;
/** Weeks without leaning on an institution before public trust starts to recover, how much of the gap to the ceiling it makes up each week, and the ceiling. */
export const TRUST_QUIET = 26;
/** The parliaments in a row a leader may head the government once a term limit is law. */
export const TERM_LIMIT = 2;
/** What losing the seat the leader stood in costs: the leader's word, and the party's heart. */
export const LEADER_OUT = { credibility: 10, unity: 8 };
export const TRUST_RECOVERY = 0.004;
export const TRUST_CEILING = 80;
const PROFILE_CAP = 0.08;

export const inGovernment = (c: Campaign, p: number) => !!c.career && (c.career.government.pm === p || c.career.government.partners.includes(p));

// ---------- opinion ----------

/**
 * Rebuilds the national layer of opinion from its parts: how the mood has
 * moved since the election, who is in the public eye, and what parties stand
 * for and promise. Call after anything that changes one of them.
 */
export function syncOpinion(c: Campaign): void {
  const k = c.career;
  if (!k) return;
  const policy = policyEffect(c);
  for (let b = 0; b < N_BLOCS; b++) for (let p = 0; p < N_PARTIES; p++) c.drift.support.nat[b][p] = k.mood[b][p] + k.profile[p] + policy[b][p] + (p === c.player ? k.grass ?? 0 : 0) + allianceBonus(c, p);
  syncGoodwill(c);
}

// ---------- starting ----------

/** The government a career opens with: the largest party leading a broad coalition, as after the last real election. */
function firstGovernment(world: World): Outcome {
  const tally = lastElection(world).tally;
  const [ps, bp, gbk, gbs, legasi] = (['ps', 'bp', 'gbk', 'gbs', 'legasi'] as const).map((id) => PARTY_IDS.indexOf(id));
  const deals: Outcome['deals'] = new Array(N_PARTIES).fill(null);
  if (world.rules.kind === 'state') return firstStateGovernment(world, tally, [ps, bp, gbk, gbs, legasi], deals);
  const partners = [bp, gbk, gbs, legasi];
  deals[bp] = { posts: 6, senior: 'dpm', demands: ['subsidies'], cash: 0 };
  deals[gbk] = { posts: 5, senior: null, demands: ['autonomy'], cash: 0 };
  deals[gbs] = { posts: 1, senior: null, demands: ['autonomy'], cash: 0 };
  deals[legasi] = { posts: 1, senior: null, demands: [], cash: 0 };
  return {
    pm: ps, partners, seats: tally[ps] + partners.reduce((a, p) => a + tally[p], 0),
    minority: false, stability: 60, trust: 60, deals, day: 0,
  };
}

/**
 * The government a state career opens with, drawn from the last assembly election: the largest party heads it, with the
 * parties it governs with in Putrajaya where they won seats here, and then the next largest until the numbers are there.
 */
function firstStateGovernment(world: World, tally: number[], federal: number[], deals: Outcome['deals']): Outcome {
  const line = majorityLine(world);
  const ranked = PARTY_IDS.map((_, p) => p).filter((p) => p !== OTH && tally[p] > 0).sort((a, b) => tally[b] - tally[a]);
  const pm = ranked[0] ?? federal[0];
  const partners: number[] = federal.includes(pm) ? federal.filter((p) => p !== pm && tally[p] > 0) : [];
  let seats = tally[pm] + partners.reduce((a, p) => a + tally[p], 0);
  for (const p of ranked) {
    if (seats >= line) break;
    if (p === pm || partners.includes(p)) continue;
    partners.push(p);
    seats += tally[p];
  }
  // Independents are the last to be counted, and only if the numbers still are not there.
  if (seats < line) seats += tally[OTH];
  const posts = world.rules.formation?.cabinet ?? 10;
  const together = tally[pm] + partners.reduce((a, p) => a + tally[p], 0) || 1;
  partners.sort((a, b) => tally[b] - tally[a]);
  partners.forEach((p, i) => {
    deals[p] = { posts: Math.max(1, Math.round((posts * tally[p]) / together)), senior: i === 0 ? 'deputy' : null, demands: [], cash: 0 };
  });
  return { pm, partners, seats, minority: seats < line, stability: 60, trust: 60, deals, day: 0 };
}

const defaultOrders = (): Orders => ({
  focus: 'tour', courting: null, budget: { machinery: 1, media: 1, research: 0 }, focusStates: [], donors: 0, state: 0, grants: 0,
});

function freshCareer(term: number, government: Outcome, results: SeatResults | null): Career {
  return {
    term, week: 1, length: TERM_WEEKS, government, midterm: false, results,
    orders: defaultOrders(), assets: 0, credibility: 60, dossier: 0,
    stances: startStances(), stances0: startStances(), turned: zeros(N_ISSUES), salience: new Array<number>(N_ISSUES).fill(1),
    mood: zeros2(N_BLOCS, N_PARTIES), profile: zeros(N_PARTIES),
    manifesto: defaultManifestos(), launched: false, promises: [],
    flags: [], fired: [], queue: [], quietUntil: 4,
    economy: startEconomy(), budget: standstill(), tabled: standstill(), fiscal: 0,
    cabinet: [], bills: [], delivery: {}, obligations: [], levers: [0, 0, 0], motion: 0, rivalBills: 0,
    record: { elections: 0, victories: 0, weeksPm: 0, weeksGov: 0, weeksOpp: 0, kept: [], broken: 0, bestSeats: 0, falls: 0, toppled: 0 },
    ending: null,
    house: {}, states: {}, rounds: 0,
  };
}

/** A new government takes office: ministers are appointed and, if the player leads it, what was promised to partners falls due. */
function takeOffice(c: Campaign): void {
  const rng = new Rng(c.rng);
  formCabinet(c, rng);
  c.rng = rng.state;
  makeObligations(c);
  // A shadow cabinet has done its work once the party governs.
  if (inGovernment(c, c.player)) delete c.career!.shadow;
  c.career!.bills = [];
  // A deal made with one government does not bind the next.
  delete c.career!.supply;
}

/**
 * Makes the player's party, in a single contest, one founded for it: a purse of its own making, an ordinary leader unless
 * the player chose a past, and a note on the campaign that it is new. The new party's following is in the world it is played in.
 */
export function foundForContest(world: World, c: Campaign, backstory: unknown): void {
  c.newParty = true;
  if (!backstory) c.team.leader = neutralLeader();
  c.parties[c.player]!.funds = scaled(world, FOUNDING_FUNDS);
}

/** Opens a career at the start of a parliamentary term, with the coffers low after the last election. */
export function startCareer(world: World, opts: CampaignOptions & { ideology?: IdeologyId | null; founded?: boolean; stances?: number[]; own?: boolean; held?: string[]; realStates?: boolean }): Campaign {
  const c = newCampaign(world, opts);
  // A party founded from nothing has no leader in the cast: without a past of the player's choosing, theirs is ordinary.
  if (opts.founded && !opts.backstory) c.team.leader = neutralLeader();
  c.phase = 'term';
  c.career = freshCareer(1, firstGovernment(world), null);
  const pc = c.parties[c.player]!;
  pc.funds = Math.round(startingFunds(world, c.player) * 0.4);
  // The government was elected on its usual programme, and will be held to it.
  c.career.promises = [...c.career.manifesto[c.player]];
  c.career.record.bestSeats = lastElection(world).tally[c.player];
  c.career.govRun = inGovernment(c, c.player) ? 1 : 0;
  c.career.pmRun = c.career.government.pm === c.player ? 1 : 0;
  if (opts.realStates && world.rules.kind !== 'state') c.career.realStates = true;
  // A party the player made stands where it stood before, and picks and pays for any other seat; a founded party has none to begin with.
  if (opts.own || opts.founded) {
    c.career.own = true;
    c.career.slate = { held: opts.founded ? [] : opts.held ?? world.seats.filter((_, i) => world.baseline.contesting[i][c.player]).map((s) => s.id), added: {} };
  }
  // Only the country's career has state polls of its own to hold: a state career is played in the one state.
  c.career.states = world.rules.kind === 'state' ? {} : startStates(world);
  // Candidates and endorsers wait for the campaign; the leader's past and platform count from the first day.
  closeCampaign(c);
  applyBackstory(c);
  if (opts.ideology) applyIdeology(world, c, opts.ideology);
  if (opts.founded) {
    // A party of the player's own making: one seat, a small purse, and a platform that is all its own.
    c.career.founded = true;
    c.parties[c.player]!.funds = scaled(world, FOUNDING_FUNDS);
  }
  if (opts.stances && opts.stances.length === N_ISSUES) {
    c.career.stances[c.player] = opts.stances.map((s) => Math.max(-2, Math.min(2, Math.round(s))));
    c.career.stances0[c.player] = [...c.career.stances[c.player]];
  }
  takeOffice(c);
  c.news = [];
  c.ledger = [];
  delete c.recap;
  c.polls = [];
  syncOpinion(c);
  pushNews(c, { party: null, key: 'news.term.start', vars: { party: ref.party(c.career.government.pm), n: c.career.government.seats }, tone: 'neutral' });
  publishPublicPoll(world, c);
  return c;
}

// ---------- money ----------

/** What comes in each week, by source. `total` is the party's; the government's allocation is a treasury of its own (see treasury.ts). */
export interface Income { members: number; donors: number; crowd: number; diverted: number; assets: number; total: number; allocation: number }

/** What comes into the party's purse each week between elections, by source, and what the government hands its own treasury. */
export function termIncome(world: World, c: Campaign): Income {
  const k = c.career!;
  const pc = c.parties[c.player]!;
  const drive = k.orders.focus === 'funds';
  const members = Math.round(weeklyIncome(world, c.player, c) * PEACETIME * (0.6 + 0.4 * pc.unity / 100) * (0.8 + k.credibility / 250) * (drive ? 1.6 : 1) * incomeBoost(c, c.player) * rollsFactor(world, c));
  const donors = Math.round(scaled(world, DONOR_INCOME) * k.orders.donors * (drive ? 1.3 : 1));
  const crowd = crowdIncome(world, c);
  // The party's share of the government's money is only what is diverted to it.
  const divert = diverted(world, c);
  const assets = holdingsYield(k);
  return { members, donors, crowd, diverted: divert, assets, total: members + donors + crowd + divert + assets, allocation: allocation(world, c) };
}

export interface LedgerLine { id: string; amount: number }

/** The party's books for a week in the years between elections: what comes in by source, what goes out by kind, and what is left. */
export function ledger(world: World, c: Campaign): { income: LedgerLine[]; spending: LedgerLine[]; net: number } {
  const i = termIncome(world, c);
  const s = termSpending(world, c);
  const income = ([['members', i.members], ['donors', i.donors], ['crowd', i.crowd], ['state', i.diverted], ['assets', i.assets]] as const)
    .filter(([, amount]) => amount !== 0).map(([id, amount]) => ({ id, amount }));
  const spending = ([['machinery', s.machinery], ['media', s.media], ['research', s.research], ['wages', s.wages]] as const)
    .filter(([, amount]) => amount > 0).map(([id, amount]) => ({ id, amount }));
  return { income, spending, net: i.total - s.total };
}

export interface Spending { machinery: number; media: number; research: number; wages: number; total: number }

/** What the standing orders cost each week. */
export function termSpending(world: World, c: Campaign): Spending {
  const b = c.career!.orders.budget;
  const cost = (k: keyof Orders['budget']) => (b[k] > 0 ? scaled(world, BUDGET[k][b[k]]) : 0);
  const machinery = cost('machinery'), media = cost('media'), research = cost('research');
  const team = wages(world, c);
  return { machinery, media, research, wages: team, total: machinery + media + research + team };
}

const isLevel = (x: unknown): x is Level => x === 0 || x === 1 || x === 2 || x === 3;

/** Changes the standing orders. Anything that does not make sense is ignored. */
export function setOrders(world: World, c: Campaign, patch: Partial<Orders>): void {
  const k = c.career;
  if (!k || c.phase !== 'term') return;
  const o = k.orders;
  if (patch.focus && FOCUS_IDS.includes(patch.focus)) o.focus = patch.focus;
  if (patch.courting !== undefined) o.courting = patch.courting !== null && c.parties[patch.courting] && patch.courting !== c.player ? patch.courting : null;
  if (patch.budget) for (const key of ['machinery', 'media', 'research'] as const) if (isLevel(patch.budget[key])) o.budget[key] = patch.budget[key];
  if (patch.focusStates) {
    o.focusStates = [...new Set(patch.focusStates)].filter((st) => world.states.includes(st) && contestsState(world, c, c.player, st)).slice(0, MAX_FOCUS_STATES);
  }
  if (isLevel(patch.donors)) o.donors = patch.donors;
  if (isLevel(patch.state)) o.state = hasPublicMoney(c) ? patch.state : 0;
  if (isLevel(patch.grants)) o.grants = hasPublicMoney(c) ? patch.grants : 0;
}

/** Buys (positive) or sells (negative) lots of party businesses, as plain property. Selling in a hurry loses a tenth. The Party tab buys and sells each kind. */
export function invest(world: World, c: Campaign, lots: number): boolean {
  return trade(world, c, 'property', lots);
}

// ---------- the weekly turn ----------

/** Regions that get the machinery money: the chosen ones, or everywhere the party stands if none are chosen. */
export function machineryTargets(world: World, c: Campaign): RegionId[] {
  const chosen = c.career!.orders.focusStates.filter((st) => contestsState(world, c, c.player, st));
  return chosen.length ? chosen : world.states.filter((st) => contestsState(world, c, c.player, st));
}

function rivalsWeek(world: World, c: Campaign, rng: Rng) {
  const k = c.career!;
  const g = k.government;
  c.parties.forEach((pc, p) => {
    if (!pc) return;
    // Opinion wanders, and governing wears a party down.
    const drift = rng.normal(0, 0.005) + (p === g.pm ? -0.0003 : g.partners.includes(p) ? -0.00015 : 0.0002);
    for (let b = 0; b < N_BLOCS; b++) k.mood[b][p] = (k.mood[b][p] + drift + rng.normal(0, 0.002)) * 0.999;
    if (p === c.player) return;
    k.profile[p] = Math.min(PROFILE_CAP, k.profile[p] * 0.97 + 0.0009);
    pc.unity = clamp(pc.unity + Math.sign(START_UNITY[PARTY_IDS[p] as keyof typeof START_UNITY] - pc.unity) * 0.1, 0, 100);
  });

  // Twice a year a national rival may move one step on one issue, towards where the votes are.
  if (k.week % 26 !== 0) return;
  for (const id of ['ps', 'bp', 'pt'] as const) {
    const p = PARTY_IDS.indexOf(id);
    if (p === c.player || !c.parties[p] || rng.next() > 0.4) continue;
    const here = nationalAppeal(world, k, k.stances[p]);
    let best = { gain: 0.0005, issue: -1, to: 0 };
    for (let i = 0; i < N_ISSUES; i++) for (const step of [-1, 1]) {
      const to = k.stances[p][i] + step;
      if (to < -2 || to > 2) continue;
      const moved = [...k.stances[p]];
      moved[i] = to;
      const gain = nationalAppeal(world, k, moved) - here;
      if (gain > best.gain) best = { gain, issue: i, to };
    }
    if (best.issue < 0) continue;
    k.stances[p][best.issue] = best.to;
    pushNews(c, { party: p, key: 'news.term.shift', vars: { party: ref.party(p), issue: `@issue:${ISSUE_IDS[best.issue]}` }, tone: 'neutral' });
  }
}

/**
 * One week of a term: money comes in and goes out under the standing orders,
 * branches grow or wither, opinion drifts, rivals move, and something may land
 * on the leader's desk. Does nothing while a decision is waiting.
 */
export function termWeek(world: World, c: Campaign): void {
  const k = c.career;
  const me = c.player;
  const pc = c.parties[me];
  if (!k || !pc || c.phase !== 'term' || c.inbox.length > 0 || k.ending) return;
  dropStale(k);
  const rng = new Rng(c.rng);
  const o = k.orders;

  // Money. If the orders cost more than there is, everything is cut back in proportion.
  // The government's money is its own: the allocation comes into the treasury, grants go out of it, and only what is diverted reaches the party.
  const income = termIncome(world, c);
  const plan = termSpending(world, c);
  const toParty = treasuryWeek(world, c);
  pc.funds += afterLender(c, pc, income.total - income.diverted + toParty);
  const afford = plan.total > 0 ? Math.min(1, pc.funds / plan.total) : 1;
  pc.funds -= Math.round(plan.total * afford);
  // The retainer is cut back with everything else, and a team on part pay does not work.
  payday(c, afford >= 1 || plan.wages === 0);

  // Branches wither a little every week, and grow where money and the leader's time go.
  const targets = machineryTargets(world, c);
  const points = ((afford * plan.machinery) / scaled(world, 6_000) * 0.25 + (o.focus === 'tour' ? 0.3 : 0)) * edge(c, me, 'organisation') * (1 + 0.05 * skill(c, me, 'manager')) * (0.8 + 0.2 * Math.min(2, rollsFactor(world, c)));
  pc.machinery = pc.machinery.map((m, i) => {
    const st = world.states[i];
    if (m <= 0) {
      // Ground the party stands on for the first time: a foothold, and then years of slow work.
      if (!contestsState(world, c, me, st)) return 0;
      (k.fresh ??= []).push(st);
      return FOOTHOLD;
    }
    const young = k.fresh?.includes(st) ?? false;
    const grown = targets.includes(st) ? (points / targets.length) * (young ? YOUNG_BRANCHES : 1) : 0;
    const next = clamp(m - 0.04 + grown, young ? FOOTHOLD : 10, 100);
    if (young && next >= MATURE) k.fresh = k.fresh!.filter((x) => x !== st);
    return next;
  });
  if (k.fresh?.length === 0) delete k.fresh;

  const rngWeek = new Rng((c.rng ^ 0x9a17) + k.week);
  holdingsWeek(world, c, rngWeek);
  trailWeek(world, c, rngWeek);
  foreignWeek(world, c, rngWeek);
  rollsWeek(world, c);
  paddedWeek(world, c, rngWeek);
  patronageWeek(c, rngWeek);
  courtWeek(c, rngWeek);
  allianceWeek(c);
  grandWeek(world, c);
  ksuWeek(c, rngWeek);
  echoWeek(c);
  advisersWeek(c);
  sectorsWeek(c, rngWeek);
  gdpWeek(world, c);
  trialWeek(c);

  const seen = ((afford * plan.media) / scaled(world, 4_000) * 0.0012 + (o.focus === 'media' ? 0.0015 : 0)) * edge(c, me, 'charisma') * mediaBoost(c, me);
  k.profile[me] = Math.min(PROFILE_CAP, k.profile[me] * 0.97 + seen);
  const dug = ((afford * plan.research) / scaled(world, 3_000) * 0.15 + (o.focus === 'dirt' ? 0.5 : 0)) * edge(c, me, 'cunning') * (1 + 0.06 * skill(c, me, 'strategist'));
  k.dossier = clamp(k.dossier + dug, 0, 100);
  if (o.focus === 'policy') k.credibility = Math.min(Math.max(k.credibility, 85), k.credibility + 0.2 * edge(c, me, 'integrity'));
  // The team is on the payroll already; what is left is whether anyone's past comes out this week.
  staffWeek(world, c, new Rng((c.rng ^ 0x57aff) + k.week), false);
  conductWeek(world, c, afford);
  plotsWeek(world, c);
  if (c.phase !== 'term') return;
  membersWeek(world, c, new Rng((c.rng ^ 0x3e3be5) + k.week));
  if (o.focus === 'leaders' && o.courting !== null && k.week % 4 === 0 && relation(c, me, o.courting) < 45) shiftRelation(c, me, o.courting, 2);

  // Easy money has a slow price as well as a sudden one.
  k.credibility = clamp(k.credibility - 0.03 * o.donors, 0, 100);
  if (inGovernment(c, me)) {
    k.government.trust = clamp(k.government.trust - 0.05 * o.state, 0, 100);
    // A government that leaves state resources alone and has not leaned on an institution for half a year slowly earns some trust back.
    if (o.state === 0 && k.levers.every((w) => w === 0 || k.week - w >= TRUST_QUIET)) k.government.trust = clamp(k.government.trust + TRUST_RECOVERY * (TRUST_CEILING - k.government.trust), 0, 100);
  }
  pc.unity = clamp(pc.unity + Math.sign(65 - pc.unity) * 0.05, 0, 100);
  k.salience = k.salience.map((s) => s + (1 - s) * 0.02);
  k.government.stability = clamp(k.government.stability + rng.normal(0, k.government.pm === me ? 0.15 : 0.4), 5, 95);

  rivalsWeek(world, c, rng);
  growFoundedParty(world, c);
  governWeek(c, rng);
  syncOpinion(c);
  missionsWeek(world, c, new Rng((c.rng ^ 0x4115) + k.week * 31 + k.term));
  // A government is a minority or not as the House now stands: seats lost one by one at by-elections and crossings count, as do seats found.
  k.government.minority = k.government.seats < majorityLine(world);
  // One thing at a time: nothing new arrives while a vote is waiting. The states' own elections come when they are due.
  if (c.inbox.length === 0 && world.rules.kind !== 'state' && roundDue(c) !== null) raise(c, 'statePolls');
  agendaTerm(world, c);
  supplyWeek(c);
  shadowWeek(c);
  factionsWeek(c);
  redrawWeek(c);
  if (c.inbox.length === 0 && partyPollWeek(c)) partyPoll(c, rng);
  k.oppLeader = oppositionLeader(world, c);
  if (c.inbox.length === 0) rollEvent(c, rng);
  // A by-election needs a seat to be fought in.
  for (const scene of c.inbox) if (scene.event === 'byElection' && !scene.seat) scene.seat = vacantSeat(world, c, rng);
  c.rng = rng.state;
  if (pc.unity <= OUSTED_BELOW / 2) return endCareer(c, 'ousted');

  if (k.week % 4 === 0) publishPublicPoll(world, c);

  // A government that others lead can fall on its own, or go to the country early when it likes its chances.
  const g = k.government;
  if (g.pm !== me && c.inbox.length === 0) {
    const roll = new Rng(c.rng);
    // Once a term at most: a parliament that has seen one government fall has no appetite for another.
    const fell = `fell${k.term}`;
    const falls = g.partners.length > 0 && g.stability < 30 && !k.flags.includes(fell) && roll.next() < (30 - g.stability) / 600;
    const lead = k.mood.reduce((a, row) => a + row[g.pm], 0) / N_BLOCS;
    const early = k.week >= 208 && lead > 0 && roll.next() < 0.012;
    c.rng = roll.state;
    if (falls) { k.flags.push(fell); return governmentFalls(world, c); }
    if (early) return beginCampaign(world, c);
  }

  if (k.week >= k.length) return beginCampaign(world, c);
  k.week++;
}

/** Runs weeks until a decision is waiting, the term ends, or `weeks` have passed. Returns how many ran. */
export function skipAhead(world: World, c: Campaign, weeks: number): number {
  let ran = 0;
  while (ran < weeks && c.phase === 'term' && c.inbox.length === 0 && !c.career?.ending) { termWeek(world, c); ran++; }
  return ran;
}

/**
 * Answers whatever is on the leader's desk: an event, a vote on one of the
 * government's own bills, or a vote on a rival's. If the answer brings the
 * government down, the talks open; if it breaks the party, the career ends.
 */
export function answerEvent(world: World, c: Campaign, scene: Scene, choice: number): void {
  const k = c.career;
  if (!k) return;
  if (scene.kind === 'partyPoll') resolvePartyPoll(world, c, scene, choice);
  else if (scene.kind === 'redraw') resolveRedraw(c, scene, choice);
  else if (scene.kind === 'vote') resolveVote(world, c, scene, choice);
  else if (scene.kind === 'houseVote') resolveHouseVote(world, c, scene, choice);
  else if (scene.event === 'budget') {
    // Budget day: the plan as it stands, or last year's budget again.
    tableBudget(c, choice === 0 ? k.budget : standstill());
    const g = k.government;
    if (g.partners.length > 0 && (g.stability < 30 || g.seats < majorityLine(world) + 3)) raise(c, 'budgetRevolt');
  } else if (scene.event === 'motion') faceMotion(world, c, choice);
  else if (scene.event === 'ultimatum') resolveUltimatum(world, c, scene, choice);
  else if (scene.event === 'byElection') resolveByElection(world, c, scene, choice);
  else if (scene.event === 'statePolls') resolveStatePolls(world, c, choice);
  else if (scene.event && EVENTS[scene.event]) {
    const falls = resolveEvent(world, c, scene, choice);
    if (falls && c.phase === 'term') {
      if (k.government.pm === c.player) { k.record.falls++; openTalks(world, c); }
      else { k.record.toppled++; governmentFalls(world, c); }
    }
  }
  syncOpinion(c);
  if (c.parties[c.player]!.unity <= OUSTED_BELOW) endCareer(c, 'ousted');
}

// ---------- changes of government and elections ----------

/**
 * The government loses a partner. If it still has the numbers it carries on
 * weaker; if not, the Palace asks who can command a majority and the talks
 * begin, with the seats as they stand.
 */
export function governmentFalls(world: World, c: Campaign, who?: number): void {
  const k = c.career!;
  const g = k.government;
  const tally = houseTally(world, c);
  if (g.partners.length === 0) return;
  // A partner that has decided to go, or else whichever is on the worst terms with the head of government.
  const leaver = who !== undefined && g.partners.includes(who) ? who : [...g.partners].sort((a, b) => relation(c, g.pm, a) - relation(c, g.pm, b) || tally[b] - tally[a])[0];
  shiftRelation(c, g.pm, leaver, -30);
  pushNews(c, { party: leaver, key: 'news.term.walkout', vars: { party: ref.party(leaver), pm: ref.party(g.pm) }, tone: g.pm === c.player ? 'bad' : 'neutral' });
  g.partners = g.partners.filter((p) => p !== leaver);
  g.deals[leaver] = null;
  // A partner that walks out of the government walks out of the alliance too, and does not forget what it was called.
  if (k.alliance?.members.includes(leaver) && leaver !== c.player) { dropMember(c, leaver); shiftRelation(c, g.pm, leaver, -15); }
  g.seats -= tally[leaver];
  if (g.seats >= majorityLine(world)) {
    g.stability = clamp(g.stability - 5, 5, 95);
    vacate(c, leaver);
    k.obligations = k.obligations.filter((o) => o.party !== leaver);
    return;
  }
  if (g.pm === c.player) k.record.falls++;
  openTalks(world, c);
}

/** After a change of government between elections, the term carries on under whoever came out on top. */
export function resumeTerm(c: Campaign): boolean {
  const k = c.career;
  const outcome = c.formation?.outcome;
  if (!k || !k.midterm || !outcome || c.phase !== 'done') return false;
  k.government = outcome;
  k.midterm = false;
  c.formation = null;
  c.phase = 'term';
  c.inbox = [];
  takeOffice(c);
  if (!hasPublicMoney(c)) { k.orders.state = 0; k.orders.grants = 0; }
  // News from the talks is filed with the week they happened in.
  for (const item of c.news) if (item.week >= FORMATION_WEEK) item.week = k.week;
  return true;
}

export function canDissolve(c: Campaign): boolean {
  const k = c.career;
  return !!k && c.phase === 'term' && c.inbox.length === 0 && k.government.pm === c.player && !k.limited && k.week >= EARLIEST_DISSOLUTION && k.week - (k.palaceNo ?? -PALACE_WAIT) >= PALACE_WAIT;
}

/** The player, as head of government, asks for a dissolution and goes to the country early. */
export function dissolve(world: World, c: Campaign, together = false): boolean {
  if (!canDissolve(c)) return false;
  const k = c.career!;
  // The Palace need not grant it. A government that has lost its footing, or a majority, is asked to try to govern first.
  const rng = new Rng((c.rng ^ 0x9a1ace) + k.week);
  c.rng = rng.state;
  if (rng.next() < palaceRefusal(c)) {
    k.palaceNo = k.week;
    k.government.stability = clamp(k.government.stability - 8, 5, 95);
    pushNews(c, { party: c.player, key: 'news.palace.refused', vars: { n: PALACE_WAIT }, tone: 'bad' });
    return false;
  }
  // Going to the country early when things are going well is seen for what it is, and the voters say so.
  const cost = opportunism(c);
  if (cost > 0) {
    for (const row of k.mood) row[c.player] -= cost;
    pushNews(c, { party: c.player, key: 'news.dissolve.opportunist', vars: { pct: Math.round(cost * 25 * 10) / 10 }, tone: 'bad' });
  }
  // The states the party governs can be taken to the polls on the same day: one wave of campaign for all of them.
  if (together && !c.scenario.startsWith('career:') && statesHeld(c, c.player) > 0) {
    const mine = Object.keys(k.states).filter((st) => k.states[st] === c.player);
    if (mine.length > 0) {
      k.together = true;
      pushNews(c, { party: c.player, key: 'news.dissolve.together', vars: { states: `@states:${mine.join(',')}` }, tone: 'neutral' });
    }
  }
  beginCampaign(world, c);
  return true;
}

/** What the voters take off a government that dissolves early when it is not in trouble: more the earlier, none when it is shaky or the term is nearly out. */
export const OPPORTUNISM = { perYear: 0.012, max: 0.04, grace: 26 };
export function opportunism(c: Campaign): number {
  const k = c.career!;
  const left = k.length - k.week;
  if (left <= OPPORTUNISM.grace) return 0;
  const steady = k.government.stability >= 50 ? 1 : k.government.stability >= 35 ? 0.5 : 0;
  return Math.min(OPPORTUNISM.max, (left / 52) * OPPORTUNISM.perYear) * steady;
}

/** Weeks the Palace asks a government to wait before it asks again. */
export const PALACE_WAIT = 13;

/** The chance the Palace refuses a request to dissolve: nothing for a government with a majority and its footing, rising as either is lost. */
export function palaceRefusal(c: Campaign): number {
  const g = c.career!.government;
  // A state's ruler is slower to oblige than the Palace is to a government of the country.
  const state = c.scenario.startsWith('career:') ? 0.1 : 0;
  return clamp((50 - g.stability) / 100 + (g.minority ? 0.2 : 0) + Math.max(0, (40 - g.trust) / 200) + state, 0, 0.6);
}

/**
 * Parliament is dissolved and the campaign begins. The player goes in with
 * what the years have built; the rivals arrive rested and funded.
 */
export function beginCampaign(world: World, c: Campaign): void {
  const k = c.career!;
  const me = c.player;
  const rng = new Rng(c.rng);
  // First the reckoning for the last manifesto, then the new one.
  reckon(c);
  if (!k.launched) launchManifesto(c);
  k.promises = [...k.manifesto[me]];
  k.delivery = {};
  k.bills = [];
  pushNews(c, { party: null, key: 'news.term.dissolved', vars: { n: world.rules.weeks }, tone: 'neutral' });
  openChest(c);

  c.parties = c.parties.map((pc, p) => {
    if (!pc) return null;
    if (p === me) return { ...pc, days: pc.capacity, used: {}, dinners: {}, crowdfunds: 0, tycoon: 0, visits: [], plays: {} };
    const fresh = freshParty(world, p) ?? pc;
    return { ...fresh, funds: Math.round(fresh.funds * (0.9 + 0.4 * rng.next())), unity: pc.unity };
  });
  c.rng = rng.state;
  c.phase = 'campaign';
  c.week = 1;
  c.totalWeeks = world.rules.weeks;
  c.dyn = emptyDynamics();
  delete c.held;
  c.inbox = [];
  openCampaign(world, c);
  openNominations(world, c);
  // Parties that were taken in do not stand.
  standMerged(world, c);
  applySafe(world, c);
  applyTenure(world, c);
  applyPride(world, c);
  signEarlyPacts(world, c);
  // Members and branches built over the years tell on polling day, in every seat the party stands in.
  const lift = grassrootsLift(world, c);
  if (lift > 0) {
    k.grass = lift;
    pushNews(c, { party: me, key: 'news.grassroots', vars: { pts: Math.round(lift * 25 * 10) / 10 }, tone: 'good' });
  }
  syncOpinion(c);
  publishPublicPoll(world, c);
}

/**
 * Starts the next parliamentary term once the election and the talks are
 * over. The world the campaign is played in changes with this call: the
 * caller must look it up again.
 */
export function nextTerm(world: World, c: Campaign): boolean {
  const k = c.career;
  const outcome = c.formation?.outcome;
  if (!k || k.midterm || !outcome || c.phase !== 'done' || !c.election) return false;
  const counted = foldMerged(c, recordResults(world, c));
  // A campaign that broke the spending law is petitioned against: the narrowest wins are overturned.
  const petitioned = petition(world, c, counted);
  const recorded = petitioned.results;
  // The government was formed on the seats as they were declared. Where the courts have since unseated winners, it has the seats the courts left it.
  if (petitioned.lost.length > 0) {
    const tally = (votes: number[][]) => { const t = zeros(N_PARTIES); for (const row of votes) t[row.indexOf(Math.max(...row))]++; return t; };
    const before = tally(counted.votes), after = tally(recorded.votes);
    const governing = [outcome.pm, ...outcome.partners];
    outcome.seats += governing.reduce((a, p) => a + after[p] - before[p], 0);
    if (outcome.seats < majorityLine(world)) outcome.minority = true;
  }
  recordTenure(world, c, recorded);
  // Kept before the campaign's people are stood down: the news of a leader who lost their own seat names it.
  const leaderSeat = c.team.leaderSeat;
  const togetherStates = k.together ? Object.keys(k.states).filter((st) => k.states[st] === c.player && world.states.includes(st)) : [];
  closeSlate(world, c);
  const rng = new Rng(c.rng);
  // Every third parliament the boundaries are drawn again, and the seats the next term is fitted to are the redrawn ones.
  const drawn = k.redraw ? redraw(world, recorded, k.redraw.by, new Rng((c.seed ^ (k.term * 977)) >>> 0)) : null;
  const next = freshCareer(k.term + 1, outcome, drawn ? drawn.results : recorded);
  // A new map is for the next election and unseats nobody: where it would have given a seat to someone else, whoever was elected still sits.
  const sitting: Record<string, number> = {};
  if (drawn) world.seats.forEach((seat, i) => { const won = winnerOf(recorded.votes[i]); if (won !== winnerOf(drawn.results.votes[i])) sitting[seat.id] = won; });
  c.career = {
    ...next,
    house: sitting,
    ...(k.founded ? { founded: true } : {}),
    ...(k.own ? { own: true, slate: k.slate } : {}),
    ...(k.realStates ? { realStates: true } : {}),
    treasury: k.treasury, goodwill: k.goodwill, goodwillApplied: {},
    seen: [...(k.seen ?? []), ...k.fired].slice(-400),
    ...(k.nation ? { nation: { ...k.nation } } : {}),
    orders: k.orders, assets: k.assets, ...(k.holdings ? { holdings: { ...k.holdings } } : {}), ...(k.rolls !== undefined ? { rolls: k.rolls } : {}), ...(k.activity ? { activity: { ...k.activity } } : {}), credibility: k.credibility, dossier: Math.round(k.dossier * 0.5),
    stances: k.stances, stances0: k.stances.map((row) => [...row]),
    // Acts already passed are not promised again, by anyone.
    ...(k.laws?.length ? { laws: [...k.laws] } : {}),
    ...(k.shadow ? { shadow: { ...k.shadow } } : {}),
    manifesto: next.manifesto.map((m, p) => withoutLaws(k, p === c.player ? k.manifesto[p] : m)),
    promises: k.promises, flags: k.flags,
    economy: k.economy, reports: k.reports, tabled: k.tabled, budget: k.budget, fiscal: k.fiscal * 0.5, record: k.record, states: k.states,
  };
  // Two parliaments at the head of the government is all a term limit allows: in the third the party governs, and its leader does not.
  const run = outcome.pm === c.player ? (k.pmRun ?? 0) + 1 : 0;
  c.career.pmRun = run;
  // Staying in government wears on the voters, and on the party's own conduct: more with each parliament in a row.
  const govRun = outcome.pm === c.player || outcome.partners.includes(c.player) ? (k.govRun ?? 0) + 1 : 0;
  c.career.govRun = govRun;
  c.career.chest = k.chest;
  if (c.career.chest === undefined) delete c.career.chest;
  // What the party has built up, and what follows it, goes with it into the next parliament.
  const carry = {
    ...(k.factions ? { factions: structuredClone(k.factions) } : {}),
    ...(k.fresh?.length ? { fresh: [...k.fresh] } : {}),
    ...(k.tenure ? { tenure: structuredClone(k.tenure) } : {}),
    ...(k.trail ? { trail: k.trail } : {}),
    ...(k.foreign ? { foreign: k.foreign } : {}),
    ...(k.padded ? { padded: k.padded } : {}),
    ...(k.safe ? { safe: { ...k.safe } } : {}),
    ...(k.patronage ? { patronage: k.patronage } : {}),
    ...(k.drive ? { drive: k.drive } : {}),
    ...(k.advisers ? { advisers: structuredClone(k.advisers) } : {}),
    ...(k.echoes?.length ? { echoes: k.echoes.map((e) => ({ ...e })) } : {}),
    ...(k.sectors ? { sectors: { ...k.sectors } } : {}),
    ...(k.sectorAid ? { sectorAid: { ...k.sectorAid } } : {}),
    ...(k.alliance ? { alliance: { ...k.alliance, members: [...k.alliance.members] } } : {}),
    ...(k.mandated?.length ? { mandated: [...k.mandated] } : {}),
    ...(k.shaky?.length ? { shaky: [...k.shaky] } : {}),
    ...(k.missions ? { missions: structuredClone(k.missions) } : {}),
  };
  Object.assign(c.career, carry);
  // The new parliament counts its weeks from one: what was marked with a week of the old one is moved back by the term and the campaign.
  carryStamps(c.career, k.week + c.totalWeeks);
  // A leader who stood in a seat of their own and lost it is out of the House, whatever their party did: they cannot head a government.
  const own = leaderSeat ? world.seatIndex.get(leaderSeat) : undefined;
  const leaderOut = own !== undefined && winnerOf(recorded.votes[own]) !== c.player;
  if ((run > TERM_LIMIT && isEnacted(k, 'termLimit')) || (leaderOut && outcome.pm === c.player)) c.career.limited = true;
  const seats = recorded.votes.reduce((a, row) => a + (row[c.player] > 0 && row[c.player] === Math.max(...row) ? 1 : 0), 0);
  const r = c.career.record;
  r.elections++;
  r.bestSeats = Math.max(r.bestSeats, seats);
  if (outcome.pm === c.player) r.victories++;
  r.terms = [...(r.terms ?? []), { seats, pm: outcome.pm === c.player }];
  if (!hasPublicMoney(c)) { c.career.orders.state = 0; c.career.orders.grants = 0; }
  // The campaign's bills arrive after the votes are counted: half of what was left goes on them.
  const pc = c.parties[c.player]!;
  pc.funds = Math.round(pc.funds * 0.5);

  c.phase = 'term';
  c.week = 1;
  c.election = null;
  c.formation = null;
  c.dyn = emptyDynamics();
  delete c.held;
  c.drift = makeDrift(world, rng);
  c.rng = rng.state;
  c.standDowns = {};
  c.pacts = [];
  c.understandings = [];
  c.katak = [];
  delete c.entered;
  delete c.agenda;
  c.offered = [];
  c.inbox = [];
  c.polls = [];
  c.news = [];
  c.ledger = [];
  delete c.recap;
  closeCampaign(c);
  syncOpinion(c);
  takeOffice(c);
  if (drawn) pushNews(c, { party: k.redraw!.by, key: k.redraw!.by === null ? 'news.redraw.done.fair' : 'news.redraw.done.pushed', vars: { n: drawn.flipped, party: k.redraw!.by === null ? '' : ref.party(k.redraw!.by) }, tone: 'neutral' });
  if (togetherStates.length > 0) {
    // The states that went to the polls with the House are decided by how this country voted in them.
    const winners = recorded.votes.map((row) => row.indexOf(Math.max(...row)));
    const now = leaders(world, winners, togetherStates, k.states);
    applyStateResults(c, togetherStates.filter((st) => now[st] !== undefined).map((st) => ({ state: st, winner: now[st], was: k.states[st], vote: stateVoteOf(world, winners, st) })));
  }
  if (petitioned.lost.length > 0) pushNews(c, { party: c.player, key: 'news.petition', vars: { n: petitioned.lost.length, seats: `@seats:${petitioned.lost.join(',')}` }, tone: 'bad' });
  if (leaderOut) {
    c.career.credibility = clamp(c.career.credibility - LEADER_OUT.credibility, 0, 100);
    c.parties[c.player]!.unity = clamp(c.parties[c.player]!.unity - LEADER_OUT.unity, 0, 100);
    pushNews(c, { party: c.player, key: outcome.pm === c.player ? 'news.leader.lost.pm' : 'news.leader.lost', vars: { seat: ref.seat(leaderSeat!) }, tone: 'bad' });
  }
  if (c.career.limited && !leaderOut) pushNews(c, { party: c.player, key: 'news.term.limited', vars: { n: TERM_LIMIT }, tone: 'neutral' });
  pushNews(c, { party: null, key: 'news.term.start', vars: { party: ref.party(outcome.pm), n: outcome.seats }, tone: 'neutral' });
  // Weariness with a party long in government is a level, not a debt that is charged again in full each parliament: what is
  // taken off now is what this parliament adds to it, and a party that has left government is given back what it had lost.
  const tired = fatigueOf(govRun) - fatigueOf(k.govRun ?? 0);
  if (tired !== 0) for (const row of c.career.mood) row[c.player] -= tired;
  if (tired > 0) pushNews(c, { party: c.player, key: 'news.fatigue', vars: { n: govRun }, tone: 'bad' });
  else if (tired < 0) pushNews(c, { party: c.player, key: 'news.fatigue.over', vars: {}, tone: 'good' });
  // The votes are counted and the government made: what the leader took on is judged by it.
  missionsElection(world, c, outcome, recorded.votes.map((row) => row.indexOf(Math.max(...row))));
  // A win this large is more than a party can hold together.
  if (seats >= Math.ceil(LANDSLIDE * world.seats.length)) landslide(c);
  // A party left with no seats is not the end: the leader carries on from outside the House, and may retire at any quiet moment.
  if (seats === 0) pushNews(c, { party: c.player, key: 'news.wiped', vars: {}, tone: 'bad' });
  return true;
}

export { seatsAfter } from './results';
