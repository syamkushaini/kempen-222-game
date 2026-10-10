import type { World } from '../election';
import { scaled } from './actions';
import { applyEffects, type Effect } from './events';
import { pushNews } from './news';
import { isPm } from './office';
import { ROLE_IDS, type Campaign, type RoleId, type Staffer } from './types';

// The people the leader has hired speak up. Each, in their own field, sees something that needs mending and says what to do about it;
// the leader may follow the suggestion, which costs a little money and, if the person is good, does a good deal: credibility,
// unity, trust, stability, the branches. Each does it once a quarter. A better person gives better advice, and nobody hired gives none.

/** Weeks between one suggestion followed and the next, for each person. */
export const ADVICE_EVERY = 13;
/** What a suggestion does by the skill of whoever gives it (1 to 5). */
export const GAIN = [1, 2, 2, 3, 4] as const;
export const gainOf = (skill: number): number => GAIN[Math.max(1, Math.min(5, skill)) - 1];

export type AdviceId = 'meeting' | 'tour' | 'paper' | 'honest' | 'profile' | 'clean' | 'steady';
export interface Advice { id: AdviceId; role: RoleId; effects: Effect[]; /** At general-election scale, in the party's money. */ cost: number }

/** The suggestion this person has now, if anything in their field needs mending: the first of their worries that is true. */
export function adviceFor(_world: World, c: Campaign, role: RoleId): Advice | null {
  const k = c.career;
  const pc = c.parties[c.player];
  const who = c.team.staff[ROLE_IDS.indexOf(role)];
  if (!k || !pc || !who) return null;
  const g = gainOf(who.skill);
  const governing = isPm(c) || k.government.partners.includes(c.player);
  const branches = pc.machinery.filter((m) => m > 0);
  const avgBranches = branches.length ? branches.reduce((a, m) => a + m, 0) / branches.length : 100;
  const failed = (i: number) => k.conduct !== undefined && !k.conduct.ok[i];
  const make = (id: AdviceId, effects: Effect[], cost: number): Advice => ({ id, role, effects, cost });
  switch (role) {
    case 'manager':
      if (pc.unity < 72) return make('meeting', [{ t: 'unity', n: g }, { t: 'cred', n: 1 }], 8_000);
      if (avgBranches < 60) return make('tour', [{ t: 'machinery', n: g * 2 }], 10_000);
      return null;
    case 'strategist':
      if (failed(0) || failed(1) || k.credibility < 70) return make('paper', [{ t: 'cred', n: g }], 6_000);
      return null;
    case 'media':
      if (governing && k.government.trust < 70) return make('honest', [{ t: 'trust', n: g }], 8_000);
      if (k.credibility < 70) return make('profile', [{ t: 'cred', n: g }], 8_000);
      return null;
    case 'treasurer':
      if (k.orders.donors > 0) return make('clean', [{ t: 'donors', n: -1 }, { t: 'cred', n: Math.ceil(g / 2) }], 0);
      if (governing && k.government.stability < 70) return make('steady', [{ t: 'stability', n: g }], 6_000);
      return null;
  }
}

export type AdviceRefusal = 'phase' | 'nobody' | 'unpaid' | 'none' | 'wait' | 'funds';

/** Whether the suggestion can be followed now, and if not why not. */
export function canFollow(world: World, c: Campaign, role: RoleId): { ok: true; advice: Advice } | { ok: false; reason: AdviceRefusal } {
  const k = c.career;
  const pc = c.parties[c.player];
  if (!k || !pc || c.phase !== 'term' || c.inbox.length > 0) return { ok: false, reason: 'phase' };
  const who: Staffer | null = c.team.staff[ROLE_IDS.indexOf(role)];
  if (!who) return { ok: false, reason: 'nobody' };
  if (c.team.unpaid) return { ok: false, reason: 'unpaid' };
  const advice = adviceFor(world, c, role);
  if (!advice) return { ok: false, reason: 'none' };
  const last = k.adviceTaken?.[role];
  if (last !== undefined && k.week - last < ADVICE_EVERY) return { ok: false, reason: 'wait' };
  if (pc.funds < scaled(world, advice.cost)) return { ok: false, reason: 'funds' };
  return { ok: true, advice };
}

/** Weeks until this person will give another suggestion, or 0. */
export const weeksToWait = (c: Campaign, role: RoleId): number => {
  const last = c.career?.adviceTaken?.[role];
  return last === undefined ? 0 : Math.max(0, ADVICE_EVERY - (c.career!.week - last));
};

/** The leader follows the suggestion: what it costs is paid, what it does is done, and the person is not asked again for a quarter. */
export function followAdvice(world: World, c: Campaign, role: RoleId): boolean {
  const check = canFollow(world, c, role);
  if (!check.ok) return false;
  const { advice } = check;
  applyEffects(world, c, [...advice.effects, ...(advice.cost > 0 ? [{ t: 'funds', n: -advice.cost } as Effect] : [])]);
  (c.career!.adviceTaken ??= {})[role] = c.career!.week;
  pushNews(c, { party: c.player, key: 'news.advice.followed', vars: { role: `@role:${role}` }, tone: 'good' });
  return true;
}
