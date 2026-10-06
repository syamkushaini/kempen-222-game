import { describe, expect, it } from 'vitest';
import { getWorld } from '../../data/world';
import { PARTY_IDS } from '../types';
import { BLOC_IDS } from '../types';
import { doAction, effectiveDynamics, spendingLimit, truth } from './actions';
import { candidateDeadline, candidatesWeek, canChoose, choose, HOPEFULS, liftIn, vetHopeful } from './candidates';
import { answerEvent, resumeTerm, skipAhead, startCareer, termIncome, termSpending, termWeek } from './career';
import { EVENTS } from './events';
import { endDay } from './formation';
import { LEADER_STATS, TEMPER } from './cast';
import { relation } from './diplomacy';
import { canCourtEndorser, courtChance, courtEndorser, endorsersWeek, hasEndorsers, holder } from './endorsers';
import { BACKSTORIES, edge, stat } from './leader';
import { coverage, hireTroopers, interview, interviewOdds, mediaWeek, usualCoverage } from './media';
import { probeChance, spendingWeek } from './spending';
import { dismiss, hire, managerDays, staffWeek, vet, wages } from './staff';
import { autoPlayWeek, endWeek, newCampaign, playerPoll, playerPollCost, startingFunds, weeklyIncome } from './turn';
import { Rng } from '../rng';
import { BACKSTORY_IDS, ENDORSER_IDS, OUTLET_IDS, ROLE_IDS, type BackstoryId, type Campaign } from './types';
import { isValidCampaign } from './validate';

const [PS, BP, PT, GBK] = PARTY_IDS.map((_, i) => i);
const general = getWorld('general')!, by = getWorld('byelection')!, perak = getWorld('state:perak')!, hung = getWorld('hung')!, careerWorld = getWorld('career')!;
const game = (backstory: BackstoryId | null = null, seed = 5, world = general): Campaign => newCampaign(world, { player: PS, difficulty: 'normal', seed, backstory });
const bloc = (id: (typeof BLOC_IDS)[number]) => BLOC_IDS.indexOf(id);
const role = (id: (typeof ROLE_IDS)[number]) => ROLE_IDS.indexOf(id);

