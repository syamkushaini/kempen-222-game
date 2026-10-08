import { describe, expect, it } from 'vitest';
import { getWorld, worldOf } from '../../data/world';
import { EVENTS_EN, EVENTS_MS } from '../../i18n/events';
import { emptyDynamics } from '../dynamics';
import { lastElection, majorityLine, projectElection } from '../election';
import { Rng } from '../rng';
import { BLOC_IDS, PARTY_IDS } from '../types';
import { doAction } from './actions';
import {
  answerEvent, canDissolve, dissolve, EARLIEST_DISSOLUTION, governmentFalls, inGovernment, invest, nextTerm, resumeTerm,
  setOrders, skipAhead, startCareer, syncOpinion, termIncome, termSpending, termWeek, TERM_WEEKS,
} from './career';
import { draftPact, signPact } from './diplomacy';
import { canChoose, choiceCost, EVENTS, resolveEvent, rollEvent, seatOf } from './events';
import { endDay } from './formation';
import { FISCAL_ROOM, launchManifesto, manifestoCost, MAX_PLEDGES, policyEffect, setStance, stanceCost, togglePledge } from './policy';
import { autoPlayWeek, closeNight, electionResult, endWeek, playable } from './turn';
import { ISSUE_IDS, PLEDGE_IDS, type Campaign } from './types';
import { isValidCampaign } from './validate';

const [PS, BP, PT, GBK, , LEGASI] = PARTY_IDS.map((_, i) => i);
const base = getWorld('career')!;
const career = (player = PS, seed = 5): Campaign => startCareer(base, { player, difficulty: 'normal', seed });
const issue = (id: (typeof ISSUE_IDS)[number]) => ISSUE_IDS.indexOf(id);
const bloc = (id: (typeof BLOC_IDS)[number]) => BLOC_IDS.indexOf(id);
/** Plays out whatever is waiting, always taking the given choice, until the term is moving again. */
const clearDesk = (c: Campaign, choice = 0) => { while (c.inbox.length) answerEvent(base, c, c.inbox.shift()!, Math.min(choice, EVENTS[c.inbox[0]?.event ?? '']?.choices.length ?? 1)); };

describe('starting a career', () => {
  it('opens at the start of a term, under the government the last election produced', () => {
    const c = career();
    const g = c.career!.government;
    expect(c.phase).toBe('term');
    expect(c.career!.week).toBe(1);
    expect(g.pm).toBe(PS);
    expect(g.seats).toBe(81 + 30 + 23 + 6 + 3);
    expect(g.seats).toBeGreaterThanOrEqual(majorityLine(base));
    expect([seatOf(career(PS)), seatOf(career(BP)), seatOf(career(PT))]).toEqual(['pm', 'gov', 'opp']);
    expect(c.parties[PS]!.funds).toBe(480_000);
    expect(c.polls).toHaveLength(1);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
    // A career save is not a single contest, and the other way round.
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), getWorld('general')!)).toBe(false);
  });
});

