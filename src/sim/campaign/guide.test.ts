import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { startCareer } from './career';
import { nextStep } from './guide';
import { endWeek, newCampaign, playerPoll } from './turn';
import type { Campaign } from './types';

const by = getWorld('byelection')!;
const general = getWorld('general')!;
const start = (world = by): Campaign => newCampaign(world, { player: 0, difficulty: 'easy', seed: 3 });

describe('what to do now', () => {
  it('tells a new player to find out where they stand, then to spend the week', () => {
    const c = start();
    expect(nextStep(by, c)).toBe('poll');
    expect(playerPoll(by, c, 'seat', by.seats[0].id, 'quick')).not.toBeNull();
    expect(nextStep(by, c)).toBe('spend');
  });

  it('does not nag about polls after the first two weeks', () => {
    const c = start(general);
    expect(nextStep(general, c)).toBe('poll');
    endWeek(general, c);
    endWeek(general, c);
    expect(c.week).toBe(3);
    expect(nextStep(general, c)).toBe('spend');
  });

  it('says to end the week once there are no days left, and to go to the polls in the last one', () => {
    const c = start();
    c.parties[0]!.days = 0;
    expect(nextStep(by, c)).toBe('endWeek');
    c.week = c.totalWeeks;
    expect(nextStep(by, c)).toBe('toPolls');
    c.parties[0]!.days = 3;
    expect(nextStep(by, c)).toBe('final');
  });

  it('puts anyone waiting for an answer first', () => {
    const c = start(general);
    c.inbox = [{ id: 1, kind: 'summons', from: null }];
    expect(nextStep(general, c)).toBe('decide');
  });

  it('says nothing once the campaign is over, and speaks differently between elections', () => {
    const c = start();
    c.phase = 'night';
    expect(nextStep(by, c)).toBeNull();
    const career = getWorld('career')!;
    expect(nextStep(career, startCareer(career, { player: 0, difficulty: 'normal', seed: 5 }))).toBe('term');
  });
});
