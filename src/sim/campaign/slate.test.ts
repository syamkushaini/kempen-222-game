import { describe, expect, it } from 'vitest';
import { foundedWorld, getWorld, ownWorld, worldOf } from '../../data/world';
import { projectElection } from '../election';
import { emptyDynamics } from '../dynamics';
import { redistribute, STANDS, WITHDRAWN } from '../transfer';
import { PARTY_IDS } from '../types';
import { canDo } from './actions';
import { layerPins } from './layers';
import { nextTerm, startCareer, termWeek, TERM_WEEKS } from './career';
import { pactSeats, nominationWeek } from './diplomacy';
import { endDay } from './formation';
import { FOUNDING_SLOT } from './founding';
import { canField, closeSlate, fieldCheapest, fieldedSeats, fieldSeat, fieldWithin, isOwn, nominationCost, nominationsOpen, openSeats, slateSpent, withdrawSeat } from './slate';
import { closeNight, endWeek } from './turn';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const [PS, BP] = PARTY_IDS.map((_, i) => i);
const GENBA = PARTY_IDS.indexOf(FOUNDING_SLOT);
const base = getWorld('career')!;

/** A founded party at the start of its first campaign, with money in the bank. */
const founded = (funds = 100_000): { c: Campaign; world: ReturnType<typeof foundedWorld> } => {
  const world = foundedWorld();
  const c = startCareer(world, { player: GENBA, difficulty: 'normal', seed: 4, founded: true });
  c.parties[GENBA]!.funds = funds;
  c.career!.week = TERM_WEEKS;
  termWeek(world, c);
  c.parties[GENBA]!.funds = funds;
  return { c, world };
};
/** Pakatan Sinar made the player's own: it stands where it stood, and may stand elsewhere. */
const takeover = (funds = 100_000) => {
  const world = ownWorld('career', PS)!;
  const held = base.seats.filter((_, i) => base.baseline.contesting[i][PS]).map((s) => s.id);
  const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 4, own: true, held });
  c.career!.week = TERM_WEEKS;
  termWeek(world, c);
  c.parties[PS]!.funds = funds;
  return { c, world, held };
};

describe('what a seat costs a party the player made', () => {
  it('is dearer for more voters and in a city, scales with the contest, and is never nothing', () => {
    const costs = base.seats.map((_, i) => nominationCost(base, i));
    expect(Math.min(...costs)).toBeGreaterThanOrEqual(1_000);
    expect(Math.max(...costs)).toBeGreaterThan(Math.min(...costs) * 2);
    const big = base.seats.reduce((a, s, i) => (s.electorate > base.seats[a].electorate ? i : a), 0);
    const small = base.seats.reduce((a, s, i) => (s.electorate < base.seats[a].electorate ? i : a), 0);
    expect(nominationCost(base, big)).toBeGreaterThan(nominationCost(base, small));
    const dun = getWorld('state:selangor')!;
    for (let i = 0; i < dun.seats.length; i++) expect(nominationCost(dun, i)).toBeLessThan(nominationCost(base, big));
    expect(nominationCost(dun, 0)).toBeGreaterThanOrEqual(100);
  });
});

