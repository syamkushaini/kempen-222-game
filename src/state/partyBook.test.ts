import { describe, expect, it } from 'vitest';
import { getWorld, newPartyWorld } from '../data/world';
import { PARTY_IDS } from '../sim/types';
import { forgetParty, keepParty, MAX_SAVED_PARTIES, parseParties, PartyBook } from './partyBook';
import { makeIdentity, type Identity } from './identity';
import type { KeyValueStore } from './saves';

const mk = (name: string, short = name.slice(0, 3), extra: object = {}): Identity =>
  makeIdentity({ name, short, color: '#0f766e', emblem: 'star', leader: 'Aminah', look: 1, ...extra })!;
function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => { data.set(k, v); }, removeItem: (k) => { data.delete(k); } };
}

describe('saved parties', () => {
  it('keeps a party, newest first, and replaces one of the same name', () => {
    let l = keepParty([], mk('Parti Satu'), 10);
    l = keepParty(l, mk('Parti Dua'), 10);
    l = keepParty(l, mk('parti satu', 'PAR'), 5);
    expect(l.map((p) => p.identity.name)).toEqual(['parti satu', 'Parti Dua']);
    expect(keepParty(l, mk('PARTI SATU', 'PAR'), 5).map((p) => p.identity.name)).toEqual(['PARTI SATU', 'Parti Dua']);
    expect(new Set(l.map((p) => p.at)).size).toBe(l.length);
  });

  it('caps the list and forgets one by its time', () => {
    let l = [] as ReturnType<typeof keepParty>;
    for (let i = 0; i < MAX_SAVED_PARTIES + 3; i++) l = keepParty(l, mk(`Parti ${i}`), i);
    expect(l).toHaveLength(MAX_SAVED_PARTIES);
    expect(forgetParty(l, l[0].at)).toHaveLength(MAX_SAVED_PARTIES - 1);
  });

  it('round-trips through storage and survives a missing or broken store', () => {
    const kv = memoryStore();
    const book = new PartyBook(kv);
    expect(book.load()).toEqual([]);
    const l = keepParty([], mk('Parti Satu', 'PS1', { flag: undefined }), 1);
    expect(book.save(l)).toBe(true);
    expect(new PartyBook(kv).load()).toEqual(l);
    expect(new PartyBook(null).save(l)).toBe(false);
    expect(new PartyBook(null).load()).toEqual([]);
    const full: KeyValueStore = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); }, removeItem: () => {} };
    expect(new PartyBook(full).load()).toEqual([]);
    expect(new PartyBook(full).save(l)).toBe(false);
  });

  it('drops anything invalid on load', () => {
    const good = { at: 1, identity: mk('Parti Baik') };
    const text = JSON.stringify([
      good, null, 'x', { at: 'now', identity: good.identity }, { at: 2, identity: null },
      { at: 3, identity: { ...good.identity, color: '#ffffff' } },
      { at: 4, identity: { ...good.identity, name: '  ' } },
      { at: 5, identity: { ...good.identity, flag: 'javascript:alert(1)' } },
      { at: 6, identity: { ...good.identity, look: 99 } },
      { at: 7, identity: { ...good.identity, name: 'Pakatan Sinar', short: 'XX' } },
      { at: 1, identity: mk('Duplicate At') },
    ]);
    expect(parseParties(text)).toEqual([good]);
    expect(parseParties('not json')).toEqual([]);
    expect(parseParties('{"a":1}')).toEqual([]);
    expect(parseParties(null)).toEqual([]);
  });

  it('refuses a party that would pass for an established one', () => {
    expect(keepParty([], mk('Barisan Pusaka', 'XX'), 1)).toEqual([]);
    expect(keepParty([], mk('Parti Baru', 'ps'), 1)).toEqual([]);
  });

  it('is only a look: it brings no party id, so it fits a general election as it fits a by-election', () => {
    const [saved] = keepParty([], mk('Parti Satu'), 1);
    for (const w of [getWorld('general')!, newPartyWorld('general')!, newPartyWorld('byelection')!]) expect(w.seats.length).toBeGreaterThan(0);
    expect(PARTY_IDS).toContain('genba');
    expect(Object.keys(saved.identity).sort()).toEqual(['color', 'emblem', 'leader', 'look', 'name', 'short']);
  });
});
