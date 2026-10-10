import { describe, expect, it } from 'vitest';
import { ACHIEVEMENT_IDS } from '../sim/campaign/achievements';
import { STRINGS } from '../i18n/strings';
import { emptyProfile } from '../state/profile';
import { ACCENTS, SKINS, isAccent, isSkin, rewardOf, unlocked, wearing } from './cosmetics';
import { ground, luminance } from './shareCard';

const has = (...ids: (typeof ACHIEVEMENT_IDS)[number][]) => ({ ...emptyProfile(), achievements: Object.fromEntries(ids.map((id) => [id, 1])) });

describe('what achievements give to wear', () => {
  it('is earned by real achievements, each giving one thing, and a free choice is always there', () => {
    const unlocks = [...SKINS, ...ACCENTS].map((c) => c.unlock).filter((u) => u !== undefined);
    for (const u of unlocks) expect(ACHIEVEMENT_IDS, String(u)).toContain(u);
    expect(new Set(unlocks).size).toBe(unlocks.length);
    expect(unlocks.length).toBeGreaterThanOrEqual(9);
    expect(SKINS[0]).toMatchObject({ id: 'standard' });
    expect(ACCENTS[0]).toMatchObject({ id: 'party' });
    expect(SKINS.filter((s) => !s.unlock).map((s) => s.id)).toEqual(['standard']);
    expect(ACCENTS.filter((a) => !a.unlock).map((a) => a.id).sort()).toEqual(['lavender', 'party']);
    expect(new Set(SKINS.map((s) => s.id)).size).toBe(SKINS.length);
    expect(new Set(ACCENTS.map((a) => a.id)).size).toBe(ACCENTS.length);
  });

  it('is named in both languages, with what is needed to wear it', () => {
    for (const lang of ['en', 'ms'] as const) {
      for (const s of SKINS) expect(STRINGS[lang][`skin.${s.id}`], `${lang} ${s.id}`).toBeTruthy();
      for (const a of ACCENTS) expect(STRINGS[lang][`accent.${a.id}`], `${lang} ${a.id}`).toBeTruthy();
      for (const k of ['look.skin', 'look.accent', 'look.hint', 'look.locked', 'look.reward']) expect(STRINGS[lang][k], `${lang} ${k}`).toBeTruthy();
    }
  });

  it('is worn only once earned, and the standard look comes back where it is not (a cleared profile)', () => {
    const none = emptyProfile();
    expect(unlocked(none, SKINS[0])).toBe(true);
    expect(unlocked(none, SKINS[1])).toBe(false);
    expect(wearing(none, 'paper', 'batik')).toMatchObject({ skin: { id: 'standard' }, accent: { id: 'party' } });
    const got = has('pactMaker', 'firstWin');
    expect(wearing(got, 'paper', 'batik')).toMatchObject({ skin: { id: 'paper', scheme: 'light' }, accent: { id: 'batik', color: '#2f5fb3' } });
    expect(wearing(got, 'midnight', 'songket')).toMatchObject({ skin: { id: 'standard' }, accent: { id: 'party' } });
    expect(wearing(none, 'standard', 'lavender').accent.id).toBe('lavender');
    // A skin sets the scheme itself: paper is light, midnight is dark.
    expect(SKINS.find((s) => s.id === 'midnight')!.scheme).toBe('dark');
    expect(wearing(none, 'nonsense' as never, 'nonsense' as never)).toMatchObject({ skin: { id: 'standard' }, accent: { id: 'party' } });
  });

  it('is told of beside the achievement that gives it', () => {
    expect(rewardOf('pactMaker')).toEqual([{ kind: 'skin', id: 'paper' }]);
    expect(rewardOf('firstWin')).toEqual([{ kind: 'accent', id: 'batik' }]);
    expect(rewardOf('hawk')).toEqual([]);
    for (const c of [...SKINS, ...ACCENTS]) if (c.unlock) expect(rewardOf(c.unlock).map((r) => r.id)).toContain(c.id);
  });

  it('knows what a saved setting may say', () => {
    expect(isSkin('paper') && isSkin('standard')).toBe(true);
    expect(isSkin('gold') || isSkin(undefined) || isSkin(3)).toBe(false);
    expect(isAccent('saga') && isAccent('party')).toBe(true);
    expect(isAccent('pink') || isAccent(null)).toBe(false);
  });

  it('is a colour a button can be read on: white writing on every accent, as the game draws it', () => {
    for (const a of ACCENTS) {
      if (!a.color) continue;
      expect(a.color, a.id).toMatch(/^#[0-9a-f]{6}$/);
      const [base] = ground(a.color);
      // At least 4.5 to 1 against white.
      expect(1.05 / (luminance(base) + 0.05), a.id).toBeGreaterThanOrEqual(4.5);
    }
  });
});
