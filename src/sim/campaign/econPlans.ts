import type { BlocId } from '../types';
import { MAX_PROJECTS_AT_ONCE, PROJECTS, TAX_MIX, TAX_IDS, builtEffects, projectOf, projectsCost, taxEffects, taxMixOf, type TaxId } from './econPlansData';
import { lift, isPm } from './office';
import { pushNews } from './news';
import type { Campaign, Dial } from './types';

export { PROJECTS, TAX_MIX, TAX_IDS, MAX_PROJECTS_AT_ONCE, builtEffects, projectsCost, taxEffects, taxMixOf };
export type { TaxId };

// Three things a head of government sets and lets run, rather than does once: how much of each month's surplus goes to the debt, the mix of
// taxes (each with its own price in prices, growth and votes), and a few national projects that cost money for a year or more and then pay for
// themselves in lower prices, faster growth or a leaner state.

export const REPAY_MAX = 0.5;

export function setTax(c: Campaign, id: TaxId, value: Dial): boolean {
  const k = c.career;
  if (!k || c.phase !== 'term' || !isPm(c) || !TAX_IDS.includes(id) || ![-1, 0, 1].includes(value)) return false;
  const mix = { ...taxMixOf(k), [id]: value };
  if (TAX_IDS.every((t) => mix[t] === 0)) delete k.taxMix; else k.taxMix = mix;
  return true;
}

export function setRepayShare(c: Campaign, share: number): boolean {
  const k = c.career;
  if (!k || c.phase !== 'term' || !isPm(c) || !(share >= 0 && share <= REPAY_MAX)) return false;
  if (share === 0) delete k.repayShare; else k.repayShare = Math.round(share * 100) / 100;
  return true;
}

export type ProjectRefusal = 'phase' | 'notPm' | 'full' | 'running' | 'built' | 'none';
export function canStartProject(c: Campaign, id: string): { ok: true } | { ok: false; reason: ProjectRefusal } {
  const k = c.career;
  if (!k || !projectOf(id)) return { ok: false, reason: 'none' };
  if (c.phase !== 'term') return { ok: false, reason: 'phase' };
  if (!isPm(c)) return { ok: false, reason: 'notPm' };
  if ((k.projects ?? []).some((p) => p.id === id)) return { ok: false, reason: 'running' };
  if ((k.built ?? []).includes(id)) return { ok: false, reason: 'built' };
  if ((k.projects ?? []).length >= MAX_PROJECTS_AT_ONCE) return { ok: false, reason: 'full' };
  return { ok: true };
}

export function startProject(c: Campaign, id: string): boolean {
  if (!canStartProject(c, id).ok) return false;
  (c.career!.projects ??= []).push({ id, left: projectOf(id)!.weeks });
  pushNews(c, { party: c.player, key: 'news.project.start', vars: { project: `@project:${id}` }, tone: 'neutral' });
  return true;
}

/** Calls a project off. What was spent is gone. */
export function stopProject(c: Campaign, id: string): boolean {
  const k = c.career;
  if (!k?.projects?.some((p) => p.id === id) || !isPm(c)) return false;
  k.projects = k.projects.filter((p) => p.id !== id);
  if (k.projects.length === 0) delete k.projects;
  return true;
}

/** A week: the projects under way come a week nearer, and the taxes are felt by those who pay them. A project finished stays. */
export function plansWeek(c: Campaign): void {
  const k = c.career;
  if (!k || c.phase !== 'term') return;
  const pm = k.government.pm;
  const mix = taxMixOf(k);
  for (const id of TAX_IDS) {
    if (mix[id] === 0) continue;
    lift(k, pm, TAX_MIX[id].blocs as BlocId[], -TAX_MIX[id].feel * mix[id]);
  }
  if (!k.projects) return;
  for (const p of k.projects) p.left -= 1;
  const done = k.projects.filter((p) => p.left <= 0);
  k.projects = k.projects.filter((p) => p.left > 0);
  if (k.projects.length === 0) delete k.projects;
  for (const p of done) {
    (k.built ??= []).push(p.id);
    const def = projectOf(p.id)!;
    if (def.commitments) k.fiscal = Math.max(0, k.fiscal - def.commitments);
    pushNews(c, { party: k.government.pm, key: 'news.project.done', vars: { project: `@project:${p.id}` }, tone: 'good' });
  }
}
