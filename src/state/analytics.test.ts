import { describe, expect, it } from 'vitest';
import { browserId, deviceOf, IDLE_MS, modeOf, QUEUE_MAX, rowOf, Tracker, visitId, type KV, type Place } from './analytics';

const memory = (): KV & { map: Map<string, string> } => {
  const map = new Map<string, string>();
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k) };
};
const CFG = { url: 'https://example.supabase.co', key: 'anon' };
const TITLE: Place = { mode: null, scenario: null, difficulty: null, screen: 'title', week: null };
const PLAYING: Place = { mode: 'general', scenario: 'general', difficulty: 'normal', screen: 'campaign', week: 3 };

function setup(on: { value: boolean }, fetchOk = true) {
  const sent: { url: string; init: RequestInit }[] = [];
  const fetchFn = (async (url: string, init: RequestInit) => { sent.push({ url, init }); if (!fetchOk) throw new Error('offline'); return new Response(null, { status: 201 }); }) as unknown as typeof fetch;
  const local = memory(), session = memory();
  let now = 1_000_000;
  const tracker = new Tracker({ cfg: CFG, fetchFn, enabled: () => on.value, local, session, now: () => now, lang: () => 'ms', device: 'phone', version: '0.1.0+abc' });
  return { tracker, sent, local, session, tick: (ms: number) => { now += ms; } };
}
const rowsOf = (sent: { init: RequestInit }[]) => sent.flatMap((s) => JSON.parse(String(s.init.body)) as Record<string, unknown>[]);

describe('the event builder', () => {
  it('names the kind of contest from its scenario', () => {
    expect(modeOf('career')).toBe('career');
    expect(modeOf('career:perak')).toBe('career-state');
    expect(modeOf('state:sabah')).toBe('state');
    expect(modeOf('byelection:dun:johor:N.01')).toBe('byelection');
    expect(modeOf('general')).toBe('general');
    expect(modeOf('nonsense')).toBeNull();
  });

  it('tells a phone from a tablet from a computer', () => {
    expect(deviceOf(true, 390)).toBe('phone');
    expect(deviceOf(true, 820)).toBe('tablet');
    expect(deviceOf(false, 390)).toBe('desktop');
  });

  it('holds only the fields the table takes, cut to size', () => {
    const row = rowOf('election', { pid: 'a'.repeat(16), sid: 'b'.repeat(16) }, { lang: 'fr', device: 'desktop', version: 'x'.repeat(50), secs: 12.6 },
      { ...PLAYING, scenario: 'state:<script>' + 'y'.repeat(60), week: -4 }, { n: 1e9, detail: 'majority' });
    expect(Object.keys(row).sort()).toEqual(['detail', 'device', 'difficulty', 'lang', 'mode', 'n', 'pid', 'scenario', 'screen', 'secs', 'sid', 't', 'version', 'week'].sort());
    expect(row.lang).toBe('en');
    expect(row.version).toHaveLength(32);
    expect(row.scenario).toMatch(/^state:script/);
    expect(row.scenario!.length).toBeLessThanOrEqual(40);
    expect(row.week).toBe(0);
    expect(row.n).toBe(100_000);
    expect(row.secs).toBe(13);
    expect(row.detail).toBe('majority');
  });

  it('carries nothing about the player', () => {
    const row = rowOf('start', { pid: 'a'.repeat(16), sid: 'b'.repeat(16) }, { lang: 'en', device: 'phone', version: '1', secs: 0 }, PLAYING, { detail: 'founded,tutorial' });
    const text = JSON.stringify(row);
    for (const word of ['name', 'party', 'identity', 'email', 'save', 'ip']) expect(Object.keys(row)).not.toContain(word);
    expect(text.length).toBeLessThan(400);
  });
});

describe('the ids', () => {
  it('keeps one random id for the browser', () => {
    const kv = memory();
    const a = browserId(kv), b = browserId(kv);
    expect(a.id).toMatch(/^[0-9a-f]{16}$/);
    expect(a.fresh).toBe(true);
    expect(b).toEqual({ id: a.id, fresh: false });
  });

  it('begins a new visit after half an hour away', () => {
    const kv = memory();
    const a = visitId(kv, 0);
    expect(visitId(kv, IDLE_MS - 1).id).toBe(a.id);
    const c = visitId(kv, 2 * IDLE_MS);
    expect(c.fresh).toBe(true);
    expect(c.id).not.toBe(a.id);
  });
});

