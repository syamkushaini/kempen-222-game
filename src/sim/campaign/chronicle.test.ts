import { describe, expect, it } from 'vitest';
import { CHRONICLE_CAP, chronicleConsequence, chose, logChoice } from './chronicle';
import type { Campaign } from './types';

const stub = (week = 1): Campaign => ({ week } as unknown as Campaign);

describe('chronicle', () => {
  it('logs a choice and can be asked whether it happened', () => {
    const c = stub(5);
    expect(chose(c, 'tookBribe')).toBe(false);
    logChoice(c, 'tookBribe', 'Took the envelope');
    expect(chose(c, 'tookBribe')).toBe(true);
    expect(c.chronicle![0]).toEqual({ week: 5, tag: 'tookBribe', note: 'Took the envelope' });
  });

  it('caps the log so a long career does not grow it without bound', () => {
    const c = stub();
    for (let i = 0; i < CHRONICLE_CAP + 10; i++) logChoice(c, `t${i}`, 'note');
    expect(c.chronicle!.length).toBe(CHRONICLE_CAP);
    // The oldest entries fall off first.
    expect(c.chronicle!.some((e) => e.tag === 't0')).toBe(false);
  });

  it('fires a consequence once for an earlier choice, and only once', () => {
    const c = stub();
    logChoice(c, 'tookBribe', 'Took the envelope');
    let fired = 0;
    expect(chronicleConsequence(c, 'tookBribe', 'bribeHeadline', 'It gets out', () => fired++)).toBe(true);
    expect(fired).toBe(1);
    expect(chronicleConsequence(c, 'tookBribe', 'bribeHeadline', 'It gets out', () => fired++)).toBe(false);
    expect(fired).toBe(1);
  });

  it('does not fire a consequence for a choice that was never made', () => {
    const c = stub();
    let fired = 0;
    expect(chronicleConsequence(c, 'tookBribe', 'bribeHeadline', 'It gets out', () => fired++)).toBe(false);
    expect(fired).toBe(0);
  });
});
