import { economicMood } from './office';
import type { Career, NewsItem } from './types';

const unit = (x: number): number => Math.min(1, Math.max(0, x));

/**
 * How well a government did in the parliament that ended, from 0 to 1: the economy (a mood of -1 or worse scores nothing, 2 or better all), the
 * party's credibility (40 scores nothing, 80 all) and the share of its promises it kept. The three count alike. It decides how much of the voters'
 * weariness a government is spared (see weariness in party.ts).
 */
export function governmentScore(k: Career, news: readonly NewsItem[]): number {
  const reckoning = [...news].reverse().find((n) => n.key === 'news.gov.reckoning');
  const total = Number(reckoning?.vars?.total ?? 0);
  const kept = total > 0 ? Number(reckoning?.vars?.kept ?? 0) / total : 0.5;
  return (unit((economicMood(k.economy) + 1) / 3) + unit((k.credibility - 40) / 40) + unit(kept)) / 3;
}
