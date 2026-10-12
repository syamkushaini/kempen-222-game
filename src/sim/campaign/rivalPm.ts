import { Rng } from '../rng';
import { PROJECTS, projectOf, projectsCost, taxMixOf, type TaxId } from './econPlansData';
import { MAX_PROJECTS_AT_ONCE, REPAY_MAX } from './econPlans';
import { toolOf, type Tool } from './econTools';
import { applyRivalEffects } from './rivalPmEffects';
import { newMinister } from './office';
import { pushNews, ref } from './news';
import type { Campaign, Dial } from './types';

// When the player is not the head of government, the head of government is not idle. Once a month they weigh the state of the country as a
// sensible head of government would and make the same choices the player is given: the policy rate, the mix of taxes, how much of the
// surplus goes to the debt, the national projects and the acts on the economy (the budget they table is in office.ts, once a year). They
// have their own draw of chance, so the game's main stream is untouched, and they pay in the debt rather than from a treasury that is not theirs.

/** Every how many weeks the head of government takes stock. */
export const REVIEW_EVERY = 4;
/** What the projects a month costs, in points of national income: the debt they run up while they are built. */
const PROJECT_DEBT = 0.1;
/** Weeks between reshuffles. */
const RESHUFFLE_EVERY = 26;

type Need = 'debt' | 'prices' | 'growth' | 'books' | null;

/** What the country needs most, by how far each figure has strayed. */
export function needOf(c: Campaign): Need {
  const e = c.career!.economy;
  const worry: [Exclude<Need, null>, number][] = [
    ['debt', (e.debt - 80) / 10],
    ['prices', (e.inflation - 4.5) / 1.5],
    ['growth', (2 - e.growth) / 1],
    ['books', (c.career!.fiscal - 8) / 4],
  ];
  const top = worry.reduce((a, b) => (b[1] > a[1] ? b : a));
  return top[1] > 0 ? top[0] : null;
}

/** The rate a head of government would set: against high prices raise it, against a slump cut it. */
export function rateFor(c: Campaign): Dial {
  const e = c.career!.economy;
  if (e.inflation > 4.5) return 1;
  if (e.growth < 2 || e.inflation < 1.5) return -1;
  return 0;
}

/** The taxes a head of government would set: more where the debt is heavy, less where the economy needs air. */
export function taxFor(c: Campaign): Record<TaxId, Dial> {
  const e = c.career!.economy;
  const mix: Record<TaxId, Dial> = { sales: 0, income: 0, corporate: 0, luxury: 0 };
  if (e.debt >= 80) {
    mix.income = 1;
    mix.luxury = 1;
    if (e.inflation < 3.5) mix.sales = 1;
  } else if (e.debt < 60 && e.growth < 3) mix.corporate = -1;
  return mix;
}

/** How much of the surplus goes to the debt. */
export function repayFor(c: Campaign): number {
  const d = c.career!.economy.debt;
  return d >= 90 ? REPAY_MAX : d >= 70 ? 0.3 : 0;
}

const TOOLS_FOR: Record<Exclude<Need, null>, string[]> = {
  debt: ['rationalise', 'sellAssets', 'restructure'],
  prices: ['priceControls', 'importCuts', 'foodAid'],
  growth: ['investors', 'skills', 'infrastructure'],
  books: ['freeze'],
};
const PROJECTS_FOR: Record<Exclude<Need, null>, string[]> = {
  debt: ['taxCollection', 'digitalGov'],
  prices: ['foodSecurity', 'energyGrid', 'localProduction'],
  growth: ['localProduction', 'railPorts', 'energyGrid'],
  books: ['digitalGov', 'taxCollection'],
};

/** The act on the economy a head of government would use now, if there is one that is off cooldown. */
export function toolFor(c: Campaign, need: Need): Tool | undefined {
  if (!need) return undefined;
  const k = c.career!;
  const ids = need === 'debt' && k.economy.debt < 100 ? TOOLS_FOR.debt.filter((id) => id !== 'restructure') : TOOLS_FOR[need];
  return ids.map(toolOf).find((t): t is Tool => !!t && (k.toolsUsed?.[t.id] === undefined || k.week - k.toolsUsed[t.id] >= t.wait));
}

