import { clamp } from '../math';
import { Rng } from '../rng';
import type { BlocId } from '../types';
import { isFederal } from './defence';
import { isPm, lift, looseness } from './office';
import { pushNews } from './news';
import { sectorsOf } from './sectors';
import { STOCK_IDS, type Campaign, type Career, type Dial, type Markets, type StockId } from './types';

// The central bank, the ringgit and the stock market. The bank sets the policy rate on its own timetable, whoever governs; the head
// of government can hear what it is thinking a couple of weeks before it meets, but it does not always do what it hinted. The ringgit
// (against the US and Singapore dollars) and five sectors of the market follow the economy, the rate and the commodity cycle, and the
// voters who hold shares, work in those sectors or buy what they sell feel it. Every four to seven years a windfall or a black swan
// arrives. All of it invented, and none of it about any real institution.

export const BANK = { every: 8, hintWeeks: 2, surprise: 0.15, swan: [4, 7] as const };
export const STOCK_BLOCS: Record<StockId, BlocId[]> = {
  banks: ['m40', 'seniors'],
  plantation: ['agri', 'felda'],
  construction: ['gig', 'urban_b40'],
  ee: ['m40', 'undi18', 'smallbiz'],
  hotel: ['smallbiz', 'gig', 'borneo_urban'],
};
export const START_USD = 4.5;

export function startMarkets(week: number, rng: Rng): Markets {
  return {
    usd: START_USD, sgd: 3.4,
    index: { banks: 100, plantation: 100, construction: 100, ee: 100, hotel: 100 },
    commodity: 0,
    next: week + BANK.every,
    swan: week + 52 * Math.round(BANK.swan[0] + rng.next() * (BANK.swan[1] - BANK.swan[0])),
  };
}

export const marketsOf = (k: Career, rng: Rng = new Rng(k.week * 7919 + 1)): Markets => (k.markets ??= startMarkets(k.week, rng));

/** The central bank is the federation's: a state has no bank, and its head of government sets the rate as before. */
export const bankActs = (c: Campaign): boolean => isFederal(c.scenario);

/** What the bank would do: against high prices or a weak ringgit raise, against a slump cut, otherwise it drifts back to neutral. */
export function bankMind(c: Campaign, rng: Rng): Dial {
  const k = c.career!;
  const e = k.economy, m = k.markets;
  const weak = m ? m.usd - START_USD : 0;
  const hot = e.inflation + weak * 1.2;
  const cold = e.growth - weak * 0.5;
  let want: Dial = 0;
  if (hot > 4.3) want = 1;
  else if (cold < 2.2 || e.inflation < 1.5) want = -1;
  else if ((k.rate ?? 0) !== 0 && rng.next() < 0.5) want = 0;
  else want = (k.rate ?? 0) as Dial;
  return want;
}

const fromRate = (rate: Dial) => (rate > 0 ? 'up' : rate < 0 ? 'down' : 'hold');

/** A week of the central bank: a hint two weeks before it meets, then the meeting. */
export function bankWeek(c: Campaign, rng: Rng): void {
  const k = c.career!;
  if (!bankActs(c)) return;
  const m = marketsOf(k, rng);
  const g = k.government;
  if (k.week === m.next - BANK.hintWeeks) {
    m.hinted = bankMind(c, rng);
    if (isPm(c)) pushNews(c, { party: g.pm, key: `news.bank.hint.${fromRate(m.hinted)}`, vars: {}, tone: 'neutral' });
  }
  if (k.week < m.next) return;
  m.next = k.week + BANK.every;
  let rate = m.hinted ?? bankMind(c, rng);
  const surprised = rng.next() < BANK.surprise;
  if (surprised) rate = ([-1, 0, 1] as Dial[]).filter((d) => d !== rate)[Math.floor(rng.next() * 2)];
  const was = k.rate ?? 0;
  if (rate === 0) delete k.rate; else k.rate = rate;
  const hinted = m.hinted;
  delete m.hinted;
  pushNews(c, { party: g.pm, key: `news.bank.${fromRate(rate)}`, vars: {}, tone: 'neutral' });
  if (surprised && hinted !== undefined && isPm(c)) pushNews(c, { party: g.pm, key: 'news.bank.surprise', vars: {}, tone: 'bad' });
  // Dearer money bites borrowers and small firms and helps savers; cheaper money does the reverse.
  const d = rate - was;
  if (d !== 0) {
    lift(k, g.pm, ['smallbiz', 'gig', 'm40', 'urban_b40'], -0.012 * d);
    lift(k, g.pm, ['seniors'], 0.01 * d);
  }
}

