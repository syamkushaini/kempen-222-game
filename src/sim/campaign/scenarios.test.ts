import { describe, expect, it } from 'vitest';
import { BYELECTION_SEAT, BYELECTION_SEATS, byElectionId, getWorld, SCENARIOS, vacancyOf, VACANCIES, world as general } from '../../data/world';
import { lastElection, majorityLine } from '../election';
import { PARTY_IDS } from '../types';
import { actionCost, canDo } from './actions';
import { flipKind } from './night';
import { pollCost } from './polls';
import {
  autoPlayWeek, campaigns, countBatches, electionResult, endWeek, newCampaign, playable, playerAct, playerPoll,
  setChief, startingFunds, summarise, truth,
} from './turn';
import { isValidCampaign } from './validate';

const P = (id: (typeof PARTY_IDS)[number]) => PARTY_IDS.indexOf(id);
const perak = getWorld('state:perak')!;
const pahang = getWorld('state:pahang')!;
const perlis = getWorld('state:perlis')!;
const by = getWorld('byelection')!;

describe('scenario worlds', () => {
  it('builds every listed scenario and nothing else', () => {
    for (const s of SCENARIOS) expect(getWorld(s.id)?.id).toBe(s.id);
    expect(getWorld('state:atlantis')).toBeNull();
    expect(getWorld('nonsense')).toBeNull();
  });

  it('reproduces each state assembly result', () => {
    const tally = (w: typeof perak) => lastElection(w).tally;
    expect(perak.seats).toHaveLength(59);
    expect([tally(perak)[P('pt')], tally(perak)[P('ps')], tally(perak)[P('bp')]]).toEqual([26, 24, 9]);
    expect(pahang.seats).toHaveLength(42);
    expect([tally(pahang)[P('bp')], tally(pahang)[P('pt')], tally(pahang)[P('ps')]]).toEqual([17, 17, 8]);
    expect(perlis.seats).toHaveLength(15);
    expect(tally(perlis)[P('pt')]).toBe(14);
    expect(majorityLine(perak)).toBe(30);
  });

  it('groups assembly seats by the parliamentary seat they sit in, with names', () => {
    expect(perak.states).toHaveLength(24);
    for (const st of perak.states) expect(perak.regionNames?.[st]).toBeTruthy();
    for (const seat of perak.seats) expect(perak.states).toContain(seat.state);
    expect(general.regionNames).toBeNull();
  });

  it('makes the by-election a one-seat contest', () => {
    expect(by.seats.map((s) => s.id)).toEqual([BYELECTION_SEAT]);
    expect(lastElection(by).seats[0].votes).toEqual(lastElection(general).seats[general.seatIndex.get(BYELECTION_SEAT)!].votes);
  });
});

describe('which seat a by-election is fought in', () => {
  it('can be any close three-way race, with Hulu Selangor among them', () => {
    expect(BYELECTION_SEATS).toContain(BYELECTION_SEAT);
    expect(BYELECTION_SEATS.length).toBeGreaterThan(20);
    for (const id of BYELECTION_SEATS) {
      const votes = lastElection(general).seats[general.seatIndex.get(id)!].votes;
      const total = votes.reduce((a, b) => a + b, 0);
      const [first, second, third] = [P('ps'), P('bp'), P('pt')].map((p) => votes[p] / total).sort((a, b) => b - a);
      expect(third).toBeGreaterThanOrEqual(0.2);
      expect(first - second).toBeLessThanOrEqual(0.12);
    }
  });

  it('is named in the scenario id, and the plain id still means Hulu Selangor', () => {
    const other = BYELECTION_SEATS.find((id) => id !== BYELECTION_SEAT)!;
    const w = getWorld(byElectionId(other))!;
    expect(w.id).toBe(`byelection:${other}`);
    expect(w.seats.map((s) => s.id)).toEqual([other]);
    expect(w.rules.kind).toBe('byelection');
    expect(getWorld(byElectionId(BYELECTION_SEAT))!.seats[0].id).toBe(BYELECTION_SEAT);
    expect(getWorld('byelection')!.id).toBe('byelection');
    expect(getWorld('byelection:P.999')).toBeNull();
  });

  it('plays through from start to declaration in a drawn seat, and stays a valid save', () => {
    for (const id of [BYELECTION_SEATS[0], BYELECTION_SEATS.at(-1)!]) {
      const w = getWorld(byElectionId(id))!;
      const c = newCampaign(w, { player: P('ps'), difficulty: 'easy', seed: 4 });
      while (c.phase === 'campaign') { autoPlayWeek(w, c); endWeek(w, c); }
      expect(c.scenario).toBe(w.id);
      expect(electionResult(w, c)!.seats).toHaveLength(1);
      expect(isValidCampaign(JSON.parse(JSON.stringify(c)), w)).toBe(true);
    }
  });
});

