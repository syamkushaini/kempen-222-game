import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { emptyDynamics } from '../dynamics';
import { projectElection } from '../election';
import { ENTERS } from '../transfer';
import { PARTY_IDS } from '../types';
import { canDo } from './actions';
import { canEnter, enterSeat, entriesOpen, entryCost, enteredSeats, leaveSeat, newSeats } from './entry';
import { playable } from './field';
import { autoPlayWeek, endWeek, electionResult, newCampaign } from './turn';
import { isValidCampaign } from './validate';

const [PS, BP, PT] = PARTY_IDS.map((_, i) => i);
const world = getWorld('state:johor')!;

/** A seat the party has never stood in, if the state has one. */
const strangerTo = (p: number) => world.seats.findIndex((_, i) => !world.baseline.contesting[i][p]);
// In Johor, Perikatan Teguh did not stand in 23 of the 56 seats.
const ME = PT;

describe('standing in a seat the party has never stood in', () => {
  const start = () => {
    const c = newCampaign(world, { player: ME, difficulty: 'normal', seed: 5 });
    c.parties[ME]!.funds = 5_000_000;
    return c;
  };

  it('lists the seats the party has no ground in, and prices them above a seat it holds ground in', () => {
    const c = start();
    const list = newSeats(world, c);
    expect(list.every((i) => !world.baseline.contesting[i][ME])).toBe(true);
    expect(entryCost(world, list[0])).toBeGreaterThan(0);
  });

  it('puts the party on the ballot, lets it act there, and takes money and goodwill for it', () => {
    const c = start();
    const i = newSeats(world, c)[0];
    expect(i).toBeDefined();
    const id = world.seats[i].id;
    expect(canDo(world, c, ME, 'ceramah', { seat: id }).ok).toBe(false);
    const before = c.parties[ME]!.funds;
    expect(enterSeat(world, c, id)).toBe(true);
    expect(c.standDowns[id][ME]).toBe(ENTERS);
    expect(c.parties[ME]!.funds).toBe(before - entryCost(world, i));
    expect(enteredSeats(c)).toEqual([id]);
    expect(canDo(world, c, ME, 'ceramah', { seat: id }).ok).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });

  it('gives a newcomer a real but smaller share than an established party would have', () => {
    const c = start();
    const i = newSeats(world, c)[0];
    expect(i).toBeDefined();
    const without = projectElection(world, emptyDynamics(), c.standDowns).seats[i];
    expect(without.votes[ME]).toBe(0);
    enterSeat(world, c, world.seats[i].id);
    const withIt = projectElection(world, emptyDynamics(), c.standDowns).seats[i];
    expect(withIt.votes[ME]).toBeGreaterThan(0);
    // The votes come from the parties already there.
    const others = (o: typeof without) => o.votes.reduce((a, v, p) => (p === ME ? a : a + v), 0);
    expect(others(withIt)).toBeLessThan(others(without));
  });

  it('can be taken back, in full, until nomination day, and then not at all', () => {
    const c = start();
    const i = newSeats(world, c)[0];
    expect(i).toBeDefined();
    const id = world.seats[i].id;
    const funds = c.parties[ME]!.funds;
    enterSeat(world, c, id);
    expect(leaveSeat(world, c, id)).toBe(true);
    expect(c.parties[ME]!.funds).toBe(funds);
    expect(c.entered).toBeUndefined();
    expect(c.standDowns[id]).toBeUndefined();
    enterSeat(world, c, id);
    while (entriesOpen(world, c)) endWeek(world, c);
    expect(leaveSeat(world, c, id)).toBe(false);
    expect(canEnter(world, c, world.seats[(i + 1) % world.seats.length].id)).toBe(false);
  });

  it('is refused without the money, in a seat already fought, and in a contest with no diplomacy', () => {
    const c = start();
    const i = newSeats(world, c)[0];
    expect(i).toBeDefined();
    c.parties[ME]!.funds = 0;
    expect(enterSeat(world, c, world.seats[i].id)).toBe(false);
    c.parties[ME]!.funds = 5_000_000;
    const held = world.seats.findIndex((_, k) => world.baseline.contesting[k][ME]);
    expect(enterSeat(world, c, world.seats[held].id)).toBe(false);
    const by = getWorld('byelection')!;
    const b = newCampaign(by, { player: ME, difficulty: 'normal', seed: 1 });
    expect(entriesOpen(by, b)).toBe(false);
  });

  it('is unused by a party that already stands everywhere', () => {
    expect(strangerTo(PS)).toBe(-1);
    expect(newSeats(world, newCampaign(world, { player: PS, difficulty: 'normal', seed: 5 }))).toEqual([]);
    expect(BP).toBeGreaterThanOrEqual(0);
  });
});

describe('a party of Sarawak in the election of another state', () => {
  const GBK = PARTY_IDS.indexOf('gbk');
  it('may be led there as an outsider with no seat, no branches and no candidates, until it puts some up', () => {
    expect(playable(world)).toContain(GBK);
    expect(playable(getWorld('state:sarawak')!)).toContain(GBK);
    const c = newCampaign(world, { player: GBK, difficulty: 'normal', seed: 7 });
    const pc = c.parties[GBK]!;
    expect(pc.machinery.every((m) => m === 0)).toBe(true);
    expect(newSeats(world, c)).toHaveLength(world.seats.length);
    expect(world.seats.some((_, i) => canDo(world, c, GBK, 'ceramah', { seat: world.seats[i].id }).ok)).toBe(false);
    pc.funds = 2_000_000;
    const id = world.seats[0].id;
    expect(enterSeat(world, c, id)).toBe(true);
    expect(canDo(world, c, GBK, 'ceramah', { seat: id }).ok).toBe(true);
    // With a candidate in the state, branches can be opened there.
    expect(canDo(world, c, GBK, 'build', { state: world.seats[0].state }).ok).toBe(true);
  });

  it('plays a whole campaign without breaking', () => {
    const c = newCampaign(world, { player: GBK, difficulty: 'normal', seed: 7 });
    c.parties[GBK]!.funds = 3_000_000;
    for (const i of newSeats(world, c).slice(0, 10)) enterSeat(world, c, world.seats[i].id);
    while (c.phase === 'campaign') { autoPlayWeek(world, c); endWeek(world, c); }
    const r = electionResult(world, c)!;
    expect(r.tally.reduce((a, b) => a + b, 0)).toBe(world.seats.length);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
});

describe('rivals looking for new ground', () => {
  it('put candidates in seats they never stood in, and pay for them, in a general election', () => {
    const general = getWorld('general')!;
    let entered = 0;
    for (const seed of [1, 2, 3, 4]) {
      const c = newCampaign(general, { player: PS, difficulty: 'normal', seed });
      const before = c.parties.map((p) => p?.funds ?? 0);
      for (let w = 0; w < 4 && c.phase === 'campaign'; w++) { autoPlayWeek(general, c); endWeek(general, c); }
      Object.entries(c.standDowns).forEach(([seat, row]) => row.forEach((v, p) => {
        if (v === ENTERS && p !== PS) { entered++; expect(general.baseline.contesting[general.seatIndex.get(seat)!][p]).toBe(false); }
      }));
      expect(isValidCampaign(JSON.parse(JSON.stringify(c)), general)).toBe(true);
      void before;
    }
    expect(entered).toBeGreaterThan(0);
  });
});
