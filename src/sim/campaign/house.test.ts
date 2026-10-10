import { describe, expect, it } from 'vitest';
import { getWorld, worldOf } from '../../data/world';
import { lastElection, majorityLine } from '../election';
import { Rng } from '../rng';
import { BLOC_IDS, N_BLOCS, PARTY_IDS } from '../types';
import { answerEvent, dissolve, EARLIEST_DISSOLUTION, nextTerm, startCareer, syncOpinion, termWeek } from './career';
import { TEMPER } from './cast';
import { relation } from './diplomacy';
import { endDay } from './formation';
import {
  agenda, canMotion, canPull, confidenceCount, deliver, faceMotion, governWeek, leaveGovernment, pullLever, reckon, tableBill,
  tableMotion,
} from './govern';
import { legacyOf, retire } from './legacy';
import { closeNight, endWeek } from './turn';
import { ISSUE_IDS, LEGACY_IDS, type Campaign, type CareerRecord, type Scene } from './types';
import { isValidCampaign } from './validate';

const [PS, BP, PT] = PARTY_IDS.map((_, i) => i);
const base = getWorld('career')!;
const career = (player = PS, seed = 5): Campaign => startCareer(base, { player, difficulty: 'normal', seed });
const bloc = (id: (typeof BLOC_IDS)[number]) => BLOC_IDS.indexOf(id);
const seats = lastElection(base).tally;
const event = (id: string): Scene => ({ id: 1, kind: 'event', from: null, event: id });
/** Runs the governing side of the term alone, so nothing lands on the desk by chance. */
const govern = (c: Campaign, weeks: number, seed = 1) => {
  const rng = new Rng(seed);
  for (let w = 0; w < weeks; w++) { governWeek(c, rng); c.career!.week++; }
};
/** Turns every partner against the head of government. */
const sour = (c: Campaign) => {
  const g = c.career!.government;
  g.stability = 10;
  for (const p of g.partners) c.relations[g.pm][p] = c.relations[p][g.pm] = -90;
};

describe('leaning on institutions', () => {
  it('is for the head of government alone, and not while something is waiting', () => {
    expect(canPull(career(PS), 'agency')).toBe(true);
    expect(canPull(career(BP), 'agency')).toBe(false);
    expect(pullLever(base, career(PT), 'police')).toBe(false);
    const busy = career();
    busy.inbox.push(event('budget'));
    expect(canPull(busy, 'agency')).toBe(false);
  });

  it('works, costs trust, and cannot be done twice in a year', () => {
    const c = career();
    const k = c.career!;
    k.week = 10;
    const eye = k.profile[PS];
    expect(pullLever(base, c, 'broadcaster')).toBe(true);
    expect(k.government.trust).toBe(57);
    expect(k.credibility).toBe(58);
    expect(k.profile[PS]).toBeCloseTo(eye + 0.04, 6);
    expect(canPull(c, 'broadcaster')).toBe(false);
    expect(canPull(c, 'police')).toBe(true);
    k.week = 62;
    expect(canPull(c, 'broadcaster')).toBe(true);

    const liberties = ISSUE_IDS.indexOf('liberties');
    expect(pullLever(base, c, 'police')).toBe(true);
    expect(k.government.trust).toBe(53);
    expect(k.salience[liberties]).toBeCloseTo(1.4, 6);
    expect(k.mood[bloc('undi18')][PS]).toBeLessThan(0);
  });

  it('can make a martyr of the opposition', () => {
    const keys = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
      const c = career(PS, seed);
      const withPt = relation(c, PS, PT);
      pullLever(base, c, 'agency');
      expect(relation(c, PS, PT)).toBe(Math.max(-100, withPt + Math.round(-25 * TEMPER.pt.grudge))); // a proud man takes it harder
      expect(c.career!.government.trust).toBe(54);
      keys.add(c.news.at(-1)!.key);
    }
    expect([...keys].sort()).toEqual(['news.gov.lever.agency', 'news.gov.lever.agency.backfire']);
  });
});

