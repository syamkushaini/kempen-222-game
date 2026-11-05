import { describe, expect, it } from 'vitest';
import { CHAR_MS, atPause, delayAfter } from './useTypewriter';

describe('the typewriter clock', () => {
  it('waits a steady beat between letters, and longer after punctuation', () => {
    expect(delayAfter('a')).toBe(CHAR_MS);
    expect(delayAfter(' ')).toBe(CHAR_MS);
    expect(delayAfter(',')).toBeGreaterThan(CHAR_MS);
    expect(delayAfter('.')).toBeGreaterThan(delayAfter(','));
    expect(delayAfter('?')).toBe(delayAfter('.'));
  });
  it('rests the mouth at the end of a clause, not in the middle of a word', () => {
    expect(atPause('Boss, welcome.')).toBe(true);
    expect(atPause('Boss,')).toBe(true);
    expect(atPause('Boss, welcome. ')).toBe(true);
    expect(atPause('Boss, welc')).toBe(false);
    expect(atPause('')).toBe(false);
  });
});
