// How a House is laid out as a hemicycle: where each seat goes, and which party sits in it. Kept apart from the drawing,
// flat or 3D, so that both draw the same chamber and so that the arithmetic can be tested.

/** Which end of the chamber a group of members sits at: the side being counted toward a majority, the other side, or the benches between. */
export type Side = 'left' | 'middle' | 'right';
export type Stance = 'aye' | 'no' | 'waver';

export interface Bloc {
  party: number;
  seats: number;
  side: Side;
  /** How the bloc votes, when the chamber is showing a division. */
  vote?: Stance;
  /** Its seats are not shown yet: the chamber is filling, and this bloc's turn has not come. */
  hidden?: boolean;
}

export interface Place {
  /** Across the chamber, from -1 at the far left to 1 at the far right. */
  x: number;
  /** Depth into the chamber, from 0 at the front to 1 at the back of the middle. */
  y: number;
  /** Which bench, from 0 at the front. */
  row: number;
  /** How far round from the left the seat is, 0 to 1. */
  turn: number;
}

const INNER = 0.38;

/** How many benches a chamber of `n` seats needs for the seats to be about as far apart along a bench as the benches are from each other. */
export function benches(n: number): number {
  return Math.max(1, Math.min(10, Math.round(0.5 + Math.sqrt(0.25 + n / 3.5))));
}

/**
 * The seats of a hemicycle, in order from the far left round to the far right. Longer benches at the back hold more
 * seats, in proportion to their length, so the seats are evenly spread. Taken in this order, a run of seats is a wedge.
 */
export function hemicycle(n: number): Place[] {
  if (n <= 0) return [];
  const rows = benches(n);
  const radius = (i: number) => (rows === 1 ? 0.75 : INNER + ((1 - INNER) * i) / (rows - 1));
  const total = Array.from({ length: rows }, (_, i) => radius(i)).reduce((a, b) => a + b, 0);
  // Largest remainders: every bench gets its share, and the seats left over go where the shares were cut shortest.
  const exact = Array.from({ length: rows }, (_, i) => (n * radius(i)) / total);
  const count = exact.map(Math.floor);
  const spare = n - count.reduce((a, b) => a + b, 0);
  exact.map((e, i) => ({ i, rest: e - Math.floor(e) })).sort((a, b) => b.rest - a.rest || b.i - a.i).slice(0, spare).forEach(({ i }) => count[i]++);
  const out: Place[] = [];
  count.forEach((seats, row) => {
    for (let j = 0; j < seats; j++) {
      const turn = (j + 0.5) / seats;
      const angle = Math.PI * (1 - turn);
      out.push({ x: radius(row) * Math.cos(angle), y: radius(row) * Math.sin(angle), row, turn });
    }
  });
  return out.sort((a, b) => a.turn - b.turn || a.row - b.row);
}

/** The gap between neighbouring seats, for sizing whatever is drawn in them. */
export function pitch(n: number): number {
  const rows = benches(n);
  const between = rows === 1 ? 1 : (1 - INNER) / (rows - 1);
  const places = hemicycle(n);
  const front = places.filter((p) => p.row === 0).length;
  const along = front > 1 ? (Math.PI * (rows === 1 ? 0.75 : INNER)) / front : between;
  return Math.min(between, along);
}

export interface Member { party: number; side: Side; vote?: Stance; hidden?: boolean; /** Its number within its own party and side, so that a member keeps its identity when the benches are rearranged. */ k: number }

/**
 * Who sits where, from left to right: the blocs on the left in the order given, then those in the middle, then those on the
 * right in reverse, so that the first bloc named on each side sits at its own end of the chamber.
 */
export function arrange(blocs: Bloc[]): Member[] {
  const pick = (side: Side) => blocs.filter((b) => b.side === side && b.seats > 0);
  const order = [...pick('left'), ...pick('middle'), ...pick('right').reverse()];
  const seen = new Map<number, number>();
  return order.flatMap((b) => Array.from({ length: Math.round(b.seats) }, () => {
    const k = seen.get(b.party) ?? 0;
    seen.set(b.party, k + 1);
    return { party: b.party, side: b.side, vote: b.vote, hidden: b.hidden, k };
  }));
}

/** The seats each side holds. */
export function sideCount(blocs: Bloc[], side: Side): number {
  return blocs.filter((b) => b.side === side).reduce((a, b) => a + Math.round(b.seats), 0);
}

/** How far round from the left the majority line falls: just past the seat that makes a majority. */
export const majorityTurn = (total: number, need: number) => (total > 0 ? Math.min(1, need / total) : 0.5);
