import type { World } from '../election';
import { BLOC_IDS, type BlocId } from '../types';
import { contests } from './actions';
import type { Campaign } from './types';

// Map layers: extra things the player can ask the map to show, one tick at a time. Each reads what the game already knows
// (the leading party, the margin, last time's result, the pacts, the branches, the voters) and says which seats to mark.
// This file only decides; the map draws.

export const LAYER_IDS = ['marginal', 'flipped', 'mine', 'machinery', 'unpolled', 'campaign', 'pacts', 'blocs'] as const;
export type LayerId = (typeof LAYER_IDS)[number];

/** What the map shows to a player who has not chosen: the tents and flags it has always shown. */
export const DEFAULT_LAYERS: LayerId[] = ['campaign'];

export const isLayerId = (x: unknown): x is LayerId => typeof x === 'string' && (LAYER_IDS as readonly string[]).includes(x);

/** Reads a list of layers from storage, dropping anything unknown. Null where nothing usable was kept. */
export function cleanLayers(x: unknown): LayerId[] | null {
  if (!Array.isArray(x)) return null;
  return [...new Set(x.filter(isLayerId))];
}

/** The shapes a mark can take: all small, all fit in a square of 14, centred on the seat. */
export type PinKind = 'ring' | 'dot' | 'bullseye' | 'square' | 'diamond' | 'down' | 'up' | 'hex';

/** One mark on one seat. Coloured by a party where `party` is set, otherwise by `color`. */
export interface Pin { seat: string; layer: LayerId; kind: PinKind; party?: number; color?: string; family?: BlocFamily; /** Its place among the marks in the same seat, from 0, and how many there are. */ slot: number; of: number }

/** What each layer marks with, for the key. */
export const LAYER_KIND: Partial<Record<LayerId, PinKind>> = { marginal: 'ring', flipped: 'dot', mine: 'square', unpolled: 'diamond', pacts: 'down', blocs: 'hex' };

export const MARGINAL_COLOR = '#f59e0b';
export const UNPOLLED_COLOR = '#94a3b8';
export const MACHINERY_COLOR = '#14b8a6';
/** How many seats the player's closest chances are marked, among those held by others. */
export const TARGETS = 10;

/** The voters, in six families, so that a map can say who lives where without thirteen colours. */
export const BLOC_FAMILIES = {
  rural: ['heartland', 'felda', 'agri'],
  middle: ['m40', 'urban_lib', 'smallbiz', 'civil'],
  workers: ['urban_b40', 'gig'],
  young: ['undi18'],
  seniors: ['seniors'],
  borneo: ['borneo_native', 'borneo_urban'],
} as const satisfies Record<string, readonly BlocId[]>;
export type BlocFamily = keyof typeof BLOC_FAMILIES;
export const FAMILY_IDS = Object.keys(BLOC_FAMILIES) as BlocFamily[];
export const FAMILY_COLORS: Record<BlocFamily, string> = {
  rural: '#65a30d', middle: '#3b82f6', workers: '#f97316', young: '#ec4899', seniors: '#a8a29e', borneo: '#a855f7',
};

/** The family of voters that is the largest in a seat. */
export function dominantFamily(blocs: number[]): BlocFamily {
  let best: BlocFamily = 'middle', most = -1;
  for (const f of FAMILY_IDS) {
    const share = (BLOC_FAMILIES[f] as readonly BlocId[]).reduce((a, id) => a + (blocs[BLOC_IDS.indexOf(id)] ?? 0), 0);
    if (share > most) { most = share; best = f; }
  }
  return best;
}

/** What a layer needs of the game: how each seat is shown now, and how it stood at the last election. */
export interface LayerInput {
  world: World;
  campaign: Campaign | undefined;
  display: { winner: number; margin: number; cls: string; stale: boolean }[];
  last: { winner: number }[];
}

type Raw = Omit<Pin, 'slot' | 'of'>;

/** The marks the ticked layers put on the map, grouped by seat so that several on one seat sit side by side. */
export function layerPins(input: LayerInput, on: ReadonlySet<LayerId>): Pin[] {
  const { world, campaign: c, display, last } = input;
  const me = c ? c.player : null;
  const raw: Raw[] = [];

  world.seats.forEach((seat, i) => {
    const d = display[i];
    if (!d) return;
    if (on.has('marginal') && d.winner >= 0 && d.cls === 'marginal') raw.push({ seat: seat.id, layer: 'marginal', kind: 'ring', color: MARGINAL_COLOR });
    if (on.has('flipped') && d.winner >= 0 && last[i] && last[i].winner >= 0 && d.winner !== last[i].winner) raw.push({ seat: seat.id, layer: 'flipped', kind: 'dot', party: last[i].winner });
    if (on.has('unpolled') && d.stale) raw.push({ seat: seat.id, layer: 'unpolled', kind: 'diamond', color: UNPOLLED_COLOR });
    if (on.has('blocs')) raw.push({ seat: seat.id, layer: 'blocs', kind: 'hex', family: dominantFamily(seat.blocs), color: FAMILY_COLORS[dominantFamily(seat.blocs)] });
    if (on.has('mine') && me !== null && d.winner === me) raw.push({ seat: seat.id, layer: 'mine', kind: 'square', party: me });
    if (on.has('pacts') && c && me !== null) {
      const sd = c.standDowns[seat.id];
      if (sd) {
        if (sd[me] >= 0) raw.push({ seat: seat.id, layer: 'pacts', kind: 'down', party: me });
        else if (sd.some((v, q) => v === me && q !== me)) raw.push({ seat: seat.id, layer: 'pacts', kind: 'up', party: me });
        else if (sd.some((v) => v >= 0)) raw.push({ seat: seat.id, layer: 'pacts', kind: 'down', color: UNPOLLED_COLOR });
      }
    }
  });

  // The player's closest chances: seats held by others, where the party has a candidate, with the smallest leads.
  if (on.has('mine') && c && me !== null) {
    const chances = world.seats
      .map((seat, i) => ({ seat, i, d: display[i] }))
      .filter((x) => x.d && x.d.winner >= 0 && x.d.winner !== me && contests(world, c, x.i, me))
      .sort((a, b) => a.d.margin - b.d.margin)
      .slice(0, TARGETS);
    for (const x of chances) raw.push({ seat: x.seat.id, layer: 'mine', kind: 'bullseye', party: me });
  }

  const bySeat = new Map<string, Raw[]>();
  for (const r of raw) bySeat.set(r.seat, [...(bySeat.get(r.seat) ?? []), r]);
  const out: Pin[] = [];
  for (const list of bySeat.values()) list.forEach((r, slot) => out.push({ ...r, slot, of: list.length }));
  return out;
}

/** How strong the player's branches are under each seat, 0 to 1: a state's machinery is that of its seats. Null where there is nothing to show. */
export function machineryHeat(world: World, c: Campaign | undefined): Record<string, number> | null {
  if (!c || world.seats.length < 2) return null;
  const pc = c.parties[c.player];
  if (!pc) return null;
  const out: Record<string, number> = {};
  world.seats.forEach((seat, i) => {
    const m = pc.machinery[world.states.indexOf(seat.state)] ?? 0;
    if (m > 0 && contests(world, c, i, c.player)) out[seat.id] = Math.min(1, m / 100);
  });
  return out;
}