describe('standing orders', () => {
  it('move money in and out every week, and time on', () => {
    const c = career();
    setOrders(base, c, { budget: { machinery: 2, media: 1, research: 1 }, donors: 2 });
    const funds = c.parties[PS]!.funds;
    const net = termIncome(base, c).total - termSpending(base, c).total;
    termWeek(base, c);
    expect(c.career!.week).toBe(2);
    expect(c.parties[PS]!.funds).toBe(funds + net);
    expect(termIncome(base, c).donors).toBe(16_000);
  });

  it('build branches where they are aimed and let the rest wither', () => {
    const c = career();
    const i = base.states.indexOf('johor'), j = base.states.indexOf('kedah');
    const before = [...c.parties[PS]!.machinery];
    setOrders(base, c, { focus: 'tour', focusStates: ['johor'], budget: { machinery: 3, media: 0, research: 0 } });
    for (let w = 0; w < 10; w++) { c.inbox = []; termWeek(base, c); }
    expect(c.parties[PS]!.machinery[i]).toBeGreaterThan(before[i] + 5);
    expect(c.parties[PS]!.machinery[j]).toBeLessThan(before[j]);
  });

  it('ignore what makes no sense', () => {
    const c = career(PT);
    setOrders(base, c, { focusStates: ['johor', 'kedah', 'perak', 'selangor', 'atlantis'], state: 3, courting: PT });
    expect(c.career!.orders.focusStates).toEqual(['johor', 'kedah', 'perak']);
    expect(c.career!.orders.state).toBe(0); // the opposition has no state resources to lean on
    expect(c.career!.orders.courting).toBeNull();
    expect(inGovernment(c, PT)).toBe(false);
    const gov = career(BP);
    setOrders(base, gov, { state: 2 });
    expect(termIncome(base, gov).state).toBe(20_000);
  });

  it('cut everything back in proportion when the money runs out', () => {
    const c = career();
    setOrders(base, c, { budget: { machinery: 3, media: 3, research: 3 } });
    c.parties[PS]!.funds = 0;
    termWeek(base, c);
    expect(c.parties[PS]!.funds).toBeGreaterThanOrEqual(0);
  });

  it('let the party put money into businesses and take it out at a loss', () => {
    const c = career();
    expect(invest(base, c, 2)).toBe(true);
    expect(c.career!.assets).toBe(200_000);
    expect(c.parties[PS]!.funds).toBe(280_000);
    expect(termIncome(base, c).assets).toBe(500);
    expect(invest(base, c, -1)).toBe(true);
    expect(c.parties[PS]!.funds).toBe(370_000);
    expect(invest(base, c, 99)).toBe(false);
    expect(invest(base, c, -5)).toBe(false);
  });

  it('skip ahead until something needs a decision', () => {
    const c = career();
    const ran = skipAhead(base, c, 200);
    expect(ran).toBeLessThan(200);
    expect(c.inbox).toHaveLength(1);
    expect(c.inbox[0].kind).toBe('event');
    const week = c.career!.week;
    termWeek(base, c);
    expect(c.career!.week).toBe(week); // time waits for an answer
  });
});

describe('policy', () => {
  it('starts with no effect: parties stand where they stood at the election', () => {
    const c = career();
    expect(policyEffect(c).flat().every((v) => v === 0)).toBe(true);
  });

  it('moves the blocs that care, one way or the other, and costs credibility', () => {
    const c = career();
    const cred = c.career!.credibility;
    expect(stanceCost(c, issue('values'), 1)).toEqual({ credibility: 6, unity: 2 });
    expect(setStance(c, issue('values'), 1)).toBe(true);
    syncOpinion(c);
    expect(c.career!.credibility).toBe(cred - 6);
    const nat = c.drift.support.nat;
    expect(nat[bloc('heartland')][PS]).toBeGreaterThan(0);
    expect(nat[bloc('urban_lib')][PS]).toBeLessThan(0);
    expect(nat[bloc('heartland')][PT]).toBe(0);
  });

  it('charges double for changing your mind twice in a year, and unity for leaving the party’s roots', () => {
    const c = career();
    setStance(c, issue('taxes'), 1);
    expect(stanceCost(c, issue('taxes'), 0).credibility).toBe(6);
    // Pakatan Sinar was founded on reform; walking away from it splits the party.
    expect(stanceCost(c, issue('reform'), 0).unity).toBeGreaterThan(0);
    expect(stanceCost(c, issue('reform'), 2)).toEqual({ credibility: 0, unity: 0 });
    expect(setStance(c, issue('reform'), 2)).toBe(false); // already there
    expect(setStance(c, issue('reform'), 3)).toBe(false);
  });

  it('counts promises only once they are published, and punishes ones that do not add up', () => {
    const c = career();
    expect(togglePledge(c, 'cashAid')).toBe(true);
    expect(c.career!.manifesto[PS]).toHaveLength(MAX_PLEDGES);
    expect(togglePledge(c, 'hospitals')).toBe(false); // full
    expect(policyEffect(c).flat().every((v) => v === 0)).toBe(true);
    expect(manifestoCost(c.career!.manifesto[PS])).toBeGreaterThan(FISCAL_ROOM);
    const cred = c.career!.credibility;
    expect(launchManifesto(c)).toBe(true);
    expect(c.career!.credibility).toBeLessThan(cred);
    // What a rival has copied is worth less, which is not what is tested here.
    delete c.career!.copied;
    expect(policyEffect(c)[bloc('urban_b40')][PS]).toBeGreaterThan(0);
    expect(togglePledge(c, 'cashAid')).toBe(false); // locked
    expect(launchManifesto(c)).toBe(false);
  });
});

