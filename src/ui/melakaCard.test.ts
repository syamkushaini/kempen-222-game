import { describe, expect, it } from 'vitest';
import { flagColours, lanternString, unit } from './melakaCard';

describe('the Melaka result card', () => {
  it('hangs the lanterns of a string from end to end, sagging most in the middle', () => {
    const pts = lanternString(28, 60, 600, 446, 20);
    expect(pts).toHaveLength(28);
    expect(pts[0]).toEqual({ x: 60, y: 446 });
    expect(pts[27].x).toBeCloseTo(600);
    expect(pts[27].y).toBeCloseTo(446);
    const lowest = Math.max(...pts.map((p) => p.y));
    expect(lowest).toBeLessThanOrEqual(446 + 20);
    expect(pts[13].y).toBeGreaterThan(pts[0].y + 15);
    expect(lanternString(1, 0, 100, 10, 8)).toEqual([{ x: 50, y: 18 }]);
  });

  it('flies the player\'s colour first, then each other party once, at most five', () => {
    const seats = ['#d9483f', '#d9483f', '#3558b8', '#2e9b6a', '#3558b8', '#f2d64b', '#aaaaaa', '#bbbbbb'];
    expect(flagColours(seats, '#3558b8')).toEqual(['#3558b8', '#d9483f', '#2e9b6a', '#f2d64b', '#aaaaaa']);
    expect(flagColours([], '#123456')).toEqual(['#123456']);
  });

  it('draws the same picture every time: its luck depends only on the place in the picture', () => {
    expect(unit(7)).toBe(unit(7));
    for (let i = 0; i < 200; i++) { expect(unit(i)).toBeGreaterThanOrEqual(0); expect(unit(i)).toBeLessThan(1); }
    expect(new Set(Array.from({ length: 50 }, (_, i) => unit(i))).size).toBeGreaterThan(40);
  });
});
