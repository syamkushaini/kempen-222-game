import { LEGACY_IDS } from '../sim/campaign/types';
import type { Campaign } from '../sim/campaign/types';
import type { LegacyEntry } from './profile';

// The online leaderboard: a finished career can be posted, by the player's choice, to a small table the maker owns (see
// supabase/leaderboard.sql), and the best ones are read back. The game talks to it with plain `fetch`; with no address
// configured, none of this shows. What is sent is only what is in `Submission`: no account, no device, no save.

export interface Config { url: string; key: string }

const trimEnd = (s: string) => s.replace(/\/+$/, '');
/** The leaderboard's address and public key from the build, or null when the game was built without one. */
export function configOf(env: { VITE_LEADERBOARD_URL?: string; VITE_LEADERBOARD_KEY?: string }): Config | null {
  const url = env.VITE_LEADERBOARD_URL?.trim(), key = env.VITE_LEADERBOARD_KEY?.trim();
  return url && key && /^https:\/\//.test(url) ? { url: trimEnd(url), key } : null;
}
export const CONFIG: Config | null = configOf(import.meta.env);

export type BoardMode = 'federal' | 'state';
export type Filter = 'all' | BoardMode;

/** One career as it is sent: a row of the table. */
export interface Submission {
  game: string;
  name: string;
  party: string;
  mode: BoardMode;
  state: string | null;
  difficulty: 'easy' | 'normal' | 'hard';
  kind: string;
  legacy: string;
  score: number;
  years: number;
  years_pm: number;
  elections: number;
  victories: number;
  kept: number;
  broken: number;
  version: string;
}

/** A row as it is read back. */
export interface Row extends Omit<Submission, 'game' | 'version'> { id: number; created_at: string }

const COLUMNS = 'id,created_at,name,party,mode,state,difficulty,kind,legacy,score,years,years_pm,elections,victories,kept,broken';
export const BOARD_SIZE = 50;
const WAIT_MS = 8000;

// ---------- the name on the board ----------

// A short list of what does not go on a public board, in English and in Malay, matched with the usual disguises undone.
const BLOCKED = ['fuck', 'shit', 'bitch', 'cunt', 'nigg', 'puki', 'pantat', 'lancau', 'kontol', 'bangsat', 'celaka', 'babi', 'sial', 'hitler'];
const DISGUISE: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's', '!': 'i' };
// Spaces go too, so that a name spaced out is still read as one word.
const plain = (s: string) => s.toLowerCase().replace(/[01345 7@$!]/g, (ch) => DISGUISE[ch] ?? '').replace(/[^a-z]/g, '');
export const blocked = (name: string): boolean => { const p = plain(name); return BLOCKED.some((w) => p.includes(w)); };

export const NAME_MIN = 2;
export const NAME_MAX = 24;
/** What a player typed, made fit for the board: letters, digits and a few marks, single spaces, at most 24 long. */
export function cleanName(raw: string): string {
  return raw.normalize('NFC').replace(/[^\p{L}\p{N} .'_-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX).trim();
}
/** Whether a name can be posted: long enough once cleaned, and not on the list. */
export const nameOk = (raw: string): boolean => { const n = cleanName(raw); return n.length >= NAME_MIN && !blocked(n); };

// ---------- what is sent ----------

/** The state a career was played in, from its scenario (`career:perak`), or null for the whole country. */
export const stateOf = (scenario: string): string | null => (scenario.startsWith('career:') ? scenario.slice('career:'.length) || null : null);

/** A career is ranked only if it fought an election: one that retired before the first has nothing to compare. */
export const countsForBoard = (entry: Pick<LegacyEntry, 'elections'>): boolean => entry.elections >= 1;

/** The row for a finished career, or null if it is not a career the board takes (it needs an ending of its own). */
export function submissionOf(entry: LegacyEntry, campaign: Pick<Campaign, 'scenario' | 'difficulty'>, name: string, version: string): Submission | null {
  const clean = cleanName(name);
  const state = stateOf(campaign.scenario);
  const isCareer = campaign.scenario === 'career' || state !== null;
  if (!isCareer || !countsForBoard(entry) || clean.length < NAME_MIN || !(LEGACY_IDS as readonly string[]).includes(entry.legacy)) return null;
  const tenth = (n: number) => Math.round(n * 10) / 10;
  const years = Math.min(150, tenth(entry.years));
  return {
    game: entry.game, name: clean, party: entry.party, mode: state ? 'state' : 'federal', state, difficulty: campaign.difficulty,
    kind: entry.kind, legacy: entry.legacy, score: Math.max(0, Math.min(100, Math.round(entry.score))),
    years, years_pm: Math.min(years, tenth(entry.yearsPm)), elections: Math.min(40, entry.elections), victories: Math.min(entry.victories, entry.elections, 40),
    kept: Math.min(400, entry.kept), broken: Math.min(400, entry.broken), version: version.slice(0, 32),
  };
}

type Fetch = typeof fetch;
const headers = (cfg: Config) => ({ apikey: cfg.key, Authorization: `Bearer ${cfg.key}` });

async function call(fetchFn: Fetch, url: string, init: RequestInit): Promise<Response | null> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), WAIT_MS);
  try { return await fetchFn(url, { ...init, signal: ctl.signal }); } catch { return null; } finally { clearTimeout(timer); }
}

