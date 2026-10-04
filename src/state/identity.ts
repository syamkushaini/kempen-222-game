import type { PartyId } from '../sim/types';

/** Simple marks a party can put on its flag. None copies a real party's symbol. */
export const EMBLEM_IDS = ['sun', 'torch', 'mountain', 'wave', 'paddy', 'star', 'tree', 'bridge'] as const;
export type EmblemId = (typeof EMBLEM_IDS)[number];

/** Colours on offer to a new party. */
export const PARTY_COLORS = ['#d9483f', '#3558b8', '#2e9b6a', '#c9952a', '#38a5cf', '#8d66d0', '#d2691e', '#0f766e', '#be185d', '#475569'];

/** How many ready-made portraits a new leader can choose from. */
export const LOOK_COUNT = 8;

/**
 * A party the player has made their own: a new name, colours and leader on
 * top of the party it grew out of. Presentation only; the rules see the same
 * party as before.
 */
export interface Identity {
  name: string;
  short: string;
  color: string;
  emblem: EmblemId;
  leader: string;
  /** Index into the ready-made portraits. */
  look: number;
}

/** The marks the established parties fly. */
export const DEFAULT_EMBLEMS: Record<Exclude<PartyId, 'oth'>, EmblemId> = {
  ps: 'sun', bp: 'torch', pt: 'mountain', gbk: 'wave', gbs: 'paddy', legasi: 'star',
};

const tidy = (s: string, max: number) => s.replace(/\s+/g, ' ').trim().slice(0, max);

/** Cleans up what the player typed, or returns null if there is not enough to make a party of. */
export function makeIdentity(raw: { name: string; short: string; color: string; emblem: string; leader: string; look: number }): Identity | null {
  const name = tidy(raw.name, 40), leader = tidy(raw.leader, 50);
  const short = tidy(raw.short, 6).toUpperCase();
  if (!name || !leader || !short) return null;
  if (!PARTY_COLORS.includes(raw.color) || !(EMBLEM_IDS as readonly string[]).includes(raw.emblem)) return null;
  if (!Number.isInteger(raw.look) || raw.look < 0 || raw.look >= LOOK_COUNT) return null;
  return { name, short, color: raw.color, emblem: raw.emblem as EmblemId, leader, look: raw.look };
}

/** Whether something read from a save is a usable identity. Null means the party is played as it is. */
export function isValidIdentity(x: unknown): x is Identity | null {
  if (x === null) return true;
  if (typeof x !== 'object' || Array.isArray(x)) return false;
  const o = x as Record<string, unknown>;
  if (typeof o.name !== 'string' || typeof o.short !== 'string' || typeof o.color !== 'string' || typeof o.emblem !== 'string' || typeof o.leader !== 'string' || typeof o.look !== 'number') return false;
  const made = makeIdentity(o as Parameters<typeof makeIdentity>[0]);
  return !!made && made.name === o.name && made.short === o.short && made.leader === o.leader;
}
