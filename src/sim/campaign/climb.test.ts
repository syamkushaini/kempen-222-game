import { describe, expect, it } from 'vitest';
import { getWorld, newPartyWorld, nextContest, worldOf } from '../../data/world';
import { lastElection } from '../election';
import { PARTY_IDS } from '../types';
import { FOUNDING_SLOT, MAX_FOLLOWING, NEW_PARTY_SHARE, carriedFollowing } from './founding';
import { isValidCampaign } from './validate';
import { foundForContest } from './career';
import { newCampaign } from './turn';

const P = PARTY_IDS.indexOf(FOUNDING_SLOT);
const shareIn = (w: NonNullable<ReturnType<typeof newPartyWorld>>) => {
  const v = lastElection(w).votes;
  return v[P] / v.reduce((a, b) => a + b, 0);
};

describe('carrying a new party on from one contest to the next', () => {
  it('leads a by-election to the state election of its state, a state election to the general election, and stops there', () => {
    expect(nextContest('byelection:P.044', getWorld('byelection:P.044')!)).toMatch(/^state:|^general$/);
    expect(nextContest('state:perak', getWorld('state:perak')!)).toBe('general');
    expect(nextContest('general', getWorld('general')!)).toBeNull();
    expect(nextContest('hung', getWorld('hung')!)).toBeNull();
  });

  it('keeps part of the vote won, never more than the cap', () => {
    expect(carriedFollowing(0.2)).toBeCloseTo(0.14);
    expect(carriedFollowing(0.9)).toBe(MAX_FOLLOWING);
    expect(carriedFollowing(-1)).toBe(0);
  });

  it('starts the next contest with the following won, if that beats the usual', () => {
    const usual = shareIn(newPartyWorld('general')!);
    const carried = shareIn(newPartyWorld('general', 0.2)!);
    expect(carried).toBeGreaterThan(usual * 1.8);
    // a poor showing does not leave the party worse off than a new one
    expect(shareIn(newPartyWorld('general', 0.01)!)).toBeCloseTo(usual, 5);
    expect(NEW_PARTY_SHARE.general).toBeLessThan(0.2);
  });

  it('is rebuilt the same way when the game is loaded again', () => {
    const w = newPartyWorld('general', 0.2)!;
    const c = newCampaign(w, { player: P, difficulty: 'normal', seed: 3 });
    foundForContest(w, c, null);
    c.following = 0.2;
    expect(worldOf(c)).toBe(w);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), worldOf(c)!)).toBe(true);
  });
});
