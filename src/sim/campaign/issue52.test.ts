import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { nextTerm, startCareer, termWeek, TERM_WEEKS } from './career';
import { endDay } from './formation';
import { ASSET_UNIT, holdingsWeek } from './party';
import { scaled } from './actions';
import { spendingLimit } from './spending';
import { closeNight, endWeek } from './turn';

const world = getWorld('career')!;
const PS = PARTY_IDS.indexOf('ps');
const career = () => startCareer(world, { player: PS, difficulty: 'normal', seed: 3 });

describe('what the player was not told (issue 52)', () => {
  it('says when the party’s businesses lose money, how much and why', () => {
    const c = career();
    const k = c.career!;
    k.assets = scaled(world, ASSET_UNIT) * 120;
    const start = k.assets;
    const rng = new Rng(11);
    for (let w = 0; w < 600 && !k.lastLoss; w++) { k.week = w + 1; holdingsWeek(world, c, rng); }
    expect(k.lastLoss).toBeDefined();
    expect(['probe', 'luck']).toContain(k.lastLoss!.why);
    expect(k.lastLoss!.rm).toBeGreaterThan(0);
    expect(k.assets).toBeLessThan(start);
  });

  it('remembers the seats the courts took on petition, so the desk can explain a majority that shrank', () => {
    const c = career();
    const k = c.career!;
    k.week = TERM_WEEKS;
    termWeek(world, c);
    expect(c.phase).toBe('campaign');
    // a party far past the limit, and found out
    const pc = c.parties[PS]!;
    pc.fined = true;
    pc.spent = spendingLimit(world) * 2;
    while (c.phase === 'campaign') { pc.spent = Math.max(pc.spent, spendingLimit(world) * 2); endWeek(world, c); }
    closeNight(world, c);
    for (let d = 0; d < 10 && c.phase === 'formation'; d++) endDay(world, c);
    expect(nextTerm(world, c)).toBe(true);
    const n = c.career!;
    expect(n.petitioned?.n).toBeGreaterThan(0);
    expect(n.petitioned!.seats).toHaveLength(n.petitioned!.n);
  });
});
