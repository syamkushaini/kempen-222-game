import type { World } from '../election';

// How a party stands going into a by-election, read from the last result in the
// seat. Measured with the game's own autoplayer over the 36 three-way seats, a
// party that led last time wins about three times in four when it campaigns
// well; one within 3 points of the lead about half the time against gentle
// rivals; one 3 to 8 points behind about one time in five; and one further
// back never, and is squeezed to a median 24 points behind. So the player is
// told where they stand, and a party with no real chance of the seat is judged
// on its share of the vote and not on the win.

export type Outlook = 'favourite' | 'close' | 'uphill' | 'longShot';

/** Behind the leader by less than this share of the vote, a party is in a close fight; by less than the second, it is uphill. */
const CLOSE = 0.03, UPHILL = 0.08;
/** What an uphill campaign has to add to its last share for a good night. A long shot has only to hold its own. */
const UPHILL_GAIN = 0.02;

const shares = (votes: readonly number[]) => { const total = votes.reduce((a, b) => a + b, 0) || 1; return votes.map((v) => v / total); };

/** How far behind the leader a party finished, as a share of the vote. Nothing for the leader. */
export function gapBehind(votes: readonly number[], p: number): number {
  const s = shares(votes);
  return Math.max(...s) - (s[p] ?? 0);
}

export function outlookOf(votes: readonly number[], p: number): Outlook {
  const gap = gapBehind(votes, p);
  return gap <= 0 ? 'favourite' : gap < CLOSE ? 'close' : gap < UPHILL ? 'uphill' : 'longShot';
}

/** A party that led last time or was within reach of the lead: a contest it can fairly be asked to win. */
export const inContention = (votes: readonly number[], p: number) => gapBehind(votes, p) < CLOSE;

/** Where a party stands in a by-election. Nothing in any other contest, where no single seat decides the night. */
export function outlook(world: World, p: number): Outlook | null {
  return world.rules.kind === 'byelection' && world.seats.length === 1 ? outlookOf(world.seats[0].last.votes, p) : null;
}

/**
 * The share of the vote that makes a good night for a party not expected to win the seat. Nothing for a favourite or
 * a close fight: there the seat is the only measure.
 */
export function par(world: World, p: number): number | null {
  const o = outlook(world, p);
  if (o !== 'uphill' && o !== 'longShot') return null;
  const last = shares(world.seats[0].last.votes)[p] ?? 0;
  return o === 'uphill' ? last + UPHILL_GAIN : last;
}
