import { clamp } from '../math';
import type { Rng } from '../rng';
import { lift } from './office';
import type { BlocId } from '../types';
import type { Campaign } from './types';

// The netizens were once a commentary on the news. Now they are a force: what the player does this week is weighed online, the verdict
// carries over from week to week, and it moves the people who live there. A scandal sinks in; a good week is shared. A viral story
// that has nothing to do with politics (see eventListViral.ts) is a chance to be seen to be human.

export const NET = { good: 1.5, bad: -2.5, fade: 0.96, mood: 0.003, max: 100, backlash: 0.35 };
/** Who is online, and so who moves with the pulse. */
export const ONLINE: BlocId[] = ['undi18', 'gig', 'urban_b40', 'urban_lib'];

export const netOf = (c: Campaign): number => c.career?.net ?? 0;

/** A week of the netizens: the week's news about the player is weighed, the pulse fades a little, and the people online move with it. */
export function netizenWeek(c: Campaign): void {
  const k = c.career!;
  let swing = 0;
  for (let i = c.news.length - 1; i >= 0 && c.news[i].week >= k.week - 1; i--) {
    const item = c.news[i];
    if (item.party !== c.player) continue;
    swing += item.tone === 'good' ? NET.good : item.tone === 'bad' ? NET.bad : 0;
  }
  k.net = clamp((k.net ?? 0) * NET.fade + swing, -NET.max, NET.max);
  // Anger is louder than praise: a bad pulse costs more than a good one earns.
  const n = k.net / NET.max;
  lift(k, c.player, ONLINE, n * NET.mood * (n < 0 ? 1 + NET.backlash : 1));
}

/** Something non-political goes viral every sixteen to thirty-six weeks: one of the stories the player has met least. */
export const VIRAL_GAP = { min: 16, max: 36 };
export const VIRAL_IDS = ['viralCat', 'viralDurian', 'viralFootball', 'viralKopitiam', 'viralConcert', 'viralStudent', 'viralRaya', 'viralPothole'] as const;

export function viralWeek(c: Campaign, rng: Rng): void {
  const k = c.career!;
  if (k.viral === undefined) { k.viral = k.week + VIRAL_GAP.min + Math.floor(rng.next() * (VIRAL_GAP.max - VIRAL_GAP.min + 1)); return; }
  if (k.week < k.viral) return;
  k.viral = k.week + VIRAL_GAP.min + Math.floor(rng.next() * (VIRAL_GAP.max - VIRAL_GAP.min + 1));
  const seen = (id: string) => k.fired.filter((x) => x === id).length + (k.seen ?? []).filter((x) => x === id).length;
  const least = Math.min(...VIRAL_IDS.map(seen));
  const pool = VIRAL_IDS.filter((id) => seen(id) === least && !k.queue.some((q) => q.event === id));
  if (pool.length === 0) return;
  k.queue.push({ event: pool[Math.floor(rng.next() * pool.length)], week: k.week });
}