describe('a founded party’s slate', () => {
  it('starts with no candidates: every seat is unfielded until paid for', () => {
    const { c, world } = founded();
    expect(isOwn(c)).toBe(true);
    expect(c.phase).toBe('campaign');
    expect(nominationsOpen(c)).toBe(true);
    expect(fieldedSeats(world, c)).toHaveLength(0);
    expect(openSeats(world, c)).toHaveLength(world.seats.length);
    expect(Object.values(c.standDowns).every((row) => row[GENBA] === WITHDRAWN)).toBe(true);
    // Not a pact, though it is in the same list.
    expect(pactSeats(c)).toBe(0);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });

  it('puts a candidate in a seat for what it costs, and takes them back for the same', () => {
    const { c, world } = founded(50_000);
    const seat = world.seats[10];
    const cost = nominationCost(world, 10);
    expect(fieldSeat(world, c, seat.id)).toBe(true);
    expect(c.parties[GENBA]!.funds).toBe(50_000 - cost);
    expect(fieldedSeats(world, c)).toEqual([10]);
    expect(slateSpent(c)).toBe(cost);
    expect(fieldSeat(world, c, seat.id)).toBe(false);
    expect(withdrawSeat(world, c, seat.id)).toBe(true);
    expect(c.parties[GENBA]!.funds).toBe(50_000);
    expect(fieldedSeats(world, c)).toHaveLength(0);
    expect(withdrawSeat(world, c, seat.id)).toBe(false);
  });

  it('cannot field more than the party can afford', () => {
    const { c, world } = founded(0);
    const cheap = openSeats(world, c)[0];
    c.parties[GENBA]!.funds = nominationCost(world, cheap) - 1;
    expect(fieldSeat(world, c, world.seats[cheap].id)).toBe(false);
    c.parties[GENBA]!.funds = 20_000;
    const n = fieldCheapest(world, c, 500);
    expect(n).toBeGreaterThan(3);
    expect(fieldedSeats(world, c)).toHaveLength(n);
    expect(c.parties[GENBA]!.funds).toBe(20_000 - slateSpent(c));
    expect(c.parties[GENBA]!.funds).toBeLessThan(nominationCost(world, openSeats(world, c)[0]));
    // The cheapest were the ones taken.
    const taken = fieldedSeats(world, c).map((i) => nominationCost(world, i));
    const left = openSeats(world, c).map((i) => nominationCost(world, i));
    expect(Math.max(...taken)).toBeLessThanOrEqual(Math.min(...left));
  });

  it('can be filled within a budget, and only until nomination day', () => {
    const { c, world } = founded(200_000);
    fieldWithin(world, c, 10_000);
    expect(slateSpent(c)).toBeLessThanOrEqual(10_000);
    expect(slateSpent(c)).toBeGreaterThan(5_000);
    while (c.week <= nominationWeek(c)) endWeek(world, c);
    expect(nominationsOpen(c)).toBe(false);
    expect(fieldSeat(world, c, openSeats(world, c).map((i) => world.seats[i].id)[0])).toBe(false);
    expect(withdrawSeat(world, c, Object.keys(c.career!.slate!.added)[0])).toBe(false);
  });

  it('keeps an unfielded seat off the ballot: no actions there, no votes, and its voters go elsewhere', () => {
    const { c, world } = founded(200_000);
    const fielded = world.seats[5].id, left = world.seats[6].id;
    fieldSeat(world, c, fielded);
    expect(canDo(world, c, GENBA, 'ceramah', { seat: left })).toMatchObject({ ok: false, reason: 'notContesting' });
    const out = projectElection(world, emptyDynamics(), c.standDowns);
    expect(out.seats[6].votes[GENBA]).toBe(0);
    expect(out.seats[5].votes[GENBA]).toBeGreaterThan(0);
    // The seat is still decided: someone else wins it.
    expect(out.seats[6].winner).not.toBe(GENBA);
  });

  it('carries the seats it stood in to the next campaign, and may stand again where it did not', () => {
    const { c, world } = founded(300_000);
    fieldWithin(world, c, 100_000);
    const stood = fieldedSeats(world, c).map((i) => world.seats[i].id);
    expect(stood.length).toBeGreaterThan(20);
    while (c.phase === 'campaign') endWeek(world, c);
    closeNight(world, c);
    for (let d = 0; d < 10 && c.phase === 'formation'; d++) endDay(world, c);
    expect(nextTerm(world, c)).toBe(true);
    expect(c.career!.slate!.held.sort()).toEqual([...stood].sort());
    const next = worldOf(c)!;
    // Every seat can be fielded again: where it did not stand, the result remembers the votes it would have had.
    // A party with no seats after its first election may be wiped out; carry on regardless, to see the second slate.
    c.career!.ending = null;
    c.career!.week = TERM_WEEKS;
    c.inbox = [];
    termWeek(next, c);
    expect(c.phase).toBe('campaign');
    expect(fieldedSeats(next, c).map((i) => next.seats[i].id).sort()).toEqual([...stood].sort());
    expect(openSeats(next, c)).toHaveLength(next.seats.length - stood.length);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), next)).toBe(true);
  });
});

describe('a party made one’s own', () => {
  it('keeps the seats the party stood in, and is offered the rest', () => {
    const { c, world, held } = takeover();
    expect(worldOf(c)).toBe(world);
    expect(held.length).toBeLessThan(base.seats.length);
    expect(fieldedSeats(world, c)).toHaveLength(held.length);
    expect(openSeats(world, c)).toHaveLength(base.seats.length - held.length);
    // Everywhere the original stood is free, and the others can be bought.
    const extra = openSeats(world, c)[0];
    expect(canField(world, c, extra)).toBe(true);
    expect(fieldSeat(world, c, world.seats[extra].id)).toBe(true);
    expect(fieldedSeats(world, c)).toHaveLength(held.length + 1);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });

  it('leaves other parties exactly where they were', () => {
    const { world } = takeover();
    for (const p of [BP, 2, 3]) expect(world.baseline.contesting.map((m) => m[p])).toEqual(base.baseline.contesting.map((m) => m[p]));
  });

  it('does nothing to a party that is not the player’s own', () => {
    const c = startCareer(base, { player: PS, difficulty: 'normal', seed: 4 });
    expect(isOwn(c)).toBe(false);
    c.career!.week = TERM_WEEKS;
    termWeek(base, c);
    expect(c.standDowns).toEqual({});
    expect(nominationsOpen(c)).toBe(false);
    expect(fieldSeat(base, c, base.seats[0].id)).toBe(false);
  });
});