/** A national project worth starting: not yet built or running, and affordable by the debt. */
export function projectFor(c: Campaign, need: Need): string | undefined {
  const k = c.career!;
  if ((k.projects ?? []).length >= MAX_PROJECTS_AT_ONCE || k.economy.debt >= 80) return undefined;
  const open = (id: string) => !(k.projects ?? []).some((p) => p.id === id) && !(k.built ?? []).includes(id);
  const wanted = need ? PROJECTS_FOR[need] : PROJECTS.map((p) => p.id);
  return wanted.find(open);
}

/** One month of the head of government's choices, when the player does not hold the post. */
export function rivalPmMonth(c: Campaign): void {
  const k = c.career!;
  const pm = k.government.pm;
  const rng = new Rng((c.rng ^ 0x71a1) + k.week * 131);
  const need = needOf(c);

  const rate = rateFor(c);
  if ((k.rate ?? 0) !== rate) {
    if (rate === 0) delete k.rate; else k.rate = rate;
    pushNews(c, { party: pm, key: rate > 0 ? 'news.rate.up' : rate < 0 ? 'news.rate.down' : 'news.rate.hold', vars: { party: ref.party(pm) }, tone: 'neutral' });
  }

  const mix = taxFor(c);
  const now = taxMixOf(k);
  if ((Object.keys(mix) as TaxId[]).some((id) => mix[id] !== now[id])) {
    if ((Object.values(mix) as Dial[]).every((v) => v === 0)) delete k.taxMix; else k.taxMix = mix;
  }

  const repay = repayFor(c);
  if ((k.repayShare ?? 0) !== repay) { if (repay === 0) delete k.repayShare; else k.repayShare = repay; }
  // What is set aside brings the debt down by a little each month.
  if (repay > 0) k.economy.debt = Math.max(30, k.economy.debt - 0.12 * (repay / REPAY_MAX));

  // What the projects cost while they are built is borrowed.
  const bill = projectsCost(k) * PROJECT_DEBT;
  if (bill > 0) k.economy.debt = Math.min(120, k.economy.debt + bill);

  const project = projectFor(c, need);
  if (project && rng.next() < 0.5) {
    (k.projects ??= []).push({ id: project, left: projectOf(project)!.weeks });
    pushNews(c, { party: pm, key: 'news.project.start', vars: { project: `@project:${project}` }, tone: 'neutral' });
  }

  const tool = toolFor(c, need);
  if (tool && rng.next() < 0.6) {
    applyRivalEffects(c, tool.effects);
    (k.toolsUsed ??= {})[tool.id] = k.week;
    pushNews(c, { party: pm, key: 'news.tool.used', vars: { tool: `@tool:${tool.id}` }, tone: 'neutral' });
  }

  reshuffle(c, rng);
}

/** The head of government replaces the weakest minister of their own party now and again. */
function reshuffle(c: Campaign, rng: Rng): void {
  const k = c.career!;
  if (k.week % RESHUFFLE_EVERY >= REVIEW_EVERY) return;
  const own = k.cabinet.map((m, i) => ({ m, i })).filter(({ m }) => m.party === k.government.pm && m.skill <= 2);
  if (own.length === 0) return;
  const { m, i } = own.reduce((a, b) => (b.m.skill < a.m.skill ? b : a));
  const next = newMinister(k, m.portfolio, k.government.pm, rng);
  next.skill = Math.max(3, next.skill);
  k.cabinet.splice(i, 1, next);
  pushNews(c, { party: k.government.pm, key: 'news.gov.reshuffled', vars: { party: ref.party(k.government.pm), post: `@portfolio:${m.portfolio}` }, tone: 'neutral' });
}

/** Called each week of the term when the player does not lead the government. */
export function rivalPmWeek(c: Campaign): void {
  const k = c.career;
  if (!k || c.phase !== 'term') return;
  if (k.week % REVIEW_EVERY === 0) rivalPmMonth(c);
}
