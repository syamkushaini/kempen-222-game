import type { World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { BLOC_IDS, N_BLOCS, PARTY_IDS, type BlocId, type PartyId } from '../types';
import { scaled } from './actions';
import { builtEffects, taxEffects } from './econPlansData';
import { addScene, shiftRelation, shiftUnity } from './diplomacy';
import { stanceGrowth } from './stances';
import { defenceDial, defenceShown, resentCut } from './defence';
import { ABOLISH, ABOLISH_PRICES, aidAbolished, lineDial, type LineDial } from './lineDial';
import { pushNews, ref } from './news';
import { GENERAL_RULES, STATE_RULES } from './rules';
import {
  LINE_IDS, MINISTER_TRAITS, PORTFOLIO_IDS,
  type Budget, type Campaign, type Candidate, type Career, type Economy, type LineId, type MeasureId, type Minister, type MinisterTrait, type PortfolioId,
} from './types';

/** Whether the player is head of government. A leader held to a term limit leads the governing party but not the government. */
export const isPm = (c: Campaign) => c.career!.government.pm === c.player && !c.career!.limited;
export const inGov = (c: Campaign, p: number) => c.career!.government.pm === p || c.career!.government.partners.includes(p);

/** Adds to a party's standing with the blocs named, or with everyone. */
export function lift(k: Career, p: number, blocs: BlocId[] | 'all', n: number) {
  const rows = blocs === 'all' ? Array.from({ length: N_BLOCS }, (_, b) => b) : blocs.map((b) => BLOC_IDS.indexOf(b));
  for (const b of rows) k.mood[b][p] += n;
}

// ---------- the economy ----------

export const startEconomy = (): Economy => ({ growth: 4.2, inflation: 2.8, jobless: 3.6, debt: 63 });
export const standstill = (): Budget => ({ lines: { aid: 0, health: 0, education: 0, rural: 0, civil: 0 }, tax: 0 });

/** What a budget can pay for in particular: the line it belongs to, what it adds to the cost (in the same units as a dial), and who notices. */
export interface MeasureDef { line: LineId; cost: number; appeal: Partial<Record<BlocId, number>> }
export const MEASURES: Record<MeasureId, MeasureDef> = {
  cashTopUp:    { line: 'aid', cost: 1, appeal: { urban_b40: 0.03, heartland: 0.02, gig: 0.02, felda: 0.02, smallbiz: -0.01 } },
  fuelPrice:    { line: 'aid', cost: 0.8, appeal: { gig: 0.03, urban_b40: 0.03, heartland: 0.02, undi18: 0.01, urban_lib: -0.01 } },
  clinics:      { line: 'health', cost: 0.8, appeal: { seniors: 0.03, borneo_native: 0.03, agri: 0.02 } },
  hospitalBeds: { line: 'health', cost: 1, appeal: { seniors: 0.03, urban_b40: 0.03, m40: 0.02 } },
  scholarships: { line: 'education', cost: 0.7, appeal: { undi18: 0.04, m40: 0.02 } },
  schoolRepairs: { line: 'education', cost: 0.7, appeal: { borneo_native: 0.03, felda: 0.02, agri: 0.02, civil: 0.01 } },
  roads:        { line: 'rural', cost: 1, appeal: { agri: 0.03, felda: 0.03, borneo_native: 0.04, heartland: 0.02 } },
  farmInputs:   { line: 'rural', cost: 0.8, appeal: { agri: 0.04, felda: 0.03 } },
  civilBonus:   { line: 'civil', cost: 0.9, appeal: { civil: 0.05, seniors: 0.01 } },
  pensions:     { line: 'civil', cost: 0.8, appeal: { seniors: 0.04, civil: 0.03 } },
};
/** Most things one budget can pay for in particular. */
export const MAX_MEASURES = 3;

/** Who notices each line of the budget. */
const LINE_BLOCS: Record<LineId, BlocId[]> = {
  aid: ['urban_b40', 'heartland', 'gig', 'felda'],
  health: ['seniors', 'urban_b40', 'borneo_native'],
  education: ['undi18', 'm40'],
  rural: ['agri', 'felda', 'borneo_native', 'borneo_urban'],
  civil: ['civil', 'seniors'],
  defence: ['heartland', 'felda', 'borneo_native', 'smallbiz'],
};

/** The posts of a state's executive council: the first eight, and the environment and tourism. A federal cabinet has every one. */
export const STATE_PORTFOLIOS: readonly PortfolioId[] = ['finance', 'home', 'economy', 'education', 'health', 'rural', 'works', 'defence', 'environment', 'tourism'];
/** The portfolios of the cabinet or council of a game, by its scenario. */
export const portfoliosOf = (scenario: string): readonly PortfolioId[] => (scenario.startsWith('career:') || scenario.startsWith('state:') ? STATE_PORTFOLIOS : PORTFOLIO_IDS);
/** What a cabinet of eight, the size the stand-ins' drag and the risk of each kind of minister were set for, is of the one in office. */
const cabinetScale = (c: Campaign): number => 8 / portfoliosOf(c.scenario).length;

/** What a minister is called: the name the player gave them, or the invented one. */
export const ministerName = (m: { name: number; label?: string }): string => m.label ?? MINISTER_NAMES[m.name];
/** A name the player may give: letters, digits and a few marks, single spaces, at most 24 long. */
export const cleanLabel = (raw: string): string => raw.normalize('NFC').replace(/[^\p{L}\p{N} .'_-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 24).trim();

/** The player gives a minister (or a shadow minister) a name of their own; an empty one gives the invented name back. */
export function renameMinister(c: Campaign, portfolio: PortfolioId, raw: string, shadow = false): boolean {
  const k = c.career;
  const who = shadow ? k?.shadow?.[portfolio] : k?.cabinet.find((m) => m.portfolio === portfolio);
  if (!k || !who) return false;
  const label = cleanLabel(raw);
  if (label) who.label = label; else delete who.label;
  return true;
}

export const skillOf = (k: Career, portfolio: PortfolioId) => k.cabinet.find((m) => m.portfolio === portfolio)?.skill ?? 3;

/** How far a budget loosens (positive) or tightens the purse: spending lines up, taxes down, plus standing commitments. */
export function looseness(k: Career, budget: Budget = k.tabled): number {
  return LINE_IDS.reduce((a, id) => a + lineDial(budget.lines[id] ?? 0), 0) - 2 * budget.tax + 0.5 * k.fiscal + (budget.measures ?? []).reduce((a, m) => a + MEASURES[m].cost, 0);
}

/** The deficit a budget produces, as a share of national income. A capable finance minister shaves it. */
export function deficit(k: Career, budget: Budget = k.tabled): number {
  return clamp(3.5 + 0.5 * looseness(k, budget) - 0.2 * (skillOf(k, 'finance') - 3), 0, 9);
}

/** How the economy feels to voters, from very bad (-3) to very good (3). */
export function economicMood(e: Economy): number {
  return clamp((e.growth - 4) * 0.5 - (e.inflation - 2.5) * 0.6 - (e.jobless - 3.5) * 0.5, -3, 3);
}

/** The policy rate: raising it brings prices down and slows growth and costs more on the debt; cutting it does the reverse. */
/** The lowest the national debt can fall to: nothing. Paying it all off is possible; no law stops a government doing it. */
export const DEBT_FLOOR = 0;

export const RATE = { growth: -0.3, prices: -0.6, interest: 0.3 } as const;

/** The share of the gap between where growth and prices are and where the budget and the rate point them that is closed each week. */
export const ECONOMY_PULL = 0.04;

/** Where the economy is heading: the growth and the prices that the budget, the rate, the taxes and what has been built point to. It gets there slowly. */
export function economyTargets(k: Career): { growth: number; prices: number } {
  const e = k.economy;
  const loose = looseness(k);
  // Loose budgets buy growth and prices; heavy debt drags; cutting aid shows up at the till.
  const rate = k.rate ?? 0;
  const tax = taxEffects(k), built = builtEffects(k);
  return {
    growth: 4 + 0.15 * loose - Math.max(0, e.debt - 70) * 0.08 + RATE.growth * rate + tax.growth + built.growth + stanceGrowth(k),
    prices: 2.5 + 0.3 * loose - 0.3 * lineDial(k.tabled.lines.aid) + (aidAbolished(k.tabled) ? ABOLISH_PRICES : 0) + RATE.prices * rate + tax.prices + built.prices,
  };
}

export function economyWeek(c: Campaign, rng: Rng) {
  const k = c.career!;
  const e = k.economy;
  const { growth: growthTo, prices: pricesTo } = economyTargets(k);
  e.growth = clamp(e.growth + (growthTo - e.growth) * ECONOMY_PULL + rng.normal(0, 0.05), -6, 9);
  e.inflation = clamp(e.inflation + (pricesTo - e.inflation) * ECONOMY_PULL + rng.normal(0, 0.04), -1, 12);
  e.jobless = clamp(e.jobless + (3.5 - (e.growth - 4) * 0.35 - e.jobless) * 0.03 + rng.normal(0, 0.015), 2, 12);
  // A deficit above what growth can carry piles up as debt: the bill for this year's generosity arrives later.
  e.debt = clamp(e.debt + ((deficit(k) - 3.5) * 1.5) / 52 - (e.growth - 4) * 0.01, DEBT_FLOOR, 120);
  // Those in office answer for it.
  const g = k.government;
  const feel = 0.0009 * economicMood(e);
  lift(k, g.pm, 'all', feel);
  for (const p of g.partners) lift(k, p, 'all', feel / 2);
}

/** The head of government changes next year's budget plan. It takes effect when it is tabled. */
export function setBudget(c: Campaign, patch: { line?: LineId; tax?: boolean; value: LineDial } | { measure: MeasureId; on: boolean }): boolean {
  const k = c.career;
  if (k && c.phase === 'term' && isPm(c) && 'measure' in patch) {
    if (!(patch.measure in MEASURES)) return false;
    const have = k.budget.measures ?? [];
    if (patch.on && !have.includes(patch.measure)) {
      if (have.length >= MAX_MEASURES) return false;
      k.budget.measures = [...have, patch.measure];
    } else if (!patch.on) {
      if (have.length > 0) k.budget.measures = have.filter((m) => m !== patch.measure);
      if (k.budget.measures?.length === 0) delete k.budget.measures;
    }
    return true;
  }
  if (!k || c.phase !== 'term' || !isPm(c) || !('value' in patch)) return false;
  const v = patch.value;
  // Only the subsidies can be abolished outright; every other setting is a cut, a hold or a boost.
  if (v === ABOLISH) {
    if (patch.tax || patch.line !== 'aid') return false;
    k.budget.lines.aid = ABOLISH;
    return true;
  }
  if (v !== -1 && v !== 0 && v !== 1) return false;
  if (patch.tax) k.budget.tax = v;
  // The defence line is the federal head of government's alone.
  else if (patch.line === 'defence') { if (!defenceShown(c)) return false; k.budget.lines.defence = v; }
  else if (patch.line && LINE_IDS.includes(patch.line)) k.budget.lines[patch.line] = v;
  else return false;
  return true;
}

/** Puts a budget into force: its lines land with the blocs that notice them, and its size sets the economy's course. */
export function tableBudget(c: Campaign, plan: Budget): void {
  const k = c.career!;
  const g = k.government;
  k.tabled = { lines: { ...plan.lines, ...(defenceDial(plan) !== 0 ? { defence: defenceDial(plan) } : {}) }, tax: plan.tax, ...(plan.measures?.length ? { measures: [...plan.measures] } : {}) };
  // What it pays for in particular is noticed by those it is for.
  for (const m of plan.measures ?? []) {
    for (const [bloc, v] of Object.entries(MEASURES[m].appeal)) { lift(k, g.pm, [bloc as BlocId], v); for (const p of g.partners) lift(k, p, [bloc as BlocId], v * 0.4); }
  }
  for (const id of LINE_IDS) {
    const dial = lineDial(plan.lines[id] ?? 0);
    if (dial === 0) continue;
    lift(k, g.pm, LINE_BLOCS[id], 0.02 * dial);
    for (const p of g.partners) lift(k, p, LINE_BLOCS[id], 0.008 * dial);
  }
  resentCut(c, plan);
  // Taking subsidies away altogether is felt on the shelves, in the streets and in the coalition.
  if (aidAbolished(plan)) {
    g.stability = clamp(g.stability - 3, 5, 95);
    pushNews(c, { party: g.pm, key: 'news.gov.subsidy.abolished', vars: { party: ref.party(g.pm) }, tone: 'bad' });
  }
  if (plan.tax !== 0) lift(k, g.pm, ['smallbiz', 'm40'], plan.tax > 0 ? -0.02 : 0.015);
  // Partners with rural and Borneo seats, and the party of the civil service, watch their own lines.
  for (const p of g.partners) {
    const id = PARTY_IDS[p];
    const cares = id === 'bp' ? 'civil' : 'rural';
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

/** Invented names for ministers. Proper nouns; the same in every language. Each has a face of its own in the portraits. */
export const MINISTER_NAMES = [
  'Azlan Mokhtar', 'Noraini Hashim', 'Zulkifli Daud', 'Suraya Latiff', 'Kamarul Bahrin', 'Rosnah Yahya',
  'Lee Chee Keong', 'Wong Siew Lan', 'Tan Boon Hock', 'Chong Mei Yin',
  'Ravi Chandran', 'Shanti Devan', 'Gopal Krishnan', 'Anita Selvam',
  'Jimmy Laing', 'Patricia Unggang', 'Douglas Nyipa', 'Felicia Jainal', 'Maxwell Gimbang', 'Rosalind Sipin',
  // Added for a cabinet of twenty-five and a council of ten: more of every community, so that nobody in the cabinet shares a name.
  'Hafizuddin Saad', 'Norlaila Rahim', 'Syed Imran', 'Faridah Othman',
  'Mazlan Ismail', 'Salmah Kassim', 'Hishamuddin Roslan', 'Nurul Huda',
  'Ariffin Zakaria', 'Sharifah Aini', 'Goh Kian Seng', 'Lim Pei Shan',
  'Ong Teck Wee', 'Yap Li Ting', 'Ng Wai Kit', 'Chew Ai Ling',
  'Mohan Raj', 'Kavitha Nair', 'Suresh Pillai', 'Lakshmi Perumal',
  'Vikram Singh', 'Devi Arumugam', 'Anthony Lajim', 'Margaret Ejau',
  'Clarence Bugat', 'Dorothy Sulu', 'Stephen Tuyan', 'Marina Lumat',
];

/** Names borne by those around the leader who are not ministers: the three advisers and the head of the civil service. Nobody else is given one of them. */
export function aides(k: Career): Set<number> {
  const out = new Set<number>(Object.values(k.advisers ?? {}).map((a) => a.name));
  if (k.ksu) out.add(k.ksu.name);
  return out;
}

/** A name from the list that nobody in `used` has, starting from one drawn at random; the one drawn, if every name is taken. */
export function freeName(rng: Rng, used: ReadonlySet<number>): number {
  const start = rng.int(MINISTER_NAMES.length);
  for (let i = 0; i < MINISTER_NAMES.length; i++) { const n = (start + i) % MINISTER_NAMES.length; if (!used.has(n)) return n; }
  return start;
}

export function newMinister(k: Career, portfolio: PortfolioId, party: number, rng: Rng): Minister {
  const taken = new Set([...k.cabinet.map((m) => m.name), ...aides(k)]);
  // People on offer for a post the player has yet to fill are spoken for too, where there are names enough to go round.
  const offered = new Set((k.appointments ?? []).flatMap((a) => a.options.map((o) => o.name)));
  const start = rng.int(MINISTER_NAMES.length);
  const free = (avoid: (n: number) => boolean) => { for (let i = 0; i < MINISTER_NAMES.length; i++) { const n = (start + i) % MINISTER_NAMES.length; if (!avoid(n)) return n; } return -1; };
  let name = free((n) => taken.has(n) || offered.has(n));
  if (name < 0) name = free((n) => taken.has(n));
  if (name < 0) name = start;
  return { portfolio, party, name, skill: 1 + Math.min(4, Math.floor(rng.next() * 5)) };
}

/** The share of the cabinet's portfolios a partner holds: its posts out of the whole cabinet, a federal one of 28 or a state's of 10. */
const cabinetSize = (c: Campaign) => (c.scenario.startsWith('career:') ? STATE_RULES : GENERAL_RULES).formation!.cabinet;

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
  const all = portfoliosOf(c.scenario);
  const free = all.filter((id) => !holder.has(id) && id !== 'finance' && id !== 'home').reverse();
  for (const p of [...g.partners].sort((a, b) => (g.deals[b]?.posts ?? 0) - (g.deals[a]?.posts ?? 0))) {
    let share = Math.floor(((g.deals[p]?.posts ?? 0) * all.length) / cabinetSize(c)) - (holder.has('finance') && holder.get('finance') === p ? 1 : 0) - (holder.get('home') === p ? 1 : 0);
    while (share-- > 0 && free.length > 0) holder.set(free.pop()!, p);
  }
  k.cabinet = [];
  for (const id of all) k.cabinet.push(newMinister(k, id, holder.get(id) ?? g.pm, rng));
  k.appointments = [];
  for (const m of k.cabinet) if (m.party === c.player && inGov(c, c.player)) stepIn(c, m);
}

// ---------- appointing ministers ----------

/** What each kind brings on the day, and what it costs. Money is at general-election scale. */
export const TRAIT_EFFECT = {
  expert: { credibility: 3, unity: -3 },
  loyalist: { unity: 3 },
  rising: { mood: 0.004 },
  fixer: { funds: 25_000 },
} as const;
/** Each week, the chance that the risk of the kind comes to pass. */
export const TRAIT_RISK: Partial<Record<MinisterTrait, number>> = { rising: 0.004, fixer: 0.005 };
/** What an unfilled post costs the government's steadiness each week, for every post. */
export const ACTING_DRAG = 0.08;

/** The skill a candidate of each kind has: how well they will do the job. */
function skillFor(trait: MinisterTrait, rng: Rng): number {
  if (trait === 'expert') return 4 + rng.int(2);
  if (trait === 'loyalist') return 2 + rng.int(2);
  if (trait === 'rising') return 3 + rng.int(2);
  return 3;
}

/**
 * Three people the player could put in a post, each a different kind. Their draw does not touch the game's own stream of
 * chance, so a cabinet formed in a game that had none of this comes out the same.
 */
export function candidatesFor(c: Campaign, portfolio: PortfolioId): Candidate[] {
  const k = c.career!;
  const rng = new Rng((c.rng ^ 0x4d1e11) + k.week * 31 + PORTFOLIO_IDS.indexOf(portfolio) * 7919 + k.cabinet.length);
  // Only one person can be chosen for each post, so different posts may offer the same name; the one chosen is taken off the others (see appoint).
  const used = new Set<number>([...k.cabinet.filter((m) => m.portfolio !== portfolio).map((m) => m.name), ...aides(k)]);
  const kinds = [...MINISTER_TRAITS];
  for (let i = kinds.length - 1; i > 0; i--) { const j = rng.int(i + 1); [kinds[i], kinds[j]] = [kinds[j], kinds[i]]; }
  const options = kinds.slice(0, 3).map((trait) => {
    let name = rng.int(MINISTER_NAMES.length);
    for (let i = 0; i < MINISTER_NAMES.length && used.has(name); i++) name = (name + 1) % MINISTER_NAMES.length;
    used.add(name);
    return { name, skill: skillFor(trait, rng), trait };
  });
  // Whoever shadowed the post from the opposition benches is first on the list.
  const shadow = k.shadow?.[portfolio];
  if (shadow && !k.cabinet.some((m) => m.portfolio !== portfolio && m.name === shadow.name)) options[0] = { name: shadow.name, skill: shadow.skill, trait: shadow.skill >= 4 ? 'expert' : 'loyalist' };
  return options;
}

/** Gives a candidate whose name has just been taken (by a minister, or an option elsewhere that was chosen) another one. */
function renameTaken(k: Career, rng: Rng): void {
  for (const a of k.appointments ?? []) {
    const used = new Set<number>([...k.cabinet.filter((m) => m.portfolio !== a.portfolio).map((m) => m.name), ...aides(k)]);
    for (const o of a.options) {
      if (used.has(o.name)) {
        let name = rng.int(MINISTER_NAMES.length);
        for (let i = 0; i < MINISTER_NAMES.length && (used.has(name) || a.options.some((x) => x.name === name)); i++) name = (name + 1) % MINISTER_NAMES.length;
        o.name = name;
      }
      used.add(o.name);
    }
  }
}

/** A weak stand-in holds a post of the player's party until the player has chosen. */
function stepIn(c: Campaign, m: Minister): void {
  const k = c.career!;
  m.skill = 2;
  m.acting = true;
  delete m.trait;
  delete m.done;
  k.appointments = (k.appointments ?? []).filter((a) => a.portfolio !== m.portfolio);
  k.appointments.push({ portfolio: m.portfolio, options: candidatesFor(c, m.portfolio) });
}

/** A minister of the player's party leaves their post: a stand-in holds it, and the one who went is not on offer again. */
export function dismiss(c: Campaign, portfolio: PortfolioId): void {
  const k = c.career!;
  const m = k.cabinet.find((x) => x.portfolio === portfolio);
  if (!m || m.party !== c.player) return;
  const gone = m.name;
  stepIn(c, m);
  k.appointments = (k.appointments ?? []).map((a) => (a.portfolio === portfolio ? { ...a, options: a.options.filter((o) => o.name !== gone) } : a));
}

/** Whether the post is one the player has yet to fill. */
export const waitingForChoice = (k: Career, portfolio: PortfolioId) => !!k.appointments?.some((a) => a.portfolio === portfolio);

/** The player puts one of the people on offer in a post. What they bring comes at once; what they cost may come later. */
export function appoint(world: World, c: Campaign, portfolio: PortfolioId, index: number): boolean {
  const k = c.career;
  if (!k || c.phase !== 'term') return false;
  const slot = k.appointments?.find((a) => a.portfolio === portfolio);
  const pick = slot?.options[index];
  const i = k.cabinet.findIndex((m) => m.portfolio === portfolio);
  if (!slot || !pick || i < 0 || k.cabinet[i].party !== c.player) return false;
  k.cabinet[i] = { portfolio, party: c.player, name: pick.name, skill: pick.skill, trait: pick.trait };
  k.appointments = k.appointments!.filter((a) => a !== slot);
  const rng = new Rng((c.rng ^ 0x7a4e) + k.week);
  // A stand-in elsewhere who happens to share the name gives way: the cabinet has one of each person.
  for (const m of k.cabinet) {
    if (m.portfolio === portfolio || m.name !== pick.name) continue;
    const used = new Set(k.cabinet.map((x) => x.name));
    let name = rng.int(MINISTER_NAMES.length);
    for (let n = 0; n < MINISTER_NAMES.length && used.has(name); n++) name = (name + 1) % MINISTER_NAMES.length;
    m.name = name;
  }
  renameTaken(k, rng);
  const me = c.player;
  if (pick.trait === 'expert') { k.credibility = clamp(k.credibility + TRAIT_EFFECT.expert.credibility, 0, 100); shiftUnity(c, me, TRAIT_EFFECT.expert.unity); }
  else if (pick.trait === 'loyalist') shiftUnity(c, me, TRAIT_EFFECT.loyalist.unity);
  else if (pick.trait === 'rising') lift(k, me, 'all', TRAIT_EFFECT.rising.mood);
  else c.parties[me]!.funds += scaled(world, TRAIT_EFFECT.fixer.funds);
  pushNews(c, { party: me, key: 'news.gov.appointed', vars: { name: MINISTER_NAMES[pick.name], post: `@portfolio:${portfolio}` }, tone: 'neutral' });
  return true;
}

/** A game saved when the cabinet had eight posts has the rest filled, by the head of the government's party, the first week it is played. */
export function fillCabinet(c: Campaign, rng: Rng): void {
  const k = c.career!;
  const want = portfoliosOf(c.scenario);
  if (want.every((id) => k.cabinet.some((m) => m.portfolio === id))) return;
  for (const id of want) {
    if (k.cabinet.some((m) => m.portfolio === id)) continue;
    const m = newMinister(k, id, k.government.pm, rng);
    k.cabinet.push(m);
    if (m.party === c.player && inGov(c, c.player)) stepIn(c, m);
  }
}

/**
 * A week of the player's own ministers: a stand-in drags on the government, and the risk that comes with a kind of
 * person may come to pass. `rng` is the game's stream; it is only drawn from when there is a risk to roll.
 */
export function cabinetWeek(c: Campaign, rng: Rng): void {
  const k = c.career!;
  const me = c.player;
  const standIns = k.cabinet.filter((m) => m.acting).length;
  if (standIns > 0) k.government.stability = clamp(k.government.stability - ACTING_DRAG * cabinetScale(c) * standIns, 5, 95);
  for (const m of k.cabinet) {
    if (m.party !== me || !m.trait || m.done) continue;
    const risk = (TRAIT_RISK[m.trait] ?? 0) * cabinetScale(c);
    if (!risk || rng.next() >= risk) continue;
    m.done = true;
    if (m.trait === 'rising') {
      shiftUnity(c, me, -6);
      pushNews(c, { party: me, key: 'news.gov.ambition', vars: { name: ministerName(m), post: `@portfolio:${m.portfolio}` }, tone: 'bad' });
    } else {
      // A fixer's past catches up with them: it is the player's to answer, at a press conference, before anything is settled.
      pushNews(c, { party: me, key: 'news.gov.scandal', vars: { name: ministerName(m), post: `@portfolio:${m.portfolio}` }, tone: 'bad' });
      if (!k.scandal && c.inbox.length === 0) {
        k.scandal = m.portfolio;
        addScene(c, { kind: 'event', from: null, event: 'ministerScandal' });
      } else {
        // Something else is already on the desk: it is dealt with as it always was, the hard way.
        k.credibility = clamp(k.credibility - 8, 0, 100);
        k.government.trust = clamp(k.government.trust - 5, 0, 100);
        dismiss(c, m.portfolio);
      }
    }
  }
}

/** A party leaves the government: its ministers go with it, and the head of government's party fills the gaps. */
export function vacate(c: Campaign, party: number): void {
  const k = c.career!;
  const rng = new Rng(c.rng);
  k.cabinet.forEach((m, i) => {
    if (m.party !== party) return;
    k.cabinet.splice(i, 1);
    const next = newMinister(k, m.portfolio, k.government.pm, rng);
    k.cabinet.splice(i, 0, next);
    if (next.party === c.player && inGov(c, c.player)) stepIn(c, next);
  });
  // A party that has left government leaves its unfilled posts behind with it.
  if (party === c.player) k.appointments = [];
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
  const next = newMinister(k, portfolio, c.player, rng);
  k.cabinet.splice(i, 0, next);
  c.rng = rng.state;
  // The post is the player's own now, and theirs to fill: until then a stand-in holds it.
  stepIn(c, next);
  k.appointments = k.appointments!.map((a) => (a.portfolio === portfolio ? { ...a, options: a.options.filter((o) => o.name !== old.name) } : a));
  if (old.party !== c.player) {
    k.government.stability = clamp(k.government.stability - 4, 5, 95);
    shiftRelation(c, c.player, old.party, -8);
  } else shiftUnity(c, c.player, -2);
  pushNews(c, { party: c.player, key: 'news.gov.dismissed', vars: { name: MINISTER_NAMES[old.name], post: `@portfolio:${portfolio}` }, tone: 'neutral' });
  return true;
}
