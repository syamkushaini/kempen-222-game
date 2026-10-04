import { describe, expect, it } from 'vitest';
import { getWorld, world } from '../../data/world';
import { emptyDynamics } from '../dynamics';
import { lastElection, majorityLine, projectElection } from '../election';
import { transferRate } from '../transfer';
import { N_PARTIES, PARTY_IDS } from '../types';
import { canDo, contests } from './actions';
import {
  assessPact, beforeNomination, breakPact, canCourt, canPromise, canTalk, clashSeats, courtChance, courtDefector, draftPact, inPact,
  meetLeader, nominationWeek, pactPreview, proposePact, relation, resolveCampaignScene, seekUnderstanding, signPact,
} from './diplomacy';
import { consistent } from './cast';
import {
  backRival, blocs, demandsBarred, demandsOpen, endDay, makeOffer, mood, offerProblem, offerValue, playerRole, pledged, soundOut,
  startFormation, unityBill,
} from './formation';
import { autoPlayWeek, closeNight, electionResult, endWeek, newCampaign, playerAct } from './turn';
import type { Campaign, Offer } from './types';
import { isValidCampaign } from './validate';

const P = (id: (typeof PARTY_IDS)[number]) => PARTY_IDS.indexOf(id);
const [PS, BP, PT, GBK, GBS, LEGASI, OTH] = PARTY_IDS.map((_, i) => i);
const hung = getWorld('hung')!;
const start = (over: Partial<Parameters<typeof newCampaign>[1]> = {}): Campaign =>
  newCampaign(world, { player: PS, difficulty: 'normal', seed: 11, ...over });
const talks = (player = PS, seed = 7) => newCampaign(hung, { player, difficulty: 'normal', seed });
const last = lastElection(world);
// Hulu Selangor: all three national parties stood.
const SEAT = 'P.094';
const offer = (o: Partial<Offer>): Offer => ({ posts: 0, senior: null, demands: [], cash: 0, ...o });

describe('standing aside', () => {
  it('moves most of a party’s voters to its partner, sends some home, and scatters the rest', () => {
    const i = world.seatIndex.get(SEAT)!;
    const stood = new Array<number>(N_PARTIES).fill(-1);
    stood[BP] = PS;
    const after = projectElection(world, emptyDynamics(), { [SEAT]: stood }).seats[i];
    const before = last.seats[i];
    const rate = transferRate(BP, PS);
    expect(after.votes[BP]).toBe(0);
    expect(after.votes[PS] - before.votes[PS]).toBeGreaterThan(rate.to * before.votes[BP] * 0.95);
    expect(after.votes[PT]).toBeGreaterThan(before.votes[PT]);
    expect(after.valid).toBeLessThan(before.valid);
    expect(before.valid - after.valid).toBeCloseTo(rate.home * before.votes[BP], -3);
  });

  it('changes nothing anywhere else', () => {
    const stood = new Array<number>(N_PARTIES).fill(-1);
    stood[BP] = PS;
    const after = projectElection(world, emptyDynamics(), { [SEAT]: stood });
    after.seats.forEach((s, i) => { if (s.seatId !== SEAT) expect(s.votes).toEqual(last.seats[i].votes); });
  });
});

