import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { eligible, EVENTS, seatOf } from './events';
import { POWER_EVENTS } from './eventListPower';
import type { Campaign } from './types';

const [PS] = PARTY_IDS.map((_, i) => i);
const world = getWorld('career')!;
const IDS = Object.keys(POWER_EVENTS);
const career = (player = PS): Campaign => { const c = startCareer(world, { player, difficulty: 'normal', seed: 5 }); c.inbox = []; c.career!.appointments = []; c.career!.flags = c.career!.flags.filter((f) => !f.startsWith('opening:')); return c; };
/** A government that is steady, trusted and not in debt, with a long way gone in its term. */
const secure = (c: Campaign) => { const k = c.career!; k.government.stability = 80; k.credibility = 70; k.economy.debt = 30; k.week = Math.ceil((k.length * 3) / 4); return c; };

describe('the trouble that comes with winning', () => {
  it('is eight stories, each with words in both languages for every option and result', () => {
    expect(IDS).toHaveLength(8);
    for (const id of IDS) {
      const def = EVENTS[id];
      expect(def.needs?.secure, id).toBe(true);
      for (const text of [EVENTS_EN[id], EVENTS_MS[id]]) {
        expect(text.options, id).toHaveLength(def.choices.length);
        expect(text.results, id).toHaveLength(def.choices.length);
        def.choices.forEach((ch, i) => expect(Array.isArray(text.results[i]), `${id} ${i}`).toBe(!!ch.gamble));
      }
    }
  });

  it('come to a secure government that leads', () => {
    const c = secure(career());
    expect(c.career!.government.pm).toBe(PS);
    expect(IDS.filter((id) => eligible(c, id)).length).toBeGreaterThanOrEqual(5);
  });

  it('do not come to a government that is shaky, in debt or short of credibility', () => {
    for (const bend of [(c: Campaign) => { c.career!.government.stability = 50; }, (c: Campaign) => { c.career!.economy.debt = 75; }, (c: Campaign) => { c.career!.credibility = 40; }]) {
      const c = secure(career());
      bend(c);
      expect(IDS.filter((id) => eligible(c, id)), 'none').toEqual([]);
    }
  });

  it('do not come to a party across the floor', () => {
    const across = ['ps', 'bp', 'pt', 'pe'].map((id) => PARTY_IDS.indexOf(id as (typeof PARTY_IDS)[number])).filter((i) => i >= 0).map((i) => career(i)).find((c) => seatOf(c) === 'opp');
    expect(across).toBeDefined();
    expect(IDS.filter((id) => eligible(secure(across!), id))).toEqual([]);
  });
});
