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
 * The guided steps of the by-election. Progress is judged from the campaign
 * itself, so it survives a reload.
 */
export const STEPS: TutorialStep[] = [
  { id: 'welcome', spots: () => ['next'] },
  { id: 'seat', done: (x) => x.selectedSeat !== null, spots: () => ['map'] },
  { id: 'ceramah', done: (x) => did(x.campaign, 'news.me.ceramah'), spots: (x) => onTab(x.tab, 'actions', 'go-ceramah') },
  { id: 'poll', done: (x) => x.campaign.polls.some((p) => !p.public), spots: (x) => onTab(x.tab, 'polls', 'poll-seat') },
  { id: 'canvass', done: (x) => did(x.campaign, 'news.me.canvass'), spots: (x) => onTab(x.tab, 'actions', 'go-canvass') },
  { id: 'funds', done: (x) => did(x.campaign, 'news.me.dinner') || did(x.campaign, 'news.me.crowdfund'), spots: (x) => onTab(x.tab, 'actions', 'go-dinner', 'go-crowdfund') },
  { id: 'endWeek', done: (x) => x.campaign.week >= 2, spots: () => ['end-week'] },
  { id: 'rivals', spots: () => ['next'] },
  { id: 'middle', done: (x) => x.campaign.week >= x.campaign.totalWeeks, spots: () => ['end-week'] },
  { id: 'gotv', done: (x) => did(x.campaign, 'news.me.gotv'), spots: (x) => onTab(x.tab, 'actions', 'go-gotv') },
  { id: 'pollingDay', done: (x) => x.campaign.phase !== 'campaign', spots: () => ['end-week'] },
];
