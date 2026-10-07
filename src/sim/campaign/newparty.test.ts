import { describe, expect, it } from 'vitest';
import { canFound, getWorld, newPartyWorld, worldOf } from '../../data/world';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { foundForContest } from './career';
import { FOUNDING_FUNDS, NEW_PARTY_SHARE } from './founding';
import { autoPlayWeek, endWeek, newCampaign } from './turn';
import { isValidCampaign } from './validate';

const GENBA = PARTY_IDS.indexOf('genba');

describe('a brand-new party in a single contest', () => {
  it('stands in every seat with a following of its own, and leaves the ordinary contest alone', () => {
    const plain = getWorld('general')!, fresh = newPartyWorld('general')!;
    expect(fresh.id).toBe('general');
    for (const seat of fresh.seats) {
      const total = seat.last.votes.reduce((a, b) => a + b, 0);
      expect(seat.last.votes[GENBA] / total).toBeGreaterThanOrEqual(NEW_PARTY_SHARE.general * 0.9);
    }
    expect(plain.seats.filter((s) => s.last.votes[GENBA] > 0).length).toBeLessThan(plain.seats.length / 4);
    expect(newPartyWorld('general')).toBe(fresh);
  });

  it('is offered for every kind of contest but a hung parliament, and never for a career', () => {
    expect(canFound('byelection') && canFound('state') && canFound('general')).toBe(true);
    expect(canFound('hung')).toBe(false);
    expect(newPartyWorld('hung')).toBeNull();
    expect(newPartyWorld('career')).toBeNull();
  });

  it('opens with a small purse and an ordinary leader, is a valid save, and plays through the election', () => {
    const world = newPartyWorld('byelection')!;
    const c = newCampaign(world, { player: GENBA, difficulty: 'normal', seed: 7, backstory: null });
    foundForContest(world, c, null);
    expect(c.newParty).toBe(true);
    expect(c.parties[GENBA]!.funds).toBe(scaled(world, FOUNDING_FUNDS));
    expect(worldOf(c)).toBe(world);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    for (let i = 0; i < 40 && c.phase === 'campaign'; i++) { autoPlayWeek(world, c); endWeek(world, c); }
    expect(c.phase).not.toBe('campaign');
  });
});
