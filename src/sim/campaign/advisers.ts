import { clamp } from '../math';
import { Rng } from '../rng';
import { addScene, shiftUnity } from './diplomacy';
import { pushNews } from './news';
import { MINISTER_NAMES, deficit } from './office';
import { partnerMood } from './plots';
import type { Campaign } from './types';

// The leader has three advisers who have been there from the start and remember. One watches the purse, one the party and its
// allies, one the leader’s own name. Every quarter each says what worries them, if anything does; if it is the same worry as last
// time they say so, and how many times; and if it goes on, they ask for a word. They also remember when they were listened to.

export const ADVISER_IDS = ['treasurer', 'strategist', 'conscience'] as const;
export type AdviserId = (typeof ADVISER_IDS)[number];
export type Concern = 'debt' | 'purse' | 'unity' | 'partners' | 'promises' | 'name';

/** What each adviser may worry about. */
export const CONCERNS: Record<AdviserId, readonly Concern[]> = { treasurer: ['debt', 'purse'], strategist: ['unity', 'partners'], conscience: ['promises', 'name'] };

export const ADVISE = { every: 13, ultimatum: 3, patience: 2, debt: 75, deficit: 5.5, purse: 60_000, unity: 45, name: 40, broken: 2, listened: 2, ignored: -3, stability: -2 };

export interface AdviserState { name: number; concern: Concern | null; count: number }
export const advisersOf = (c: Campaign): Record<AdviserId, AdviserState> => {
  const k = c.career! as { advisers?: Record<AdviserId, AdviserState> };
  if (!k.advisers) {
    const rng = new Rng(((c.seed ^ 0xad41) + 7) >>> 0);
    const names = [...MINISTER_NAMES.keys()];
    k.advisers = Object.fromEntries(ADVISER_IDS.map((id) => [id, { name: names.splice(rng.int(names.length), 1)[0], concern: null, count: 0 }])) as Record<AdviserId, AdviserState>;
  }
  return k.advisers;
};

/** What worries an adviser now, if anything: the first of their worries that is true. */
export function concernOf(c: Campaign, id: AdviserId): Concern | null {
  const k = c.career!;
  const pc = c.parties[c.player]!;
  switch (id) {
    case 'treasurer':
      if (k.economy.debt > ADVISE.debt || deficit(k) > ADVISE.deficit) return 'debt';
      return pc.funds < ADVISE.purse && k.week > 26 ? 'purse' : null;
    case 'strategist':
      if (pc.unity < ADVISE.unity) return 'unity';
      return k.government.partners.some((p) => partnerMood(c, p) !== 'content') ? 'partners' : null;
    case 'conscience':
      if (k.record.broken >= ADVISE.broken && k.record.broken > k.record.kept.length) return 'promises';
      return k.credibility < ADVISE.name ? 'name' : null;
  }
}

/** A quarter of the advisers’ memory: each says what worries them, again if it is the same worry, and is glad to be able to say when it is over. */
export function advisersWeek(c: Campaign): void {
  const k = c.career!;
  if (k.week % ADVISE.every !== 0 || k.week < ADVISE.every || c.phase !== 'term' || k.ending) return;
  const all = advisersOf(c);
  for (const id of ADVISER_IDS) {
    const a = all[id];
    const now = concernOf(c, id);
    if (now === null) {
      if (a.concern !== null) {
        // They remember being listened to.
        pushNews(c, { party: c.player, key: 'news.adviser.thanks', vars: { name: MINISTER_NAMES[a.name], role: `@adviser:${id}` }, tone: 'good' });
        k.credibility = clamp(k.credibility + 1, 0, 100);
      }
      a.concern = null; a.count = 0;
      continue;
    }
    a.count = a.concern === now ? a.count + 1 : 1;
    a.concern = now;
    pushNews(c, { party: c.player, key: `news.adviser.${now}`, vars: { name: MINISTER_NAMES[a.name], role: `@adviser:${id}`, n: a.count }, tone: a.count >= 2 ? 'bad' : 'neutral' });
    if (a.count >= ADVISE.ultimatum && c.inbox.length === 0 && !k.adviserPending) {
      k.adviserPending = id;
      addScene(c, { kind: 'event', from: null, event: 'adviserUltimatum' });
    }
  }
}

/** The answer to an adviser who asks for a word: listen, brush them off, or let them go. */
export function answerAdviser(c: Campaign, act: 'listen' | 'ignore' | 'dismiss'): void {
  const k = c.career!;
  const id = k.adviserPending;
  if (!id) return;
  delete k.adviserPending;
  const a = advisersOf(c)[id];
  if (act === 'listen') {
    k.credibility = clamp(k.credibility + ADVISE.listened, 0, 100);
    // Heard, an adviser gives the leader some time before asking again, even about the same worry.
    a.count = -ADVISE.patience;
  } else if (act === 'ignore') {
    k.credibility = clamp(k.credibility + ADVISE.ignored, 0, 100);
    k.government.stability = clamp(k.government.stability + ADVISE.stability, 5, 95);
    a.count = 1;
  } else {
    // A new face, with no memory of the leader, and some talk about why the old one went.
    const rng = new Rng(((c.seed ^ 0xad42) + k.week * 31 + id.length) >>> 0);
    const used = new Set(Object.values(advisersOf(c)).map((x) => x.name));
    let name = rng.int(MINISTER_NAMES.length);
    for (let i = 0; i < MINISTER_NAMES.length && used.has(name); i++) name = (name + 1) % MINISTER_NAMES.length;
    k.advisers![id] = { name, concern: null, count: 0 };
    shiftUnity(c, c.player, -2);
    k.credibility = clamp(k.credibility - 1, 0, 100);
  }
}
