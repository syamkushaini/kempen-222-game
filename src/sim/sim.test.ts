import { describe, expect, it } from 'vitest';
import seatFile from '../data/generated/seats.json';
import { emptyDynamics, isValidDynamics } from './dynamics';
import { createWorld, hotSeats, lastElection, majorityLine, projectElection, runElection, type SeatFile } from './election';
import { projectSeat } from './project';
import { Rng } from './rng';
import { BLOC_IDS, N_PARTIES, PARTY_IDS } from './types';

const world = createWorld(seatFile as SeatFile);
const P = (id: (typeof PARTY_IDS)[number]) => PARTY_IDS.indexOf(id);
const B = (id: (typeof BLOC_IDS)[number]) => BLOC_IDS.indexOf(id);

describe('seat data', () => {
  it('has 222 seats and a 112-seat majority line', () => {
    expect(world.seats).toHaveLength(222);
    expect(majorityLine(world)).toBe(112);
  });

  it('has bloc shares that sum to 1 in every seat', () => {
    for (const s of world.seats) {
      expect(s.blocs.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 2);
      expect(s.blocs.every((b) => b >= 0)).toBe(true);
    }
  });

  it('keeps Borneo blocs in Borneo and peninsular blocs on the peninsula', () => {
    for (const s of world.seats) {
      if (s.region === 'peninsular') {
        expect(s.blocs[B('borneo_native')] + s.blocs[B('borneo_urban')]).toBe(0);
      } else {
        expect(s.blocs[B('heartland')]).toBe(0);
      }
    }
  });
});

describe('baseline', () => {
  const base = lastElection(world);

  it('reproduces the last election seat by seat', () => {
    world.seats.forEach((seat, i) => {
      const o = base.seats[i];
      expect(o.turnout).toBeCloseTo(seat.last.turnout, 4);
      for (let p = 0; p < N_PARTIES; p++) {
        // Rounding to whole votes can move a count by one or two.
        expect(Math.abs(o.votes[p] - seat.last.votes[p])).toBeLessThanOrEqual(2);
      }
      expect(o.winner).toBe(seat.last.votes.indexOf(Math.max(...seat.last.votes)));
    });
  });

  it('gives parties no votes where they did not stand', () => {
    world.seats.forEach((seat, i) => {
      seat.last.votes.forEach((v, p) => { if (v === 0) expect(base.seats[i].votes[p]).toBe(0); });
    });
  });

  it('adds up to 222 seats with nobody holding a majority', () => {
    expect(base.tally.reduce((a, b) => a + b, 0)).toBe(222);
    expect(Math.max(...base.tally)).toBeLessThan(majorityLine(world));
  });
});

