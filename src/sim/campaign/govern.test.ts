import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { lastElection } from '../election';
import { Rng } from '../rng';
import { BLOC_IDS, PARTY_IDS } from '../types';
import { answerEvent, startCareer } from './career';
import { relation } from './diplomacy';
import {
  agenda, deficit, deliver, dueWeeks, economicMood, formCabinet, governWeek, looseness, makeObligations, MAX_BILLS, prepWeeks, reshuffle,
  resolveHouseVote, resolveVote, setBudget, standstill, tableBill, tableBudget, whipCount,
} from './govern';
import { DEMAND_IDS, PORTFOLIO_IDS, type Budget, type Campaign, type Scene } from './types';

const [PS, BP, PT, GBK, GBS] = PARTY_IDS.map((_, i) => i);
const base = getWorld('career')!;
const career = (player = PS, seed = 5): Campaign => startCareer(base, { player, difficulty: 'normal', seed });
const bloc = (id: (typeof BLOC_IDS)[number]) => BLOC_IDS.indexOf(id);
const seats = lastElection(base).tally;
const giveaway = (): Budget => ({ lines: { aid: 1, health: 1, education: 1, rural: 1, civil: 1 }, tax: -1 });
const austerity = (): Budget => ({ lines: { aid: -1, health: -1, education: -1, rural: -1, civil: -1 }, tax: 1 });
const vote = (bill: string): Scene => ({ id: 1, kind: 'vote', from: null, bill });
const event = (id: string): Scene => ({ id: 1, kind: 'event', from: null, event: id });
/** Runs the governing side of the term alone, so nothing lands on the desk by chance. */
const govern = (c: Campaign, weeks: number, seed = 1) => {
  const rng = new Rng(seed);
  for (let w = 0; w < weeks; w++) { governWeek(c, rng); c.career!.week++; }
};

describe('the economy', () => {
  it('holds steady on a standstill budget', () => {
    for (const seed of [1, 2, 3]) {
      const c = career(PS, seed);
      c.career!.obligations = [];
      govern(c, 250, seed);
      const e = c.career!.economy;
      expect(e.growth).toBeGreaterThan(2.5); expect(e.growth).toBeLessThan(5.5);
      expect(e.inflation).toBeGreaterThan(1.5); expect(e.inflation).toBeLessThan(4);
      expect(e.jobless).toBeGreaterThan(2.5); expect(e.jobless).toBeLessThan(5);
      expect(e.debt).toBeGreaterThan(55); expect(e.debt).toBeLessThan(72);
    }
  });

  it('pays for generosity later, in prices and debt', () => {
    const run = (plan: Budget) => {
      const c = career();
      c.career!.obligations = [];
      c.career!.tabled = plan;
      govern(c, 200);
      return c.career!.economy;
    };
    const loose = run(giveaway()), steady = run(standstill()), tight = run(austerity());
    expect(loose.debt).toBeGreaterThan(steady.debt + 8);
    expect(loose.inflation).toBeGreaterThan(steady.inflation + 1);
    expect(tight.debt).toBeLessThan(steady.debt - 8);
    expect(economicMood(loose)).toBeLessThan(economicMood(steady));
  });

  it('answers to the finance minister, a little', () => {
    const c = career();
    const k = c.career!;
    const finance = k.cabinet.find((m) => m.portfolio === 'finance')!;
    finance.skill = 5;
    const good = deficit(k, standstill());
    finance.skill = 1;
    expect(deficit(k, standstill())).toBeCloseTo(good + 0.8, 6);
    expect(looseness(k, giveaway())).toBe(7);
    expect(deficit(k, austerity())).toBeLessThan(deficit(k, standstill()));
  });
});

