import { describe, expect, it } from 'vitest';
import { makeIdentity, PARTY_COLORS, DEFAULT_EMBLEMS } from './identity';
import { loadJourneyParty, saveJourneyParty } from './journeyParty';

const store = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };
const identity = makeIdentity({ name: 'Harapan Rakyat', short: 'HR', color: PARTY_COLORS[2], emblem: DEFAULT_EMBLEMS.genba, leader: 'Aina Rahman', look: 1 });

describe('the party made for the career campaign', () => {
  it('is remembered, with the player name', () => {
    const kv = store();
    expect(identity).not.toBeNull();
    saveJourneyParty({ name: 'Aina', identity }, kv);
    expect(loadJourneyParty(kv)).toEqual({ name: 'Aina', identity });
  });
  it('is ignored when nothing was saved or what was saved is not a usable party', () => {
    expect(loadJourneyParty(store())).toBeNull();
    const kv = store();
    kv.setItem('k222.journey.party', JSON.stringify({ name: 'A', identity: { name: 5 } }));
    expect(loadJourneyParty(kv)).toBeNull();
    kv.setItem('k222.journey.party', 'not json');
    expect(loadJourneyParty(kv)).toBeNull();
  });
});