describe('a party that stands aside for nobody', () => {
  it('sends its voters home or to whoever is left, and leaves a partner’s share alone', () => {
    const shares = [0.3, 0.2, 0.4, 0.1];
    const total = (a: number[]) => a.reduce((x, y) => x + y, 0);
    const out = [...shares];
    redistribute(out, [WITHDRAWN, STANDS, STANDS, STANDS]);
    expect(out[0]).toBe(0);
    for (let i = 1; i < 4; i++) expect(out[i]).toBeGreaterThan(shares[i]);
    // Some of them stay at home: the rest are a bit less than all of what it had.
    expect(total(out)).toBeLessThan(total(shares));
    expect(total(out)).toBeGreaterThan(total(shares) - 0.3 * 0.25);
    // A pact is not changed by this.
    const pact = [...shares];
    redistribute(pact, [1, STANDS, STANDS, STANDS]);
    expect(pact[1]).toBeGreaterThan(shares[1] + 0.3 * 0.3);
  });

  it('does not hand votes to a partner with no candidate of its own', () => {
    const shares = [0.3, 0.2, 0.4, 0.1];
    const total = (a: number[]) => a.reduce((x, y) => x + y, 0);
    // The partner has itself stood aside, whichever of the two is counted first.
    for (const stood of [[1, 2, STANDS, STANDS], [STANDS, 0, 1, STANDS]]) {
      const out = [...shares];
      redistribute(out, stood);
      stood.forEach((v, p) => { if (v !== STANDS) expect(out[p], String(stood)).toBe(0); });
      expect(total(out)).toBeGreaterThan(0.75 * total(shares));
    }
    // The partner is not on the ballot at all.
    const off = [...shares];
    redistribute(off, [1, STANDS, STANDS, STANDS], [true, false, true, true]);
    expect(off[0]).toBe(0);
    expect(off[1]).toBe(shares[1]);
    expect(off[2] + off[3]).toBeCloseTo(shares[2] + shares[3] + 0.3 * 0.8, 10);
  });

  it('closes a slate that carries on across terms', () => {
    const { c, world } = founded(100_000);
    fieldCheapest(world, c, 5);
    closeSlate(world, c);
    expect(c.career!.slate!.held).toHaveLength(5);
    expect(c.career!.slate!.added).toEqual({});
  });
});

describe('the map layer for seats the party contests', () => {
  const view = (world: ReturnType<typeof foundedWorld>, c: Campaign) => ({
    world, campaign: c, display: world.seats.map(() => ({ winner: 0, margin: 0.2, cls: 'safe', stale: false })), last: world.seats.map(() => ({ winner: 0 })),
  });

  it('puts a flag on each seat with a candidate, and none where there is not one', () => {
    const { c, world } = founded(100_000);
    expect(layerPins(view(world, c), new Set(['fielded']))).toEqual([]);
    fieldSeat(world, c, world.seats[3].id);
    fieldSeat(world, c, world.seats[8].id);
    const pins = layerPins(view(world, c), new Set(['fielded']));
    expect(pins.map((p) => p.seat).sort()).toEqual([world.seats[3].id, world.seats[8].id].sort());
    expect(pins.every((p) => p.kind === 'flag' && p.party === GENBA)).toBe(true);
  });

  it('is for a party the player made: nothing for the rest', () => {
    const c = startCareer(base, { player: PS, difficulty: 'normal', seed: 4 });
    expect(layerPins(view(base as never, c), new Set(['fielded']))).toEqual([]);
  });
});

describe('in a career in one state', () => {
  it('works on the assembly’s seats, at assembly prices', () => {
    const id = 'career:kelantan';
    const base = getWorld(id)!;
    const p = PARTY_IDS.indexOf('ps');
    const world = ownWorld(id, p)!;
    expect(world.id).toBe(id);
    const held = base.seats.filter((_, i) => base.baseline.contesting[i][p]).map((s) => s.id);
    const c = startCareer(world, { player: p, difficulty: 'normal', seed: 4, own: true, held });
    c.career!.week = TERM_WEEKS;
    c.inbox = [];
    termWeek(world, c);
    expect(c.phase).toBe('campaign');
    c.parties[p]!.funds = 30_000;
    const open = openSeats(world, c);
    expect(open).toHaveLength(world.seats.length - held.length);
    if (open.length > 0) {
      expect(nominationCost(world, open[0])).toBeLessThan(nominationCost(getWorld('career')!, 0) * 1.5);
      expect(fieldCheapest(world, c, 5)).toBeGreaterThan(0);
    }
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
});
