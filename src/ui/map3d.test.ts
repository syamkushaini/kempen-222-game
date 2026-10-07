import { describe, expect, it } from 'vitest';
import mapFile from '../data/generated/map.json';
import { approach, area2, fitDistance, parseRings, SAFE_MARGIN, seatHeight, shapeParts, strength, TALLEST } from './map3d';

describe('reading a seat outline', () => {
  it('turns relative steps into points and closes each ring', () => {
    const rings = parseRings('M10 20l1 0l0 1l-1 0zM30 30l2 0l0 2l-2 0z');
    expect(rings).toEqual([[[10, 20], [11, 20], [11, 21], [10, 21]], [[30, 30], [32, 30], [32, 32], [30, 32]]]);
  });

  it('reads every seat on the national map, with no ring of fewer than three points', () => {
    const seats = Object.values((mapFile as unknown as { seats: Record<string, { d: string }> }).seats);
    expect(seats.length).toBe(222);
    for (const seat of seats) {
      const rings = parseRings(seat.d);
      expect(rings.length).toBeGreaterThan(0);
      for (const ring of rings) expect(ring.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps a hole with the piece that contains it and an island apart', () => {
    const square = (x: number, y: number, n: number, flip = false) => {
      const r: [number, number][] = [[x, y], [x + n, y], [x + n, y + n], [x, y + n]];
      return flip ? r.reverse() : r;
    };
    const parts = shapeParts([square(0, 0, 10), square(3, 3, 2, true), square(20, 0, 4)]);
    expect(parts).toHaveLength(2);
    expect(parts[0].holes).toHaveLength(1);
    expect(parts[1].holes).toHaveLength(0);
    expect(Math.sign(area2(square(0, 0, 1)))).not.toBe(Math.sign(area2(square(0, 0, 1, true))));
  });

  it('gives every seat on the national map at least one piece', () => {
    for (const seat of Object.values((mapFile as unknown as { seats: Record<string, { d: string }> }).seats)) {
      expect(shapeParts(parseRings(seat.d)).length).toBeGreaterThan(0);
    }
  });
});

describe('how tall a seat stands', () => {
  const size = 100;
  const held = (margin: number) => seatHeight({ winner: 0, margin, stale: false }, size);

  it('rises with how firmly the seat is held, and stops at the safe margin', () => {
    expect(held(0)).toBeLessThan(held(0.05));
    expect(held(0.05)).toBeLessThan(held(0.15));
    expect(held(0.15)).toBeLessThan(held(SAFE_MARGIN));
    expect(held(SAFE_MARGIN)).toBeCloseTo(TALLEST * size, 6);
    expect(held(0.8)).toBeCloseTo(TALLEST * size, 6);
    expect(strength(-1)).toBe(0);
  });

  it('keeps a toss-up visible, and puts unpolled and undeclared seats lowest', () => {
    expect(held(0)).toBeGreaterThan(0);
    const fog = seatHeight({ winner: 0, margin: 0.4, stale: true }, size);
    const none = seatHeight({ winner: -1, margin: 0, stale: false }, size);
    expect(fog).toBeLessThan(held(0));
    expect(none).toBeLessThan(fog);
  });

  it('scales with the size of the area on show', () => {
    expect(seatHeight({ winner: 1, margin: 0.2, stale: false }, 1000)).toBeCloseTo(10 * seatHeight({ winner: 1, margin: 0.2, stale: false }, 100), 6);
  });
});

describe('framing the camera', () => {
  it('stands far enough back for a wide box on a narrow screen and a tall box on a wide one', () => {
    const wide = fitDistance(1000, 300, 1.5, 35, 0.9), tall = fitDistance(300, 1000, 1.5, 35, 0.9);
    expect(wide).toBeGreaterThan(fitDistance(1000, 300, 3, 35, 0.9));
    expect(tall).toBeGreaterThan(fitDistance(300, 300, 1.5, 35, 0.9));
    expect(fitDistance(100, 100, 1, 35, 0.9, 2)).toBeCloseTo(2 * fitDistance(100, 100, 1, 35, 0.9, 1), 6);
  });

  it('keeps the near edge of a tilted box on screen', () => {
    // Project the near and far edges of a box seen from the distance it asks for: neither may leave the picture.
    const fov = 35, aspect = 16 / 9, tilt = 0.95, w = 100, h = 200;
    const d = fitDistance(w, h, aspect, fov, tilt, 1);
    const half = Math.tan((fov * Math.PI) / 360);
    for (const z of [h / 2, -h / 2]) {
      const depth = d - z * Math.sin(tilt);
      expect(Math.abs((z * Math.cos(tilt)) / depth)).toBeLessThanOrEqual(half + 1e-9);
      expect(Math.abs(w / 2 / depth)).toBeLessThanOrEqual(half * aspect + 1e-9);
    }
  });

  it('moves toward a goal at the same pace however the frames are cut', () => {
    const once = approach(0, 100, 0.1);
    const twice = approach(approach(0, 100, 0.05), 100, 0.05);
    expect(once).toBeCloseTo(twice, 6);
    expect(approach(99.99999, 100, 0.5)).toBe(100);
  });
});
