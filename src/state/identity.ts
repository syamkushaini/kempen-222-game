import type { PartyId } from '../sim/types';

/** Simple marks a party can put on its flag. None copies a real party's symbol. */
export const EMBLEM_IDS = ['sun', 'torch', 'mountain', 'wave', 'paddy', 'star', 'tree', 'bridge'] as const;
export type EmblemId = (typeof EMBLEM_IDS)[number];

/** Colours on offer to a new party. */
export const PARTY_COLORS = [
  '#d9483f', '#3558b8', '#2e9b6a', '#c9952a', '#38a5cf', '#8d66d0', '#d2691e', '#0f766e', '#be185d', '#475569',
  '#7f1d1d', '#ef4444', '#fb7185', '#f59e0b', '#eab308', '#a16207', '#84cc16', '#4d7c0f', '#16a34a', '#14b8a6',
  '#06b6d4', '#0369a1', '#1e3a8a', '#4f46e5', '#7c3aed', '#c026d3', '#f472b6', '#78350f', '#1f2937', '#9ca3af',
];

/** How light a colour looks, from 0 (black) to 1 (white). */
export function lightnessOf(hex: string): number {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
/** A colour of the player's own choosing is any shade that stays readable as a party's colour: neither near-white nor invisible on the dark theme. */
export const COLOR_LIGHTEST = 0.55, COLOR_DARKEST = 0.012;
export const isOwnColor = (c: string): boolean => /^#[0-9a-f]{6}$/.test(c) && lightnessOf(c) <= COLOR_LIGHTEST && lightnessOf(c) >= COLOR_DARKEST;
/** The nearest readable shade to what the picker gave: too pale is darkened, too dark lightened, a step at a time. */
export function fitColor(raw: string): string {
  let c = /^#[0-9a-f]{6}$/i.test(raw) ? raw.toLowerCase() : '#475569';
  for (let i = 0; i < 40 && !isOwnColor(c); i++) {
    const pale = lightnessOf(c) > COLOR_LIGHTEST;
    c = '#' + [1, 3, 5].map((k) => { const x = parseInt(c.slice(k, k + 2), 16); return Math.max(0, Math.min(255, Math.round(pale ? x * 0.92 : x * 1.1 + 4))).toString(16).padStart(2, '0'); }).join('');
  }
  return c;
}

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
  /** A photo the player gave their leader, shrunk to a small picture. When there is one, it is shown in place of the ready-made portrait. */
  photo?: string;
  /** A picture the player gave the party as its flag, shown in place of the ready-made emblem. */
  flag?: string;
}

/** The most a saved picture may weigh, as text. They are shrunk well below this before they are kept. */
export const PICTURE_MAX = 60_000;

/** Whether something is a small picture the game made itself: a data address for a JPEG, PNG or WebP, and nothing else. */
export const isPicture = (x: unknown): x is string => typeof x === 'string' && x.length <= PICTURE_MAX && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(x);

/** The marks the established parties fly. */
export const DEFAULT_EMBLEMS: Record<Exclude<PartyId, 'oth'>, EmblemId> = {
  ps: 'sun', bp: 'torch', pt: 'mountain', gbk: 'wave', gbs: 'paddy', legasi: 'star',
  genba: 'bridge', cahaya: 'torch', suara: 'tree',
};

const tidy = (s: string, max: number) => s.replace(/\s+/g, ' ').trim().slice(0, max);

/** Cleans up what the player typed, or returns null if there is not enough to make a party of. */
export function makeIdentity(raw: { name: string; short: string; color: string; emblem: string; leader: string; look: number; photo?: string; flag?: string }): Identity | null {
  const name = tidy(raw.name, 40), leader = tidy(raw.leader, 50);
  const short = tidy(raw.short, 6).toUpperCase();
  if (!name || !leader || !short) return null;
  if (!(PARTY_COLORS.includes(raw.color) || isOwnColor(raw.color)) || !(EMBLEM_IDS as readonly string[]).includes(raw.emblem)) return null;
  if (!Number.isInteger(raw.look) || raw.look < 0 || raw.look >= LOOK_COUNT) return null;
  if ((raw.photo !== undefined && !isPicture(raw.photo)) || (raw.flag !== undefined && !isPicture(raw.flag))) return null;
  const made: Identity = { name, short, color: raw.color, emblem: raw.emblem as EmblemId, leader, look: raw.look };
  if (raw.photo) made.photo = raw.photo;
  if (raw.flag) made.flag = raw.flag;
  return made;
}

/** Whether something read from a save is a usable identity. Null means the party is played as it is. */
export function isValidIdentity(x: unknown): x is Identity | null {
  if (x === null) return true;
  if (typeof x !== 'object' || Array.isArray(x)) return false;
  const o = x as Record<string, unknown>;
  if (typeof o.name !== 'string' || typeof o.short !== 'string' || typeof o.color !== 'string' || typeof o.emblem !== 'string' || typeof o.leader !== 'string' || typeof o.look !== 'number') return false;
  const made = makeIdentity(o as Parameters<typeof makeIdentity>[0]);
  return !!made && made.name === o.name && made.short === o.short && made.leader === o.leader && made.photo === o.photo && made.flag === o.flag;
}