describe('events', () => {
  it('all have words in both languages that match their choices', () => {
    for (const [id, def] of Object.entries(EVENTS)) {
      for (const text of [EVENTS_EN[id], EVENTS_MS[id]]) {
        expect(text, id).toBeDefined();
        expect(text.options, id).toHaveLength(def.choices.length);
        expect(text.results, id).toHaveLength(def.choices.length);
        def.choices.forEach((choice, i) => expect(Array.isArray(text.results[i]), `${id} choice ${i}`).toBe(!!choice.gamble));
      }
    }
    expect(Object.keys(EVENTS_EN).sort()).toEqual(Object.keys(EVENTS).sort());
    expect(Object.keys(EVENTS_MS).sort()).toEqual(Object.keys(EVENTS).sort());
  });

  it('tell stories in chapters: whatever is chosen, the next chapter arrives, and only the first comes by chance', () => {
    for (const [first, second, third] of [['papers', 'papersStory', 'papersBook'], ['bridge', 'bridgeContract', 'bridgeOpening'], ['riceShort', 'ricePrice', 'riceInquiry']]) {
      expect(EVENTS[first].weight, first).toBeGreaterThan(0);
      expect(EVENTS[second].weight, second).toBe(0);
      expect(EVENTS[third].weight, third).toBe(0);
      for (const choice of EVENTS[first].choices) expect(choice.then?.event, first).toBe(second);
      for (const choice of EVENTS[second].choices) expect(choice.then?.event, second).toBe(third);
      for (const choice of EVENTS[third].choices) expect(choice.then, third).toBeUndefined();
    }
    // Played through: the bridge goes, and two more chapters land on the desk in their turn.
    const c = career();
    resolveEvent(base, c, { id: 1, kind: 'event', from: null, event: 'bridge' }, 0);
    expect(c.career!.queue).toContainEqual({ event: 'bridgeContract', week: c.career!.week + 10 });
    const seen: string[] = [];
    for (let guard = 0; guard < 200 && seen.length < 2 && c.phase === 'term'; guard++) {
      skipAhead(base, c, 4);
      while (c.inbox.length) {
        const scene = c.inbox.shift()!;
        if (scene.event?.startsWith('bridge')) seen.push(scene.event);
        answerEvent(base, c, scene, 1);
      }
    }
    expect(seen).toEqual(['bridgeContract', 'bridgeOpening']);
  });

  it('offer only what the party can pay for, and always something that costs nothing', () => {
    const c = career();
    const pc = c.parties[c.player]!;
    for (const [id, def] of Object.entries(EVENTS)) {
      expect(def.choices.some((_, i) => choiceCost(base, id, i) === 0), id).toBe(true);
    }
    // Flood relief is paid for; the walkabout and staying away are not.
    expect(choiceCost(base, 'flood', 0)).toBe(40_000);
    pc.funds = 39_999;
    expect([0, 1, 2].map((i) => canChoose(base, c, 'flood', i))).toEqual([false, true, true]);
    pc.funds = 40_000;
    expect(canChoose(base, c, 'flood', 0)).toBe(true);
    // A by-election and the state polls are priced by the effort chosen.
    pc.funds = 0;
    expect([0, 1, 2].map((i) => canChoose(base, c, 'byElection', i))).toEqual([false, false, true]);
    expect([0, 1, 2].map((i) => canChoose(base, c, 'statePolls', i))).toEqual([false, false, true]);
  });

  it('reach only the leaders they are meant for', () => {
    const pm = career(PS), opp = career(PT);
    for (const c of [pm, opp]) { c.career!.week = 40; c.career!.quietUntil = 999; rollEvent(c, new Rng(1)); }
    expect(pm.inbox[0]?.event).toBe('budget');
    expect(opp.inbox).toHaveLength(0);
    opp.career!.week = 42;
    rollEvent(opp, new Rng(1));
    expect(opp.inbox[0]?.event).toBe('shadowBudget');
  });

  it('carry out the choice and remember what was set in motion', () => {
    const c = career();
    c.career!.orders.donors = 2;
    const funds = c.parties[PS]!.funds;
    resolveEvent(base, c, { id: 1, kind: 'event', from: null, event: 'donorFavour' }, 0);
    expect(c.parties[PS]!.funds).toBe(funds + 120_000);
    expect(c.career!.flags).toContain('owesDonor');
    expect(c.career!.queue).toEqual([{ event: 'donorLeak', week: 21 }]);
    expect(c.news.at(-1)!.key).toBe('event.donorFavour.r0');
    // The leak arrives when it is due.
    c.career!.week = 21;
    rollEvent(c, new Rng(1));
    expect(c.inbox.at(-1)!.event).toBe('donorLeak');
  });

  it('settle gambles one way or the other', () => {
    const outcomes = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const c = career(PS, seed);
      resolveEvent(base, c, { id: 1, kind: 'event', from: null, event: 'oldVideo' }, 1);
      outcomes.add(c.news.at(-1)!.key);
    }
    expect([...outcomes].sort()).toEqual(['event.oldVideo.r1l', 'event.oldVideo.r1w']);
  });
});

