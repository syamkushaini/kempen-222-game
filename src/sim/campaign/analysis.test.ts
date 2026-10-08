import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { N_PARTIES } from '../types';
import { analyse } from './analysis';
import { autoPlayWeek, electionResult, endWeek, newCampaign, summarise } from './turn';
import type { Campaign } from './types';

const world = getWorld('general')!;
function played(player: number, seed: number, lazy = false): Campaign {
  const c = newCampaign(world, { player, difficulty: 'normal', seed });
  while (c.phase === 'campaign') { if (!lazy) autoPlayWeek(world, c); endWeek(world, c); }
  return c;
}

describe('the analysis of an election', () => {
  it('accounts for every seat and every vote', () => {
    for (const [player, seed] of [[0, 3], [1, 4], [2, 5]]) {
      const c = played(player, seed);
      const result = electionResult(world, c)!;
      const a = analyse(world, c, result);
      const s = summarise(world, c, result);
      expect(a.total).toBe(world.seats.length);
      expect(a.majority).toBe(Math.floor(a.total / 2) + 1);
      expect(a.seats).toBe(s.seats);
      expect(a.before).toBe(s.before);
      expect(a.gained).toBe(s.gained.length);
      expect(a.lost).toBe(s.lost.length);
      // What it held, plus what it gained, is what it has; what it held, plus what it lost, is what it had.
      expect(a.held + a.gained).toBe(a.seats);
      expect(a.held + a.lost).toBe(a.before);
      expect(a.parties.reduce((n, l) => n + l.seats, 0)).toBe(a.total);
      expect(a.parties.every((l) => l.party < N_PARTIES && l.share >= 0 && l.share <= 1)).toBe(true);
      expect(a.share).toBeCloseTo(s.voteShare, 6);
      for (let i = 1; i < a.parties.length; i++) expect(a.parties[i - 1].seats).toBeGreaterThanOrEqual(a.parties[i].seats);
    }
  });

  it('says a few things worth saying, each with words in both languages', () => {
    const keys = new Set<string>();
    for (let seed = 1; seed <= 12; seed++) {
      const c = played(seed % 4, seed, seed % 3 === 0);
      const a = analyse(world, c, electionResult(world, c)!);
      expect(a.insights.length).toBeGreaterThan(0);
      expect(a.insights.length).toBeLessThanOrEqual(7);
      for (const i of a.insights) {
        keys.add(i.key);
        expect(STRINGS.en[i.key as StringKey], i.key).toBeTruthy();
        expect(STRINGS.ms[i.key as StringKey], i.key).toBeTruthy();
        expect(Object.values(i.vars).every((v) => typeof v === 'string' || Number.isFinite(v))).toBe(true);
        if (i.state) expect(world.states).toContain(i.state);
      }
    }
    expect(keys.size).toBeGreaterThan(4);
  });

  it('counts the actions the campaign recorded, and reads the best and worst of them', () => {
    const c = played(0, 7);
    const item = (week: number) => ({ week, party: c.player, key: 'news.me.tv', vars: {}, tone: 'neutral' as const });
    c.ledger.push({ news: item(1), seats: 3, share: 0.01 }, { news: item(2), seats: -2, share: -0.01 }, { news: item(3), seats: 0, share: 0 });
    const a = analyse(world, c, electionResult(world, c)!);
    expect(a.work.actions).toBe(3);
    expect(a.work.best.map((d) => d.seats)).toEqual([3]);
    expect(a.work.worst.map((d) => d.seats)).toEqual([-2]);
    expect(a.work.decisions).toBe(3);
    expect(analyse(world, played(0, 7, true), electionResult(world, played(0, 7, true))!).work.actions).toBe(0);
  });

  it('has words for the page', () => {
    const keys = ['title', 'close', 'open', 'of', 'pts', 'tile.seats', 'tile.share', 'tile.gained', 'tile.lost', 'says', 'flow', 'flow.before', 'flow.now', 'flow.held', 'flow.gained', 'flow.lost', 'flow.line', 'flow.alt', 'parties', 'parties.note', 'states', 'states.note', 'blocs', 'poll', 'count', 'closeCalls', 'work', 'work.actions', 'work.polls', 'work.funds'];
    for (const key of keys) {
      expect(STRINGS.en[`analysis.${key}` as StringKey], key).toBeTruthy();
      expect(STRINGS.ms[`analysis.${key}` as StringKey], key).toBeTruthy();
    }
  });
});