describe('the budget', () => {
  it('is the head of government’s to plan', () => {
    const c = career();
    expect(setBudget(c, { line: 'aid', value: 1 })).toBe(true);
    expect(setBudget(c, { tax: true, value: -1 })).toBe(true);
    expect(c.career!.budget).toEqual({ lines: { aid: 1, health: 0, education: 0, rural: 0, civil: 0 }, tax: -1 });
    expect(c.career!.tabled).toEqual(standstill()); // a plan until budget day
    expect(setBudget(c, { line: 'aid', value: 2 as never })).toBe(false);
    expect(setBudget(c, { line: 'roads' as never, value: 1 })).toBe(false);
    expect(setBudget(career(BP), { line: 'aid', value: 1 })).toBe(false);
  });

  it('lands with the blocs that notice each line, and with partners who watch their own', () => {
    const c = career();
    const k = c.career!;
    const civil = k.mood[bloc('civil')][PS], liberal = k.mood[bloc('urban_lib')][PS], withBp = relation(c, PS, BP), withGbk = relation(c, PS, GBK);
    tableBudget(c, { ...standstill(), lines: { ...standstill().lines, civil: 1, rural: -1 } });
    expect(k.mood[bloc('civil')][PS]).toBeCloseTo(civil + 0.02, 6);
    expect(k.mood[bloc('agri')][PS]).toBeLessThan(0);
    expect(k.mood[bloc('urban_lib')][PS]).toBe(liberal);
    expect(k.mood[bloc('civil')][BP]).toBeGreaterThan(0); // partners share the credit
    expect(relation(c, PS, BP)).toBe(withBp + 3);
    expect(relation(c, PS, GBK)).toBe(withGbk - 3);
    expect(c.news.at(-1)!.key).toBe('news.gov.budget.steady');
  });

  it('costs a spendthrift credibility and rewards restraint', () => {
    const loose = career(), tight = career();
    tableBudget(loose, giveaway());
    tableBudget(tight, austerity());
    expect(loose.career!.credibility).toBe(58);
    expect(loose.career!.government.stability).toBe(58);
    expect(loose.news.at(-1)!.key).toBe('news.gov.budget.loose');
    expect(tight.career!.credibility).toBe(63);
    expect(tight.news.at(-1)!.key).toBe('news.gov.budget.tight');
  });

  it('is tabled on budget day: the plan, or last year’s again', () => {
    const plan = career(), again = career();
    for (const c of [plan, again]) setBudget(c, { line: 'health', value: 1 });
    answerEvent(base, plan, event('budget'), 0);
    answerEvent(base, again, event('budget'), 1);
    expect(plan.career!.tabled.lines.health).toBe(1);
    expect(again.career!.tabled).toEqual(standstill());
    expect(plan.inbox).toHaveLength(0);
    // A shaky government has to get it past its own partners first.
    const shaky = career();
    shaky.career!.government.stability = 20;
    answerEvent(base, shaky, event('budget'), 0);
    expect(shaky.inbox[0]?.event).toBe('budgetRevolt');
  });

  it('is written by whoever leads the government, each to their habits, until the debt bites', () => {
    const c = career(PT);
    c.career!.week = 40;
    governWeek(c, new Rng(1));
    expect(c.career!.tabled.lines).toEqual({ ...standstill().lines, education: 1 });
    c.career!.economy.debt = 80;
    governWeek(c, new Rng(1));
    expect(c.career!.tabled).toEqual({ lines: standstill().lines, tax: 1 });
  });
});

