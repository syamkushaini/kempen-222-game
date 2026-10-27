import { describe, expect, it } from 'vitest';
import { seedFromSearch } from './rng';

describe('seedFromSearch', () => {
  it('reads a seed from a plain query string', () => {
    expect(seedFromSearch('?seed=12345')).toBe(12345);
  });

  it('reads a seed alongside other params, in either position', () => {
    expect(seedFromSearch('?foo=bar&seed=42')).toBe(42);
    expect(seedFromSearch('?seed=42&foo=bar')).toBe(42);
  });

  it('is undefined with no seed param', () => {
    expect(seedFromSearch('')).toBeUndefined();
    expect(seedFromSearch('?foo=bar')).toBeUndefined();
  });

  it('is undefined for a seed that is not a plain whole number', () => {
    expect(seedFromSearch('?seed=abc')).toBeUndefined();
    expect(seedFromSearch('?seed=-5')).toBeUndefined();
    expect(seedFromSearch('?seed=1.5')).toBeUndefined();
  });
});
