import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { majorityLine } from '../election';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { startCareer } from './career';
import { houseTally } from './contests';
import { CROSS_GAP, CROSS_MONEY, BAN_FACTOR, canCross, crossChance, crossCount, crossTheFloor, seatsHeldBy } from './crossing';
import { confidenceCount } from './govern';
import { isValidCampaign } from './validate';
import type { Campaign } from './types';

const world = getWorld('career')!;
const [PS, PT, BP] = ['ps', 'pt', 'bp'].map((id) => PARTY_IDS.indexOf(id as never));

/** An opposition game: the player is PT, PS heads the government, the term is old enough, and the government is shaky. */
const opposition = (seed = 5): Campaign => {
  const c = startCareer(world, { player: PT, difficulty: 'normal', seed });
  c.inbox = [];
  const k = c.career!;
  k.week = 60;
  k.government.stability = 55;
  c.parties[PT]!.funds = scaled(world, 10_000_000);
  return c;
};

describe('bringing members across the floor', () => {
  it('is for an opposition against a shaky government, not too soon, not too often, not without the money', () => {
    const c = opposition();
    expect(canCross(world, c, PS, 1).ok).toBe(true);
    expect(canCross(world, c, PT, 1)).toMatchObject({ ok: false, reason: 'target' });
    c.career!.week = 10;
    expect(canCross(world, c, PS, 1)).toMatchObject({ ok: false, reason: 'early' });
    c.career!.week = 60;
    c.career!.government.stability = 90;
    expect(canCross(world, c, PS, 1)).toMatchObject({ ok: false, reason: 'steady' });
    c.career!.government.stability = 55;
    c.parties[PT]!.funds = 1;
    expect(canCross(world, c, PS, 1)).toMatchObject({ ok: false, reason: 'funds' });
    const gov = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 });
    gov.career!.week = 60; gov.career!.government.stability = 55;
    expect(canCross(world, gov, PS, 1)).toMatchObject({ ok: false, reason: 'inGovernment' });
  });

  it('costs the offer, and can be tried only once in a while', () => {
    const c = opposition();
    const funds = c.parties[PT]!.funds;
    expect(crossTheFloor(world, c, PS, 2)).not.toBeNull();
    expect(c.parties[PT]!.funds).toBe(funds - scaled(world, CROSS_MONEY) * 2);
    expect(canCross(world, c, PS, 1)).toMatchObject({ ok: false, reason: 'wait', weeks: CROSS_GAP });
    c.career!.week += CROSS_GAP;
    expect(canCross(world, c, PS, 1).ok).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });

  it('works and fails: when it works the seats become the player’s, and the government is shaken or falls', () => {
    let worked = 0, failed = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const c = opposition(seed);
      const k = c.career!;
      c.career!.week = 40 + seed;
      const before = houseTally(world, c);
      const n = crossCount(world, c, PS, 4);
      const result = crossTheFloor(world, c, PS, 4);
      const after = houseTally(world, c);
      if (result === 'shaken' || result === 'fell') {
        worked++;
        expect(before[PS] - after[PS]).toBe(n);
        expect(after[PT] - before[PT]).toBe(n);
        if (result === 'shaken') expect(k.government.stability).toBeLessThan(59);
        expect(c.news.some((x) => x.key.startsWith('news.cross.'))).toBe(true);
      } else {
        failed++;
        expect(after).toEqual(before);
        expect(['failed', 'leaked']).toContain(result);
      }
    }
    expect(worked).toBeGreaterThan(0);
    expect(failed).toBeGreaterThan(0);
  });

  it('brings a government down when it loses its majority, and the talks open; otherwise it is only shaken', () => {
    let fell = 0, shaken = 0;
    for (let seed = 1; seed <= 80; seed++) {
      const weak = opposition(seed);
      weak.career!.week = 40 + seed;
      expect(confidenceCount(world, weak)).toBeGreaterThanOrEqual(majorityLine(world));
      const r1 = crossTheFloor(world, weak, PS, 4);
      if (r1 === 'fell') {
        fell++;
        expect(confidenceCount(world, weak)).toBeLessThan(majorityLine(world));
        expect(weak.phase).toBe('formation');
      }
      // A government with a majority to spare, steady but only just inside the margin, is shaken and not brought down by a small party's members.
      const strong = opposition(seed);
      strong.career!.week = 40 + seed;
      strong.career!.government.stability = 70;
      for (const id of seatsHeldBy(world, strong, PS).slice(-8)) (strong.career!.house ??= {})[id] = PT;
      const r2 = crossTheFloor(world, strong, BP, 1);
      if (r2 === 'shaken') { shaken++; expect(confidenceCount(world, strong)).toBeGreaterThanOrEqual(majorityLine(world)); expect(strong.phase).toBe('term'); }
    }
    expect(fell).toBeGreaterThan(0);
    expect(shaken).toBeGreaterThan(0);
  });

  it('is likelier with a larger offer and with a divided party, and far less likely once the law against changing parties is passed', () => {
    const c = opposition();
    expect(crossChance(world, c, PS, 2)).toBeGreaterThan(crossChance(world, c, PS, 1));
    expect(crossChance(world, c, PS, 4)).toBeGreaterThan(crossChance(world, c, PS, 2));
    expect(crossCount(world, c, PS, 4)).toBeGreaterThan(crossCount(world, c, PS, 1));
    const united = crossChance(world, c, PS, 1);
    c.parties[PS]!.unity = 20;
    expect(crossChance(world, c, PS, 1)).toBeGreaterThan(united);
    const open = crossChance(world, c, PS, 1);
    (c.career!.laws ??= []).push('partyHopBan');
    expect(crossChance(world, c, PS, 1)).toBeCloseTo(open * BAN_FACTOR, 5);
  });
});
