import { call, CONFIG, type Config, type Fetch } from './leaderboard';

// Saves kept in the maker's Supabase project, for a player who signs in with an e-mail address. The game talks to it with plain
// `fetch`, as it does to the leaderboard (see supabase/cloud-saves.sql). Signing in is by a code sent to the address and typed back
// here, not by a link, because a link opens in whatever browser the mail app chooses and a game played inside another app's browser
// would never see it. With no address configured, none of this shows, and the game keeps its saves on the device as it always did.

export interface Session { access: string; refresh: string; expiresAt: number; userId: string; email: string }

/**
 * The slots that are kept in the cloud: the autosave and the five of the player's own. The earlier autosaves stay on the device. `prev` is
 * the game the autosave held before another game took its place: a game begun on a new phone must not be able to wipe the old one.
 */
export const CLOUD_SLOTS = ['auto', 'prev', '1', '2', '3', '4', '5'] as const;
export type CloudSlot = (typeof CLOUD_SLOTS)[number];
export const isCloudSlot = (x: string): x is CloudSlot => (CLOUD_SLOTS as readonly string[]).includes(x);

/** What a row says about the game in it, without the game. */
export interface CloudMeta { slot: CloudSlot; game: string; name: string; week: number; totalWeeks: number; scenario: string; player: number; savedAt: number }

/** What is sent when a slot is saved. */
export interface Outgoing { game: string; name: string; week: number; totalWeeks: number; scenario: string; player: number; savedAt: number; text: string }

export type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const SESSION_KEY = 'k222.auth';
/** A token is renewed this long before it runs out. */
const SKEW_MS = 60_000;
export const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
export const CODE = /^\d{6,10}$/;

// ---------- packing: a save is 100 to 200 KB of text, about a fifth of that once it is compressed ----------

const toBase64 = (bytes: Uint8Array): string => {
  let out = '';
  for (let i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(out);
};
const fromBase64 = (text: string): Uint8Array => Uint8Array.from(atob(text), (ch) => ch.charCodeAt(0));
const pump = async (input: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> => {
  const writer = stream.writable.getWriter();
  void writer.write(input as BufferSource).then(() => writer.close());
  return new Uint8Array(await new Response(stream.readable).arrayBuffer());
};

export type Encoding = 'gzip-b64' | 'json';
export async function pack(text: string): Promise<{ enc: Encoding; data: string }> {
  if (typeof CompressionStream === 'undefined') return { enc: 'json', data: text };
  try { return { enc: 'gzip-b64', data: toBase64(await pump(new TextEncoder().encode(text), new CompressionStream('gzip'))) }; } catch { return { enc: 'json', data: text }; }
}
export async function unpack(enc: string, data: string): Promise<string | null> {
  if (enc === 'json') return data;
  if (enc !== 'gzip-b64' || typeof DecompressionStream === 'undefined') return null;
  try { return new TextDecoder().decode(await pump(fromBase64(data), new DecompressionStream('gzip'))); } catch { return null; }
}

// ---------- what this device remembers of who is signed in ----------

const safeStorage = (): Store | null => { try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; } };

export function readSession(kv: Store | null = safeStorage()): Session | null {
  try {
    const v = JSON.parse(kv?.getItem(SESSION_KEY) ?? 'null') as Partial<Session> | null;
    return v && typeof v.access === 'string' && typeof v.refresh === 'string' && typeof v.expiresAt === 'number' && typeof v.userId === 'string' && typeof v.email === 'string' ? (v as Session) : null;
  } catch { return null; }
}
function writeSession(s: Session | null, kv: Store | null): void {
  try { if (s) kv?.setItem(SESSION_KEY, JSON.stringify(s)); else kv?.removeItem(SESSION_KEY); } catch { /* the player signs in again */ }
}

/** A session as the sign-in service answers with it, or null if it is not one. */
export function sessionFrom(body: unknown, now: number, fallbackEmail = ''): Session | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as { access_token?: unknown; refresh_token?: unknown; expires_in?: unknown; expires_at?: unknown; user?: { id?: unknown; email?: unknown } };
  if (typeof b.access_token !== 'string' || typeof b.refresh_token !== 'string' || typeof b.user?.id !== 'string') return null;
  const expiresAt = typeof b.expires_at === 'number' ? b.expires_at * 1000 : now + (typeof b.expires_in === 'number' ? b.expires_in : 3600) * 1000;
  return { access: b.access_token, refresh: b.refresh_token, expiresAt, userId: b.user.id, email: typeof b.user.email === 'string' ? b.user.email : fallbackEmail };
}

