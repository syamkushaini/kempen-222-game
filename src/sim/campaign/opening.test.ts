import { describe, expect, it } from 'vitest';
import { foundedWorld, getWorld, worldOf } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { PARTY_IDS } from '../types';
import { answerEvent, skipAhead, startCareer } from './career';
import { eligible, EVENTS } from './events';
import { OPENING_DEALT, OPENING_IDS, OPENING_STORIES, openingDeal, openingFlag } from './eventListOpening';
import { declineMission } from './missions';
import { PARTY_OPENING_DEALT, PARTY_OPENING_IDS, PARTY_OPENING_STORIES, partyOpeningDeal } from './eventListOpeningParty';
import type { Standing } from './standing';

const G = PARTY_IDS.indexOf('genba');
const dealtTo = (c: ReturnType<typeof found>) => c.career!.flags.filter((f) => f.startsWith('opening:')).map((f) => f.slice('opening:'.length));
const found = (seed: number) => startCareer(foundedWorld('career'), { player: G, difficulty: 'normal', seed, founded: true });

describe('the opening stories of a party founded from nothing', () => {
  it('are eight, each with words in both languages for every option and result', () => {
    expect(OPENING_IDS).toHaveLength(8);
    for (const id of OPENING_IDS) {
      const def = EVENTS[id];
      expect(def.weight, id).toBe(0);
      for (const text of [EVENTS_EN[id], EVENTS_MS[id]]) {
        expect(text.options, id).toHaveLength(def.choices.length);
        expect(text.results, id).toHaveLength(def.choices.length);
        def.choices.forEach((ch, i) => expect(Array.isArray(text.results[i]), `${id} ${i}`).toBe(!!ch.gamble));
      }
    }
  });

  it('wait for weeks of their own, and take the first free one after it', () => {
    const weeks = OPENING_IDS.map((id) => OPENING_STORIES[id].after);
    expect(new Set(weeks).size).toBe(weeks.length);
  });

  it('are dealt three to a game, by its seed, and differ from one seed to the next', () => {
    const deals = Array.from({ length: 30 }, (_, i) => openingDeal(i + 1));
    for (const d of deals) { expect(d).toHaveLength(OPENING_DEALT); expect(new Set(d).size).toBe(OPENING_DEALT); }
    expect(openingDeal(7)).toEqual(openingDeal(7));
    expect(new Set(deals.map((d) => [...d].sort().join())).size).toBeGreaterThan(10);
    // Every story is dealt to somebody.
    expect(new Set(deals.flat()).size).toBe(OPENING_IDS.length);
  });

  it('are the ones a founded party is carried into, and nobody else', () => {
    const c = found(5);
    expect(dealtTo(c)).toHaveLength(OPENING_DEALT);
    expect(c.career!.flags.every((f) => !f.startsWith('opening:') || OPENING_IDS.map(openingFlag).includes(f))).toBe(true);
    // A party that was already there is dealt stories of its own, never these.
    const ps = startCareer(getWorld('career')!, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5 });
    for (const id of OPENING_IDS) expect(eligible(ps, id), id).toBe(false);
    expect(dealtTo(ps).every((id) => PARTY_OPENING_IDS.includes(id))).toBe(true);
  });

  it('arrive in the first term, on their weeks, and only the dealt ones', () => {
    const c = found(11);
    const w = worldOf(c)!;
    const dealt = dealtTo(c);
    const met: string[] = [];
    for (let guard = 0; c.phase === 'term' && c.career!.week < 40 && guard < 200; guard++) {
      for (const o of [...(c.career!.missions?.offers ?? [])]) declineMission(c, o.id);
      skipAhead(w, c, 4);
      while (c.inbox.length) {
        const scene = c.inbox.shift()!;
        if (scene.kind === 'event' && scene.event && OPENING_IDS.includes(scene.event)) met.push(scene.event);
        answerEvent(w, c, scene, 0);
      }
    }
    expect([...met].sort()).toEqual([...dealt].sort());
  });

  it('do not come back in a later parliament', () => {
    const c = found(11);
    c.career!.term = 2;
    for (const id of OPENING_IDS) expect(eligible(c, id), id).toBe(false);
  });

  it('keep every consequence small', () => {
    for (const id of OPENING_IDS) {
      for (const ch of EVENTS[id].choices) {
        for (const e of [...ch.effects, ...(ch.gamble ? [...ch.gamble.win, ...ch.gamble.lose] : [])]) {
          if (e.t === 'mood') expect(Math.abs(e.n), id).toBeLessThanOrEqual(0.04);
          else if (e.t === 'funds') expect(Math.abs(e.n), id).toBeLessThanOrEqual(50_000);
          else if ('n' in e) expect(Math.abs(e.n), id).toBeLessThanOrEqual(3);
        }
      }
    }
  });
});

