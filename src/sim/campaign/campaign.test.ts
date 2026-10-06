import { describe, expect, it } from 'vitest';
import seatFile from '../../data/generated/seats.json';
import { createWorld, lastElection, type SeatFile } from '../election';
import { PARTY_IDS, type ElectionOutcome } from '../types';
import { ACTIONS, CHIEF, actionCost, canDo, doAction } from './actions';
import { CHIEF_NOISE, chiefAllowance, runChiefs } from './ai';
import { travelCost } from './geo';
import { latestSeatIntel, pollCost } from './polls';
import {
  autoPlayWeek, declarationOrder, electionResult, endWeek, newCampaign, playerAct, playerPoll,
  setChief, setChiefFloor, summarise, truth, weeklyIncome,
} from './turn';
import { DAYS_PER_WEEK, type Campaign } from './types';
import { isValidCampaign } from './validate';
import { edge } from './perks';
import { campaignMarks, MARK } from './marks';
import { CHIEF_NAMES, chiefHand, chiefMood, chiefOf, chiefsWeek, chiefView } from './chiefs';
import { Rng } from '../rng';

const world = createWorld(seatFile as SeatFile);
const P = (id: (typeof PARTY_IDS)[number]) => PARTY_IDS.indexOf(id);
const start = (over: Partial<Parameters<typeof newCampaign>[1]> = {}): Campaign =>
  newCampaign(world, { player: P('ps'), difficulty: 'normal', seed: 2026, ...over });
const share = (o: ElectionOutcome, seat: string, p: number) => {
  const s = o.seats[world.seatIndex.get(seat)!];
  return s.votes[p] / s.valid;
};
// Hulu Selangor: a three-way marginal in the player's home zone.
const SEAT = 'P.094';

describe('new campaign', () => {
  it('is the same for the same seed and differs between seeds', () => {
    expect(start()).toEqual(start());
    expect(start({ seed: 1 }).drift).not.toEqual(start({ seed: 2 }).drift);
  });

  it('starts in week 1 with a full week, funds and a public poll', () => {
    const c = start();
    const me = c.parties[c.player]!;
    expect(c.week).toBe(1);
    expect(me.days).toBe(DAYS_PER_WEEK);
    expect(me.funds).toBeGreaterThan(0);
    expect(c.polls).toHaveLength(1);
    expect(c.polls[0].public).toBe(true);
    expect(c.parties[P('oth')]).toBeNull();
  });

  it('gives parties no machinery where they do not stand', () => {
    const c = start();
    const gbk = c.parties[P('gbk')]!;
    expect(gbk.machinery.filter((m) => m > 0)).toHaveLength(1); // Sarawak only
  });

  it('hides a drift, so the race is not exactly the last election', () => {
    const c = start();
    expect(truth(world, c).votes).not.toEqual(lastElection(world).votes);
  });

  it('passes save validation, also after a JSON round trip', () => {
    const c = start();
    expect(isValidCampaign(c, world)).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    expect(isValidCampaign({ ...c, parties: [] }, world)).toBe(false);
    expect(isValidCampaign({ ...c, week: 99 }, world)).toBe(false);
  });
});

describe('travel', () => {
  it('is free within a zone and dearest across the sea', () => {
    expect(travelCost(world, 'selangor', 'kl').days).toBe(0);
    expect(travelCost(world, 'selangor', 'johor').days).toBe(0.5);
    expect(travelCost(world, 'selangor', 'sabah').days).toBe(1);
    expect(travelCost(world, 'sabah', 'sarawak').days).toBe(0.5);
    expect(travelCost(world, 'sabah', 'labuan').days).toBe(0);
  });

  it('is added to actions that need the leader there, and moves the leader', () => {
    const c = start();
    const home = actionCost(world, c, c.player, 'ceramah', { seat: SEAT });
    const away = actionCost(world, c, c.player, 'ceramah', { seat: 'P.172' }); // Kota Kinabalu
    expect(home.days).toBe(1);
    expect(away.days).toBe(2);
    expect(away.money).toBeGreaterThan(home.money);
    doAction(world, c, c.player, 'ceramah', { seat: 'P.172' });
    expect(c.parties[c.player]!.location).toBe('sabah');
    expect(c.parties[c.player]!.days).toBe(DAYS_PER_WEEK - 2);
  });
});

