import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { ACTIONS, canDo } from './actions';
import { believedRace, suggestions } from './suggest';
import { endWeek, newCampaign, playerAct } from './turn';
import type { Campaign, Poll } from './types';

const general = getWorld('general')!;
const by = getWorld('byelection')!;
const start = (seed = 3, world = general): Campaign => newCampaign(world, { player: 0, difficulty: 'normal', seed });
const key = (s: { id: string; target: unknown }) => `${s.id}:${JSON.stringify(s.target)}`;

describe('suggested actions', () => {
  it('are a few ordinary actions the player can do right now, of different kinds', () => {
    const c = start();
    const list = suggestions(general, c);
    expect(list).toHaveLength(3);
    expect(new Set(list.map((s) => s.id)).size).toBe(3);
    for (const s of list) expect(canDo(general, c, c.player, s.id, s.target).ok).toBe(true);
  });

  it('work in a one-seat contest', () => {
    const c = start(3, by);
    const list = suggestions(by, c);
    expect(list.length).toBeGreaterThan(0);
    for (const s of list) expect(canDo(by, c, c.player, s.id, s.target).ok).toBe(true);
  });

  it('use only what the player can see, so hidden drift in the race changes nothing', () => {
    const a = suggestions(general, start(1)), b = suggestions(general, start(2)), d = suggestions(general, start(9));
    expect(a.map(key)).toEqual(b.map(key));
    expect(a.map(key)).toEqual(d.map(key));
  });

  it('follow a poll the player paid for', () => {
    const c = start();
    const before = believedRace(general, c);
    // A seat the party stands in but that looked a long shot turns out, on a poll, to be a dead heat.
    const i = before.value.indexOf(Math.min(...before.value.filter((v) => v > 0)));
    expect(before.value[i]).toBeLessThan(0.1);
    const seat = general.seats[i];
    // The player's party and the seat's main rival level at 45% each.
    const deadHeat = new Array<number>(7).fill(0);
    deadHeat[c.player] = 0.45;
    deadHeat[before.mainRival[i]] = 0.45;
    const poll: Poll = {
      id: 1, week: 1, scope: 'seat', target: seat.id, quality: 'full', public: false, moe: 0.03,
      seats: { [seat.id]: deadHeat },
    };
    c.polls.push(poll);
    expect(believedRace(general, c).value[i]).toBeGreaterThan(before.value[i] + 0.3);
  });

  it('drop off the list once the week allows no more of them', () => {
    const c = start();
    const [first] = suggestions(general, c);
    // Some actions can be done twice a week; the list keeps offering them until the limit is reached.
    for (let n = 0; n < ACTIONS[first.id].perWeek; n++) {
      expect(suggestions(general, c).map(key)).toContain(key(first));
      expect(playerAct(general, c, first.id, first.target)).not.toBeNull();
    }
    expect(suggestions(general, c).map(key)).not.toContain(key(first));
  });

  it('disappear when the week is spent, and when the campaign is over', () => {
    const c = start();
    c.parties[c.player]!.days = 0;
    expect(suggestions(general, c)).toEqual([]);
    const d = start();
    while (d.phase === 'campaign') endWeek(general, d);
    expect(suggestions(general, d)).toEqual([]);
  });

  it('suggest raising money when the party is short of it', () => {
    const c = start();
    c.parties[c.player]!.funds = 20_000;
    expect(suggestions(general, c, 6).some((s) => s.why === 'funds')).toBe(true);
  });
});
