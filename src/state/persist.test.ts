import { beforeEach, describe, expect, it } from 'vitest';
import { forgetAsked, keepSaves } from './persist';

describe('asking the browser to keep the saves', () => {
  beforeEach(() => forgetAsked());

  it('asks once, and says whether it was granted', async () => {
    let calls = 0;
    const manager = { persisted: async () => false, persist: async () => { calls++; return true; } };
    expect(await keepSaves(manager)).toBe(true);
    expect(await keepSaves(manager)).toBe(false);
    expect(calls).toBe(1);
  });

  it('does not ask for what the browser already keeps', async () => {
    let calls = 0;
    expect(await keepSaves({ persisted: async () => true, persist: async () => { calls++; return true; } })).toBe(true);
    expect(calls).toBe(0);
  });

  it('does nothing where there is no storage manager, and never throws', async () => {
    expect(await keepSaves(undefined)).toBe(false);
    forgetAsked();
    expect(await keepSaves({ persist: async () => { throw new Error('refused'); } })).toBe(false);
  });
});