describe('leaders', () => {
  it('start with relationships that are the same both ways', () => {
    const c = start();
    for (let a = 0; a < N_PARTIES; a++) for (let b = 0; b < N_PARTIES; b++) expect(c.relations[a][b]).toBe(c.relations[b][a]);
    expect(relation(c, PS, PT)).toBeLessThan(relation(c, PS, LEGASI));
  });

  it('warm to the player over tea, less each time, once a week', () => {
    const c = start();
    const before = relation(c, PS, BP);
    expect(meetLeader(world, c, BP)).not.toBeNull();
    const first = relation(c, PS, BP) - before;
    expect(first).toBeGreaterThan(0);
    expect(c.parties[PS]!.days).toBe(6.5);
    expect(meetLeader(world, c, BP)).toBeNull();
    endWeek(world, c);
    const mid = relation(c, PS, BP);
    meetLeader(world, c, BP);
    expect(relation(c, PS, BP) - mid).toBeLessThan(first);
    expect(relation(c, PS, BP) - mid).toBeGreaterThan(0);
  });

  it('remember being attacked', () => {
    const c = start();
    const before = relation(c, PS, BP);
    playerAct(world, c, 'attack', { party: BP });
    expect(relation(c, PS, BP)).toBeLessThan(before);
  });

  it('promise support only to a leader they like, and never when they expect to win themselves', () => {
    const c = start();
    expect(canPromise(world, c, GBK)).toEqual({ ok: false, reason: 'cold' });
    c.relations[PS][GBK] = c.relations[GBK][PS] = 40;
    expect(seekUnderstanding(world, c, GBK)).not.toBeNull();
    expect(c.understandings).toEqual([GBK]);
    expect(canPromise(world, c, GBK)).toEqual({ ok: false, reason: 'already' });
    const small = start({ player: BP });
    small.relations[BP][PT] = small.relations[PT][BP] = 60;
    expect(canPromise(world, small, PT)).toEqual({ ok: false, reason: 'ambition' });
  });
});

describe('seat pacts', () => {
  it('are drafted so that an incumbent never stands aside and no seat is listed twice', () => {
    const c = start();
    const prop = draftPact(world, c, PS, BP, 'stronger', last);
    const holder = (id: string) => last.seats[world.seatIndex.get(id)!].winner;
    expect(prop.give.length + prop.get.length).toBe(clashSeats(world, c, PS, BP).length);
    expect(prop.give.some((id) => holder(id) === PS)).toBe(false);
    expect(prop.get.some((id) => holder(id) === BP)).toBe(false);
    expect(prop.give.filter((id) => prop.get.includes(id))).toEqual([]);
    expect(draftPact(world, c, PS, BP, 'targeted', last).give.length).toBeLessThan(prop.give.length);
  });

  it('would have won both sides seats last time', () => {
    const c = start();
    const pv = pactPreview(world, c, PS, BP, draftPact(world, c, PS, BP, 'targeted', last));
    expect(pv.a[1]).toBeGreaterThan(pv.a[0]);
    expect(pv.b[1]).toBeGreaterThan(pv.b[0]);
    expect(pv.a[0]).toBe(last.tally[PS]);
  });

  it('are refused by leaders who cannot stand the proposer, and cost nothing to ask', () => {
    const c = start();
    const prop = draftPact(world, c, PS, BP, 'targeted', last);
    expect(assessPact(world, c, PS, BP, prop).reply).toBe('cold');
    expect(canTalk(world, c, BP)).toEqual({ ok: false, reason: 'cold' });
    expect(proposePact(world, c, BP, prop)).toBeNull();
    expect(c.parties[PS]!.days).toBe(7);
  });

  it('are refused when they ask a party to give up seats it holds', () => {
    const c = start();
    c.relations[PS][BP] = c.relations[BP][PS] = 30;
    const theirs = world.seats.filter((_, i) => last.seats[i].winner === BP && contests(world, c, i, PS)).slice(0, 3).map((s) => s.id);
    const verdict = assessPact(world, c, PS, BP, { give: [], get: theirs });
    expect(verdict.reply).toBe('holds');
    expect(verdict.insist).toEqual(theirs);
  });

  it('take effect when signed: candidates withdraw, votes move, and the leaders grow closer', () => {
    // Whether a small party sees enough in a pact depends on how the race has drifted; find a campaign where it does.
    const seed = [11, 12, 13, 14, 15, 16, 17, 18].find((s) => {
      const trial = start({ seed: s });
      return assessPact(world, trial, PS, LEGASI, draftPact(world, trial, PS, LEGASI, 'targeted', last)).reply === 'ok';
    });
    expect(seed).toBeDefined();
    const c = start({ seed });
    const prop = draftPact(world, c, PS, LEGASI, 'targeted', last);
    const before = relation(c, PS, LEGASI);
    const verdict = proposePact(world, c, LEGASI, prop)!;
    expect(verdict.reply).toBe('ok');
    expect(inPact(c, PS, LEGASI)).toBe(true);
    expect(c.parties[PS]!.days).toBe(6);
    expect(relation(c, PS, LEGASI)).toBeGreaterThan(before);
    const gave = world.seatIndex.get(prop.give[0])!, got = world.seatIndex.get(prop.get[0])!;
    expect(contests(world, c, gave, PS)).toBe(false);
    expect(contests(world, c, got, LEGASI)).toBe(false);
    expect(canDo(world, c, PS, 'ceramah', { seat: prop.give[0] })).toEqual({ ok: false, reason: 'notContesting' });
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);

    while (c.phase === 'campaign') endWeek(world, c);
    const result = electionResult(world, c)!;
    expect(result.seats[gave].votes[PS]).toBe(0);
    expect(result.seats[got].votes[LEGASI]).toBe(0);
  });

  it('can be torn up before nomination day, at a price', () => {
    const c = start();
    signPact(world, c, PS, LEGASI, draftPact(world, c, PS, LEGASI, 'targeted', last));
    const before = relation(c, PS, LEGASI);
    expect(breakPact(c, LEGASI)).toBe(true);
    expect(c.pacts).toEqual([]);
    expect(c.standDowns).toEqual({});
    expect(relation(c, PS, LEGASI)).toBeLessThan(before - 30);
    expect(breakPact(c, LEGASI)).toBe(false);
  });

  it('close on nomination day', () => {
    const c = start();
    c.relations[PS][LEGASI] = c.relations[LEGASI][PS] = 50;
    while (beforeNomination(c)) endWeek(world, c);
    expect(c.week).toBe(nominationWeek(c) + 1);
    expect(c.news.some((n) => n.key === 'news.nomination')).toBe(true);
    c.inbox = [];
    expect(assessPact(world, c, PS, LEGASI, draftPact(world, c, PS, LEGASI, 'targeted', last)).reply).toBe('late');
    expect(canTalk(world, c, LEGASI)).toEqual({ ok: false, reason: 'late' });
    expect(canCourt(world, c, SEAT).ok).toBe(false);
  });
});

