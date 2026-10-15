import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { startCareer } from './career';
import { SELANGOR_STORIES } from './eventList14';
import { EVENTS, eligible, type Effect } from './events';
import { playable } from './field';
import { choiceCost } from './events';
import type { Campaign } from './types';

const ids = Object.keys(SELANGOR_STORIES);
const BOUND: Partial<Record<Effect['t'], number>> = { mood: 0.06, unity: 5, funds: 100_000, cred: 3, stability: 3, trust: 4, fiscal: 1, relation: 5 };
const at = (state: string): Campaign => { const w = getWorld(`career:${state}`)!; const c = startCareer(w, { player: playable(w)[0], difficulty: 'normal', seed: 4 }); c.inbox = []; c.career!.obligations = []; return c; };

describe('the Selangor stories', () => {
  it('are eleven, with words in both languages for every option and result, a pair for each gamble', () => {
    expect(ids).toHaveLength(11);
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

  it('keep every consequence within the sizes the rest of the game uses, and always leave one choice that costs nothing', () => {
    const c = at('selangor');
    const world = getWorld('career:selangor')!;
    for (const id of ids) {
      for (const ch of EVENTS[id].choices) for (const e of [...ch.effects, ...(ch.gamble ? [...ch.gamble.win, ...ch.gamble.lose] : [])]) {
        const limit = BOUND[e.t];
        if (limit !== undefined && 'n' in e) expect(Math.abs(e.n), `${id} ${e.t}`).toBeLessThanOrEqual(limit);
      }
      expect(EVENTS[id].choices.some((_, i) => choiceCost(world, c, id, i) === 0), id).toBe(true);
    }
  });

  it('come only to the head of a Selangor government', () => {
    const c = at('selangor');
    const other = at('perak');
    for (const id of ids) {
      expect(EVENTS[id].needs?.holds, id).toBe('selangor');
      expect(eligible(other, id), `${id} in perak`).toBe(false);
    }
    expect(ids.some((id) => eligible(c, id))).toBe(true);
  });
});
