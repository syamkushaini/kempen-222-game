import { describe, expect, it } from 'vitest';
import type { Identity } from './identity';
import { cleanPartyName, cleanPartyShort, levelSubmission, postLevel, topLevels } from './journeyBoard';

const cfg = { url: 'https://x.supabase.co', key: 'k' };
const reply = (status: number, body: unknown = null) => (async () => new Response(body === null ? null : JSON.stringify(body), { status })) as unknown as typeof fetch;
const party: Identity = { name: 'Parti Harapan Rakyat', short: 'phr', color: '#2F6FB0', emblem: 'paddy', leader: 'Aina', look: 0 };
const row = { id: 1, created_at: 'a', name: 'A', party_name: 'Parti A', party_short: 'PA', party_color: '#2f6fb0', emblem: 'sun', level: 9, governed: 2 };

describe('the level board', () => {
  it('builds a row from a clean name, the party the player made and a level', () => {
    expect(levelSubmission('player-1234', '  Aina  ', party, 5, 1, '1.0')).toEqual({
      player: 'player-1234', name: 'Aina', party_name: 'Parti Harapan Rakyat', party_short: 'PHR', party_color: '#2f6fb0', emblem: 'paddy',
      level: 5, governed: 1, version: '1.0',
    });
    expect(levelSubmission('player-1234', 'Aina', party, 999, 99, '1')).toMatchObject({ level: 53, governed: 13 });
  });
  it('refuses a bad name, no party, a level below one, or a party the board cannot show', () => {
    expect(levelSubmission('player-1234', 'x', party, 5, 1, '1')).toBeNull();
    expect(levelSubmission('player-1234', 'Aina', null, 5, 1, '1')).toBeNull();
    expect(levelSubmission('player-1234', 'Aina', party, 0, 0, '1')).toBeNull();
    expect(levelSubmission('player-1234', 'Aina', { ...party, name: 'Parti B4b1' }, 5, 1, '1')).toBeNull();
    expect(levelSubmission('player-1234', 'Aina', { ...party, color: 'red' }, 5, 1, '1')).toBeNull();
    expect(levelSubmission('player-1234', 'Aina', { ...party, emblem: 'skull' as Identity['emblem'] }, 5, 1, '1')).toBeNull();
  });
  it('tidies a party name and short name, and refuses what is left empty or not allowed', () => {
    expect(cleanPartyName('  Parti   <b>Rakyat</b>!! ')).toBe('Parti bRakyatb');
    expect(cleanPartyName('x')).toBe('');
    expect(cleanPartyShort('p.h-r 1')).toBe('PHR1');
    expect(cleanPartyShort('---')).toBe('');
  });
  it('posts through the post_level function and reports failure without throwing', async () => {
    const sub = levelSubmission('player-1234', 'Aina', party, 2, 0, '1')!;
    let seen: { url: string; body: Record<string, unknown> } | null = null;
    const spy = (async (url: string, init: RequestInit) => { seen = { url, body: JSON.parse(String(init.body)) }; return new Response(null, { status: 204 }); }) as unknown as typeof fetch;
    expect(await postLevel(sub, cfg, spy)).toBe('ok');
    expect(seen!.url).toBe('https://x.supabase.co/rest/v1/rpc/post_level');
    expect(seen!.body).toEqual({
      p_player: 'player-1234', p_name: 'Aina', p_party_name: 'Parti Harapan Rakyat', p_party_short: 'PHR', p_party_color: '#2f6fb0', p_emblem: 'paddy',
      p_level: 2, p_governed: 0, p_version: '1',
    });
    expect(await postLevel(sub, cfg, reply(200))).toBe('ok');
    expect(await postLevel(sub, cfg, reply(500))).toBe('failed');
    expect(await postLevel(sub, null, reply(201))).toBe('failed');
  });
  it('reads the rows back and drops what is not one', async () => {
    const rows = await topLevels(cfg, reply(200, [row, { ...row, id: 2, party_color: 'blue' }, { id: 'bad' }]));
    expect(rows).toHaveLength(1);
    expect(await topLevels(cfg, reply(500))).toBeNull();
  });
});