describe('actions', () => {
  it('refuses what cannot be done, with a reason', () => {
    const c = start();
    const me = c.player;
    const why = (...args: Parameters<typeof canDo> extends [any, any, any, ...infer R] ? R : never) => {
      const r = canDo(world, c, me, ...args);
      return r.ok ? 'ok' : r.reason;
    };
    expect(why('ceramah', {})).toBe('noTarget');
    expect(why('ceramah', { seat: SEAT })).toBe('ok');
    expect(why('gotv', { state: 'selangor' })).toBe('tooEarly');
    expect(why('attack', { party: me })).toBe('self');
    expect(why('attack', { party: P('oth') })).toBe('noTarget');
    // Pakatan Sinar's stand-in did not contest every Sarawak seat; GBK contests nothing on the peninsula.
    expect(canDo(world, c, P('gbk'), 'canvass', { state: 'johor' })).toEqual({ ok: false, reason: 'notContesting' });

    c.parties[me]!.funds = 1000;
    expect(why('tv', {})).toBe('funds');
    c.parties[me]!.funds = 5_000_000;
    c.parties[me]!.days = 0.5;
    expect(why('ceramah', { seat: SEAT })).toBe('days');
    expect(why('walkabout', { seat: SEAT })).toBe('ok');
  });

  it('limits repeat use within a week', () => {
    const c = start();
    doAction(world, c, c.player, 'ceramah', { seat: SEAT });
    expect(canDo(world, c, c.player, 'ceramah', { seat: SEAT })).toEqual({ ok: false, reason: 'usedThisWeek' });
    doAction(world, c, c.player, 'tycoon', {});
    endWeek(world, c);
    expect(canDo(world, c, c.player, 'ceramah', { seat: SEAT }).ok).toBe(true);
    expect(canDo(world, c, c.player, 'tycoon', {})).toEqual({ ok: false, reason: 'once' });
  });

  it('a ceramah costs time and money and lifts the party in that seat only', () => {
    const c = start();
    const before = truth(world, c);
    const funds = c.parties[c.player]!.funds;
    const item = playerAct(world, c, 'ceramah', { seat: SEAT });
    const after = truth(world, c);
    expect(item?.key).toMatch(/^news\.me\.ceramah\./);
    expect(c.parties[c.player]!.funds).toBeLessThan(funds);
    expect(share(after, SEAT, c.player)).toBeGreaterThan(share(before, SEAT, c.player) + 0.01);
    expect(after.seats[0].votes).toEqual(before.seats[0].votes);
  });

  it('canvassing lifts the party across the state and nowhere else', () => {
    const c = start({ player: P('bp') });
    const before = truth(world, c);
    doAction(world, c, c.player, 'canvass', { state: 'pahang' });
    const after = truth(world, c);
    world.seats.forEach((seat, i) => {
      const gain = after.seats[i].votes[c.player] - before.seats[i].votes[c.player];
      if (seat.state === 'pahang') expect(gain).toBeGreaterThan(0);
      else expect(gain).toBe(0);
    });
  });

  it('has diminishing returns in a seat', () => {
    const c = start();
    const gains: number[] = [];
    for (let k = 0; k < 6; k++) {
      c.parties[c.player]!.used = {};
      c.parties[c.player]!.days = 7;
      c.rng = 1; // same luck every time
      const before = c.dyn.support.seat[SEAT]?.[c.player] ?? 0;
      doAction(world, c, c.player, 'ceramah', { seat: SEAT });
      gains.push(c.dyn.support.seat[SEAT][c.player] - before);
    }
    for (let k = 1; k < gains.length; k++) expect(gains[k]).toBeLessThan(gains[k - 1]);
  });

  it('fundraising adds money, with less each time in the same place', () => {
    const c = start();
    const me = c.parties[c.player]!;
    const funds = me.funds;
    c.rng = 5;
    const first = doAction(world, c, c.player, 'dinner', { state: 'kl' }).raised!;
    me.used = {}; me.days = 7; c.rng = 5;
    const second = doAction(world, c, c.player, 'dinner', { state: 'kl' }).raised!;
    expect(first).toBeGreaterThan(0);
    expect(second).toBeLessThan(first);
    expect(me.funds).toBe(funds + first + second);
  });

  it('defines every action', () => {
    for (const def of Object.values(ACTIONS)) expect(def.days).toBeGreaterThan(0);
  });
});

