import { describe, expect, it } from 'vitest';
import { foundedWorld, getWorld, STATE_SCENARIOS, worldOf } from '../../data/world';
import { lastElection, majorityLine } from '../election';
import { N_BLOCS, PARTY_IDS } from '../types';
import { FOUNDING_SEED_SHARE } from './founding';
import { answerEvent, inGovernment, nextTerm, resumeTerm, skipAhead, startCareer, syncOpinion } from './career';
import { endDay } from './formation';
import { autoPlayWeek, closeNight, electionResult, endWeek, playable } from './turn';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const careerOf = (state: string) => getWorld(`career:${state}`)!;
/** Plays the years of a term, answering whatever lands on the desk with the first choice. */
function playTerm(c: Campaign, world: ReturnType<typeof careerOf>): void {
  for (let guard = 0; guard < 400 && c.phase !== 'campaign' && !c.career!.ending; guard++) {
    if (c.phase === 'term') {
      skipAhead(world, c, 260);
      while (c.inbox.length) { const s = c.inbox.shift()!; answerEvent(world, c, s, 0); }
    } else {
      // A government fell on the way: the talks are played out, and the term carries on under whoever came out on top.
      for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(world, c);
      if (!resumeTerm(c)) throw new Error(`stuck in ${c.phase}`);
    }
  }
}

