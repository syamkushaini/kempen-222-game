import type { Campaign } from './types';

// What a campaign leaves on the ground, for the map to show: where the
// parties have been working a seat. It is read from the lift each party's
// visits have given it there, which fades week by week, so a mark is a seat
// worked lately and it goes when the party stops coming.

/** A seat boost of this much or more shows as flags; this much more, as a ceramah tent. */
export const MARK = { flag: 0.03, tent: 0.1 };
/** No more than this many parties are marked in one seat: the ones working it hardest. Two there is a flag war. */
const PER_SEAT = 2;

export interface Mark { seat: string; party: number; kind: 'tent' | 'flag'; /** Its place among the marks in the same seat, from 0, and how many there are. */ slot: number; of: number }

/** The marks to draw, the hardest-worked party first in each seat. Nothing outside a campaign. */
export function campaignMarks(c: Campaign): Mark[] {
  if (c.phase !== 'campaign') return [];
  const out: Mark[] = [];
  for (const [seat, lift] of Object.entries(c.dyn.support.seat)) {
    const working = lift
      .map((v, party) => ({ v, party }))
      .filter((x) => x.v >= MARK.flag && !!c.parties[x.party])
      .sort((a, b) => b.v - a.v)
      .slice(0, PER_SEAT);
    working.forEach((x, slot) => out.push({ seat, party: x.party, kind: x.v >= MARK.tent ? 'tent' : 'flag', slot, of: working.length }));
  }
  return out;
}
