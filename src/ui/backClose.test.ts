import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createBackStack, type HistoryLike } from './backClose';

/** A history that goes back one entry at a time, like the browser's, with the popstate left to the test. */
function fake() {
  const entries: unknown[] = [null];
  let at = 0;
  const h: HistoryLike = {
    pushState(state) { entries.length = at + 1; entries.push(state); at++; },
    back() { at--; },
    get state() { return entries[at]; },
  };
  return { h, at: () => at };
}

describe('the Back stack', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('closes the sheet on top when Back is pressed, and leaves the one below', () => {
    const { h } = fake();
    const s = createBackStack(h);
    const closed: string[] = [];
    s.push(() => closed.push('a'));
    s.push(() => closed.push('b'));
    vi.runAllTimers();
    h.back(); s.popped();
    expect(closed).toEqual(['b']);
  });

  it('takes its own entry off when a sheet is closed by its button, and does not close the next one', () => {
    const { h, at } = fake();
    const s = createBackStack(h);
    const closed: string[] = [];
    s.push(() => closed.push('a'));
    const done = s.push(() => closed.push('b'));
    vi.runAllTimers();
    done();
    s.popped();
    expect(closed).toEqual([]);
    expect(at()).toBe(1);
  });

  it('does not take an entry off twice when Back already did', () => {
    const { h, at } = fake();
    const s = createBackStack(h);
    let done = () => {};
    done = s.push(() => done());
    vi.runAllTimers();
    h.back(); s.popped();
    expect(at()).toBe(0);
    expect(s.depth).toBe(0);
  });

  it('leaves nothing on the history for a sheet shut in the same moment it was opened', () => {
    const { h, at } = fake();
    const s = createBackStack(h);
    s.push(() => {})();
    vi.runAllTimers();
    expect(at()).toBe(0);
  });
});
