import { describe, expect, it } from 'vitest';
import { FIT, holdPoint, keepInside, MAX_VIEW, viewTransform, zoomBy } from './mapGesture';

const W = 1000, H = 470;
/** Where a map point lands on screen under a view. */
const onScreen = (v: { k: number; x: number; y: number }, p: [number, number]): [number, number] =>
  [W / 2 + v.k * (p[0] - W / 2) + v.x, H / 2 + v.k * (p[1] - H / 2) + v.y];

describe('zooming and dragging the map', () => {
  it('keeps the same spot of map under the fingers while pinching', () => {
    // Fingers at (300,200); the spread doubles and the midpoint moves to (350,220).
    const v = holdPoint(FIT, [300, 200], [350, 220], 2, W, H);
    expect(v.k).toBe(2);
    const [sx, sy] = onScreen(v, [300, 200]);
    expect(sx).toBeCloseTo(350, 6);
    expect(sy).toBeCloseTo(220, 6);
  });

  it('is a plain drag when the scale does not change', () => {
    const start = { k: 3, x: 40, y: -20 };
    const v = holdPoint(start, [500, 235], [560, 215], 3, W, H);
    expect(v.k).toBe(3);
    expect(v.x - start.x).toBeCloseTo(60, 6);
    expect(v.y - start.y).toBeCloseTo(-20, 6);
  });

  it('holds the point under a second pinch on an already zoomed map', () => {
    const start = { k: 2.5, x: -120, y: 30 };
    const from: [number, number] = [420, 150];
    const mapPoint: [number, number] = [(from[0] - W / 2 - start.x) / start.k + W / 2, (from[1] - H / 2 - start.y) / start.k + H / 2];
    const v = holdPoint(start, from, [400, 160], 4, W, H);
    const [sx, sy] = onScreen(v, mapPoint);
    expect(sx).toBeCloseTo(400, 6);
    expect(sy).toBeCloseTo(160, 6);
  });

  it('never zooms out past the whole map or in past the limit, and never loses the map', () => {
    expect(zoomBy(FIT, 0.5, W, H).k).toBe(1);
    expect(zoomBy({ k: 9, x: 0, y: 0 }, 5, W, H).k).toBe(MAX_VIEW);
    const far = keepInside({ k: 2, x: 99999, y: -99999 }, W, H);
    expect(far.x).toBe(W);
    expect(far.y).toBe(-H);
  });

  it('zooms about the middle: a button press leaves the centre where it was', () => {
    const v = zoomBy(FIT, 2, W, H);
    expect(onScreen(v, [W / 2, H / 2])).toEqual([W / 2, H / 2]);
    expect(viewTransform(FIT, W, H)).toBe('translate(0 0) translate(500 235) scale(1) translate(-500 -235)');
  });
});