describe('the leader', () => {
  it('trades one strength for another, whatever their past', () => {
    for (const id of BACKSTORY_IDS) {
      expect(BACKSTORIES[id].reduce((a, b) => a + b, 0), id).toBe(12);
      expect(BACKSTORIES[id].every((v) => v >= 1 && v <= 5)).toBe(true);
    }
    const plain = game();
    // With no past chosen, the player leads with the leader the party already has, who is a trade like any other.
    expect(plain.team.leader).toEqual({ backstory: null, stats: LEADER_STATS.ps });
    expect(edge(plain, PS, 'charisma')).toBeCloseTo(1 + 0.08 * (LEADER_STATS.ps[0] - 3), 6);
    for (const stats of Object.values(LEADER_STATS)) expect(stats.reduce((a, b) => a + b, 0)).toBe(12);
  });

  it('is the player’s own for their party, and the cast’s for every rival', () => {
    const c = game('firebrand');
    expect(stat(c, PS, 'charisma')).toBe(5);
    expect(stat(c, BP, 'charisma')).toBe(LEADER_STATS.bp[0]);
    expect(stat(c, BP, 'cunning')).toBe(LEADER_STATS.bp[2]);
    expect(edge(c, PS, 'charisma')).toBeCloseTo(1.16, 6);
    expect(edge(c, PS, 'organisation')).toBeCloseTo(0.92, 6);
  });

  it('draws a bigger crowd, or builds a stronger branch, according to their gifts', () => {
    const seat = general.seats.find((s) => s.kind === 'rural' && s.last.votes[PS] > 0)!;
    const ceramah = (b: BackstoryId | null) => { const c = game(b); doAction(general, c, PS, 'ceramah', { seat: seat.id }); return c.dyn.support.seat[seat.id][PS]; };
    const own = 1 + 0.08 * (LEADER_STATS.ps[0] - 3); // the party's own leader is the yardstick
    expect(ceramah('firebrand') / ceramah(null)).toBeCloseTo(1.16 / own, 6);
    expect(ceramah('organiser') / ceramah(null)).toBeCloseTo(0.92 / own, 6);
    const build = (b: BackstoryId | null) => { const c = game(b); const i = general.states.indexOf('johor'); const m = c.parties[PS]!.machinery[i]; doAction(general, c, PS, 'build', { state: 'johor' }); return c.parties[PS]!.machinery[i] - m; };
    expect(build('organiser')).toBe(12);
    expect(build(null)).toBe(Math.round(10 * (1 + 0.08 * (LEADER_STATS.ps[1] - 3)))); // the party's own leader is no organiser
    expect(build('firebrand')).toBe(9);
  });

  it('brings their past with them on the first day', () => {
    const plain = game();
    expect(game('tycoon').parties[PS]!.funds).toBe(Math.round(startingFunds(general, PS) * 1.25));
    expect(game('firebrand').parties[PS]!.unity).toBe(plain.parties[PS]!.unity + 6);
    expect(game('organiser').parties[PS]!.machinery[0]).toBe(plain.parties[PS]!.machinery[0] + 6);
    expect(relation(game('fixer'), PS, PT)).toBe(relation(plain, PS, PT) + Math.round(10 * TEMPER.pt.warmth));
    expect(relation(game('activist'), PS, BP)).toBe(relation(plain, PS, BP) + Math.round(-8 * TEMPER.bp.grudge));
    // The talks after a hung parliament are where a fixer earns their keep.
    const talks = newCampaign(hung, { player: PS, difficulty: 'normal', seed: 5, backstory: 'fixer' });
    expect(relation(talks, PS, BP)).toBe(relation(newCampaign(hung, { player: PS, difficulty: 'normal', seed: 5 }), PS, BP) + 10);
  });

  it('counts in a career too, where a party of one’s own can stand for something new', () => {
    const plain = startCareer(careerWorld, { player: PS, difficulty: 'normal', seed: 5 });
    const tech = startCareer(careerWorld, { player: PS, difficulty: 'normal', seed: 5, backstory: 'technocrat' });
    expect(tech.career!.credibility).toBe(plain.career!.credibility + 10);
    expect(startCareer(careerWorld, { player: PS, difficulty: 'normal', seed: 5, backstory: 'tycoon' }).parties[PS]!.funds).toBe(plain.parties[PS]!.funds * 1.25);
    const own = startCareer(careerWorld, { player: PS, difficulty: 'normal', seed: 5, ideology: 'populist' });
    const moved = own.career!.stances[PS].filter((v, i) => v !== plain.career!.stances[PS][i]).length;
    expect(moved).toBe(3);
    expect(own.career!.stances0[PS]).toEqual(plain.career!.stances0[PS]);
    // Voters respond at once to what the new party stands for.
    expect(own.drift.support.nat[bloc('urban_b40')][PS]).toBeGreaterThan(plain.drift.support.nat[bloc('urban_b40')][PS]);
    expect(isValidCampaign(JSON.parse(JSON.stringify(own)), careerWorld)).toBe(true);
  });
});

