import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { STATE_STORIES } from './eventList12';
import { startCareer } from './career';
import { EVENTS, eligible, type Effect } from './events';
import { playable } from './field';
import type { Campaign } from './types';

const ids = Object.keys(STATE_STORIES);
const BOUND: Partial<Record<Effect['t'], number>> = { mood: 0.06, unity: 5, funds: 100_000, cred: 3, stability: 3, trust: 4, fiscal: 1, relation: 5 };
const at = (state: string): Campaign => { const w = getWorld(`career:${state}`)!; const c = startCareer(w, { player: playable(w)[0], difficulty: 'normal', seed: 4 }); c.inbox = []; c.career!.obligations = []; return c; };
const STATES = ['perlis', 'kedah', 'penang', 'perak', 'selangor', 'nsembilan', 'melaka', 'johor', 'pahang', 'terengganu', 'kelantan', 'sabah', 'sarawak'];

describe('a story for each state', () => {
  it('has words in both languages for every option and result, a pair for each gamble', () => {
    for (const id of ids) {
      for (const text of [EVENTS_EN[id], EVENTS_MS[id]]) {
        expect(text, id).toBeDefined();
        expect(text.body.length, id).toBeGreaterThan(80);
        expect(text.options, id).toHaveLength(3);
        expect(text.results, id).toHaveLength(3);
        EVENTS[id].choices.forEach((ch, i) => expect(Array.isArray(text.results[i]), `${id} ${i}`).toBe(!!ch.gamble));
      }
      expect(EVENTS_MS[id].title, id).not.toBe(EVENTS_EN[id].title);
    }
  });

  it('keeps every consequence within the sizes the rest of the game uses', () => {
    for (const id of ids) {
      for (const ch of EVENTS[id].choices) for (const e of [...ch.effects, ...(ch.gamble ? [...ch.gamble.win, ...ch.gamble.lose] : [])]) {
        const limit = BOUND[e.t];
        if (limit !== undefined && 'n' in e) expect(Math.abs(e.n), `${id} ${e.t}`).toBeLessThanOrEqual(limit);
      }
    }
  });

  it('gives every state at least one story of its own, and only to a career in that state', () => {
    const own = ids.filter((id) => STATE_STORIES[id].needs?.holds);
    expect(own).toHaveLength(13);
    expect(new Set(own.map((id) => STATE_STORIES[id].needs!.holds)).size).toBe(13);
    for (const state of STATES) {
      const c = at(state);
      const mine = [...Object.keys(EVENTS)].filter((id) => EVENTS[id].needs?.holds === state && eligible(c, id));
      expect(mine.length, state).toBeGreaterThan(0);
      for (const id of own) if (STATE_STORIES[id].needs!.holds !== state) expect(eligible(c, id), `${id} in ${state}`).toBe(false);
    }
  });

  it('keeps the two any-state stories out of a national game', () => {
    const w = getWorld('career')!;
    const c = startCareer(w, { player: playable(w)[0], difficulty: 'normal', seed: 4 });
    c.inbox = [];
    expect(eligible(c, 'buildingCode')).toBe(false);
    expect(eligible(c, 'schoolClosures')).toBe(false);
    expect(eligible(at('perak'), 'buildingCode')).toBe(true);
  });
});
