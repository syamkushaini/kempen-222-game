import type { World } from '../election';
import { addScene } from './diplomacy';
import { pushNews } from './news';
import type { Campaign } from './types';

// A debt that is not paid down climbs a ladder. At the first rung the markets are nervous; at the second the country cannot borrow
// on its own terms and must choose how to be rescued; at the top it cannot pay at all, the government falls, and what is owed is
// restructured under terms that bind whoever comes next.

export const DEBT_LADDER = { alarm: 90, crisis: 105, bankrupt: 120 } as const;
/** Where a restructured debt starts again, and the most commitments it leaves. */
export const AFTER_BANKRUPT = 100;

/** The IMF's terms: spending lines cut, taxes raised, and every standing commitment and programme wiped. */
export function austerity(c: Campaign): void {
  const k = c.career!;
  const tight = { aid: -1, health: -1, education: -1, rural: -1, civil: -1 } as const;
  k.budget = { ...k.budget, lines: { ...tight }, tax: 1, measures: [] };
  k.tabled = { ...k.tabled, lines: { ...tight }, tax: 1, measures: [] };
  k.fiscal = 0;
  delete k.programmes;
  pushNews(c, { party: c.player, key: 'news.debt.austerity', tone: 'bad' });
}

/** The country cannot pay. What is owed is restructured, the treasury is empty, and the government is out. */
export function bankrupt(_world: World, c: Campaign): void {
  const k = c.career!;
  austerity(c);
  k.economy.debt = AFTER_BANKRUPT;
  k.treasury = 0;
  k.economy.growth -= 1;
  pushNews(c, { party: null, key: 'news.debt.bankrupt', tone: 'bad' });
}

/**
 * One week: puts each rung of the ladder to the head of the government once a parliament, and if the debt has reached the top, the
 * country is bankrupt. Returns whether the government has fallen. A government the player does not head is rescued, or falls, without them.
 */
export function debtWeek(world: World, c: Campaign): boolean {
  const k = c.career;
  if (!k || c.phase !== 'term') return false;
  const d = k.economy.debt;
  const done = (id: string) => k.flags.includes(`${id}${k.term}`);
  const mark = (id: string) => k.flags.push(`${id}${k.term}`);
  if (d >= DEBT_LADDER.bankrupt) { bankrupt(world, c); return true; }
  const mine = k.government.pm === c.player;
  const rung = (id: 'debtAlarm' | 'debtCrisis', news: string) => {
    mark(id);
    pushNews(c, { party: null, key: news, tone: 'bad' });
    if (mine) addScene(c, { kind: 'event', from: null, event: id });
    // Not the player's to decide: the head of government takes the rescue.
    else if (id === 'debtCrisis') { austerity(c); k.economy.debt -= 8; }
  };
  if (d >= DEBT_LADDER.crisis && !done('debtCrisis')) rung('debtCrisis', 'news.debt.crisis');
  else if (d >= DEBT_LADDER.alarm && d < DEBT_LADDER.crisis && !done('debtAlarm')) rung('debtAlarm', 'news.debt.alarm');
  return false;
}
