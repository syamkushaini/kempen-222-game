import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { PARTIES } from '../data/parties';
import { shownAlliance } from '../state/allianceLook';
import { scenarioInfo, world as generalWorld, worldOf } from '../data/world';
import { LEADERS } from '../sim/campaign/cast';
import { translate, type StringKey } from '../i18n/strings';
import { latestSeatIntel, type SeatIntel } from '../sim/campaign/polls';
import { FORMATION_WEEK, shownWeek } from '../sim/campaign/news';
import { truth } from '../sim/campaign/turn';
import type { Campaign, NewsItem } from '../sim/campaign/types';
import { lastElection, type World } from '../sim/election';
import { classify } from '../sim/project';
import { PARTY_IDS, type ElectionOutcome, type RegionId, type SeatClass, type StateId } from '../sim/types';
import { useStore } from '../state/store';
import { STEPS } from './tutorial';

export type T = (key: StringKey, vars?: Record<string, string | number>) => string;

export function useT(): T {
  const lang = useStore((s) => s.settings.lang);
  // In a state's assembly (a state election or a career in one) some words change: the Chief Minister, not the Prime Minister.
  const assembly = useStore((s) => { const sc = s.game?.campaign.scenario; return !!sc && (sc.startsWith('state:') || sc.startsWith('career:')); });
  // Which state, so that a Sarawak career says Premier and a Sabah one Chief Minister (see headOf in strings.ts).
  const state = useStore((s) => { const sc = s.game?.campaign.scenario; return sc && /^(state|career):/.test(sc) ? sc.slice(sc.indexOf(':') + 1) || undefined : undefined; });
  return useCallback((key, vars) => translate(lang, key, vars, assembly, state), [lang, assembly, state]);
}

export interface Format {
  int(n: number): string;
  pct(x: number, digits?: number): string;
  /** Money: "RM350k", "RM1.24m". */
  rm(n: number): string;
  /** A span of days: "½ day", "1 day", "2½ days". */
  days(d: number): string;
  time(ms: number): string;
  dateTime(ms: number): string;
}

export function useFormat(): Format {
  const lang = useStore((s) => s.settings.lang);
  return useMemo(() => {
    const locale = lang === 'ms' ? 'ms-MY' : 'en-MY';
    const int = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    return {
      int: (n) => int.format(n),
      pct: (x, digits = 1) => `${(x * 100).toFixed(digits)}%`,
      // Under RM500 would round to "RM0k", so small amounts are shown as they are.
      rm: (n) => (Math.abs(n) >= 1_000_000_000_000 ? `RM${(n / 1_000_000_000_000).toFixed(2)}${lang === 'ms' ? ' trilion' : 'tn'}` : Math.abs(n) >= 1_000_000_000 ? `RM${(n / 1_000_000_000).toFixed(2)}${lang === 'ms' ? ' bilion' : 'bn'}` : Math.abs(n) >= 1_000_000 ? `RM${(n / 1_000_000).toFixed(2)}m` : Math.abs(n) < 500 ? `RM${Math.round(n)}` : `RM${Math.round(n / 1000)}k`),
      days: (d) => {
        const whole = Math.floor(d), half = d - whole >= 0.5;
        const unit = translate(lang, d > 1 ? 'unit.days' : 'unit.day');
        return `${whole > 0 ? whole : ''}${half ? '½' : ''} ${unit}`;
      },
      time: (ms) => new Date(ms).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
      dateTime: (ms) => new Date(ms).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }),
    };
  }, [lang]);
}

export function partyName(t: T, index: number): string {
  const id = PARTY_IDS[index];
  return id === 'oth' ? t('party.oth') : PARTIES[id].name;
}

export function partyShort(t: T, index: number): string {
  const id = PARTY_IDS[index];
  return id === 'oth' ? t('party.oth.short') : PARTIES[id].short;
}

/** The name of a party's leader. Independents have none. */
export function leaderName(t: T, index: number): string {
  const id = PARTY_IDS[index];
  return id === 'oth' ? t('party.oth') : LEADERS[id];
}

