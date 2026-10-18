import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { answerEvent, skipAhead, startCareer } from './career';
import { soundest } from './soundest';
import type { Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps');
const world = getWorld('career')!;
const career = (seed = 5): Campaign => { const c = startCareer(world, { player: PS, difficulty: 'normal', seed }); c.inbox = []; c.career!.appointments = []; c.career!.obligations = []; return c; };

/** Skips as the game's button does: runs until a decision is waiting, answers it with the safest choice, and goes on. */
function play(c: Campaign, maxStops = 400): { stops: string[]; weeks: number } {
  const stops: string[] = [];
  let weeks = 0;
  for (let i = 0; i < maxStops && c.phase === 'term' && !c.career!.ending; i++) {
    weeks += skipAhead(world, c, 52);
    if (c.inbox.length === 0) { if (c.phase === 'term') continue; break; }
    const scene = c.inbox.shift()!;
    stops.push(scene.event ?? scene.kind);
    answerEvent(world, c, scene, scene.event ? soundest(scene) : 0);
  }
  return { stops, weeks };
}

describe('skipping ahead', () => {
  it('stops the moment a decision lands, and will not go on until it is answered', () => {
    const c = career();
    const ran = skipAhead(world, c, 260);
    expect(ran).toBeLessThan(260);
    expect(c.inbox.length).toBeGreaterThan(0);
    const week = c.career!.week;
    expect(skipAhead(world, c, 52)).toBe(0);
    expect(c.career!.week).toBe(week);
  });

  it('moves the term on by exactly the weeks it says, writing down each month once', () => {
    const c = career();
    let total = 0;
    for (let i = 0; i < 40 && c.phase === 'term'; i++) {
      const before = c.career!.week;
      const ran = skipAhead(world, c, 13);
      expect(c.career!.week - before).toBe(ran);
      total += ran;
      if (c.inbox.length) { const s = c.inbox.shift()!; answerEvent(world, c, s, s.event ? soundest(s) : 0); }
      if (total >= 52) break;
    }
    const trend = c.career!.trend ?? [];
    expect(trend.map((p) => p.week)).toEqual([...new Set(trend.map((p) => p.week))]);
    expect(trend.every((p) => p.week % 4 === 0)).toBe(true);
    expect(trend.length).toBe(Math.floor(c.career!.week / 4));
  });

  it('goes on until the term ends, by an election or by the government falling, and no further, with budget day coming up each year on the way', () => {
    // A government may fall in its first year by the luck of the events, so budget day is counted across a few games.
    let budgets = 0;
    for (const seed of [5, 6, 7, 8]) {
      const c = career(seed);
      const { stops } = play(c);
      expect(c.phase).not.toBe('term');
      expect(c.career!.week).toBeLessThanOrEqual(c.career!.length + 1);
      budgets = Math.max(budgets, stops.filter((s) => s === 'budget').length);
    }
    expect(budgets).toBeGreaterThanOrEqual(2);
    expect(play(career(5)).stops.length).toBeGreaterThan(5);
  });

  it('is the same every time for the same game: no decision is lost or doubled by skipping', () => {
    const one = play(career(7)), two = play(career(7));
    expect(two.stops).toEqual(one.stops);
    // And the same game played a week at a time meets the same decisions.
    const slow = career(7);
    const seen: string[] = [];
    for (let i = 0; i < 2000 && slow.phase === 'term'; i++) {
      skipAhead(world, slow, 1);
      if (slow.inbox.length) { const s = slow.inbox.shift()!; seen.push(s.event ?? s.kind); answerEvent(world, slow, s, s.event ? soundest(s) : 0); }
    }
    expect(seen).toEqual(one.stops);
  });
});