const world = getWorld('career')!;
const begin = (party: string, seed: number) => startCareer(world, { player: PARTY_IDS.indexOf(party as never), difficulty: 'normal', seed });

describe('the opening stories of a party that was already there', () => {
  it('are twelve, four for each place to begin, with words in both languages', () => {
    expect(PARTY_OPENING_IDS).toHaveLength(12);
    for (const id of PARTY_OPENING_IDS) {
      const def = EVENTS[id];
      expect(def.weight, id).toBe(0);
      for (const text of [EVENTS_EN[id], EVENTS_MS[id]]) {
        expect(text.options, id).toHaveLength(def.choices.length);
        expect(text.results, id).toHaveLength(def.choices.length);
        def.choices.forEach((ch, i) => expect(Array.isArray(text.results[i]), `${id} ${i}`).toBe(!!ch.gamble));
      }
    }
    const weeks = [...OPENING_IDS, ...PARTY_OPENING_IDS].map((id) => EVENTS[id].after);
    expect(new Set(weeks).size).toBe(weeks.length);
  });

  it('are dealt two to a game from the four of its place, by the seed', () => {
    for (const at of ['pm', 'gov', 'lead', 'opp'] as Standing[]) {
      const deals = Array.from({ length: 30 }, (_, i) => partyOpeningDeal(i + 1, at));
      for (const d of deals) {
        expect(d).toHaveLength(PARTY_OPENING_DEALT);
        expect(new Set(d).size).toBe(PARTY_OPENING_DEALT);
        for (const id of d) expect(PARTY_OPENING_STORIES[id].seats).toContain(at);
      }
      expect(new Set(deals.map((d) => [...d].sort().join())).size, at).toBeGreaterThan(3);
      expect(partyOpeningDeal(9, at)).toEqual(partyOpeningDeal(9, at));
    }
  });

  it('suit the place a party begins in: the government, a partner in it, or the opposition', () => {
    for (const [party, at] of [['ps', 'pm'], ['bp', 'gov'], ['pt', 'lead']] as const) {
      const c = begin(party, 3);
      const dealt = dealtTo(c);
      expect(dealt, party).toHaveLength(PARTY_OPENING_DEALT);
      for (const id of dealt) expect(PARTY_OPENING_STORIES[id].seats, `${party} ${id}`).toContain(at);
    }
  });

  it('come once in the first parliament, and never to a later one', () => {
    const c = begin('pt', 4);
    const dealt = dealtTo(c);
    const w = worldOf(c)!;
    const met: string[] = [];
    for (let guard = 0; c.phase === 'term' && c.career!.week < 60 && guard < 300; guard++) {
      for (const o of [...(c.career!.missions?.offers ?? [])]) declineMission(c, o.id);
      skipAhead(w, c, 4);
      while (c.inbox.length) {
        const scene = c.inbox.shift()!;
        if (scene.kind === 'event' && scene.event && PARTY_OPENING_IDS.includes(scene.event)) met.push(scene.event);
        answerEvent(w, c, scene, 0);
      }
    }
    expect([...met].sort()).toEqual([...dealt].sort());
    c.career!.term = 2;
    for (const id of PARTY_OPENING_IDS) expect(eligible(c, id), id).toBe(false);
  });
});
