import { PARTY_IDS, type PartyId } from './types';

/**
 * Seats where a party stands aside for another under an electoral pact:
 * seat id -> [party] the party it stands aside for, or -1 where it stands.
 */
export type StandDowns = Record<string, number[]>;

/** Where a party's voters go when it stands aside: to the pact partner, or nowhere. The rest scatter to whoever is left. */
export interface Transfer { to: number; home: number }

const DEFAULT: Transfer = { to: 0.35, home: 0.2 };

/**
 * Voters do not move as their leaders tell them. These rates say how many
 * follow, by which party stands aside ("from") for which ("to"). Old enemies
 * transfer badly; parties that share a base transfer well.
 */
const RATES: Partial<Record<`${PartyId}>${PartyId}`, Transfer>> = {
  'ps>bp': { to: 0.6, home: 0.15 },
  'bp>ps': { to: 0.4, home: 0.15 },
  'bp>pt': { to: 0.6, home: 0.1 },
  'pt>bp': { to: 0.55, home: 0.15 },
  'ps>pt': { to: 0.15, home: 0.35 },
  'pt>ps': { to: 0.15, home: 0.35 },
  'bp>gbk': { to: 0.6, home: 0.15 },
  'gbk>bp': { to: 0.6, home: 0.15 },
  'bp>gbs': { to: 0.6, home: 0.15 },
  'gbs>bp': { to: 0.6, home: 0.15 },
  'pt>gbs': { to: 0.5, home: 0.15 },
  'gbs>pt': { to: 0.5, home: 0.15 },
  'ps>legasi': { to: 0.55, home: 0.15 },
  'legasi>ps': { to: 0.55, home: 0.15 },
  'ps>gbk': { to: 0.4, home: 0.2 },
  'gbk>ps': { to: 0.35, home: 0.2 },
  // The small parties: the young reformers' voters follow Pakatan Sinar readily and Perikatan Teguh hardly at all;
  // the Borneo locals stand against their larger neighbours, and go with the Barisan or the Sabah parties.
  'genba>ps': { to: 0.6, home: 0.1 },
  'ps>genba': { to: 0.5, home: 0.15 },
  'genba>pt': { to: 0.1, home: 0.4 },
  'cahaya>ps': { to: 0.4, home: 0.2 },
  'ps>cahaya': { to: 0.4, home: 0.2 },
  'cahaya>gbk': { to: 0.2, home: 0.3 },
  'gbk>cahaya': { to: 0.2, home: 0.3 },
  'suara>gbs': { to: 0.2, home: 0.3 },
  'gbs>suara': { to: 0.2, home: 0.3 },
  'suara>bp': { to: 0.5, home: 0.15 },
  'bp>suara': { to: 0.45, home: 0.15 },
  'suara>legasi': { to: 0.45, home: 0.15 },
  'legasi>suara': { to: 0.45, home: 0.15 },
};

export function transferRate(from: number, to: number): Transfer {
  return RATES[`${PARTY_IDS[from]}>${PARTY_IDS[to]}` as keyof typeof RATES] ?? DEFAULT;
}

/**
 * Moves the support of parties that stand aside: part to the partner they
 * stand aside for, part stays home (and so drops out of `shares`), and the
 * rest scatters to the remaining parties in proportion to their support.
 */
export function redistribute(shares: number[], stood: number[]): void {
  for (let q = 0; q < shares.length; q++) {
    const p = stood[q];
    if (p < 0 || shares[q] === 0) continue;
    const s = shares[q];
    shares[q] = 0;
    const { to, home } = transferRate(q, p);
    let others = 0;
    for (let r = 0; r < shares.length; r++) if (stood[r] < 0) others += shares[r];
    const scatter = (1 - to - home) * s;
    if (others > 0) for (let r = 0; r < shares.length; r++) if (stood[r] < 0) shares[r] += (scatter * shares[r]) / others;
    shares[p] += to * s;
  }
}