describe('defections', () => {
  // The rival-held seat where the player is strongest, and so has the best chance of turning the member.
  const share = (i: number) => last.seats[i].votes[PS] / last.seats[i].valid;
  const target = (c: Campaign) => world.seats
    .map((s, i) => ({ s, i })).filter(({ i }) => last.seats[i].winner === PT && contests(world, c, i, PS))
    .sort((a, b) => share(b.i) - share(a.i))[0].s.id;

  it('can be courted: it costs a day and money, and a member who crosses brings votes that do not fade', () => {
    let crossed = 0;
    const seeds = Array.from({ length: 20 }, (_, i) => i + 1);
    for (const seed of seeds) {
      const c = start({ seed });
      const seat = target(c);
      expect(courtChance(world, c, seat)).toBeGreaterThan(0.3);
      const funds = c.parties[PS]!.funds;
      const item = courtDefector(world, c, seat)!;
      expect(c.parties[PS]!.days).toBe(6);
      expect(c.parties[PS]!.funds).toBeLessThan(funds);
      expect(canCourt(world, c, seat).ok).toBe(false);
      if (item.key !== 'news.court.won') { expect(c.katak).toEqual([]); continue; }
      crossed++;
      expect(c.katak).toEqual([seat]);
      const lift = c.drift.support.seat[seat][PS];
      for (let w = 0; w < 3; w++) endWeek(world, c);
      expect(c.drift.support.seat[seat][PS]).toBe(lift);
    }
    expect(crossed).toBeGreaterThan(0);
    expect(crossed).toBeLessThan(seeds.length);
  });

  it('happen to the player too, unless the member is bought off or let go', () => {
    const seat = world.seats.find((_, i) => last.seats[i].winner === PS && contests(world, start(), i, PT))!.id;
    const kept = start();
    const funds = kept.parties[PS]!.funds;
    resolveCampaignScene(world, kept, { id: 1, kind: 'poach', from: PT, seat }, 0);
    expect(kept.katak).toEqual([]);
    expect(kept.parties[PS]!.funds).toBeLessThan(funds);

    const lost = start();
    const unity = lost.parties[PS]!.unity;
    resolveCampaignScene(world, lost, { id: 1, kind: 'poach', from: PT, seat }, 2);
    expect(lost.katak).toEqual([seat]);
    expect(lost.parties[PS]!.unity).toBeLessThan(unity);
    expect(lost.drift.support.seat[seat][PT]).toBeGreaterThan(lost.drift.support.seat[seat][PS]);
  });
});