describe('the cabinet', () => {
  it('fills every portfolio once, with partners given their share', () => {
    const c = career();
    const cabinet = c.career!.cabinet;
    expect(cabinet.map((m) => m.portfolio)).toEqual([...PORTFOLIO_IDS]);
    expect(new Set(cabinet.map((m) => m.name)).size).toBe(PORTFOLIO_IDS.length);
    expect(cabinet.every((m) => m.skill >= 1 && m.skill <= 5)).toBe(true);
    const held = (p: number) => cabinet.filter((m) => m.party === p).length;
    expect([held(PS), held(BP), held(GBK), held(GBS)]).toEqual([6, 1, 1, 0]);
    expect(cabinet.find((m) => m.portfolio === 'finance')!.party).toBe(PS);
    // A partner promised the treasury gets the treasury.
    c.career!.government.deals[BP]!.senior = 'finance';
    formCabinet(c, new Rng(3));
    expect(c.career!.cabinet.find((m) => m.portfolio === 'finance')!.party).toBe(BP);
  });

  it('can be reshuffled, at a price that depends on whose minister goes', () => {
    const c = career();
    const k = c.career!;
    const own = k.cabinet.find((m) => m.party === PS)!, theirs = k.cabinet.find((m) => m.party === BP)!;
    const unity = c.parties[PS]!.unity, stability = k.government.stability, withBp = relation(c, PS, BP);
    expect(reshuffle(c, own.portfolio)).toBe(true);
    expect(c.parties[PS]!.unity).toBe(unity - 2);
    expect(k.government.stability).toBe(stability);
    expect(reshuffle(c, theirs.portfolio)).toBe(true);
    expect(k.cabinet.find((m) => m.portfolio === theirs.portfolio)!.party).toBe(PS);
    expect(k.government.stability).toBe(stability - 4);
    expect(relation(c, PS, BP)).toBe(withBp - 8);
    expect(k.cabinet.map((m) => m.portfolio)).toEqual([...PORTFOLIO_IDS]);
    expect(new Set(k.cabinet.map((m) => m.name)).size).toBe(PORTFOLIO_IDS.length);
    expect(c.news.at(-1)!.key).toBe('news.gov.reshuffle');
    expect(reshuffle(career(BP), 'finance')).toBe(false);
  });
});

