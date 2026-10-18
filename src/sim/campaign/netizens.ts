import { clamp } from '../math';
import { lift } from './office';
import type { BlocId } from '../types';
import type { Campaign } from './types';

// The netizens were once a commentary on the news. Now they are a force: what the player does this week is weighed online, the verdict
// carries over from week to week, and it moves the people who live there. A scandal sinks in; a good week is shared. A viral story
// that has nothing to do with politics (see eventListViral.ts) is a chance to be seen to be human.

export const NET = { good: 4, bad: -5, fade: 0.96, mood: 0.0045, max: 100, backlash: 0.35 };
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