describe('who campaigns', () => {
  it('leaves out parties with only a token presence', () => {
    // Borneo parties stood in a few peninsular seats for a handful of votes.
    expect(campaigns(perak, P('legasi'))).toBe(false);
    expect(campaigns(perak, P('gbk'))).toBe(false);
    expect(playable(perak).map((p) => PARTY_IDS[p])).toEqual(['ps', 'bp', 'pt']);
    expect(playable(general)).toHaveLength(3);
    const c = newCampaign(perak, { player: P('ps'), difficulty: 'normal', seed: 3 });
    expect(c.parties.map((p) => p !== null)).toEqual(PARTY_IDS.map((_, i) => i < 3));
  });
});

describe('scaling to the size of the contest', () => {
  it('scales money down in smaller contests', () => {
    const cost = (w: typeof perak) => actionCost(w, newCampaign(w, { player: P('ps'), difficulty: 'normal', seed: 1 }), P('ps'), 'walkabout', { seat: w === general ? BYELECTION_SEAT : w.seats[0].id }).money;
    expect(cost(general)).toBe(8_000);
    expect(cost(perak)).toBe(2_500);
    expect(cost(by)).toBe(1_000);
    expect(startingFunds(perak, P('ps'))).toBe(360_000);
    expect(pollCost(by, 'seat', BYELECTION_SEAT, 'quick')).toBeLessThan(pollCost(general, 'seat', BYELECTION_SEAT, 'quick'));
  });

  it('runs shorter campaigns', () => {
    expect(newCampaign(perak, { player: 0, difficulty: 'normal', seed: 1 }).totalWeeks).toBe(6);
    expect(newCampaign(by, { player: 0, difficulty: 'normal', seed: 1 }).totalWeeks).toBe(3);
  });

  it('has no travel time inside a state', () => {
    const c = newCampaign(perak, { player: P('ps'), difficulty: 'normal', seed: 1 });
    for (const seat of perak.seats) expect(actionCost(perak, c, P('ps'), 'ceramah', { seat: seat.id }).travelDays).toBe(0);
  });

  it('has division chiefs in a state election and nobody to delegate to in a by-election', () => {
    const state = newCampaign(perak, { player: P('ps'), difficulty: 'normal', seed: 3, totalWeeks: 1 });
    for (const area of perak.states) expect(setChief(perak, state, area, 2)).toBe(true);
    endWeek(perak, state);
    expect(state.news.some((n) => n.key === 'news.chief.work')).toBe(true);

    const one = newCampaign(by, { player: P('ps'), difficulty: 'normal', seed: 3 });
    expect(setChief(by, one, by.states[0], 2)).toBe(false);
    expect(one.parties[P('ps')]!.chiefs).toEqual({});
  });

  it('offers a by-election only the actions that make sense for one seat', () => {
    const c = newCampaign(by, { player: P('ps'), difficulty: 'normal', seed: 1 });
    const state = by.states[0];
    expect(canDo(by, c, P('ps'), 'ceramah', { seat: BYELECTION_SEAT }).ok).toBe(true);
    expect(canDo(by, c, P('ps'), 'canvass', { state }).ok).toBe(true);
    expect(canDo(by, c, P('ps'), 'tv', {})).toEqual({ ok: false, reason: 'noCampaign' });
    expect(canDo(by, c, P('ps'), 'megarally', { state })).toEqual({ ok: false, reason: 'noCampaign' });
    // Get out the vote opens in the final week of a three-week campaign.
    expect(canDo(by, c, P('ps'), 'gotv', { state })).toEqual({ ok: false, reason: 'tooEarly' });
    endWeek(by, c); endWeek(by, c);
    expect(canDo(by, c, P('ps'), 'gotv', { state }).ok).toBe(true);
  });
});

