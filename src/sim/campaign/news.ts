import type { Campaign, NewsItem } from './types';

/** References inside news items, resolved to names when the item is shown. */
export const ref = {
  seat: (id: string) => `@seat:${id}`,
  seats: (ids: string[]) => `@seats:${ids.join(',')}`,
  state: (id: string) => `@state:${id}`,
  party: (p: number) => `@party:${p}`,
  leader: (p: number) => `@leader:${p}`,
  rm: (n: number) => `@rm:${n}`,
  mission: (kind: string) => `@mission:${kind}`,
};

/** News from the talks after the election is filed under days rather than weeks. */
export const FORMATION_WEEK = 1000;

/** The week of the term in which a career's campaign opened: its weeks are counted on from there. Nothing in a single contest. */
export const campaignFrom = (c: Campaign): number => (c.career ? c.career.week : 0);

/**
 * The week a piece of news or a poll belongs to. In a career, weeks count through the term and on into the campaign, from
 * the week the term ended in (which is not always its last: a parliament may be dissolved early).
 */
export function now(c: Campaign): number {
  if (c.formation) return FORMATION_WEEK + c.formation.day;
  if (c.career) return c.phase === 'term' ? c.career.week : campaignFrom(c) + c.week;
  return c.week;
}

/** A filed week as the player counts it: a week of the campaign under way is the campaign's own (1, 2, 3...), any other is the term's. */
export function shownWeek(c: Campaign, week: number): { week: number; campaign: boolean } {
  const from = campaignFrom(c);
  return c.career && c.phase !== 'term' && week > from && week < FORMATION_WEEK ? { week: week - from, campaign: true } : { week, campaign: false };
}

export function pushNews(c: Campaign, item: Omit<NewsItem, 'week'>): NewsItem {
  const full = { week: now(c), ...item };
  c.news.push(full);
  return full;
}
