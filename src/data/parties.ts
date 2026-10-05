import type { PartyId } from '../sim/types';

/**
 * The parties in the game. All are fictional. Names are proper nouns and are
 * the same in every language; "oth" is a pool of independents and small
 * parties, and its label comes from the translations.
 */
export interface PartyDef {
  name: string;
  short: string;
  color: string;
}

export const PARTIES: Record<PartyId, PartyDef> = {
  ps:     { name: 'Pakatan Sinar',           short: 'PS',     color: '#d9483f' },
  bp:     { name: 'Barisan Pusaka',          short: 'BP',     color: '#3558b8' },
  pt:     { name: 'Perikatan Teguh',         short: 'PT',     color: '#2e9b6a' },
  gbk:    { name: 'Gabungan Bumi Kenyalang', short: 'GBK',    color: '#c9952a' },
  gbs:    { name: 'Gabungan Bayu Sabah',     short: 'GBS',    color: '#38a5cf' },
  legasi: { name: 'Parti Legasi Sabah',      short: 'LEGASI', color: '#8d66d0' },
  oth:    { name: '',                        short: '',       color: '#8a909b' },
  // Small parties: named because they win votes, and sometimes a seat. They run no campaign.
  genba:  { name: 'Parti Generasi Baharu',   short: 'GENBA',  color: '#e0609e' },
  cahaya: { name: 'Parti Cahaya Sarawak',    short: 'CAHAYA', color: '#e8793a' },
  suara:  { name: 'Parti Suara Pedalaman',   short: 'SUARA',  color: '#a3c93a' },
};

/**
 * Colours for players who cannot tell the usual red, blue and green apart. They
 * differ in brightness as well as hue (after Okabe and Ito's colour-blind-safe
 * set), so they still read in grey. Names and everything else stay the same.
 */
export const ACCESSIBLE_COLORS: Record<PartyId, string> = {
  ps: '#e1651a', bp: '#3b8fe0', pt: '#f2d64b', gbk: '#cc79a7', gbs: '#7ed3f0', legasi: '#3fc79a',
  oth: '#8a909b', genba: '#b05bd9', cahaya: '#a9713f', suara: '#5fb3a8',
};

/** The usual colours, kept as they were before any palette or player's party changed them. */
export const STANDARD_COLORS = Object.fromEntries(Object.entries(PARTIES).map(([id, p]) => [id, p.color])) as Record<PartyId, string>;
