import { emptyDynamics } from '../dynamics';
import { lastElection, majorityLine, type World } from '../election';
import { clamp, zeros, zeros2 } from '../math';
import { Rng } from '../rng';
import { N_BLOCS, N_PARTIES, PARTY_IDS, type RegionId } from '../types';
import { contestsState, scaled } from './actions';
import { START_UNITY } from './cast';
import { houseTally, resolveByElection, resolveStatePolls, roundDue, startStates, STATE_GOVERNMENT_INCOME, statesHeld, vacantSeat } from './contests';
import { relation, shiftRelation } from './diplomacy';
import { EVENTS, raise, resolveEvent, rollEvent } from './events';
import {
  faceMotion, formCabinet, governWeek, makeObligations, openTalks, reckon, resolveHouseVote, resolveVote, standstill,
  startEconomy, tableBudget, vacate,
} from './govern';
import { endCareer, OUSTED_BELOW } from './legacy';
import { applyBackstory, applyIdeology, type IdeologyId } from './leader';
import { recordResults } from './results';
import { FORMATION_WEEK, pushNews, ref } from './news';
import { FOUNDING_FUNDS, growFoundedParty } from './founding';
import { edge, incomeBoost, mediaBoost, neutralLeader, skill } from './perks';
import { afterLender } from './loan';
import { membersWeek } from './members';
import { plotsWeek, resolveUltimatum } from './plots';
import { payday, staffWeek, wages } from './staff';
import { closeCampaign, openCampaign } from './team';
import { defaultManifestos, launchManifesto, nationalAppeal, policyEffect, startStances } from './policy';
import {
  freshParty, makeDrift, newCampaign, publishPublicPoll, startingFunds, weeklyIncome, type CampaignOptions,
} from './turn';
import {
  FOCUS_IDS, ISSUE_IDS, N_ISSUES,
  type Campaign, type Career, type Level, type Orders, type Outcome, type Scene, type SeatResults,
} from './types';

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
const STATE_INCOME = 10_000;
/** Weekly return on money invested in party businesses. */
const ASSET_YIELD = 0.0025;
/** Businesses are bought and sold in lots of this size; selling loses a tenth. */
export const ASSET_LOT = 100_000;
const MAX_FOCUS_STATES = 3;
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
  for (let b = 0; b < N_BLOCS; b++) for (let p = 0; p < N_PARTIES; p++) c.drift.support.nat[b][p] = k.mood[b][p] + k.profile[p] + policy[b][p];
}

// ---------- starting ----------

/** The government a career opens with: the largest party leading a broad coalition, as after the last real election. */
function firstGovernment(world: World): Outcome {
  const tally = lastElection(world).tally;
  const [ps, bp, gbk, gbs, legasi] = (['ps', 'bp', 'gbk', 'gbs', 'legasi'] as const).map((id) => PARTY_IDS.indexOf(id));
  const partners = [bp, gbk, gbs, legasi];
  const deals: Outcome['deals'] = new Array(N_PARTIES).fill(null);
  deals[bp] = { posts: 6, senior: 'dpm', demands: ['subsidies'], cash: 0 };
  deals[gbk] = { posts: 5, senior: null, demands: ['autonomy'], cash: 0 };
  deals[gbs] = { posts: 1, senior: null, demands: ['autonomy'], cash: 0 };
  deals[legasi] = { posts: 1, senior: null, demands: [], cash: 0 };
  return {
    pm: ps, partners, seats: tally[ps] + partners.reduce((a, p) => a + tally[p], 0),
    minority: false, stability: 60, trust: 60, deals, day: 0,
  };
}

