import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { startCareer } from './career';
import { MELAKA_STORIES } from './eventListMelaka';
import { EVENTS, canChoose, eligible, type Effect } from './events';
import { playable } from './field';
import type { Campaign } from './types';

const BOUND: Partial<Record<Effect['t'], number>> = { mood: 0.06, unity: 5, funds: 100_000, cred: 3, stability: 3, trust: 4, fiscal: 1, relation: 5 };
const ids = Object.keys(MELAKA_STORIES);
const at = (state: string): Campaign => { const w = getWorld(`career:${state}`)!; const c = startCareer(w, { player: playable(w)[0], difficulty: 'normal', seed: 4 }); c.inbox = []; c.career!.obligations = []; return c; };

describe('the Melaka stories', () => {
  it('are ten, with words in both languages for every option and result, a pair for each gamble', () => {
    expect(ids).toHaveLength(10);
    for (const id of ids) {
      for (const text of [EVENTS_EN[id], EVENTS_MS[id]]) {
        expect(text, id).toBeDefined();
        expect(text.body.length, id).toBeGreaterThan(80);
        expect(text.options, id).toHaveLength(EVENTS[id].choices.length);
        expect(text.results, id).toHaveLength(EVENTS[id].choices.length);
        EVENTS[id].choices.forEach((ch, i) => expect(Array.isArray(text.results[i]), `${id} ${i}`).toBe(!!ch.gamble));
      }
      expect(EVENTS_MS[id].title, id).not.toBe(EVENTS_EN[id].title);
    }
  });

  it('keep every consequence within the sizes the rest of the game uses, and never leave a broke party without an answer', () => {
    const c = at('melaka');
    const world = getWorld('career:melaka')!;
    for (const id of ids) {
      for (const ch of EVENTS[id].choices) for (const e of [...ch.effects, ...(ch.gamble ? [...ch.gamble.win, ...ch.gamble.lose] : [])]) {
        const limit = BOUND[e.t];
        if (limit !== undefined && 'n' in e) expect(Math.abs(e.n), `${id} ${e.t}`).toBeLessThanOrEqual(limit);
      }
      c.parties[c.player]!.funds = 0;
      expect(EVENTS[id].choices.some((_, i) => canChoose(world, c, id, i)), id).toBe(true);
    }
  });

  it('name no real person or party, and only invented places, in either language', () => {
    const REAL = /\b(UMNO|PKR|DAP|Amanah|Bersatu|PAS|MCA|MIC|Gerakan|Najib|Anwar|Zahid|Rafizi|Ab Rauf|Sulaiman|Jonker|Kem Terendak)\b/;
    for (const id of ids) for (const text of [EVENTS_EN[id], EVENTS_MS[id]]) {
      const all = [text.title, text.body, ...text.options, ...text.results.flat()].join(' ');
      expect(all, id).not.toMatch(REAL);
    }
  });

  it('come only to the head of a Melaka government', () => {
    const other = at('penang');
    for (const id of ids) {
      expect(EVENTS[id].needs?.holds, id).toBe('melaka');
      expect(eligible(other, id), `${id} elsewhere`).toBe(false);
    }
    const w = getWorld('career:melaka')!;
    const heads = playable(w).some((p) => { const c = startCareer(w, { player: p, difficulty: 'normal', seed: 4 }); c.inbox = []; return ids.some((id) => eligible(c, id)); });
    expect(heads).toBe(true);
  });
});
