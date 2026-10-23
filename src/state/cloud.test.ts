import { describe, expect, it } from 'vitest';
import { CloudSaves, pack, readSession, sessionFrom, unpack, type Store } from './cloud';
import { inAppBrowser } from './environment';
import { newerInCloud } from './cloudSync';

const cfg = { url: 'https://x.supabase.co', key: 'anon-key' };
const memory = (): Store & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
};
interface Call { url: string; method: string; headers: Record<string, string>; body: unknown }
const reply = (status: number, body?: unknown) => new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const server = (route: (c: Call) => Response | null) => {
  const calls: Call[] = [];
  const fetchFn = (async (url: string, init: RequestInit = {}) => {
    const c: Call = { url, method: init.method ?? 'GET', headers: (init.headers ?? {}) as Record<string, string>, body: typeof init.body === 'string' ? JSON.parse(init.body) : undefined };
    calls.push(c);
    return route(c) ?? reply(404);
  }) as typeof fetch;
  return { calls, fetchFn };
};
const goodSession = { access_token: 'a1', refresh_token: 'r1', expires_in: 3600, user: { id: 'u1', email: 'p@example.com' } };

describe('signing in with a code sent by e-mail', () => {
  it('asks for a code for a good address, and refuses a bad one without asking', async () => {
    const s = server((c) => (c.url.endsWith('/auth/v1/otp') ? reply(200, {}) : null));
    const cloud = new CloudSaves(cfg, s.fetchFn, memory());
    expect(await cloud.requestCode('not an address')).toBe('invalid');
    expect(s.calls).toHaveLength(0);
    expect(await cloud.requestCode('  P@Example.com ')).toBe('sent');
    expect(s.calls[0].body).toEqual({ email: 'p@example.com', create_user: true });
    expect(s.calls[0].headers.apikey).toBe('anon-key');
  });

  it('says so when mail is being asked for too often, and when the service cannot be reached', async () => {
    expect(await new CloudSaves(cfg, server(() => reply(429)).fetchFn, memory()).requestCode('p@example.com')).toBe('limited');
    expect(await new CloudSaves(cfg, (async () => { throw new Error('offline'); }) as typeof fetch, memory()).requestCode('p@example.com')).toBe('failed');
  });

  it('signs in with the code, and keeps the session on the device', async () => {
    const kv = memory();
    const s = server((c) => (c.url.endsWith('/auth/v1/verify') ? reply(200, goodSession) : null));
    const cloud = new CloudSaves(cfg, s.fetchFn, kv, () => 1_000_000);
    expect(await cloud.verify('p@example.com', '12ab')).toBe('wrong');
    expect(s.calls).toHaveLength(0);
    expect(await cloud.verify('p@example.com', '123456')).toBe('ok');
    expect(s.calls[0].body).toEqual({ type: 'email', email: 'p@example.com', token: '123456' });
    expect(readSession(kv)).toEqual({ access: 'a1', refresh: 'r1', expiresAt: 1_000_000 + 3_600_000, userId: 'u1', email: 'p@example.com' });
    expect(cloud.session()?.email).toBe('p@example.com');
  });

  it('is told a wrong or old code is wrong, and leaves nobody signed in', async () => {
    const kv = memory();
    const cloud = new CloudSaves(cfg, server(() => reply(403, { msg: 'expired' })).fetchFn, kv);
    expect(await cloud.verify('p@example.com', '123456')).toBe('wrong');
    expect(cloud.session()).toBeNull();
  });

  it('reads a session only from an answer that is one', () => {
    expect(sessionFrom({ access_token: 'a', refresh_token: 'r', user: { id: 'u' } }, 5, 'q@example.com')?.email).toBe('q@example.com');
    expect(sessionFrom({ access_token: 'a' }, 5)).toBeNull();
    expect(sessionFrom(null, 5)).toBeNull();
    expect(sessionFrom({ access_token: 'a', refresh_token: 'r', expires_at: 2000, user: { id: 'u' } }, 5)?.expiresAt).toBe(2_000_000);
  });
});

