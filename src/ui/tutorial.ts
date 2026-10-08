import type { Campaign } from '../sim/campaign/types';
import type { SidebarTab } from '../state/store';

export interface TutorialContext { campaign: Campaign; selectedSeat: string | null; tab: SidebarTab }

export interface TutorialStep {
  id: string;
  /** Moves the tutorial on by itself once the player has done the thing; a step without one waits for "Next". */
  done?: (x: TutorialContext) => boolean;
  /** The controls to ring while this step is showing, by the name each control carries. */
  spots: (x: TutorialContext) => string[];
}

const did = (c: Campaign, prefix: string) => c.news.some((n) => n.party === c.player && n.key.startsWith(prefix));

/** If the control is on another tab, the tab itself is what to press first. */
const onTab = (tab: SidebarTab, wanted: SidebarTab, ...spots: string[]) => (tab === wanted ? spots : [`tab-${wanted}`]);

/**
 * The guided steps of the by-election: five, enough to teach the week (choose where, act, find out, move on). Everything
 * else is explained the first time it is met, by the "What now?" line and by the words that explain themselves.
 * Progress is judged from the campaign itself, so it survives a reload.
 */
export const STEPS: TutorialStep[] = [
  { id: 'welcome', spots: () => ['next'] },
  { id: 'seat', done: (x) => x.selectedSeat !== null, spots: () => ['map'] },
  { id: 'ceramah', done: (x) => did(x.campaign, 'news.me.ceramah'), spots: (x) => onTab(x.tab, 'actions', 'go-ceramah') },
  { id: 'poll', done: (x) => x.campaign.polls.some((p) => !p.public), spots: (x) => onTab(x.tab, 'polls', 'poll-seat') },
  { id: 'endWeek', done: (x) => x.campaign.week >= 2, spots: () => ['end-week'] },
];

/**
 * Where the guide should be, given what the player has already done. A step waits for its own thing, but a player who
 * has done something later (ended the week without polling, say) must not be held on the step behind: the guide skips
 * to the step after the furthest one already done. Returns `STEPS.length` when the last step is done, which ends it.
 */
export function stepFor(current: number, x: TutorialContext): number {
  // A step that waits for "Next" is a welcome to be read, not something to be done ahead of.
  if (!STEPS[current]?.done) return current;
  let furthest = -1;
  for (let i = current; i < STEPS.length; i++) if (STEPS[i].done?.(x)) furthest = i;
  return furthest >= 0 ? furthest + 1 : current;
}
