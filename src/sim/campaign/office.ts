import { clamp } from '../math';
import { Rng } from '../rng';
import { BLOC_IDS, N_BLOCS, PARTY_IDS, type BlocId, type PartyId } from '../types';
import { shiftRelation, shiftUnity } from './diplomacy';
import { pushNews, ref } from './news';
import {
  LINE_IDS, PORTFOLIO_IDS,
  type Budget, type Campaign, type Career, type Dial, type Economy, type LineId, type Minister, type PortfolioId,
} from './types';

export const isPm = (c: Campaign) => c.career!.government.pm === c.player;
export const inGov = (c: Campaign, p: number) => c.career!.government.pm === p || c.career!.government.partners.includes(p);

/** Adds to a party's standing with the blocs named, or with everyone. */
export function lift(k: Career, p: number, blocs: BlocId[] | 'all', n: number) {
  const rows = blocs === 'all' ? Array.from({ length: N_BLOCS }, (_, b) => b) : blocs.map((b) => BLOC_IDS.indexOf(b));
  for (const b of rows) k.mood[b][p] += n;
}

// ---------- the economy ----------

export const startEconomy = (): Economy => ({ growth: 4.2, inflation: 2.8, jobless: 3.6, debt: 63 });
export const standstill = (): Budget => ({ lines: { aid: 0, health: 0, education: 0, rural: 0, civil: 0 }, tax: 0 });

/** Who notices each line of the budget. */
const LINE_BLOCS: Record<LineId, BlocId[]> = {
  aid: ['urban_b40', 'heartland', 'gig', 'felda'],
  health: ['seniors', 'urban_b40', 'borneo_native'],
  education: ['undi18', 'm40'],
  rural: ['agri', 'felda', 'borneo_native', 'borneo_urban'],
  civil: ['civil', 'seniors'],
};

export const skillOf = (k: Career, portfolio: PortfolioId) => k.cabinet.find((m) => m.portfolio === portfolio)?.skill ?? 3;

/** How far a budget loosens (positive) or tightens the purse: spending lines up, taxes down, plus standing commitments. */
export function looseness(k: Career, budget: Budget = k.tabled): number {
  return LINE_IDS.reduce((a, id) => a + budget.lines[id], 0) - 2 * budget.tax + 0.5 * k.fiscal;
}

/** The deficit a budget produces, as a share of national income. A capable finance minister shaves it. */
export function deficit(k: Career, budget: Budget = k.tabled): number {
  return clamp(3.5 + 0.5 * looseness(k, budget) - 0.2 * (skillOf(k, 'finance') - 3), 0, 9);
}

/** How the economy feels to voters, from very bad (-3) to very good (3). */
export function economicMood(e: Economy): number {
  return clamp((e.growth - 4) * 0.5 - (e.inflation - 2.5) * 0.6 - (e.jobless - 3.5) * 0.5, -3, 3);
}

export function economyWeek(c: Campaign, rng: Rng) {
  const k = c.career!;
  const e = k.economy;
  const loose = looseness(k);
  // Loose budgets buy growth and prices; heavy debt drags; cutting aid shows up at the till.
  const growthTo = 4 + 0.15 * loose - Math.max(0, e.debt - 70) * 0.08;
  const pricesTo = 2.5 + 0.3 * loose - 0.3 * k.tabled.lines.aid;
  e.growth = clamp(e.growth + (growthTo - e.growth) * 0.04 + rng.normal(0, 0.05), -6, 9);
  e.inflation = clamp(e.inflation + (pricesTo - e.inflation) * 0.04 + rng.normal(0, 0.04), -1, 12);
  e.jobless = clamp(e.jobless + (3.5 - (e.growth - 4) * 0.35 - e.jobless) * 0.03 + rng.normal(0, 0.015), 2, 12);
  // A deficit above what growth can carry piles up as debt: the bill for this year's generosity arrives later.
  e.debt = clamp(e.debt + ((deficit(k) - 3.5) * 1.5) / 52 - (e.growth - 4) * 0.01, 30, 120);
  // Those in office answer for it.
  const g = k.government;
  const feel = 0.0009 * economicMood(e);
  lift(k, g.pm, 'all', feel);
  for (const p of g.partners) lift(k, p, 'all', feel / 2);
}

/** The head of government changes next year's budget plan. It takes effect when it is tabled. */
export function setBudget(c: Campaign, patch: { line?: LineId; tax?: boolean; value: Dial }): boolean {
  const k = c.career;
  if (!k || c.phase !== 'term' || !isPm(c) || ![-1, 0, 1].includes(patch.value)) return false;
  if (patch.tax) k.budget.tax = patch.value;
  else if (patch.line && LINE_IDS.includes(patch.line)) k.budget.lines[patch.line] = patch.value;
  else return false;
  return true;
}

