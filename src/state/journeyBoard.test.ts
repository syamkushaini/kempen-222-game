import { describe, expect, it } from 'vitest';
import { levelSubmission, postLevel, topLevels } from './journeyBoard';

const cfg = { url: 'https://x.supabase.co', key: 'k' };
const reply = (status: number, body: unknown = null) => (async () => new Response(body === null ? null : JSON.stringify(body), { status })) as unknown as typeof fetch;

describe('the level board', () => {
  it('builds a row from a clean name and a level, and refuses a bad name or a level below one', () => {
    expect(levelSubmission('player-1234', '  Aina  ', 5, 1, '1.0')).toMatchObject({ name: 'Aina', level: 5, governed: 1 });
    expect(levelSubmission('player-1234', 'x', 5, 1, '1')).toBeNull();
    expect(levelSubmission('player-1234', 'Aina', 0, 0, '1')).toBeNull();
    expect(levelSubmission('player-1234', 'Aina', 999, 99, '1')).toMatchObject({ level: 53, governed: 13 });
  });
  it('posts with an upsert and reports failure without throwing', async () => {
    const sub = levelSubmission('player-1234', 'Aina', 2, 0, '1')!;
    expect(await postLevel(sub, cfg, reply(201))).toBe('ok');
    expect(await postLevel(sub, cfg, reply(500))).toBe('failed');
    expect(await postLevel(sub, null, reply(201))).toBe('failed');
  });
  it('reads the rows back and drops what is not one', async () => {
    const rows = await topLevels(cfg, reply(200, [{ id: 1, created_at: 'a', name: 'A', party: 'genba', level: 9, governed: 2 }, { id: 'bad' }]));
    expect(rows).toHaveLength(1);
    expect(await topLevels(cfg, reply(500))).toBeNull();
  });
});
