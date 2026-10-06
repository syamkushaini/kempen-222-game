import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { BYELECTION_SEAT, BYELECTION_SEATS, byElectionId, fairSeats, getWorld, SCENARIOS, STATE_SCENARIOS, vacancyOf, VACANCIES, world as general } from '../../data/world';
import { emptyDynamics } from '../dynamics';
import { transferRate } from '../transfer';
import { lastElection, majorityLine, projectElection } from '../election';
import { PARTY_IDS } from '../types';
import { actionCost, canDo } from './actions';
import { breakPact, inPact } from './diplomacy';
import { countStory, flipKind } from './night';
import { borrow, loanOffer } from './loan';
import { outlook, outlookOf, par } from './outlook';
import { pollCost } from './polls';
import {
  autoPlayWeek, campaigns, countBatches, electionResult, endWeek, newCampaign, playable, playerAct, playerPoll,
  setChief, standingPact, startingFunds, summarise, truth,
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
    expect(playable(general)).toHaveLength(6); // the three national parties, and the kingmakers of Sabah and Sarawak
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
    expect(['won', 'creditable', 'defeated']).toContain(s.verdict);
    expect(s.seats).toBe(result.tally[P('ps')]);
  });

  it('tells a party where it stands, and draws it a seat it can fairly be asked to win', () => {
    expect(outlookOf([40, 30, 30], 0)).toBe('favourite');
    expect(outlookOf([40, 38, 22], 1)).toBe('close');
    expect(outlookOf([40, 35, 25], 1)).toBe('uphill');
    expect(outlookOf([40, 35, 25], 2)).toBe('longShot');
    for (const id of ['ps', 'bp', 'pt'] as const) {
      const fair = fairSeats(P(id));
      expect(fair.length, id).toBeGreaterThanOrEqual(10);
      for (const seat of fair) {
        expect(BYELECTION_SEATS).toContain(seat);
        expect(['favourite', 'close'], seat).toContain(outlook(getWorld(byElectionId(seat))!, P(id)));
      }
    }
    expect(outlook(perak, P('ps'))).toBeNull(); // only a single seat has a favourite
  });

  it('judges a party nobody expected to win on its share of the vote, not on the seat', () => {
    // A seat where one of the three finished far behind: a long shot.
    const seat = BYELECTION_SEATS.find((id) => ['ps', 'bp', 'pt'].some((x) => outlook(getWorld(byElectionId(id))!, P(x as 'ps')) === 'longShot'))!;
    const w = getWorld(byElectionId(seat))!;
    const p = (['ps', 'bp', 'pt'] as const).map(P).find((x) => outlook(w, x) === 'longShot')!;
    const target = par(w, p)!;
    const last = w.seats[0].last.votes;
    expect(target).toBeCloseTo(last[p] / last.reduce((a, b) => a + b, 0), 6); // a long shot has only to hold its vote
    const leader = last.indexOf(Math.max(...last));
    const night = (share: number) => {
      const votes = last.map((_, i) => (i === p ? share * 1000 : i === leader ? (1 - share) * 1000 : 0));
      const c = newCampaign(w, { player: p, difficulty: 'normal', seed: 1 });
      return summarise(w, c, { seats: [{ seatId: w.seats[0].id, winner: leader }], tally: last.map((_, i) => +(i === leader)), votes } as never).verdict;
    };
    expect(night(target + 0.01)).toBe('creditable');
    expect(night(target - 0.01)).toBe('defeated');
    expect(par(w, leader)).toBeNull(); // the favourite is judged on the seat alone
  });

  it('lends against income that is still to come, and takes that income until it is repaid', () => {
    const c = newCampaign(by, { player: P('ps'), difficulty: 'normal', seed: 4 });
    const pc = c.parties[P('ps')]!;
    const offer = loanOffer(by, c)!;
    expect(offer.weeks).toBe(2); // three weeks: income arrives twice more
    expect(offer.advance).toBeLessThan(offer.owed);
    const funds = pc.funds;
    expect(borrow(by, c)).toBe(true);
    expect(pc.funds).toBe(funds + offer.advance);
    expect(pc.loan).toBe(offer.owed);
    expect(loanOffer(by, c)).toBeNull(); // one loan at a time
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), by)).toBe(true);
    endWeek(by, c);
    expect(pc.funds).toBe(funds + offer.advance); // the week's income went to the lender
    expect(pc.loan).toBeLessThan(offer.owed);
    endWeek(by, c);
    expect(pc.loan ?? 0).toBeLessThan(offer.owed / 4);
    delete pc.loan;
    expect(loanOffer(by, c)).toBeNull(); // the last week: no income left to lend against
  });

  it('counts a by-election in boxes that add up to the result', () => {
    const c = finish(by, 9, false);
    const result = electionResult(by, c)!;
    const boxes = countBatches(c, result, 10);
    expect(boxes).toHaveLength(10);
    expect(boxes.at(-1)).toEqual(result.seats[0].votes);
    for (let i = 1; i < boxes.length; i++) boxes[i].forEach((v, p) => expect(v).toBeGreaterThanOrEqual(boxes[i - 1][p] - 1));
    // The commentary follows the boxes: it opens with the first, and ends with the seat called for whoever won it.
    const story = countStory(boxes);
    expect(story).toHaveLength(10);
    expect(story[0].kind).toBe('first');
    expect(story.at(-1)).toMatchObject({ call: 'called', leader: result.seats[0].winner });
    const settled = story.findIndex((s) => s.call === 'called');
    expect(story.slice(settled).every((s) => s.call === 'called')).toBe(true); // a final call is never taken back
    expect(story.filter((s) => s.desk === 'settled')).toHaveLength(1);
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
  it('lists every parliamentary seat and every assembly seat of the thirteen states, each once', () => {
    expect(VACANCIES.filter((v) => v.kind === 'parliament')).toHaveLength(222);
    expect(VACANCIES.filter((v) => v.kind === 'dun')).toHaveLength(15 + 36 + 40 + 59 + 45 + 32 + 42 + 56 + 36 + 28 + 56 + 73 + 82);
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

// Negeri Sembilan voted with them in 2023 and again in 2026, each coalition on its own; the game plays the newer result.
describe('the five states still on their August 2023 result', () => {
  const PRN6 = ['kedah', 'kelantan', 'terengganu', 'penang', 'selangor'] as const;
  // Seats won by PS, BP and PT, as declared.
  const REAL: Record<(typeof PRN6)[number], [number, number, number]> = {
    kedah: [3, 0, 33], kelantan: [1, 1, 43], terengganu: [0, 0, 32], penang: [27, 2, 11], selangor: [32, 2, 22],
  };
  const world = (st: string) => getWorld(`state:${st}`)!;
  const [ps, bp, pt] = [P('ps'), P('bp'), P('pt')];

  it('are playable alongside the three that voted in 2022, and show the result as it was declared', () => {
    for (const st of PRN6) {
      expect(STATE_SCENARIOS).toContain(st);
      const tally = lastElection(world(st)).tally;
      expect([tally[ps], tally[bp], tally[pt]], st).toEqual(REAL[st]);
      expect(majorityLine(world(st))).toBe(Math.floor(world(st).seats.length / 2) + 1);
    }
  });

  it('were fought by two allies who never stood against each other, and open with that pact still in force', () => {
    for (const st of PRN6) {
      const w = world(st);
      const { standDowns, pacts } = standingPact(w);
      expect(Object.keys(standDowns), st).toHaveLength(w.seats.length);
      for (const seat of w.seats) {
        const stood = standDowns[seat.id];
        // Exactly one of the two allies is on the ballot, and the other stands aside for it.
        expect((stood[ps] === bp) !== (stood[bp] === ps), `${st} ${seat.id}`).toBe(true);
        expect(stood[pt]).toBe(-1);
        expect(seat.last.votes[stood[ps] === bp ? ps : bp]).toBe(0);
        expect(seat.basis!.votes[ps]).toBeGreaterThan(0);
        expect(seat.basis!.votes[bp]).toBeGreaterThan(0);
      }
      // A pact is something two campaigning leaders hold; where one ally is too small to campaign there is none to end.
      expect(pacts).toEqual(campaigns(w, ps) && campaigns(w, bp) ? [{ a: ps, b: bp, week: 0 }] : []);
    }
    // The states that voted in 2022 were three-way fights and open with no pact; so does Negeri Sembilan, on its 2026 result.
    for (const w of [perak, pahang, perlis, world('nsembilan')]) expect(standingPact(w)).toEqual({ standDowns: {}, pacts: [] });
    const ns = lastElection(world('nsembilan')).tally;
    expect([ns[ps], ns[bp], ns[pt]]).toEqual([11, 18, 7]);
  });

  it('are reproduced by the model when the pact holds: the same winner nearly everywhere, and vote shares within a point on average', () => {
    for (const st of PRN6) {
      const w = world(st);
      const real = lastElection(w);
      const model = projectElection(w, emptyDynamics(), standingPact(w).standDowns);
      let same = 0, error = 0, n = 0;
      real.seats.forEach((o, i) => {
        if (o.winner === model.seats[i].winner) same++;
        for (const p of [ps, bp, pt]) { error += Math.abs(o.votes[p] / o.valid - model.seats[i].votes[p] / model.seats[i].valid); n++; }
      });
      expect(same / w.seats.length, st).toBeGreaterThanOrEqual(0.92);
      expect(error / n, st).toBeLessThan(0.01);
    }
  });

  it('used the same voter-transfer rates to rebuild the three-way result as the game uses to apply a pact', () => {
    const script = readFileSync(new URL('../../../scripts/build-data.mjs', import.meta.url), 'utf8');
    for (const [from, to] of [['ps', 'bp'], ['bp', 'ps']] as const) {
      const found = new RegExp(`'${from}>${to}': \\{ to: ([\\d.]+), home: ([\\d.]+) \\}`).exec(script)!;
      expect({ to: Number(found[1]), home: Number(found[2]) }).toEqual(transferRate(P(from), P(to)));
    }
  });

  it('start a campaign as allies on good terms, say so on the first day, and let the player end it', () => {
    const w = world('selangor');
    const c = newCampaign(w, { player: bp, difficulty: 'normal', seed: 3 });
    expect(inPact(c, ps, bp)).toBe(true);
    expect(c.relations[ps][bp]).toBeGreaterThanOrEqual(30);
    expect(c.news.map((n) => n.key)).toContain('news.pact.standing.mine');
    expect(newCampaign(w, { player: pt, difficulty: 'normal', seed: 3 }).news.map((n) => n.key)).toContain('news.pact.standing');
    const standsIn = () => w.seats.filter((s, i) => w.baseline.contesting[i][bp] && (c.standDowns[s.id]?.[bp] ?? -1) < 0).length;
    expect(standsIn()).toBe(12);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), w)).toBe(true);
    expect(breakPact(c, ps)).toBe(true);
    expect(standsIn()).toBe(w.seats.length);
    expect(c.standDowns).toEqual({});
  });

  it('play through to a full assembly, and offer all three parties in a by-election there', () => {
    for (const st of ['selangor', 'kelantan'] as const) {
      const w = world(st);
      const c = newCampaign(w, { player: playable(w)[0], difficulty: 'normal', seed: 4 });
      while (c.phase === 'campaign') { autoPlayWeek(w, c); endWeek(w, c); }
      expect(electionResult(w, c)!.tally.reduce((a, b) => a + b, 0)).toBe(w.seats.length);
      expect(isValidCampaign(JSON.parse(JSON.stringify(c)), w)).toBe(true);
    }
    const seat = VACANCIES.find((v) => v.kind === 'dun' && v.state === 'selangor')!;
    const one = getWorld(byElectionId(seat.key))!;
    // A by-election is a fresh contest: no pact, and everyone who has a following there stands.
    expect(standingPact(one)).toEqual({ standDowns: {}, pacts: [] });
    expect(playable(one).map((p) => PARTY_IDS[p])).toEqual(['ps', 'bp', 'pt']);
  });
});
