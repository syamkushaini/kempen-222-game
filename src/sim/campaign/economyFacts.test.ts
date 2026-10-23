import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { Rng } from '../rng';
import { startCareer } from './career';
import { steeringFacts, headingFor, weeksToClose } from './economyFacts';
import { ECONOMY_PULL, economyTargets, economyWeek } from './office';

const PS = PARTY_IDS.indexOf('ps');
const world = getWorld('career')!;

describe('what the game says of how hard it is to steer an economy', () => {
  it('is worked out from the numbers the economy runs on', () => {
    const f = steeringFacts();
    expect(f.pull).toBe(Math.round(ECONOMY_PULL * 100));
    // Closing 4% of the gap a week: halfway in about a third of a year, most of the way in about a year.
    expect(f.half).toBe(17);
    expect(f.most).toBe(56);
    expect(weeksToClose(0.5)).toBeLessThan(weeksToClose(0.9));
    // About three years in ten a sector is shocked, by 14 to 26 points, and it takes a year or so to fade.
    expect(f.shockYears).toBe(3);
    expect([f.shockMin, f.shockMax]).toEqual([14, 26]);
    expect(f.fade).toBeGreaterThan(40);
    // The strongest growth lever is small beside the economy, and cannot be used again for a year.
    expect(f.best).toBeGreaterThan(0);
    expect(f.best).toBeLessThanOrEqual(1);
    expect(f.wait).toBeGreaterThanOrEqual(26);
  });

  it('says where growth is heading, which is where the week’s step takes it', () => {
    const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
    const k = c.career!;
    k.economy.growth = 2;
    k.economy.inflation = 5;
    const { now, to } = headingFor(k);
    expect(now).toBe(2);
    expect(to).toBe(economyTargets(k).growth);
    // One week moves growth a fifth of the way to the target, and no more (the rest is a little noise).
    const before = k.economy.growth;
    economyWeek(c, new Rng(1));
    const step = k.economy.growth - before;
    expect(Math.abs(step - (to - before) * ECONOMY_PULL)).toBeLessThan(0.25);
    expect(Math.sign(step)).toBe(Math.sign(to - before));
  });
});
