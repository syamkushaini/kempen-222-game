import { call, CONFIG, headers, type Config, type Fetch } from './leaderboard';

// Counting how the game is played, so that the maker can see where players stop (see supabase/play-events.sql). What is sent is
// only what is in `Row`: what kind of contest, how far into it, which screen, and a random id for the browser and one for the visit.
// No name, no party, no save, nothing typed. A player can turn it off in Settings, and then nothing at all is sent and the
// browser's id is forgotten. With no address configured (a build without the leaderboard), nothing is sent either.

export const EVENT_NAMES = ['open', 'start', 'resume', 'election', 'term', 'end', 'again', 'share', 'leave'] as const;
/**
 * What happened. `open`: the page was opened (a new visit). `start` / `resume`: a new game was begun, or a saved one loaded.
 * `election`: polling day came, with how it went. `term`: a career began a new parliament. `end`: a career ended.
 * `again`: a button to play again was pressed. `share`: the share card was opened. `leave`: the page was put away or closed.
 */
export type EventName = (typeof EVENT_NAMES)[number];
export const SCREENS = ['title', 'campaign', 'term', 'night', 'talks', 'legacy'] as const;
export type Screen = (typeof SCREENS)[number];
export type Device = 'phone' | 'tablet' | 'desktop';
export const MODES = ['career', 'career-state', 'general', 'hung', 'state', 'byelection'] as const;
export type Mode = (typeof MODES)[number];

/** Where in a game the player is, as far as the counting goes. */
export interface Place {
  mode: Mode | null;
  scenario: string | null;
  difficulty: string | null;
  screen: Screen;
  /** Weeks into the game: the campaign's week, or in a career the weeks of parliament lived so far. */
  week: number | null;
}

/** One row of the table, as it is sent. */
export interface Row {
  pid: string;
  sid: string;
  t: EventName;
  /** Seconds since the visit began. */
  secs: number;
  lang: string;
  device: Device;
  version: string;
  mode: Mode | null;
  scenario: string | null;
  difficulty: string | null;
  screen: Screen;
  week: number | null;
  /** A number that goes with the event: seats won, the parliament reached, weeks played this visit. */
  n: number | null;
  /** A word that goes with the event: the verdict, how a career ended, which button. */
  detail: string | null;
}

export interface Extra { n?: number | null; detail?: string | null }

/** The kind of contest a scenario is. */
export function modeOf(scenario: string): Mode | null {
  if (scenario === 'career') return 'career';
  if (scenario.startsWith('career:')) return 'career-state';
  if (scenario === 'general' || scenario === 'hung') return scenario;
  if (scenario.startsWith('state:')) return 'state';
  if (scenario === 'byelection' || scenario.startsWith('byelection:')) return 'byelection';
  return null;
}

/** A phone, a tablet or a computer, from the pointer and the short side of the screen. */
export const deviceOf = (coarse: boolean, shortSide: number): Device => (!coarse ? 'desktop' : shortSide < 600 ? 'phone' : 'tablet');

const whole = (n: number | null | undefined, max: number): number | null =>
  typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(max, Math.round(n))) : null;
const word = (s: string | null | undefined, max: number): string | null => (typeof s === 'string' && s ? s.replace(/[^\w:.,-]/g, '').slice(0, max) || null : null);

/** The row for an event: every field cut to what the table takes, so a row is never refused for its shape. */
export function rowOf(t: EventName, ids: { pid: string; sid: string }, base: { lang: string; device: Device; version: string; secs: number }, place: Place, extra: Extra = {}): Row {
  return {
    pid: ids.pid, sid: ids.sid, t, secs: whole(base.secs, 86_400 * 7) ?? 0,
    lang: base.lang === 'ms' ? 'ms' : 'en', device: base.device, version: base.version.slice(0, 32),
    mode: place.mode, scenario: word(place.scenario, 40), difficulty: word(place.difficulty, 8), screen: place.screen,
    week: whole(place.week, 100_000), n: whole(extra.n, 100_000), detail: word(extra.detail, 24),
  };
}

// ---------- the ids ----------

const PID_KEY = 'k222.pid';
const SID_KEY = 'k222.sid';
/** A visit that has been away this long is a new one. */
export const IDLE_MS = 30 * 60_000;

export type KV = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const ID = /^[0-9a-f]{16}$/;