describe('dynamics', () => {
  it('moves votes toward a party when its support rises nationally', () => {
    const dyn = emptyDynamics();
    for (const row of dyn.support.nat) row[P('bp')] = 0.4;
    const before = lastElection(world);
    const after = projectElection(world, dyn);
    expect(after.votes[P('bp')]).toBeGreaterThan(before.votes[P('bp')]);
    expect(after.tally[P('bp')]).toBeGreaterThan(before.tally[P('bp')]);
    expect(after.turnout).toBeCloseTo(before.turnout, 6);
  });

  it('only moves seats that contain the targeted bloc', () => {
    const dyn = emptyDynamics();
    dyn.support.nat[B('borneo_native')][P('gbk')] = 1;
    const before = lastElection(world);
    const after = projectElection(world, dyn);
    world.seats.forEach((seat, i) => {
      if (seat.region === 'peninsular') expect(after.seats[i].votes).toEqual(before.seats[i].votes);
    });
    expect(after.votes[P('gbk')]).toBeGreaterThan(before.votes[P('gbk')]);
  });

  it('raises turnout and helps a party when its supporters are more motivated', () => {
    const dyn = emptyDynamics();
    dyn.turnout.party[P('ps')] = 0.5;
    const before = lastElection(world);
    const after = projectElection(world, dyn);
    expect(after.turnout).toBeGreaterThan(before.turnout);
    expect(after.votes[P('ps')]).toBeGreaterThan(before.votes[P('ps')]);
    expect(after.votes[P('pt')]).toBe(before.votes[P('pt')]);
  });

  it('applies seat-level effects to that seat only', () => {
    const dyn = emptyDynamics();
    const target = world.seats[10];
    const boosted = target.last.votes.findIndex((v, p) => v > 0 && p !== target.last.votes.indexOf(Math.max(...target.last.votes)));
    dyn.support.seat[target.id] = PARTY_IDS.map((_, p) => (p === boosted ? 3 : 0));
    const before = lastElection(world);
    const after = projectElection(world, dyn);
    expect(after.seats[10].winner).toBe(boosted);
    after.seats.forEach((o, i) => { if (i !== 10) expect(o.votes).toEqual(before.seats[i].votes); });
  });

  it('lets a late swing move only the undecided share', () => {
    const dyn = emptyDynamics();
    dyn.lateSwing[P('pt')] = 50; // every undecided who can vote pt does
    const seat = world.seats.find((s) => s.id === 'P.085')!;
    const i = world.seatIndex.get(seat.id)!;
    const before = projectSeat(seat, i, world.baseline, emptyDynamics());
    const after = projectSeat(seat, i, world.baseline, dyn);
    const gain = (after.votes[P('pt')] - before.votes[P('pt')]) / before.valid;
    expect(gain).toBeGreaterThan(0);
    expect(gain).toBeLessThan(before.undecided + 0.01);
  });

  it('shields early voters from a polling-day shock', () => {
    const putrajaya = world.seats.find((s) => s.id === 'P.125')!; // mostly civil servants, many early voters
    const i = world.seatIndex.get(putrajaya.id)!;
    const dyn = emptyDynamics();
    const calm = projectSeat(putrajaya, i, world.baseline, dyn);
    const general = projectSeat(putrajaya, i, world.baseline, dyn, { turnout: -1 });
    const pollingDay = projectSeat(putrajaya, i, world.baseline, dyn, { pollingDay: -1 });
    expect(pollingDay.turnout).toBeLessThan(calm.turnout);
    expect(pollingDay.turnout).toBeGreaterThan(general.turnout);
  });

  it('validates the shape of saved dynamics', () => {
    expect(isValidDynamics(emptyDynamics())).toBe(true);
    expect(isValidDynamics(JSON.parse(JSON.stringify(emptyDynamics())))).toBe(true);
    expect(isValidDynamics({})).toBe(false);
    const bad = emptyDynamics();
    bad.support.nat[0].pop();
    expect(isValidDynamics(bad)).toBe(false);
  });
});

describe('election night', () => {
  it('is repeatable for the same seed and differs between seeds', () => {
    const a = runElection(world, emptyDynamics(), new Rng(42));
    const b = runElection(world, emptyDynamics(), new Rng(42));
    const c = runElection(world, emptyDynamics(), new Rng(43));
    expect(a.tally).toEqual(b.tally);
    expect(a.votes).toEqual(b.votes);
    expect(c.votes).not.toEqual(a.votes);
  });

  it('stays close to the projection on average', () => {
    const base = lastElection(world);
    const runs = 40;
    const mean = PARTY_IDS.map(() => 0);
    for (let s = 0; s < runs; s++) {
      const r = runElection(world, emptyDynamics(), new Rng(1000 + s));
      expect(r.tally.reduce((x, y) => x + y, 0)).toBe(222);
      r.tally.forEach((v, p) => { mean[p] += v / runs; });
    }
    mean.forEach((m, p) => expect(Math.abs(m - base.tally[p])).toBeLessThan(6));
  });

  it('lists the tightest seats first', () => {
    const hot = hotSeats(lastElection(world), 10);
    expect(hot).toHaveLength(10);
    for (let i = 1; i < hot.length; i++) expect(hot[i].margin).toBeGreaterThanOrEqual(hot[i - 1].margin);
    expect(hot[0].cls).toBe('marginal');
  });
});