describe('a campaign with all this going on', () => {
  it('stays a valid save from start to finish, and ends in a government', () => {
    for (const seed of [3, 4]) {
      const c = start({ seed });
      while (c.phase === 'campaign') {
        autoPlayWeek(world, c);
        endWeek(world, c);
        expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
      }
      closeNight(world, c);
      expect(['formation', 'done']).toContain(c.phase);
      for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(world, c);
      expect(c.phase).toBe('done');
      expect(c.formation!.outcome).not.toBeNull();
      expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    }
  });

  it('settles at once when a party wins outright', () => {
    const perlis = getWorld('state:perlis')!;
    const c = newCampaign(perlis, { player: PS, difficulty: 'normal', seed: 2 });
    while (c.phase === 'campaign') endWeek(perlis, c);
    closeNight(perlis, c);
    const o = c.formation!.outcome!;
    expect(c.phase).toBe('done');
    expect(o.pm).toBe(PT);
    expect(o.day).toBe(0);
    expect(o.minority).toBe(false);
    expect(playerRole(c, o)).toBe('opposition');
  });

  it('has no talks after a by-election', () => {
    const by = getWorld('byelection')!;
    const c = newCampaign(by, { player: PS, difficulty: 'easy', seed: 2 });
    while (c.phase === 'campaign') endWeek(by, c);
    closeNight(by, c);
    expect(c.phase).toBe('done');
    expect(c.formation).toBeNull();
  });
});

