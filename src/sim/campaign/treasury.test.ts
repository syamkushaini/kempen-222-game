import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { setOrders, startCareer, termIncome, termSpending, termWeek } from './career';
import { statesHeld } from './contests';
import { ALLOCATION, allocation, GOODWILL_EFFECT, govMoney, GRANT_STEP, grantsCost, grantTargets, syncGoodwill, TREASURY_WEEKS, treasuryCap, treasuryOf, treasuryWeek } from './treasury';
import { isValidCampaign } from './validate';
import type { Campaign } from './types';

const [PS, BP, PT] = PARTY_IDS.map((_, i) => i);
const base = getWorld('career')!;
const career = (player = PS, seed = 5): Campaign => startCareer(base, { player, difficulty: 'normal', seed });
const weeks = (c: Campaign, n: number) => { for (let w = 0; w < n; w++) { c.inbox = []; termWeek(base, c); } };

describe('the government’s money', () => {
  it('comes to a government, more to its head than to a partner, and to an opposition not at all', () => {
    const pm = career(PS), partner = career(BP), opposition = career(PT);
    expect(allocation(base, pm)).toBe(govMoney(base, ALLOCATION.pm) + govMoney(base, 2_000) * statesHeld(pm, PS));
    expect(allocation(base, partner)).toBe(govMoney(base, ALLOCATION.partner) + govMoney(base, 2_000) * statesHeld(partner, BP));
    expect(allocation(base, pm)).toBeGreaterThan(allocation(base, partner));
    // A party in opposition at the centre that governs states has only their patronage; one that governs nowhere has nothing.
    expect(allocation(base, opposition)).toBe(govMoney(base, 2_000) * statesHeld(opposition, PT));
    expect(allocation(base, opposition)).toBeGreaterThan(0);
    const nowhere = career(PT);
    nowhere.career!.states = {};
    expect(allocation(base, nowhere)).toBe(0);
    expect(treasuryOf(pm)).toBe(0);
    weeks(pm, 4);
    weeks(opposition, 4);
    weeks(nowhere, 4);
    expect(treasuryOf(pm)).toBeGreaterThan(treasuryOf(opposition));
    expect(treasuryOf(opposition)).toBeGreaterThan(0);
    expect(treasuryOf(nowhere)).toBe(0);
  });

  it('is not the party’s: the allocation does not touch the party’s purse', () => {
    const c = career();
    const funds = c.parties[PS]!.funds;
    const income = termIncome(base, c);
    expect(income.allocation).toBeGreaterThan(0);
    // The party's income is its own sources alone, and what the party has changes by that less what it spends.
    expect(income.total).toBe(income.members + income.donors + income.diverted + income.assets);
    const net = income.total - termSpending(base, c).total;
    weeks(c, 1);
    expect(c.parties[PS]!.funds).toBe(funds + net);
    expect(treasuryOf(c)).toBe(income.allocation);
  });

  it('keeps no more than a half-year of itself', () => {
    const c = career();
    weeks(c, TREASURY_WEEKS * 2);
    expect(treasuryOf(c)).toBeLessThanOrEqual(treasuryCap(base, c));
    expect(treasuryOf(c)).toBeGreaterThan(treasuryCap(base, c) - allocation(base, c));
  });

  it('reaches the party only by being diverted, and no faster than it comes in', () => {
    const c = career();
    setOrders(base, c, { state: 2 });
    const unit = scaled(base, 10_000);
    const before = c.parties[PS]!.funds;
    const income = termIncome(base, c);
    expect(income.diverted).toBe(2 * unit);
    c.career!.treasury = 0;
    weeks(c, 1);
    expect(treasuryOf(c)).toBe(income.allocation - 2 * unit);
    expect(c.parties[PS]!.funds).toBe(before + income.total - termSpending(base, c).total);
    // A treasury with next to nothing in it can divert only what there is.
    const poor = career();
    setOrders(base, poor, { state: 3 });
    poor.career!.treasury = 0;
    expect(treasuryWeek(base, poor)).toBeLessThanOrEqual(allocation(base, poor));
  });

  it('is granted to the places chosen, and wins goodwill there, which shows in the drift of opinion', () => {
    const c = career();
    setOrders(base, c, { grants: 2, focusStates: ['johor'] });
    expect(grantsCost(base, c)).toBe(2 * govMoney(base, GRANT_STEP));
    expect(grantTargets(base, c)).toEqual(['johor']);
    const drift = c.drift.support.state.johor?.[0][PS] ?? 0;
    const others = c.drift.support.state.johor?.[0][BP] ?? 0;
    weeks(c, 10);
    const k = c.career!;
    expect(k.goodwill!.johor).toBeGreaterThan(5);
    expect(k.goodwill!.selangor).toBeUndefined();
    // The goodwill is in what voters think of the party there, with every group, and nowhere else.
    expect(c.drift.support.state.johor[0][PS]).toBeCloseTo(drift + k.goodwill!.johor * GOODWILL_EFFECT, 9);
    expect(c.drift.support.state.johor[0][BP]).toBeCloseTo(others, 9);
    // And it is paid out of the treasury, not the party.
    expect(treasuryOf(c)).toBeGreaterThan(0);
  });

  it('spends no more than the treasury holds, and goodwill fades when it stops', () => {
    const c = career();
    setOrders(base, c, { grants: 3, focusStates: ['johor'] });
    c.career!.treasury = 0;
    c.career!.government.stability = 60;
    const cost = grantsCost(base, c);
    expect(allocation(base, c)).toBeGreaterThanOrEqual(cost - 1);
    weeks(c, 20);
    const peak = c.career!.goodwill!.johor;
    setOrders(base, c, { grants: 0 });
    weeks(c, 30);
    expect(c.career!.goodwill?.johor ?? 0).toBeLessThan(peak * 0.8);
    // Poorly funded: ask for more than comes in and the grants are cut to what there is.
    const tight = career(BP);
    setOrders(base, tight, { grants: 3, focusStates: ['johor'] });
    tight.career!.treasury = 0;
    weeks(tight, 1);
    expect(treasuryOf(tight)).toBeGreaterThanOrEqual(0);
    expect(tight.career!.goodwill!.johor).toBeLessThanOrEqual(3 * scaled(base, GRANT_STEP) / scaled(base, 8_000) + 0.001);
  });

  it('is frozen in an election campaign, and stays behind when the party leaves government', () => {
    const c = career();
    weeks(c, 3);
    const held = treasuryOf(c);
    c.phase = 'campaign';
    expect(allocation(base, c)).toBe(0);
    expect(treasuryWeek(base, c)).toBe(0);
    expect(treasuryOf(c)).toBe(held);
    c.phase = 'term';
    // A party that governs neither at the centre nor in a state has none of it.
    c.career!.government.pm = PT;
    c.career!.government.partners = [];
    c.career!.states = {};
    treasuryWeek(base, c);
    expect(treasuryOf(c)).toBe(0);
  });

  it('puts goodwill back in the drift once, however often opinion is rebuilt', () => {
    const c = career();
    c.career!.goodwill = { johor: 40 };
    const before = c.drift.support.state.johor?.[0][PS] ?? 0;
    syncGoodwill(c);
    syncGoodwill(c);
    expect(c.drift.support.state.johor[0][PS]).toBeCloseTo(before + 40 * GOODWILL_EFFECT, 9);
    c.career!.goodwill = {};
    syncGoodwill(c);
    expect(c.drift.support.state.johor[0][PS]).toBeCloseTo(before, 9);
  });

  it('is kept in a saved game, and a game saved without it still loads', () => {
    const c = career();
    setOrders(base, c, { grants: 1, focusStates: ['johor'] });
    weeks(c, 6);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
    const old = JSON.parse(JSON.stringify(c));
    delete old.career.treasury; delete old.career.goodwill; delete old.career.goodwillApplied; delete old.career.orders.grants;
    expect(isValidCampaign(old, base)).toBe(true);
    const bad = JSON.parse(JSON.stringify(c));
    bad.career.treasury = -5;
    expect(isValidCampaign(bad, base)).toBe(false);
  });
});