describe('staff', () => {
  it('are on offer three to a job: one ordinary, one good, one outstanding', () => {
    const c = game();
    expect(c.team.pool).toHaveLength(4);
    for (const row of c.team.pool) {
      expect(row).toHaveLength(3);
      expect(row.map((s) => s.skill).sort()).toEqual(expect.arrayContaining([expect.any(Number)]));
      expect(Math.max(...row.map((s) => s.skill))).toBe(5);
      expect(Math.min(...row.map((s) => s.skill))).toBeLessThanOrEqual(3);
    }
    expect(new Set(c.team.pool.flat().map((s) => s.name)).size).toBe(12);
    expect(game().team.pool).toEqual(c.team.pool); // the same game offers the same people
    expect(game(null, 6).team.pool).not.toEqual(c.team.pool);
    expect(c.team.staff).toEqual([null, null, null, null]);
  });

  it('are hired, paid, looked into and let go', () => {
    const c = game();
    const best = (r: number) => c.team.pool[r].findIndex((s) => s.skill === 5);
    expect(wages(general, c)).toBe(0);
    expect(hire(c, 'manager', best(role('manager')))).toBe(true);
    expect(hire(c, 'manager', best(role('manager')))).toBe(false); // already in the job
    expect(wages(general, c)).toBe(20_000);
    expect(managerDays(c, PS)).toBe(1);
    expect(managerDays(c, BP)).toBe(0.5); // a rival has people of its own: BP's manager finds it half a day
    expect(managerDays(c, GBK)).toBe(0); // and GBK has none
    const unity = c.parties[PS]!.unity;
    expect(hire(c, 'manager', (best(role('manager')) + 1) % 3)).toBe(true);
    expect(c.parties[PS]!.unity).toBe(unity - 1); // replacing someone is noticed
    const days = c.parties[PS]!.days;
    expect(vet(general, c, 'treasurer', 0)).toBe(true);
    expect(c.parties[PS]!.days).toBe(days - 0.5);
    expect(c.team.pool[role('treasurer')][0].vetted).toBe(true);
    expect(vet(general, c, 'treasurer', 0)).toBe(false);
    expect(dismiss(c, 'manager')).toBe(true);
    expect(dismiss(c, 'manager')).toBe(false);
  });

  it('give the leader more days, more money and better polls', () => {
    const c = game();
    for (const id of ROLE_IDS) hire(c, id, c.team.pool[role(id)].findIndex((s) => s.skill === 5));
    for (const s of c.team.staff) s!.skeleton = false;
    expect(playerPollCost(general, c, 'national', null, 'full')).toBe(90_000);
    expect(playerPollCost(general, game(), 'national', null, 'full')).toBe(150_000);
    expect(playerPoll(general, c, 'national', null, 'full')!.moe).toBeCloseTo(0.02 * 0.7, 6);
    const funds = c.parties[PS]!.funds;
    endWeek(general, c);
    expect(c.parties[PS]!.days).toBe(8);
    expect(c.parties[PS]!.funds).toBe(funds - 80_000 + Math.round(weeklyIncome(general, PS) * 1.2));
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), general)).toBe(true);
  });

  it('stop work in a week their wages cannot be met, and come back when they are', () => {
    const c = game();
    for (const id of ROLE_IDS) hire(c, id, c.team.pool[role(id)].findIndex((s) => s.skill === 5));
    for (const s of c.team.staff) s!.skeleton = false;
    const pc = c.parties[PS]!;
    pc.funds = 79_999; // one ringgit short of the week's wages
    staffWeek(general, c, new Rng(1));
    expect(pc.funds).toBe(79_999); // paid in full or not at all
    expect(c.team.unpaid).toBe(true);
    expect(managerDays(c, PS)).toBe(0);
    expect(playerPollCost(general, c, 'national', null, 'full')).toBe(150_000);
    expect(c.news.at(-1)).toMatchObject({ key: 'news.staff.unpaid', tone: 'bad' });
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), general)).toBe(true);
    const told = c.news.length;
    staffWeek(general, c, new Rng(2));
    expect(c.news).toHaveLength(told); // said once, not every week it lasts
    pc.funds = 80_000;
    staffWeek(general, c, new Rng(3));
    expect(pc.funds).toBe(0);
    expect(c.team.unpaid).toBeUndefined();
    expect(managerDays(c, PS)).toBe(1);
    expect(c.news.at(-1)).toMatchObject({ key: 'news.staff.paid' });
  });

  it('go on part pay and stop work between elections when the orders cost more than there is', () => {
    const c = startCareer(careerWorld, { player: PS, difficulty: 'normal', seed: 5 });
    hire(c, 'manager', c.team.pool[role('manager')].findIndex((s) => s.skill === 5));
    c.team.staff[role('manager')]!.skeleton = false;
    termWeek(careerWorld, c);
    expect(c.team.unpaid).toBeUndefined();
    c.parties[PS]!.funds = -termIncome(careerWorld, c).total; // the week's income leaves the chest empty
    termWeek(careerWorld, c);
    expect(c.team.unpaid).toBe(true);
    expect(c.news.some((n) => n.key === 'news.staff.unpaid')).toBe(true);
  });

  it('take the party down with them when a past nobody looked into comes out', () => {
    const c = game();
    hire(c, 'media', 0);
    c.team.staff[role('media')]!.skeleton = true;
    const unity = c.parties[PS]!.unity;
    const rng = new Rng(1);
    for (let week = 0; week < 60 && c.team.staff[role('media')]; week++) staffWeek(general, c, rng);
    expect(c.team.staff[role('media')]).toBeNull();
    expect(c.team.pool[role('media')]).toHaveLength(2);
    expect(c.parties[PS]!.unity).toBe(unity - 3);
    expect(c.dyn.support.nat[0][PS]).toBeLessThan(0);
    expect(c.news.at(-1)).toMatchObject({ key: 'news.staff.scandal', tone: 'bad' });
  });

  it('stay on a retainer between elections', () => {
    const c = startCareer(careerWorld, { player: PS, difficulty: 'normal', seed: 5 });
    hire(c, 'treasurer', c.team.pool[role('treasurer')].findIndex((s) => s.skill === 5));
    c.team.staff[role('treasurer')]!.skeleton = false;
    expect(wages(careerWorld, c)).toBe(5_000);
    expect(termSpending(careerWorld, c).wages).toBe(5_000);
    const days = c.parties[PS]!.days, funds = c.parties[PS]!.funds;
    expect(vet(careerWorld, c, 'manager', 0)).toBe(true);
    expect(c.parties[PS]!.days).toBe(days);
    expect(c.parties[PS]!.funds).toBe(funds - 10_000);
    termWeek(careerWorld, c);
    expect(c.career!.week).toBe(2);
  });
});