describe('polls', () => {
  it('cost money, not time, and land near the truth', () => {
    const c = start();
    const me = c.parties[c.player]!;
    const funds = me.funds;
    const poll = playerPoll(world, c, 'seat', SEAT, 'full')!;
    expect(me.funds).toBe(funds - pollCost(world, 'seat', SEAT, 'full'));
    expect(me.days).toBe(DAYS_PER_WEEK);
    const real = truth(world, c);
    poll.seats![SEAT].forEach((s, p) => expect(Math.abs(s - share(real, SEAT, p))).toBeLessThan(0.1));
    expect(poll.public).toBe(false);
  });

  it('are refused without the money', () => {
    const c = start();
    c.parties[c.player]!.funds = 100;
    expect(playerPoll(world, c, 'national', null, 'full')).toBeNull();
  });

  it('a state poll covers every seat in the state, and newer readings replace older ones', () => {
    const c = start();
    c.parties[c.player]!.funds = 5_000_000;
    const statePoll = playerPoll(world, c, 'state', 'selangor', 'quick')!;
    expect(Object.keys(statePoll.seats!)).toHaveLength(22);
    endWeek(world, c);
    c.parties[c.player]!.funds = 5_000_000;
    const seatPoll = playerPoll(world, c, 'seat', SEAT, 'full')!;
    const intel = latestSeatIntel(c.polls);
    expect(intel.size).toBe(22);
    expect(intel.get(SEAT)).toEqual({ shares: seatPoll.seats![SEAT], week: 2, moe: seatPoll.moe });
    expect(intel.get('P.096')!.week).toBe(1);
  });
});

describe('the weekly turn', () => {
  it('advances the week, refills days, pays donations and publishes a poll', () => {
    const c = start();
    const me = c.parties[c.player]!;
    playerAct(world, c, 'ceramah', { seat: SEAT });
    const funds = me.funds;
    endWeek(world, c);
    expect(c.week).toBe(2);
    expect(me.days).toBe(DAYS_PER_WEEK);
    expect(me.used).toEqual({});
    expect(me.funds).toBe(funds + weeklyIncome(world, c.player));
    expect(c.polls.filter((p) => p.public)).toHaveLength(2);
  });

  it('lets rivals campaign and report it in the news', () => {
    const c = start();
    endWeek(world, c);
    const rivalNews = c.news.filter((n) => n.key.startsWith('news.rival.'));
    expect(rivalNews.length).toBeGreaterThan(0);
    for (const rival of ['bp', 'pt', 'gbk'] as const) {
      const pc = c.parties[P(rival)]!;
      // Each rival spent something or raised something during its week.
      expect(pc.funds).not.toBe(start().parties[P(rival)]!.funds + weeklyIncome(world, P(rival)));
    }
  });

  it('fades campaign effects over time', () => {
    const c = start();
    doAction(world, c, c.player, 'ceramah', { seat: SEAT });
    const boost = c.dyn.support.seat[SEAT][c.player];
    endWeek(world, c);
    expect(c.dyn.support.seat[SEAT][c.player]).toBeLessThan(boost);
  });

  it('reaches polling day after the final week and stops there', () => {
    const c = start();
    for (let w = 1; w <= c.totalWeeks; w++) { expect(c.phase).toBe('campaign'); endWeek(world, c); }
    expect(c.phase).toBe('night');
    expect(c.week).toBe(c.totalWeeks);
    expect(c.election).not.toBeNull();
    const news = c.news.length;
    endWeek(world, c);
    expect(c.news.length).toBe(news);
    expect(playerAct(world, c, 'ceramah', { seat: SEAT })).toBeNull();
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });
});

