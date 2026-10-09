import type { Career } from './types';

// Some things a party does are marked with the week they were done in, so that they cannot be done again too soon, and each
// parliament counts its weeks from one. What is carried from one parliament into the next has to be moved back by the weeks that
// have gone by, or a drive held late in one term reads, early in the next, as one held two hundred weeks from now.

const moved = (marks: Record<string, number> | undefined, by: number): void => {
  for (const id of Object.keys(marks ?? {})) marks![id] -= by;
};

/** Moves the marks a career carries into a new parliament back by the weeks gone by since the last one began. */
export function carryStamps(k: Career, gone: number): void {
  moved(k.activity, gone);
  moved(k.sectorAid, gone);
  for (const e of k.echoes ?? []) e.week -= gone;
}

/** A mark later than this week cannot have been made in this parliament: it was carried over unmoved by an older save, and is dropped. */
export function dropStale(k: Career): void {
  for (const marks of [k.activity, k.sectorAid] as (Record<string, number> | undefined)[]) {
    for (const id of Object.keys(marks ?? {})) if (marks![id] > k.week) delete marks![id];
  }
}

/** The week a thing was last done in this reckoning, or undefined if it was not, or if the mark is a stale one. */
export const stampOf = (k: Career, marks: Record<string, number> | undefined, id: string): number | undefined => {
  const last = marks?.[id];
  return last !== undefined && last <= k.week ? last : undefined;
};