describe('candidates', () => {
  it('are chosen by the leader only where it could decide the seat', () => {
    expect(game().team.keySeats).toHaveLength(8);
    expect(game(null, 5, perak).team.keySeats).toHaveLength(5);
    expect(game(null, 5, by).team.keySeats).toHaveLength(1);
    expect(newCampaign(hung, { player: PS, difficulty: 'normal', seed: 5 }).team.keySeats).toHaveLength(0);
    expect(startCareer(careerWorld, { player: PS, difficulty: 'normal', seed: 5 }).team.keySeats).toHaveLength(0);
    const c = game();
    for (const key of c.team.keySeats) {
      expect(key.options).toHaveLength(3);
      expect(new Set(key.options.map((h) => h.kind)).size).toBe(3);
      expect(key.pick).toBeNull();
    }
    expect(new Set(c.team.keySeats.flatMap((k) => k.options.map((h) => h.name))).size).toBe(24);
  });

  it('bring something to the seat for the whole campaign, and cannot be withdrawn', () => {
    const c = game();
    const key = c.team.keySeats[0];
    const before = truth(general, c).seats[general.seatIndex.get(key.seat)!].votes[PS];
    const lift = liftIn(general, key, 1);
    expect(lift).toBeGreaterThan(0);
    expect(choose(general, c, key.seat, 1)).toBe(true);
    expect(c.drift.support.seat[key.seat][PS] - newCampaign(general, { player: PS, difficulty: 'normal', seed: 5 }).drift.support.seat[key.seat][PS]).toBeCloseTo(lift, 6);
    expect(truth(general, c).seats[general.seatIndex.get(key.seat)!].votes[PS]).toBeGreaterThan(before);
    expect(choose(general, c, key.seat, 0)).toBe(false);
    expect(c.news.at(-1)!.key).toBe('news.candidate.named');
    expect(isValidCampaign(JSON.parse(JSON.stringify(c)), general)).toBe(true);
  });

  it('must be named before nominations close', () => {
    const c = game();
    expect(candidateDeadline(c)).toBe(5);
    c.week = 6;
    expect(canChoose(c)).toBe(false);
    expect(choose(general, c, c.team.keySeats[0].seat, 0)).toBe(false);
    expect(candidateDeadline(game(null, 5, by))).toBe(1);
  });

  it('can be looked into first, which is how a past is found before the voters find it', () => {
    const c = game();
    const key = c.team.keySeats[0];
    const days = c.parties[PS]!.days;
    expect(vetHopeful(general, c, key.seat, 0)).toBe(true);
    expect(key.options[0].vetted).toBe(true);
    expect(c.parties[PS]!.days).toBe(days - 0.5);

    key.options[2].skeleton = true;
    choose(general, c, key.seat, 2);
    const held = c.drift.support.seat[key.seat][PS];
    const rng = new Rng(3);
    for (let week = 0; week < 40 && !key.blown; week++) candidatesWeek(c, rng);
    expect(key.blown).toBe(true);
    expect(c.drift.support.seat[key.seat][PS]).toBeCloseTo(held - 0.2, 6);
    expect(c.news.at(-1)!.key).toBe('news.candidate.scandal');
    // The riskiest are the ones with most to offer in the right seat.
    expect(HOPEFULS.warlord.risk).toBeGreaterThan(HOPEFULS.loyalist.risk);
    expect(HOPEFULS.warlord.lift.rural).toBeGreaterThan(HOPEFULS.loyalist.lift.rural);
  });
});

