import { describe, expect, it } from 'vitest';
import { getWorld, worldOf } from '../../data/world';
import { majorityLine } from '../election';
import { Rng } from '../rng';
import { PARTY_IDS } from '../types';
import { answerEvent, beginCampaign, nextTerm, resumeTerm, skipAhead, startCareer, termWeek } from './career';
import { holderOf, seatsHeldBy } from './contests';
import { endDay } from './formation';
import {
  abandonMission, acceptMission, declineMission, dearToLose, ELECTIONS_FOR, isMain, missionsElection, missionsOf, missionsWeek, offerMain,
  finalOpen, FINAL_ELECTIONS, EXTENSION, MAIN_OFFER_WAIT, OFFER_WARN, SIDE_WEEKS, penaltyOf, progressOf, rewardOf, seenMissions, SIDE_OFFER_WAIT,
} from './missions';
import { earned } from './achievements';
import { translate } from '../../i18n/strings';
import { missionGoal } from '../../ui/missionText';
import { missionCard } from '../../ui/ShareDialog';
import type { Format, T } from '../../ui/hooks';
import { closeNight, endWeek } from './turn';
import { MISSION_KINDS, type Campaign, type Mission } from './types';
import { isValidCampaign } from './validate';

const [PS, BP, PT] = PARTY_IDS.map((_, i) => i);
const base = getWorld('career')!;
const career = (player = PS, seed = 5, world = base): Campaign => { const c = startCareer(world, { player, difficulty: 'normal', seed }); offerMain(world, c); return c; };

/** Plays the years between elections without choosing anything in particular, up to the day parliament is dissolved. */
function toCampaign(c: Campaign): void {
  for (let g = 0; g < 4000 && c.phase !== 'campaign' && !c.career!.ending; g++) {
    const world = worldOf(c)!;
    if (c.phase === 'term') { if (c.inbox.length) answerEvent(world, c, c.inbox.shift()!, 2); else skipAhead(world, c, 13); }
    else if (c.phase === 'formation') endDay(world, c);
    else if (c.phase === 'done') resumeTerm(c);
  }
}
/** Fights the election through, and moves to the next parliament. */
function throughElection(c: Campaign): void {
  let world = worldOf(c)!;
  while (c.phase === 'campaign') endWeek(world, c);
  closeNight(world, c);
  for (let d = 0; d < 30 && c.phase === 'formation'; d++) endDay(world, c);
  expect(nextTerm(world, c)).toBe(true);
}

describe('the missions on offer', () => {
  it('are drawn when a career opens, one of a kind, and are the same every time for the same career', () => {
    const c = career(BP);
    const m = c.career!.missions!;
    expect(m.offers.length).toBeGreaterThanOrEqual(2);
    expect(new Set(m.offers.map((o) => o.kind)).size).toBe(m.offers.length);
    for (const o of m.offers) {
      expect(isMain(o.kind) && o.main, o.kind).toBe(true);
      expect([1, 2, 3]).toContain(o.tier);
      expect(o.elections).toBe(ELECTIONS_FOR(o.tier));
    }
    expect(m.active).toEqual([]);
    expect(career(BP).career!.missions).toEqual(m);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('ask for seats that are in reach and seats that are held, never the other way about', () => {
    for (const player of [PS, BP, PT]) {
      const c = career(player);
      const k = c.career!;
      for (const o of k.missions!.offers) {
        if (o.kind === 'seize') {
          expect(o.seats!.length).toBeGreaterThan(0);
          expect(o.need).toBeLessThanOrEqual(o.seats!.length);
          for (const id of o.seats!) expect(holderOf(base, c, id), `${PARTY_IDS[player]} ${id}`).not.toBe(player);
        }
        if (o.kind === 'hold') {
          expect(o.need).toBeLessThanOrEqual(o.seats!.length);
          const mine = new Set(seatsHeldBy(base, c, player));
          for (const id of o.seats!) expect(mine.has(id), `${PARTY_IDS[player]} ${id}`).toBe(true);
        }
        if (o.kind === 'majority') expect(o.need).toBe(majorityLine(base));
      }
    }
  });

  it('are asked for in proportion to a state assembly, which has far fewer seats than the Dewan Rakyat', () => {
    const perlis = getWorld('career:perlis')!;
    const c = career(PS, 5, perlis);
    for (const o of c.career!.missions?.offers ?? []) if (o.seats) expect(o.seats.length).toBeLessThanOrEqual(perlis.seats.length);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), perlis)).toBe(true);
  });

  it('are drawn once for each parliament, and what was not taken is withdrawn at the next', () => {
    const c = career(BP);
    const m = c.career!.missions!;
    const first = m.offers.map((o) => o.id);
    offerMain(base, c);
    expect(m.offers.map((o) => o.id)).toEqual(first);
    // Take one, leave the rest; the next parliament withdraws the rest and offers afresh.
    expect(acceptMission(c, first[0])).toBe(true);
    toCampaign(c);
    throughElection(c);
    offerMain(worldOf(c)!, c);
    const later = c.career!.missions!;
    expect(later.offered).toBe(c.career!.term);
    expect(later.offers.every((o) => !first.includes(o.id))).toBe(true);
    expect(later.active.length + later.done.length).toBeGreaterThanOrEqual(1);
  }, 120_000);
});

