import { ACHIEVEMENT_IDS, type AchievementId } from '../sim/campaign/achievements';
import { POINTS_MAX } from '../sim/campaign/challengePoints';
import { careerYears } from '../sim/campaign/legacy';
import { LEGACY_IDS, type Campaign, type EndingKind, type LegacyId } from '../sim/campaign/types';
import { PARTY_IDS, type PartyId } from '../sim/types';
import type { GameState } from './game';
import type { KeyValueStore } from './saves';

/** One finished career, as it hangs in the gallery. */
export interface LegacyEntry {
  /** The game it came from, so that a career is hung once however often its save is reopened. */
  game: string;
  at: number;
  name: string;
  party: PartyId;
  kind: EndingKind;
  legacy: LegacyId;
  score: number;
  /** Years leading the party, and years of those at the head of the government. */
  years: number;
  yearsPm: number;
  elections: number;
  victories: number;
  kept: number;
  broken: number;
}

/**
 * What belongs to the player rather than to any one game: achievements earned
 * and careers finished. Kept apart from the saves, so deleting a save loses
 * neither.
 */
export interface Profile {
  version: 1;
  /** When each achievement was first earned. */
  achievements: Partial<Record<AchievementId, number>>;
  /** Newest first. */
  legacies: LegacyEntry[];
  /** The best points won in each challenge, by its key (see challengePoints.ts). */
  challengePoints?: Record<string, number>;
}

const KEY = 'k222.profile';
const MAX_LEGACIES = 40;
const MAX_CHALLENGES = 200;

export const emptyProfile = (): Profile => ({ version: 1, achievements: {}, legacies: [] });

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);

function isEntry(x: unknown): x is LegacyEntry {
  return isObj(x) && typeof x.game === 'string' && isNum(x.at) && typeof x.name === 'string' &&
    (PARTY_IDS as readonly unknown[]).includes(x.party) && (x.kind === 'retired' || x.kind === 'ousted' || x.kind === 'wipedOut') &&
    (LEGACY_IDS as readonly unknown[]).includes(x.legacy) &&
    [x.score, x.years, x.yearsPm, x.elections, x.victories, x.kept, x.broken].every(isNum);
}

/** Reads a profile from text. Anything unrecognised is dropped rather than trusted; nonsense gives an empty profile. */
export function parseProfile(text: string | null): Profile {
  const out = emptyProfile();
  if (!text) return out;
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return out; }
  if (!isObj(raw)) return out;
  if (isObj(raw.achievements)) {
    for (const id of ACHIEVEMENT_IDS) {
      const at = raw.achievements[id];
      if (isNum(at)) out.achievements[id] = at;
    }
  }
  if (Array.isArray(raw.legacies)) out.legacies = raw.legacies.filter(isEntry).slice(0, MAX_LEGACIES);
  if (isObj(raw.challengePoints)) {
    const kept = Object.entries(raw.challengePoints).filter(([key, n]) => key.length >= 4 && key.length <= 80 && isNum(n) && n >= 0 && n <= POINTS_MAX).slice(0, MAX_CHALLENGES);
    if (kept.length > 0) out.challengePoints = Object.fromEntries(kept) as Record<string, number>;
  }
  return out;
}

/** The gallery entry for a career that has ended, or null if the game has no ending to record. */
export function legacyEntry(game: GameState, now: number): LegacyEntry | null {
  const c: Campaign = game.campaign;
  const k = c.career;
  if (!k?.ending) return null;
  const r = k.record;
  return {
    game: game.id, at: now, name: game.name, party: PARTY_IDS[c.player],
    kind: k.ending.kind, legacy: k.ending.legacy, score: k.ending.score,
    years: careerYears(c), yearsPm: r.weeksPm / 52,
    elections: r.elections, victories: r.victories, kept: r.kept.length, broken: r.broken,
  };
}

/** Adds achievements not yet held. Returns the new profile and which were new; the same profile if none were. */
export function award(profile: Profile, ids: AchievementId[], now: number): { profile: Profile; fresh: AchievementId[] } {
  const fresh = ids.filter((id) => profile.achievements[id] === undefined);
  if (fresh.length === 0) return { profile, fresh };
  const achievements = { ...profile.achievements };
  for (const id of fresh) achievements[id] = now;
  return { profile: { ...profile, achievements }, fresh };
}

/** Keeps the best points a challenge has brought. Returns the same profile if these are not better than what is held. */
export function recordPoints(profile: Profile, key: string, points: number): Profile {
  if ((profile.challengePoints?.[key] ?? -1) >= points) return profile;
  const held = { ...(profile.challengePoints ?? {}), [key]: points };
  // The oldest keys give way where the list is full (the one just won is always kept).
  const keys = Object.keys(held);
  for (const old of keys.slice(0, Math.max(0, keys.length - MAX_CHALLENGES))) if (old !== key) delete held[old];
  return { ...profile, challengePoints: held };
}

/** The points a player has won in all the challenges, each counted at its best. */
export const totalPoints = (profile: Profile): number => Object.values(profile.challengePoints ?? {}).reduce((a, n) => a + n, 0);

/** Hangs a finished career in the gallery, once. Returns the same profile if it is already there. */
export function hang(profile: Profile, entry: LegacyEntry): Profile {
  if (profile.legacies.some((e) => e.game === entry.game)) return profile;
  return { ...profile, legacies: [entry, ...profile.legacies].slice(0, MAX_LEGACIES) };
}

/** Reads and writes the profile. Storage can be missing or full; nothing here throws. */
export class ProfileStore {
  constructor(private kv: KeyValueStore | null) {}

  load(): Profile {
    try { return parseProfile(this.kv?.getItem(KEY) ?? null); } catch { return emptyProfile(); }
  }

  save(profile: Profile): boolean {
    if (!this.kv) return false;
    try { this.kv.setItem(KEY, JSON.stringify(profile)); return true; } catch { return false; }
  }
}
