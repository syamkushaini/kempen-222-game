import { describe, expect, it } from 'vitest';
import { getWorld, STATE_SCENARIOS } from '../../data/world';
import { N_BLOCS, N_PARTIES, PARTY_IDS } from '../types';
import { changeCounts, cleanConfig, defaultSimConfig, fieldedParties, focusable, platformEffect, pledgeFits, pledgesIn, simulate, spreadOf, stanceWorth, type SimConfig } from './simulate';

const world = getWorld('career')!;
const P = (id: (typeof PARTY_IDS)[number]) => PARTY_IDS.indexOf(id);
const PS = P('ps'), BP = P('bp'), PT = P('pt'), GBK = P('gbk');
const run = (patch: (c: SimConfig) => void = () => {}, seed = 1) => {
  const c = defaultSimConfig(world);
  c.seed = seed;
  patch(c);
  return simulate(world, c);
};

describe('the simulator', () => {
  it('runs a whole general election to a government and counts every seat', () => {
    const r = run();
    expect(r.seats.reduce((a, b) => a + b, 0)).toBe(222);
    expect(r.share.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 5);
    expect(r.government).not.toBeNull();
    expect(r.trend.length).toBe(r.weeks + 1);
    expect(r.need).toBe(112);
    for (const row of Object.values(r.byState)) expect(row).toHaveLength(N_PARTIES);
  });

  it('is repeatable: the same settings and seed give the same result', () => {
    expect(run().seats).toEqual(run().seats);
    expect(run(() => {}, 7).seats).not.toEqual(run(() => {}, 8).seats);
  });

  it('starts from the real election: a party left as it was loses no ground to moves it did not make', () => {
    const r = run((c) => { c.surprise = 0; c.volatility = 0; });
    // With no drift and no surprise, only the campaign itself and the economy are left to move the result.
    const drift = r.seats.reduce((a, n, p) => a + Math.abs(n - r.before[p]), 0);
    expect(drift).toBeLessThan(80);
  });

  it('answers to the national mood', () => {
    const base = run();
    expect(run((c) => { c.mood[PT] = 8; }).seats[PT]).toBeGreaterThan(base.seats[PT] + 5);
    expect(run((c) => { c.mood[PT] = -8; }).seats[PT]).toBeLessThan(base.seats[PT] - 5);
  });

  it('answers to a state swing, and only in that state', () => {
    const base = run();
    const swung = run((c) => { c.stateSwing.selangor[PT] = 12; });
    expect(swung.byState.selangor[PT]).toBeGreaterThan(base.byState.selangor[PT]);
  });

  it('answers to where a party stands and what it promises', () => {
    const base = run();
    // Dropping every promise costs the votes they were worth.
    expect(run((c) => { c.parties[PT].manifesto = []; }).share[PT]).toBeLessThan(base.share[PT]);
    // A party that swings to the opposite of what it stood for loses the people who liked it where it was.
    const flipped = run((c) => { c.parties[PS].stances = c.parties[PS].stances.map((s) => -s); });
    expect(flipped.share[PS]).not.toBeCloseTo(base.share[PS], 3);
  });

  it('answers to money, to the leader and to the economy', () => {
    const base = run();
    expect(run((c) => { c.parties[PS].funds = 30_000_000; }).seats[PS]).toBeGreaterThan(base.seats[PS]);
    expect(run((c) => { c.parties[PS].leader = [5, 5, 1, 1]; }).share[PS]).not.toBeCloseTo(base.share[PS], 4);
    const slump = run((c) => { c.economy = { growth: -4, inflation: 9, jobless: 9, debt: 100 }; });
    expect(slump.share[base.government!.pm]).toBeLessThan(base.share[base.government!.pm]);
  });

  it('puts pacts into the seats', () => {
    const none = run((c) => { c.freePacts = false; });
    const pact = run((c) => { c.freePacts = false; c.pacts = [{ a: PS, b: BP, mode: 'stronger' }]; });
    expect(pact.pactSeats).toBeGreaterThan(none.pactSeats);
  });

  it('lets any party be the one in focus, and still forms a government', () => {
    for (const p of focusable(world)) {
      const r = run((c) => { c.focus = p; });
      expect(r.government, PARTY_IDS[p]).not.toBeNull();
      expect(r.seats.reduce((a, b) => a + b, 0)).toBe(222);
    }
  });

  it('forms a government whoever is in focus, and a party with few seats does not block the talks', () => {
    const r = run((c) => { c.focus = GBK; });
    expect(r.government!.claimants).not.toContain(GBK);
  });

  it('mends a config that is damaged or from elsewhere', () => {
    const c = cleanConfig(world, { seed: 'x', mood: [100, -100], parties: [{ stances: [9, 9], manifesto: ['nonsense', 'cashAid', 'cashAid'] }], focus: 99, weeks: 3 });
    expect(c.mood[0]).toBe(15);
    expect(c.mood[1]).toBe(-15);
    expect(c.mood[2]).toBe(0);
    expect(c.parties[0].stances[0]).toBe(2);
    expect(c.parties[0].manifesto).toEqual(['cashAid']);
    expect(focusable(world)).toContain(c.focus);
    expect(c.weeks).toBe(3);
    expect(cleanConfig(world, null).blocSwing).toHaveLength(N_BLOCS);
    expect(cleanConfig(world, JSON.parse(JSON.stringify(defaultSimConfig(world))))).toEqual(defaultSimConfig(world));
  });

  it('runs a state election too, with only a state\'s promises on offer', () => {
    const perak = getWorld('career:perak')!;
    const cfg = defaultSimConfig(perak);
    expect(cfg.focus).toBe(focusable(perak)[0]);
    for (const m of pledgesIn('career:perak')) expect(typeof m).toBe('string');
    expect(pledgesIn('career:perak')).not.toContain('fuelSubsidy');
    const r = simulate(perak, cfg);
    expect(r.seats.reduce((a, b) => a + b, 0)).toBe(59);
    expect(r.government).not.toBeNull();
    expect(fieldedParties(perak).length).toBeGreaterThan(2);
  });

  it('runs every state', () => {
    for (const st of STATE_SCENARIOS) {
      const w = getWorld(`career:${st}`)!;
      const r = simulate(w, defaultSimConfig(w));
      expect(r.seats.reduce((a, b) => a + b, 0), st).toBe(w.seats.length);
    }
  }, 120_000);

  it('sums up many runs', () => {
    const rs = [1, 2, 3, 4, 5].map((s) => run(() => {}, s));
    const sp = spreadOf(rs, [PS, BP, PT]);
    expect(sp.runs).toBe(5);
    expect(sp.seats[PS].low).toBeLessThanOrEqual(sp.seats[PS].mean);
    expect(sp.seats[PS].high).toBeGreaterThanOrEqual(sp.seats[PS].mean);
    expect(sp.pm.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 5);
    expect(sp.histogram[PS].reduce((a, b) => a + b, 0)).toBe(5);
  });

  it('counts what has been changed, by part of the set-up', () => {
    const base = defaultSimConfig(world);
    expect(changeCounts(base, base).total).toBe(0);
    const c = structuredClone(base);
    c.mood[PT] = 3;
    c.parties[PS].leader[0] = 5;
    c.pacts.push({ a: PS, b: BP, mode: 'targeted' });
    c.weeks = 6;
    const n = changeCounts(c, base);
    expect(n).toMatchObject({ conditions: 1, parties: 1, coalition: 1, setup: 1, total: 4 });
  });

  it('prices a platform in points of support, and none for a party left where it was', () => {
    const base = defaultSimConfig(world);
    for (const p of fieldedParties(world)) expect(platformEffect(world, base, p)).toBeCloseTo(0, 9);
    const moved = structuredClone(base);
    moved.parties[PS].stances = moved.parties[PS].stances.map((s) => -s);
    expect(platformEffect(world, moved, PS)).not.toBeCloseTo(0, 3);
    // A party nobody believes gets less from the same move, for better or worse.
    const doubted = structuredClone(moved);
    doubted.parties[PS].credibility = 0;
    expect(Math.abs(platformEffect(world, doubted, PS))).toBeLessThan(Math.abs(platformEffect(world, moved, PS)));
    expect(stanceWorth(world, base, PS, 0, base.parties[PS].stances[0])).toBeCloseTo(0, 9);
  });

  it('says whether a promise fits where the party stands', () => {
    const base = defaultSimConfig(world);
    expect(pledgeFits(base, PS, 'cashAid')).toBe(true);
    const c = structuredClone(base);
    const subsidies = 0;
    c.parties[PS].stances[subsidies] = -2;
    expect(pledgeFits(c, PS, 'fuelSubsidy')).toBe(false);
    c.parties[PS].stances[subsidies] = 2;
    expect(pledgeFits(c, PS, 'fuelSubsidy')).toBe(true);
  });
});