/** How two leaders get on, in a word. */
export function relationWord(value: number): 'hostile' | 'cold' | 'neutral' | 'warm' | 'close' {
  return value <= -40 ? 'hostile' : value <= -15 ? 'cold' : value < 15 ? 'neutral' : value < 40 ? 'warm' : 'close';
}

export function partyColor(index: number): string {
  const look = shownAlliance();
  if (look && look.members.includes(index)) return look.color;
  return PARTIES[PARTY_IDS[index]].color;
}

/** The alliance's name: the one the player gave it, else the ready-made one. Empty when there is no alliance. */
export function allianceTitle(t: T): string {
  const look = shownAlliance();
  return look ? look.title ?? t(`alliance.name.${look.name}` as StringKey) : '';
}

/** Whether a party stands under the player's alliance's name on the map. */
export const inShownAlliance = (index: number): boolean => !!shownAlliance()?.members.includes(index);

/** What the map calls a party: the alliance's name for each of its members, otherwise the party's own short name. */
export function mapName(t: T, index: number): string {
  return inShownAlliance(index) ? allianceTitle(t) : partyShort(t, index);
}

/** The contest the open game is played in. Falls back to the general election on the title screen. */
/** Whether the player chose to play without seeing the chances of anything left to luck. */
export function useFog(): boolean {
  return useStore((s) => !!s.game?.campaign.challenge?.fog);
}

/** Whether a control is the one the tutorial is pointing at right now. Always false outside the tutorial. */
export function useSpot(): (name: string) => boolean {
  const step = useStore((s) => (s.game?.tutorial ? s.game.tutorial.step : -1));
  const campaign = useStore((s) => s.game?.campaign);
  const selectedSeat = useStore((s) => s.selectedSeat);
  const tab = useStore((s) => s.tab);
  const spots = step >= 0 && campaign && STEPS[step] ? STEPS[step].spots({ campaign, selectedSeat, tab }) : [];
  return (name) => spots.includes(name);
}

/** Whether the screen is phone or tablet width, where the page is one column (matches the stylesheet's 980px breakpoint). */
export function useNarrow(): boolean {
  const query = '(max-width: 980px)';
  const [narrow, setNarrow] = useState(() => typeof matchMedia === 'function' && matchMedia(query).matches);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const watch = matchMedia(query);
    const update = () => setNarrow(watch.matches);
    update();
    watch.addEventListener('change', update);
    return () => watch.removeEventListener('change', update);
  }, []);
  return narrow;
}

/**
 * A tablet held upright: wide enough (640 to 980 points) and tall enough (760 or more) to show the map and the panel one above the
 * other, where a phone shows one at a time. It is still `narrow` (one column), but it has no bottom bar to change screens with.
 */
export const TABLET_QUERY = '(min-width: 640px) and (max-width: 980px) and (min-height: 760px)';
export function useTablet(): boolean {
  const [tablet, setTablet] = useState(() => typeof matchMedia === 'function' && matchMedia(TABLET_QUERY).matches);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const watch = matchMedia(TABLET_QUERY);
    const update = () => setTablet(watch.matches);
    update();
    watch.addEventListener('change', update);
    return () => watch.removeEventListener('change', update);
  }, []);
  return tablet;
}

export function useWorld(): World {
  const scenario = useStore((s) => s.game?.campaign.scenario);
  const results = useStore((s) => s.game?.campaign.career?.results ?? null);
  const newParty = useStore((s) => s.game?.campaign.newParty);
  const following = useStore((s) => s.game?.campaign.following);
  const stronghold = useStore((s) => s.game?.campaign.stronghold);
  const carried = useStore((s) => s.game?.campaign.carried);
  // A party the player made has a world of its own in its first term: see ownWorld.
  const own = useStore((s) => !!s.game?.campaign.career?.own);
  const founded = useStore((s) => !!s.game?.campaign.career?.founded);
  const foundedSeat = useStore((s) => s.game?.campaign.career?.foundedSeat);
  const player = useStore((s) => s.game?.campaign.player);
  return useMemo(
    () => (scenario ? worldOf({ scenario, newParty, following, stronghold, carried, player, career: results || own || founded ? ({ results: results ?? undefined, own, founded, foundedSeat } as Campaign['career']) : null }) : null) ?? generalWorld,
    [scenario, results, newParty, following, stronghold, carried, own, founded, foundedSeat, player],
  );
}