describe('governments', () => {
  it('carry on, weaker, when a small partner leaves', () => {
    const c = career(PT);
    c.relations[PS][LEGASI] = c.relations[LEGASI][PS] = -80;
    governmentFalls(base, c);
    expect(c.phase).toBe('term');
    expect(c.career!.government.partners).not.toContain(LEGASI);
    expect(c.career!.government.seats).toBe(140);
  });

  it('fall when a partner they cannot do without leaves, and the term resumes under whoever wins the talks', () => {
    const c = career(PT);
    c.career!.government.partners = [BP];
    c.career!.government.seats = 111;
    governmentFalls(base, c);
    expect(c.phase).toBe('formation');
    expect(c.career!.midterm).toBe(true);
    expect(c.formation!.seats).toEqual(lastElection(base).tally);
    expect(resumeTerm(c)).toBe(false); // not until the talks are over
    for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(base, c);
    const outcome = c.formation!.outcome!;
    expect(resumeTerm(c)).toBe(true);
    expect(c.phase).toBe('term');
    expect(c.career!.government).toEqual(outcome);
    expect(c.formation).toBeNull();
    expect(c.news.every((n) => n.week <= TERM_WEEKS)).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('can be brought down from a hotel room', () => {
    const fell = [1, 2, 3, 4, 5, 6].map((seed) => {
      const c = career(PT, seed);
      c.career!.government.partners = [BP];
      c.career!.government.seats = 111;
      answerEvent(base, c, { id: 1, kind: 'event', from: null, event: 'hotelNumbers' }, 0);
      return c.phase === 'formation';
    });
    expect(fell).toContain(true);
    expect(fell).toContain(false);
  });

  it('may be dissolved early, but only by their head and only after three years', () => {
    const c = career(PS);
    expect(canDissolve(c)).toBe(false);
    c.career!.week = EARLIEST_DISSOLUTION;
    expect(canDissolve(c)).toBe(true);
    const partner = career(BP);
    partner.career!.week = EARLIEST_DISSOLUTION;
    expect(dissolve(base, partner)).toBe(false);
    expect(dissolve(base, c)).toBe(true);
    expect(c.phase).toBe('campaign');
  });
});

describe('from one parliament to the next', () => {
  /** Plays a whole term on its standing orders, taking the first choice whenever asked. */
  const playTerm = (c: Campaign, world = base) => {
    for (let guard = 0; guard < 3000 && c.phase !== 'campaign'; guard++) {
      if (c.phase === 'term') { if (c.inbox.length) answerEvent(world, c, c.inbox.shift()!, 0); else skipAhead(world, c, 26); }
      else if (c.phase === 'formation') endDay(world, c);
      else if (c.phase === 'done') resumeTerm(c);
    }
  };

  it('runs a term into a campaign, with what the years built', () => {
    const c = career();
    setOrders(base, c, { focusStates: ['johor'], budget: { machinery: 2, media: 1, research: 2 } });
    const johor = base.states.indexOf('johor');
    const before = c.parties[PS]!.machinery[johor];
    playTerm(c);
    expect(c.phase).toBe('campaign');
    expect(c.week).toBe(1);
    expect(c.career!.launched).toBe(true);
    expect(c.career!.promises).toEqual(c.career!.manifesto[PS]);
    expect(c.parties[PS]!.machinery[johor]).toBeGreaterThan(before + 20);
    expect(c.career!.dossier).toBeGreaterThan(40);
    expect(c.parties[PS]!.days).toBe(7);
    expect(c.parties[PT]!.funds).toBeGreaterThan(900_000); // rivals arrive funded
    expect(c.career!.fired.length).toBeGreaterThan(10);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('makes attacks sharper with a dossier, and uses it up', () => {
    const hit = (dossier: number) => {
      const c = career();
      c.career!.week = TERM_WEEKS;
      termWeek(base, c);
      c.career!.dossier = dossier;
      c.rng = 12345;
      // Find a roll that lands, so the two cases compare like with like.
      const report = doAction(base, c, PS, 'attack', { party: PT });
      return { quality: report.quality, hurt: -c.dyn.support.nat[0][PT], left: c.career!.dossier };
    };
    const blunt = hit(0), sharp = hit(100);
    expect(sharp.left).toBe(80);
    if (blunt.quality === 'ok' && sharp.quality === 'ok') expect(sharp.hurt).toBeCloseTo(blunt.hurt * 2, 6);
    else expect(sharp.quality).toBe('ok');
  });

  it('refits the map to each election, pacts and all, and starts the next term on it', () => {
    const c = career();
    c.career!.week = TERM_WEEKS;
    termWeek(base, c);
    expect(c.phase).toBe('campaign');
    // A pact keeps some parties off the ballot this time.
    signPact(base, c, PS, LEGASI, draftPact(base, c, PS, LEGASI, 'targeted', lastElection(base)));
    const aside = Object.keys(c.standDowns);
    expect(aside.length).toBeGreaterThan(0);
    while (c.phase === 'campaign') endWeek(base, c);
    const result = electionResult(base, c)!;
    expect(nextTerm(base, c)).toBe(false); // the talks come first
    closeNight(base, c);
    for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(base, c);
    const government = c.formation!.outcome!;
    const promised = [...c.career!.manifesto[PS]];

    expect(nextTerm(base, c)).toBe(true);
    const world = worldOf(c)!;
    const k = c.career!;
    expect(world).not.toBe(base);
    expect(worldOf(c)).toBe(world); // found again, not rebuilt
    expect(k.term).toBe(2);
    expect(k.week).toBe(1);
    expect(c.phase).toBe('term');
    expect(k.government).toEqual(government);
    expect(k.promises).toEqual(promised);
    expect(k.launched).toBe(false);
    expect(c.pacts).toEqual([]);
    expect(c.standDowns).toEqual({});
    expect(c.election).toBeNull();

    // The new world remembers the election exactly as it was declared.
    expect(lastElection(world).tally).toEqual(result.tally);
    lastElection(world).seats.forEach((s, i) => expect(s.votes).toEqual(result.seats[i].votes));
    // And the model reproduces it wherever the full field stood.
    const fresh = projectElection(world, emptyDynamics());
    world.seats.forEach((s, i) => {
      if (s.basis) return;
      fresh.seats[i].votes.forEach((v, p) => expect(Math.abs(v - result.seats[i].votes[p])).toBeLessThanOrEqual(2));
    });
    // A party that stood aside last time can stand again.
    const seat = world.seatIndex.get(aside[0])!;
    expect(world.seats[seat].basis).toBeDefined();
    expect(world.baseline.contesting[seat]).toEqual(base.baseline.contesting[seat]);

    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true); // same seats and states; the results travel with the save
    termWeek(world, c);
    expect(k.week).toBe(2);
  });

  it('plays two full terms back to back', () => {
    const c = career(PT, 9);
    let world = base;
    for (const term of [1, 2]) {
      expect(c.career!.term).toBe(term);
      playTerm(c, world);
      while (c.phase === 'campaign') endWeek(world, c);
      closeNight(world, c);
      for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(world, c);
      expect(nextTerm(world, c)).toBe(true);
      world = worldOf(c)!;
      expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world)).toBe(true);
    }
    expect(c.career!.term).toBe(3);
    expect(JSON.stringify(c).length).toBeLessThan(400_000);
  });

  it('can be led by a party of Sabah or Sarawak: no majority to be had, but a say in who governs', () => {
    for (const id of ['gbk', 'gbs', 'legasi'] as const) {
      const me = PARTY_IDS.indexOf(id);
      expect(playable(base), id).toContain(me);
      const c = career(me, 11);
      let world = base;
      for (const term of [1, 2]) {
        expect(c.career!.term, id).toBe(term);
        playTerm(c, world);
        while (c.phase === 'campaign') { autoPlayWeek(world, c); endWeek(world, c); }
        // It stands only at home, so it can never reach a majority of the 222 on its own.
        expect(electionResult(world, c)!.tally[me], id).toBeGreaterThan(0);
        expect(electionResult(world, c)!.tally[me], id).toBeLessThan(majorityLine(world));
        closeNight(world, c);
        for (let day = 0; day < 10 && c.phase === 'formation'; day++) endDay(world, c);
        expect(nextTerm(world, c), id).toBe(true);
        world = worldOf(c)!;
        expect(isValidCampaign(JSON.parse(JSON.stringify(c)), world), id).toBe(true);
      }
    }
  }, 60_000);
});

void GBK; void clearDesk; void PLEDGE_IDS;