describe('confidence', () => {
  it('rests on partners who get on with the leader and think the government will last', () => {
    const c = career();
    expect(confidenceCount(base, c)).toBeGreaterThanOrEqual(majorityLine(base));
    sour(c);
    expect(confidenceCount(base, c)).toBe(seats[PS] + Math.floor(seats[PARTY_IDS.indexOf('oth')] / 2));
  });

  it('can be tested by the opposition, once the House has sat a while and once a year', () => {
    const c = career(PT);
    const k = c.career!;
    expect(canMotion(c)).toBe(false);
    expect(canMotion(career(BP))).toBe(false);
    k.week = 26;
    expect(canMotion(c)).toBe(true);
    const withPs = relation(c, PT, PS);
    expect(tableMotion(base, c)).toBe(true);
    expect(c.phase).toBe('term'); // a solid government sees it off
    expect(k.credibility).toBe(57);
    expect(k.government.stability).toBe(65);
    expect(relation(c, PT, PS)).toBe(withPs - 10);
    expect(tableMotion(base, c)).toBe(false);
    k.week = 78;
    sour(c);
    expect(tableMotion(base, c)).toBe(true);
    expect(c.phase).toBe('formation');
    expect(k.record.toppled).toBe(1);
    expect(k.midterm).toBe(true);
  });

  it('can be bought, for a while', () => {
    const firm = career();
    faceMotion(base, firm, 1);
    expect(firm.career!.fiscal).toBe(1);
    expect(firm.career!.government.stability).toBe(74);
    expect(firm.news.at(-1)!.key).toBe('news.motion.survived');

    const doomed = career();
    sour(doomed);
    answerEvent(base, doomed, event('motion'), 0);
    expect(doomed.phase).toBe('formation');
    expect(doomed.career!.record.falls).toBe(1);
    expect(doomed.news.some((n) => n.key === 'news.motion.lost')).toBe(true);
  });

  it('is withdrawn by a partner who walks out', () => {
    const c = career(BP);
    c.career!.orders.state = 2;
    const withPs = relation(c, BP, PS);
    expect(leaveGovernment(base, c)).toBe(true);
    const g = c.career!.government;
    expect(g.partners).not.toContain(BP);
    expect(g.seats).toBe(143 - seats[BP]);
    expect(c.phase).toBe('term'); // the government has just enough without them
    expect(g.stability).toBe(55);
    expect(c.career!.orders.state).toBe(0);
    expect(c.career!.cabinet.some((m) => m.party === BP)).toBe(false); // its ministers go with it
    expect(c.career!.cabinet).toHaveLength(8);
    expect(relation(c, BP, PS)).toBe(Math.max(-100, withPs - 30));
    expect(leaveGovernment(base, c)).toBe(false);

    const vital = career(BP);
    vital.career!.government.partners = [BP];
    vital.career!.government.seats = seats[PS] + seats[BP];
    expect(leaveGovernment(base, vital)).toBe(true);
    expect(vital.phase).toBe('formation');
    expect(vital.career!.record.toppled).toBe(1);
    expect(leaveGovernment(base, career(PT))).toBe(false);
  });
});

describe('the reckoning', () => {
  it('holds a head of government to the last manifesto', () => {
    const c = career();
    const k = c.career!;
    k.delivery = { transitPass: 'kept', minWage: 'failed' };
    const young = k.mood[bloc('undi18')][PS];
    reckon(c);
    expect(k.credibility).toBe(60 - 3 * 3 - 1); // three never brought to a vote, one lost
    expect(k.record.kept).toEqual([]); // kept promises went on the record when their bills passed
    expect(k.record.broken).toBe(3);
    expect(k.mood[bloc('undi18')][PS]).toBeLessThan(young);
    expect(c.news.at(-1)).toMatchObject({ key: 'news.gov.reckoning', tone: 'bad' });
  });

  it('lets those who never governed off', () => {
    const c = career(PT);
    reckon(c);
    expect(c.career!.credibility).toBe(60);
    expect(c.career!.record.broken).toBe(0);
  });

  it('comes at the dissolution, and the slate is wiped for the next manifesto', () => {
    const c = career();
    const k = c.career!;
    k.week = EARLIEST_DISSOLUTION;
    k.delivery = { homes: 'kept', transitPass: 'kept', minWage: 'kept', termLimit: 'kept', graftCommission: 'kept' };
    expect(dissolve(base, c)).toBe(true);
    expect(k.record.broken).toBe(0);
    expect(k.delivery).toEqual({});
    expect(k.bills).toEqual([]);
    expect(c.news.some((n) => n.key === 'news.gov.reckoning' && n.tone === 'good')).toBe(true);
  });
});

