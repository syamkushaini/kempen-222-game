import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { nextTerm, startCareer, termWeek, TERM_WEEKS } from './career';
import { endDay } from './formation';
import { closeNight, endWeek } from './turn';
import { courtChief, sendChief, chiefsTermWeek, TERM_CHIEFS } from './chiefsTerm';
import { chiefOf } from './chiefs';
import { crisisWeek, CRISIS } from './crisis';
import { EVENTS } from './events';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { bankMind, bankWeek, marketsOf, marketsWeek, swanWeek, BANK } from './markets';
import { MOVE_IDS, makeMove, moveRefusal } from './moves';
import { NET, netizenWeek } from './netizens';
import { PLEDGES } from './policy';
import { PLEDGE_IDS, STOCK_IDS, type Campaign } from './types';

const [PS] = PARTY_IDS.map((_, i) => i);
const world = getWorld('career')!;
const career = (seed = 5): Campaign => startCareer(world, { player: PS, difficulty: 'normal', seed });

describe('the central bank and the markets', () => {
  it('meets on its own timetable, hints to the head of government first, and sets the rate whoever governs', () => {
    const c = career();
    const k = c.career!;
    const m = marketsOf(k);
    const rng = new Rng(1);
    k.economy.inflation = 7;
    const meeting = m.next;
    k.week = meeting - BANK.hintWeeks;
    bankWeek(c, rng);
    expect(c.news.some((n) => n.key.startsWith('news.bank.hint.'))).toBe(true);
    k.week = meeting;
    bankWeek(c, rng);
    expect(c.news.some((n) => /^news\.bank\.(up|down|hold)$/.test(n.key))).toBe(true);
    expect(m.next).toBe(meeting + BANK.every);
    expect(bankMind(c, new Rng(2))).toBe(1);
  });

  it('moves the ringgit and the stocks, and keeps them in bounds', () => {
    const c = career();
    const k = c.career!;
    const rng = new Rng(4);
    for (let w = 0; w < 520; w++) { k.week++; marketsWeek(c, rng); }
    const m = k.markets!;
    expect(m.usd).toBeGreaterThan(3.8);
    expect(m.usd).toBeLessThan(5.8);
    for (const s of STOCK_IDS) { expect(m.index[s]).toBeGreaterThanOrEqual(40); expect(m.index[s]).toBeLessThanOrEqual(180); }
  });

  it('brings a windfall or a black swan every four to seven years', () => {
    const c = career();
    const k = c.career!;
    const m = marketsOf(k);
    const first = m.swan - k.week;
    expect(first).toBeGreaterThanOrEqual(52 * 4);
    expect(first).toBeLessThanOrEqual(52 * 7);
    k.week = m.swan;
    swanWeek(c, new Rng(9));
    expect(k.queue.some((q) => q.event === 'marketWindfall' || q.event === 'blackSwan')).toBe(true);
    expect(m.swan - k.week).toBeGreaterThanOrEqual(52 * 4);
  });
});

describe('floor time', () => {
  it('gives the House time for one government bill at each meeting', async () => {
    const { governWeek, tableBill } = await import('./govern');
    const c = career();
    const k = c.career!;
    k.week = 9;
    tableBill(c, 'pledge:homes'); tableBill(c, 'pledge:minWage');
    for (const b of k.bills) b.weeks = 0;
    const rng = new Rng(1);
    governWeek(c, rng); k.week++;
    governWeek(c, rng); k.week++;
    expect(c.inbox.filter((s) => s.kind === 'vote')).toHaveLength(1);
  });
});

describe('the netizens', () => {
  it('weigh the week, carry the verdict over, and punish a bad mood harder than they reward a good one', () => {
    const good = career(), bad = career();
    good.news.push({ week: good.career!.week, party: good.player, key: 'news.x', vars: {}, tone: 'good' });
    bad.news.push({ week: bad.career!.week, party: bad.player, key: 'news.x', vars: {}, tone: 'bad' });
    netizenWeek(good); netizenWeek(bad);
    expect(good.career!.net).toBe(NET.good);
    expect(bad.career!.net).toBe(NET.bad);
  });
});

describe('the leader’s moves', () => {
  it('rest ten to fifteen weeks after each use', () => {
    const c = career();
    const k = c.career!;
    for (const id of MOVE_IDS) {
      if (moveRefusal(c, id)) continue;
      expect(makeMove(world, c, id)).toBe(true);
      const wait = k.moves![id] - k.week;
      expect(wait).toBeGreaterThanOrEqual(10);
      expect(wait).toBeLessThanOrEqual(15);
      expect(moveRefusal(c, id)).toBe('rest');
    }
    expect(Object.keys(k.moves ?? {}).length).toBeGreaterThan(0);
  });
});

