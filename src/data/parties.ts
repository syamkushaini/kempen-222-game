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
};
