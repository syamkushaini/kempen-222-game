import { describe, expect, it } from 'vitest';
import { getWorld } from '../data/world';
import { newCampaign, playerPoll } from '../sim/campaign/turn';
import type { Campaign } from '../sim/campaign/types';
import type { SidebarTab } from '../state/store';
import { STEPS, type TutorialContext } from './tutorial';

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
    expect(step('funds').spots(ctx('actions'))).toEqual(['go-dinner', 'go-crowdfund']);
    expect(step('gotv').spots(ctx('polls'))).toEqual(['tab-actions']);
  });

  it('points at the map, the End week button and Next where those are the next move', () => {
    expect(step('seat').spots(ctx('actions'))).toEqual(['map']);
    for (const id of ['endWeek', 'middle', 'pollingDay']) expect(step(id).spots(ctx('actions')), id).toEqual(['end-week']);
    for (const id of ['welcome', 'rivals']) expect(step(id).spots(ctx('actions')), id).toEqual(['next']);
  });

  it('only waits for Next where there is nothing to do', () => {
    expect(STEPS.filter((s) => !s.done).map((s) => s.id)).toEqual(['welcome', 'rivals']);
  });

  it('moves on when the thing is done', () => {
    const c = start();
    expect(step('seat').done!({ campaign: c, selectedSeat: null, tab: 'actions' })).toBe(false);
    expect(step('seat').done!({ campaign: c, selectedSeat: by.seats[0].id, tab: 'actions' })).toBe(true);
    expect(step('poll').done!({ campaign: c, selectedSeat: null, tab: 'polls' })).toBe(false);
    playerPoll(by, c, 'seat', by.seats[0].id, 'quick');
    expect(step('poll').done!({ campaign: c, selectedSeat: null, tab: 'polls' })).toBe(true);
  });
});
