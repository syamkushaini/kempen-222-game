import { describe, expect, it } from 'vitest';
import { foundedWorld, worldOf } from '../../data/world';
import { lastElection } from '../election';
import { PARTY_IDS } from '../types';
import { FOUNDING_SLOT } from './founding';
import { startCareer } from './career';

const P = PARTY_IDS.indexOf(FOUNDING_SLOT);
const held = (w: ReturnType<typeof foundedWorld>) => lastElection(w).seats.map((s, i) => ({ id: w.seats[i].id, won: s.winner === P })).filter((x) => x.won).map((x) => x.id);

describe('where a party founded from nothing begins', () => {
  it('begins in the seat its founding slot already held unless another is chosen', () => {
    const w = foundedWorld('career');
    expect(held(w)).toHaveLength(1);
  });

  it('can begin in any seat chosen, which it then holds and the old one does not', () => {
    const home = foundedWorld('career');
    const [old] = held(home);
    const target = home.seats.find((s) => s.id !== old && s.state === 'penang')!;
    const w = foundedWorld('career', target.id);
    expect(held(w)).toEqual([target.id]);
    // The seat it left goes back to someone else, and no other seat changed hands.
    const before = lastElection(home).seats.map((s) => s.winner);
    const after = lastElection(w).seats.map((s) => s.winner);
    const changed = after.map((x, i) => (x !== before[i] ? home.seats[i].id : null)).filter(Boolean);
    expect(changed.sort()).toEqual([old, target.id].sort());
    // Every other seat still has the new party on the ballot with its few votes.
    expect(w.seats.every((s) => s.last.votes[P] > 0)).toBe(true);
  });

  it('is remembered by the game, so that a saved game is played in the same world', () => {
    const home = foundedWorld('career');
    const target = home.seats.find((s) => s.state === 'sarawak')!;
    const w = foundedWorld('career', target.id);
    const c = startCareer(w, { player: P, difficulty: 'normal', seed: 3, founded: true, foundedSeat: target.id });
    expect(c.career!.foundedSeat).toBe(target.id);
    expect(foundedWorld(c.scenario, c.career!.foundedSeat)).toBe(w);
  });

  it('is the world the screens draw, which they ask for from the founded flag and the seat alone', () => {
    const home = foundedWorld('career');
    const target = home.seats.find((s) => s.state === 'kedah')!;
    const w = worldOf({ scenario: 'career', career: { founded: true, foundedSeat: target.id } as never });
    expect(w).toBe(foundedWorld('career', target.id));
    expect(worldOf({ scenario: 'career', career: { founded: true } as never })).toBe(home);
  });
});
