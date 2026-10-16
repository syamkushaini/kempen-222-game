import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { EVENT_ART } from '../../ui/art/recipes';
import { PARTY_IDS } from '../types';
import { startCareer } from './career';
import { COUNTRY_ONLY, EVENTS, eligible, resolveEvent, seatOf, type Effect } from './events';
import { FORCES_AND_PESTEL } from './eventList15';
import { defenceOf } from './defence';
import { pestelOf } from './pestel';
import { playable } from './field';
import { forStanding, seatsOfEvent, standingOf } from './standing';
import { isValidCampaign } from './validate';
import type { Campaign } from './types';

const ids = Object.keys(FORCES_AND_PESTEL);
const world = getWorld('career')!;
const PS = PARTY_IDS.indexOf('ps');
const BOUND: Partial<Record<Effect['t'], number>> = { mood: 0.06, unity: 5, funds: 100_000, cred: 3, stability: 3, trust: 4, fiscal: 1, rival: 0.012 };
const SMALL = 8;
const effectsOf = (id: string): Effect[] => EVENTS[id].choices.flatMap((c) => [...c.effects, ...(c.gamble ? [...c.gamble.win, ...c.gamble.lose] : [])]);
const career = (): Campaign => { const c = startCareer(world, { player: PS, difficulty: 'normal', seed: 5 }); c.inbox = []; return c; };

describe('fifteen decisions for the PESTEL and defence meters', () => {
  it('are fifteen, with three choices and the words for each in both languages, a pair for each gamble', () => {
    expect(ids).toHaveLength(15);
    for (const id of ids) {
      expect(EVENTS[id].choices, id).toHaveLength(3);
      for (const text of [EVENTS_EN[id], EVENTS_MS[id]]) {
        expect(text, id).toBeDefined();
        expect(text.body.length, id).toBeGreaterThan(80);
        expect(text.options, id).toHaveLength(3);
        expect(text.results, id).toHaveLength(3);
        EVENTS[id].choices.forEach((ch, i) => expect(Array.isArray(text.results[i]), `${id} ${i}`).toBe(!!ch.gamble));
      }
      expect(EVENTS_MS[id].title, id).not.toBe(EVENTS_EN[id].title);
      expect(EVENT_ART[id], id).toBeTruthy();
    }
  });

  it('keep every consequence within the sizes the rest of the game uses, and leave a choice that costs nothing', () => {
    for (const id of ids) {
      for (const e of effectsOf(id)) {
        const limit = BOUND[e.t];
        if (limit !== undefined && 'n' in e) expect(Math.abs(e.n), `${id} ${e.t}`).toBeLessThanOrEqual(limit);
        if (e.t === 'pestel') for (const v of [e.cohesion, e.tech, e.environment, e.law]) expect(Math.abs(v ?? 0), `${id} pestel`).toBeLessThanOrEqual(SMALL);
        if (e.t === 'defence') for (const v of [e.readiness, e.influence]) expect(Math.abs(v ?? 0), `${id} defence`).toBeLessThanOrEqual(SMALL);
        if (e.t === 'nation') expect(Math.abs(e.standing ?? 0), `${id} nation`).toBeLessThanOrEqual(SMALL);
      }
      expect(EVENTS[id].choices.some((c) => !c.effects.some((e) => e.t === 'funds' && e.n < 0)), id).toBe(true);
    }
    const moves = (t: string) => ids.filter((id) => effectsOf(id).some((e) => e.t === t)).length;
    expect(moves('pestel')).toBeGreaterThanOrEqual(8);
    expect(moves('defence')).toBeGreaterThanOrEqual(6);
  });

  it('keep the armed forces to a country, and come to the place they were written for', () => {
    const forces = ids.filter((id) => effectsOf(id).some((e) => e.t === 'defence'));
    for (const id of forces) expect(COUNTRY_ONLY.has(id), id).toBe(true);
    const c = career();
    expect(standingOf(c)).toBe('pm');
    for (const id of ids) {
      const def = EVENTS[id];
      c.career!.fired = [];
      c.career!.defence = { readiness: 30, influence: 80 };
      const here = seatsOfEvent(id, def).includes('pm');
      expect(forStanding(id, def, 'pm'), id).toBe(here);
      expect(eligible(c, id), id).toBe(here);
      if (here) for (let choice = 0; choice < 3; choice++) {
        const copy = structuredClone(c);
        copy.rng = (choice + 3) * 7919;
        resolveEvent(world, copy, { id: 1, kind: 'event', from: null, event: id }, choice);
        expect(copy.news.at(-1)!.key, id).toMatch(new RegExp(`^event\\.${id}\\.r${choice}[wl]?$`));
        expect(isValidCampaign(JSON.parse(JSON.stringify(copy)), world), `${id} ${choice}`).toBe(true);
      }
    }
    // The opposition has its own: the white paper.
    expect(seatsOfEvent('forcesWhitePaper', EVENTS.forcesWhitePaper)).toEqual(['lead', 'opp']);
    expect(seatOf(career())).toBe('pm');
  });

  it('wait for the armed forces to be as weak, or as loud, as the story needs', () => {
    const c = career();
    const k = c.career!;
    for (const [id, state] of [['navyPatrolBoats', { readiness: 80, influence: 40 }], ['borderSensorsDown', { readiness: 80, influence: 40 }], ['forcesProcurementRow', { readiness: 50, influence: 40 }], ['forcesHousingDemand', { readiness: 50, influence: 60 }]] as const) {
      k.defence = { ...state };
      expect(eligible(c, id), `${id} quiet`).toBe(false);
    }
    k.defence = { readiness: 30, influence: 80 };
    for (const id of ['navyPatrolBoats', 'borderSensorsDown', 'forcesProcurementRow', 'forcesHousingDemand']) expect(eligible(c, id), id).toBe(true);
  });

  it('move the meters they say they move', () => {
    const c = career();
    resolveEvent(world, c, { id: 1, kind: 'event', from: null, event: 'schoolWifiGap' }, 0);
    expect(pestelOf(c.career!).tech).toBe(55);
    resolveEvent(world, c, { id: 2, kind: 'event', from: null, event: 'forcesProcurementRow' }, 0);
    expect(pestelOf(c.career!).law).toBe(59);
    expect(defenceOf(c.career!).influence).toBe(35);
    // A state has no armed forces: the effect is set aside.
    const w = getWorld('career:perak')!;
    const state = startCareer(w, { player: playable(w)[0], difficulty: 'normal', seed: 5 });
    resolveEvent(w, state, { id: 3, kind: 'event', from: null, event: 'forcesProcurementRow' }, 0);
    expect(state.career!.defence).toBeUndefined();
  });
});
