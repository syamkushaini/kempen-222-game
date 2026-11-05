import { MAX_LEVEL } from '../sim/campaign/journey';
import { EMBLEM_IDS, type EmblemId, type Identity } from './identity';
import { BOARD_SIZE, CONFIG, NAME_MIN, blocked, call, cleanName, headers, nameOk, type Config, type Fetch } from './leaderboard';

// The Career Campaign leaderboard: each player's highest level, posted on the player's say-so (see supabase/journey.sql).
// One row for each player, told apart by a random id kept in this browser; it is sent, never read back, and raises the row in place.
// A row carries the party the player made (its name, short name, colour and logo), so the board shows each player's own party.
// The party's own picture or flag, if the player uploaded one, is never sent: the board shows the chosen logo on the chosen colour.

export interface LevelSubmission {
  player: string; name: string;
  party_name: string; party_short: string; party_color: string; emblem: EmblemId;
  level: number; governed: number; version: string;
}
export interface LevelRow {
  id: number; created_at: string; name: string;
  party_name: string; party_short: string; party_color: string; emblem: EmblemId;
  level: number; governed: number;
}

const ID_KEY = 'k222.journey.player';
export const PARTY_NAME_MAX = 40;
export const PARTY_SHORT_MAX = 6;
const COLOR = /^#[0-9a-f]{6}$/;

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

/** A party's name made fit for a public board, or '' if it is not one the board takes. */
export function cleanPartyName(raw: string): string {
  const name = raw.normalize('NFC').replace(/[^\p{L}\p{N} .'&_-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, PARTY_NAME_MAX).trim();
  return name.length >= 2 && !blocked(name) ? name : '';
}
/** A party's short name: letters and digits, upper case, at most six; '' if none is left or it is not one the board takes. */
export function cleanPartyShort(raw: string): string {
  const short = raw.normalize('NFC').toUpperCase().replace(/[^\p{L}\p{N}]/gu, '').slice(0, PARTY_SHORT_MAX);
  return short.length >= 1 && !blocked(short) ? short : '';
}

/**
 * The row to send for a level reached, or null if there is nothing the board can take: a name that is not allowed, no party made yet,
 * a party whose name the board refuses, or no level to rank.
 */
export function levelSubmission(player: string, name: string, party: Identity | null, level: number, governed: number, version: string): LevelSubmission | null {
  const clean = cleanName(name);
  if (!nameOk(clean) || clean.length < NAME_MIN || !Number.isInteger(level) || level < 1 || !party) return null;
  const partyName = cleanPartyName(party.name), partyShort = cleanPartyShort(party.short);
  const color = party.color.toLowerCase();
  if (!partyName || !partyShort || !COLOR.test(color) || !(EMBLEM_IDS as readonly string[]).includes(party.emblem)) return null;
  return {
    player, name: clean, party_name: partyName, party_short: partyShort, party_color: color, emblem: party.emblem,
    level: Math.min(MAX_LEVEL, level), governed: Math.max(0, Math.min(13, governed)), version: version.slice(0, 32),
  };
}

export type LevelPost = 'ok' | 'failed';
/**
 * Posts a level, or raises the one already posted. Nothing is thrown. The table cannot be written to directly with the public key (it
 * could not even see the player column that tells one row from another), so the post goes through a function in the database,
 * `post_level` (supabase/journey.sql), which adds the row or raises it, and never lowers it.
 */
export async function postLevel(sub: LevelSubmission, cfg: Config | null = CONFIG, fetchFn: Fetch = fetch): Promise<LevelPost> {
  if (!cfg) return 'failed';
  const body = {
    p_player: sub.player, p_name: sub.name, p_party_name: sub.party_name, p_party_short: sub.party_short, p_party_color: sub.party_color,
    p_emblem: sub.emblem, p_level: sub.level, p_governed: sub.governed, p_version: sub.version,
  };
  const res = await call(fetchFn, `${cfg.url}/rest/v1/rpc/post_level`, {
    method: 'POST', headers: { ...headers(cfg), 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return res && (res.status === 200 || res.status === 204) ? 'ok' : 'failed';
}

const isRow = (x: unknown): x is LevelRow => {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  return typeof r.id === 'number' && typeof r.name === 'string' && typeof r.party_name === 'string' && typeof r.party_short === 'string'
    && typeof r.party_color === 'string' && COLOR.test(r.party_color) && (EMBLEM_IDS as readonly unknown[]).includes(r.emblem)
    && [r.level, r.governed].every((n) => typeof n === 'number' && Number.isFinite(n));
};

const LEVEL_COLUMNS = 'id,created_at,name,party_name,party_short,party_color,emblem,level,governed';
/** The highest levels, highest first, then by states governed, then whoever got there first. null if the board cannot be reached. */
export async function topLevels(cfg: Config | null = CONFIG, fetchFn: Fetch = fetch): Promise<LevelRow[] | null> {
  if (!cfg) return null;
  const q = `select=${LEVEL_COLUMNS}&order=level.desc,governed.desc,updated_at.asc&limit=${BOARD_SIZE}`;
  const res = await call(fetchFn, `${cfg.url}/rest/v1/journey_levels?${q}`, { headers: headers(cfg) });
  if (!res?.ok) return null;
  try { const body: unknown = await res.json(); return Array.isArray(body) ? body.filter(isRow) : null; } catch { return null; }
}