/** Puts a budget into force: its lines land with the blocs that notice them, and its size sets the economy's course. */
export function tableBudget(c: Campaign, plan: Budget): void {
  const k = c.career!;
  const g = k.government;
  k.tabled = { lines: { ...plan.lines }, tax: plan.tax };
  for (const id of LINE_IDS) {
    if (plan.lines[id] === 0) continue;
    lift(k, g.pm, LINE_BLOCS[id], 0.02 * plan.lines[id]);
    for (const p of g.partners) lift(k, p, LINE_BLOCS[id], 0.008 * plan.lines[id]);
  }
  if (plan.tax !== 0) lift(k, g.pm, ['smallbiz', 'm40'], plan.tax > 0 ? -0.02 : 0.015);
  // Partners with rural and Borneo seats, and the party of the civil service, watch their own lines.
  for (const p of g.partners) {
    const id = PARTY_IDS[p];
    const cares: LineId = id === 'bp' ? 'civil' : 'rural';
    if (plan.lines[cares] !== 0) shiftRelation(c, g.pm, p, 3 * plan.lines[cares]);
  }
  const loose = looseness(k);
  if (g.pm === c.player) {
    if (loose >= 3) { k.credibility = clamp(k.credibility - 2, 0, 100); g.stability = clamp(g.stability - 2, 5, 95); }
    if (loose <= -3) k.credibility = clamp(k.credibility + 3, 0, 100);
  }
  pushNews(c, {
    party: g.pm, key: loose >= 2 ? 'news.gov.budget.loose' : loose <= -2 ? 'news.gov.budget.tight' : 'news.gov.budget.steady',
    vars: { party: ref.party(g.pm), pct: deficit(k).toFixed(1) }, tone: 'neutral',
  });
}

/** The budget a rival head of government tables: each party has its habits, and all of them sober up when the debt is high. */
export function rivalBudget(c: Campaign): void {
  const k = c.career!;
  const plan = standstill();
  if (k.economy.debt < 70) {
    const habit: Partial<Record<PartyId, LineId[]>> = { ps: ['education'], bp: ['aid', 'civil'], pt: ['aid', 'rural'] };
    for (const line of habit[PARTY_IDS[k.government.pm]] ?? []) plan.lines[line] = 1;
  } else plan.tax = 1;
  tableBudget(c, plan);
}

// ---------- the cabinet ----------

/** Invented names for ministers. Proper nouns; the same in every language. */
export const MINISTER_NAMES = [
  'Azlan Mokhtar', 'Noraini Hashim', 'Zulkifli Daud', 'Suraya Latiff', 'Kamarul Bahrin', 'Rosnah Yahya',
  'Lee Chee Keong', 'Wong Siew Lan', 'Tan Boon Hock', 'Chong Mei Yin',
  'Ravi Chandran', 'Shanti Devan', 'Gopal Krishnan', 'Anita Selvam',
  'Jimmy Laing', 'Patricia Unggang', 'Douglas Nyipa', 'Felicia Jainal', 'Maxwell Gimbang', 'Rosalind Sipin',
];

function newMinister(k: Career, portfolio: PortfolioId, party: number, rng: Rng): Minister {
  const taken = new Set(k.cabinet.map((m) => m.name));
  let name = rng.int(MINISTER_NAMES.length);
  for (let i = 0; i < MINISTER_NAMES.length && taken.has(name); i++) name = (name + 1) % MINISTER_NAMES.length;
  return { portfolio, party, name, skill: 1 + Math.min(4, Math.floor(rng.next() * 5)) };
}

/**
 * Appoints a cabinet for the government in office. Partners get the senior
 * posts they were promised and a share of the rest in line with their posts;
 * the head of government's party fills what is left.
 */
export function formCabinet(c: Campaign, rng: Rng): void {
  const k = c.career!;
  const g = k.government;
  const holder = new Map<PortfolioId, number>();
  for (const p of g.partners) {
    const senior = g.deals[p]?.senior;
    if (senior === 'finance' || senior === 'home') holder.set(senior, p);
  }
  const free = PORTFOLIO_IDS.filter((id) => !holder.has(id) && id !== 'finance' && id !== 'home').reverse();
  for (const p of [...g.partners].sort((a, b) => (g.deals[b]?.posts ?? 0) - (g.deals[a]?.posts ?? 0))) {
    let share = Math.floor(((g.deals[p]?.posts ?? 0) * PORTFOLIO_IDS.length) / 28) - (holder.has('finance') && holder.get('finance') === p ? 1 : 0) - (holder.get('home') === p ? 1 : 0);
    while (share-- > 0 && free.length > 0) holder.set(free.pop()!, p);
  }
  k.cabinet = [];
  for (const id of PORTFOLIO_IDS) k.cabinet.push(newMinister(k, id, holder.get(id) ?? g.pm, rng));
}

/** A party leaves the government: its ministers go with it, and the head of government's party fills the gaps. */
export function vacate(c: Campaign, party: number): void {
  const k = c.career!;
  const rng = new Rng(c.rng);
  k.cabinet.forEach((m, i) => {
    if (m.party !== party) return;
    k.cabinet.splice(i, 1);
    k.cabinet.splice(i, 0, newMinister(k, m.portfolio, k.government.pm, rng));
  });
  c.rng = rng.state;
}

/** The head of government replaces a minister with one of their own party. Taking a post from a partner is not forgiven lightly. */
export function reshuffle(c: Campaign, portfolio: PortfolioId): boolean {
  const k = c.career;
  if (!k || c.phase !== 'term' || !isPm(c)) return false;
  const i = k.cabinet.findIndex((m) => m.portfolio === portfolio);
  if (i < 0) return false;
  const old = k.cabinet[i];
  const rng = new Rng(c.rng);
  k.cabinet.splice(i, 1);
  k.cabinet.splice(i, 0, newMinister(k, portfolio, c.player, rng));
  c.rng = rng.state;
  if (old.party !== c.player) {
    k.government.stability = clamp(k.government.stability - 4, 5, 95);
    shiftRelation(c, c.player, old.party, -8);
  } else shiftUnity(c, c.player, -2);
  pushNews(c, { party: c.player, key: 'news.gov.reshuffle', vars: { name: MINISTER_NAMES[k.cabinet[i].name], post: `@portfolio:${portfolio}` }, tone: 'neutral' });
  return true;
}