describe('taking a mission on', () => {
  it('moves it from the offers to the missions running, or turns it away', () => {
    const c = career(BP);
    const m = missionsOf(c);
    const [a, b] = m.offers;
    expect(acceptMission(c, a.id)).toBe(true);
    expect(m.active.map((x) => x.id)).toEqual([a.id]);
    expect(m.offers.some((o) => o.id === a.id)).toBe(false);
    expect(acceptMission(c, a.id)).toBe(false);
    expect(declineMission(c, b.id)).toBe(true);
    expect(declineMission(c, b.id)).toBe(false);
    expect(acceptMission(c, 9999)).toBe(false);
  });

  it('can be abandoned, which counts as a failure and costs what failing costs', () => {
    const c = career(BP);
    const k = c.career!;
    const m = missionsOf(c);
    const hold = m.offers.find((o) => o.kind === 'hold') ?? m.offers[0];
    acceptMission(c, hold.id);
    const cred = k.credibility;
    expect(abandonMission(base, c, hold.id)).toBe(true);
    expect(m.active).toEqual([]);
    expect(m.done.at(-1)).toMatchObject({ kind: hold.kind, won: false });
    expect(k.credibility).toBeLessThan(cred);
    expect(m.unseen).toHaveLength(1);
    seenMissions(c);
    expect(m.unseen).toEqual([]);
    expect(abandonMission(base, c, hold.id)).toBe(false);
  });

  it('cost more to lose the more they asked, and the dear kinds cost most', () => {
    // The final mission has the one tier, the highest.
    for (const kind of MISSION_KINDS.filter((k) => k !== 'final')) {
      const cost = (tier: 1 | 2 | 3) => penaltyOf({ kind, tier }).reduce((a, e) => a + (e.t === 'cred' ? -(e as { n: number }).n : 0), 0);
      expect(cost(3), kind).toBeGreaterThan(cost(1));
    }
    expect(dearToLose('hold') && dearToLose('majority')).toBe(true);
    expect(dearToLose('seize') || dearToLose('bloc') || dearToLose('unity')).toBe(false);
    expect(penaltyOf({ kind: 'hold', tier: 1 }).length).toBeGreaterThan(penaltyOf({ kind: 'seize', tier: 1 }).length);
    const money = (tier: 1 | 2 | 3) => (rewardOf({ kind: 'seize', tier, main: true }).find((e) => e.t === 'funds') as { n: number }).n;
    expect(money(3)).toBeGreaterThan(money(1));
  });
});

