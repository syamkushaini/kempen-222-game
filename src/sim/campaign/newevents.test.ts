import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { STRINGS, type StringKey } from '../../i18n/strings';
import { PARTY_IDS } from '../types';
import { scaled } from './actions';
import { startCareer } from './career';
import { COUNTRY_ONLY, EVENTS, eligible, resolveEvent, type Effect } from './events';
import { NEW_EVENTS } from './eventList8';
import type { Campaign } from './types';
import { isValidCampaign } from './validate';

const PS = PARTY_IDS.indexOf('ps'), BP = PARTY_IDS.indexOf('bp');
const world = getWorld('career')!;
const career = (player = PS, seed = 5): Campaign => {
  const c = startCareer(world, { player, difficulty: 'normal', seed });
  c.career!.obligations = [];
  c.parties[player]!.funds = scaled(world, 5_000_000);
  return c;
};
const ids = Object.keys(NEW_EVENTS);
/** The largest a single consequence is allowed to be, so that none of the new events can swing a game by itself. */
const BOUND: Partial<Record<Effect['t'], number>> = { mood: 0.06, unity: 5, funds: 100_000, cred: 3, stability: 3, trust: 4, machinery: 4, dossier: 8, fiscal: 1, rival: 0.012, relation: 5 };
const effectsOf = (id: string): Effect[] => EVENTS[id].choices.flatMap((c) => [...c.effects, ...(c.gamble ? [...c.gamble.win, ...c.gamble.lose] : [])]);

describe('forty more events', () => {
  it('are forty, and join the rest under ids of their own', () => {
    expect(ids).toHaveLength(40);
    for (const id of ids) expect(EVENTS[id].choices, id).toHaveLength(NEW_EVENTS[id].choices.length);
    expect(Object.keys(EVENTS).length).toBeGreaterThanOrEqual(205);
  });

  it('have the words in both languages for every option and every result, with a pair for each gamble', () => {
    for (const id of ids) {
      const def = EVENTS[id];
      for (const text of [EVENTS_EN[id], EVENTS_MS[id]]) {
        expect(text, id).toBeDefined();
        expect(text.title.length, id).toBeGreaterThan(3);
        expect(text.body.length, id).toBeGreaterThan(60);
        expect(text.options, id).toHaveLength(def.choices.length);
        expect(text.results, id).toHaveLength(def.choices.length);
        def.choices.forEach((ch, i) => {
          expect(Array.isArray(text.results[i]), `${id} ${i}`).toBe(!!ch.gamble);
          expect(text.options[i].length, `${id} o${i}`).toBeGreaterThan(5);
          for (const r of [text.results[i]].flat()) expect(r.length, `${id} r${i}`).toBeGreaterThan(20);
        });
      }
      expect(STRINGS.en[`event.${id}.title` as StringKey], id).toBeTruthy();
      expect(STRINGS.ms[`event.${id}.o0` as StringKey], id).toBeTruthy();
      expect(EVENTS_MS[id].title, id).not.toBe(EVENTS_EN[id].title);
    }
  });

  it('keep every consequence within the sizes the rest of the game uses', () => {
    for (const id of ids) {
      for (const e of effectsOf(id)) {
        const limit = BOUND[e.t];
        if (limit === undefined || !('n' in e)) continue;
        expect(Math.abs(e.n), `${id} ${e.t}`).toBeLessThanOrEqual(limit);
      }
      for (const ch of EVENTS[id].choices) {
        if (ch.gamble && typeof ch.gamble.chance === 'number') expect(ch.gamble.chance, id).toBeGreaterThan(0.2);
      }
      expect(EVENTS[id].choices.length, id).toBeGreaterThanOrEqual(3);
    }
  });

  it('only ask the government for what a government has, and the opposition for what it has', () => {
    for (const id of ids) {
      const role = EVENTS[id].role;
      const kinds = new Set(effectsOf(id).map((e) => e.t));
      if (role === 'opp' || role === 'any') for (const k of ['stability', 'trust', 'fiscal', 'nation', 'economy'] as const) expect(kinds.has(k), `${id} ${k}`).toBe(false);
    }
    for (const id of ['fakeNewsLaw', 'scamCalls', 'visaFree', 'foreignCampus', 'carbonRule']) expect(COUNTRY_ONLY.has(id), id).toBe(true);
  });

  it('can come to a player in the right seat, and every choice can be taken without breaking the game', () => {
    for (const id of ids) {
      const role = EVENTS[id].role;
      const player = role === 'opp' ? BP : PS;
      const c = career(player);
      // Put the player where the event is aimed: in government for a governing one, across the floor for an opposition one.
      if (role !== 'opp') { c.career!.government.pm = PS; }
      else { c.career!.government.pm = PS; c.career!.government.partners = []; }
      if (EVENTS[id].needs?.states) c.career!.states[world.states[0]] = c.player;
      const needs = EVENTS[id].needs;
      if (needs?.education !== undefined) c.career!.nation = { health: 60, education: 40, standing: 60 };
      expect(eligible(c, id), id).toBe(true);
      EVENTS[id].choices.forEach((_, choice) => {
        for (let seed = 1; seed <= 4; seed++) {
          const copy = structuredClone(c);
          copy.rng = seed * 7919;
          const scene = { id: 1, kind: 'event' as const, from: null, event: id };
          expect(resolveEvent(world, copy, scene, choice), `${id} ${choice}`).toBeDefined();
          expect(copy.news.at(-1)!.key, id).toMatch(new RegExp(`^event\\.${id}\\.r${choice}[wl]?$`));
          expect(isValidCampaign(JSON.parse(JSON.stringify(copy)), world), `${id} ${choice}`).toBe(true);
        }
      });
    }
  });

  it('turn up in play, from the pool, for a governing party and an opposing one', () => {
    const seen = new Set<string>();
    for (const player of [PS, BP]) {
      const c = career(player);
      for (const id of ids) if (eligible(c, id)) seen.add(id);
    }
    expect(seen.size).toBeGreaterThan(25);
  });
});
