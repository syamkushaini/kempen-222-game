import { describe, expect, it } from 'vitest';
import { getWorld } from '../data/world';
import { newCampaign, playerPoll } from '../sim/campaign/turn';
import type { Campaign } from '../sim/campaign/types';
import type { SidebarTab } from '../state/store';
import { STEPS, stepFor, type TutorialContext } from './tutorial';

const by = getWorld('byelection')!;
const start = (): Campaign => newCampaign(by, { player: 0, difficulty: 'easy', seed: 3 });
const ctx = (tab: SidebarTab, over: Partial<TutorialContext> = {}): TutorialContext => ({ campaign: start(), selectedSeat: null, tab, ...over });
const step = (id: string) => STEPS.find((s) => s.id === id)!;

describe('the tutorial pointer', () => {
  it('points at something on every step', () => {
    for (const s of STEPS) expect(s.spots(ctx('actions')).length, s.id).toBeGreaterThan(0);
  });

  it('points at the tab first when the control is on another one', () => {
    expect(step('ceramah').spots(ctx('news'))).toEqual(['tab-actions']);
    expect(step('ceramah').spots(ctx('actions'))).toEqual(['go-ceramah']);
    expect(step('poll').spots(ctx('actions'))).toEqual(['tab-polls']);
    expect(step('poll').spots(ctx('polls'))).toEqual(['poll-seat']);
  });

  it('points at the map, the End week button and Next where those are the next move', () => {
    expect(step('seat').spots(ctx('actions'))).toEqual(['map']);
    expect(step('endWeek').spots(ctx('actions'))).toEqual(['end-week']);
    expect(step('welcome').spots(ctx('actions'))).toEqual(['next']);
  });

  it('only waits for Next where there is nothing to do', () => {
    expect(STEPS.filter((s) => !s.done).map((s) => s.id)).toEqual(['welcome']);
  });

  it('is five steps long, and ends when the first week does', () => {
    expect(STEPS.map((s) => s.id)).toEqual(['welcome', 'seat', 'ceramah', 'poll', 'endWeek']);
    const c = start();
    expect(step('endWeek').done!({ campaign: c, selectedSeat: null, tab: 'actions' })).toBe(false);
    expect(step('endWeek').done!({ campaign: { ...c, week: 2 }, selectedSeat: null, tab: 'actions' })).toBe(true);
  });

  it('moves on when the thing is done', () => {
    const c = start();
    expect(step('seat').done!({ campaign: c, selectedSeat: null, tab: 'actions' })).toBe(false);
    expect(step('seat').done!({ campaign: c, selectedSeat: by.seats[0].id, tab: 'actions' })).toBe(true);
    expect(step('poll').done!({ campaign: c, selectedSeat: null, tab: 'polls' })).toBe(false);
    playerPoll(by, c, 'seat', by.seats[0].id, 'quick');
    expect(step('poll').done!({ campaign: c, selectedSeat: null, tab: 'polls' })).toBe(true);
  });

  it('does not hold the guide on a step the player has gone past', () => {
    const c = start();
    const at = (n: number, over: Partial<TutorialContext> = {}) => stepFor(n, { campaign: c, selectedSeat: null, tab: 'actions', ...over });
    // the welcome waits for Next, even with a seat already picked
    expect(at(0, { selectedSeat: by.seats[0].id })).toBe(0);
    // a week ended without a poll: the guide is over, not stuck on "poll"
    expect(at(3, { campaign: { ...c, week: 2 } })).toBe(STEPS.length);
    // a seat picked, nothing else: on to the ceramah
    expect(at(1, { selectedSeat: by.seats[0].id })).toBe(2);
    expect(at(1)).toBe(1);
  });
});
