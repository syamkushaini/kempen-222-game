import { describe, expect, it } from 'vitest';
import { arrange, benches, hemicycle, majorityTurn, pitch, sideCount, type Bloc } from './hemicycle';

describe('the hemicycle', () => {
  it('has exactly one place for every seat, whatever the size of the House', () => {
    for (const n of [1, 2, 15, 28, 59, 82, 222]) expect(hemicycle(n)).toHaveLength(n);
    expect(hemicycle(0)).toEqual([]);
  });

  it('runs from the far left to the far right, inside a half circle', () => {
    const places = hemicycle(222);
    for (let i = 1; i < places.length; i++) expect(places[i].turn).toBeGreaterThanOrEqual(places[i - 1].turn);
    for (const p of places) {
      expect(Math.hypot(p.x, p.y)).toBeLessThanOrEqual(1 + 1e-9);
      expect(p.y).toBeGreaterThanOrEqual(0);
    }
    expect(places[0].x).toBeLessThan(-0.3);
    expect(places.at(-1)!.x).toBeGreaterThan(0.3);
  });

  it('puts more seats on the longer benches at the back, and keeps them from touching', () => {
    const places = hemicycle(222), rows = benches(222);
    const per = Array.from({ length: rows }, (_, r) => places.filter((p) => p.row === r).length);
    for (let r = 1; r < rows; r++) expect(per[r]).toBeGreaterThanOrEqual(per[r - 1]);
    const gap = pitch(222);
    let closest = Infinity;
    for (let i = 0; i < places.length; i++) for (let j = i + 1; j < places.length; j++) closest = Math.min(closest, Math.hypot(places[i].x - places[j].x, places[i].y - places[j].y));
    expect(closest).toBeGreaterThan(gap * 0.8);
  });

  it('has a sensible number of benches for a state assembly and for Parliament', () => {
    expect(benches(1)).toBe(1);
    expect(benches(15)).toBeGreaterThanOrEqual(2);
    expect(benches(222)).toBeGreaterThanOrEqual(7);
    expect(benches(222)).toBeLessThanOrEqual(9);
  });
});

describe('who sits where', () => {
  const blocs: Bloc[] = [
    { party: 0, seats: 82, side: 'left' }, { party: 3, seats: 23, side: 'left' },
    { party: 6, seats: 5, side: 'middle' },
    { party: 2, seats: 74, side: 'right' }, { party: 1, seats: 38, side: 'right' },
  ];

  it('seats every member once, the first bloc of each side at its own end', () => {
    const members = arrange(blocs);
    expect(members).toHaveLength(222);
    expect(members[0].party).toBe(0);
    expect(members.at(-1)!.party).toBe(2);
    expect(members[82].party).toBe(3);
    expect(members[105].side).toBe('middle');
  });

  it('gives each member a number of its own within its party, so it can be followed across the floor', () => {
    const keys = new Set(arrange(blocs).map((m) => `${m.party}:${m.k}`));
    expect(keys.size).toBe(222);
    const moved = arrange(blocs.map((b) => (b.party === 1 ? { ...b, side: 'left' as const } : b)));
    expect(new Set(moved.map((m) => `${m.party}:${m.k}`))).toEqual(keys);
    expect(sideCount(blocs, 'left')).toBe(105);
    expect(sideCount(blocs.map((b) => (b.party === 1 ? { ...b, side: 'left' as const } : b)), 'left')).toBe(143);
  });

  it('draws the majority line just past the seat that makes a majority', () => {
    expect(majorityTurn(222, 112)).toBeCloseTo(112 / 222, 9);
    const places = hemicycle(222), line = majorityTurn(222, 112);
    // The 112 seats furthest left are, near enough, the ones to the left of the line.
    const left = places.filter((p) => p.turn < line).length;
    expect(Math.abs(left - 112)).toBeLessThanOrEqual(1);
  });
});