describe('side missions', () => {
  it('come along in a term, run for weeks, are won when the thing is reached and lost when the weeks run out', () => {
    const c = career(PS, 7);
    const k = c.career!;
    const m = missionsOf(c);
    m.offers = [];
    // Weeks pass until an errand comes; the draw is the game's own.
    for (let i = 0; i < 200 && !m.offers.some((o) => !o.main) && c.phase === 'term'; i++) { if (c.inbox.length) c.inbox = []; termWeek(base, c); }
    const offer = m.offers.find((o) => !o.main);
    expect(offer, 'a side mission is offered within four years').toBeDefined();
    expect(offer!.weeks).toBeGreaterThan(0);
    expect(offer!.ttl).toBeLessThanOrEqual(SIDE_OFFER_WAIT);
    expect(acceptMission(c, offer!.id)).toBe(true);
    const mine = m.active[0];
    expect(mine.ttl).toBeUndefined();
    // Lost when the weeks run out without it.
    const unreachable: Mission = { ...mine, need: 999_999_999 };
    m.active = [{ ...unreachable, weeks: 2 }];
    const rng = new Rng(1);
    missionsWeek(base, c, rng);
    expect(m.active).toHaveLength(1);
    // Out of time, it is given a second wind once, and the leader is told.
    missionsWeek(base, c, rng);
    expect(m.active).toHaveLength(1);
    expect(m.active[0].extended).toBe(true);
    expect(m.active[0].weeks).toBe(Math.round(SIDE_WEEKS[mine.tier - 1] * EXTENSION));
    expect(c.news.some((n) => n.key === 'news.mission.extended')).toBe(true);
    // Then it is lost when that runs out too.
    m.active[0].weeks = 1;
    missionsWeek(base, c, rng);
    expect(m.active).toEqual([]);
    expect(m.done.at(-1)).toMatchObject({ kind: mine.kind, won: false });
    // Won as soon as it is reached.
    const reached: Mission = { ...mine, id: 777, need: 0, weeks: 30 };
    m.active = [reached];
    const funds = c.parties[c.player]!.funds;
    missionsWeek(base, c, rng);
    expect(m.active).toEqual([]);
    expect(m.done.at(-1)).toMatchObject({ kind: mine.kind, won: true });
    expect(c.parties[c.player]!.funds + k.credibility).toBeGreaterThan(funds);
  });

  it('are offered only two at a time, and an offer not taken is withdrawn', () => {
    const c = career(PS, 7);
    const m = missionsOf(c);
    m.offers = [];
    for (let i = 0; i < 600 && c.phase === 'term'; i++) { if (c.inbox.length) c.inbox = []; termWeek(base, c); expect([...m.active, ...m.offers].filter((o) => !o.main).length).toBeLessThanOrEqual(2); }
    m.offers = m.offers.filter((o) => !o.main).map((o) => ({ ...o, ttl: 2 }));
    const n = m.offers.length;
    if (n > 0) {
      missionsWeek(base, c, new Rng(3));
      missionsWeek(base, c, new Rng(3));
      expect(m.offers.filter((o) => o.ttl !== undefined && o.ttl <= 0)).toEqual([]);
    }
  });
});

