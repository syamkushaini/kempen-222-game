import { PARTIES } from '../data/parties';
import { isValidIdentity, type Identity } from './identity';
import type { KeyValueStore } from './saves';

/**
 * Parties the player has made, kept apart from any one game so that a party
 * made for a by-election can stand again in a general election without being
 * made a second time. Only the look is kept (name, colours, flag and leader);
 * a party is dressed onto whichever slot the new game gives it, so it never
 * brings an id of its own to clash with the parties already in the world.
 */
export interface SavedParty {
  /** When it was last used, newest first. Also tells two saved parties apart. */
  at: number;
  identity: Identity;
}

const KEY = 'k222.parties';
export const MAX_SAVED_PARTIES = 8;

// Taken before any game dresses a party in the player's colours: a party that is only an established one under its own name is not one the player made.
const STOCK_NAMES = new Set(Object.values(PARTIES).flatMap((p) => [p.name, p.short]).filter(Boolean).map((s) => s.toLowerCase()));

/** Whether a party's name or short name is one an established party already goes by. Such a party would be mistaken for it, and is not kept. */
export const clashesWithStock = (identity: Identity): boolean => STOCK_NAMES.has(identity.name.toLowerCase()) || STOCK_NAMES.has(identity.short.toLowerCase());

const sameParty = (a: Identity, b: Identity) => a.name.toLowerCase() === b.name.toLowerCase() && a.short === b.short;

/** Reads the saved parties from text. Anything unrecognised, or that clashes with an established party, is dropped; nonsense gives none. */
export function parseParties(text: string | null): SavedParty[] {
  if (!text) return [];
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return []; }
  if (!Array.isArray(raw)) return [];
  const out: SavedParty[] = [];
  for (const x of raw) {
    if (typeof x !== 'object' || x === null) continue;
    const { at, identity } = x as Record<string, unknown>;
    if (typeof at !== 'number' || !Number.isFinite(at) || identity === null || !isValidIdentity(identity)) continue;
    if (clashesWithStock(identity) || out.some((p) => p.at === at || sameParty(p.identity, identity))) continue;
    out.push({ at, identity });
    if (out.length >= MAX_SAVED_PARTIES) break;
  }
  return out;
}

/** Keeps a party at the top of the list. One of the same name and short name is replaced by it; the oldest gives way when the list is full. */
export function keepParty(list: SavedParty[], identity: Identity, now: number): SavedParty[] {
  if (clashesWithStock(identity)) return list;
  const at = Math.max(now, ...list.map((p) => p.at + 1));
  return [{ at, identity }, ...list.filter((p) => !sameParty(p.identity, identity))].slice(0, MAX_SAVED_PARTIES);
}

export const forgetParty = (list: SavedParty[], at: number): SavedParty[] => list.filter((p) => p.at !== at);

/** Reads and writes the saved parties. Storage can be missing or full; nothing here throws. */
export class PartyBook {
  constructor(private kv: KeyValueStore | null) {}

  load(): SavedParty[] {
    try { return parseParties(this.kv?.getItem(KEY) ?? null); } catch { return []; }
  }

  save(list: SavedParty[]): boolean {
    if (!this.kv) return false;
    try { this.kv.setItem(KEY, JSON.stringify(list)); return true; } catch { return false; }
  }
}
