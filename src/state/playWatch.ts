import { worldOf } from '../data/world';
import { summarise } from '../sim/campaign/night';
import { electionResult } from '../sim/campaign/turn';
import type { Campaign } from '../sim/campaign/types';
import { deviceOf, modeOf, Tracker, FLUSH_MS, type EventName, type Extra, type Place, type Screen } from './analytics';
import type { GameState } from './game';
import { useStore } from './store';

// What the counting watches: the game as the store holds it, turned into the few events in analytics.ts. Everything here reads
// the state and never changes it.

/** What is read from the store. */
export interface Snap { game: GameState | null; showNight: boolean; settings: { analytics: boolean } }

/** The campaign that says what game this is: in a state election fought inside a career, the career waiting behind it. */
const main = (g: GameState): Campaign => g.aside?.parked ?? g.campaign;

/** The screen the player is looking at, worked out as App.tsx works it out. */
export function screenOf(s: Pick<Snap, 'game' | 'showNight'>): Screen {
  const c = s.game?.campaign;
  if (!c) return 'title';
  if (c.career?.ending) return 'legacy';
  if (c.phase === 'campaign') return 'campaign';
  if (c.phase === 'term') return 'term';
  const night = c.phase === 'night' || ((c.phase === 'formation' || c.phase === 'done') && (s.showNight || !c.formation));
  return night ? 'night' : 'talks';
}

/** Weeks into the game: the campaign's week, or in a career the weeks of parliament lived so far (and this campaign's). */
export function weekOf(g: GameState): number {
  const c = main(g);
  const k = c.career;
  if (!k) return c.week;
  const lived = k.record.weeksPm + k.record.weeksGov + k.record.weeksOpp;
  return lived + (c.phase === 'campaign' ? c.week : 0);
}

export function placeOf(s: Pick<Snap, 'game' | 'showNight'>): Place {
  const screen = screenOf(s);
  if (!s.game) return { mode: null, scenario: null, difficulty: null, screen, week: null };
  const c = main(s.game);
  return { mode: modeOf(c.scenario), scenario: c.scenario, difficulty: c.difficulty, screen, week: weekOf(s.game) };
}

/** A game begun this long ago or less is a new one; one older than that was loaded. */
const NEW_MS = 15_000;

/** How the night went for the player, or null if it cannot be worked out. */
function verdictOf(c: Campaign): { detail: string; n: number } | null {
  try {
    const world = worldOf(c);
    const result = world && electionResult(world, c);
    if (!world || !result) return null;
    const s = summarise(world, c, result);
    return { detail: s.verdict, n: s.seats };
  } catch { return null; }
}

export interface Change { t: EventName; extra?: Extra }

/** What changed between two moments of the store, as events. */
export function changes(prev: Pick<Snap, 'game'>, next: Pick<Snap, 'game'>, now: number): Change[] {
  const g = next.game;
  if (!g) return [];
  if (g.id !== prev.game?.id) {
    if (now - g.createdAt > NEW_MS) return [{ t: 'resume' }];
    const c = g.campaign;
    const flags = [c.career?.founded || c.newParty ? 'founded' : '', c.challenge?.goal || c.challenge?.code ? 'challenge' : '', g.tutorial ? 'tutorial' : ''].filter(Boolean).join(',');
    return [{ t: 'start', extra: { detail: flags || null } }];
  }
  const before = prev.game!, out: Change[] = [];
  if (g.campaign.phase === 'night' && (before.campaign.phase !== 'night' || before.campaign.scenario !== g.campaign.scenario)) {
    const v = verdictOf(g.campaign);
    out.push({ t: 'election', extra: v ?? {} });
  }
  const was = main(before).career, is = main(g).career;
  if (is && was && is.term > was.term) out.push({ t: 'term', extra: { n: is.term } });
  if (is?.ending && !was?.ending) out.push({ t: 'end', extra: { detail: is.ending.kind, n: is.term } });
  return out;
}

// ---------- in the browser ----------

let installed: { tracker: Tracker; place(): Place } | null = null;

/** Counts a button the store does not see: playing again, sharing. */
export function countClick(t: Extract<EventName, 'again' | 'share'>, detail: string): void {
  if (installed) installed.tracker.track(t, installed.place(), { detail });
}

const storage = (name: 'localStorage' | 'sessionStorage'): Storage | null => {
  try { return typeof window === 'undefined' ? null : window[name]; } catch { return null; }
};

/** Starts counting, once. Returns the way to stop, for a component that goes away. */
export function installAnalytics(store = useStore): () => void {
  if (installed || typeof window === 'undefined') return () => {};
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const tracker = new Tracker({
    enabled: () => store.getState().settings.analytics,
    local: storage('localStorage'), session: storage('sessionStorage'),
    lang: () => store.getState().settings.lang,
    device: deviceOf(coarse, Math.min(screen.width, screen.height)),
    version: typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev',
    online: () => navigator.onLine !== false,
  });
  const place = () => placeOf(store.getState());
  installed = { tracker, place };
  tracker.open(place());

  // Weeks played in this visit, and what the last `leave` said, so that putting the page away twice in the same place counts once.
  let weeks = 0, lastWeek: { game: string; week: number } | null = null, lastLeave = '';
  const unsubscribe = store.subscribe((next, prev) => {
    if (!next.settings.analytics) { if (prev.settings.analytics) tracker.stop(); return; }
    if (!prev.settings.analytics) tracker.open(place());
    if (next.game === prev.game) return;
    // This runs inside every change the game makes, so nothing in it may throw.
    try {
      for (const ch of changes(prev, next, Date.now())) tracker.track(ch.t, placeOf(next), ch.extra);
      if (next.game) {
        const week = weekOf(next.game);
        if (lastWeek?.game === next.game.id && week > lastWeek.week) weeks += week - lastWeek.week;
        lastWeek = { game: next.game.id, week };
      }
    } catch { /* not counted, then */ }
  });
  const leave = (e: Event) => {
    if (e.type === 'visibilitychange' && document.visibilityState !== 'hidden') return;
    const p = place();
    const key = `${store.getState().game?.id ?? ''}|${p.screen}|${p.week ?? ''}`;
    if (key !== lastLeave) { lastLeave = key; tracker.track('leave', p, { n: weeks }); }
    void tracker.flush(true);
  };
  document.addEventListener('visibilitychange', leave);
  window.addEventListener('pagehide', leave);
  const timer = setInterval(() => void tracker.flush(), FLUSH_MS);
  return () => {
    unsubscribe();
    document.removeEventListener('visibilitychange', leave);
    window.removeEventListener('pagehide', leave);
    clearInterval(timer);
    void tracker.flush();
    installed = null;
  };
}
