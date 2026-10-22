import { describe, expect, it } from 'vitest';
import { foundedWorld, worldOf } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { PARTY_IDS } from '../types';
import { answerEvent, skipAhead, startCareer } from './career';
import { eligible, EVENTS } from './events';
import { OPENING_DEALT, OPENING_IDS, OPENING_STORIES, openingDeal, openingFlag } from './eventListOpening';
import { declineMission } from './missions';

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

  it('come on weeks of their own, none crowding another out', () => {
    const weeks = OPENING_IDS.map((id) => OPENING_STORIES[id].at);
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
    const ps = startCareer(worldOf(c)!, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5 });
    expect(ps.career!.flags.some((f) => f.startsWith('opening:'))).toBe(false);
    for (const id of OPENING_IDS) expect(eligible(ps, id), id).toBe(false);
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