describe('chiefs', () => {
  /** A campaign in its final week with a chief given a free hand in every state. */
  const lateWithChiefs = () => {
    const c = start({ totalWeeks: 1 });
    for (const st of world.states) setChief(world, c, st, 3);
    return c;
  };
  const work = (c: Campaign) => runChiefs(world, c, c.player, truth(world, c), CHIEF_NOISE);

  it('do nothing until appointed', () => {
    const c = start({ totalWeeks: 1 });
    const funds = c.parties[c.player]!.funds;
    expect(work(c)).toEqual([]);
    expect(c.parties[c.player]!.funds).toBe(funds);
  });

  it('campaign on the party’s money without the leader’s time', () => {
    const c = lateWithChiefs();
    const me = c.parties[c.player]!;
    const before = { funds: me.funds, days: me.days, location: me.location, allowance: chiefAllowance(c, c.player) };
    const done = work(c);
    const spent = done.reduce((a, w) => a + w.spent, 0);
    expect(done.length).toBeGreaterThan(3);
    expect(spent).toBeGreaterThan(0);
    expect(spent).toBeLessThanOrEqual(before.allowance);
    expect(me.funds).toBe(before.funds - spent);
    expect(me.days).toBe(before.days);
    expect(me.location).toBe(before.location);
    expect(me.visits).toEqual([]);
    for (const w of done) expect(w.reports.length).toBeLessThanOrEqual(4);
  });

  it('work only where they are in charge', () => {
    const c = start({ totalWeeks: 1 });
    setChief(world, c, 'perak', 3);
    expect(work(c).map((w) => w.state)).toEqual(['perak']);
    setChief(world, c, 'perak', 0);
    expect(c.parties[c.player]!.chiefs).toEqual({});
  });

  it('do fewer things on a tighter leash', () => {
    const c = start({ totalWeeks: 1 });
    setChief(world, c, 'perak', 1);
    expect(work(c)[0].reports).toHaveLength(1);
  });

  it('draw half the leader’s crowd', () => {
    const boost = (chief: boolean) => {
      const c = start();
      doAction(world, c, c.player, 'ceramah', { seat: SEAT }, chief);
      return c.dyn.support.seat[SEAT][c.player];
    };
    // The leader draws on their own charisma; a chief is nobody in particular.
    expect(boost(true)).toBeCloseTo((boost(false) / edge(start(), start().player, 'charisma')) * CHIEF.draw * chiefHand(world, start(), start().player, world.seats[world.seatIndex.get(SEAT)!].state), 10);
    const c = start();
    expect(actionCost(world, c, c.player, 'ceramah', { seat: 'P.168' }, true)).toEqual({ days: 0, money: 30_000, travelDays: 0 });
    expect(canDo(world, c, c.player, 'tv', {}, true)).toEqual({ ok: false, reason: 'noCampaign' });
  });

  it('skip what the leader has already done this week', () => {
    const c = lateWithChiefs();
    const mine = work(structuredClone(c)).flatMap((w) => w.reports).find((r) => r.id === 'walkabout')!;
    doAction(world, c, c.player, 'walkabout', mine.target);
    const repeats = work(c).flatMap((w) => w.reports).filter((r) => r.id === 'walkabout' && r.target.seat === mine.target.seat);
    expect(repeats).toEqual([]);
  });

  it('leave the floor untouched and pace themselves before the final week', () => {
    const floored = lateWithChiefs();
    setChiefFloor(floored, floored.parties[floored.player]!.funds);
    expect(work(floored)).toEqual([]);

    const early = start();
    expect(chiefAllowance(early, early.player)).toBeLessThan(early.parties[early.player]!.funds / early.totalWeeks);
    const late = start({ totalWeeks: 1 });
    expect(chiefAllowance(late, late.player)).toBe(late.parties[late.player]!.funds);
  });

  it('report their week in the news and survive a save', () => {
    const c = lateWithChiefs();
    endWeek(world, c);
    const lines = c.news.filter((n) => n.key === 'news.chief.work');
    expect(lines.length).toBeGreaterThan(3);
    expect(String(lines[0].vars!.actions)).toMatch(/^@actions:/);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    expect(isValidCampaign({ ...c, parties: c.parties.map((p) => p && { ...p, chiefs: { atlantis: 2 } }) }, world)).toBe(false);
  });

  it('win seats for a leader who stays at home', () => {
    const run = (seed: number, chiefs: boolean) => {
      const c = start({ seed });
      if (chiefs) for (const st of world.states) setChief(world, c, st, 3);
      while (c.phase === 'campaign') endWeek(world, c);
      return electionResult(world, c)!.tally[P('ps')];
    };
    // One campaign can swing by twenty seats either way; it takes a couple of dozen to see what chiefs are worth.
    const seeds = Array.from({ length: 24 }, (_, i) => i + 1);
    let withChiefs = 0, without = 0;
    for (const seed of seeds) { withChiefs += run(seed, true); without += run(seed, false); }
    expect(withChiefs).toBeGreaterThan(without + 2 * seeds.length); // more than 2 seats a campaign on average
  }, 120_000); // forty-eight whole campaigns: slow when the machine is busy
});