describe('the tracker', () => {
  it('counts the opening of a visit once, and sends in a batch', async () => {
    const on = { value: true };
    const { tracker, sent } = setup(on);
    tracker.open(TITLE);
    tracker.open(TITLE);
    tracker.track('start', PLAYING, { detail: 'tutorial' });
    expect(tracker.waiting.map((r) => r.t)).toEqual(['open', 'start']);
    await tracker.flush();
    expect(sent).toHaveLength(1);
    expect(sent[0].url).toBe(`${CFG.url}/rest/v1/play_events`);
    expect(sent[0].init.method).toBe('POST');
    const rows = rowsOf(sent);
    expect(rows.map((r) => r.t)).toEqual(['open', 'start']);
    expect(rows[0].pid).toBe(rows[1].pid);
    expect(rows[1]).toMatchObject({ lang: 'ms', device: 'phone', mode: 'general', week: 3, detail: 'tutorial' });
    expect(tracker.waiting).toHaveLength(0);
  });

  it('sends a full batch without waiting for the timer', async () => {
    const { tracker, sent } = setup({ value: true });
    for (let i = 0; i < 10; i++) tracker.track('leave', PLAYING);
    await Promise.resolve();
    expect(sent).toHaveLength(1);
  });

  it('asks for a request that outlives the page when it is put away', async () => {
    const { tracker, sent } = setup({ value: true });
    tracker.track('leave', PLAYING, { n: 4 });
    await tracker.flush(true);
    expect(sent[0].init.keepalive).toBe(true);
  });

  it('fails quietly offline, keeping what waits for the next try, but no more than it can hold', async () => {
    const { tracker, sent } = setup({ value: true }, false);
    tracker.track('start', PLAYING);
    await expect(tracker.flush()).resolves.toBeUndefined();
    expect(sent).toHaveLength(1);
    expect(tracker.waiting).toHaveLength(1);
    for (let i = 0; i < QUEUE_MAX * 2; i++) tracker.track('leave', PLAYING);
    await new Promise((r) => setTimeout(r, 0));
    expect(tracker.waiting.length).toBeLessThanOrEqual(QUEUE_MAX);
  });

  it('sends nothing without an address', async () => {
    const sent: unknown[] = [];
    const tracker = new Tracker({ cfg: null, fetchFn: (async () => { sent.push(1); return new Response(); }) as unknown as typeof fetch, enabled: () => true, local: memory(), session: memory(), lang: () => 'en', device: 'desktop', version: '1' });
    tracker.open(TITLE);
    tracker.track('start', PLAYING);
    await tracker.flush();
    expect(sent).toHaveLength(0);
  });
});

describe('turning it off', () => {
  it('sends nothing and keeps no id while it is off', async () => {
    const { tracker, sent, local, session } = setup({ value: false });
    tracker.open(TITLE);
    tracker.track('start', PLAYING);
    await tracker.flush(true);
    expect(sent).toHaveLength(0);
    expect(tracker.waiting).toHaveLength(0);
    expect(local.map.size).toBe(0);
    expect(session.map.size).toBe(0);
  });

  it('drops what was waiting and forgets the ids when the player turns it off', async () => {
    const on = { value: true };
    const { tracker, sent, local, session } = setup(on);
    tracker.open(TITLE);
    tracker.track('start', PLAYING);
    expect(local.map.size).toBe(1);
    on.value = false;
    tracker.track('leave', PLAYING);
    await tracker.flush(true);
    expect(sent).toHaveLength(0);
    expect(tracker.waiting).toHaveLength(0);
    expect(local.map.size).toBe(0);
    expect(session.map.size).toBe(0);
  });

  it('starts with a new browser id when it is turned on again', async () => {
    const on = { value: true };
    const { tracker, sent } = setup(on);
    tracker.open(TITLE);
    await tracker.flush();
    on.value = false;
    tracker.stop();
    on.value = true;
    tracker.open(TITLE);
    await tracker.flush();
    const rows = rowsOf(sent);
    expect(rows.map((r) => r.t)).toEqual(['open', 'open']);
    expect(rows[0].pid).not.toBe(rows[1].pid);
  });
});
