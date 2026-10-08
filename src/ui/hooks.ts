import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PARTIES } from '../data/parties';
import { scenarioInfo, world as generalWorld, worldOf } from '../data/world';
import { LEADERS } from '../sim/campaign/cast';
import { translate, type StringKey } from '../i18n/strings';
import { latestSeatIntel, type SeatIntel } from '../sim/campaign/polls';
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
  return useCallback((key, vars) => translate(lang, key, vars, assembly), [lang, assembly]);
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
      rm: (n) => (Math.abs(n) >= 1_000_000 ? `RM${(n / 1_000_000).toFixed(2)}m` : Math.abs(n) < 500 ? `RM${Math.round(n)}` : `RM${Math.round(n / 1000)}k`),
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
  return PARTIES[PARTY_IDS[index]].color;
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

export function useWorld(): World {
  const scenario = useStore((s) => s.game?.campaign.scenario);
  const results = useStore((s) => s.game?.campaign.career?.results ?? null);
  const newParty = useStore((s) => s.game?.campaign.newParty);
  // A party the player made has a world of its own in its first term: see ownWorld.
  const own = useStore((s) => !!s.game?.campaign.career?.own);
  const founded = useStore((s) => !!s.game?.campaign.career?.founded);
  const player = useStore((s) => s.game?.campaign.player);
  return useMemo(
    () => (scenario ? worldOf({ scenario, newParty, player, career: results || own || founded ? ({ results: results ?? undefined, own, founded } as Campaign['career']) : null }) : null) ?? generalWorld,
    [scenario, results, newParty, own, founded, player],
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
      kind === 'alliance' ? t(`alliance.name.${value}` as StringKey) :
      kind === 'faction' ? t(`faction.${value}` as StringKey) :
      kind === 'hopeful' ? t(`hopeful.${value}` as StringKey) :
      kind === 'endorser' ? t(`endorser.${value}` as StringKey) :
      kind === 'outlet' ? t(`outlet.${value}` as StringKey) :
      kind === 'actions' ? actionList(t, world, value) :
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
