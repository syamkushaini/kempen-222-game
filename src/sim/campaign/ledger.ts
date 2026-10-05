import type { World } from '../election';
import { truth } from './actions';
import type { Campaign, NewsItem } from './types';

// A record of what the player decided in the campaign and what each decision
// was worth when taken: how many seats it moved in the projection of how the
// country would vote that day. The review after polling day reads it to show
// which choices mattered. Campaign effects fade, so this is the worth at the
// time, not at the count.

/** The most decisions kept; a campaign has far fewer. */
const MAX = 400;

export interface Standing { seats: number; share: number }

/** Where the player's party stands in the projection right now. */
export function standing(world: World, c: Campaign): Standing {
  const o = truth(world, c);
  const total = o.votes.reduce((a, b) => a + b, 0);
  return { seats: o.tally[c.player], share: total > 0 ? o.votes[c.player] / total : 0 };
}

/** Notes a decision just taken, against the standing from before it. Only the campaign itself is recorded. */
export function record(world: World, c: Campaign, before: Standing, item: NewsItem | null): void {
  if (!item || c.phase !== 'campaign') return;
  const now = standing(world, c);
  c.ledger.push({ news: item, seats: now.seats - before.seats, share: now.share - before.share });
  if (c.ledger.length > MAX) c.ledger.splice(0, c.ledger.length - MAX);
}