describe('endorsers', () => {
  it('are asked for in contests big enough to matter', () => {
    expect([general, perak, by, hung].map(hasEndorsers)).toEqual([true, true, false, false]);
    const c = game();
    expect(c.team.endorsers).toEqual(ENDORSER_IDS.map(() => null));
    for (const id of ENDORSER_IDS) { expect(courtChance(c, id)).toBeGreaterThanOrEqual(0.05); expect(courtChance(c, id)).toBeLessThanOrEqual(0.9); }
    // A reformist party is at home with the watchdog and a stranger to the preacher.
    expect(courtChance(c, 'watchdog')).toBeGreaterThan(courtChance(c, 'preacher'));
    expect(canCourtEndorser(by, game(null, 5, by), 'singer')).toEqual({ ok: false, reason: 'closed' });
  });

  it('cost a day to ask, and move their followers when they say yes', () => {
    const results = [1, 2, 3, 4, 5, 6, 7, 8].map((seed) => {
      const c = game(null, seed);
      const before = effectiveDynamics(c).support.nat[bloc('urban_lib')][PS];
      const item = courtEndorser(general, c, 'watchdog')!;
      expect(c.parties[PS]!.days).toBe(6);
      expect(canCourtEndorser(general, c, 'watchdog').ok).toBe(false); // once a week, or never again if won
      const won = holder(c, 'watchdog') === PS;
      expect(item.key).toBe(won ? 'news.endorser.won' : 'news.endorser.refused');
      expect(effectiveDynamics(c).support.nat[bloc('urban_lib')][PS] - before).toBeCloseTo(won ? 0.08 : 0, 6);
      return won;
    });
    expect(results).toContain(true);
    expect(results).toContain(false);
  });

  it('will not share a stage with their rivals, and walk away from the disgraced', () => {
    const c = game();
    const alone = courtChance(c, 'chamber');
    c.team.endorsers[ENDORSER_IDS.indexOf('unions')] = PS;
    expect(courtChance(c, 'chamber')).toBeCloseTo(alone - 0.25, 6);
    c.team.endorsers[ENDORSER_IDS.indexOf('watchdog')] = PS;
    c.parties[PS]!.tycoon = 2;
    expect(courtChance(c, 'watchdog')).toBe(0);
    endorsersWeek(general, c, new Rng(1));
    expect(holder(c, 'watchdog')).not.toBe(PS);
    expect(c.news.some((n) => n.key === 'news.endorser.left')).toBe(true);
  });

  it('make up their own minds if nobody asks', () => {
    const c = game();
    const rng = new Rng(2);
    for (let week = 0; week < 30; week++) endorsersWeek(general, c, rng);
    const declared = c.team.endorsers.filter((p) => p !== null);
    expect(declared.length).toBeGreaterThan(4);
    // They go where they lean: the Borneo elders never come out for a peninsular party.
    const elders = holder(c, 'elders');
    if (elders !== null) expect(['gbk', 'gbs', 'legasi']).toContain(PARTY_IDS[elders]);
  });
});

describe('the press', () => {
  it('starts from each outlet’s habits, which move nobody', () => {
    const c = game();
    expect(c.team.media).toEqual(usualCoverage(c));
    expect(coverage(c, 'warisan', BP)).toBe(2);
    expect(coverage(c, 'kini', BP)).toBe(-2);
    expect(coverage(c, 'perdana', PS)).toBe(2); // the broadcaster likes whoever governs
    expect(coverage(c, 'perdana', PT)).toBe(-1);
    const before = JSON.stringify(c.dyn.support.nat);
    // No rival happens to give an interview with this draw.
    const quiet = new Rng(11);
    mediaWeek(by, c, quiet);
    expect(JSON.stringify(c.dyn.support.nat)).toBe(before);
  });

  it('can be won round, or handed a headline', () => {
    const results = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) {
      const c = game(null, seed);
      const was = coverage(c, 'ledger', PS);
      const item = interview(c, 'ledger')!;
      expect(c.parties[PS]!.days).toBe(6.5);
      expect(interview(c, 'ledger')).toBeNull(); // once a week
      const kind = item.key.split('.').at(-1)!;
      results.add(kind);
      expect(coverage(c, 'ledger', PS) - was).toBe(kind === 'good' ? 1 : kind === 'gaffe' ? -1 : 0);
    }
    expect([...results].sort()).toEqual(['flat', 'gaffe', 'good']);
    const c = game('firebrand');
    expect(interviewOdds(c, 'ledger').good).toBeGreaterThan(interviewOdds(game(), 'ledger').good);
    expect(interviewOdds(c, 'kini').gaffe).toBeLessThan(interviewOdds(c, 'warisan').gaffe); // a hostile room is a dangerous one
  });

  it('moves its own readers when it changes its tune', () => {
    const c = game();
    c.team.media[OUTLET_IDS.indexOf('warisan')][PS] = 1; // two steps warmer than its habit
    mediaWeek(by, c, new Rng(11));
    expect(c.dyn.support.nat[bloc('heartland')][PS]).toBeCloseTo(0.016, 6);
    expect(c.dyn.support.nat[bloc('urban_lib')][PS]).toBe(0);
  });

  it('can be gamed with paid accounts, until the money is traced', () => {
    const c = game();
    const funds = c.parties[PS]!.funds;
    expect(hireTroopers(general, c)).not.toBeNull();
    expect(c.parties[PS]!.funds).toBe(funds - 100_000);
    expect(coverage(c, 'viral', PS)).toBe(2);
    expect(hireTroopers(general, c)).toBeNull();
    const rng = new Rng(4);
    for (let week = 0; week < 60 && c.team.troopers === 1; week++) mediaWeek(by, c, rng);
    expect(c.team.troopers).toBe(2);
    expect(coverage(c, 'viral', PS)).toBe(-2);
    expect(c.news.at(-1)).toMatchObject({ key: 'news.media.troopersExposed', tone: 'bad' });
  });
});

