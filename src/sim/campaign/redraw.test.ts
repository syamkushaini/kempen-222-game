import { describe, expect, it } from 'vitest';
import { getWorld, worldOf } from '../../data/world';
import { lastElection } from '../election';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { answerEvent, nextTerm, resumeTerm, skipAhead, startCareer } from './career';
import { endDay } from './formation';
import { factionsOf } from './factions';
import { REDRAW_WEEK, redraw, redrawNext, redrawWeek, resolveRedraw } from './redraw';
import { recordResults } from './results';
import { closeNight, endWeek } from './turn';
import type { Campaign, SeatResults } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps');
const base = getWorld('career')!;
const career = (seed = 5): Campaign => {
  const c = startCareer(base, { player: PS, difficulty: 'normal', seed });
  c.career!.obligations = [];
  return c;
};
const last = (): SeatResults => ({
  votes: base.seats.map((s) => [...s.last.votes]),
  turnout: base.seats.map((s) => s.last.turnout),
  basis: base.seats.map(() => null),
});
const tally = (r: SeatResults, p: number) => r.votes.filter((v) => v.indexOf(Math.max(...v)) === p).length;

describe('redrawing the boundaries', () => {
  it('moves a few voters between neighbouring seats when left to the commission, and keeps every seat’s total', () => {
    const before = last();
    const { results, flipped } = redraw(base, before, null, new Rng(1));
    let changed = 0;
    results.votes.forEach((v, i) => {
      expect(v.reduce((a, b) => a + b, 0)).toBeGreaterThan(0);
      expect(Math.abs(v.reduce((a, b) => a + b, 0) - before.votes[i].reduce((a, b) => a + b, 0))).toBeLessThan(10);
      if (v.join() !== before.votes[i].join()) changed++;
    });
    expect(changed).toBeGreaterThan(5);
    expect(changed).toBeLessThan(base.seats.length * 0.2);
    expect(flipped).toBeLessThan(15);
    expect(results.turnout).toEqual(before.turnout);
  });

  it('turns seats towards the party that asked for a map that suits it, and by more than chance', () => {
    const before = last();
    const asked = redraw(base, before, PS, new Rng(1));
    expect(tally(asked.results, PS)).toBeGreaterThan(tally(before, PS));
    expect(asked.flipped).toBeGreaterThan(2);
    const fair = redraw(base, before, null, new Rng(1));
    expect(tally(asked.results, PS) - tally(before, PS)).toBeGreaterThan(Math.abs(tally(fair.results, PS) - tally(before, PS)));
  });

  it('is asked of the player only in the term before a redraw, once, in the week it falls due', () => {
    const c = career();
    expect(redrawNext(c)).toBe(false);
    c.career!.term = 3;
    c.career!.week = REDRAW_WEEK - 1;
    redrawWeek(c);
    expect(c.inbox.some((s) => s.kind === 'redraw')).toBe(false);
    c.career!.week = REDRAW_WEEK;
    redrawWeek(c);
    expect(c.inbox.filter((s) => s.kind === 'redraw')).toHaveLength(1);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
    c.inbox = [];
    redrawWeek(c);
    expect(c.inbox).toHaveLength(0);
  });

  it('costs the leader who asks for a map that suits them: trust, credibility, and the whole country knows', () => {
    const c = career();
    const k = c.career!;
    const [trust, cred] = [k.government.trust, k.credibility];
    resolveRedraw(c, { id: 1, kind: 'redraw', from: null }, 1);
    expect(k.redraw).toEqual({ by: PS });
    expect(k.government.trust).toBe(trust - 6);
    expect(k.credibility).toBe(cred - 3);
    const left = career();
    resolveRedraw(left, { id: 1, kind: 'redraw', from: null }, 0);
    expect(left.career!.redraw).toEqual({ by: null });
    expect(left.career!.credibility).toBe(cred);
  });

  it('is decided by the government when it is not the player’s: about half the time it asks', () => {
    let asked = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const c = career(seed);
      c.career!.government = { ...c.career!.government, pm: PARTY_IDS.indexOf('bp') };
      c.career!.term = 3;
      c.career!.week = REDRAW_WEEK;
      c.rng = seed * 7919;
      redrawWeek(c);
      expect(c.inbox).toHaveLength(0);
      if (c.career!.redraw?.by === PARTY_IDS.indexOf('bp')) asked++;
    }
    expect(asked).toBeGreaterThan(5);
    expect(asked).toBeLessThan(25);
  });

  it('is carried into the next parliament: the map the term is fought on is the redrawn one', () => {
    const c = career();
    c.career!.term = 3;
    let world = base;
    factionsOf(c).mood = [95, 95, 95]; factionsOf(c).wing = [95, 95, 95];
    for (let g = 0; g < 4000 && c.phase !== 'campaign'; g++) {
      if (c.phase === 'term') { c.parties[PS]!.unity = Math.max(c.parties[PS]!.unity, 70); if (c.inbox.length) { const sc = c.inbox.shift()!; answerEvent(world, c, sc, sc.kind === 'redraw' ? 1 : 0); } else skipAhead(world, c, 26); }
      else if (c.phase === 'formation') endDay(world, c);
      else if (c.phase === 'done') resumeTerm(c);
    }
    while (c.phase === 'campaign') endWeek(world, c);
    closeNight(world, c);
    for (let d = 0; d < 10 && c.phase === 'formation'; d++) endDay(world, c);
    const recorded = recordResults(world, c);
    expect(nextTerm(world, c)).toBe(true);
    world = worldOf(c)!;
    expect(c.career!.term).toBe(4);
    expect(c.career!.redraw).toBeUndefined();
    expect(lastElection(world).tally[PS]).toBeGreaterThan(tally(recorded, PS));
    expect(c.news.some((n) => n.key === 'news.redraw.done.pushed')).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  }, 60_000);
});