const defaultOrders = (): Orders => ({
  focus: 'tour', courting: null, budget: { machinery: 1, media: 1, research: 0 }, focusStates: [], donors: 0, state: 0,
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
  c.career!.bills = [];
}

/** Opens a career at the start of a parliamentary term, with the coffers low after the last election. */
export function startCareer(world: World, opts: CampaignOptions & { ideology?: IdeologyId | null; founded?: boolean; stances?: number[] }): Campaign {
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
  c.career.states = startStates(world);
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

export interface Income { members: number; donors: number; state: number; assets: number; states: number; total: number }

/** What comes in each week between elections, by source. */
export function termIncome(world: World, c: Campaign): Income {
  const k = c.career!;
  const pc = c.parties[c.player]!;
  const drive = k.orders.focus === 'funds';
  const members = Math.round(weeklyIncome(world, c.player, c) * PEACETIME * (0.6 + 0.4 * pc.unity / 100) * (0.8 + k.credibility / 250) * (drive ? 1.6 : 1) * incomeBoost(c, c.player));
  const donors = Math.round(scaled(world, DONOR_INCOME) * k.orders.donors * (drive ? 1.3 : 1));
  const state = inGovernment(c, c.player) ? scaled(world, STATE_INCOME) * k.orders.state : 0;
  const assets = Math.round(k.assets * ASSET_YIELD);
  // A party that governs states has their patronage to draw on.
  const states = scaled(world, STATE_GOVERNMENT_INCOME) * statesHeld(c, c.player);
  return { members, donors, state, assets, states, total: members + donors + state + assets + states };
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
  if (isLevel(patch.state)) o.state = inGovernment(c, c.player) ? patch.state : 0;
}

/** Buys (positive) or sells (negative) lots of party businesses. Selling in a hurry loses a tenth. */
export function invest(world: World, c: Campaign, lots: number): boolean {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k || !pc || c.phase !== 'term' || !Number.isInteger(lots) || lots === 0) return false;
  const amount = scaled(world, ASSET_LOT) * Math.abs(lots);
  if (lots > 0) {
    if (amount > pc.funds) return false;
    pc.funds -= amount; k.assets += amount;
  } else {
    if (amount > k.assets) return false;
    k.assets -= amount; pc.funds += Math.round(amount * 0.9);
  }
  return true;
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
  const rng = new Rng(c.rng);
  const o = k.orders;

  // Money. If the orders cost more than there is, everything is cut back in proportion.
  const income = termIncome(world, c);
  const plan = termSpending(world, c);
  pc.funds += afterLender(c, pc, income.total);
  const afford = plan.total > 0 ? Math.min(1, pc.funds / plan.total) : 1;
  pc.funds -= Math.round(plan.total * afford);
  // The retainer is cut back with everything else, and a team on part pay does not work.
  payday(c, afford >= 1 || plan.wages === 0);

  // Branches wither a little every week, and grow where money and the leader's time go.
  const targets = machineryTargets(world, c);
  const points = ((afford * plan.machinery) / scaled(world, 6_000) * 0.25 + (o.focus === 'tour' ? 0.3 : 0)) * edge(c, me, 'organisation') * (1 + 0.05 * skill(c, me, 'manager'));
  pc.machinery = pc.machinery.map((m, i) => {
    if (m <= 0) return 0;
    const grown = targets.includes(world.states[i]) ? points / targets.length : 0;
    return clamp(m - 0.04 + grown, 10, 100);
  });

  const seen = ((afford * plan.media) / scaled(world, 4_000) * 0.0012 + (o.focus === 'media' ? 0.0015 : 0)) * edge(c, me, 'charisma') * mediaBoost(c, me);
  k.profile[me] = Math.min(PROFILE_CAP, k.profile[me] * 0.97 + seen);
  const dug = ((afford * plan.research) / scaled(world, 3_000) * 0.15 + (o.focus === 'dirt' ? 0.5 : 0)) * edge(c, me, 'cunning') * (1 + 0.06 * skill(c, me, 'strategist'));
  k.dossier = clamp(k.dossier + dug, 0, 100);
  if (o.focus === 'policy') k.credibility = Math.min(Math.max(k.credibility, 85), k.credibility + 0.2 * edge(c, me, 'integrity'));
  // The team is on the payroll already; what is left is whether anyone's past comes out this week.
  staffWeek(world, c, new Rng((c.rng ^ 0x57aff) + k.week), false);
  plotsWeek(world, c);
  if (c.phase !== 'term') return;
  membersWeek(world, c, new Rng((c.rng ^ 0x3e3be5) + k.week));
  if (o.focus === 'leaders' && o.courting !== null && k.week % 4 === 0 && relation(c, me, o.courting) < 45) shiftRelation(c, me, o.courting, 2);

  // Easy money has a slow price as well as a sudden one.
  k.credibility = clamp(k.credibility - 0.03 * o.donors, 0, 100);
  if (inGovernment(c, me)) k.government.trust = clamp(k.government.trust - 0.05 * o.state, 0, 100);
  pc.unity = clamp(pc.unity + Math.sign(65 - pc.unity) * 0.05, 0, 100);
  k.salience = k.salience.map((s) => s + (1 - s) * 0.02);
  k.government.stability = clamp(k.government.stability + rng.normal(0, k.government.pm === me ? 0.15 : 0.4), 5, 95);

  rivalsWeek(world, c, rng);
  growFoundedParty(world, c);
  governWeek(c, rng);
  syncOpinion(c);
  // One thing at a time: nothing new arrives while a vote is waiting. The states' own elections come when they are due.
  if (c.inbox.length === 0 && roundDue(c) !== null) raise(c, 'statePolls');
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
  if (scene.kind === 'vote') resolveVote(world, c, scene, choice);
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
  if (!inGovernment(c, c.player)) k.orders.state = 0;
  // News from the talks is filed with the week they happened in.
  for (const item of c.news) if (item.week >= FORMATION_WEEK) item.week = k.week;
  return true;
}

export function canDissolve(c: Campaign): boolean {
  const k = c.career;
  return !!k && c.phase === 'term' && c.inbox.length === 0 && k.government.pm === c.player && k.week >= EARLIEST_DISSOLUTION;
}

/** The player, as head of government, asks for a dissolution and goes to the country early. */
export function dissolve(world: World, c: Campaign): boolean {
  if (!canDissolve(c)) return false;
  beginCampaign(world, c);
  return true;
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
  c.inbox = [];
  openCampaign(world, c);
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
  const recorded = recordResults(world, c);
  const rng = new Rng(c.rng);
  const next = freshCareer(k.term + 1, outcome, recorded);
  c.career = {
    ...next,
    ...(k.founded ? { founded: true } : {}),
    ...(k.nation ? { nation: { ...k.nation } } : {}),
    orders: k.orders, assets: k.assets, credibility: k.credibility, dossier: Math.round(k.dossier * 0.5),
    stances: k.stances, stances0: k.stances.map((row) => [...row]),
    manifesto: next.manifesto.map((m, p) => (p === c.player ? [...k.manifesto[p]] : m)),
    promises: k.promises, flags: k.flags,
    economy: k.economy, tabled: k.tabled, budget: k.budget, fiscal: k.fiscal * 0.5, record: k.record, states: k.states,
  };
  const seats = recorded.votes.reduce((a, row) => a + (row[c.player] > 0 && row[c.player] === Math.max(...row) ? 1 : 0), 0);
  const r = c.career.record;
  r.elections++;
  r.bestSeats = Math.max(r.bestSeats, seats);
  if (outcome.pm === c.player) r.victories++;
  if (!inGovernment(c, c.player)) c.career.orders.state = 0;
  // The campaign's bills arrive after the votes are counted: half of what was left goes on them.
  const pc = c.parties[c.player]!;
  pc.funds = Math.round(pc.funds * 0.5);

  c.phase = 'term';
  c.week = 1;
  c.election = null;
  c.formation = null;
  c.dyn = emptyDynamics();
  c.drift = makeDrift(world, rng);
  c.rng = rng.state;
  c.standDowns = {};
  c.pacts = [];
  c.understandings = [];
  c.katak = [];
  c.offered = [];
  c.inbox = [];
  c.polls = [];
  c.news = [];
  c.ledger = [];
  delete c.recap;
  closeCampaign(c);
  syncOpinion(c);
  takeOffice(c);
  pushNews(c, { party: null, key: 'news.term.start', vars: { party: ref.party(outcome.pm), n: outcome.seats }, tone: 'neutral' });
  // A leader whose party has no seats left has no party to lead.
  if (seats === 0) endCareer(c, 'wipedOut');
  return true;
}

export { seatsAfter } from './results';
