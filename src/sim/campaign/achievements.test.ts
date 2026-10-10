import { describe, expect, it } from 'vitest';
import { getWorld, SCENARIOS } from '../../data/world';
import { N_BLOCS, PARTY_IDS } from '../types';
import { ABSURD_EVENTS, ACHIEVEMENT_GROUPS, ACHIEVEMENT_IDS, COLLECTOR_LEGACIES, earned, WIDE_REACH } from './achievements';
import { STRINGS } from '../../i18n/strings';
import { startCareer } from './career';
import { retire } from './legacy';
import { pushNews } from './news';
import { closeNight, electionResult, endWeek, newCampaign, playable } from './turn';
import type { Campaign, Difficulty, Missions, Outcome } from './types';

const [PS, BP, PT, GBK] = PARTY_IDS.map((_, i) => i);
const general = getWorld('general')!, by = getWorld('byelection')!, perak = getWorld('state:perak')!, hung = getWorld('hung')!, careerWorld = getWorld('career')!;
const career = (player = PS): Campaign => startCareer(careerWorld, { player, difficulty: 'normal', seed: 5 });

/** Plays a contest to the end of the count with the player's support pushed up or down everywhere. */
function fought(world: typeof general, push: number, difficulty: Difficulty = 'normal', player = PS): Campaign {
  const c = newCampaign(world, { player, difficulty, seed: 7 });
  for (let b = 0; b < N_BLOCS; b++) c.dyn.support.nat[b][player] = push;
  // Fix the push in place: campaign effects fade week by week, the drift does not.
  for (let b = 0; b < N_BLOCS; b++) c.drift.support.nat[b][player] += push;
  while (c.phase === 'campaign') endWeek(world, c);
  return c;
}
const outcome = (pm: number, partners: number[], extra: Partial<Outcome> = {}): Outcome =>
  ({ pm, partners, seats: 120, minority: false, stability: 60, trust: 60, deals: PARTY_IDS.map(() => null), day: 2, ...extra });

