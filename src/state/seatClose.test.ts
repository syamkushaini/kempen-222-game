import { beforeEach, describe, expect, it } from 'vitest';
import { world as general } from '../data/world';
import { PARTY_IDS } from '../sim/types';
import { useStore } from './store';

const PS = PARTY_IDS.indexOf('ps');
const store = () => useStore.getState();
const seatIn = (state: string, n = 0) => general.seats.filter((s) => s.state === state)[n];

describe('closing a seat', () => {
  beforeEach(() => { store().quitToTitle(); store().startCampaign({ name: 'T', scenario: 'general', player: PS, difficulty: 'normal', seed: 3 }); store().selectState(null); });

  it('goes back to the whole country when the seat was opened from the whole country, and not to the seat’s own state', () => {
    const seat = seatIn(general.states[3]);
    store().selectSeat(seat.id, seat.state);
    expect(store().selectedSeat).toBe(seat.id);
    expect(store().selectedState).toBe(seat.state); // the map goes to the seat
    store().selectSeat(null);
    expect(store().selectedSeat).toBeNull();
    expect(store().selectedState).toBeNull();
  });

  it('goes back to the state’s list when the seat was opened from a state’s list', () => {
    const st = general.states[2];
    store().selectState(st);
    const seat = seatIn(st, 1);
    store().selectSeat(seat.id, seat.state);
    store().selectSeat(null);
    expect(store().selectedSeat).toBeNull();
    expect(store().selectedState).toBe(st);
  });

  it('keeps where the player started when they go from one seat to another, and when a seat in another state is opened from a state', () => {
    const a = seatIn(general.states[0]), b = seatIn(general.states[5]);
    store().selectSeat(a.id, a.state);
    store().selectSeat(b.id, b.state);
    expect(store().selectedState).toBe(b.state);
    store().selectSeat(null);
    expect(store().selectedState).toBeNull();
    const st = general.states[1];
    store().selectState(st);
    store().selectSeat(b.id, b.state);
    store().selectSeat(null);
    expect(store().selectedState).toBe(st);
  });

  it('forgets it when a state is chosen: a seat opened after that remembers the new place', () => {
    const seat = seatIn(general.states[4]);
    store().selectSeat(seat.id, seat.state);
    store().selectState(general.states[6]);
    expect(store().selectedSeat).toBeNull();
    expect(store().selectedState).toBe(general.states[6]);
    store().selectSeat(null);
    expect(store().selectedState).toBe(general.states[6]);
  });
});