export const seatName = (world: World, id: string) => world.seats[world.seatIndex.get(id)!]?.name ?? id;

/**
 * A region's name: states are translated, other regions carry their own
 * names. In a one-seat contest the only region is the seat itself.
 */
export function regionLabel(t: T, world: World, id: RegionId): string {
  if (world.seats.length === 1) return world.seats[0].name;
  return world.regionNames?.[id] ?? t(`state.${id as StateId}`);
}

/** What the whole contest is called: the country, a state, or the seat being fought. */
export function contestName(t: T, world: World): string {
  if (world.rules.kind === 'byelection') return world.seats[0].name;
  const state = scenarioInfo(world.id)?.state;
  return state ? t(`state.${state}`) : t('map.malaysia');
}

/** A filed week in words: "Week 31", or in a career's campaign "Campaign week 3"; what was filed during talks on a government reads as a day of them. */
export function weekLabel(t: T, c: Campaign, week: number): string {
  if (week >= FORMATION_WEEK) return week === FORMATION_WEEK ? t('form.day0') : t('form.day', { n: week - FORMATION_WEEK });
  const shown = shownWeek(c, week);
  return t(shown.campaign ? 'news.week.campaign' : 'news.week', { n: shown.week });
}

/** A chief's week in words: "ceramah=P.001,ceramah=P.002,canvass" reads "Ceramah (A, B), Door-to-door drive". */
export function actionList(t: T, world: World, value: string): string {
  const seats = new Map<string, string[]>();
  for (const part of value.split(',')) {
    const [id, seat] = part.split('=');
    const at = seats.get(id) ?? [];
    if (seat) at.push(seatName(world, seat));
    seats.set(id, at);
  }
  return [...seats].map(([id, at]) => t(`action.${id}` as StringKey) + (at.length ? ` (${at.join(', ')})` : '')).join(', ');
}

/** Writes out a news item, resolving its "@kind:value" references in the current language. */
export function renderNews(t: T, f: Format, world: World, item: NewsItem): string {
  const list = (names: string[]) => {
    const shown = names.slice(0, 4).join(', ');
    return names.length > 4 ? `${shown} ${t('news.more', { n: names.length - 4 })}` : shown;
  };
  const vars: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(item.vars ?? {})) {
    if (typeof v !== 'string' || !v.startsWith('@')) { vars[k] = v; continue; }
    const [kind, value] = [v.slice(1, v.indexOf(':')), v.slice(v.indexOf(':') + 1)];
    vars[k] =
      kind === 'seat' ? seatName(world, value) :
      kind === 'seats' ? list(value.split(',').map((id) => seatName(world, id))) :
      kind === 'state' ? regionLabel(t, world, value) :
      kind === 'states' ? list(value.split(',').map((st) => regionLabel(t, world, st))) :
      kind === 'party' ? partyName(t, Number(value)) :
      kind === 'leader' ? leaderName(t, Number(value)) :
      kind === 'issue' ? t(`issue.${value}` as StringKey) :
      kind === 'bill' ? t(`${value.startsWith('pledge:') ? 'pledge' : 'demand'}.${value.slice(value.indexOf(':') + 1)}` as StringKey) :
      kind === 'demand' ? t(`demand.${value}` as StringKey) :
      kind === 'portfolio' ? t(`portfolio.${value}` as StringKey) :
      kind === 'role' ? t(`role.${value}` as StringKey) :
      kind === 'holding' ? t(`holding.${value}` as StringKey) :
      kind === 'event' ? t(`event.${value}.title` as StringKey) :
      kind === 'adviser' ? t(`adviser.${value}` as StringKey) :
      kind === 'alliance' ? (shownAlliance()?.title ?? t(`alliance.name.${value}` as StringKey)) :
      kind === 'project' ? t(`project.${value}` as StringKey) :
      kind === 'tool' ? t(`tool.${value}` as StringKey) :
      kind === 'stance' ? t(`stance.${value}` as StringKey) :
      kind === 'doctrine' ? t(`doctrine.${value}` as StringKey) :
      kind === 'faction' ? t(`faction.${value}` as StringKey) :
      kind === 'hopeful' ? t(`hopeful.${value}` as StringKey) :
      kind === 'endorser' ? t(`endorser.${value}` as StringKey) :
      kind === 'outlet' ? t(`outlet.${value}` as StringKey) :
      kind === 'actions' ? actionList(t, world, value) :
      kind === 'mission' ? t(`mission.kind.${value}` as StringKey) :
      kind === 'rm' ? f.rm(Number(value)) : v;
  }
  return t(item.key as StringKey, vars);
}