export type PostResult = 'ok' | 'again' | 'failed';
/** Posts a career. 'again' if the board already has it (it can be posted once); 'failed' on any trouble, with nothing thrown. */
export async function post(sub: Submission, cfg: Config | null = CONFIG, fetchFn: Fetch = fetch): Promise<PostResult> {
  if (!cfg) return 'failed';
  const res = await call(fetchFn, `${cfg.url}/rest/v1/scores`, {
    method: 'POST', headers: { ...headers(cfg), 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(sub),
  });
  if (!res) return 'failed';
  if (res.status === 201 || res.status === 200 || res.status === 204) return 'ok';
  return res.status === 409 ? 'again' : 'failed';
}

const isRow = (x: unknown): x is Row => {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  return typeof r.id === 'number' && typeof r.name === 'string' && typeof r.party === 'string' && (r.mode === 'federal' || r.mode === 'state') &&
    [r.score, r.years, r.years_pm, r.elections, r.victories].every((n) => typeof n === 'number' || (typeof n === 'string' && Number.isFinite(Number(n))));
};

/** The best careers, best first: by score, then victories, then years. null if the board cannot be reached. */
export async function top(filter: Filter, cfg: Config | null = CONFIG, fetchFn: Fetch = fetch): Promise<Row[] | null> {
  if (!cfg) return null;
  const q = `select=${COLUMNS}&order=score.desc,victories.desc,years.desc,created_at.asc&limit=${BOARD_SIZE}${filter === 'all' ? '' : `&mode=eq.${filter}`}`;
  const res = await call(fetchFn, `${cfg.url}/rest/v1/scores?${q}`, { headers: headers(cfg) });
  if (!res?.ok) return null;
  let body: unknown;
  try { body = await res.json(); } catch { return null; }
  // Numbers may come back as text (numeric columns); they are read as numbers, and a row that is not one is dropped.
  return Array.isArray(body) ? body.filter(isRow).map((r) => ({ ...r, score: Number(r.score), years: Number(r.years), years_pm: Number(r.years_pm), elections: Number(r.elections), victories: Number(r.victories), kept: Number(r.kept), broken: Number(r.broken) })) : null;
}

// ---------- what this device remembers ----------

const POSTED_KEY = 'k222.posted';
const NAME_KEY = 'k222.boardName';

export function postedGames(kv: Pick<Storage, 'getItem'> | null = safeStorage()): string[] {
  try { const v = JSON.parse(kv?.getItem(POSTED_KEY) ?? '[]'); return Array.isArray(v) ? v.filter((g): g is string => typeof g === 'string') : []; } catch { return []; }
}
export function rememberPosted(game: string, name: string, kv: Pick<Storage, 'getItem' | 'setItem'> | null = safeStorage()): void {
  try { kv?.setItem(POSTED_KEY, JSON.stringify([game, ...postedGames(kv).filter((g) => g !== game)].slice(0, 100))); kv?.setItem(NAME_KEY, name); } catch { /* it is only a convenience */ }
}
export const lastName = (kv: Pick<Storage, 'getItem'> | null = safeStorage()): string => { try { return cleanName(kv?.getItem(NAME_KEY) ?? ''); } catch { return ''; } };

function safeStorage(): Storage | null { try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; } }