describe('achievements', () => {
  it('are not handed out for turning up', () => {
    for (const s of SCENARIOS) {
      const world = getWorld(s.id)!;
      for (const player of playable(world)) {
        const c = world.rules.career ? startCareer(world, { player, difficulty: 'hard', seed: 3 }) : newCampaign(world, { player, difficulty: 'hard', seed: 3 });
        expect(earned(world, c), `${s.id} as ${PARTY_IDS[player]}`).toEqual([]);
      }
    }
  });

  it('wait for the count to finish before announcing a result', () => {
    const c = fought(by, 4);
    expect(c.phase).toBe('night');
    expect(earned(by, c)).toEqual([]);
    closeNight(by, c);
    expect(earned(by, c)).toContain('firstWin');
    const lost = fought(by, -4);
    closeNight(by, lost);
    expect(earned(by, lost)).toEqual([]);
  });

  it('mark a state won and a country won', () => {
    const state = fought(perak, 3);
    closeNight(perak, state);
    expect(earned(perak, state)).toEqual(expect.arrayContaining(['stateWon', 'cleanHands']));
    expect(earned(perak, state)).not.toContain('majority');

    const big = fought(general, 4, 'hard');
    closeNight(general, big);
    expect(earned(general, big)).toEqual(expect.arrayContaining(['majority', 'landslide', 'sweep', 'ruthless', 'cleanHands']));
    big.parties[PS]!.tycoon = 1;
    expect(earned(general, big)).not.toContain('cleanHands');

    const routed = fought(general, -4);
    closeNight(general, routed);
    expect(earned(general, routed)).toEqual([]);
  });

  it('notice deals struck during a campaign', () => {
    const c = newCampaign(general, { player: PS, difficulty: 'normal', seed: 3 });
    c.pacts.push({ a: PS, b: GBK, week: 1 });
    expect(earned(general, c)).toEqual([]);
    c.pacts.push({ a: BP, b: PS, week: 2 });
    expect(earned(general, c)).toEqual(['pactMaker']);
    pushNews(c, { party: PS, key: 'news.court.won', tone: 'good' });
    expect(earned(general, c)).toEqual(['pactMaker', 'katak']);
  });

  it('tell the ways a government can be put together apart', () => {
    const c = newCampaign(hung, { player: PS, difficulty: 'normal', seed: 3 });
    c.formation!.outcome = outcome(PS, [BP, GBK]);
    expect(earned(hung, c)).toEqual(['hungRule', 'premier']);
    c.formation!.outcome = outcome(PS, [], { minority: true });
    expect(earned(hung, c)).toEqual(['hungRule', 'premier', 'minority']);
    c.formation!.outcome = outcome(PT, [PS]);
    expect(earned(hung, c)).toEqual(['partner', 'bedfellows']);
    c.formation!.outcome = outcome(PT, [BP]);
    expect(earned(hung, c)).toEqual([]);
    // A majority won at the ballot box is not a deal made at the Palace.
    c.formation!.outcome = outcome(PS, [], { day: 0 });
    expect(earned(hung, c)).toEqual([]);
  });

  it('follow a career', () => {
    const c = career(BP);
    const k = c.career!;
    k.government = outcome(BP, [PS], { day: 0 });
    expect(earned(careerWorld, c)).toEqual(['outsider']);
    k.term = 2;
    k.record = { ...k.record, victories: 2, toppled: 1, weeksPm: 520 };
    k.promises = ['cashAid', 'civilPay', 'settlerDebt', 'hospitals'];
    k.delivery = { cashAid: 'kept', civilPay: 'kept', settlerDebt: 'kept', hospitals: 'kept' };
    k.week = 110;
    k.economy.debt = 50;
    k.levers = [10, 60, 100];
    k.assets = 1_000_000;
    c.parties[BP]!.machinery[0] = 92;
    pushNews(c, { party: BP, key: 'news.motion.survived', tone: 'good' });
    expect(earned(careerWorld, c)).toEqual([
      'fullTerm', 'mandate', 'secondMandate', 'outsider', 'promiseKeeper', 'hawk', 'toppler', 'survivor', 'decade', 'machine', 'magnate', 'longArm',
    ]);
    k.delivery.hospitals = 'failed';
    expect(earned(careerWorld, c)).not.toContain('promiseKeeper');
  });

  it('remember how a career ended', () => {
    const c = career();
    c.career!.record.weeksPm = 2000;
    retire(c);
    expect(c.career!.ending!.score).toBeGreaterThanOrEqual(50);
    expect(earned(careerWorld, c)).toEqual(expect.arrayContaining(['bowOut', 'decade']));
    c.career!.ending = { kind: 'ousted', legacy: 'statesman', score: 80 };
    expect(earned(careerWorld, c)).toEqual(expect.arrayContaining(['statesman', 'knives']));
    expect(earned(careerWorld, c)).not.toContain('bowOut');
  });

  it('count legacies across careers for the collector', () => {
    const c = career();
    const four = ['footnote', 'premier', 'nearly', 'plotter'] as const;
    expect(four).toHaveLength(COLLECTOR_LEGACIES - 1);
    expect(earned(careerWorld, c, [...four, 'footnote'])).not.toContain('collector');
    expect(earned(careerWorld, c, [...four, 'survivor'])).toContain('collector');
    c.career!.ending = { kind: 'retired', legacy: 'conscience', score: 10 };
    expect(earned(careerWorld, c, [...four])).toContain('collector');
    // A profile's gallery counts from any game, not only a career.
    expect(earned(by, newCampaign(by, { player: PS, difficulty: 'easy', seed: 1 }), [...four, 'survivor'])).toEqual(['collector']);
  });

  it('are listed in the order they are shown', () => {
    expect(new Set(ACHIEVEMENT_IDS).size).toBe(ACHIEVEMENT_IDS.length);
    expect(ACHIEVEMENT_IDS).toHaveLength(53);
    // Every one is in a group, and shown in the group's own order.
    expect(Object.values(ACHIEVEMENT_GROUPS).flat()).toEqual([...ACHIEVEMENT_IDS]);
  });
});

