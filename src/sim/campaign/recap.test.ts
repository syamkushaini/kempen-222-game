import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { closeSeats, makeRecap } from './recap';
import { endWeek, newCampaign, playerAct } from './turn';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps'), BP = PARTY_IDS.indexOf('bp');
const world = getWorld('state:perak')!;
const fresh = (seed = 3) => newCampaign(world, { player: PS, difficulty: 'normal', seed });

describe('the look back at last week', () => {
  it('is absent in the first week and written when a week ends', () => {
    const c = fresh();
    expect(c.recap).toBeUndefined();
    playerAct(world, c, 'ceramah', { seat: world.seats[0].id });
    const daysLeft = c.parties[PS]!.days;
    const spent = c.parties[PS]!.spent;
    endWeek(world, c);
    expect(c.recap).toMatchObject({ week: 1, daysLeft, spent });
    expect(c.recap!.daysTotal).toBeGreaterThanOrEqual(daysLeft);
    expect(c.recap!.mine).toEqual([world.seats[0].id]);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });

  it('counts each week’s spending on its own', () => {
    const c = fresh();
    playerAct(world, c, 'ceramah', { seat: world.seats[0].id });
    endWeek(world, c);
    const first = c.recap!;
    playerAct(world, c, 'ceramah', { seat: world.seats[1].id });
    const spentBefore = c.parties[PS]!.spent;
    endWeek(world, c);
    expect(c.recap!.week).toBe(2);
    expect(c.recap!.spentToDate).toBe(spentBefore);
    expect(c.recap!.spent).toBe(spentBefore - first.spentToDate);
  });

  it('names a close seat a rival visited and the player did not, and nothing once the player went too', () => {
    const c = fresh();
    const close = [...closeSeats(world, c)];
    expect(close.length).toBeGreaterThan(0);
    c.parties[BP]!.visits = [close[0]];
    expect(makeRecap(world, c).missed).toContainEqual({ seat: close[0], party: BP });
    c.parties[PS]!.visits = [close[0]];
    expect(makeRecap(world, c).missed).toEqual([]);
    expect(makeRecap(world, c).rivals).toContainEqual({ party: BP, seats: [close[0]] });
  });

  it('does not call a seat the player has no stake in close', () => {
    const c = fresh();
    const close = closeSeats(world, c);
    const far = world.seats.find((s) => !close.has(s.id))!;
    c.parties[BP]!.visits = [far.id];
    c.parties[PS]!.visits = [];
    expect(makeRecap(world, c).missed.map((m) => m.seat)).not.toContain(far.id);
  });

  it('is turned away as a save when it names a seat that does not exist', () => {
    const c = fresh();
    endWeek(world, c);
    const copy = JSON.parse(JSON.stringify(c));
    copy.recap.mine = ['P.999'];
    expect(isValidCampaign(copy, world)).toBe(false);
  });
});