describe('the time to decide', () => {
  it('is set on every main offer, warns when it is close, and lets a mission lapse that was never answered', () => {
    const c = career(PS, 7);
    const m = missionsOf(c);
    const main = m.offers.filter((o) => o.main);
    expect(main.length).toBeGreaterThan(1);
    for (const o of main) expect(o.ttl).toBe(MAIN_OFFER_WAIT);
    // One is taken in good time and keeps no deadline; the rest are left.
    const [taken, ...left] = main;
    expect(acceptMission(c, taken.id)).toBe(true);
    expect(m.active.find((a) => a.id === taken.id)!.ttl).toBeUndefined();
    const rng = new Rng(1);
    for (let w = 0; w < MAIN_OFFER_WAIT - OFFER_WARN; w++) missionsWeek(base, c, rng);
    expect(m.offers.filter((o) => o.main)).toHaveLength(left.length);
    expect(c.news.some((n) => n.key === 'news.mission.closing')).toBe(true);
    expect(c.news.some((n) => n.key === 'news.mission.lapsed')).toBe(false);
    for (let w = 0; w < OFFER_WARN; w++) missionsWeek(base, c, rng);
    expect(m.offers.filter((o) => o.main)).toEqual([]);
    expect(c.news.filter((n) => n.key === 'news.mission.lapsed')).toHaveLength(left.length);
    // The one that was taken is still running.
    expect(m.active.some((a) => a.id === taken.id)).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('leaves an offer saved before the deadline existed alone', () => {
    const c = career(PS, 7);
    const m = missionsOf(c);
    for (const o of m.offers) delete o.ttl;
    const rng = new Rng(1);
    for (let w = 0; w < 60; w++) missionsWeek(base, c, rng);
    expect(m.offers.filter((o) => o.main).length).toBeGreaterThan(1);
  });
});

describe('judging at an election', () => {
  /** A career with one mission of the kind taken on, judged against a made-up result. */
  const taken = (kind: Mission['kind'], extra: Partial<Mission> = {}) => {
    const c = career(PS);
    const m = missionsOf(c);
    m.offers = [];
    const mission: Mission = { id: 50, kind, main: true, tier: 2, need: 1, elections: 1, ...extra };
    m.active = [mission];
    return { c, m, mission };
  };
  const winnersWith = (c: Campaign, ids: string[], who: number) => base.seats.map((s, i) => (ids.includes(s.id) ? who : lastWinner(c, i)));
  const lastWinner = (c: Campaign, i: number) => holderOf(base, c, base.seats[i].id);
  const gov = (c: Campaign, over: Partial<NonNullable<Campaign['career']>['government']> = {}) => ({ ...c.career!.government, ...over });

  it('wins a mission to take seats when enough of them are won, and loses it when they are not', () => {
    const { c, mission } = taken('seize');
    const rivalSeats = base.seats.filter((s) => holderOf(base, c, s.id) !== PS).slice(0, 3).map((s) => s.id);
    Object.assign(mission, { seats: rivalSeats, need: 2 });
    missionsElection(base, c, gov(c), winnersWith(c, rivalSeats.slice(0, 2), PS));
    expect(missionsOf(c).done.at(-1)).toMatchObject({ kind: 'seize', won: true });

    const lost = taken('seize');
    Object.assign(lost.mission, { seats: rivalSeats, need: 2 });
    const cred = lost.c.career!.credibility;
    missionsElection(base, lost.c, gov(lost.c), winnersWith(lost.c, rivalSeats.slice(0, 1), PS));
    expect(missionsOf(lost.c).done.at(-1)).toMatchObject({ kind: 'seize', won: false });
    expect(lost.c.career!.credibility).toBeLessThan(cred);
  });

  it('gives a hard mission a second election, and wins it at the second', () => {
    const { c, m, mission } = taken('seize', { tier: 3, elections: 2 });
    const rivalSeats = base.seats.filter((s) => holderOf(base, c, s.id) !== PS).slice(0, 2).map((s) => s.id);
    Object.assign(mission, { seats: rivalSeats, need: 2 });
    missionsElection(base, c, gov(c), winnersWith(c, [], PS));
    expect(m.active).toHaveLength(1);
    expect(m.active[0].elections).toBe(1);
    missionsElection(base, c, gov(c), winnersWith(c, rivalSeats, PS));
    expect(m.active).toEqual([]);
    expect(m.done.at(-1)).toMatchObject({ won: true });
  });

  it('loses a mission to hold seats at the first election they are not held, and wins it only when every election has passed', () => {
    const { c, m, mission } = taken('hold', { tier: 3, elections: 2 });
    const mine = seatsHeldBy(base, c, PS).slice(0, 3);
    Object.assign(mission, { seats: mine, need: 2 });
    missionsElection(base, c, gov(c), winnersWith(c, mine, PS));
    expect(m.active).toHaveLength(1);
    missionsElection(base, c, gov(c), winnersWith(c, mine, PS));
    expect(m.done.at(-1)).toMatchObject({ kind: 'hold', won: true });

    const lost = taken('hold', { tier: 3, elections: 2 });
    Object.assign(lost.mission, { seats: mine, need: 2 });
    missionsElection(base, lost.c, gov(lost.c), winnersWith(lost.c, mine, BP));
    expect(missionsOf(lost.c).done.at(-1)).toMatchObject({ kind: 'hold', won: false });
  });

  it('wins a mission to govern with others when the government has enough parties, or the one named', () => {
    const { c, mission } = taken('bloc', { need: 3 });
    missionsElection(base, c, gov(c, { pm: PS, partners: [BP, PT] }), []);
    expect(missionsOf(c).done.at(-1)).toMatchObject({ kind: 'bloc', won: true });
    const two = taken('bloc', { need: 3 });
    missionsElection(base, two.c, gov(two.c, { pm: PS, partners: [BP] }), []);
    expect(missionsOf(two.c).done.at(-1)).toMatchObject({ kind: 'bloc', won: false });
    const named = taken('bloc', { need: 2, party: PT });
    missionsElection(base, named.c, gov(named.c, { pm: PS, partners: [PT] }), []);
    expect(missionsOf(named.c).done.at(-1)).toMatchObject({ won: true });
    // In opposition, it is not won by someone else's government.
    const out = taken('bloc', { need: 2 });
    missionsElection(base, out.c, gov(out.c, { pm: BP, partners: [PT] }), []);
    expect(missionsOf(out.c).done.at(-1)).toMatchObject({ won: false });
    void mission;
  });

  it('wins a mission for a majority of the party’s own, or for heading a government with one', () => {
    const line = majorityLine(base);
    const alone = taken('majority', { alone: true, need: line });
    const all = base.seats.map((s) => s.id);
    missionsElection(base, alone.c, gov(alone.c), winnersWith(alone.c, all.slice(0, line), PS));
    expect(missionsOf(alone.c).done.at(-1)).toMatchObject({ kind: 'majority', won: true });
    const short = taken('majority', { alone: true, need: line });
    missionsElection(base, short.c, gov(short.c), winnersWith(short.c, all.slice(0, line - 1), PS).map((w, i) => (i >= line - 1 && w === PS ? BP : w)));
    expect(missionsOf(short.c).done.at(-1)).toMatchObject({ won: false });
    const lead = taken('majority', { alone: false, need: line });
    missionsElection(base, lead.c, gov(lead.c, { pm: PS, minority: true }), []);
    expect(missionsOf(lead.c).done.at(-1)).toMatchObject({ won: false });
    const lead2 = taken('majority', { alone: false, need: line });
    missionsElection(base, lead2.c, gov(lead2.c, { pm: PS, minority: false }), []);
    expect(missionsOf(lead2.c).done.at(-1)).toMatchObject({ won: true });
  });
});

describe('through a whole career', () => {
  it('are carried into the next parliament, judged by the election, shown once, and stay a valid save', () => {
    const c = career(BP, 11);
    const m = missionsOf(c);
    for (const o of [...m.offers]) acceptMission(c, o.id);
    const taken = m.active.length;
    expect(taken).toBeGreaterThanOrEqual(2);
    toCampaign(c);
    expect(c.phase).toBe('campaign');
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), worldOf(c)!)).toBe(true);
    throughElection(c);
    const after = c.career!.missions!;
    // Each main mission ran for one election or two: the ones of one election are settled now.
    const settled = after.done.length;
    expect(settled).toBeGreaterThan(0);
    expect(after.active.length + settled).toBe(taken);
    expect(after.unseen.length).toBe(settled);
    expect(after.done.every((r) => r.term === 1)).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), worldOf(c)!)).toBe(true);
    // The player is told in the news, too.
    expect(c.news.some((n) => n.key === 'news.mission.won' || n.key === 'news.mission.lost')).toBe(true);
    // And a new parliament brings new offers, drawn for it.
    offerMain(worldOf(c)!, c);
    expect(after.offered).toBe(2);
    expect(after.offers.length).toBeGreaterThan(0);
  }, 120_000);

  it('can all be offered, taken and judged through four parliaments without breaking anything', () => {
    for (const [player, seed] of [[PS, 3], [PT, 4], [BP, 5]] as const) {
      const c = career(player, seed);
      for (let term = 0; term < 3 && !c.career!.ending; term++) {
        const k = c.career!;
        for (const o of [...(k.missions?.offers ?? [])]) acceptMission(c, o.id);
        toCampaign(c);
        if (c.career!.ending) break;
        throughElection(c);
        offerMain(worldOf(c)!, c);
        expect(isValidCampaign(JSON.parse(JSON.stringify(c)), worldOf(c)!), `${PARTY_IDS[player]} term ${term + 1}`).toBe(true);
        for (const a of c.career!.missions!.active) {
          const p = progressOf(worldOf(c)!, c, a);
          expect(Number.isFinite(p.have) && Number.isFinite(p.need), a.kind).toBe(true);
        }
      }
      const done = c.career!.missions?.done ?? [];
      expect(done.length, `${PARTY_IDS[player]} ended some missions`).toBeGreaterThan(0);
      void beginCampaign;
    }
  }, 300_000);
});