/** `server`: the service answered with an error (often the mail service behind it); `config`: the address, the key or the sign-in settings are not right. */
export type CodeResult = 'sent' | 'invalid' | 'limited' | 'failed' | 'server' | 'config';
export type VerifyResult = 'ok' | 'wrong' | 'failed' | 'server' | 'config';
export type PushResult = 'ok' | 'auth' | 'failed';

const json = { 'Content-Type': 'application/json' };
/** Sending a mail can take its time, and the answer waits for it. */
const MAIL_WAIT_MS = 25_000;

/** What the sign-in service says went wrong, in its own words (`error_code`), if it says. */
async function errorCodeOf(res: Response): Promise<string> {
  try { const b = (await res.clone().json()) as { error_code?: unknown; code?: unknown }; return typeof b.error_code === 'string' ? b.error_code : typeof b.code === 'string' ? b.code : ''; } catch { return ''; }
}

export class CloudSaves {
  constructor(
    private cfg: Config | null = CONFIG,
    private fetchFn: Fetch = (...a) => fetch(...a),
    private kv: Store | null = safeStorage(),
    private now: () => number = Date.now,
  ) {}

  get enabled(): boolean { return this.cfg !== null; }
  session(): Session | null { return this.cfg ? readSession(this.kv) : null; }

  private anon() { return { apikey: this.cfg!.key, ...json }; }

  /** The status the service last answered with (0 for no answer), for telling the player what happened. */
  lastStatus = 0;

  /** Asks for a code to be mailed to the address. */
  async requestCode(email: string): Promise<CodeResult> {
    if (!this.cfg) return 'config';
    const address = email.trim().toLowerCase();
    if (!EMAIL.test(address)) return 'invalid';
    const res = await call(this.fetchFn, `${this.cfg.url}/auth/v1/otp`, { method: 'POST', headers: this.anon(), body: JSON.stringify({ email: address, create_user: true }) }, MAIL_WAIT_MS);
    this.lastStatus = res?.status ?? 0;
    if (!res) return 'failed';
    if (res.ok) return 'sent';
    const why = await errorCodeOf(res);
    if (res.status === 429 || /rate_limit/.test(why)) return 'limited';
    if (why === 'email_address_invalid' || why === 'validation_failed') return 'invalid';
    if (res.status >= 500) return 'server';
    // Signing in by e-mail switched off, new sign-ups not allowed, a wrong key, a wrong address: nothing the player can mend.
    return res.status === 400 || res.status === 422 ? (why ? 'config' : 'invalid') : 'config';
  }

  /** Signs in with the code that was mailed. */
  async verify(email: string, code: string): Promise<VerifyResult> {
    if (!this.cfg) return 'config';
    const address = email.trim().toLowerCase();
    if (!EMAIL.test(address) || !CODE.test(code.trim())) return 'wrong';
    const res = await call(this.fetchFn, `${this.cfg.url}/auth/v1/verify`, { method: 'POST', headers: this.anon(), body: JSON.stringify({ type: 'email', email: address, token: code.trim() }) }, MAIL_WAIT_MS);
    this.lastStatus = res?.status ?? 0;
    if (!res) return 'failed';
    if (!res.ok) return res.status >= 500 ? 'server' : res.status === 404 ? 'config' : 'wrong';
    let body: unknown;
    try { body = await res.json(); } catch { return 'failed'; }
    const session = sessionFrom(body, this.now(), address);
    if (!session) return 'failed';
    writeSession(session, this.kv);
    return 'ok';
  }