// ---------- what the map and lists show ----------

/** One seat as drawn on the map. */
export interface SeatDisplay {
  /** Party index leading or winning, or -1 when not yet declared. */
  winner: number;
  margin: number;
  cls: SeatClass;
  /** Shares behind the display, by party, where known. */
  shares: number[] | null;
  /** The player has no fresh information, so this is only the last result. */
  stale: boolean;
}

const lastCache = new WeakMap<World, { outcome: ElectionOutcome; display: SeatDisplay[] }>();
function lastOf(world: World) {
  let entry = lastCache.get(world);
  if (!entry) {
    const outcome = lastElection(world);
    entry = { outcome, display: outcome.seats.map((o) => fromShares(o.votes.map((v) => v / o.valid), false)) };
    lastCache.set(world, entry);
  }
  return entry;
}
/** The last real election in this contest's seats. */
export const lastOutcome = (world: World) => lastOf(world).outcome;

function fromShares(shares: number[], stale: boolean): SeatDisplay {
  let winner = 0, second = -1;
  shares.forEach((s, p) => { if (s > shares[winner]) winner = p; });
  shares.forEach((s, p) => { if (p !== winner && (second === -1 || s > shares[second])) second = p; });
  const margin = shares[winner] - (second === -1 ? 0 : shares[second]);
  return { winner, margin, cls: classify(margin), shares, stale };
}


export function useIntel(): Map<string, SeatIntel> {
  const polls = useStore((s) => s.game?.campaign.polls);
  return useMemo(() => latestSeatIntel(polls ?? []), [polls]);
}

/** How the country would really vote today. Only for developer mode and tests of balance. */
export function useTruth(world: World, campaign: Campaign | undefined, enabled: boolean) {
  return useMemo(() => (campaign && enabled ? truth(world, campaign) : null), [world, campaign, enabled]);
}

export function useCampaignDisplay(): SeatDisplay[] {
  const view = useStore((s) => s.view);
  const dev = useStore((s) => s.dev);
  const campaign = useStore((s) => s.game?.campaign);
  const world = useWorld();
  const intel = useIntel();
  const real = useTruth(world, campaign, dev && view === 'truth');
  return useMemo(() => {
    if (view === 'truth' && real) return real.seats.map((o) => fromShares(o.votes.map((v) => v / o.valid), false));
    if (view === 'estimate') {
      return world.seats.map((seat, i) => {
        const known = intel.get(seat.id);
        return known ? fromShares(known.shares, false) : { ...lastOf(world).display[i], stale: true };
      });
    }
    return lastOf(world).display;
  }, [world, view, intel, real]);
}

export const DisplayContext = createContext<SeatDisplay[]>([]);
export const useDisplay = () => useContext(DisplayContext);

/** Trap Tab inside a dialog: when the last focusable element is reached, Tab wraps to the first (and Shift+Tab the other way). */
export function useFocusTrap(ref: React.RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else if (document.activeElement === last || !el.contains(document.activeElement)) {
        e.preventDefault();
        first?.focus();
      }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [active, ref]);
}

/** Open a dialog: move focus into it, and restore focus to the previously focused element when it closes. */
export function useDialogFocus(open: boolean, onClose: () => void): { dialogRef: React.RefObject<HTMLDivElement | null> } {
  const ref = useRef<HTMLDivElement | null>(null);
  const previous = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previous.current = document.activeElement as HTMLElement | null;
    if (ref.current) ref.current.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (open && previous.current) previous.current.focus();
    };
  }, [open, onClose]);

  return { dialogRef: ref };
}
