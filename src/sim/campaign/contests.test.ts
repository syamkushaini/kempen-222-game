import { describe, expect, it } from 'vitest';
import { getWorld, worldOf } from '../../data/world';
import { lastElection } from '../election';
import { N_BLOCS, PARTY_IDS } from '../types';
import { answerEvent, nextTerm, skipAhead, startCareer, syncOpinion, termIncome, termWeek } from './career';
import { BY_EFFORT, holderOf, houseTally, resolveByElection, resolveStatePolls, roundDue, ROUNDS, startStates, statesHeld, vacantSeat } from './contests';
import { endDay } from './formation';
import { confidenceCount, whipCount } from './govern';
import { Rng } from '../rng';
import { closeNight, endWeek } from './turn';
import type { Campaign, Scene } from './types';
import { isValidCampaign } from './validate';

const [PS, BP, PT, GBK] = PARTY_IDS.map((_, i) => i);
const base = getWorld('career')!;
const career = (player = PS, seed = 5): Campaign => startCareer(base, { player, difficulty: 'normal', seed });
const last = lastElection(base);
const by = (seat: string): Scene => ({ id: 1, kind: 'event', from: null, event: 'byElection', seat });
/** Moves the country's opinion of the player's party up or down everywhere. */
const swing = (c: Campaign, n: number) => { for (let b = 0; b < N_BLOCS; b++) c.career!.mood[b][c.player] = n; syncOpinion(c); };
/** A seat a given party holds, the closest it has; with `second`, the closest where that party came second. */
const seatOf = (p: number, second?: number) =>
  [...last.seats].filter((o) => o.winner === p && (second === undefined || o.runnerUp === second)).sort((a, b) => a.margin - b.margin)[0].seatId;

describe('by-elections', () => {
  it('fall in seats the player’s party fights', () => {
    const c = career();
    for (let i = 0; i < 20; i++) {
      const seat = vacantSeat(base, c, new Rng(i));
      expect(base.baseline.contesting[base.seatIndex.get(seat)!][PS]).toBe(true);
    }
  });

  it('change who sits in the House, and with it every count that follows', () => {
    const c = career();
    const k = c.career!;
    expect(houseTally(base, c)).toEqual(last.tally);
    const seat = seatOf(PT);
    swing(c, 3);
    const funds = c.parties[PS]!.funds, unity = c.parties[PS]!.unity;
    const result = resolveByElection(base, c, by(seat), 0)!;
    expect(result).toMatchObject({ seat, winner: PS, was: PT });
    expect(c.parties[PS]!.funds).toBe(funds - 150_000);
    expect(c.parties[PS]!.unity).toBe(unity + 3);
    expect(k.house).toEqual({ [seat]: PS });
    expect(holderOf(base, c, seat)).toBe(PS);
    expect(houseTally(base, c)[PS]).toBe(last.tally[PS] + 1);
    expect(houseTally(base, c)[PT]).toBe(last.tally[PT] - 1);
    expect(k.government.seats).toBe(144);
    expect(c.news.at(-1)).toMatchObject({ key: 'news.by.won', tone: 'good' });
    // The whips and a confidence vote now count one more.
    expect(whipCount(base, c, 'pledge:homes', PS).votes[PS]).toBe('yes');
    expect(confidenceCount(base, c)).toBeGreaterThan(confidenceCount(base, career()));
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);

    // Won back by its old owner, the seat is as it was elected.
    swing(c, -3);
    expect(resolveByElection(base, c, by(seat), 2)!.winner).not.toBe(PS);
    expect(houseTally(base, c)[PS]).toBe(last.tally[PS]);
  });

  it('hurt when a seat of one’s own is lost', () => {
    const c = career();
    const seat = seatOf(PS, PT);
    swing(c, -3);
    const unity = c.parties[PS]!.unity, stability = c.career!.government.stability;
    const result = resolveByElection(base, c, by(seat), 2)!;
    expect(result.was).toBe(PS);
    expect(result.winner).not.toBe(PS);
    expect(c.parties[PS]!.unity).toBe(unity - 3);
    expect(c.career!.government.seats).toBe(142);
    expect(c.career!.government.stability).toBe(stability - 3);
    expect(c.news.at(-1)).toMatchObject({ key: 'news.by.lost', tone: 'bad' });
  });

  it('reward effort, as far as there is money to pay for it', () => {
    const wins = (choice: number, funds?: number) => {
      let n = 0;
      for (let seed = 1; seed <= 40; seed++) {
        const c = career(PS, seed);
        if (funds !== undefined) c.parties[PS]!.funds = funds;
        if (resolveByElection(base, c, by(seatOf(PT, PS)), choice)!.winner === PS) n++;
      }
      return n;
    };
    const flat = wins(0), none = wins(2), broke = wins(0, 0);
    expect(flat).toBeGreaterThan(none + 5);
    expect(broke).toBeLessThan(flat);
    expect(BY_EFFORT[0].lift).toBeGreaterThan(BY_EFFORT[1].lift);
  }, 20_000); // a hundred and twenty careers started: slow when the machine is busy

  it('arrive as a decision with a seat attached', () => {
    const c = career();
    c.career!.fired = [];
    answerEvent(base, c, by(seatOf(BP)), 1);
    expect(c.news.some((n) => n.key.startsWith('news.by.'))).toBe(true);
    // Whatever lands on the desk by chance is given a seat before the player sees it.
    for (let guard = 0; guard < 400 && !c.inbox.some((s) => s.event === 'byElection'); guard++) {
      if (c.inbox.length) answerEvent(base, c, c.inbox.shift()!, 0); else termWeek(base, c);
    }
    const scene = c.inbox.find((s) => s.event === 'byElection');
    if (scene) expect(base.seatIndex.has(scene.seat!)).toBe(true);
  });
});

