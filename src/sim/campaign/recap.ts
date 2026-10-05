import { lastElection, type World } from '../election';
import { latestSeatIntel } from './polls';
import { managerDays } from './perks';
import type { Campaign, Recap } from './types';

// A short look back at the week just ended, shown at the start of the next.
// It uses only what the player could know: their own days and spending, where
// rival leaders appeared (a leader's visit is public), and the polls they paid for.

/** A seat counts as close when the player is within this share of the lead, or leads by less than it. */
const CLOSE = 0.1;

/** Seats that look close to the player: by their own poll where they have one, else by the last election. */
export function closeSeats(world: World, c: Campaign): Set<string> {
  const last = lastElection(world);
  const polled = latestSeatIntel(c.polls);
  const out = new Set<string>();
  last.seats.forEach((o) => {
    const intel = polled.get(o.seatId);
    const total = o.votes.reduce((a, b) => a + b, 0);
    const shares = intel ? intel.shares : o.votes.map((v) => (total > 0 ? v / total : 0));
    const mine = shares[c.player];
    const others = shares.filter((_, p) => p !== c.player);
    const best = Math.max(...others);
    // Leading narrowly, or trailing narrowly; a party with nothing in the seat is not in the fight.
    if (mine > 0.05 && Math.abs(mine - best) <= CLOSE) out.add(o.seatId);
  });
  return out;
}

/** What the week that is ending looked like. Call before the days and visits reset. */
export function makeRecap(world: World, c: Campaign): Recap {
  const me = c.parties[c.player]!;
  const total = me.capacity + managerDays(c, c.player);
  const close = closeSeats(world, c);
  const rivals: Recap['rivals'] = [];
  const missed: Recap['missed'] = [];
  c.parties.forEach((pc, p) => {
    if (!pc || p === c.player || pc.visits.length === 0) return;
    rivals.push({ party: p, seats: [...pc.visits] });
    for (const seat of pc.visits) if (close.has(seat) && !me.visits.includes(seat)) missed.push({ seat, party: p });
  });
  return {
    week: c.week, daysTotal: total, daysLeft: me.days, spent: me.spent - (c.recap?.spentToDate ?? 0), spentToDate: me.spent,
    mine: [...me.visits], rivals, missed,
  };
}