describe('playing the smaller contests', () => {
  const finish = (w: typeof perak, seed: number, play: boolean) => {
    const c = newCampaign(w, { player: P('ps'), difficulty: 'normal', seed });
    while (c.phase === 'campaign') { if (play) autoPlayWeek(w, c); endWeek(w, c); }
    return c;
  };

  it('plays a state election through to a full assembly', () => {
    const c = finish(perak, 4, true);
    const result = electionResult(perak, c)!;
    expect(result.tally.reduce((a, b) => a + b, 0)).toBe(59);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), perak)).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), general)).toBe(false);
    expect(summarise(perak, c, result).before).toBe(24);
  });

  it('rewards campaigning in a state election', () => {
    let active = 0, idle = 0;
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      active += electionResult(perak, finish(perak, seed, true))!.tally[P('ps')];
      idle += electionResult(perak, finish(perak, seed, false))!.tally[P('ps')];
    }
    expect(active).toBeGreaterThan(idle + 12);
  });

  it('decides a by-election by a single seat, and the player can move it', () => {
    const c = newCampaign(by, { player: P('ps'), difficulty: 'normal', seed: 9 });
    const before = truth(by, c).seats[0];
    expect(playerAct(by, c, 'ceramah', { seat: BYELECTION_SEAT })).not.toBeNull();
    expect(playerPoll(by, c, 'seat', BYELECTION_SEAT, 'full')).not.toBeNull();
    const after = truth(by, c).seats[0];
    expect(after.votes[P('ps')] / after.valid).toBeGreaterThan(before.votes[P('ps')] / before.valid);

    const done = finish(by, 9, true);
    const result = electionResult(by, done)!;
    const s = summarise(by, done, result);
    expect(['won', 'defeated']).toContain(s.verdict);
    expect(s.seats).toBe(result.tally[P('ps')]);
  });

  it('counts a by-election in boxes that add up to the result', () => {
    const c = finish(by, 9, false);
    const result = electionResult(by, c)!;
    const boxes = countBatches(c, result, 10);
    expect(boxes).toHaveLength(10);
    expect(boxes.at(-1)).toEqual(result.seats[0].votes);
    for (let i = 1; i < boxes.length; i++) boxes[i].forEach((v, p) => expect(v).toBeGreaterThanOrEqual(boxes[i - 1][p] - 1));
  });
});

describe('what a declaration meant on election night', () => {
  it('tells a hold from a flip, and the player’s gains and losses from other parties’', () => {
    const [a, b, me] = [0, 1, 2];
    expect(flipKind(a, a, me)).toBe('hold');
    expect(flipKind(me, me, me)).toBe('hold');
    expect(flipKind(me, a, me)).toBe('gain');
    expect(flipKind(a, me, me)).toBe('loss');
    expect(flipKind(b, a, me)).toBe('flip');
  });
});

describe('choosing any seat for a by-election', () => {
  it('lists every parliamentary seat and every assembly seat of the three states, each once', () => {
    expect(VACANCIES.filter((v) => v.kind === 'parliament')).toHaveLength(222);
    expect(VACANCIES.filter((v) => v.kind === 'dun')).toHaveLength(59 + 42 + 15);
    expect(new Set(VACANCIES.map((v) => v.key)).size).toBe(VACANCIES.length);
    expect(vacancyOf(BYELECTION_SEAT)?.name).toBeTruthy();
    expect(vacancyOf('P.999')).toBeNull();
    // The close races are still marked, and are the ones the random draw uses.
    expect(VACANCIES.filter((v) => v.kind === 'parliament' && v.close).map((v) => v.key).sort()).toEqual([...BYELECTION_SEATS].sort());
  });

  it('builds a by-election in any parliamentary seat, and in an assembly seat of any of the three states', () => {
    for (const v of [VACANCIES[0], VACANCIES.find((x) => x.kind === 'parliament' && !x.close)!, VACANCIES.at(-1)!, ...['perak', 'pahang', 'perlis'].map((st) => VACANCIES.find((x) => x.kind === 'dun' && x.state === st)!)]) {
      const w = getWorld(byElectionId(v.key));
      expect(w, v.key).not.toBeNull();
      expect(w!.seats).toHaveLength(1);
      expect(w!.seats[0].id).toBe(v.code);
      expect(w!.seats[0].name).toBe(v.name);
      expect(w!.rules.kind).toBe('byelection');
    }
    expect(getWorld('byelection:dun:perak:N.999')).toBeNull();
    expect(getWorld('byelection:dun:atlantis:N.01')).toBeNull();
  });

  it('offers only the parties that stand in the seat, and plays an assembly by-election through', () => {
    for (const v of VACANCIES.filter((x, i) => i % 11 === 0 || x.kind === 'dun').slice(0, 40)) {
      const w = getWorld(byElectionId(v.key))!;
      for (const p of playable(w)) expect(w.baseline.contesting[0][p], `${v.key} ${PARTY_IDS[p]}`).toBe(true);
    }
    const dun = VACANCIES.find((v) => v.kind === 'dun' && v.state === 'perak')!;
    const w = getWorld(byElectionId(dun.key))!;
    const player = playable(w)[0];
    const c = newCampaign(w, { player, difficulty: 'easy', seed: 4 });
    while (c.phase === 'campaign') { autoPlayWeek(w, c); endWeek(w, c); }
    expect(electionResult(w, c)!.seats).toHaveLength(1);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), w)).toBe(true);
  });
});
