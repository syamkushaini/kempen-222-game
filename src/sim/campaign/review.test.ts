import { describe, expect, it } from 'vitest';
import { getWorld, world as general } from '../../data/world';
import { PARTY_IDS } from '../types';
import { review, effortByState } from './review';
import { autoPlayWeek, electionResult, endWeek, newCampaign, playerAct, playerPoll } from './turn';

const ps = PARTY_IDS.indexOf('ps');
const perak = getWorld('state:perak')!;
const by = getWorld('byelection')!;

function played(w: typeof perak, seed: number, play: boolean) {
  const c = newCampaign(w, { player: ps, difficulty: 'normal', seed });
  while (c.phase === 'campaign') { if (play) autoPlayWeek(w, c); endWeek(w, c); }
  return { c, result: electionResult(w, c)! };
}

describe('the review after polling day', () => {
  it('adds up: seats per area match the result, close calls are the narrowest and in order', () => {
    const { c, result } = played(perak, 4, true);
    const r = review(perak, c, result);
    expect(r.states.reduce((a, s) => a + s.seatsAfter, 0)).toBe(result.tally[ps]);
    expect(r.states).toHaveLength(perak.states.length);
    for (const list of [r.closeWins, r.closeLosses]) {
      expect(list.length).toBeLessThanOrEqual(3);
      for (let i = 1; i < list.length; i++) expect(list[i].votes).toBeGreaterThanOrEqual(list[i - 1].votes);
      for (const call of list) expect(call.votes).toBeGreaterThanOrEqual(0);
    }
    for (const call of r.closeWins) expect(result.seats[perak.seatIndex.get(call.seat)!].winner).toBe(ps);
    for (const call of r.closeLosses) expect(result.seats[perak.seatIndex.get(call.seat)!].winner).not.toBe(ps);
    const moves = r.states.map((s) => Math.abs(s.seatsAfter - s.seatsBefore));
    expect(moves).toEqual([...moves].sort((a, b) => b - a));
  });

  it('counts the actions the player aimed at each place, and nothing for a player who did nothing', () => {
    const idle = played(perak, 4, false);
    expect(Object.values(effortByState(perak, idle.c)).reduce((a, b) => a + b, 0)).toBe(0);

    const c = newCampaign(general, { player: ps, difficulty: 'normal', seed: 2 });
    const seatIn = (state: string, n: number) => general.seats[general.seatsByState[state][n]].id;
    expect(playerAct(general, c, 'canvass', { state: 'perak' })).not.toBeNull();
    expect(playerAct(general, c, 'ceramah', { seat: seatIn('perak', 0) })).not.toBeNull();
    expect(playerAct(general, c, 'ceramah', { seat: seatIn('kedah', 0) })).not.toBeNull();
    const effort = effortByState(general, c);
    expect(effort.perak).toBe(2);
    expect(effort.kedah).toBe(1);
    expect(effort.johor).toBe(0);
  });

  it('reports the last national poll against the result, whoever took it', () => {
    // The media publish a poll as the weeks go by, so even an idle player has one.
    const idle = played(perak, 4, false);
    expect(review(perak, idle.c, idle.result).lastPoll).toMatchObject({ ownPoll: false });

    const c = newCampaign(perak, { player: ps, difficulty: 'normal', seed: 5 });
    while (c.week < c.totalWeeks) endWeek(perak, c);
    expect(playerPoll(perak, c, 'national', null, 'full')).not.toBeNull();
    endWeek(perak, c);
    const r = review(perak, c, electionResult(perak, c)!);
    expect(r.lastPoll!.share).toBeGreaterThan(0);
    expect(r.finalShare).toBeGreaterThan(0);
  });

  it('has no area table for a one-seat by-election', () => {
    const { c, result } = played(by, 3, true);
    const r = review(by, c, result);
    expect(r.states).toEqual([]);
    expect(r.closeWins.length + r.closeLosses.length).toBeLessThanOrEqual(1);
  });
});
