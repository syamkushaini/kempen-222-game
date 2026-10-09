import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { LEGACY_IDS } from '../sim/campaign/types';
import { PARTY_IDS } from '../sim/types';
import {
  BOARD_SIZE, blocked, cleanName, configOf, lastName, nameOk, post, postedGames, rememberPosted, stateOf, submissionOf, top, type Config, type Submission,
} from './leaderboard';
import type { LegacyEntry } from './profile';

const cfg: Config = { url: 'https://abc.supabase.co', key: 'public-key' };
const entry: LegacyEntry = { game: 'lq3x9-1a2b3', at: 1, name: 'My campaign', party: 'ps', kind: 'retired', legacy: 'premier', score: 82, years: 14.96, yearsPm: 9.04, elections: 3, victories: 2, kept: 5, broken: 1 };
const sub = (over: Partial<Submission> = {}): Submission => ({ ...submissionOf(entry, { scenario: 'career', difficulty: 'normal' }, 'Ali', '0.1.0')!, ...over });
const reply = (status: number, body: unknown = null) => vi.fn(async () => new Response(body === null ? null : JSON.stringify(body), { status })) as unknown as typeof fetch;

describe('the name on the board', () => {
  it('is cleaned down to letters, digits and a few marks, in one line, at most 24 long', () => {
    expect(cleanName('  Ali   bin <b>Abu</b>  ')).toBe('Ali bin bAbub');
    expect(cleanName('Nurul Izzah 🙂')).toBe('Nurul Izzah');
    expect(cleanName('x'.repeat(60))).toHaveLength(24);
    expect(cleanName('Hajah Siti-Aminah')).toBe('Hajah Siti-Aminah');
    expect(cleanName('<script>')).toBe('script');
  });
  it('is turned away when it is too short or on the short list, in English or Malay, spaced or disguised', () => {
    expect(nameOk('A')).toBe(false);
    expect(nameOk('  ')).toBe(false);
    expect(nameOk('Ali')).toBe(true);
    for (const bad of ['fuck', 'F u C k', 'sh1t', 'b!tch', 'Pukimak', 'b4bi']) expect(blocked(bad), bad).toBe(true);
    for (const fine of ['Nazirah', 'Faisal', 'Social Dem', 'Kak Ros', 'Ahmad Zahid']) expect(nameOk(fine), fine).toBe(true);
  });
});

describe('what is sent', () => {
  it('is a career of the game, to the tenth of a year, within what the table accepts', () => {
    const s = submissionOf(entry, { scenario: 'career', difficulty: 'hard' }, '  Ali  ', '0.1.0+abc')!;
    expect(s).toMatchObject({ game: entry.game, name: 'Ali', party: 'ps', mode: 'federal', state: null, difficulty: 'hard', score: 82, years: 15, years_pm: 9, victories: 2, elections: 3 });
    expect(Object.keys(s).sort()).toEqual(['broken', 'difficulty', 'elections', 'game', 'kept', 'kind', 'legacy', 'mode', 'name', 'party', 'score', 'state', 'version', 'victories', 'years', 'years_pm']);
  });
  it('knows a career in a state, and no other contest', () => {
    expect(stateOf('career:perak')).toBe('perak');
    expect(stateOf('career')).toBeNull();
    expect(submissionOf(entry, { scenario: 'career:perak', difficulty: 'easy' }, 'Ali', 'v')).toMatchObject({ mode: 'state', state: 'perak' });
    for (const other of ['general', 'state:perak', 'by-election']) expect(submissionOf(entry, { scenario: other, difficulty: 'easy' }, 'Ali', 'v'), other).toBeNull();
  });
  it('is never past the limits of the table, whatever a career reached', () => {
    const s = submissionOf({ ...entry, score: 400, years: 900, yearsPm: 900, elections: 90, victories: 99, kept: 9000, broken: 9000 }, { scenario: 'career', difficulty: 'normal' }, 'Ali', 'v'.repeat(80))!;
    expect(s.score).toBe(100); expect(s.years).toBe(150); expect(s.years_pm).toBe(150); expect(s.elections).toBe(40); expect(s.victories).toBe(40);
    expect(s.kept).toBe(400); expect(s.broken).toBe(400); expect(s.version).toHaveLength(32);
    expect(submissionOf(entry, { scenario: 'career', difficulty: 'normal' }, 'A', 'v')).toBeNull();
    // A career that never fought an election has nothing to rank.
    expect(submissionOf({ ...entry, elections: 0, victories: 0 }, { scenario: 'career', difficulty: 'normal' }, 'Ali', 'v')).toBeNull();
  });
});

