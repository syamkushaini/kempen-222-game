import type { Campaign, NewsItem } from './types';

/** References inside news items, resolved to names when the item is shown. */
export const ref = {
  seat: (id: string) => `@seat:${id}`,
  seats: (ids: string[]) => `@seats:${ids.join(',')}`,
  state: (id: string) => `@state:${id}`,
  party: (p: number) => `@party:${p}`,
  leader: (p: number) => `@leader:${p}`,
  rm: (n: number) => `@rm:${n}`,
};

/** News from the talks after the election is filed under days rather than weeks. */
export const FORMATION_WEEK = 1000;

/** The week a piece of news or a poll belongs to. In a career, weeks count through the term and on into the campaign. */
export function now(c: Campaign): number {
  if (c.formation) return FORMATION_WEEK + c.formation.day;
  if (c.career) return c.phase === 'term' ? c.career.week : c.career.length + c.week;
  return c.week;
}

export function pushNews(c: Campaign, item: Omit<NewsItem, 'week'>): NewsItem {
  const full = { week: now(c), ...item };
  c.news.push(full);
  return full;
}
