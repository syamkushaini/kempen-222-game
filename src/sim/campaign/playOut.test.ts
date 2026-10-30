import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { electionResult, newCampaign, playOut } from './turn';
import { isValidCampaign } from './validate';

describe('letting the team play the rest of a campaign', () => {
  it('reaches polling day with a result, from the first week and from the middle', () => {
    const world = getWorld('byelection')!;
    for (const week of [1, 2]) {
      const c = newCampaign(world, { player: 0, difficulty: 'easy', seed: 11 });
      c.inbox = [];
      c.week = week;
      playOut(world, c);
      expect(c.phase).toBe('night');
      expect(electionResult(world, c)).not.toBeNull();
      expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    }
  });

  it('does nothing to a campaign that is not in its weeks', () => {
    const world = getWorld('byelection')!;
    const c = newCampaign(world, { player: 0, difficulty: 'easy', seed: 11 });
    playOut(world, c);
    const rng = c.rng, week = c.week;
    playOut(world, c);
    expect(c.rng).toBe(rng);
    expect(c.week).toBe(week);
  });
});