/** A week of the markets: the ringgit and the sectors move, and the voters who feel them are moved. */
export function marketsWeek(c: Campaign, rng: Rng): void {
  const k = c.career!;
  if (!bankActs(c)) return;
  const m = marketsOf(k, rng);
  const e = k.economy;
  const rate = k.rate ?? 0;
  const g = k.government;

  m.commodity = clamp(m.commodity * 0.98 + rng.normal(0, 0.05), -2, 2);
  const target = START_USD + 0.1 * (e.inflation - 2.8) - 0.08 * (e.growth - 4) + 0.012 * (e.debt - 65) - 0.12 * rate - 0.2 * m.commodity;
  m.usd = clamp(m.usd + (target - m.usd) * 0.03 + rng.normal(0, 0.02), 3.8, 5.8);
  m.sgd = clamp(m.sgd + (m.usd * 0.755 - m.sgd) * 0.2 + rng.normal(0, 0.008), 2.9, 4.4);
  const weak = m.usd - START_USD;

  // The real sectors (see sectors.ts) carry their stocks: a hand lent to electronics, tourism or farming shows on the board.
  const real = sectorsOf(k);
  const goal: Record<StockId, number> = {
    banks: 100 + 6 * rate + 3 * (e.growth - 4) - 2 * Math.max(0, e.jobless - 5),
    plantation: 100 + 12 * weak + 14 * m.commodity + 0.5 * (real.farming - 50),
    construction: 100 + 2.5 * (e.growth - 4) + 2 * looseness(k) - 7 * rate,
    ee: 100 + 11 * weak + 2 * (e.growth - 4) + 0.5 * (real.electronics - 50),
    hotel: 100 + 3 * (e.growth - 4) + 8 * weak + 0.5 * (real.tourism - 50),
  };
  for (const s of STOCK_IDS) {
    m.index[s] = clamp(m.index[s] + (goal[s] - m.index[s]) * 0.04 + rng.normal(0, 0.9), 40, 180);
    const dev = clamp((m.index[s] - 100) / 100, -0.3, 0.3);
    lift(k, g.pm, STOCK_BLOCS[s], dev * 0.0035);
  }
  // A weak ringgit makes what is imported dearer and is felt at the till.
  e.inflation = clamp(e.inflation + weak * 0.004, -1, 12);
  lift(k, g.pm, 'all', -weak * 0.0006);
}

/** Every four to seven years the markets are hit by a windfall or a black swan; the head of government is asked what to do about it. */
export function swanWeek(c: Campaign, rng: Rng): void {
  const k = c.career!;
  if (!bankActs(c)) return;
  const m = marketsOf(k, rng);
  if (k.week < m.swan) return;
  m.swan = k.week + 52 * Math.round(BANK.swan[0] + rng.next() * (BANK.swan[1] - BANK.swan[0]));
  const windfall = rng.next() < 0.55;
  if (windfall) {
    m.commodity = clamp(m.commodity + 1.2, -2, 2);
    for (const s of STOCK_IDS) m.index[s] += s === 'plantation' ? 14 : 5;
    k.economy.growth = clamp(k.economy.growth + 0.6, -6, 9);
  } else {
    m.usd = clamp(m.usd + 0.5, 3.8, 5.8);
    for (const s of STOCK_IDS) m.index[s] *= 0.8;
    k.economy.growth = clamp(k.economy.growth - 1.4, -6, 9);
  }
  k.queue.push({ event: windfall ? 'marketWindfall' : 'blackSwan', week: k.week });
  // Whoever governs, the country reads about it.
  pushNews(c, { party: null, key: windfall ? 'news.market.windfall' : 'news.market.blackSwan', vars: {}, tone: windfall ? 'good' : 'bad' });
}