describe('polling day', () => {
  const finish = (seed: number, play: boolean, player = P('ps')) => {
    const c = start({ seed, player });
    while (c.phase === 'campaign') { if (play) autoPlayWeek(world, c); endWeek(world, c); }
    return c;
  };

  it('gives the same result every time for a finished campaign', () => {
    const c = finish(11, true);
    const a = electionResult(world, c)!;
    const b = electionResult(world, JSON.parse(JSON.stringify(c)))!;
    expect(a.tally).toEqual(b.tally);
    expect(a.tally.reduce((x, y) => x + y, 0)).toBe(222);
  });

  it('declares every seat exactly once', () => {
    const order = declarationOrder(world, finish(11, false));
    expect([...order].sort((a, b) => a - b)).toEqual(world.seats.map((_, i) => i));
  });

  it('summarises the player’s night consistently', () => {
    const c = finish(11, true);
    const result = electionResult(world, c)!;
    const s = summarise(world, c, result);
    expect(s.seats).toBe(result.tally[c.player]);
    expect(s.before).toBe(81);
    expect(s.seats).toBe(s.before + s.gained.length - s.lost.length);
    expect(s.rank).toBeGreaterThanOrEqual(1);
  });

  it('rewards campaigning: an active party beats an idle one', () => {
    let active = 0, idle = 0;
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      active += electionResult(world, finish(seed, true))!.tally[P('ps')];
      idle += electionResult(world, finish(seed, false))!.tally[P('ps')];
    }
    expect(active).toBeGreaterThan(idle + 30); // more than 5 seats a campaign on average
  });

  it('keeps an all-rivals race close to the last election', () => {
    const last = lastElection(world).tally;
    const mean = PARTY_IDS.map(() => 0);
    const seeds = [21, 22, 23, 24, 25, 26];
    for (const seed of seeds) electionResult(world, finish(seed, true, P('bp')))!.tally.forEach((v, p) => { mean[p] += v / seeds.length; });
    for (const p of [P('ps'), P('bp'), P('pt')]) expect(Math.abs(mean[p] - last[p])).toBeLessThan(15);
  });
});

describe('marks on the map', () => {
  it('show where the parties have been working, the hardest-worked first, and fade when they stop coming', () => {
    const w = world;
    const c = newCampaign(w, { player: 0, difficulty: 'normal', seed: 2 });
    expect(campaignMarks(c)).toEqual([]);
    const [a, b, far] = w.seats.map((s) => s.id);
    c.dyn.support.seat[a] = w.seats[0].last.votes.map((_, p) => (p === 0 ? 0.2 : p === 1 ? 0.05 : p === 2 ? 0.04 : 0));
    c.dyn.support.seat[b] = w.seats[0].last.votes.map((_, p) => (p === 2 ? MARK.flag : 0));
    c.dyn.support.seat[far] = w.seats[0].last.votes.map((_, p) => (p === 1 ? MARK.flag - 0.001 : -0.3));
    expect(campaignMarks(c)).toEqual([
      { seat: a, party: 0, kind: 'tent', slot: 0, of: 2 },
      { seat: a, party: 1, kind: 'flag', slot: 1, of: 2 }, // two parties at most: the third is left off
      { seat: b, party: 2, kind: 'flag', slot: 0, of: 1 },
    ]);
    // A real week leaves real marks, and only for parties that campaign.
    const played = newCampaign(w, { player: 0, difficulty: 'normal', seed: 2 });
    autoPlayWeek(w, played); endWeek(w, played);
    const marks = campaignMarks(played);
    expect(marks.length).toBeGreaterThan(5);
    for (const m of marks) expect(played.parties[m.party]).toBeTruthy();
    played.phase = 'night';
    expect(campaignMarks(played)).toEqual([]);
  });
});