describe('the spending limit', () => {
  it('counts everything a campaign pays for', () => {
    const c = game();
    expect(spendingLimit(general)).toBe(2_600_000);
    expect(spendingLimit(by)).toBeLessThan(spendingLimit(perak));
    doAction(general, c, PS, 'tv', {});
    expect(c.parties[PS]!.spent).toBe(350_000);
    playerPoll(general, c, 'national', null, 'quick');
    expect(c.parties[PS]!.spent).toBe(410_000);
    expect(probeChance(general, c, PS)).toBe(0);
  });

  it('is kept by rival parties through a whole campaign', () => {
    const c = newCampaign(general, { player: PS, difficulty: 'hard', seed: 9 });
    while (c.phase === 'campaign') { autoPlayWeek(general, c); endWeek(general, c); }
    c.parties.forEach((pc, p) => { if (pc && p !== PS) expect(pc.spent, PARTY_IDS[p]).toBeLessThanOrEqual(spendingLimit(general)); });
    expect(c.parties.filter((pc) => pc && pc.spent > 500_000).length).toBeGreaterThan(2);
  });

  it('catches up with a player who goes past it', () => {
    const c = game();
    const pc = c.parties[PS]!;
    pc.spent = 3_120_000;
    pc.funds = 1_000_000;
    expect(probeChance(general, c, PS)).toBeCloseTo(0.6, 6);
    const rng = new Rng(1);
    for (let week = 0; week < 40 && !pc.fined; week++) spendingWeek(general, c, rng);
    expect(pc.fined).toBe(true);
    expect(pc.funds).toBe(1_000_000 - 260_000);
    expect(c.dyn.support.nat[0][PS]).toBeCloseTo(-0.04, 6);
    expect(c.news.at(-1)).toMatchObject({ key: 'news.ec.finedYou', tone: 'bad' });
    expect(probeChance(general, c, PS)).toBe(0); // fined once
  });
});

describe('events between elections', () => {
  it('number a hundred and more', () => {
    expect(Object.keys(EVENTS).length).toBeGreaterThanOrEqual(100);
    for (const id of BACKSTORY_IDS) expect(Object.values(EVENTS).filter((e) => e.needs?.backstory === id), id).toHaveLength(2);
  });

  it('bring a leader’s own past back to them, and nobody else’s', () => {
    const seen = new Set<string>();
    for (const seed of [1, 2, 3, 4]) {
      const c = startCareer(careerWorld, { player: PS, difficulty: 'normal', seed, backstory: 'fixer' });
      for (let guard = 0; guard < 3000 && c.phase !== 'campaign' && !c.career!.ending; guard++) {
        if (c.phase === 'term') { if (c.inbox.length) answerEvent(careerWorld, c, c.inbox.shift()!, 0); else skipAhead(careerWorld, c, 26); }
        else if (c.phase === 'formation') endDay(careerWorld, c);
        else if (c.phase === 'done') resumeTerm(c);
      }
      for (const id of c.career!.fired) {
        seen.add(id);
        const story = EVENTS[id].needs?.backstory;
        expect(story === undefined || story === 'fixer', id).toBe(true);
      }
      expect(isValidCampaign(JSON.parse(JSON.stringify(c)), careerWorld)).toBe(true);
    }
    expect(seen.has('fixerDebt') || seen.has('fixerProfile')).toBe(true);
    expect(seen.size).toBeGreaterThan(30);
  });
});
