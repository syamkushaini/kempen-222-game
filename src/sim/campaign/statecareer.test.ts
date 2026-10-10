import { describe, expect, it } from 'vitest';
import { getWorld, STATE_SCENARIOS, worldOf } from '../../data/world';
import { lastElection, majorityLine } from '../election';
import { N_BLOCS, PARTY_IDS } from '../types';
import { answerEvent, inGovernment, nextTerm, resumeTerm, skipAhead, startCareer, syncOpinion } from './career';
import { endDay } from './formation';
import { closeNight, endWeek, playable } from './turn';
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

  it('is not a country career, and the other way round', () => {
    const c = startCareer(careerOf('selangor'), { player: 0, difficulty: 'normal', seed: 5 });
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), getWorld('career')!)).toBe(false);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), getWorld('state:selangor')!)).toBe(false);
  });
});
