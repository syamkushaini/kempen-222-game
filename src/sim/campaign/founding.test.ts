import { describe, expect, it } from 'vitest';
import { foundedWorld, getWorld, worldOf } from '../../data/world';
import { lastElection } from '../election';
import { BLOC_IDS, PARTY_IDS } from '../types';
import { MINOR_PURSE, purseOf, scaled } from './actions';
import { answerEvent, nextTerm, resumeTerm, skipAhead, startCareer } from './career';
import { endDay } from './formation';
import { declineMission } from './missions';
import { FOUNDING_FUNDS, FOUNDING_SEED_SHARE, foundingLift, foundingPace, foundingRoom, growFoundedParty } from './founding';
import { alignment } from './policy';
import { autoPlayWeek, closeNight, electionResult, endWeek, startingFunds } from './turn';
import { isValidCampaign } from './validate';

const GENBA = PARTY_IDS.indexOf('genba'), CAHAYA = PARTY_IDS.indexOf('cahaya');
const plain = getWorld('career')!;
const world = foundedWorld();
const found = (seed = 4, stances?: number[]) => startCareer(world, { player: GENBA, difficulty: 'normal', seed, founded: true, stances });
const ruralist = [2, 0, 0, 0, -1, -1, 1, -1, 1, 2, 0, 2];

describe('a party the player founds', () => {
  it('stands in every seat from the first day, and leaves the ordinary world alone', () => {
    for (const seat of world.seats) {
      const total = seat.last.votes.reduce((a, b) => a + b, 0);
      expect(seat.last.votes[GENBA] / total).toBeGreaterThanOrEqual(FOUNDING_SEED_SHARE * 0.9);
    }
    const stood = plain.seats.filter((s) => s.last.votes[GENBA] > 0).length;
    expect(stood).toBeLessThan(plain.seats.length / 4); // the ordinary world still has the small party in a handful of seats
    expect(foundedWorld()).toBe(world);
  });

  it('opens with one seat, a smaller purse than the big parties and a platform of its own', () => {
    const c = found(4, ruralist);
    expect(c.career!.founded).toBe(true);
    expect(c.parties[GENBA]!.funds).toBe(scaled(world, FOUNDING_FUNDS));
    expect(c.parties[GENBA]!.funds).toBeLessThan(startingFunds(world, PARTY_IDS.indexOf('ps')) * 0.4);
    expect(c.career!.stances[GENBA]).toEqual(ruralist);
    expect(c.career!.stances0[GENBA]).toEqual(ruralist); // a new party is not accused of a U-turn
    expect(lastElection(world).tally[GENBA]).toBe(1);
  });

  it('is kept as the first term’s world when a saved game reloads, and is a valid save', () => {
    const c = found();
    expect(worldOf(c)).toBe(world);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    expect(worldOf(JSON.parse(JSON.stringify(c)))).toBe(world);
  });

  it('is not held to the small-party purse that rivals are', () => {
    const c = found();
    expect(purseOf(GENBA, c)).toBe(1);
    expect(purseOf(CAHAYA, c)).toBe(MINOR_PURSE);
    expect(purseOf(GENBA)).toBe(MINOR_PURSE);
  });
});