describe('bills', () => {
  it('are drawn from the manifesto and from what partners were promised', () => {
    const c = career();
    expect(agenda(c)).toEqual([
      'pledge:graftCommission', 'pledge:termLimit', 'pledge:transitPass', 'pledge:minWage', 'pledge:homes', 'demand:autonomy',
    ]);
    expect(tableBill(c, 'pledge:cashAid')).toBe(false); // never promised
    expect(tableBill(c, 'pledge:homes')).toBe(true);
    expect(tableBill(c, 'pledge:homes')).toBe(false); // already drafting
    expect(tableBill(c, 'pledge:minWage')).toBe(true);
    expect(c.career!.bills).toHaveLength(MAX_BILLS);
    expect(tableBill(c, 'pledge:termLimit')).toBe(false); // the House has only so much time
    expect(agenda(c)).not.toContain('pledge:homes');
    expect(tableBill(career(PT), 'pledge:fuelSubsidy')).toBe(false);
  });

  it('reach the floor sooner under a capable minister', () => {
    const c = career();
    const k = c.career!;
    const works = k.cabinet.find((m) => m.portfolio === 'works')!;
    works.skill = 5;
    expect(prepWeeks(k, 'pledge:homes')).toBe(4);
    works.skill = 1;
    expect(prepWeeks(k, 'pledge:homes')).toBe(8);
    tableBill(c, 'pledge:homes');
    govern(c, 7);
    expect(c.inbox).toHaveLength(0);
    govern(c, 1);
    expect(c.inbox).toHaveLength(1);
    expect(c.inbox[0]).toMatchObject({ kind: 'vote', bill: 'pledge:homes' });
    govern(c, 3);
    expect(c.inbox).toHaveLength(1); // asked once
  });

  it('are counted before the vote, every member accounted for', () => {
    const c = career();
    const total = seats.reduce((a, n) => a + n, 0);
    for (const id of agenda(c)) {
      const plain = whipCount(base, c, id, PS);
      expect(plain.yes + plain.no + plain.wavering, id).toBe(total);
      expect(plain.votes[PS]).toBe('yes');
      expect(whipCount(base, c, id, PS, { sweetened: true }).yes, id).toBeGreaterThanOrEqual(plain.yes);
      expect(whipCount(base, c, id, PS, { confidence: true }).yes, id).toBeGreaterThanOrEqual(plain.yes);
      const without = whipCount(base, c, id, PS, { forced: { [PT]: 'abstain' } });
      expect(without.yes + without.no + without.wavering, id).toBe(total - seats[PT]);
    }
    // Partners who would not vote for a reform fall into line when the government's life depends on it.
    expect(whipCount(base, c, 'pledge:graftCommission', PS).votes[BP]).not.toBe('yes');
    expect(whipCount(base, c, 'pledge:graftCommission', PS, { confidence: true }).votes[BP]).toBe('yes');
  });

  it('keep a promise when they pass', () => {
    const c = career();
    const k = c.career!;
    tableBill(c, 'pledge:homes');
    const liked = k.mood[bloc('urban_b40')][PS];
    resolveVote(base, c, vote('pledge:homes'), 0);
    expect(k.delivery).toEqual({ homes: 'kept' });
    expect(k.record.kept).toEqual(['homes']);
    expect(k.credibility).toBe(63);
    expect(k.fiscal).toBe(1.5);
    expect(k.mood[bloc('urban_b40')][PS]).toBeCloseTo(liked + 0.035, 6);
    expect(k.bills).toHaveLength(0);
    expect(agenda(c)).not.toContain('pledge:homes');
    expect(c.news.at(-1)!.key).toBe('news.gov.passed');
  });

  it('break one when they fall, and shake the government', () => {
    const c = career();
    const k = c.career!;
    resolveVote(base, c, vote('pledge:graftCommission'), 0);
    expect(k.delivery).toEqual({ graftCommission: 'failed' });
    expect(k.credibility).toBe(58);
    expect(k.government.stability).toBe(55);
    expect(k.fiscal).toBe(0);
    expect(c.phase).toBe('term');
    expect(c.news.at(-1)).toMatchObject({ key: 'news.gov.defeated', tone: 'bad' });
  });

  it('can be sweetened, staked on the government’s life, or quietly withdrawn', () => {
    const sweet = career();
    resolveVote(base, sweet, vote('pledge:graftCommission'), 1);
    expect(sweet.career!.fiscal).toBeGreaterThanOrEqual(0.5);

    const staked = career();
    resolveVote(base, staked, vote('pledge:graftCommission'), 2);
    expect(staked.career!.delivery).toEqual({ graftCommission: 'kept' });

    // A government with no partners that stakes its life on a bill it cannot carry loses both.
    const alone = career();
    alone.career!.government.partners = [];
    resolveVote(base, alone, vote('pledge:graftCommission'), 2);
    expect(alone.phase).toBe('formation');
    expect(alone.career!.midterm).toBe(true);
    expect(alone.career!.record.falls).toBe(1);

    const dropped = career();
    tableBill(dropped, 'pledge:termLimit');
    resolveVote(base, dropped, vote('pledge:termLimit'), 3);
    expect(dropped.career!.credibility).toBe(58);
    expect(dropped.career!.delivery).toEqual({});
    expect(dropped.career!.bills).toHaveLength(0);
    expect(agenda(dropped)).toContain('pledge:termLimit'); // it can come back
  });

  it('come from rival governments too, and the player must say where they stand', () => {
    const c = career(PT);
    c.career!.week = 20;
    governWeek(c, new Rng(1));
    expect(c.inbox[0]).toMatchObject({ kind: 'houseVote', from: PS, bill: 'pledge:graftCommission' });
    c.inbox = [];
    c.career!.week = 60;
    governWeek(c, new Rng(1));
    expect(c.inbox[0]).toMatchObject({ kind: 'houseVote', bill: 'pledge:termLimit' });
    expect(c.career!.rivalBills).toBe(2);

    const house = (player: number, choice: number) => {
      const s = career(player);
      const before = { rel: relation(s, player, PS), gig: s.career!.mood[bloc('gig')][player], stab: s.career!.government.stability };
      resolveHouseVote(base, s, { id: 1, kind: 'houseVote', from: PS, bill: 'pledge:minWage' }, choice);
      const k = s.career!;
      return { rel: relation(s, player, PS) - before.rel, gig: k.mood[bloc('gig')][player] - before.gig, stab: k.government.stability - before.stab, key: s.news.at(-1)!.key };
    };
    const yes = house(PT, 0), no = house(PT, 1), sat = house(PT, 2), rebel = house(BP, 1);
    expect(yes.rel).toBe(5);
    expect(yes.gig).toBeCloseTo(0.024, 6);
    expect(no.rel).toBe(-5);
    expect(no.gig).toBeCloseTo(-0.024, 6);
    expect(sat).toMatchObject({ rel: 0, gig: 0 });
    expect(rebel.rel).toBe(-15);
    expect(rebel.stab).toBeLessThanOrEqual(-6);
    expect(['news.house.passed', 'news.house.defeated']).toContain(yes.key);
  });
});

