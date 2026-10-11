import type { World } from '../election';
import { ROLE_IDS, type Campaign } from './types';
import { canFollow } from './advice';
import { termIncome, termSpending } from './career';
import { canChoose, candidateDeadline } from './candidates';
import { OFFER_WARN } from './missions';
import { isPm } from './office';
import { hasPublicMoney, treasuryCap, treasuryOf, govBooks } from './treasury';

// Things the player may have missed. The game has a great many places to look; this is the short list of what is worth looking at now,
// worked out from the state of the game and nothing else, so that the player is told and does not have to go and find out.

export interface Reminder {
  id: string;
  /** `urgent` will cost something soon; `warn` is going wrong; `note` is an opportunity or a nudge. */
  level: 'urgent' | 'warn' | 'note';
  /** The tab that deals with it. */
  tab: string;
  vars?: Record<string, number>;
}

const RANK = { urgent: 0, warn: 1, note: 2 } as const;
/** Weeks before budget day (week 40 of a year) when the head of government is reminded of the plan. */
export const BUDGET_DAY = 40;
export const BUDGET_NOTICE = 8;

export function remindersOf(world: World, c: Campaign): Reminder[] {
  const k = c.career;
  if (!k || k.ending) return [];
  const out: Reminder[] = [];
  const add = (r: Reminder) => out.push(r);

  if (c.phase === 'campaign') {
    // The candidates that were never chosen are chosen for the party by its chiefs, and the leader does not get to say who.
    const undecided = c.team.keySeats.filter((s) => s.pick === null).length;
    if (canChoose(c) && undecided > 0) {
      const weeks = candidateDeadline(c) - c.week + 1;
      add({ id: 'candidates', level: weeks <= 2 ? 'urgent' : 'warn', tab: 'slate', vars: { n: undecided, weeks } });
    }
    return out.sort((a, b) => RANK[a.level] - RANK[b.level]);
  }
  if (c.phase !== 'term') return [];

  const week = k.week;
  const weekOfYear = ((week - 1) % 52) + 1;
  const left = k.length - week;
  const me = c.parties[c.player]!;

  if ((k.appointments?.length ?? 0) > 0) add({ id: 'appoint', level: 'urgent', tab: 'house', vars: { n: k.appointments!.length } });

  if (isPm(c) && weekOfYear >= BUDGET_DAY - BUDGET_NOTICE && weekOfYear < BUDGET_DAY && JSON.stringify(k.budget) === JSON.stringify(k.tabled)) {
    add({ id: 'budget', level: 'warn', tab: 'house', vars: { weeks: BUDGET_DAY - weekOfYear } });
  }
  if (!k.launched && left <= 60) add({ id: 'manifesto', level: left <= 20 ? 'urgent' : 'warn', tab: 'policy', vars: { weeks: left } });

  const closing = (k.missions?.offers ?? []).filter((o) => o.ttl !== undefined && o.ttl <= OFFER_WARN * 2);
  if (closing.length > 0) add({ id: 'mission', level: 'note', tab: 'missions', vars: { n: closing.length, weeks: Math.min(...closing.map((o) => o.ttl!)) } });

  const net = termIncome(world, c).total - termSpending(world, c).total;
  if (net < 0 && me.funds / -net < 8) add({ id: 'funds', level: 'warn', tab: 'orders', vars: { weeks: Math.max(0, Math.floor(me.funds / -net)) } });

  if (!c.team.staff[ROLE_IDS.indexOf('manager')] && week >= 4 && week <= 104) add({ id: 'team', level: 'note', tab: 'team' });
  if (ROLE_IDS.some((r) => canFollow(world, c, r).ok)) add({ id: 'advice', level: 'note', tab: 'team' });

  if (k.conduct && k.conduct.ok.filter(Boolean).length <= 2) add({ id: 'conduct', level: 'warn', tab: 'party', vars: { n: k.conduct.ok.filter(Boolean).length } });

  if (k.economy.debt >= 80) add({ id: 'debt', level: k.economy.debt >= 95 ? 'urgent' : 'warn', tab: 'house', vars: { debt: Math.round(k.economy.debt) } });

  if (isPm(c)) {
    const books = govBooks(world, c);
    const held = treasuryOf(c);
    if (books && books.net < 0 && held < -books.net * 4) add({ id: 'dry', level: 'warn', tab: 'house' });
    else if (hasPublicMoney(c) && treasuryCap(world, c) > 0 && held >= 0.95 * treasuryCap(world, c)) add({ id: 'full', level: 'note', tab: 'house' });
  }
  return out.sort((a, b) => RANK[a.level] - RANK[b.level]);
}