describe('the newer achievements', () => {
  const won = (world: typeof general, push = 4, player = PS) => { const c = fought(world, push, 'normal', player); closeNight(world, c); return c; };

  it('name a way of winning: a shoestring, no poll of your own, an empty purse, a poll that was wrong', () => {
    const c = won(general);
    expect(earned(general, c)).toEqual(expect.arrayContaining(['shoestring', 'blindfolded']));
    expect(earned(general, c)).not.toContain('brokeVictor');
    c.parties[PS]!.funds = 100;
    expect(earned(general, c)).toContain('brokeVictor');
    c.parties[PS]!.spent = 10_000_000;
    expect(earned(general, c)).not.toContain('shoestring');
    c.polls.push({ id: 1, week: 2, scope: 'national', target: null, quality: 'quick', public: false, moe: 0.04, national: PARTY_IDS.map((_, p) => (p === PS ? 0.3 : 0.05)) });
    expect(earned(general, c)).not.toContain('blindfolded');
    // A public poll that had somebody ahead; the votes said otherwise.
    expect(earned(general, c)).not.toContain('pollsWrong');
    c.polls.push({ id: 2, week: 3, scope: 'national', target: null, quality: 'quick', public: true, moe: 0.04, national: PARTY_IDS.map((_, p) => (p === PS ? 0.2 : p === BP ? 0.4 : 0.01)) });
    expect(earned(general, c)).toContain('pollsWrong');
    // None of this for a by-election, which has no such limit to speak of, nor for a loss.
    const by1 = won(by);
    expect(earned(by, by1)).not.toEqual(expect.arrayContaining(['shoestring']));
    const lost = fought(general, -4);
    closeNight(general, lost);
    expect(earned(general, lost)).toEqual([]);
  });

  it('count exactly the seats to govern, and not one more or one fewer', () => {
    const perlis = getWorld('state:perlis')!;
    const line = Math.floor(perlis.seats.length / 2) + 1;
    const seen = new Map<number, boolean>();
    for (let push = -0.5; push <= 3 && !seen.has(line); push += 0.02) {
      const c = fought(perlis, push);
      closeNight(perlis, c);
      seen.set(electionResult(perlis, c)!.tally[PS], earned(perlis, c).includes('exactMajority'));
    }
    expect(seen.get(line), `a night with exactly ${line} seats turned up`).toBe(true);
    for (const [seats, flagged] of seen) if (seats !== line) expect(flagged, `${seats} seats`).toBe(false);
  }, 60_000);

  it('count a seat won where the party had never stood', () => {
    const c = won(general);
    const result = earned(general, c);
    expect(result).not.toContain('newGround');
        // Whether it was won depends on the night; what matters is that one entered and lost is not counted, and one won is.
    const winner = (id: string) => { c.entered = { [id]: 1000 }; return earned(general, c).includes('newGround'); };
    const wonSeat = general.seats.map((s) => s.id).find((id) => winner(id));
    expect(wonSeat).toBeDefined();
    expect(earned(general, c)).toContain('newGround');
    const lostSeat = general.seats.map((s) => s.id).find((id) => !winner(id));
    expect(lostSeat).toBeDefined();
  });

  it('are the firsts: Borneo at the top, a government made from a hung parliament, a founded party in the top job', () => {
    const h = newCampaign(hung, { player: GBK, difficulty: 'normal', seed: 3 });
    h.formation!.outcome = outcome(GBK, [PS, BP]);
    expect(earned(hung, h)).toEqual(expect.arrayContaining(['borneoTop', 'hungRule']));
    h.formation!.outcome = outcome(PS, [GBK]);
    expect(earned(hung, h)).not.toContain('borneoTop');
    const c = career(PS);
    c.career!.founded = true;
    c.career!.government = outcome(BP, [PS], { day: 0 });
    expect(earned(careerWorld, c)).not.toContain('fromNothing');
    c.career!.government = outcome(PS, [], { day: 0 });
    expect(earned(careerWorld, c)).toContain('fromNothing');
    // States held at once: not from the first day.
    const states = Object.fromEntries(careerWorld.states.slice(0, WIDE_REACH).map((st) => [st, PS]));
    const w = career(PS);
    w.career!.states = states;
    expect(earned(careerWorld, w)).not.toContain('wideReach');
    w.career!.week = 60;
    expect(earned(careerWorld, w)).toContain('wideReach');
    w.career!.states = Object.fromEntries(Object.entries(states).slice(0, WIDE_REACH - 1));
    expect(earned(careerWorld, w)).not.toContain('wideReach');
  });

  it('laugh at the country: three of its sillier stories in one career', () => {
    const c = career(PS);
    const k = c.career!;
    k.fired = [ABSURD_EVENTS[0], ABSURD_EVENTS[1], 'budget'];
    expect(earned(careerWorld, c)).not.toContain('absurd');
    k.seen = [ABSURD_EVENTS[2], 'flood'];
    expect(earned(careerWorld, c)).toContain('absurd');
    k.fired = []; k.seen = [ABSURD_EVENTS[0], ABSURD_EVENTS[0], ABSURD_EVENTS[1]];
    expect(earned(careerWorld, c)).not.toContain('absurd');
  });

  it('are the ways of working together: a big tent, five parties at a table, a merger, national unity, an alliance', () => {
    const c = newCampaign(general, { player: PS, difficulty: 'normal', seed: 3 });
    c.pacts.push({ a: PS, b: GBK, week: 1 }, { a: BP, b: PS, week: 2 });
    expect(earned(general, c)).not.toContain('bigTent');
    c.pacts.push({ a: PS, b: PT, week: 3 });
    expect(earned(general, c)).toEqual(expect.arrayContaining(['pactMaker', 'bigTent']));
    const g = newCampaign(hung, { player: PS, difficulty: 'normal', seed: 3 });
    g.formation!.outcome = outcome(PS, [BP, PT, GBK]);
    expect(earned(hung, g)).not.toContain('rainbow');
    g.formation!.outcome = outcome(PS, [BP, PT, GBK, PARTY_IDS.indexOf('gbs')]);
    expect(earned(hung, g)).toContain('rainbow');
    const k = career(PS);
    expect(earned(careerWorld, k)).toEqual([]);
    k.career!.merged = [GBK];
    k.career!.grand = { until: 100, members: [PS, BP] };
    k.career!.alliance = { name: 0, mark: 0, members: [PS, BP] };
    expect(earned(careerWorld, k)).toEqual(expect.arrayContaining(['merged', 'unityGov']));
    expect(earned(careerWorld, k)).not.toContain('alliance');
    k.career!.alliance.members = [PS, BP, PT];
    expect(earned(careerWorld, k)).toContain('alliance');
  });

  it('are the missions: the first, ten, one of each kind, and a hard one', () => {
    const c = career(PS);
    const m: Missions = { active: [], offers: [], seq: 0, done: [], unseen: [] };
    c.career!.missions = m;
    const record = (won: boolean) => ({ kind: 'seize' as const, main: true, tier: 1 as const, won, term: 1, need: 1 });
    m.done = [record(false)];
    expect(earned(careerWorld, c)).toEqual([]);
    m.done.push(record(true));
    expect(earned(careerWorld, c)).toEqual(['firstMission']);
    m.done = Array.from({ length: 10 }, () => record(true));
    expect(earned(careerWorld, c)).toContain('tenMissions');
    m.firsts = ['seize', 'hold', 'bloc'];
    expect(earned(careerWorld, c)).not.toContain('fullHouse');
    m.firsts.push('majority');
    m.hard = true;
    expect(earned(careerWorld, c)).toEqual(expect.arrayContaining(['fullHouse', 'hardMission']));
  });

  it('are described in both languages, with a heading for each group, so that none shows its key', () => {
    for (const lang of ['en', 'ms'] as const) {
      for (const id of ACHIEVEMENT_IDS) { expect(STRINGS[lang][`ach.${id}`], `${lang} ${id}`).toBeTruthy(); expect(STRINGS[lang][`ach.${id}.desc`], `${lang} ${id} desc`).toBeTruthy(); }
      for (const group of Object.keys(ACHIEVEMENT_GROUPS)) expect(STRINGS[lang][`ach.group.${group}`], `${lang} ${group}`).toBeTruthy();
    }
    // Nothing is hidden: every one is listed from the first day.
    expect(ACHIEVEMENT_IDS.length).toBeGreaterThan(50);
  });
});

