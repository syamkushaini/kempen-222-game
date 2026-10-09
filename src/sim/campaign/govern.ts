import { majorityLine, type World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { PARTY_IDS, type BlocId } from '../types';
import { DEMANDS } from './cast';
import { houseTally } from './contests';
import { addScene, relation, shiftRelation } from './diplomacy';
import { startFormation } from './formation';
import { nationWeek } from './nation';
import { pushNews, ref } from './news';
import { cabinetWeek, economyWeek, inGov, isPm, lift, rivalBudget, skillOf, vacate } from './office';
import { draftingShift } from './ksu';
import { rebelShare, speakerOf, speakerTip } from './chamber';
import { BRIEF, PLEDGES, isBrief, isEnacted } from './policy';
import { supportersOf, supports } from './supply';
import {
  ISSUE_IDS, LEVER_IDS,
  type Campaign, type Career, type DemandId, type IssueId, type LeverId, type Obligation, type PledgeId, type PortfolioId, type Scene,
} from './types';

export {
  ACTING_DRAG, appoint, candidatesFor, deficit, economicMood, formCabinet, looseness, MINISTER_NAMES, reshuffle, setBudget, standstill, startEconomy,
  tableBudget, TRAIT_EFFECT, TRAIT_RISK, vacate, waitingForChoice,
} from './office';

const OTH = PARTY_IDS.indexOf('oth');


// ---------- bills ----------

export interface BillDef {
  portfolio: PortfolioId;
  /** The issue it turns on, and which side of it. Parties vote their position. */
  issue?: [IssueId, 1 | -1];
  /** What it adds to standing commitments if passed. */
  cost: number;
  appeal: Partial<Record<BlocId, number>>;
}

const PLEDGE_PORTFOLIO: Record<PledgeId, PortfolioId> = {
  cashAid: 'finance', fuelSubsidy: 'finance', minWage: 'economy', taxCut: 'finance', graftCommission: 'home', termLimit: 'home',
  hospitals: 'health', transitPass: 'works', debtWriteOff: 'education', civilPay: 'finance', borneoFund: 'rural',
  settlerDebt: 'rural', floorPrices: 'rural', valuesSchools: 'education', repealLaws: 'home', homes: 'works',
  partyHopBan: 'home', fixedTerm: 'home', infoAct: 'home', localVote: 'home', gigRights: 'economy', oilRoyalty: 'finance',
  schoolMeals: 'education', healthCover: 'health', greenGrid: 'works', villageRoads: 'rural', smeLoans: 'economy', seniorPension: 'finance',
  tollCut: 'works', epfWithdrawal: 'finance', civilReform: 'home',
};

/** Promises to partners that need an Act of Parliament rather than a signature. */
const DEMAND_BILLS: Partial<Record<DemandId, BillDef>> = {
  autonomy: { portfolio: 'home', issue: ['federalism', 1], cost: 1, appeal: { borneo_native: 0.05, borneo_urban: 0.05, civil: -0.02 } },
  valuesAgenda: { portfolio: 'education', issue: ['values', 1], cost: 0, appeal: { heartland: 0.05, felda: 0.02, urban_lib: -0.06, borneo_urban: -0.03 } },
  reformAgenda: { portfolio: 'home', issue: ['reform', 1], cost: 0, appeal: { urban_lib: 0.05, m40: 0.03, civil: -0.02 } },
};

export function billDef(id: string): BillDef | null {
  const [kind, name] = id.split(':');
  if (kind === 'pledge' && name in PLEDGES) {
    const p = PLEDGES[name as PledgeId];
    return { portfolio: PLEDGE_PORTFOLIO[name as PledgeId], issue: p.needs, cost: p.cost * 0.5, appeal: p.appeal };
  }
  if (kind === 'demand') return DEMAND_BILLS[name as DemandId] ?? null;
  return null;
}

export const MAX_BILLS = 2;

/** Weeks a bill takes to reach its vote. A capable minister drafts faster. */
export const prepWeeks = (k: Career, id: string) => {
  const def = billDef(id);
  const base = 9 - skillOf(k, def?.portfolio ?? 'home');
  // The head of the civil service drafts it: slowly if cautious and the bill is costly, quickly if reforming and it is reform.
  const reform = !!def?.issue && (def.issue[0] === 'reform' || def.issue[0] === 'graft');
  return Math.max(3, base + draftingShift(reform, def?.cost ?? 0, k.ksu?.outlook ?? 'political'));
};

/** Bills the player, as head of government, could put to the House: promises not yet settled, and what partners are owed. */
export function agenda(c: Campaign): string[] {
  const k = c.career!;
  const busy = new Set(k.bills.map((b) => b.id));
  const promises = k.promises.filter((id) => !k.delivery[id]).map((id) => `pledge:${id}`);
  const owed = k.obligations.filter((o) => !o.done && DEMAND_BILLS[o.demand]).map((o) => `demand:${o.demand}`);
  return [...new Set([...promises, ...owed])].filter((id) => !busy.has(id));
}

export function tableBill(c: Campaign, id: string): boolean {
  const k = c.career;
  if (!k || c.phase !== 'term' || !isPm(c) || k.bills.length >= MAX_BILLS || !agenda(c).includes(id)) return false;
  k.bills.push({ id, weeks: prepWeeks(k, id) });
  return true;
}

export type Vote = 'yes' | 'no' | 'wavering';
export interface Whip { yes: number; no: number; wavering: number; votes: Vote[]; lean: number[] }
export interface VoteTerms { sweetened?: boolean; confidence?: boolean; forced?: Partial<Record<number, 'yes' | 'no' | 'abstain'>> }

/**
 * How the House lines up on a bill from the party in `proposer`. Parties
 * vote their own position on the issue, tempered by loyalty to the
 * government or the lack of it. Those close to the line are wavering.
 */
export function whipCount(world: World, c: Campaign, id: string, proposer: number, terms: VoteTerms = {}): Whip {
  const k = c.career!;
  const def = billDef(id);
  const seats = houseTally(world, c);
  const out: Whip = { yes: 0, no: 0, wavering: 0, votes: seats.map(() => 'no' as Vote), lean: seats.map(() => 0) };
  seats.forEach((n, p) => {
    if (n <= 0) return;
    const forced = terms.forced?.[p];
    if (forced === 'abstain') return;
    if (p === OTH) {
      const yes = Math.round(n * clamp(0.56 + (terms.sweetened ? 0.3 : 0), 0, 1));
      out.yes += yes; out.no += n - yes;
      return;
    }
    // The proposer's own backbenchers, when their party is in uproar, do not all do as they are told.
    if (p === proposer && !terms.forced) {
      const rebels = Math.floor(n * rebelShare(c.parties[p]?.unity ?? 100));
      out.yes += n - rebels; out.no += rebels;
      out.lean[p] = 1;
      out.votes[p] = 'yes';
      return;
    }
    const align = def?.issue ? (k.stances[p][ISSUE_IDS.indexOf(def.issue[0])] * def.issue[1]) / 2 : 0.2;
    const warmth = relation(c, proposer, p) / 200;
    const margin = p === proposer ? 1
      : (inGov(c, p) || supports(c, p)) && inGov(c, proposer)
        ? 0.35 + k.government.stability / 250 + 0.5 * align + warmth + (terms.sweetened ? 0.25 : 0) + (terms.confidence ? 0.4 : 0) - 0.5
        : 0.6 * align + warmth + (terms.sweetened ? 0.15 : 0) - 0.35;
    out.lean[p] = margin;
    const vote: Vote = forced === 'yes' ? 'yes' : forced === 'no' ? 'no' : margin > 0.08 ? 'yes' : margin < -0.08 ? 'no' : 'wavering';
    out.votes[p] = vote;
    out[vote] += n;
  });
  return out;
}

/** How many votes a bill needs: a majority of the House, or two thirds of it for an amendment of the constitution. */
export function voteNeed(world: World, id: string): number {
  const [kind, name] = id.split(':');
  const amend = kind === 'pledge' && !!PLEDGES[name as PledgeId]?.amend;
  return amend ? Math.ceil((world.seats.length * 2) / 3) : majorityLine(world);
}

/** Holds the vote: the wavering make up their minds. Returns the final count. */
function divide(world: World, c: Campaign, id: string, proposer: number, terms: VoteTerms): { yes: number; no: number; passed: boolean } {
  const whip = whipCount(world, c, id, proposer, terms);
  const rng = new Rng(c.rng);
  const seats = houseTally(world, c);
  let { yes, no } = whip;
  whip.votes.forEach((v, p) => {
    if (v !== 'wavering') return;
    if (rng.next() < 0.5 + whip.lean[p] / 0.16 + (proposer === k0(c).government.pm ? speakerTip(c) : -speakerTip(c))) yes += seats[p]; else no += seats[p];
  });
  c.rng = rng.state;
  // A tied House is the Speaker’s: it goes the way they lean.
  const need = voteNeed(world, id);
  return { yes, no, passed: need > majorityLine(world) ? yes >= need : yes > no || (yes === no && speakerOf(c).lean > 0) };
}

const k0 = (c: Campaign) => c.career!;
const billRef = (id: string) => `@bill:${id}`;

/** One Act a government may repeal in a term: it goes back to being something that can be promised, at a price in trust and in the voters who liked it. */
export function canRepeal(c: Campaign, id: PledgeId): boolean {
  const k = c.career;
  return !!k && c.phase === 'term' && isPm(c) && c.inbox.length === 0 && isEnacted(k, id) && !k.flags.includes(`repeal${k.term}`);
}

/** An Act that is no longer on the books is no longer shaky, nor protected by a vote of the people. */
export function forgetAct(k: Career, id: PledgeId): void {
  if (k.shaky) { k.shaky = k.shaky.filter((x) => x !== id); if (k.shaky.length === 0) delete k.shaky; }
  if (k.mandated) { k.mandated = k.mandated.filter((x) => x !== id); if (k.mandated.length === 0) delete k.mandated; }
}

/** The head of government repeals an Act: its friends punish them, its enemies are a little pleased, and the public sees what it is. */
export function repeal(c: Campaign, id: PledgeId): boolean {
  if (!canRepeal(c, id)) return false;
  const k = c.career!;
  k.laws = (k.laws ?? []).filter((x) => x !== id);
  if (k.laws.length === 0) delete k.laws;
  forgetAct(k, id);
  k.flags.push(`repeal${k.term}`);
  k.government.trust = clamp(k.government.trust - 3, 0, 100);
  k.credibility = clamp(k.credibility - 3, 0, 100);
  for (const [bloc, v] of Object.entries(PLEDGES[id].appeal)) lift(k, c.player, [bloc as BlocId], v > 0 ? -v * 0.5 : -v * 0.3);
  pushNews(c, { party: c.player, key: 'news.gov.repealed', vars: { bill: `@bill:pledge:${id}` }, tone: 'bad' });
  return true;
}

/** What a passed bill does for the party that brought it. */
export function enact(c: Campaign, id: string, proposer: number, share?: number) {
  const k = c.career!;
  const def = billDef(id)!;
  const [kind, name] = id.split(':');
  // A promise made in its short form does half as much, and costs half as much.
  const scale = kind === 'pledge' && proposer === c.player && isBrief(k, name as PledgeId) ? BRIEF.share : 1;
  for (const [bloc, v] of Object.entries(def.appeal)) lift(k, proposer, [bloc as BlocId], v * 0.5 * scale);
  k.fiscal += def.cost * scale;
  // An Act stays on the books: it leaves every party's manifesto, and is not promised again at the next election.
  if (kind === 'pledge' && PLEDGES[name as PledgeId]?.law && !isEnacted(k, name as PledgeId)) {
    (k.laws ??= []).push(name as PledgeId);
    k.manifesto = k.manifesto.map((m) => m.filter((x) => x !== name));
    // An Act that scraped through the House is one a court may later strike down.
    if (share !== undefined && share < SHAKY_BELOW) (k.shaky ??= []).push(name as PledgeId);
  }
}

/** The share of the House's votes below which an Act that passed is thought shaky. */
export const SHAKY_BELOW = 0.55;

/**
 * The player's bill comes to its vote. 0: put it to the vote. 1: sweeten it
 * first, at a cost to the treasury. 2: make it a matter of confidence, so
 * partners fall into line, and the government falls if it is lost. 3: withdraw.
 */
export function resolveVote(world: World, c: Campaign, scene: Scene, choice: number): void {
  const k = c.career;
  const id = scene.bill;
  if (!k || !id || !billDef(id)) return;
  const me = c.player;
  k.bills = k.bills.filter((b) => b.id !== id);
  const [kind, name] = id.split(':');
  if (choice === 3) {
    k.credibility = clamp(k.credibility - 2, 0, 100);
    pushNews(c, { party: me, key: 'news.gov.withdrawn', vars: { bill: billRef(id) }, tone: 'neutral' });
    return;
  }
  if (choice === 1) k.fiscal += 0.5;
  const result = divide(world, c, id, me, { sweetened: choice === 1, confidence: choice === 2 });
  const vars = { bill: billRef(id), yes: result.yes, no: result.no };
  if (result.passed) {
    enact(c, id, me, result.yes / Math.max(1, result.yes + result.no));
    if (kind === 'pledge') { k.delivery[name as PledgeId] = 'kept'; k.record.kept.push(name as PledgeId); k.credibility = clamp(k.credibility + (isBrief(k, name as PledgeId) ? BRIEF.kept : 3), 0, 100); }
    else settle(c, name as DemandId);
    pushNews(c, { party: me, key: 'news.gov.passed', vars, tone: 'good' });
    return;
  }
  if (kind === 'pledge') k.delivery[name as PledgeId] = 'failed';
  k.credibility = clamp(k.credibility - (kind === 'pledge' && isBrief(k, name as PledgeId) ? BRIEF.failed : 2), 0, 100);
  k.government.stability = clamp(k.government.stability - 5, 5, 95);
  pushNews(c, { party: me, key: 'news.gov.defeated', vars, tone: 'bad' });
  if (choice === 2) { k.record.falls++; openTalks(world, c); }
}

/** Every so often a rival-led government puts one of its own promises to the House, and the player must say where they stand. */
function rivalBill(c: Campaign): void {
  const k = c.career!;
  const pm = k.government.pm;
  const next = k.manifesto[pm][k.rivalBills];
  if ((pm === c.player && !k.limited) || !next || k.week < 20 || (k.week - 20) % 40 !== 0) return;
  k.rivalBills++;
  addScene(c, { kind: 'houseVote', from: pm, bill: `pledge:${next}` });
}

/** The player votes on a rival government's bill. 0: for. 1: against. 2: abstain. */
export function resolveHouseVote(world: World, c: Campaign, scene: Scene, choice: number): void {
  const k = c.career;
  const id = scene.bill;
  const def = id ? billDef(id) : null;
  if (!k || !id || !def || scene.from === null) return;
  const me = c.player, pm = scene.from;
  const stand = choice === 0 ? 'yes' : choice === 1 ? 'no' : 'abstain';
  const result = divide(world, c, id, pm, { forced: { [me]: stand } });
  // Voters who wanted the bill remember who was for it and who was against.
  if (stand !== 'abstain') for (const [bloc, v] of Object.entries(def.appeal)) lift(k, me, [bloc as BlocId], v * 0.3 * (stand === 'yes' ? 1 : -1));
  if (stand === 'yes') shiftRelation(c, me, pm, 5);
  if (stand === 'no') {
    shiftRelation(c, me, pm, inGov(c, me) ? -15 : -5);
    if (inGov(c, me)) k.government.stability = clamp(k.government.stability - 6, 5, 95);
  }
  if (result.passed) enact(c, id, pm, result.yes / Math.max(1, result.yes + result.no));
  else k.government.stability = clamp(k.government.stability - 4, 5, 95);
  pushNews(c, {
    party: pm, key: result.passed ? 'news.house.passed' : 'news.house.defeated',
    vars: { party: ref.party(pm), bill: billRef(id), yes: result.yes, no: result.no }, tone: 'neutral',
  });
}

// ---------- what partners are owed ----------

/** Whether a promise to a partner has to go through the House. */
export const needsBill = (demand: DemandId) => demand in DEMAND_BILLS;

/** A year's grace before the first promise falls due, and half a year between the rest. */
const FIRST_DUE = 52, DUE_GAP = 26;

/**
 * The weeks in which `n` promises made in `week` fall due, in a term of
 * `length` weeks. Where there are too many for the usual spacing, or too
 * little of the term is left, they close up so that the last still falls due
 * before the term ends.
 */
export function dueWeeks(week: number, length: number, n: number): number[] {
  const left = Math.max(0, length - week);
  const first = Math.min(FIRST_DUE, left / 2);
  const gap = n > 1 ? Math.min(DUE_GAP, (left - first) / (n - 1)) : 0;
  return Array.from({ length: n }, (_, i) => week + Math.round(first + gap * i));
}

/** Lists what the player, as head of government, promised each partner, and when each falls due. */
export function makeObligations(c: Campaign): void {
  const k = c.career!;
  k.obligations = [];
  if (!isPm(c)) return;
  const owed = k.government.partners.flatMap((p) => (k.government.deals[p]?.demands ?? []).map((demand) => ({ party: p, demand })));
  const due = dueWeeks(k.week, k.length, owed.length);
  k.obligations = owed.map((o, i) => ({ ...o, due: due[i], done: false }));
}

/** A promise to a partner is made good: they are pleased, and so is the government's stability. */
function settle(c: Campaign, demand: DemandId): void {
  const k = c.career!;
  for (const o of k.obligations) {
    if (o.demand !== demand || o.done) continue;
    o.done = true;
    shiftRelation(c, c.player, o.party, 8);
    k.government.stability = clamp(k.government.stability + 3, 5, 95);
  }
}

/**
 * Delivers on a promise to a partner. Some are a stroke of the pen with a
 * price attached; those that need a law are put to the House as a bill.
 */
export function deliver(c: Campaign, index: number): boolean {
  const k = c.career;
  const o: Obligation | undefined = k?.obligations[index];
  if (!k || !o || o.done || c.phase !== 'term' || !isPm(c)) return false;
  if (needsBill(o.demand)) return tableBill(c, `demand:${o.demand}`);
  const def = DEMANDS[o.demand];
  if (def.treasury) k.fiscal += 1;
  if (def.trust > 0) {
    // What was promised quietly is now done in daylight.
    k.credibility = clamp(k.credibility - def.trust / 4, 0, 100);
    lift(k, c.player, ['urban_lib', 'm40'], -def.trust / 500);
  }
  if (o.demand === 'reformPause') for (const id of ['graftCommission', 'termLimit'] as const) if (k.promises.includes(id) && !k.delivery[id]) k.delivery[id] = 'failed';
  settle(c, o.demand);
  pushNews(c, { party: c.player, key: 'news.gov.delivered', vars: { party: ref.party(o.party), demand: `@demand:${o.demand}` }, tone: 'neutral' });
  return true;
}

// ---------- leaning on institutions ----------

const LEVER_GAP = 52;
/** What each earlier use of the same lever this parliament adds: to the trust it costs, the chance the agency's attack backfires, the harm to the cities and the young, and the loss of credibility. */
export const LEVER_STRAIN = { trust: 2, backfire: 0.1, mood: 0.01, credibility: 1, max: 4 };
export const leverStrain = (k: Career, id: LeverId): number => Math.min(LEVER_STRAIN.max, k.leverUses?.[id] ?? 0);
export function canPull(c: Campaign, id: LeverId): boolean {
  const k = c.career;
  if (!k || c.phase !== 'term' || !isPm(c) || c.inbox.length > 0) return false;
  const last = k.levers[LEVER_IDS.indexOf(id)];
  return last === 0 || k.week - last >= LEVER_GAP;
}

/** The party across the floor with the most seats. */
function mainOpposition(world: World, c: Campaign): number {
  const seats = houseTally(world, c);
  return seats.map((n, p) => ({ n, p })).filter(({ p }) => p !== OTH && !!c.parties[p] && !inGov(c, p)).sort((a, b) => b.n - a.n)[0]?.p ?? -1;
}

/**
 * Leans on an institution that is supposed to be independent. It works, and
 * it costs the government the public's trust; the anti-graft agency can also
 * make a martyr of its target.
 */
export function pullLever(world: World, c: Campaign, id: LeverId): boolean {
  if (!canPull(c, id)) return false;
  const k = c.career!;
  const me = c.player;
  const g = k.government;
  const rng = new Rng(c.rng);
  k.levers[LEVER_IDS.indexOf(id)] = k.week;
  // Leaning on the same institution again and again is noticed: each time costs more, and the agency's targets are readier for it.
  const strain = leverStrain(k, id);
  (k.leverUses ??= {})[id] = (k.leverUses[id] ?? 0) + 1;
  g.trust = clamp(g.trust - LEVER_STRAIN.trust * strain, 0, 100);
  let key = `news.gov.lever.${id}`;
  if (id === 'agency') {
    const target = mainOpposition(world, c);
    g.trust = clamp(g.trust - 6, 0, 100);
    if (target >= 0) {
      shiftRelation(c, me, target, -25);
      if (rng.next() < 0.7 - LEVER_STRAIN.backfire * strain) lift(k, target, 'all', -0.03);
      else { lift(k, target, 'all', 0.02); k.credibility = clamp(k.credibility - 5, 0, 100); key += '.backfire'; }
    }
  } else if (id === 'police') {
    g.trust = clamp(g.trust - 4, 0, 100);
    c.parties.forEach((pc, p) => { if (pc && !inGov(c, p)) k.profile[p] = Math.max(0, k.profile[p] - 0.02); });
    lift(k, me, ['urban_lib', 'undi18'], -0.02 - LEVER_STRAIN.mood * strain);
    k.salience[ISSUE_IDS.indexOf('liberties')] = clamp(k.salience[ISSUE_IDS.indexOf('liberties')] + 0.4, 0.5, 2);
  } else {
    g.trust = clamp(g.trust - 3, 0, 100);
    k.credibility = clamp(k.credibility - 2 - LEVER_STRAIN.credibility * strain, 0, 100);
    k.profile[me] = Math.min(0.12, k.profile[me] + 0.04);
  }
  c.rng = rng.state;
  pushNews(c, { party: me, key, vars: { party: ref.party(mainOpposition(world, c)) }, tone: key.endsWith('backfire') ? 'bad' : 'neutral' });
  return true;
}

// ---------- confidence ----------

/** The talks open between elections, with the seats as they stand. */
export function openTalks(world: World, c: Campaign): void {
  c.career!.midterm = true;
  c.inbox = [];
  startFormation(world, c, houseTally(world, c));
}

/** A partner stands by the government if it gets on with its head and the government looks like lasting. */
/** How far a partner stands behind the government: above zero it votes with it. */
export const loyalty = (c: Campaign, p: number) => relation(c, c.career!.government.pm, p) / 100 + (c.career!.government.stability - 50) / 100 + 0.15;

/** Members the government can count on in a confidence vote, before anyone wavers. */
export function confidenceCount(world: World, c: Campaign, sway: (p: number) => number = () => 0): number {
  const g = c.career!.government;
  const seats = houseTally(world, c);
  // Those who keep the government in office from outside count with its partners.
  return seats[g.pm] + [...g.partners, ...supportersOf(c)].reduce((a, p) => a + (loyalty(c, p) + sway(p) > 0 ? seats[p] : 0), 0) + Math.floor(seats[OTH] / 2);
}

/** Holds a confidence vote. Returns true if the government survives. */
function confidenceVote(world: World, c: Campaign): boolean {
  const rng = new Rng(c.rng);
  const noise = c.parties.map(() => rng.normal(0, 0.1));
  c.rng = rng.state;
  return confidenceCount(world, c, (p) => noise[p]) >= majorityLine(world);
}

/** An opposition leader may table a no-confidence motion once the House has sat for half a year, and once a year after that. */
export function canMotion(c: Campaign): boolean {
  const k = c.career;
  return !!k && c.phase === 'term' && c.inbox.length === 0 && !inGov(c, c.player) && k.week >= 26 && (k.motion === 0 || k.week - k.motion >= 52);
}

/** The player moves no confidence in the government. If it carries, the government falls and the talks open. */
export function tableMotion(world: World, c: Campaign): boolean {
  if (!canMotion(c)) return false;
  const k = c.career!;
  const pm = k.government.pm;
  k.motion = k.week;
  shiftRelation(c, c.player, pm, -10);
  if (confidenceVote(world, c)) {
    k.credibility = clamp(k.credibility - 3, 0, 100);
    k.government.stability = clamp(k.government.stability + 5, 5, 95);
    pushNews(c, { party: c.player, key: 'news.motion.failed', vars: { party: ref.party(pm) }, tone: 'bad' });
    return true;
  }
  k.record.toppled++;
  pushNews(c, { party: c.player, key: 'news.motion.carried', vars: { party: ref.party(pm) }, tone: 'good' });
  openTalks(world, c);
  return true;
}

/**
 * The player's government faces a no-confidence motion. 0: face it as things
 * stand. 1: buy the partners' loyalty first, at the treasury's expense.
 */
export function faceMotion(world: World, c: Campaign, choice: number): void {
  const k = c.career!;
  if (choice === 1) { k.fiscal += 1; k.government.stability = clamp(k.government.stability + 8, 5, 95); }
  if (confidenceVote(world, c)) {
    k.government.stability = clamp(k.government.stability + 6, 5, 95);
    pushNews(c, { party: c.player, key: 'news.motion.survived', tone: 'good' });
    return;
  }
  k.record.falls++;
  pushNews(c, { party: c.player, key: 'news.motion.lost', tone: 'bad' });
  openTalks(world, c);
}

/** The player, a partner in someone else's government, walks out. If that costs it its majority, the talks open. */
export function leaveGovernment(world: World, c: Campaign): boolean {
  const k = c.career;
  const me = c.player;
  if (!k || c.phase !== 'term' || c.inbox.length > 0 || !k.government.partners.includes(me)) return false;
  const g = k.government;
  g.partners = g.partners.filter((p) => p !== me);
  g.deals[me] = null;
  g.seats -= houseTally(world, c)[me];
  k.orders.state = 0;
  shiftRelation(c, me, g.pm, -30);
  pushNews(c, { party: me, key: 'news.gov.youLeft', vars: { party: ref.party(g.pm) }, tone: 'neutral' });
  if (g.seats < majorityLine(world)) { k.record.toppled++; openTalks(world, c); }
  else { g.stability = clamp(g.stability - 5, 5, 95); vacate(c, me); }
  return true;
}

// ---------- the week, and the reckoning ----------

/** The governing side of a week of the term: the economy moves, bills come up, budgets and debts fall due. */
export function governWeek(c: Campaign, rng: Rng): void {
  const k = c.career!;
  const me = c.player;
  economyWeek(c, rng);
  nationWeek(c, rng);
  if (isPm(c)) k.record.weeksPm++; else if (inGov(c, me)) k.record.weeksGov++; else k.record.weeksOpp++;

  // A capable cabinet steadies a government a little; a poor one wears it down.
  const skill = k.cabinet.reduce((a, m) => a + m.skill, 0) / Math.max(1, k.cabinet.length);
  k.government.stability = clamp(k.government.stability + 0.03 * (skill - 3), 5, 95);
  cabinetWeek(c, rng);

  for (const bill of k.bills) bill.weeks--;
  const ready = k.bills.find((b) => b.weeks <= 0);
  if (ready && isPm(c) && !c.inbox.some((s) => s.bill === ready.id)) addScene(c, { kind: 'vote', from: null, bill: ready.id });

  for (const o of k.obligations) {
    if (o.done || k.week <= o.due) continue;
    o.due += 52;
    shiftRelation(c, me, o.party, -12);
    k.government.stability = clamp(k.government.stability - 4, 5, 95);
    pushNews(c, { party: o.party, key: 'news.gov.overdue', vars: { party: ref.party(o.party), demand: `@demand:${o.demand}` }, tone: 'bad' });
  }

  if (!isPm(c)) {
    rivalBill(c);
    if (((k.week - 1) % 52) + 1 === 40) rivalBudget(c);
  }
}

/**
 * At a dissolution, a head of government answers for the last manifesto:
 * promises never brought to a vote cost credibility and the voters they were
 * made to. Promises kept went on the record the day their bills passed.
 */
export function reckon(c: Campaign): void {
  const k = c.career!;
  if (!isPm(c) || k.promises.length === 0) return;
  const kept = k.promises.filter((id) => k.delivery[id] === 'kept');
  const broken = k.promises.filter((id) => !k.delivery[id]);
  for (const id of broken) {
    k.credibility = clamp(k.credibility - 3, 0, 100);
    for (const [bloc, v] of Object.entries(PLEDGES[id].appeal)) if (v > 0) lift(k, c.player, [bloc as BlocId], -v * 0.5);
  }
  k.credibility = clamp(k.credibility - (k.promises.length - kept.length - broken.length), 0, 100);
  k.record.broken += broken.length;
  pushNews(c, { party: c.player, key: 'news.gov.reckoning', vars: { kept: kept.length, total: k.promises.length }, tone: broken.length > kept.length ? 'bad' : 'good' });
}

