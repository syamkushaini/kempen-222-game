import { describe, expect, it } from 'vitest';
import { liveDays, notePlay, parseStreak } from './streak';

const at = (d: number) => new Date(2026, 9, d, 12).getTime();

describe('the play streak', () => {
  it('starts at one and counts a second play on the same day once', () => {
    const a = notePlay(undefined, at(1));
    expect(a.days).toBe(1);
    expect(notePlay(a, at(1))).toBe(a);
  });
  it('grows on the next day and forgives one missed day', () => {
    let s = notePlay(undefined, at(1));
    s = notePlay(s, at(2));
    s = notePlay(s, at(4));
    expect(s.days).toBe(3);
    expect(s.best).toBe(3);
  });
  it('starts again after a longer break and keeps the best', () => {
    let s = notePlay(undefined, at(1));
    s = notePlay(s, at(2));
    s = notePlay(s, at(6));
    expect(s).toMatchObject({ days: 1, best: 2 });
  });
  it('shows no run once it has lapsed', () => {
    const s = notePlay(undefined, at(1));
    expect(liveDays(s, at(3))).toBe(1);
    expect(liveDays(s, at(4))).toBe(0);
  });
  it('drops nonsense when read back', () => {
    expect(parseStreak({ last: 'x', days: 2, best: 2 })).toBeUndefined();
    expect(parseStreak({ last: '2026-10-01', days: 3, best: 1 })).toEqual({ last: '2026-10-01', days: 3, best: 3 });
  });
});
