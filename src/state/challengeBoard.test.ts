import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { PARTY_IDS } from '../sim/types';
import { challengeKey, postResult, resultOf, topResults, type ChallengeResult } from './challengeBoard';
import { BOARD_SIZE, type Config } from './leaderboard';

const cfg: Config = { url: 'https://abc.supabase.co', key: 'public-key' };
const reply = (status: number, body: unknown = null) => vi.fn(async () => new Response(body === null ? null : JSON.stringify(body), { status })) as unknown as typeof fetch;
const made = { challenge: { fog: false, noisy: false, code: '1~state:perlis~ps~4242~h~~4' }, difficulty: 'hard' as const, party: 'ps' };
const posted = (over: Partial<ChallengeResult> = {}): ChallengeResult => ({ ...resultOf('game-123456', made, 'Ali', '0.1.0', 9, 15, 0.4123456, null)!, ...over });

describe('which board a game belongs to', () => {
  it('is the code of a challenge a player made, or the name of one of the game’s own, and none for any other game', () => {
    expect(challengeKey({ challenge: { fog: false, noisy: false, code: '1~general~ps~1~h~~' } })).toBe('1~general~ps~1~h~~');
    expect(challengeKey({ challenge: { fog: true, noisy: true, goal: 'perlis' } })).toBe('set:perlis');
    expect(challengeKey({ challenge: { fog: true, noisy: false } })).toBeNull();
    expect(challengeKey({})).toBeNull();
  });
});

describe('what is posted', () => {
  it('is one election: the seats and share of the vote, to the tenth of a point, with the name cleaned', () => {
    const r = resultOf('game-123456', made, '  Ali  Abu ', '0.1.0+abc', 9, 15, 0.4123456, true)!;
    expect(r).toEqual({ game: 'game-123456', challenge: made.challenge.code, name: 'Ali Abu', party: 'ps', difficulty: 'hard', seats: 9, total_seats: 15, vote_share: 0.4123, met: true, version: '0.1.0+abc' });
    expect(Object.keys(r).sort()).toEqual(['challenge', 'difficulty', 'game', 'met', 'name', 'party', 'seats', 'total_seats', 'version', 'vote_share']);
  });
  it('is nothing where the figures are not an election’s, the name will not do, or the game is no challenge', () => {
    for (const bad of [
      resultOf('g-123456', made, 'A', 'v', 9, 15, 0.4, null), resultOf('g-123456', made, 'Ali', 'v', 16, 15, 0.4, null), resultOf('g-123456', made, 'Ali', 'v', -1, 15, 0.4, null),
      resultOf('g-123456', made, 'Ali', 'v', 1, 0, 0.4, null), resultOf('g-123456', made, 'Ali', 'v', 1, 223, 0.4, null), resultOf('g-123456', made, 'Ali', 'v', 1, 15, 1.2, null),
      resultOf('g-123456', { ...made, challenge: { fog: false, noisy: false } }, 'Ali', 'v', 1, 15, 0.4, null),
      resultOf('g-123456', { ...made, challenge: { fog: false, noisy: false, code: 'x'.repeat(81) } }, 'Ali', 'v', 1, 15, 0.4, null),
    ]) expect(bad).toBeNull();
    expect(resultOf('g-123456', made, 'Ali', 'v'.repeat(80), 0, 1, 0, null)!.version).toHaveLength(32);
  });
});

describe('talking to the challenge boards', () => {
  it('posts with the public key and nothing else, and says whether it took', async () => {
    const f = reply(201);
    expect(await postResult(posted(), cfg, f)).toBe('ok');
    const [url, init] = (f as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0];
    expect(url).toBe('https://abc.supabase.co/rest/v1/challenge_scores');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({ apikey: 'public-key', Authorization: 'Bearer public-key', Prefer: 'return=minimal' });
    expect(JSON.parse(init.body as string)).toEqual(posted());
    expect(await postResult(posted(), cfg, reply(409))).toBe('again');
    expect(await postResult(posted(), cfg, reply(400))).toBe('failed');
    expect(await postResult(posted(), null, reply(201))).toBe('failed');
    expect(await postResult(posted(), cfg, vi.fn(async () => { throw new Error('offline'); }) as unknown as typeof fetch)).toBe('failed');
  });

  it('reads one challenge’s board, most seats first, then the biggest share, and drops what is not a result', async () => {
    const row = { id: 1, created_at: '2026-10-10T00:00:00Z', name: 'Ali', party: 'ps', difficulty: 'hard', seats: 9, total_seats: 15, vote_share: '0.4123', met: null };
    const f = reply(200, [row, { nonsense: true }, { ...row, id: 2, seats: '7' }]);
    const rows = await topResults('1~state:perlis~ps~4242~h~~4', cfg, f);
    expect(rows).toHaveLength(2);
    expect(rows![0]).toMatchObject({ seats: 9, vote_share: 0.4123 });
    expect(rows![1].seats).toBe(7);
    const url = (f as unknown as { mock: { calls: [string][] } }).mock.calls[0][0];
    expect(url).toContain(`challenge=eq.${encodeURIComponent('1~state:perlis~ps~4242~h~~4')}`);
    expect(url).toContain('order=seats.desc,vote_share.desc,created_at.asc');
    expect(url).toContain(`limit=${BOARD_SIZE}`);
    expect(await topResults('set:perlis', cfg, reply(500))).toBeNull();
    expect(await topResults('set:perlis', cfg, reply(200, { not: 'a list' }))).toBeNull();
    expect(await topResults('set:perlis', null, reply(200, []))).toBeNull();
    expect(await topResults('x', cfg, reply(200, []))).toBeNull();
  });
});

describe('the table', () => {
  const sql = readFileSync('supabase/challenges.sql', 'utf8');
  it('accepts the parties and the levels of the game, no more and no fewer', () => {
    const list = (column: string) => [...(new RegExp(`${column}\\s+text not null check \\(${column} in \\(([^)]*)\\)`).exec(sql)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(list('party').sort()).toEqual([...PARTY_IDS].sort());
    expect(list('difficulty').sort()).toEqual(['easy', 'hard', 'normal']);
  });
  it('lets anyone read and add, and nobody change or delete', () => {
    expect(sql).toContain('grant select, insert on public.challenge_scores to anon');
    expect(sql).not.toMatch(/for (update|delete)/);
    expect(sql).toContain('game        text not null unique');
  });
});
