import { describe, expect, it } from 'vitest';
import { getWorld, newPartyWorld, nextContest, worldOf } from '../../data/world';
import { lastElection } from '../election';
import { PARTY_IDS } from '../types';
import { FOUNDING_SLOT, MAX_FOLLOWING, NEW_PARTY_SHARE, carriedFollowing } from './founding';
import { isStronghold, isValidCampaign } from './validate';
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

  // What each party won in a by-election: the new party second with 41%, one old party first with 44%, the rest small.
  const PT = PARTY_IDS.indexOf('pt'), PS = PARTY_IDS.indexOf('ps');
  const result = (mine: number, rival: number): number[] => {
    const v = new Array<number>(PARTY_IDS.length).fill(0);
    v[P] = mine; v[PT] = rival; v[PS] = 1 - mine - rival;
    return v;
  };
  const topOf = (votes: number[]) => votes.indexOf(Math.max(...votes));
  const seatOf = (w: NonNullable<ReturnType<typeof newPartyWorld>>, id: string) => w.seats[w.seatIndex.get(id)!];

  it('starts a stronghold as the by-election really ended: the party that won it still wins it, and the one that lost it still loses it', () => {
    for (const [mine, rival, winner] of [[0.46, 0.4, P], [0.33, 0.44, PT]] as const) {
      const home = { place: 'P.057', share: mine, shares: result(mine, rival) };
      const w = newPartyWorld('state:perak', 0.29, home)!;
      const inside = w.seats.filter((s) => s.state === home.place);
      expect(inside.length).toBeGreaterThan(0);
      for (const s of inside) {
        const total = s.last.votes.reduce((a, b) => a + b, 0);
        expect(s.last.votes[P] / total).toBeCloseTo(mine, 2);
        expect(topOf(s.last.votes)).toBe(winner);
      }
    }
  });

  it('leaves the seats outside a stronghold as they would have been without one', () => {
    const home = { place: 'P.057', share: 0.46, shares: result(0.46, 0.4) };
    const w = newPartyWorld('state:perak', 0.29, home)!;
    const plain = newPartyWorld('state:perak', 0.29)!;
    const outside = w.seats.findIndex((s) => s.state !== home.place);
    expect(w.seats[outside].last.votes).toEqual(plain.seats[outside].last.votes);
  });

  it('never shows the party as the winner of a seat it may not have won, when only its share is known', () => {
    // After a state election only the party's overall share is known: it must not top a seat on that alone.
    const w = newPartyWorld('general', 0.2, { place: 'perak', share: 0.5 })!;
    const plain = newPartyWorld('general', 0.2)!;
    let held = 0;
    for (const s of w.seats.filter((x) => x.state === 'perak')) {
      const before = plain.seats[w.seatIndex.get(s.id)!];
      if (topOf(before.last.votes) !== P) { expect(topOf(s.last.votes)).not.toBe(P); held++; }
    }
    expect(held).toBeGreaterThan(0);
  });

  it('knows a stronghold by a seat\'s own id too', () => {
    const own = newPartyWorld('general', 0.2, { place: 'P.057', share: 0.4, shares: result(0.4, 0.35) })!;
    const s = seatOf(own, 'P.057');
    const total = s.last.votes.reduce((a, b) => a + b, 0);
    expect(s.last.votes[P] / total).toBeCloseTo(0.4, 2);
  });

  it('is rebuilt the same way from a save, and a damaged stronghold is refused', () => {
    const home = { place: 'P.057', share: 0.42, shares: result(0.42, 0.4) };
    const w = newPartyWorld('state:perak', 0.29, home)!;
    const c = newCampaign(w, { player: P, difficulty: 'normal', seed: 3 });
    foundForContest(w, c, null);
    c.following = 0.29;
    c.stronghold = home;
    expect(worldOf(c)).toBe(w);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), worldOf(c)!)).toBe(true);
    expect(isStronghold({ place: 'P.057', share: 2 })).toBe(false);
    expect(isStronghold({ place: '', share: 0.3 })).toBe(false);
    expect(isStronghold({ place: 'P.057', share: 0.3, shares: [0.5, 0.5] })).toBe(false);
    expect(isStronghold({ place: 'P.057', share: 0.3, shares: result(0.3, 0.4).map((v) => v * 2) })).toBe(false);
    expect(isStronghold({ place: 'P.057' })).toBe(false);
  });
});
