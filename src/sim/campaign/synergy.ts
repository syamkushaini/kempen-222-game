import type { SeatKind } from '../types';
import type { ActionId } from './types';

// A generic resolver for action combos: a compact table of rules, not a chain of ifs. An
// action gets the best multiplier its rule set earns it from what was recently done in the
// same seat (e.g. a policy paper lands harder once a townhall has already been held there,
// and harder still in an urban seat).

export interface ComboRule {
  /** The two actions that combo together, in either order. */
  pair: readonly [ActionId, ActionId];
  mult: number;
  /** Seat kinds the bonus applies in; any kind if absent. */
  kinds?: readonly SeatKind[];
}

export const COMBOS: ComboRule[] = [
  { pair: ['townhall', 'ceramah'], mult: 1.5, kinds: ['urban'] },
  { pair: ['townhall', 'walkabout'], mult: 1.3, kinds: ['urban', 'semi'] },
  { pair: ['social', 'canvass'], mult: 1.25 },
  { pair: ['ceramah', 'walkabout'], mult: 1.15 },
];

/** How many of a seat's most recent actions are kept to look for a combo. */
export const RECENT_CAP = 6;

/** Records that an action was just taken in a seat, keeping only the most recent ones. */
export function noteRecent(recent: Record<string, ActionId[]>, seatId: string, id: ActionId): void {
  const arr = (recent[seatId] ??= []);
  arr.push(id);
  if (arr.length > RECENT_CAP) arr.shift();
}

/** The best combo multiplier an action earns from what was recently done in this seat (1 if none applies). */
export function synergyFor(recent: Record<string, ActionId[]> | undefined, seatId: string, id: ActionId, kind: SeatKind): number {
  const arr = recent?.[seatId];
  if (!arr?.length) return 1;
  let best = 1;
  for (const rule of COMBOS) {
    const other = rule.pair[0] === id ? rule.pair[1] : rule.pair[1] === id ? rule.pair[0] : null;
    if (other && arr.includes(other) && (!rule.kinds || rule.kinds.includes(kind))) best = Math.max(best, rule.mult);
  }
  return best;
}