describe('the token', () => {
  const signedIn = (now: () => number, route: (c: Call) => Response | null) => {
    const kv = memory();
    kv.setItem('k222.auth', JSON.stringify({ access: 'old', refresh: 'r1', expiresAt: 100_000, userId: 'u1', email: 'p@example.com' }));
    const s = server(route);
    return { kv, s, cloud: new CloudSaves(cfg, s.fetchFn, kv, now) };
  };

  it('is the one held while it has time left', async () => {
    const { cloud, s } = signedIn(() => 10_000, () => null);
    expect(await cloud.token()).toBe('old');
    expect(s.calls).toHaveLength(0);
  });

  it('is renewed once it is about to run out, and the renewed one is kept', async () => {
    const { cloud, s, kv } = signedIn(() => 100_000, (c) => (c.url.includes('grant_type=refresh_token') ? reply(200, { ...goodSession, access_token: 'new', refresh_token: 'r2' }) : null));
    expect(await cloud.token()).toBe('new');
    expect(s.calls[0].body).toEqual({ refresh_token: 'r1' });
    expect(readSession(kv)?.refresh).toBe('r2');
  });

  it('signs the player out when the service refuses to renew, and keeps them in when it cannot be reached', async () => {
    const refused = signedIn(() => 100_000, () => reply(400, { error: 'invalid_grant' }));
    expect(await refused.cloud.token()).toBeNull();
    expect(refused.cloud.session()).toBeNull();
    const offline = signedIn(() => 100_000, () => { throw new Error('offline'); });
    expect(await offline.cloud.token()).toBeNull();
    expect(offline.cloud.session()?.email).toBe('p@example.com');
  });
});

describe('saves in the cloud', () => {
  const player = () => {
    const kv = memory();
    kv.setItem('k222.auth', JSON.stringify({ access: 'tok', refresh: 'r', expiresAt: Date.now() + 3_600_000, userId: 'u1', email: 'p@example.com' }));
    const rows = new Map<string, Record<string, unknown>>();
    const s = server((c) => {
      if (c.headers.Authorization !== 'Bearer tok') return reply(401);
      if (c.url.endsWith('cloud_saves?slot=eq.auto&select=game&limit=1')) return reply(200, rows.has('auto') ? [{ game: rows.get('auto')!.game }] : []);
      if (c.url.endsWith('cloud_saves?slot=eq.auto') && c.method === 'PATCH') { rows.set('prev', { ...rows.get('auto')!, slot: 'prev' }); rows.delete('auto'); return reply(204); }
      if (c.url.includes('/rest/v1/cloud_saves?on_conflict=user_id,slot')) { const b = c.body as Record<string, unknown>; rows.set(String(b.slot), b); return reply(201); }
      if (c.url.includes('/rest/v1/cloud_saves?select=slot')) return reply(200, [...rows.values()]);
      const one = /cloud_saves\?slot=eq\.(\w+)&select=enc,data/.exec(c.url);
      if (one) return reply(200, rows.has(one[1]) ? [rows.get(one[1])] : []);
      const del = /cloud_saves\?slot=eq\.(\w+)$/.exec(c.url);
      if (del && c.method === 'DELETE') { rows.delete(del[1]); return reply(204); }
      if (c.url.endsWith('/rpc/delete_my_account')) { rows.clear(); return reply(204); }
      return null;
    });
    return { cloud: new CloudSaves(cfg, s.fetchFn, kv), rows, s, kv };
  };
  const game = { game: 'g-1', name: 'PRN Perak', week: 4, totalWeeks: 8, scenario: 'state:perak', player: 0, savedAt: 1234, text: JSON.stringify({ hello: 'x'.repeat(5000) }) };

  it('sends a slot compressed with a short label, and gives back exactly what was sent', async () => {
    const { cloud, rows, s } = player();
    expect(await cloud.push('auto', game)).toBe('ok');
    const row = rows.get('auto')!;
    expect(row).toMatchObject({ slot: 'auto', name: 'PRN Perak', week: 4, total_weeks: 8, scenario: 'state:perak', saved_at: 1234, enc: 'gzip-b64' });
    expect(String(row.data).length).toBeLessThan(game.text.length / 4);
    expect(s.calls.find((c) => c.method === 'POST')?.headers.Prefer).toBe('resolution=merge-duplicates,return=minimal');
    expect(await cloud.pull('auto')).toBe(game.text);
    expect(await cloud.pull('3')).toBeNull();
  });

  it('lists what it holds, and puts a slot over the one it had', async () => {
    const { cloud, rows } = player();
    await cloud.push('auto', game);
    await cloud.push('auto', { ...game, week: 6, savedAt: 5000 });
    await cloud.push('2', { ...game, name: 'Career' });
    expect(rows.size).toBe(2);
    const list = await cloud.list();
    expect(list?.map((m) => m.slot).sort()).toEqual(['2', 'auto']);
    expect(list?.find((m) => m.slot === 'auto')).toMatchObject({ week: 6, savedAt: 5000, totalWeeks: 8 });
  });

  it('moves the game in the autosave aside when another game takes its place, and not when it is the same game going on', async () => {
    const { cloud, rows } = player();
    await cloud.push('auto', game);
    await cloud.push('auto', { ...game, week: 5, savedAt: 2000 });
    expect([...rows.keys()]).toEqual(['auto']);
    // A game begun on a new phone: the old one is kept, as `prev`, and can be listed and read.
    await cloud.push('auto', { ...game, game: 'g-2', name: 'New game', week: 1, savedAt: 9000 });
    expect(rows.get('auto')).toMatchObject({ game: 'g-2', name: 'New game' });
    expect(rows.get('prev')).toMatchObject({ game: 'g-1', slot: 'prev', week: 5 });
    expect(await cloud.pull('prev')).toBe(game.text);
    expect((await cloud.list())?.map((m) => m.slot).sort()).toEqual(['auto', 'prev']);
  });

  it('removes a slot, and deletes the account with every save', async () => {
    const { cloud, rows, kv } = player();
    await cloud.push('auto', game);
    await cloud.push('1', game);
    expect(await cloud.removeSlot('1')).toBe(true);
    expect([...rows.keys()]).toEqual(['auto']);
    expect(await cloud.deleteAccount()).toBe(true);
    expect(rows.size).toBe(0);
    expect(readSession(kv)).toBeNull();
  });

  it('does nothing, and says so, when nobody is signed in or the service turns the player away', async () => {
    const nobody = new CloudSaves(cfg, server(() => reply(200, [])).fetchFn, memory());
    expect(await nobody.push('auto', game)).toBe('auth');
    expect(await nobody.list()).toBeNull();
    const turned = player();
    turned.kv.setItem('k222.auth', JSON.stringify({ access: 'bad', refresh: 'r', expiresAt: Date.now() + 3_600_000, userId: 'u1', email: 'p@example.com' }));
    expect(await turned.cloud.push('auto', game)).toBe('auth');
  });

  it('is switched off when the game has no address for it', async () => {
    const off = new CloudSaves(null, server(() => reply(200)).fetchFn, memory());
    expect(off.enabled).toBe(false);
    expect(await off.requestCode('p@example.com')).toBe('failed');
    expect(await off.push('auto', game)).toBe('auth');
  });
});