describe('the record and the ending', () => {
  it('counts the weeks on each side of the House', () => {
    const count = (player: number) => { const c = career(player); c.career!.obligations = []; govern(c, 10); return c.career!.record; };
    expect(count(PS)).toMatchObject({ weeksPm: 10, weeksGov: 0, weeksOpp: 0 });
    expect(count(BP)).toMatchObject({ weeksPm: 0, weeksGov: 10, weeksOpp: 0 });
    expect(count(PT)).toMatchObject({ weeksPm: 0, weeksGov: 0, weeksOpp: 10 });
  });

  it('names every kind of career', () => {
    const blank: CareerRecord = { elections: 0, victories: 0, weeksPm: 0, weeksGov: 0, weeksOpp: 0, kept: [], broken: 0, bestSeats: 0, falls: 0, toppled: 0 };
    const judge = (record: Partial<CareerRecord>, credibility = 50) => {
      const c = career();
      c.career!.record = { ...blank, ...record };
      c.career!.credibility = credibility;
      return legacyOf(c);
    };
    const seen = [
      judge({ weeksPm: 520, kept: ['homes', 'minWage', 'transitPass', 'hospitals'], broken: 1, victories: 2 }, 70),
      judge({ weeksPm: 200, kept: ['graftCommission', 'termLimit'] }),
      judge({ weeksPm: 200, kept: ['homes'], broken: 4 }),
      judge({ weeksPm: 50, toppled: 2 }),
      judge({ weeksPm: 420, kept: ['homes'], broken: 1 }),
      judge({ weeksPm: 120 }),
      judge({ weeksGov: 300 }),
      judge({ weeksOpp: 500 }, 80),
      judge({ weeksOpp: 500, bestSeats: 90 }),
      judge({ weeksOpp: 500, bestSeats: 20 }),
    ];
    expect(seen.map((s) => s.legacy)).toEqual([
      'statesman', 'reformer', 'promiser', 'plotter', 'survivor', 'premier', 'kingmaker', 'conscience', 'nearly', 'footnote',
    ]);
    expect(seen.map((s) => s.legacy).sort()).toEqual([...LEGACY_IDS].sort());
    for (const s of seen) { expect(s.score).toBeGreaterThanOrEqual(0); expect(s.score).toBeLessThanOrEqual(100); }
    expect(seen[0].score).toBeGreaterThan(seen[5].score);
    expect(seen[5].score).toBeGreaterThan(seen[9].score);
  });

  it('ends when the leader chooses to go', () => {
    const c = career();
    c.inbox.push(event('budget'));
    expect(retire(c)).toBe(true);
    expect(c.career!.ending).toMatchObject({ kind: 'retired', legacy: 'footnote' });
    expect(c.inbox).toEqual([]);
    const week = c.career!.week;
    termWeek(base, c);
    expect(c.career!.week).toBe(week); // nothing more happens
    expect(retire(c)).toBe(false);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('ends when the party will not be led any longer', () => {
    const c = career();
    c.parties[PS]!.unity = 11;
    answerEvent(base, c, event('budget'), 1);
    expect(c.career!.ending?.kind).toBe('ousted');
    const slow = career();
    slow.parties[PS]!.unity = 5;
    termWeek(base, slow);
    expect(slow.career!.ending?.kind).toBe('ousted');
  });

  it('carries on when there is no seat left, and the leader may still retire', () => {
    const c = career(PT);
    c.career!.week = c.career!.length;
    termWeek(base, c);
    expect(c.phase).toBe('campaign');
    // The voters desert the party entirely.
    for (let b = 0; b < N_BLOCS; b++) c.career!.mood[b][PT] = -30;
    syncOpinion(c);
    while (c.phase === 'campaign') endWeek(base, c);
    closeNight(base, c);
    for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(base, c);
    expect(nextTerm(base, c)).toBe(true);
    expect(c.career!.record.elections).toBe(1);
    expect(c.career!.record.terms).toHaveLength(1);
    expect(c.career!.ending ?? null).toBeNull();
    expect(c.career!.record.terms![0].seats).toBe(0);
    expect(c.news.some((n) => n.key === 'news.wiped')).toBe(true);
    expect(c.phase).toBe('term');
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), worldOf(c)!)).toBe(true);
    // The term runs, and the party can face the next election with no seat to its name.
    for (let guard = 0; guard < 400 && c.phase === 'term' && !c.career!.ending; guard++) {
      if (c.inbox.length) { answerEvent(worldOf(c)!, c, c.inbox.shift()!, 0); continue; }
      termWeek(worldOf(c)!, c);
    }
    expect(c.career!.ending ?? null).toBeNull();
    expect(c.phase).toBe('campaign');
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), worldOf(c)!)).toBe(true);
    c.phase = 'term';
    expect(retire(c)).toBe(true);
    expect(c.career!.ending?.kind).toBe('retired');
  });
});

describe('a term in office', () => {
  it('can be played through with every promise put to the House, and saved at any point', () => {
    const c = career();
    for (let guard = 0; guard < 4000 && c.phase === 'term' && !c.career!.ending; guard++) {
      if (c.inbox.length) { answerEvent(base, c, c.inbox.shift()!, 0); continue; }
      const next = agenda(c)[0];
      if (next) tableBill(c, next);
      c.career!.obligations.forEach((o, i) => { if (!o.done) deliver(c, i); });
      termWeek(base, c);
      if (guard % 50 === 0) expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
    }
    const r = c.career!.record;
    expect(r.weeksPm + r.weeksGov + r.weeksOpp).toBeGreaterThan(150);
    if (c.phase === 'campaign') expect(r.kept.length + r.broken).toBeGreaterThan(0);
  });
});
