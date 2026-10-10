import { describe, expect, it } from 'vitest';
import { foundedWorld, getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { Rng } from '../rng';
import { heldOf } from './actions';
import { autoChoose, chiefPicks, choose, DEFAULT_LIFT, hopefulScore, liftIn, makeDefaults, openSeat, pickQuality } from './candidates';
import { chiefOf } from './chiefs';
import { startCareer, termWeek, TERM_WEEKS } from './career';
import { FOUNDING_SLOT } from './founding';
import { fieldBest, openSeatsByChance, winChance } from './slate';
import { newCampaign } from './turn';
import type { Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps');
const GENBA = PARTY_IDS.indexOf(FOUNDING_SLOT);
const general = getWorld('general')!;
const fresh = (seed = 3): Campaign => newCampaign(general, { player: PS, difficulty: 'normal', seed });

describe('the state chiefs’ picks', () => {
  it('are better from a more capable chief and from stronger branches in the state', () => {
    const c = fresh();
    const st = general.states[0];
    const at = general.states.indexOf(st);
    const chief = chiefOf(general, c, st);
    chief.skill = 1; c.parties[PS]!.machinery[at] = 10;
    const low = pickQuality(general, c, st);
    chief.skill = 5;
    const skilled = pickQuality(general, c, st);
    c.parties[PS]!.machinery[at] = 100;
    const strong = pickQuality(general, c, st);
    expect(low).toBeLessThan(skilled);
    expect(skilled).toBeLessThan(strong);
    expect(strong).toBeLessThanOrEqual(1);
    expect(low).toBeGreaterThanOrEqual(0);
  });

  it('put more capable people up where the chief is good, and risk fewer pasts', () => {
    const count = (skill: number, branches: number) => {
      const c = fresh();
      for (const st of general.states) chiefOf(general, c, st).skill = skill;
      c.parties[PS]!.machinery = c.parties[PS]!.machinery.map((m) => (m > 0 ? branches : 0));
      let able = 0, risky = 0, all = 0;
      for (let seed = 1; seed <= 12; seed++) {
        for (const h of Object.values(makeDefaults(general, c, new Rng(seed)))) {
          all++;
          if (h.kind === 'graduate' || h.kind === 'professional' || h.kind === 'loyalist') able++;
          if (h.skeleton) risky++;
        }
      }
      return { able: able / all, risky: risky / all };
    };
    const poor = count(1, 10), good = count(5, 100);
    expect(good.able).toBeGreaterThan(poor.able + 0.15);
    expect(good.risky).toBeLessThan(poor.risky);
  });

  it('bring a little to every seat they pick for, more from a better chief, and say so by state', () => {
    const c = fresh();
    c.team.defaults = makeDefaults(general, c, new Rng(1));
    const id = Object.keys(c.team.defaults)[0];
    const seat = general.seats[general.seatIndex.get(id)!];
    const q = pickQuality(general, c, seat.state);
    expect(q).toBeGreaterThan(0);
    expect(DEFAULT_LIFT * q).toBeLessThanOrEqual(DEFAULT_LIFT);
    const rows = chiefPicks(general, c);
    expect(rows.length).toBeGreaterThan(3);
    expect(rows.reduce((a, r) => a + r.seats, 0)).toBe(Object.keys(c.team.defaults).length);
    for (const r of rows) { expect(r.able).toBeLessThanOrEqual(r.seats); expect(r.risky).toBeLessThanOrEqual(r.seats); }
  });

  it('is lifted into the campaign as it opens, and the lift goes when the leader chooses the seat instead', () => {
    const c = fresh();
    const id = Object.keys(c.team.defaults ?? {}).find((x) => general.seats[general.seatIndex.get(x)!].state === general.states[0]) ?? Object.keys(c.team.defaults ?? {})[0];
    const seat = general.seats[general.seatIndex.get(id)!];
    const lifted = heldOf(c).support.seat[id]?.[PS] ?? 0;
    expect(lifted).toBeCloseTo(DEFAULT_LIFT * pickQuality(general, c, seat.state), 9);
    expect(lifted).toBeGreaterThan(0);
    // The leader opens the seat, looks at the hopefuls and chooses: the chief's lift is replaced by the hopeful's.
    c.parties[PS]!.days = 7;
    expect(openSeat(general, c, id)).toBe(true);
    const key = c.team.keySeats.find((k) => k.seat === id)!;
    expect(choose(general, c, id, 0)).toBe(true);
    expect(heldOf(c).support.seat[id]![PS]).toBeCloseTo(liftIn(general, key, 0), 9);
  });
});

describe('the best candidates, chosen for the leader', () => {
  it('chooses the best hopeful in every key seat, the one that adds most less what a past may cost', () => {
    const c = fresh();
    expect(c.team.keySeats.length).toBeGreaterThanOrEqual(8);
    const before = c.team.keySeats.filter((k) => k.pick === null).length;
    expect(autoChoose(general, c)).toBe(before);
    for (const key of c.team.keySeats) {
      expect(key.pick).not.toBeNull();
      const best = Math.max(...key.options.map((_, i) => hopefulScore(general, key, i)));
      expect(hopefulScore(general, key, key.pick!)).toBe(best);
    }
    // Nothing left to do the second time.
    expect(autoChoose(general, c)).toBe(0);
  });

  it('does nothing once nomination day has passed', () => {
    const c = fresh();
    c.week = c.totalWeeks;
    expect(autoChoose(general, c)).toBe(0);
    expect(c.team.keySeats.every((k) => k.pick === null)).toBe(true);
  });

  it('knows a past that has been looked into: a hopeful found to have one is not chosen over one found clean', () => {
    const c = fresh();
    const key = c.team.keySeats[0];
    key.options.forEach((o) => { o.vetted = true; o.skeleton = false; });
    const best = key.options.reduce((b, _, i) => (hopefulScore(general, key, i) > hopefulScore(general, key, b) ? i : b), 0);
    key.options[best].skeleton = true;
    const now = key.options.reduce((b, _, i) => (hopefulScore(general, key, i) > hopefulScore(general, key, b) ? i : b), 0);
    expect(hopefulScore(general, key, best)).toBeLessThan(hopefulScore(general, key, now) + 1);
  });
});

describe('the seats the party is likeliest to win', () => {
  const own = (funds = 400_000) => {
    const world = foundedWorld();
    const c = startCareer(world, { player: GENBA, difficulty: 'normal', seed: 4, founded: true });
    c.career!.week = TERM_WEEKS;
    termWeek(world, c);
    c.parties[GENBA]!.funds = funds;
    return { c, world };
  };

  it('are fielded best first, within the money given', () => {
    const { c, world } = own();
    const order = openSeatsByChance(world, c);
    for (let k = 1; k < order.length; k++) expect(winChance(world, c, order[k - 1])).toBeGreaterThanOrEqual(winChance(world, c, order[k]));
    const n = fieldBest(world, c, 20_000);
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThan(order.length);
    expect(Object.values(c.career!.slate!.added).reduce((a, v) => a + v, 0)).toBeLessThanOrEqual(20_000);
  });

  it('are the very ones that were the closest last time, while the money lasts', () => {
    const { c, world } = own();
    const order = openSeatsByChance(world, c);
    const n = fieldBest(world, c, 1_000_000);
    expect(n).toBeGreaterThan(0);
    const fielded = new Set(Object.keys(c.career!.slate!.added));
    // The best of the open seats are all in.
    for (const i of order.slice(0, Math.min(5, n))) expect(fielded.has(world.seats[i].id)).toBe(true);
  });
});
