import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { FORECAST_WEEKS, forecast, meterNow, meterTarget } from './forecast';
import { STANCE_IDS, setStance } from './stances';

const world = getWorld('career')!;
const career = () => startCareer(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5 });

describe('the forecast of a meter', () => {
  it('starts where the meter is, runs a year, and closes on its target without passing it', () => {
    const k = career().career!;
    for (const id of STANCE_IDS) {
      const line = forecast(k, id);
      expect(line, id).toHaveLength(FORECAST_WEEKS + 1);
      expect(line[0], id).toBe(meterNow(k, id));
      const target = meterTarget(k, id, 0);
      const from = line[0];
      for (const v of line) expect(v >= Math.min(from, target) - 1e-9 && v <= Math.max(from, target) + 1e-9, id).toBe(true);
      // Always nearer the target than it was, and never there in a year.
      expect(Math.abs(line.at(-1)! - target), id).toBeLessThanOrEqual(Math.abs(from - target));
    }
  });

  it('runs higher with a slider pushed up and lower with it eased off (the armed forces’ say, the other way)', () => {
    const k = career().career!;
    for (const id of STANCE_IDS) {
      const [up, mid, down] = [2, 0, -2].map((n) => forecast(k, id, n as never).at(-1)!);
      if (id === 'influence') { expect(up, id).toBeLessThan(mid); expect(down, id).toBeGreaterThan(mid); }
      else { expect(up, id).toBeGreaterThan(mid); expect(down, id).toBeLessThan(mid); }
    }
  });

  it('follows the slider as it is set, and agrees with the targets the weeks use', () => {
    const c = career();
    setStance(c, 'environment', 2);
    expect(forecast(c.career!, 'environment')).toEqual(forecast(c.career!, 'environment', 2));
    expect(meterTarget(c.career!, 'environment', 2)).toBeGreaterThan(meterTarget(c.career!, 'environment', -2));
  });
});