describe('what a mission says', () => {
  const t: T = (key, vars) => translate('en', key, vars);
  const f = { rm: (n: number) => `RM${n}` } as Format;
  it('closes a sentence cleanly where no time is given, and says when where it is', () => {
    const bloc = { kind: 'bloc' as const, need: 5 };
    expect(missionGoal(t, f, bloc, '')).toBe('Govern with 5 parties or more, yours included.');
    expect(missionGoal(t, f, { kind: 'majority', need: 112, alone: true }, '')).toBe('Win 112 seats of your own, a majority of the House.');
    expect(missionGoal(t, f, { ...bloc, elections: 1 })).toBe('Govern with 5 parties or more, yours included, at the next election.');
    expect(missionGoal(t, f, { kind: 'credibility', need: 70, weeks: 1 })).toBe('Raise the party’s credibility to 70 within 1 week.');
    expect(missionGoal(t, f, { kind: 'funds', need: 900_000, weeks: 26 })).toBe('Build the party’s funds up to RM900000 within 26 weeks.');
  });
});

describe('the card for a mission won', () => {
  const t: T = (key, vars) => translate('en', key, vars);
  const f = { rm: (n: number) => `RM${(n / 1000).toFixed(0)}k`, int: (n: number) => String(n), pct: (n: number) => `${Math.round(n * 100)}%` } as Format;
  const wonCard = (kind: Mission['kind'], extra: Partial<Mission> = {}) => {
    const c = career(BP);
    const m = missionsOf(c);
    m.offers = [];
    m.active = [{ id: 1, kind, main: true, tier: 2, need: 0, elections: 1, ...extra }];
    missionsElection(base, c, { ...c.career!.government, pm: BP, partners: [PS, PT], minority: false }, base.seats.map(() => BP));
    return { c, record: m.done.at(-1)! };
  };

  it('has the figure the mission asked for, what it was, and the record, for any kind', () => {
    const seize = wonCard('seize', { need: 3, seats: base.seats.slice(0, 4).map((s) => s.id) });
    const card = missionCard(t, f, seize.c, seize.record);
    expect(card.headline).toBe('Mission accomplished');
    expect(card.hero).toMatchObject({ value: '3', label: 'seats won', sub: 'Take seats from rivals' });
    expect(card.stats).toHaveLength(4);
    expect(card.stats.map((x) => x.label)).toEqual(expect.arrayContaining(['Missions won', 'Missions failed']));
    expect(card.body).toContain('Win 3 of these 4 seats');
    expect(card.portrait).toBeDefined();
    expect(missionCard(t, f, ...Object.values(wonCard('majority', { alone: false })) as [Campaign, never]).hero.value).toBe('✓');
    const bloc = wonCard('bloc', { need: 3 });
    expect(missionCard(t, f, bloc.c, bloc.record).hero).toMatchObject({ value: '3', label: 'parties in government' });
  });

  it('shows the parts of the final mission', () => {
    const c = career(BP);
    const record = { kind: 'final' as const, main: true, tier: 3 as const, won: true, term: 2, need: 4, parts: [
      { kind: 'seize' as const, need: 2, done: true }, { kind: 'hold' as const, need: 2, done: true }, { kind: 'bloc' as const, need: 3, done: true }, { kind: 'majority' as const, need: 112, alone: true, done: true },
    ] };
    const card = missionCard(t, f, c, record);
    expect(card.headline).toBe('The final mission is done');
    expect(card.hero.value).toBe('4/4');
    expect(card.badges).toContain('Final mission');
  });
});