describe('state polls', () => {
  it('start from who carried each state last time', () => {
    const states = startStates(base);
    expect(Object.keys(states).sort()).toEqual(ROUNDS.flatMap((r) => r.states).sort());
    expect(states.kl).toBeUndefined(); // the federal territories have no assembly
    expect(states.sarawak).toBe(GBK);
    expect(states.kelantan).toBe(PT);
    expect(states.penang).toBe(PS);
    const c = career();
    expect(c.career!.states).toEqual(states);
    expect(termIncome(base, c).states).toBe(2_000 * statesHeld(c, PS));
    expect(statesHeld(c, PS)).toBeGreaterThan(1);
  });

  it('come round three times a term, when they are due', () => {
    const c = career();
    expect(roundDue(c)).toBeNull();
    c.career!.week = 70;
    expect(roundDue(c)).toBe(0);
    termWeek(base, c);
    expect(c.inbox[0]).toMatchObject({ kind: 'event', event: 'statePolls' });
    const week = c.career!.week;
    termWeek(base, c);
    expect(c.career!.week).toBe(week); // time waits
    answerEvent(base, c, c.inbox.shift()!, 1);
    expect(c.career!.rounds).toBe(1);
    expect(roundDue(c)).toBeNull();
    expect(c.news.some((n) => n.key.startsWith('news.states.'))).toBe(true);
    c.career!.rounds = 3;
    c.career!.week = 240;
    expect(roundDue(c)).toBeNull();
  });

  it('hand a state to whoever wins most of its seats', () => {
    const c = career();
    const k = c.career!;
    k.rounds = 1;
    swing(c, 3);
    const funds = c.parties[PS]!.funds;
    const kelantan = base.states.indexOf('kelantan'), branches = c.parties[PS]!.machinery[kelantan];
    const results = resolveStatePolls(base, c, 0);
    expect(results.map((r) => r.state).sort()).toEqual([...ROUNDS[1].states].sort());
    // A landslide carries nearly everything; the deepest heartland may still hold out.
    expect(results.filter((r) => r.winner === PS).length).toBeGreaterThanOrEqual(5);
    expect(k.states.kelantan).toBe(PS);
    expect(c.parties[PS]!.funds).toBe(funds - 300_000);
    expect(c.parties[PS]!.machinery[kelantan]).toBe(branches + 4);
    expect(c.news.some((n) => n.key === 'news.states.won' && n.party === PS && n.tone === 'good')).toBe(true);
    expect(k.rounds).toBe(2);

    // And takes it away again.
    swing(c, -3);
    const unity = c.parties[PS]!.unity;
    const lost = resolveStatePolls(base, c, 2);
    expect(lost.some((r) => r.winner === PS)).toBe(false);
    expect(c.parties[PS]!.unity).toBeLessThanOrEqual(unity);
    expect(resolveStatePolls(base, c, 0)).toEqual([]); // no fourth round
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('leave a state with its government when nothing moves', () => {
    const results = resolveStatePolls(base, (() => { const c = career(PT); c.career!.rounds = 0; return c; })(), 1);
    expect(results.find((r) => r.state === 'sarawak')).toMatchObject({ winner: GBK, was: GBK });
  });
});

describe('across a general election', () => {
  it('the House is elected afresh, and the states keep their governments', () => {
    const c = career(PS, 9);
    const k = c.career!;
    resolveByElection(base, c, by(seatOf(PT)), 0);
    k.states.kelantan = PS;
    c.inbox = [];
    k.week = k.length;
    termWeek(base, c);
    while (c.phase === 'campaign') endWeek(base, c);
    closeNight(base, c);
    for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(base, c);
    expect(nextTerm(base, c)).toBe(true);
    const world = worldOf(c)!;
    expect(c.career!.house).toEqual({});
    expect(c.career!.rounds).toBe(0);
    expect(c.career!.states.kelantan).toBe(PS);
    expect(houseTally(world, c)).toEqual(lastElection(world).tally);
    skipAhead(world, c, 3);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
});