describe('a career in one state', () => {
  it('has a world for every state, played by assembly rules', () => {
    for (const st of STATE_SCENARIOS) {
      const w = careerOf(st);
      expect(w, st).toBeTruthy();
      expect(w.rules.kind).toBe('state');
      expect(w.rules.career).toBe(true);
      expect(w.seats.length).toBeGreaterThan(10);
      // The same seats as the state's single election.
      expect(w.seats.length).toBe(getWorld(`state:${st}`)!.seats.length);
    }
  });

  it('opens under the government the last assembly election produced', () => {
    for (const st of STATE_SCENARIOS) {
      const w = careerOf(st);
      const tally = lastElection(w).tally;
      for (const player of playable(w)) {
        const c = startCareer(w, { player, difficulty: 'normal', seed: 5 });
        const g = c.career!.government;
        // The largest party heads it, and it has the numbers (or is a minority, and says so).
        expect(tally[g.pm], st).toBe(Math.max(...tally.filter((_, p) => PARTY_IDS[p] !== 'oth')));
        expect(g.minority, st).toBe(g.seats < majorityLine(w));
        expect(g.seats, st).toBeGreaterThanOrEqual(tally[g.pm]);
        expect(c.career!.states).toEqual({});
        expect(isValidCampaign(JSON.parse(JSON.stringify(c)), w), st).toBe(true);
      }
    }
  });

  it('plays two terms back to back in a state with no state polls of its own', () => {
    let finished = 0;
    for (const st of ['selangor', 'kelantan', 'sabah'] as const) {
      const c = startCareer(careerOf(st), { player: playable(careerOf(st))[0], difficulty: 'normal', seed: 9 });
      let world = careerOf(st);
      for (const term of [1, 2]) {
        expect(c.career!.term).toBe(term);
        playTerm(c, world);
        // A leader the party has lost patience with ends the career there: a way for it to go, not a fault.
        if (c.career!.ending) { expect(['ousted', 'wipedOut', 'bowOut']).toContain(c.career!.ending.kind); break; }
        expect(c.phase, st).toBe('campaign');
        expect(c.career!.rounds, st).toBe(0);
        while (c.phase === 'campaign') endWeek(world, c);
        closeNight(world, c);
        for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(world, c);
        expect(nextTerm(world, c), st).toBe(true);
        world = worldOf(c)!;
        expect(world.id, st).toBe(`career:${st}`);
        expect(world.rules.kind).toBe('state');
        expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world), st).toBe(true);
      }
      if (!c.career!.ending) { expect(c.career!.term, st).toBe(3); finished++; }
      expect(JSON.stringify(c).length).toBeLessThan(400_000);
      expect(typeof inGovernment(c, c.player)).toBe('boolean');
    }
    // Not every leader survives two terms, but the careers are not all cut short.
    expect(finished).toBeGreaterThanOrEqual(2);
  });

  it('goes on after a party loses every seat in its first election', () => {
    for (const st of ['sarawak', 'selangor'] as const) {
      const c = startCareer(careerOf(st), { player: playable(careerOf(st)).slice(-1)[0], difficulty: 'normal', seed: 5 });
      let world = careerOf(st);
      for (const term of [1, 2, 3]) {
        playTerm(c, world);
        expect(c.career!.ending ?? null, `${st} term ${term}`).toBeNull();
        // The voters desert the party entirely.
        for (let b = 0; b < N_BLOCS; b++) c.career!.mood[b][c.player] = -30;
        syncOpinion(c);
        while (c.phase === 'campaign') endWeek(world, c);
        closeNight(world, c);
        for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(world, c);
        expect(nextTerm(world, c), st).toBe(true);
        world = worldOf(c)!;
        expect(c.career!.record.terms![term - 1].seats, st).toBe(0);
        expect(c.career!.ending ?? null, st).toBeNull();
        expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world), st).toBe(true);
      }
      expect(c.career!.term, st).toBe(4);
    }
  });

  it('can be led by a party founded from nothing, which stands on every ballot and grows over the terms', () => {
    const GENBA = PARTY_IDS.indexOf('genba');
    for (const st of ['sarawak', 'selangor'] as const) {
      let w = foundedWorld(`career:${st}`);
      expect(foundedWorld(`career:${st}`), st).toBe(w);
      expect(w.id, st).toBe(`career:${st}`);
      expect(w.rules.career, st).toBe(true);
      for (const seat of w.seats) expect(seat.last.votes[GENBA] / seat.last.votes.reduce((a, b) => a + b, 0), st).toBeGreaterThanOrEqual(FOUNDING_SEED_SHARE * 0.9);
      // The ordinary state career is left alone.
      expect(careerOf(st).seats.some((s) => s.last.votes[GENBA] > 0 && s.last.votes[GENBA] === Math.max(...s.last.votes)), st).toBe(false);
      const c = startCareer(w, { player: GENBA, difficulty: 'normal', seed: 3, founded: true });
      expect(c.career!.founded, st).toBe(true);
      expect(c.parties[GENBA], st).toBeTruthy();
      expect(worldOf(c), st).toBe(w);
      expect(worldOf(JSON.parse(JSON.stringify(c))), st).toBe(w);
      expect(isValidCampaign(JSON.parse(JSON.stringify(c)), w), st).toBe(true);
      const shares: number[] = [];
      for (const term of [1, 2, 3]) {
        playTerm(c, w);
        expect(c.career!.ending ?? null, `${st} term ${term}`).toBeNull();
        while (c.phase === 'campaign') { autoPlayWeek(w, c); endWeek(w, c); }
        const r = electionResult(w, c)!;
        shares.push(r.votes[GENBA] / r.votes.reduce((a, b) => a + b, 0));
        closeNight(w, c);
        for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(w, c);
        expect(nextTerm(w, c), st).toBe(true);
        w = worldOf(c)!;
        expect(w.id, st).toBe(`career:${st}`);
        expect(c.career!.founded, st).toBe(true);
        expect(isValidCampaign(JSON.parse(JSON.stringify(c)), w), st).toBe(true);
      }
      // It gets a following over three terms, as a party founded in the country does.
      expect(shares[0], st).toBeGreaterThan(0.01);
      expect(shares[2], st).toBeGreaterThan(shares[0]);
      expect(shares[2], st).toBeGreaterThan(0.08);
    }
  });

  it('is not a country career, and the other way round', () => {
    const c = startCareer(careerOf('selangor'), { player: 0, difficulty: 'normal', seed: 5 });
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), getWorld('career')!)).toBe(false);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), getWorld('state:selangor')!)).toBe(false);
  });
});