/** Sixteen random hex digits: an id that says nothing about the player. */
export function randomId(): string {
  return [...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** The browser's id, made the first time it is wanted. `fresh` says whether it was made just now. */
export function browserId(kv: KV | null, make: () => string = randomId): { id: string; fresh: boolean } {
  try {
    const kept = kv?.getItem(PID_KEY);
    if (kept && ID.test(kept)) return { id: kept, fresh: false };
    const id = make();
    kv?.setItem(PID_KEY, id);
    return { id, fresh: true };
  } catch { return { id: make(), fresh: true }; }
}

/** The visit's id: kept for the tab while it is in use, so that a phone reloading a page it put to sleep is still the same visit. */
export function visitId(kv: KV | null, now: number, make: () => string = randomId): { id: string; began: number; fresh: boolean } {
  try {
    const kept = JSON.parse(kv?.getItem(SID_KEY) ?? 'null');
    if (kept && typeof kept.id === 'string' && ID.test(kept.id) && typeof kept.seen === 'number' && typeof kept.began === 'number' && now - kept.seen < IDLE_MS && now >= kept.seen) {
      kv?.setItem(SID_KEY, JSON.stringify({ ...kept, seen: now }));
      return { id: kept.id, began: kept.began, fresh: false };
    }
  } catch { /* a new visit, then */ }
  const id = make();
  try { kv?.setItem(SID_KEY, JSON.stringify({ id, began: now, seen: now })); } catch { /* kept for this page only */ }
  return { id, began: now, fresh: true };
}

/** Forgets both ids, for a player who has turned the counting off. */
export function forgetIds(local: KV | null, session: KV | null): void {
  try { local?.removeItem(PID_KEY); } catch { /* nothing kept */ }
  try { session?.removeItem(SID_KEY); } catch { /* nothing kept */ }
}

// ---------- sending ----------

/** Events wait until there are this many, or until the timer, or until the page is put away. */
export const BATCH = 10;
/** At most this many wait: a player offline for a long game loses the oldest, not the game's memory. */
export const QUEUE_MAX = 60;
export const FLUSH_MS = 20_000;

export interface TrackerOptions {
  cfg?: Config | null;
  fetchFn?: Fetch;
  /** Whether the player allows it, asked every time: turning it off stops what is waiting too. */
  enabled(): boolean;
  local: KV | null;
  session: KV | null;
  now?: () => number;
  lang(): string;
  device: Device;
  version: string;
  online?: () => boolean;
}

/** Collects events and sends them in batches. Nothing it does can throw into the game, and nothing waits on it. */
export class Tracker {
  private queue: Row[] = [];
  private ids: { pid: string; sid: string; began: number } | null = null;
  private sending = false;
  private readonly cfg: Config | null;
  private readonly fetchFn: Fetch;
  private readonly now: () => number;

  constructor(private readonly o: TrackerOptions) {
    this.cfg = o.cfg === undefined ? CONFIG : o.cfg;
    this.fetchFn = o.fetchFn ?? ((...a) => fetch(...a));
    this.now = o.now ?? Date.now;
  }

  /** Whether anything is sent at all: allowed by the player, and somewhere to send it. */
  get active(): boolean { try { return !!this.cfg && this.o.enabled(); } catch { return false; } }

  /** The events waiting to be sent (for the tests). */
  get waiting(): readonly Row[] { return this.queue; }

  /** Starts the visit: `open` is counted only for a new one. */
  open(place: Place): void {
    if (!this.active) return;
    const v = this.touch();
    if (v?.fresh) this.track('open', place);
  }

  track(t: EventName, place: Place, extra: Extra = {}): void {
    if (!this.active) { this.stop(); return; }
    try {
      // Every event keeps the visit alive; one that comes after half an hour away begins a new visit.
      const ids = this.touch();
      if (!ids) return;
      const row = rowOf(t, ids, { lang: this.o.lang(), device: this.o.device, version: this.o.version, secs: (this.now() - ids.began) / 1000 }, place, extra);
      this.queue.push(row);
      if (this.queue.length > QUEUE_MAX) this.queue.splice(0, this.queue.length - QUEUE_MAX);
      if (this.queue.length >= BATCH) void this.flush();
    } catch { /* counting never gets in the way */ }
  }

  /** The player has turned it off: what is waiting is dropped and the ids forgotten. */
  stop(): void {
    this.queue = [];
    if (this.ids) { forgetIds(this.o.local, this.o.session); this.ids = null; }
  }

  /** Sends what is waiting. `leaving`: the page is being put away, so the request must outlive it. */
  async flush(leaving = false): Promise<void> {
    if (!this.active) { this.stop(); return; }
    // A page being put away sends at once, even with another batch on its way: there may be no later chance.
    if ((this.sending && !leaving) || this.queue.length === 0 || !this.cfg) return;
    if (this.o.online && !this.o.online()) return;
    const batch = this.queue.splice(0, QUEUE_MAX);
    this.sending = true;
    try {
      const res = await call(this.fetchFn, `${this.cfg.url}/rest/v1/play_events`, {
        method: 'POST', keepalive: leaving,
        headers: { ...headers(this.cfg), 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(batch),
      });
      // A batch the network lost is tried once more with the next; one the table refused is not (it would be refused again).
      const room = QUEUE_MAX - this.queue.length;
      if (!res && this.active && room > 0) this.queue.unshift(...batch.slice(-room));
    } finally { this.sending = false; }
  }

  private touch(): { pid: string; sid: string; began: number; fresh: boolean } | null {
    try {
      const b = browserId(this.o.local);
      const v = visitId(this.o.session, this.now());
      this.ids = { pid: b.id, sid: v.id, began: v.began };
      return { ...this.ids, fresh: v.fresh };
    } catch { return null; }
  }
}
