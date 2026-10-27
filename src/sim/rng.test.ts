import { describe, expect, it } from 'vitest';
import { seedFromSearch, seedLink } from './rng';

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

describe('seedLink', () => {
  it('drops any query or hash already on the link and puts the seed in their place', () => {
    expect(seedLink(42, 'https://example.org/game/')).toBe('https://example.org/game/?seed=42');
    expect(seedLink(42, 'https://example.org/game/?foo=bar')).toBe('https://example.org/game/?seed=42');
    expect(seedLink(42, 'https://example.org/game/#c=xyz')).toBe('https://example.org/game/?seed=42');
  });

  it('round-trips through seedFromSearch', () => {
    const url = new URL(seedLink(777, 'https://example.org/game/'));
    expect(seedFromSearch(url.search)).toBe(777);
  });
});
