import { describe, expect, it } from 'vitest';
import { getWorld } from '../data/world';
import { translate, type StringKey } from '../i18n/strings';
import { startCareer } from '../sim/campaign/career';
import { EVENTS, type Effect } from '../sim/campaign/events';
import { PARTY_IDS } from '../sim/types';
import { choiceHint, describeEffect } from './effectText';
import type { Format } from './hooks';

const world = getWorld('career')!;
const c = startCareer(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5 });
const f: Format = { int: String, pct: (x, d = 1) => `${(x * 100).toFixed(d)}%`, rm: (n) => `RM${Math.round(n)}`, days: String, time: String, dateTime: String };
const en = (key: StringKey, vars?: Record<string, string | number>) => translate('en', key, vars);
const ms = (key: StringKey, vars?: Record<string, string | number>) => translate('ms', key, vars);
/** An effect that does nothing (a nation of no change, say), written by a slip: there is nothing to say about it. */
const noop = (e: Effect) => (e.t === 'nation' && !e.health && !e.education && !e.standing) || (e.t === 'economy' && !e.growth && !e.inflation);
const allEffects = (): Effect[] => Object.values(EVENTS).flatMap((d) => d.choices.flatMap((ch) => [...ch.effects, ...(ch.gamble ? [...ch.gamble.win, ...ch.gamble.lose] : [])]));

describe('what a choice says it will do', () => {
  it('says something for every kind of effect that any decision can have, except the hidden flags', () => {
    const kinds = new Set(allEffects().map((e) => e.t));
    expect(kinds.size).toBeGreaterThan(15);
    for (const e of allEffects()) {
      // Flags and a chronicle note are bookkeeping for later events, not something the player needs told now.
      if (e.t === 'flag' || e.t === 'chronicle' || noop(e)) continue;
      expect(describeEffect(en, f, world, c, e), `${e.t}`).toBeTruthy();
      expect(describeEffect(ms, f, world, c, e), `${e.t} (ms)`).toBeTruthy();
    }
  });

  it('lists every effect that is certain and marks what is left to chance, in the same words as the effects themselves', () => {
    for (const [id, def] of Object.entries(EVENTS)) {
      for (const choice of def.choices) {
        const hint = choiceHint(en, f, world, c, choice, false);
        for (const e of choice.effects) {
          const said = describeEffect(en, f, world, c, e);
          if (said) expect(hint, `${id}: ${said}`).toContain(said);
        }
        if (choice.gamble) expect(hint, `${id} gamble`).toMatch(/%|gamble|Otherwise/i);
        if (!choice.gamble && choice.effects.every((e) => !describeEffect(en, f, world, c, e)) && !choice.then) expect(hint).toBe(en('hint.nothing'));
      }
    }
  });

  it('shows a mark where a choice has a sequel, and not where it has none', () => {
    const sacked = EVENTS.ministerScandal.choices[0];
    expect(sacked.then).toBeTruthy();
    expect(choiceHint(en, f, world, c, sacked, false)).toContain(en('hint.later'));
    expect(choiceHint(ms, f, world, c, sacked, false)).toContain(ms('hint.later'));
    const plain = EVENTS.flood.choices.find((ch) => !ch.then)!;
    expect(choiceHint(en, f, world, c, plain, false)).not.toContain(en('hint.later'));
  });

  it('keeps the odds of a gamble from a player who has chosen to play blind', () => {
    const gamble = Object.values(EVENTS).flatMap((d) => d.choices).find((ch) => ch.gamble)!;
    const seeing = choiceHint(en, f, world, c, gamble, false);
    const blind = choiceHint(en, f, world, c, gamble, true);
    expect(seeing).toMatch(/\d+% chance/);
    expect(blind).not.toMatch(/\d+% chance/);
  });
});
