import { MAX_LEVEL } from '../sim/campaign/journey';
import { BOARD_SIZE, CONFIG, NAME_MIN, call, cleanName, headers, nameOk, type Config, type Fetch } from './leaderboard';

// The Career Campaign leaderboard: each player's highest level, posted on the player's say-so (see supabase/journey.sql).
// One row for each player, told apart by a random id kept in this browser; it is sent, never read back, and raises the row in place.

export interface LevelSubmission { player: string; name: string; party: string; level: number; governed: number; version: string }
export interface LevelRow { id: number; created_at: string; name: string; party: string; level: number; governed: number }

const ID_KEY = 'k222.journey.player';

/** A random id for this browser, made once. Without storage it is made fresh each time (the row is then a new one). */
export function playerId(): string {
  try {
    const held = localStorage.getItem(ID_KEY);
    if (held && held.length >= 8) return held;
    const made = (globalThis.crypto?.randomUUID?.() ?? `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`);
    localStorage.setItem(ID_KEY, made);
    return made;
  } catch { return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`; }
}

/** The row to send for a level reached, or null if the name is not one the board takes or there is nothing to rank yet. */
export function levelSubmission(player: string, name: string, level: number, governed: number, version: string): LevelSubmission | null {
  const clean = cleanName(name);
  if (!nameOk(clean) || clean.length < NAME_MIN || !Number.isInteger(level) || level < 1) return null;
  return { player, name: clean, party: 'genba', level: Math.min(MAX_LEVEL, level), governed: Math.max(0, Math.min(13, governed)), version: version.slice(0, 32) };
}

export type LevelPost = 'ok' | 'failed';
/** Posts a level, or raises the one already posted. Nothing is thrown. */
export async function postLevel(sub: LevelSubmission, cfg: Config | null = CONFIG, fetchFn: Fetch = fetch): Promise<LevelPost> {
  if (!cfg) return 'failed';
  const res = await call(fetchFn, `${cfg.url}/rest/v1/journey_levels?on_conflict=player`, {
    method: 'POST', headers: { ...headers(cfg), 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(sub),
  });
  return res && (res.status === 201 || res.status === 200 || res.status === 204) ? 'ok' : 'failed';
}

const isRow = (x: unknown): x is LevelRow => {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  return typeof r.id === 'number' && typeof r.name === 'string' && typeof r.party === 'string' && [r.level, r.governed].every((n) => typeof n === 'number' && Number.isFinite(n));
};

/** The highest levels, highest first, then by states governed, then whoever got there first. null if the board cannot be reached. */
export async function topLevels(cfg: Config | null = CONFIG, fetchFn: Fetch = fetch): Promise<LevelRow[] | null> {
  if (!cfg) return null;
  const q = `select=id,created_at,name,party,level,governed&order=level.desc,governed.desc,updated_at.asc&limit=${BOARD_SIZE}`;
  const res = await call(fetchFn, `${cfg.url}/rest/v1/journey_levels?${q}`, { headers: headers(cfg) });
  if (!res?.ok) return null;
  try { const body: unknown = await res.json(); return Array.isArray(body) ? body.filter(isRow) : null; } catch { return null; }
}