describe('packing a save', () => {
  it('round-trips, and falls back to the plain text for an encoding it does not know', async () => {
    const text = JSON.stringify({ a: 'ünïcödé ✓ '.repeat(3000) });
    const packed = await pack(text);
    expect(packed.enc).toBe('gzip-b64');
    expect(await unpack(packed.enc, packed.data)).toBe(text);
    expect(await unpack('json', text)).toBe(text);
    expect(await unpack('rot13', text)).toBeNull();
    expect(await unpack('gzip-b64', 'not base64 !!')).toBeNull();
  });
});

describe('which copy is newer', () => {
  const found = [{ slot: 'auto' as const, game: 'g', name: 'g', week: 3, totalWeeks: 8, scenario: 'general', player: 0, savedAt: 10_000 }];
  it('offers the cloud copy when the device has none, or an older one, and not otherwise', () => {
    expect(newerInCloud(found, 'auto', null)?.week).toBe(3);
    expect(newerInCloud(found, 'auto', 5000)?.week).toBe(3);
    expect(newerInCloud(found, 'auto', 10_000)).toBeNull();
    expect(newerInCloud(found, 'auto', 20_000)).toBeNull();
    expect(newerInCloud(found, '1', null)).toBeNull();
    expect(newerInCloud(null, 'auto', null)).toBeNull();
  });
});

describe('the browser built into another app', () => {
  it('is recognised by what it says of itself, and an ordinary browser is not', () => {
    expect(inAppBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Barcelona 321.0')).toBe('Threads');
    expect(inAppBrowser('Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 Instagram 300.0')).toBe('Instagram');
    expect(inAppBrowser('Mozilla/5.0 (Linux; Android 14; SM-S918B Build/UP1A; wv) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/440.0]')).toBe('Facebook');
    expect(inAppBrowser('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36')).toBeNull();
    expect(inAppBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1')).toBeNull();
  });
});