describe('the final mission', () => {
  const wonKinds = (c: Campaign, kinds: Mission['kind'][], hard = true) => {
    const m = missionsOf(c);
    m.firsts = [...kinds];
    m.hard = hard;
  };
  const openFinal = (c: Campaign) => { const m = missionsOf(c); m.offered = undefined; offerMain(base, c); return m.offers.find((o) => o.kind === 'final'); };

  it('opens only for a leader who has won each of the four kinds, one of them a hard one', () => {
    const c = career(BP);
    expect(finalOpen(missionsOf(c))).toBe(false);
    wonKinds(c, ['seize', 'hold', 'bloc'], true);
    expect(finalOpen(missionsOf(c))).toBe(false);
    wonKinds(c, ['seize', 'hold', 'bloc', 'majority'], false);
    expect(finalOpen(missionsOf(c))).toBe(false);
    expect(openFinal(c)).toBeUndefined();
    wonKinds(c, ['seize', 'hold', 'bloc', 'majority'], true);
    expect(finalOpen(missionsOf(c))).toBe(true);
    const f = openFinal(c)!;
    expect(f).toBeDefined();
    expect(f.main && f.tier === 3 && f.elections === FINAL_ELECTIONS).toBe(true);
    expect(f.parts!.length).toBeGreaterThanOrEqual(3);
    expect(f.parts!.map((p) => p.kind)).toEqual(expect.arrayContaining(['bloc', 'majority']));
    expect(f.parts!.every((p) => !p.done)).toBe(true);
    expect(c.news.some((n) => n.key === 'news.mission.final')).toBe(true);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
  });

  it('is the dearest to lose and the best paid, and is offered again at each parliament until it is won', () => {
    expect(dearToLose('final')).toBe(true);
    const cred = (e: ReturnType<typeof rewardOf>) => (e.find((x) => x.t === 'cred') as { n: number }).n;
    expect(cred(rewardOf({ kind: 'final', tier: 3, main: true }))).toBeGreaterThan(cred(rewardOf({ kind: 'seize', tier: 3, main: true })));
    const lose = (k: Mission['kind']) => penaltyOf({ kind: k, tier: 3 }).reduce((a, e) => a + (e.t === 'cred' ? (e as { n: number }).n : 0), 0);
    expect(lose('final')).toBeLessThan(lose('hold'));
    const c = career(BP);
    wonKinds(c, ['seize', 'hold', 'bloc', 'majority']);
    const f = openFinal(c)!;
    // Turned down, it comes round again.
    declineMission(c, f.id);
    expect(missionsOf(c).offers.some((o) => o.kind === 'final')).toBe(false);
    expect(openFinal(c)).toBeDefined();
  });

  it('is won when every part is done, with the seats to keep kept at the election that finishes it, and puts the career into free play', () => {
    const c = career(BP);
    wonKinds(c, ['seize', 'hold', 'bloc', 'majority']);
    const f = openFinal(c)!;
    acceptMission(c, f.id);
    const m = missionsOf(c);
    const mine = seatsHeldBy(base, c, BP);
    const rival = base.seats.filter((s) => holderOf(base, c, s.id) !== BP).slice(0, 4).map((s) => s.id);
    m.active[0].parts = [
      { kind: 'seize', seats: rival, need: 2, done: false },
      { kind: 'hold', seats: mine.slice(0, 3), need: 3, done: false },
      { kind: 'bloc', need: 3, done: false },
      { kind: 'majority', need: majorityLine(base), alone: true, done: false },
    ];
    const line = majorityLine(base);
    const all = base.seats.map((s) => s.id);
    const winners = (ids: string[], who: number, rest = BP) => base.seats.map((s) => (ids.includes(s.id) ? who : rest));
    const gov = (partners: number[], pm = BP) => ({ ...c.career!.government, pm, partners });
    // The first election: some parts are done (a coalition of three, some seats taken), not all.
    missionsElection(base, c, gov([PS, PT]), winners(rival.slice(0, 2), BP, PS));
    const after1 = m.active[0];
    expect(after1.parts!.find((p) => p.kind === 'seize')!.done).toBe(true);
    expect(after1.parts!.find((p) => p.kind === 'bloc')!.done).toBe(true);
    expect(after1.parts!.find((p) => p.kind === 'majority')!.done).toBe(false);
    expect(m.active).toHaveLength(1);
    // The second: a majority of its own, and the seats kept.
    missionsElection(base, c, gov([]), winners(all.slice(0, line), BP, PS).map((w, i) => (mine.slice(0, 3).includes(base.seats[i].id) ? BP : w)));
    expect(m.active).toEqual([]);
    expect(m.done.at(-1)).toMatchObject({ kind: 'final', won: true });
    expect(m.free).toBe(true);
    expect(m.offers).toEqual([]);
    expect(m.unseen.at(-1)!.parts!.length).toBe(4);
    // Free play: nothing more is offered, a side errand included.
    m.offered = undefined;
    offerMain(base, c);
    expect(m.offers).toEqual([]);
    for (let i = 0; i < 200 && c.phase === 'term'; i++) { if (c.inbox.length) c.inbox = []; termWeek(base, c); }
    expect(m.offers).toEqual([]);
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), base)).toBe(true);
    expect(earned(base, c)).toContain('finalMission');
  });

  it('is lost when its two elections are used up, and a hold that is not kept at the winning election does not win it', () => {
    const c = career(BP);
    wonKinds(c, ['seize', 'hold', 'bloc', 'majority']);
    acceptMission(c, openFinal(c)!.id);
    const m = missionsOf(c);
    const mine = seatsHeldBy(base, c, BP);
    m.active[0].parts = [
      { kind: 'hold', seats: mine.slice(0, 3), need: 3, done: false },
      { kind: 'bloc', need: 3, done: false },
    ];
    const gov = { ...c.career!.government, pm: BP, partners: [PS, PT] };
    const lost = base.seats.map((s) => (mine.slice(0, 3).includes(s.id) ? PS : BP));
    missionsElection(base, c, gov, lost);
    expect(m.active).toHaveLength(1);
    expect(m.active[0].parts!.find((p) => p.kind === 'bloc')!.done).toBe(true);
    const cred = c.career!.credibility;
    missionsElection(base, c, gov, lost);
    expect(m.active).toEqual([]);
    expect(m.done.at(-1)).toMatchObject({ kind: 'final', won: false });
    expect(m.free).toBeUndefined();
    expect(c.career!.credibility).toBeLessThan(cred);
  });

  it('is unlocked through play: winning a hard main mission of each kind records it', () => {
    const c = career(BP);
    const m = missionsOf(c);
    m.offers = [];
    const kinds: Mission['kind'][] = ['seize', 'hold', 'bloc', 'majority'];
    kinds.forEach((kind, i) => {
      m.active = [{ id: 900 + i, kind, main: true, tier: i === 0 ? 3 : 1, need: 0, elections: 1, seats: [], alone: false, party: undefined }];
      // Need 0 of nothing: met whatever the result, as for a government of anyone.
      missionsElection(base, c, { ...c.career!.government, pm: BP, partners: [PS, PT], minority: false }, base.seats.map(() => BP));
    });
    expect(m.firsts).toEqual(expect.arrayContaining(kinds));
    expect(m.hard).toBe(true);
    expect(finalOpen(m)).toBe(true);
  });
});
