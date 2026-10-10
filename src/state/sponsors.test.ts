import { describe, expect, it } from 'vitest';
import { THANKS } from '../data/thanks';
import { fetchSponsors, sponsorNames } from './sponsors';

const cfg = { url: 'https://example.supabase.co', key: 'public-key' };
const answer = (body: unknown, ok = true): typeof fetch => (async () => ({ ok, json: async () => body }) as Response) as typeof fetch;

describe('the top sponsors, from the table', () => {
  it('reads the names in the order the table gives, tidied', async () => {
    const got = await fetchSponsors(cfg, answer([{ name: 'Ali bin Abu' }, { name: '  Siti   Aminah ' }, { name: '' }, { nope: 1 }, { name: 'x'.repeat(200) }]));
    expect(got).toEqual(['Ali bin Abu', 'Siti Aminah']);
  });

  it('asks for them in the order of their position, with the public key, and nothing else', async () => {
    let seen = '';
    let sent: Record<string, string> = {};
    const spy = (async (url: string, init?: RequestInit) => { seen = url; sent = init?.headers as Record<string, string>; return { ok: true, json: async () => [{ name: 'A' }] } as Response; }) as unknown as typeof fetch;
    await fetchSponsors(cfg, spy);
    expect(seen).toContain('/rest/v1/sponsors?select=name&order=position.asc');
    expect(sent.apikey).toBe('public-key');
  });

  it('is null where there is no address, the table cannot be reached, or it says nothing usable', async () => {
    expect(await fetchSponsors(null, answer([]))).toBeNull();
    expect(await fetchSponsors(cfg, answer([], false))).toBeNull();
    expect(await fetchSponsors(cfg, answer([]))).toBeNull();
    expect(await fetchSponsors(cfg, answer({ message: 'no' }))).toBeNull();
    expect(await fetchSponsors(cfg, (async () => { throw new Error('offline'); }) as typeof fetch)).toBeNull();
  });

  it('falls back to the list built into the game', async () => {
    expect(await sponsorNames(cfg, answer([], false))).toEqual([...THANKS]);
    expect(await sponsorNames(null)).toEqual([...THANKS]);
    expect(await sponsorNames(cfg, answer([{ name: 'Dari jadual' }]))).toEqual(['Dari jadual']);
  });
});