describe('talking to the board', () => {
  it('has none without an address and a key, or with an address that is not https', () => {
    expect(configOf({})).toBeNull();
    expect(configOf({ VITE_LEADERBOARD_URL: 'https://a.supabase.co' })).toBeNull();
    expect(configOf({ VITE_LEADERBOARD_URL: 'http://a.supabase.co', VITE_LEADERBOARD_KEY: 'k' })).toBeNull();
    expect(configOf({ VITE_LEADERBOARD_URL: ' https://a.supabase.co/ ', VITE_LEADERBOARD_KEY: ' k ' })).toEqual({ url: 'https://a.supabase.co', key: 'k' });
  });
  it('posts a career with the public key and nothing else, and says whether it took', async () => {
    const f = reply(201);
    expect(await post(sub(), cfg, f)).toBe('ok');
    const [url, init] = (f as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0];
    expect(url).toBe('https://abc.supabase.co/rest/v1/scores');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({ apikey: 'public-key', Authorization: 'Bearer public-key', Prefer: 'return=minimal' });
    expect(JSON.parse(init.body as string)).toEqual(sub());
    expect(await post(sub(), cfg, reply(409))).toBe('again');
    expect(await post(sub(), cfg, reply(400))).toBe('failed');
    expect(await post(sub(), cfg, reply(500))).toBe('failed');
    expect(await post(sub(), null, reply(201))).toBe('failed');
    expect(await post(sub(), cfg, vi.fn(async () => { throw new Error('offline'); }) as unknown as typeof fetch)).toBe('failed');
  });
  it('reads the best fifty, best first, and the ones of one kind of career when asked', async () => {
    const row = { id: 1, created_at: '2026-10-01T00:00:00Z', name: 'Ali', party: 'ps', mode: 'federal', state: null, difficulty: 'normal', kind: 'retired', legacy: 'premier', score: 90, years: '14.5', years_pm: '9.0', elections: 3, victories: 2, kept: 5, broken: 1 };
    const f = reply(200, [row, { nonsense: true }, { ...row, id: 2, score: 70 }]);
    const rows = await top('all', cfg, f);
    expect(rows).toHaveLength(2);
    expect(rows![0]).toMatchObject({ id: 1, score: 90, years: 14.5, years_pm: 9 });
    const url = (f as unknown as { mock: { calls: [string][] } }).mock.calls[0][0];
    expect(url).toContain('order=score.desc,victories.desc,years.desc,created_at.asc');
    expect(url).toContain(`limit=${BOARD_SIZE}`);
    expect(url).not.toContain('mode=eq');
    const g = reply(200, []);
    await top('state', cfg, g);
    expect((g as unknown as { mock: { calls: [string][] } }).mock.calls[0][0]).toContain('&mode=eq.state');
  });
  it('gives null, not an error, when the board cannot be reached or answers with rubbish', async () => {
    expect(await top('all', cfg, reply(500))).toBeNull();
    expect(await top('all', cfg, reply(200, { not: 'a list' }))).toBeNull();
    expect(await top('all', null, reply(200, []))).toBeNull();
    expect(await top('all', cfg, vi.fn(async () => { throw new Error('offline'); }) as unknown as typeof fetch)).toBeNull();
  });
});

describe('what the device remembers', () => {
  const memory = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };
  it('keeps the careers it has posted, and the name last used', () => {
    const kv = memory();
    expect(postedGames(kv)).toEqual([]);
    rememberPosted('g1', 'Ali', kv);
    rememberPosted('g2', 'Ali', kv);
    rememberPosted('g1', 'Abu', kv);
    expect(postedGames(kv)).toEqual(['g1', 'g2']);
    expect(lastName(kv)).toBe('Abu');
    expect(postedGames(null)).toEqual([]);
    expect(lastName(null)).toBe('');
  });
});

describe('the table is the one the game sends to', () => {
  const sql = readFileSync('supabase/leaderboard.sql', 'utf8');
  const list = (column: string) => new RegExp(`${column}\\s+text[^\\n]*check \\(${column} in \\(([^)]*)\\)`).exec(sql)![1].split(',').map((s) => s.trim().replace(/'/g, ''));
  it('takes every party, legacy, ending and difficulty the game has, and nothing else', () => {
    expect(list('party').sort()).toEqual([...PARTY_IDS].sort());
    expect(list('legacy').sort()).toEqual([...LEGACY_IDS].sort());
    expect(list('kind').sort()).toEqual(['retired', 'ousted', 'wipedOut'].sort());
    expect(list('difficulty').sort()).toEqual(['easy', 'hard', 'normal']);
    expect(list('mode').sort()).toEqual(['federal', 'state']);
  });
  it('can be read and added to by anyone, and changed by no one', () => {
    expect(sql).toMatch(/enable row level security/);
    expect(sql).toMatch(/for select to anon/);
    expect(sql).toMatch(/for insert to anon/);
    expect(sql).not.toMatch(/for (update|delete|all)/);
    expect(sql).toMatch(/grant select, insert on public\.scores to anon/);
    expect(sql).toMatch(/game\s+text not null unique/);
  });
});