describe('chiefs as people', () => {
  const elsewhere = (c: Campaign) => { c.parties[c.player]!.location = 'johor'; c.parties[c.player]!.visits = []; };

  it('are the same people in the same game, and keep or lose their loyalty by whether the leader turns up', () => {
    const c = start();
    expect(setChief(world, c, 'perak', 2)).toBe(true);
    const person = chiefOf(world, c, 'perak');
    expect(chiefView(world, start(), 'perak')).toEqual(person);
    expect(CHIEF_NAMES[person.name]).toBeTruthy();
    expect(new Set(world.states.map((st) => chiefView(world, c, st).name)).size).toBe(world.states.length); // no two share a name
    expect(person.skill).toBeGreaterThanOrEqual(2);
    expect(person.skill).toBeLessThanOrEqual(5);
    expect(chiefHand(world, c, c.player, 'perak')).toBeCloseTo(1 + 0.1 * (person.skill - 3), 6);
    expect(chiefHand(world, c, P('bp'), 'perak')).toBe(1); // a rival's chiefs are nobody in particular
    person.skeleton = false;
    const before = person.loyalty;
    elsewhere(c);
    chiefsWeek(world, c, new Rng(1));
    expect(person.loyalty).toBe(before - 2);
    c.parties[c.player]!.location = 'perak';
    chiefsWeek(world, c, new Rng(1));
    expect(person.loyalty).toBe(before + 2);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
  });

  it('say so when they cool, and left alone may cross to a rival with the branches', () => {
    const c = start();
    setChief(world, c, 'perak', 2);
    const person = chiefOf(world, c, 'perak');
    person.skeleton = false;
    person.loyalty = 31;
    elsewhere(c);
    chiefsWeek(world, c, new Rng(1));
    expect(chiefMood(person)).toBe('restless');
    expect(c.news.at(-1)).toMatchObject({ key: 'news.chief.restless', tone: 'bad' });
    person.loyalty = 6;
    const i = world.states.indexOf('perak');
    const branches = c.parties[c.player]!.machinery[i], unity = c.parties[c.player]!.unity;
    for (let seed = 1; seed < 60 && c.parties[c.player]!.chiefs.perak; seed++) { person.loyalty = 6; chiefsWeek(world, c, new Rng(seed)); }
    expect(c.parties[c.player]!.chiefs.perak).toBeUndefined();
    expect(c.news.at(-1)).toMatchObject({ key: 'news.chief.defected', tone: 'bad' });
    expect(c.parties[c.player]!.machinery[i]).toBe(branches - 15);
    expect(c.parties[c.player]!.unity).toBe(unity - 2);
    // A deputy steps up: steadier, less able, and not the same person.
    expect(chiefView(world, c, 'perak')).toMatchObject({ skill: 2, loyalty: 60, skeleton: false, generation: 1 });
  });

  it('may be brought down by something in their past', () => {
    const c = start();
    setChief(world, c, 'kedah', 1);
    chiefOf(world, c, 'kedah').skeleton = true;
    for (let seed = 1; seed < 200 && c.parties[c.player]!.chiefs.kedah; seed++) { c.parties[c.player]!.location = 'kedah'; chiefsWeek(world, c, new Rng(seed)); }
    expect(c.parties[c.player]!.chiefs.kedah).toBeUndefined();
    expect(c.news.at(-1)).toMatchObject({ key: 'news.chief.exposed', tone: 'bad' });
    expect(chiefView(world, c, 'kedah').generation).toBe(1);
  });
});
