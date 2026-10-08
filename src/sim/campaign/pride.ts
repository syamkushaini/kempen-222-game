import type { World } from '../election';
import { zeros } from '../math';
import { BLOC_IDS, N_PARTIES, PARTY_IDS } from '../types';
import type { Campaign } from './types';

// "Sabah for the people of Sabah": in the Borneo states the voters give something extra to a party that is of the place and
// ask something of one that comes from across the sea. It is on top of the vote the parties had last time.

/** The parties of Sabah and Sarawak. */
const BORNEAN = ['gbk', 'gbs', 'legasi', 'cahaya', 'suara'] as const;
export const isBornean = (p: number): boolean => (BORNEAN as readonly string[]).includes(PARTY_IDS[p]);
const BORNEO_STATES = ['sabah', 'sarawak', 'labuan'];
const OTH = PARTY_IDS.indexOf('oth');

/** What a local party gains, and what a party of the Peninsula loses, in a seat that is wholly Borneo: scaled by how Borneo the seat is. */
export const PRIDE = { local: 0.07, away: 0.04, floor: 0.5 };

/** How much of a seat's voters are of Borneo, from nothing to one. */
export const borneoShare = (blocs: number[]): number => blocs[BLOC_IDS.indexOf('borneo_native')] + blocs[BLOC_IDS.indexOf('borneo_urban')];

export const prideIn = (world: World, seatIndex: number): { local: number; away: number } => {
  const seat = world.seats[seatIndex];
  if (!BORNEO_STATES.includes(seat.state)) return { local: 0, away: 0 };
  const scale = PRIDE.floor + Math.min(1, borneoShare(seat.blocs));
  return { local: PRIDE.local * scale, away: PRIDE.away * scale };
};

/** At the start of a campaign: in every seat of Borneo, local parties are lifted and the others are asked to pay for coming from elsewhere. */
export function applyPride(world: World, c: Campaign): void {
  world.seats.forEach((seat, i) => {
    const pride = prideIn(world, i);
    if (pride.local === 0) return;
    const row = (c.drift.support.seat[seat.id] ??= zeros(N_PARTIES));
    for (let p = 0; p < N_PARTIES; p++) {
      if (!c.parties[p] || p === OTH || !world.baseline.contesting[i][p]) continue;
      row[p] += isBornean(p) ? pride.local : -pride.away;
    }
  });
}