describe('promises to partners', () => {
  it('fall due one after another once the government is formed', () => {
    const c = career();
    expect(c.career!.obligations).toEqual([
      { party: BP, demand: 'subsidies', due: 53, done: false },
      { party: GBK, demand: 'autonomy', due: 79, done: false },
      { party: GBS, demand: 'autonomy', due: 105, done: false },
    ]);
    const partner = career(BP);
    makeObligations(partner);
    expect(partner.career!.obligations).toEqual([]);
  });

  it('all fall due within the term, however many were made and however late', () => {
    expect(dueWeeks(1, 252, 3)).toEqual([53, 79, 105]);
    const many = dueWeeks(1, 252, 28);
    expect(many[0]).toBe(53);
    expect(many.at(-1)).toBe(252);
    many.forEach((due, i) => { if (i > 0) expect(due - many[i - 1]).toBeGreaterThanOrEqual(7); });
    // A government formed late in the term has what is left of it.
    const late = dueWeeks(230, 252, 3);
    expect(late).toEqual([241, 247, 252]);
    expect(dueWeeks(252, 252, 2)).toEqual([252, 252]);

    // A leader who gave every partner everything.
    const c = career();
    const k = c.career!;
    const everything = DEMAND_IDS.filter((d) => d !== 'localPosts');
    for (const p of k.government.partners) k.government.deals[p]!.demands = [...everything];
    makeObligations(c);
    expect(k.obligations).toHaveLength(k.government.partners.length * everything.length);
    expect(k.obligations.length).toBeGreaterThan(28);
    expect(k.obligations[0].due).toBe(53);
    expect(Math.max(...k.obligations.map((o) => o.due))).toBeLessThanOrEqual(k.length);
    k.week = 200;
    makeObligations(c);
    expect(k.obligations.every((o) => o.due > 200 && o.due <= k.length)).toBe(true);
  });

  it('are kept with a signature or a bill', () => {
    const c = career();
    const k = c.career!;
    const withBp = relation(c, PS, BP), withGbk = relation(c, PS, GBK);
    expect(deliver(c, 0)).toBe(true);
    expect(k.obligations[0].done).toBe(true);
    expect(k.fiscal).toBe(1);
    expect(relation(c, PS, BP)).toBe(withBp + 8);
    expect(k.government.stability).toBe(63);
    expect(deliver(c, 0)).toBe(false); // done already

    expect(deliver(c, 1)).toBe(true);
    expect(k.bills.map((b) => b.id)).toEqual(['demand:autonomy']);
    expect(k.obligations[1].done).toBe(false); // not until the House has voted
    expect(deliver(c, 2)).toBe(false); // the same bill covers both
    resolveVote(base, c, vote('demand:autonomy'), 2);
    expect(k.obligations.every((o) => o.done)).toBe(true);
    expect(relation(c, PS, GBK)).toBe(withGbk + 8);
    expect(deliver(career(BP), 0)).toBe(false);
  });

  it('can cost the leader their own programme', () => {
    const c = career();
    const k = c.career!;
    k.obligations = [{ party: BP, demand: 'reformPause', due: 60, done: false }];
    expect(deliver(c, 0)).toBe(true);
    expect(k.delivery).toEqual({ graftCommission: 'failed', termLimit: 'failed' });
    expect(k.credibility).toBe(57.5);
    expect(k.mood[bloc('urban_lib')][PS]).toBeLessThan(0);
  });

  it('sour the partnership when they are left to slide', () => {
    const c = career();
    const k = c.career!;
    const withBp = relation(c, PS, BP);
    govern(c, 52);
    expect(relation(c, PS, BP)).toBe(withBp);
    govern(c, 2);
    expect(relation(c, PS, BP)).toBe(withBp - 12);
    expect(k.obligations[0].due).toBe(105);
    expect(c.news.some((n) => n.key === 'news.gov.overdue')).toBe(true);
    expect(k.government.stability).toBeLessThan(60);
  });
});