describe('the state chiefs between elections', () => {
  it('can be won over and sent to the other side, and leave a deal for the next bill', () => {
    const c = career();
    const k = c.career!;
    const st = world.states[0];
    const person = chiefOf(world, c, st);
    person.loyalty = 40;
    expect(courtChief(world, c, st)).toBe(true);
    expect(person.loyalty).toBe(55);
    expect(courtChief(world, c, st)).toBe(false);
    for (let i = 0; i < 30 && !k.chiefDeal; i++) { k.chiefTalk = undefined; c.parties[PS]!.funds = 1e9; sendChief(world, c, st, new Rng(i)); }
    expect(k.chiefDeal).toBeGreaterThan(0);
    expect(k.chiefDeal).toBeLessThanOrEqual(TERM_CHIEFS.talk.cap);
  });

  it('drift with the party’s fortunes', () => {
    const c = career();
    c.parties[PS]!.unity = 90;
    const rng = new Rng(2);
    for (let w = 0; w < 100; w++) chiefsTermWeek(world, c, rng);
    const st = world.states[1];
    expect(chiefOf(world, c, st).loyalty).toBeGreaterThan(40);
  });
});

describe('the constitutional crisis', () => {
  it('is set ten to fifteen years off and queued when it comes', () => {
    const c = career();
    const k = c.career!;
    crisisWeek(c, new Rng(3));
    expect(k.crisis! - k.week).toBeGreaterThanOrEqual(52 * CRISIS.min);
    k.week = k.crisis!;
    crisisWeek(c, new Rng(3));
    expect(k.queue.some((q) => q.event === 'constCrisis')).toBe(true);
  });
});

describe('what was added', () => {
  it('has text in both languages for every new event, and options to match the choices', () => {
    for (const id of ['marketWindfall', 'blackSwan', 'constCrisis', 'constCourt', 'constSettled', 'viralCat', 'viralDurian', 'viralFootball', 'viralKopitiam', 'viralConcert', 'viralStudent', 'viralRaya', 'viralPothole']) {
      for (const table of [EVENTS_EN, EVENTS_MS]) {
        expect(table[id], id).toBeDefined();
        expect(table[id].options).toHaveLength(EVENTS[id].choices.length);
        expect(table[id].results).toHaveLength(EVENTS[id].choices.length);
      }
    }
  });

  it('has ten new pledges, some of which bring money in', () => {
    const added = ['childcare', 'railLink', 'techFund', 'vocational', 'floodDefence', 'pressAct', 'targetedSubsidy', 'borneoSeats', 'autoRegister', 'carbonTax'] as const;
    for (const id of added) { expect(PLEDGE_IDS).toContain(id); expect(PLEDGES[id]).toBeDefined(); }
    expect(PLEDGES.targetedSubsidy.cost).toBeLessThan(0);
    expect(PLEDGES.borneoSeats.amend).toBe(true);
  });
});

describe('across an election', () => {
  it('carries the markets, the mood online, the crisis clock and the leader’s moves into the next parliament, moved back by the weeks gone', () => {
    const c = career();
    const k = c.career!;
    const m = marketsOf(k);
    m.usd = 4.9; m.next = TERM_WEEKS + 3; m.swan = TERM_WEEKS * 2;
    k.net = 30; k.crisis = TERM_WEEKS * 3; k.moves = { closed: TERM_WEEKS + 5 }; k.viral = TERM_WEEKS + 2;
    k.week = TERM_WEEKS;
    termWeek(world, c);
    while (c.phase === 'campaign') endWeek(world, c);
    closeNight(world, c);
    for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(world, c);
    expect(nextTerm(world, c)).toBe(true);
    const n = c.career!;
    const gone = TERM_WEEKS + c.totalWeeks;
    expect(n.week).toBe(1);
    expect(n.markets!.usd).toBeCloseTo(4.9, 0);
    expect(n.markets!.next).toBe(TERM_WEEKS + 3 - gone);
    expect(n.markets!.swan).toBe(TERM_WEEKS * 2 - gone);
    expect(n.crisis).toBe(TERM_WEEKS * 3 - gone);
    expect(n.viral).toBe(TERM_WEEKS + 2 - gone);
    expect(n.moves!.closed).toBe(TERM_WEEKS + 5 - gone);
    expect(n.net).toBeGreaterThan(20);
    expect(n.net).toBeLessThanOrEqual(30);
  });
});
