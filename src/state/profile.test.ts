import { describe, expect, it } from 'vitest';
import { getWorld } from '../data/world';
import { HONOURS_EN, HONOURS_MS } from '../i18n/honours';
import { ACHIEVEMENT_IDS } from '../sim/campaign/achievements';
import { startCareer } from '../sim/campaign/career';
import { retire } from '../sim/campaign/legacy';
import { newGame } from './game';
import { award, emptyProfile, hang, legacyEntry, parseProfile, ProfileStore } from './profile';
import type { KeyValueStore } from './saves';

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => { data.set(k, v); }, removeItem: (k) => { data.delete(k); } };
}
const endedGame = (name = 'Done', now = 1000) => {
  const g = newGame(name, startCareer(getWorld('career')!, { player: 0, difficulty: 'normal', seed: now }), now);
  g.campaign.career!.week = 130;
  g.campaign.career!.record.weeksPm = 129;
  retire(g.campaign);
  return g;
};

describe('the profile', () => {
  it('records each achievement once, with the time it was first earned', () => {
    const first = award(emptyProfile(), ['firstWin', 'katak'], 100);
    expect(first.fresh).toEqual(['firstWin', 'katak']);
    const again = award(first.profile, ['firstWin', 'majority'], 200);
    expect(again.fresh).toEqual(['majority']);
    expect(again.profile.achievements).toEqual({ firstWin: 100, katak: 100, majority: 200 });
    // Nothing new: the very same profile comes back, so nothing is written.
    expect(award(again.profile, ['katak'], 300).profile).toBe(again.profile);
  });

  it('hangs a finished career in the gallery once, newest first', () => {
    const a = endedGame('First', 1000), b = endedGame('Second', 2000);
    expect(legacyEntry(newGame('Going', startCareer(getWorld('career')!, { player: 0, difficulty: 'normal', seed: 1 }), 5), 9)).toBeNull();
    const entry = legacyEntry(a, 5000)!;
    expect(entry).toMatchObject({ game: a.id, name: 'First', party: 'ps', kind: 'retired', legacy: 'premier', years: 129 / 52, yearsPm: 129 / 52, elections: 0 });
    let p = hang(emptyProfile(), entry);
    expect(hang(p, legacyEntry(a, 9999)!)).toBe(p);
    p = hang(p, legacyEntry(b, 6000)!);
    expect(p.legacies.map((e) => e.name)).toEqual(['Second', 'First']);
  });

  it('survives a round trip through storage and shrugs off damage', () => {
    const kv = memoryStore();
    const store = new ProfileStore(kv);
    expect(store.load()).toEqual(emptyProfile());
    const p = hang(award(emptyProfile(), ['landslide'], 42).profile, legacyEntry(endedGame(), 77)!);
    expect(store.save(p)).toBe(true);
    expect(store.load()).toEqual(p);

    expect(parseProfile('not json')).toEqual(emptyProfile());
    expect(parseProfile('[1,2,3]')).toEqual(emptyProfile());
    const mixed = parseProfile(JSON.stringify({
      achievements: { landslide: 42, invented: 1, katak: 'yesterday' },
      legacies: [p.legacies[0], { ...p.legacies[0], legacy: 'emperor' }, null, 'x'],
    }));
    expect(mixed.achievements).toEqual({ landslide: 42 });
    expect(mixed.legacies).toEqual([p.legacies[0]]);
    expect(new ProfileStore(null).save(p)).toBe(false);
    expect(new ProfileStore(null).load()).toEqual(emptyProfile());
  });

  it('keeps the gallery to a sensible length', () => {
    let p = emptyProfile();
    for (let i = 0; i < 45; i++) p = hang(p, { ...legacyEntry(endedGame(), i)!, game: `g${i}` });
    expect(p.legacies).toHaveLength(40);
    expect(p.legacies[0].game).toBe('g44');
  });
});

describe('the words for it all', () => {
  it('exist in both languages for every achievement', () => {
    for (const table of [HONOURS_EN, HONOURS_MS] as Record<string, string>[]) {
      for (const id of ACHIEVEMENT_IDS) {
        expect(table[`ach.${id}`], id).toBeTruthy();
        expect(table[`ach.${id}.desc`], id).toBeTruthy();
      }
    }
    expect(Object.keys(HONOURS_MS).sort()).toEqual(Object.keys(HONOURS_EN).sort());
    // Placeholders match, so nothing is left unfilled in one language.
    const holes = (s: string) => (s.match(/\{[a-z]+\}/gi) ?? []).sort().join();
    for (const [key, text] of Object.entries(HONOURS_EN)) expect(holes((HONOURS_MS as Record<string, string>)[key]), key).toBe(holes(text));
  });
});
