import { describe, expect, it } from 'vitest';
import { EVENTS } from './events';
import { GOVERN_EFFECTS } from './governEffects';

describe('the consequences of government decisions', () => {
  it('are added to the choices they name, after what the choice already did', () => {
    for (const [id, byChoice] of Object.entries(GOVERN_EFFECTS)) {
      for (const [i, more] of Object.entries(byChoice)) {
        const effects = EVENTS[id].choices[Number(i)].effects;
        for (const e of more) expect(effects).toContainEqual(e);
      }
    }
  });

  it('show the treasury, the nation and the economy where they matter', () => {
    expect(EVENTS.examLeak.choices[0].effects.some((e) => e.t === 'public')).toBe(true);
    expect(EVENTS.examLeak.choices[0].effects.some((e) => e.t === 'nation')).toBe(true);
    expect(EVENTS.riverCourt.choices[0].effects.some((e) => e.t === 'economy')).toBe(true);
  });
});
