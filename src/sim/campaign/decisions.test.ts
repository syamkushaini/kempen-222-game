import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { startCareer, termWeek } from './career';
import { EVENTS, SOUND_CHOICE } from './events';
import type { Campaign } from './types';

const PS = PARTY_IDS.indexOf('ps');
const base = getWorld('career')!;
/** Events the game runs by effort levels rather than by choices that earn a name. */
const SYSTEM = new Set(['byElection', 'statePolls']);
const METERS = ['cred', 'unity', 'trust', 'stability'];
const earns = (effects: { t: string; n?: number }[]) => effects.some((e) => METERS.includes(e.t) && (e.n ?? 0) > 0);

describe('the decisions', () => {
  it('each has a choice that earns credibility, unity, public trust or stability, except the two that are run by effort', () => {
    const lacking = Object.entries(EVENTS).filter(([id, def]) => !SYSTEM.has(id) && !def.choices.some((ch) => earns(ch.effects) || (ch.gamble && earns(ch.gamble.win)))).map(([id]) => id);
    expect(lacking).toEqual([]);
  });

  it('give what they say: the sound choice keeps the price it had, and adds what it earns', () => {
    for (const [id, choices] of Object.entries(SOUND_CHOICE)) {
      expect(EVENTS[id], id).toBeDefined();
      for (const [i, added] of Object.entries(choices)) {
        const now = EVENTS[id].choices[Number(i)];
        expect(now, `${id} choice ${i}`).toBeDefined();
        for (const e of added) expect(now.effects, `${id} choice ${i}`).toContainEqual(e);
      }
    }
  });

  it('come more often: a leader plays through a year and is asked for more decisions than before', () => {
    let desk = 0;
    for (let seed = 1; seed <= 24; seed++) {
      const c: Campaign = startCareer(base, { player: PS, difficulty: 'normal', seed });
      for (let w = 0; w < 52; w++) {
        const before = c.career!.fired.length;
        c.inbox = [];
        termWeek(base, c);
        if (c.career!.fired.length > before) desk++;
      }
    }
    // Twenty-four years: eight a year at the old rate (0.06 a week, three quiet weeks), nearly twelve now.
    expect(desk / 24).toBeGreaterThan(10);
  }, 60_000);
});
