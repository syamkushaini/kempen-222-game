import type { World } from '../election';
import { ACTIONS } from './actions';
import type { Campaign } from './types';

/** What the player is best told to do next. */
export type Step = 'decide' | 'endWeek' | 'toPolls' | 'final' | 'poll' | 'spend' | 'term';

/**
 * A short answer to "what do I do now?" for the screen that has the actions.
 * It looks only at the state of the game, in the order a person would: first
 * anyone waiting on an answer, then whether the week is spent, then the
 * things a first-timer tends to miss.
 */
export function nextStep(world: World, c: Campaign): Step | null {
  if (c.phase !== 'campaign' && c.phase !== 'term') return null;
  if (c.inbox.length > 0) return 'decide';
  if (c.phase === 'term') return 'term';

  const days = c.parties[c.player]!.days;
  const cheapest = Math.min(...world.rules.actions.map((a) => ACTIONS[a].days));
  const last = c.week >= c.totalWeeks;
  if (days < cheapest) return last ? 'toPolls' : 'endWeek';
  if (last && world.rules.actions.includes('gotv')) return 'final';
  if (c.week <= 2 && !c.polls.some((p) => !p.public)) return 'poll';
  return 'spend';
}
