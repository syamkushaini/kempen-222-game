import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { COST, STAKES, canCourt, courtChance, courtDefector } from './diplomacy';
import { newCampaign } from './turn';

const [PS, BP] = PARTY_IDS.map((_, i) => i);
const world = getWorld('general')!;
/** A seat BP holds that PS contests, so PS can court its member. */
const seatOf = (_c?: unknown) => world.seats.find((s, i) => {
  const top = s.last.votes.indexOf(Math.max(...s.last.votes));
  return top === BP && world.baseline.contesting[i][PS];
})!.id;

describe('buying a sitting member', () => {
  const start = () => { const c = newCampaign(world, { player: PS, difficulty: 'normal', seed: 3 }); c.parties[PS]!.funds = 50_000_000; return c; };

  it('is likelier with a bigger offer, and costs exactly that', () => {
    const c = start();
    const seat = seatOf(c);
    const chances = STAKES.map((n) => courtChance(world, c, seat, n));
    expect(chances[1]).toBeGreaterThan(chances[0]);
    expect(chances[2]).toBeGreaterThan(chances[1]);
    expect(Math.max(...chances)).toBeLessThanOrEqual(0.85);
    const before = c.parties[PS]!.funds;
    courtDefector(world, c, seat, 4);
    expect(c.parties[PS]!.funds).toBe(before - 4 * scaled(world, COST.courtMoney));
  });

  it('cannot be paid for without the money, and only at the stakes on offer', () => {
    const c = start();
    const seat = seatOf(c);
    c.parties[PS]!.funds = scaled(world, COST.courtMoney) * 2 - 1;
    expect(canCourt(world, c, seat, 1).ok).toBe(true);
    expect(canCourt(world, c, seat, 2)).toEqual({ ok: false, reason: 'funds' });
    expect(courtDefector(world, start(), seatOf(c), 3 as never)).toBeNull();
  });

  it('wins more members over many tries when the offer is larger', () => {
    const win = (stake: 1 | 4) => {
      let won = 0;
      for (let seed = 1; seed <= 60; seed++) {
        const c = newCampaign(world, { player: PS, difficulty: 'normal', seed });
        c.parties[PS]!.funds = 50_000_000;
        const item = courtDefector(world, c, seatOf(c), stake);
        if (item && item.key.startsWith('news.court.won') || item?.key === 'news.court.bought') won++;
      }
      return won;
    };
    expect(win(4)).toBeGreaterThan(win(1));
  });
});
