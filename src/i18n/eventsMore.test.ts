import { describe, expect, it } from 'vitest';
import { EVENTS } from '../sim/campaign/events';
import { EVENTS_EN, EVENTS_MS } from './events';
import { MORE_EN, MORE_MS, bodyVariant } from './eventsMore';
import { translate } from './strings';

describe('other tellings of the events that come every year', () => {
  it('are for real yearly events, in both languages, and differ from each other and the usual text', () => {
    expect(Object.keys(MORE_EN).sort()).toEqual(Object.keys(MORE_MS).sort());
    for (const id of Object.keys(MORE_EN)) {
      expect(EVENTS[id]?.yearly, id).toBeTruthy();
      expect(MORE_MS[id].length, id).toBe(MORE_EN[id].length);
      const texts = [EVENTS_EN[id].body, ...MORE_EN[id]];
      expect(new Set(texts).size, id).toBe(texts.length);
      const ms = [EVENTS_MS[id].body, ...MORE_MS[id]];
      expect(new Set(ms).size, id).toBe(ms.length);
    }
  });

  it('go round in turn, the usual one first, and an event with none is unchanged', () => {
    expect([1, 2, 3, 4, 5].map((n) => bodyVariant('monsoon', n))).toEqual([0, 1, 2, 0, 1]);
    expect(bodyVariant('ultimatum', 7)).toBe(0);
  });

  it('are found by the interface', () => {
    expect(translate('en', 'event.monsoon.body.1' as never)).toBe(MORE_EN.monsoon[0]);
    expect(translate('ms', 'event.haze.body.2' as never)).toBe(MORE_MS.haze[1]);
  });
});