  /** A token that is good to use now: the one held, or a renewed one. null if nobody is signed in or the sign-in has lapsed. */
  async token(): Promise<string | null> {
    const s = this.session();
    if (!s || !this.cfg) return null;
    if (s.expiresAt - this.now() > SKEW_MS) return s.access;
    const res = await call(this.fetchFn, `${this.cfg.url}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: this.anon(), body: JSON.stringify({ refresh_token: s.refresh }) });
    // No answer is not a refusal: the player stays signed in, and the next try may get through.
    if (!res) return null;
    if (!res.ok) { if (res.status === 400 || res.status === 401 || res.status === 403) writeSession(null, this.kv); return null; }
    let body: unknown;
    try { body = await res.json(); } catch { return null; }
    const next = sessionFrom(body, this.now(), s.email);
    if (!next) return null;
    writeSession(next, this.kv);
    return next.access;
  }

  async signOut(): Promise<void> {
    const s = this.session();
    writeSession(null, this.kv);
    if (s && this.cfg) await call(this.fetchFn, `${this.cfg.url}/auth/v1/logout`, { method: 'POST', headers: { apikey: this.cfg.key, Authorization: `Bearer ${s.access}` } });
  }

  private async authed(path: string, init: RequestInit = {}): Promise<Response | 'auth' | null> {
    const token = await this.token();
    if (!token || !this.cfg) return 'auth';
    const res = await call(this.fetchFn, `${this.cfg.url}/rest/v1/${path}`, { ...init, headers: { apikey: this.cfg.key, Authorization: `Bearer ${token}`, ...json, ...(init.headers ?? {}) } });
    if (res && (res.status === 401 || res.status === 403)) return 'auth';
    return res;
  }

  /**
   * Keeps a slot in the cloud, in place of what was there. The autosave is the one slot that a new game takes over: when the game in it is
   * not the one being sent, it is moved to `prev` first, so that it can still be restored.
   */
  async push(slot: CloudSlot, out: Outgoing): Promise<PushResult> {
    if (slot === 'auto') {
      const held = await this.authed('cloud_saves?slot=eq.auto&select=game&limit=1');
      if (held === 'auth') return 'auth';
      if (!held || !held.ok) return 'failed';
      let rows: { game?: unknown }[];
      try { rows = (await held.json()) as { game?: unknown }[]; } catch { return 'failed'; }
      const was = Array.isArray(rows) && typeof rows[0]?.game === 'string' ? rows[0].game : null;
      if (was !== null && was !== out.game) {
        const cleared = await this.authed('cloud_saves?slot=eq.prev', { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
        if (cleared === 'auth') return 'auth';
        const moved = cleared && cleared.ok ? await this.authed('cloud_saves?slot=eq.auto', { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ slot: 'prev' }) }) : null;
        if (moved === 'auth') return 'auth';
        if (!moved || !moved.ok) return 'failed';
      }
    }
    const { enc, data } = await pack(out.text);
    const res = await this.authed('cloud_saves?on_conflict=user_id,slot', {
      method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ slot, game: out.game.slice(0, 64), name: out.name.slice(0, 80), week: out.week, total_weeks: out.totalWeeks, scenario: out.scenario.slice(0, 64), player: out.player, saved_at: out.savedAt, enc, data }),
    });
    if (res === 'auth') return 'auth';
    return res && res.ok ? 'ok' : 'failed';
  }

  /** What the cloud holds for this player, newest first; null if it cannot be reached. */
  async list(): Promise<CloudMeta[] | null> {
    const res = await this.authed('cloud_saves?select=slot,game,name,week,total_weeks,scenario,player,saved_at&order=saved_at.desc');
    if (!res || res === 'auth' || !res.ok) return null;
    let body: unknown;
    try { body = await res.json(); } catch { return null; }
    if (!Array.isArray(body)) return null;
    const out: CloudMeta[] = [];
    for (const r of body as Record<string, unknown>[]) {
      if (typeof r.slot !== 'string' || !isCloudSlot(r.slot) || typeof r.name !== 'string') continue;
      out.push({ slot: r.slot, game: String(r.game ?? ''), name: r.name, week: Number(r.week) || 0, totalWeeks: Number(r.total_weeks) || 0, scenario: String(r.scenario ?? ''), player: Number(r.player) || 0, savedAt: Number(r.saved_at) || 0 });
    }
    return out;
  }

  /** The text of the game in a slot, or null if there is none or it could not be read. */
  async pull(slot: CloudSlot): Promise<string | null> {
    const res = await this.authed(`cloud_saves?slot=eq.${slot}&select=enc,data&limit=1`);
    if (!res || res === 'auth' || !res.ok) return null;
    try {
      const body = (await res.json()) as { enc?: unknown; data?: unknown }[];
      const row = Array.isArray(body) ? body[0] : undefined;
      return row && typeof row.enc === 'string' && typeof row.data === 'string' ? await unpack(row.enc, row.data) : null;
    } catch { return null; }
  }

  async removeSlot(slot: CloudSlot): Promise<boolean> {
    const res = await this.authed(`cloud_saves?slot=eq.${slot}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
    return !!res && res !== 'auth' && res.ok;
  }

  /** Deletes every save and the account itself, and signs out. */
  async deleteAccount(): Promise<boolean> {
    const res = await this.authed('rpc/delete_my_account', { method: 'POST', body: '{}' });
    if (!res || res === 'auth' || !res.ok) return false;
    writeSession(null, this.kv);
    return true;
  }
}

export const cloud = new CloudSaves();
