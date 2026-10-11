import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer, termWeek } from './career';
import { TREND_EVERY, TREND_KEEP } from './trend';

const world = getWorld('career')!;

describe('the economy’s figures, kept a month at a time', () => {
  it('writes a point every fourth week, with the sectors, and keeps a bounded number', () => {
    const c = startCareer(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5 });
    for (let w = 0; w < TREND_EVERY * 3; w++) { c.inbox = []; termWeek(world, c); }
    const t = c.career!.trend!;
    expect(t).toHaveLength(3);
    expect(t.map((p) => p.week)).toEqual([4, 8, 12]);
    expect(t[0].sectors).toHaveLength(4);
    expect(t[0].debt).toBeGreaterThan(30);
    for (let w = 0; w < TREND_EVERY * (TREND_KEEP + 5); w++) { c.inbox = []; if (c.phase !== 'term') break; termWeek(world, c); }
    expect(c.career!.trend!.length).toBeLessThanOrEqual(TREND_KEEP);
  });
});
