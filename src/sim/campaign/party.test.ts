import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { invest, skipAhead, startCareer, termIncome, termWeek } from './career';
import {
  ACTIVITIES, HOLDINGS, HOLDING_IDS, activityCost, activityWait, baseRolls, canDoActivity, doActivity, holdingsOf, holdingsYield,
  rollsFactor, rollsOf, rollsTarget, scaleHoldings, trade,
} from './party';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const world = getWorld('career')!;
const career = (seed = 5): Campaign => {
  const c = startCareer(world, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  c.parties[PS]!.funds = scaled(world, 5_000_000);
  return c;
};
const lot = scaled(world, 100_000);

describe('what the party owns', () => {
  it('is bought and sold a lot at a time, by kind, and the total follows', () => {
    const c = career();
    const k = c.career!;
    const funds = c.parties[PS]!.funds;
    expect(trade(world, c, 'hotel', 3)).toBe(true);
    expect(trade(world, c, 'media', 2)).toBe(true);
    expect(holdingsOf(k).hotel).toBe(3 * lot);
    expect(holdingsOf(k).media).toBe(2 * lot);
    expect(k.assets).toBe(5 * lot);
    expect(c.parties[PS]!.funds).toBe(funds - 5 * lot);
    // Selling in a hurry loses a tenth.
    expect(trade(world, c, 'hotel', -1)).toBe(true);
    expect(c.parties[PS]!.funds).toBe(funds - 5 * lot + Math.round(lot * 0.9));
    expect(k.assets).toBe(4 * lot);
    // You cannot sell what you have not got, or buy what you cannot pay for.
    expect(trade(world, c, 'plantation', -1)).toBe(false);
    c.parties[PS]!.funds = 0;
    expect(trade(world, c, 'hotel', 1)).toBe(false);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });

  it('pays by kind: a hotel more than property, a paper less, a college nothing but costs', () => {
    const yieldOf = (id: (typeof HOLDING_IDS)[number]) => { const c = career(); trade(world, c, id, 5); return holdingsYield(c.career!); };
    expect(yieldOf('hotel')).toBeGreaterThan(yieldOf('property'));
    expect(yieldOf('property')).toBeGreaterThan(yieldOf('media'));
    expect(yieldOf('college')).toBeLessThan(0);
    // Plain "investing" is plain property, and pays what it always did.
    const c = career();
    invest(world, c, 5);
    expect(holdingsYield(c.career!)).toBe(Math.round(5 * lot * HOLDINGS.property.yield));
    expect(termIncome(world, c).assets).toBe(holdingsYield(c.career!));
  });

  it('is scaled together when a venture booms or busts', () => {
    const c = career();
    trade(world, c, 'hotel', 2); trade(world, c, 'media', 2);
    scaleHoldings(c.career!, 0.5);
    expect(holdingsOf(c.career!).hotel).toBe(lot);
    expect(c.career!.assets).toBe(2 * lot);
  });

  it('can go wrong: left for years, a hotel and a paper lose some of their value now and then', () => {
    const c = career(9);
    trade(world, c, 'hotel', 8); trade(world, c, 'plantation', 8);
    const before = c.career!.assets;
    // Hold them with nothing else in the way for a few years: a bad week should have come.
    let bad = 0;
    for (let w = 0; w < 400 && c.phase === 'term'; w++) {
      c.inbox = [];
      const was = c.career!.assets;
      termWeek(world, c);
      if (c.career!.assets < was) bad++;
    }
    expect(bad).toBeGreaterThan(0);
    expect(c.career!.assets).not.toBe(before);
  });
});

describe('who belongs', () => {
  it('has an ordinary number to begin with, in proportion to the party’s vote', () => {
    const c = career();
    expect(rollsOf(world, c)).toBe(baseRolls(world, c));
    expect(rollsFactor(world, c)).toBeCloseTo(1, 6);
    expect(baseRolls(world, c)).toBeGreaterThan(10_000);
  });

  it('grows with branches and unity, and with a drive; and brings in more dues', () => {
    const c = career();
    const before = termIncome(world, c).members;
    const target = rollsTarget(world, c);
    expect(doActivity(world, c, 'recruit')).toBe(true);
    expect(rollsOf(world, c)).toBeGreaterThan(baseRolls(world, c));
    expect(rollsTarget(world, c)).toBeGreaterThan(target);
    expect(termIncome(world, c).members).toBeGreaterThan(before);
  });

  it('moves towards what the party deserves, slowly, and not at all faster than a fiftieth a week', () => {
    const c = career();
    c.career!.rolls = baseRolls(world, c) * 2;
    skipAhead(world, c, 1);
    const after = rollsOf(world, c);
    expect(after).toBeLessThan(baseRolls(world, c) * 2);
    expect(after).toBeGreaterThan(baseRolls(world, c) * 1.9);
  });

  it('is carried into the next term with the rest of the career', () => {
    const c = career();
    trade(world, c, 'media', 2);
    doActivity(world, c, 'assembly');
    expect(c.career!.activity).toBeDefined();
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
});

describe('what the party does between elections', () => {
  it('costs money, works once, and then waits', () => {
    const c = career();
    const funds = c.parties[PS]!.funds;
    expect(canDoActivity(world, c, 'assembly')).toEqual({ ok: true });
    expect(doActivity(world, c, 'assembly')).toBe(true);
    expect(c.parties[PS]!.funds).toBe(funds - activityCost(world, 'assembly'));
    expect(canDoActivity(world, c, 'assembly')).toEqual({ ok: false, reason: 'wait' });
    expect(activityWait(c, 'assembly')).toBe(ACTIVITIES.assembly.every);
    expect(doActivity(world, c, 'assembly')).toBe(false);
    c.career!.week += ACTIVITIES.assembly.every;
    expect(canDoActivity(world, c, 'assembly')).toEqual({ ok: true });
  });

  it('is refused without the money', () => {
    const c = career();
    c.parties[PS]!.funds = 0;
    expect(canDoActivity(world, c, 'school')).toEqual({ ok: false, reason: 'funds' });
  });

  it('mends a divided party, and trains the branches', () => {
    const c = career();
    c.parties[PS]!.unity = 40;
    doActivity(world, c, 'assembly');
    expect(c.parties[PS]!.unity).toBe(48);
    const m = c.parties[PS]!.machinery.map((x) => x);
    doActivity(world, c, 'school');
    expect(c.parties[PS]!.machinery.some((x, i) => x > m[i])).toBe(true);
  });
});
