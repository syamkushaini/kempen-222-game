import type { AchievementId } from '../sim/campaign/achievements';
import type { Profile } from '../state/profile';

// The look of the game that can be changed, and the achievements that give it. A skin is the surface the screens are drawn
// on (paper, midnight); an accent is the colour of the buttons, the active tab and the focus ring. The game's own is the
// standard skin and the colour of the party being led (the lavender on the title screen); every other choice is earned.

export type SkinId = 'standard' | 'paper' | 'midnight';
export type AccentId = 'party' | 'lavender' | 'batik' | 'kopi' | 'senja' | 'rimba' | 'orkid' | 'songket' | 'saga';

export interface Skin { id: SkinId; /** The colour scheme it forces, or null where the player's own choice stands. */ scheme: 'light' | 'dark' | null; unlock?: AchievementId }
export interface Accent { id: AccentId; color?: string; unlock?: AchievementId }

export const SKINS: readonly Skin[] = [
  { id: 'standard', scheme: null },
  { id: 'paper', scheme: 'light', unlock: 'pactMaker' },
  { id: 'midnight', scheme: 'dark', unlock: 'survivor' },
];

export const ACCENTS: readonly Accent[] = [
  { id: 'party' },
  { id: 'lavender', color: '#5e6ad2' },
  { id: 'batik', color: '#2f5fb3', unlock: 'firstWin' },
  { id: 'kopi', color: '#8a5a35', unlock: 'firstMission' },
  { id: 'senja', color: '#c8641f', unlock: 'fullTerm' },
  { id: 'rimba', color: '#1f7a4d', unlock: 'shoestring' },
  { id: 'orkid', color: '#8a3fb0', unlock: 'bigTent' },
  { id: 'songket', color: '#a77b12', unlock: 'landslide' },
  { id: 'saga', color: '#c23b3b', unlock: 'absurd' },
];

export const isSkin = (x: unknown): x is SkinId => SKINS.some((s) => s.id === x);
export const isAccent = (x: unknown): x is AccentId => ACCENTS.some((a) => a.id === x);

/** Whether a skin or an accent is the player's to wear: the free ones, and those whose achievement is on the profile. */
export const unlocked = (profile: Pick<Profile, 'achievements'>, item: { unlock?: AchievementId }): boolean =>
  item.unlock === undefined || profile.achievements[item.unlock] !== undefined;

/** The skin and accent that will be worn: what was chosen if it is earned, the standard look if it is not (a cleared profile, a borrowed device). */
export function wearing(profile: Pick<Profile, 'achievements'>, skin: SkinId, accent: AccentId): { skin: Skin; accent: Accent } {
  const s = SKINS.find((x) => x.id === skin);
  const a = ACCENTS.find((x) => x.id === accent);
  return { skin: s && unlocked(profile, s) ? s : SKINS[0], accent: a && unlocked(profile, a) ? a : ACCENTS[0] };
}

/** What an achievement gives, if it gives anything: the names of a skin or an accent. */
export const rewardOf = (id: AchievementId): { kind: 'skin' | 'accent'; id: SkinId | AccentId }[] => [
  ...SKINS.filter((s) => s.unlock === id).map((s) => ({ kind: 'skin' as const, id: s.id })),
  ...ACCENTS.filter((a) => a.unlock === id).map((a) => ({ kind: 'accent' as const, id: a.id })),
];