describe('how a founded party grows', () => {
  it('wins over the groups its platform suits, and not those it goes against', () => {
    const c = found(4, ruralist);
    const lift = foundingLift(world, c);
    const align = BLOC_IDS.map((_, b) => alignment(ruralist, b));
    BLOC_IDS.forEach((_, b) => { if (align[b] <= 0) expect(lift[b]).toBe(0); else expect(lift[b]).toBeGreaterThan(0); });
    const best = align.indexOf(Math.max(...align)), worst = align.indexOf(Math.min(...align));
    expect(lift[best]).toBeGreaterThan(lift[worst]);
    // The opposite platform helps the opposite groups.
    const flipped = ruralist.map((s) => -s);
    const other = found(4, flipped);
    expect(foundingLift(world, other)).not.toEqual(lift);
  });

  it('goes faster when the leader is believed and the branches are strong', () => {
    const c = found();
    const start = foundingPace(c);
    c.career!.credibility = 100;
    const believed = foundingPace(c);
    expect(believed).toBeGreaterThan(start);
    c.parties[GENBA]!.machinery = c.parties[GENBA]!.machinery.map(() => 100);
    expect(foundingPace(c)).toBeGreaterThan(believed);
  });

  it('slows as the party gets large, and never stops altogether', () => {
    const c = found();
    const total = lastElection(world).votes.reduce((a, b) => a + b, 0);
    const share = lastElection(world).votes[GENBA] / total;
    expect(foundingRoom(world, c)).toBeCloseTo(1 - share / 0.3, 10);
    // A world where the party already holds half the vote: growth is at its slowest.
    const big = { ...world, last: { ...lastElection(world), votes: lastElection(world).votes.map((v, p) => (p === GENBA ? total : v)) } };
    expect(foundingRoom(big, c)).toBe(0.1);
  });

  it('adds to the mood each week for a founded party and does nothing for any other', () => {
    const c = found(4, ruralist);
    const before = c.career!.mood.map((row) => row[GENBA]);
    growFoundedParty(world, c);
    expect(c.career!.mood.some((row, b) => row[GENBA] > before[b])).toBe(true);
    const ordinary = startCareer(plain, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 4 });
    const was = JSON.stringify(ordinary.career!.mood);
    growFoundedParty(plain, ordinary);
    expect(JSON.stringify(ordinary.career!.mood)).toBe(was);
  });

  it('gets a real following in a few terms, played with the game’s own autoplayer, and ends nobody’s career', () => {
    const c = startCareer(world, { player: GENBA, difficulty: 'normal', seed: 1, founded: true, stances: ruralist });
    let w = world;
    const shares: number[] = [];
    for (let term = 1; term <= 3; term++) {
      for (let guard = 0; (c.phase === 'term' || (c.phase === 'formation' && c.career!.midterm)) && guard < 400; guard++) {
        if (c.phase === 'formation') { for (let d = 0; d < 12 && c.phase === 'formation'; d++) endDay(w, c); resumeTerm(c); continue; }
        for (const o of [...(c.career!.missions?.offers ?? [])]) declineMission(c, o.id); // an answer, so that none lapses at a cost
        skipAhead(w, c, 300);
        while (c.inbox.length) answerEvent(w, c, c.inbox.shift()!, 0);
      }
      expect(c.career!.ending).toBeNull();
      while (c.phase === 'campaign') { autoPlayWeek(w, c); endWeek(w, c); }
      const r = electionResult(w, c)!;
      shares.push(r.votes[GENBA] / r.votes.reduce((a, b) => a + b, 0));
      closeNight(w, c);
      for (let d = 0; d < 10 && c.phase === 'formation'; d++) endDay(w, c);
      expect(nextTerm(w, c)).toBe(true);
      w = worldOf(c)!;
      expect(c.career!.founded).toBe(true);
    }
    expect(shares[0]).toBeGreaterThan(0.01);
    expect(shares[1]).toBeGreaterThan(shares[0] * 1.5);
    expect(shares[2]).toBeGreaterThan(0.1);
    expect(shares[2]).toBeLessThan(0.45);
  }, 120_000);
});

describe('the party the creator starts from', () => {
  it('has a colour and an emblem that make a valid party of one’s own', async () => {
    const { makeIdentity, DEFAULT_EMBLEMS, PARTY_COLORS } = await import('../../state/identity');
    expect(makeIdentity({ name: 'Gerakan Rakyat Baru', short: 'GRB', color: PARTY_COLORS[6], emblem: DEFAULT_EMBLEMS.genba, leader: 'Sang Pengasas', look: 0 })).not.toBeNull();
    expect(PARTY_COLORS).toContain(PARTY_COLORS[6]);
  });
});
