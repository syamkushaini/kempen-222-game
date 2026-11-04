import { beforeEach, describe, expect, it } from 'vitest';
import '../data/allStates';
import { dunByElections } from '../data/world';
import { FOUNDING_SLOT } from '../sim/campaign/founding';
import { LEADER_POINTS, validLeaderStats } from '../sim/campaign/perks';
import { PARTY_IDS } from '../sim/types';
import { startOf } from './game';
import { useStore } from './store';

const store = () => useStore.getState();
const start = (leaderStats?: number[]) => {
  store().quitToTitle();
  store().startCampaign({ name: 'T', scenario: dunByElections('selangor')[0], player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: null, ...(leaderStats ? { leaderStats } : {}), seed: 3, founded: true });
};

describe('a leader built with twelve points', () => {
  beforeEach(() => store().quitToTitle());

  it('is valid only with four whole stats of one to five that add up to twelve', () => {
    expect(LEADER_POINTS).toBe(12);
    expect(validLeaderStats([5, 3, 2, 2])).toBe(true);
    expect(validLeaderStats([3, 3, 3, 3])).toBe(true);
    expect(validLeaderStats([5, 5, 1, 1])).toBe(true);
    expect(validLeaderStats([5, 5, 5, 5])).toBe(false);
    expect(validLeaderStats([5, 3, 2, 3])).toBe(false);
    expect(validLeaderStats([6, 3, 2, 1])).toBe(false);
    expect(validLeaderStats([0, 5, 5, 2])).toBe(false);
    expect(validLeaderStats([2.5, 3.5, 3, 3])).toBe(false);
    expect(validLeaderStats([4, 4, 4])).toBe(false);
  });

  it('becomes the leader the party starts with, and survives starting the game again', () => {
    start([5, 2, 3, 2]);
    expect(store().game!.campaign.team.leader).toEqual({ backstory: null, stats: [5, 2, 3, 2] });
    expect(startOf(store().game!).leaderStats).toEqual([5, 2, 3, 2]);
    store().restart();
    expect(store().game!.campaign.team.leader.stats).toEqual([5, 2, 3, 2]);
  });

  it('refuses stats that spend more than twelve points, and falls back to an ordinary leader', () => {
    start([5, 5, 5, 5]);
    expect(store().game!.campaign.team.leader.stats).toEqual([3, 3, 3, 3]);
    expect(startOf(store().game!).leaderStats).toBeUndefined();
  });

  it('is not used when a ready-made background is chosen', () => {
    store().quitToTitle();
    store().startCampaign({ name: 'T', scenario: dunByElections('selangor')[0], player: PARTY_IDS.indexOf(FOUNDING_SLOT), difficulty: 'easy', backstory: 'firebrand', leaderStats: [2, 2, 4, 4], seed: 3, founded: true });
    expect(store().game!.campaign.team.leader.backstory).toBe('firebrand');
    expect(store().game!.campaign.team.leader.stats).toEqual([5, 2, 2, 3]);
  });
});
