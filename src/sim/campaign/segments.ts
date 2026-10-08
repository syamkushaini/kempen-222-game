import { BLOC_IDS, N_BLOCS, N_PARTIES, type BlocId, type SeatData } from '../types';
import { zeros2 } from '../math';
import type { Dynamics } from '../types';

// A seat is not one electorate but several. A ceramah can be pitched to one of them: the village heartland, the first-time
// voters, the civil servants. The pitch lands hard on the group it is for, lands softly on the groups like them, and
// goes down badly with the groups that are not. So the biggest group is not always the one to aim at: aim at a group
// that is a third of the seat and lose another that is a quarter, and the night was worth less than a plain ceramah.

/** Voter groups that think alike. A pitch to one is heard by the others in its family. */
export type Family = 'rural' | 'service' | 'working' | 'middle' | 'liberal' | 'young';
export const BLOC_FAMILY: Record<BlocId, Family> = {
  heartland: 'rural', felda: 'rural', agri: 'rural', seniors: 'rural', borneo_native: 'rural',
  civil: 'service',
  urban_b40: 'working', gig: 'working',
  m40: 'middle', smallbiz: 'middle',
  urban_lib: 'liberal', borneo_urban: 'liberal',
  undi18: 'young',
};

const FAMILIES: Family[] = ['rural', 'service', 'working', 'middle', 'liberal', 'young'];

/**
 * How a pitch to a family is heard by another, from −1 (they resent it) to 1 (they hear it as their own). Symmetric.
 * Rows and columns follow FAMILIES.
 */
const HEARD: number[][] = [
  //        rural  service working middle liberal young
  /* rural   */ [1,   0.2,  0.1,  0,    -0.5,  -0.3],
  /* service */ [0.2, 1,    0.1,  0.3,  -0.1,  -0.2],
  /* working */ [0.1, 0.1,  1,    0.2,  -0.1,   0.2],
  /* middle  */ [0,   0.3,  0.2,  1,     0.2,   0.1],
  /* liberal */ [-0.5, -0.1, -0.1, 0.2,  1,     0.3],
  /* young   */ [-0.3, -0.2, 0.2,  0.1,  0.3,   1],
];

/** What a pitch does among groups that are not its target, as a share of the lift a plain ceramah would give everyone. */
export const SPILL = 0.5;
/** How hard a group set against a pitch takes it, as a multiple of how opposed the two are. */
export const RESENT = 0.8;
/** What a pitch does for its own target, as a multiple of the lift a plain ceramah would give everyone. */
export const FOCUS = 3;
/** The part of a pitched event that is simply being seen in the seat, whoever it was for. */
export const SEEN = 0.35;

/** How group `o` takes a pitch made to group `b`: the target itself, then its own family, then the rest by how alike or opposed they are. */
export function heard(b: BlocId, o: BlocId): number {
  if (b === o) return FOCUS;
  const h = HEARD[FAMILIES.indexOf(BLOC_FAMILY[b])][FAMILIES.indexOf(BLOC_FAMILY[o])];
  // Within a family, the groups are close but not the same people. A group set against the pitch resents it more than a neighbour welcomes it.
  if (BLOC_FAMILY[b] === BLOC_FAMILY[o]) return 0.6 * SPILL;
  return h < 0 ? h * RESENT : h * SPILL;
}

/** The groups in a seat worth pitching to: those that are at least this share of its voters. */
export const MIN_SEGMENT = 0.03;
export const segmentsIn = (seat: SeatData): BlocId[] => BLOC_IDS.filter((_, i) => seat.blocs[i] >= MIN_SEGMENT).sort((a, b) => seat.blocs[BLOC_IDS.indexOf(b)] - seat.blocs[BLOC_IDS.indexOf(a)]);

/**
 * What a pitch to one group is worth in this seat, as a multiple of a plain ceramah's lift across the whole seat:
 * above 1 where the target is big and nobody much opposes it, below 1 where it is small or stirs a large group against it.
 */
export function pitchValue(seat: SeatData, target: BlocId): number {
  let v = SEEN;
  BLOC_IDS.forEach((o, i) => { v += seat.blocs[i] * heard(target, o); });
  return v;
}

/** Which groups a pitch to this one will not please: the ones with a share in the seat that hear it as against them. */
export function resentful(seat: SeatData, target: BlocId): BlocId[] {
  return BLOC_IDS.filter((o, i) => seat.blocs[i] >= MIN_SEGMENT && heard(target, o) < 0);
}

/** Adds a pitch's lift to a seat's group layer: `units` is the lift a plain ceramah would give everyone. Returns the part that is seen by all. */
export function addPitch(dyn: Dynamics, seatId: string, p: number, target: BlocId, units: number, cap: number): number {
  const rows = ((dyn.support.seatBloc ??= {})[seatId] ??= zeros2(N_BLOCS, N_PARTIES));
  BLOC_IDS.forEach((o, b) => {
    const lift = units * heard(target, o);
    // Growth slows as a group's boost nears the cap; a resented pitch is not slowed.
    const room = lift > 0 ? Math.max(0, 1 - rows[b][p] / cap) : 1;
    rows[b][p] += lift * room;
  });
  return units * SEEN;
}