describe('forming a government', () => {
  it('opens with the last result, a deadline, and nobody over the line', () => {
    const c = talks();
    const f = c.formation!;
    expect(c.phase).toBe('formation');
    expect(f.seats).toEqual(lastElection(hung).tally);
    expect(f.claimants).toEqual([PS, PT]);
    expect(f.deadline).toBe(5);
    expect(f.indep).toHaveLength(f.seats[OTH]);
    expect(c.inbox.map((s) => s.kind)).toEqual(['summons']);
    for (const k of f.claimants) expect(pledged(f, k)).toBeLessThan(majorityLine(hung));
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), hung)).toBe(true);
    expect(talks(BP).formation!.claimants).toEqual([PS, BP, PT]);
  });

  it('values an offer by what the party wants', () => {
    const c = talks();
    const v = (o: Partial<Offer>) => offerValue(hung, c, GBK, PS, offer(o));
    expect(v({ posts: 6 })).toBeGreaterThan(v({ posts: 2 }));
    expect(v({ posts: 6, senior: 'dpm' })).toBeGreaterThan(v({ posts: 6, senior: 'home' }));
    expect(v({ demands: ['autonomy'] })).toBeGreaterThan(v({ demands: ['reformPause'] }));
    // Money moves some leaders and not others.
    const cash = (bloc: number) => offerValue(hung, c, bloc, PS, offer({ cash: 50_000 })) - offerValue(hung, c, bloc, PS, offer({}));
    expect(cash(GBS)).toBeGreaterThan(cash(GBK));
  });

  it('signs a party that gets what it wants, and takes a meeting to ask', () => {
    const c = talks();
    const f = c.formation!;
    const generous = offer({ posts: 7, senior: 'dpm', demands: ['autonomy', 'oilRoyalty'] });
    expect(mood(hung, c, GBK, generous)).toBe('accept');
    const r = makeOffer(hung, c, GBK, generous)!;
    expect(r).toEqual({ reply: 'accept', signed: 23 });
    expect(f.meetings).toBe(2);
    expect(f.pledge[GBK]).toBe(PS);
    expect(pledged(f, PS)).toBe(81 + 23);
    expect(makeOffer(hung, c, BP, offer({ posts: 1 }))!.signed).toBe(0);
    expect(makeOffer(hung, c, PT, offer({ posts: 9, senior: 'finance' }))!.reply).toBe('ambition');
    expect(makeOffer(hung, c, LEGASI, offer({ posts: 1 }))).toBeNull(); // no meetings left
  });

  it('will not let the player promise what they do not have', () => {
    const c = talks();
    expect(offerProblem(hung, c, BP, offer({ posts: 25 }))).toBe('posts');
    expect(offerProblem(hung, c, BP, offer({ cash: 10_000_000 }))).toBe('cash');
    expect(offerProblem(hung, c, BP, offer({ demands: ['localPosts'] }))).toBe('demand');
    makeOffer(hung, c, GBK, offer({ posts: 7, senior: 'dpm', demands: ['autonomy', 'oilRoyalty'] }));
    expect(offerProblem(hung, c, BP, offer({ senior: 'dpm' }))).toBe('senior');
    makeOffer(hung, c, LEGASI, offer({ posts: 1, senior: 'home', demands: ['sabahCm', 'autonomy'], cash: 20_000 }));
    if (c.formation!.pledge[LEGASI] === PS) expect(offerProblem(hung, c, GBS, offer({ demands: ['sabahCm'] }))).toBe('demand');
  });

  it('refuses an offer that promises both reform and a pause on reform', () => {
    const c = talks();
    const f = c.formation!;
    const both = offer({ posts: 9, senior: 'finance', demands: ['subsidies', 'reformAgenda', 'reformPause'] });
    expect(offerProblem(hung, c, BP, both)).toBe('conflict');
    expect(makeOffer(hung, c, BP, both)).toBeNull();
    expect(f.meetings).toBe(3); // nothing was put, so no meeting was spent
    expect(f.offers[PS][BP]).toBeNull();
    for (const d of ['reformAgenda', 'reformPause', 'courtCases'] as const) expect(offerProblem(hung, c, BP, offer({ demands: [d] }))).toBeNull();
    expect(consistent(both.demands)).toEqual(['subsidies', 'reformAgenda']);
    // Nor reform together with a word to the prosecutors; shelving reform and the court cases go together well enough.
    expect(offerProblem(hung, c, BP, offer({ demands: ['courtCases', 'reformAgenda'] }))).toBe('conflict');
    expect(offerProblem(hung, c, BP, offer({ demands: ['courtCases', 'reformPause'] }))).toBeNull();
    expect(consistent(['courtCases', 'reformPause', 'reformAgenda'])).toEqual(['courtCases', 'reformPause']);
  });

  it('will not let the player promise reform to one partner and a pause to another', () => {
    const c = talks();
    const f = c.formation!;
    // An offer BP turns down stays on the table with the pause in it.
    expect(makeOffer(hung, c, BP, offer({ posts: 1, demands: ['reformPause'] }))!.signed).toBe(0);
    expect(makeOffer(hung, c, GBK, offer({ posts: 7, senior: 'dpm', demands: ['autonomy', 'oilRoyalty', 'reformAgenda'] }))!.signed).toBe(23);
    expect(offerProblem(hung, c, BP, offer({ demands: ['reformPause'] }))).toBe('conflictDeal');
    expect(demandsOpen(hung, f, PS, BP)).not.toContain('reformPause');
    expect(offerProblem(hung, c, BP, offer({ demands: ['courtCases'] }))).toBe('conflictDeal');
    expect(demandsOpen(hung, f, PS, BP)).not.toContain('courtCases');
    expect(demandsBarred(hung, f, PS, BP)).toEqual({ reformPause: 'reformAgenda', courtCases: 'reformAgenda' });
    // The same promise can still go to a second partner; it is only its opposite that cannot.
    expect(offerProblem(hung, c, BP, offer({ demands: ['reformAgenda'] }))).toBeNull();
    expect(makeOffer(hung, c, BP, offer({ posts: 9, demands: ['reformPause'] }))).toBeNull();
    // Nobody signs for what can no longer be delivered.
    endDay(hung, c);
    expect(f.offers[PS][BP]!.demands).toEqual([]);
  });

  it('holds rival leaders to the same rule', () => {
    // The player backs a rival; that rival then makes its offer to BP, who would like reform shelved.
    const offered = (toPlayer: Partial<Offer>) => {
      const c = talks();
      const f = c.formation!;
      f.offers[PT][PS] = offer(toPlayer);
      expect(backRival(c, PT)).toBe(true);
      f.day = 4; // late enough for a rival to offer two concessions
      endDay(hung, c);
      const deals = f.outcome!.deals.flatMap((d) => d?.demands ?? []);
      expect(consistent(deals)).toEqual(deals);
      return f.offers[PT][BP]!.demands;
    };
    expect(offered({ posts: 8 })).toEqual(['courtCases', 'reformPause']);
    const afterReform = offered({ posts: 8, demands: ['reformAgenda'] });
    expect(afterReform).not.toContain('reformPause');
    expect(afterReform).not.toContain('courtCases');
  });

  it('never ends in a government that promised both, whoever forms it', () => {
    for (const player of [PS, BP, PT]) for (const seed of [7, 8, 9]) {
      const c = talks(player, seed);
      for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(hung, c);
      const deals = c.formation!.outcome!.deals.flatMap((d) => d?.demands ?? []);
      expect(consistent(deals)).toEqual(deals);
    }
  });

  it('makes leaders hold out while there is time, and settle as the deadline nears', () => {
    const c = talks();
    const modest = offer({ posts: 6, demands: ['autonomy'] });
    expect(mood(hung, c, GBK, modest)).not.toBe('accept');
    c.formation!.day = c.formation!.deadline;
    expect(mood(hung, c, GBK, modest)).toBe('accept');
  });

  it('sounding out costs a meeting and can be done once', () => {
    const c = talks();
    expect(soundOut(c, BP)).toBe(true);
    expect(c.formation!.known[BP]).toBe(true);
    expect(c.formation!.meetings).toBe(2);
    expect(soundOut(c, BP)).toBe(false);
  });

  it('makes the player head of government once the numbers are there', () => {
    const c = talks();
    const f = c.formation!;
    makeOffer(hung, c, GBK, offer({ posts: 7, senior: 'dpm', demands: ['autonomy', 'oilRoyalty'] }));
    expect(unityBill(hung, c, BP, offer({ posts: 9 })).offer).toBe(0); // posts alone give nothing away; their cost is in the total
    const toBp = offer({ posts: 9, senior: 'finance', demands: ['subsidies', 'speaker', 'courtCases'] });
    // The bill for unity is known before the offer is put, and is what the party is charged.
    const bill = unityBill(hung, c, BP, toBp);
    makeOffer(hung, c, BP, toBp);
    expect(pledged(f, PS)).toBeGreaterThanOrEqual(majorityLine(hung));
    const unity = c.parties[PS]!.unity;
    expect(bill.offer).toBe(5 + 1 + 8); // the Finance Ministry, the Speaker's chair, the court cases
    expect(bill.total).toBeGreaterThan(bill.offer);
    endDay(hung, c);
    expect(c.parties[PS]!.unity).toBe(bill.left);
    const o = f.outcome!;
    expect(c.phase).toBe('done');
    expect(o.pm).toBe(PS);
    expect(playerRole(c, o)).toBe('pm');
    expect(o.partners).toEqual([BP, GBK]);
    expect(o.seats).toBe(81 + 30 + 23);
    expect(o.minority).toBe(false);
    expect(o.deals[BP]!.demands).toContain('courtCases');
    // A shabby deal costs trust and strains the party.
    expect(o.trust).toBeLessThan(60);
    expect(c.parties[PS]!.unity).toBeLessThan(unity);
    expect(o.stability).toBeGreaterThanOrEqual(5);
    expect(o.stability).toBeLessThanOrEqual(95);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), hung)).toBe(true);
  });

  it('goes on without a player who does nothing: a rival forms the government', () => {
    for (const player of [PS, BP, PT]) {
      const c = talks(player);
      for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(hung, c);
      const o = c.formation!.outcome!;
      expect(c.phase).toBe('done');
      expect(o.pm).not.toBe(player);
      expect(o.day).toBeGreaterThan(1);
      expect(playerRole(c, o)).toBe('opposition');
      // Nothing that can be given only once was promised twice.
      expect(o.deals.filter((d) => d?.demands.includes('sabahCm')).length).toBeLessThanOrEqual(1);
      const seniors = o.deals.map((d) => d?.senior).filter(Boolean);
      expect(new Set(seniors).size).toBe(seniors.length);
      expect(o.deals.reduce((a, d) => a + (d?.posts ?? 0), 0)).toBeLessThanOrEqual(28);
    }
  });

  it('lets the player give up and back a rival, taking their seats with them', () => {
    const c = talks(BP);
    const f = c.formation!;
    expect(f.offers[PT][BP]).not.toBeNull();
    makeOffer(hung, c, LEGASI, offer({ posts: 2, senior: 'home', demands: ['sabahCm', 'autonomy'], cash: 40_000 }));
    expect(backRival(c, PT)).toBe(true);
    expect(f.claimants).not.toContain(BP);
    expect(f.pledge[BP]).toBe(PT);
    expect(f.pledge[LEGASI]).not.toBe(BP);
    expect(pledged(f, PT)).toBe(74 + 30);
    for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(hung, c);
    if (f.outcome!.pm === PT) expect(playerRole(c, f.outcome!)).toBe('partner');
  });

  it('runs to the Palace’s timetable when nobody will deal: advice, more time, then a minority government', () => {
    // Two leaders, neither with the numbers, and independents who will not be had at any price.
    const c = talks();
    const f = c.formation!;
    f.seats = [101, 0, 100, 0, 0, 0, 21];
    f.pledge = [PS, null, PT, null, null, null, null];
    f.indep = Array.from({ length: 21 }, () => ({ bar: 99, pledge: null }));
    expect(blocs(f)).toEqual([PS, PT, OTH]);
    const seen: string[] = [];
    for (let day = 0; day < 10 && c.phase === 'formation'; day++) {
      endDay(hung, c);
      if (f.unityAdvice && !seen.includes('advice')) seen.push('advice');
      if (f.extended && !seen.includes('extended')) seen.push('extended');
    }
    expect(seen).toEqual(['advice', 'extended']);
    expect(f.deadline).toBe(7);
    expect(f.outcome!.minority).toBe(true);
    expect(f.outcome!.pm).toBe(PS); // most members behind them
    expect(f.outcome!.stability).toBeLessThan(40);
  });

  it('starts pact partners on the side of the larger partner', () => {
    const c = start();
    signPact(world, c, PS, LEGASI, draftPact(world, c, PS, LEGASI, 'targeted', last));
    c.election = { rng: 1 };
    startFormation(world, c, last.tally);
    const f = c.formation!;
    expect(f.pledge[LEGASI]).toBe(PS);
    expect(pledged(f, PS)).toBe(81 + 3);
    expect(f.offers[PS][LEGASI]!.posts).toBeGreaterThan(0);
  });
});

void P; void GBS;
