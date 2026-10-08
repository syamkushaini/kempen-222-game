import { emptyDynamics } from '../dynamics';
import { lastElection, runElection, type World } from '../election';
import { Rng } from '../rng';
import {
  N_BLOCS, N_PARTIES, PARTY_IDS, isMinor,
  type Dynamics, type ElectionOutcome, type RegionId,
} from '../types';
import { freshParty, isOutsider, standingPact, weeklyIncome } from './field';
import { record, standing } from './ledger';
import { makeRecap } from './recap';
import { DECAY, EFFECT, canDo, contestsState, doAction, effectiveDynamics, truth } from './actions';
import { applyBackstory } from './leader';
import { pressReacts } from './media';
import { incomeBoost, managerDays, pollDiscount, pollPrecision } from './perks';
import { afterLender } from './loan';
import { emptyTeam, openCampaign, teamWeek } from './team';
import { startRelations } from './cast';
import { fieldWithin, nominationsOpen } from './slate';
import { beforeNomination, hasDiplomacy, nominationWeek, pactSeats, rivalDiplomacy, settleInbox, shiftRelation, shiftUnity } from './diplomacy';
import { startFormation } from './formation';
import { now, pushNews, ref } from './news';
import { CHIEF_NOISE, RIVAL_NOISE, hasChiefs, planChiefs, playWeek, runChiefs, type ChiefReport } from './ai';
import { latestNationalPoll, pollCost, takePoll } from './polls';
import type {
  ActionId, ActionReport, ActionTarget, Campaign, ChiefLevel, Difficulty,
  BackstoryId, Challenge, NewsItem, Poll, PollQuality, PollScope,
} from './types';

export { atHome, campaigns, freshParty, isOutsider, lastShares, playable, standingPact, startingFunds, weeklyIncome } from './field';

/** How far opinion has drifted since the last election (standard deviations, logit units). */
const DRIFT = { nat: 0.08, state: 0.06, seat: 0.08 };

// ---------- setup ----------

export function makeDrift(world: World, rng: Rng): Dynamics {
  const d = emptyDynamics();
  for (let p = 0; p < N_PARTIES; p++) {
    const shift = rng.normal(0, DRIFT.nat);
    for (let b = 0; b < N_BLOCS; b++) d.support.nat[b][p] = shift;
  }
  for (const st of world.states) {
    const shifts = PARTY_IDS.map(() => rng.normal(0, DRIFT.state));
    d.support.state[st] = Array.from({ length: N_BLOCS }, () => [...shifts]);
  }
  for (const seat of world.seats) d.support.seat[seat.id] = PARTY_IDS.map(() => rng.normal(0, DRIFT.seat));
  return d;
}

export interface CampaignOptions {
  player: number;
  difficulty: Difficulty;
  seed: number;
  totalWeeks?: number;
  /** Where the player's leader came from; nothing for the party's usual leader. */
  backstory?: BackstoryId | null;
  /** Extra difficulty the player has chosen. */
  challenge?: Partial<Challenge>;
}

/** Allies who went into the last election together are on good terms as the next one opens. */
const ALLIED = 30;

export function newCampaign(world: World, opts: CampaignOptions): Campaign {
  const rng = new Rng(opts.seed);
  const parties = PARTY_IDS.map((_, p) => freshParty(world, p, p === opts.player && isOutsider(world, p)));
  const opening = standingPact(world);

  const bare: Omit<Campaign, 'team'> = {
    scenario: world.id,
    player: opts.player,
    difficulty: opts.difficulty,
    totalWeeks: opts.totalWeeks ?? world.rules.weeks,
    week: 1,
    phase: 'campaign',
    seed: opts.seed,
    rng: 0,
    drift: makeDrift(world, rng),
    dyn: emptyDynamics(),
    parties,
    polls: [],
    news: [],
    ledger: [],
    election: null,
    relations: startRelations(),
    standDowns: opening.standDowns,
    pacts: opening.pacts,
    understandings: [],
    met: new Array<number>(N_PARTIES).fill(0),
    katak: [],
    offered: [],
    inbox: [],
    nextScene: 1,
    formation: null,
    career: null,
  };
  const c: Campaign = { ...bare, team: emptyTeam(bare, opts.backstory ?? null) };
  c.rng = rng.state;
  if (opts.challenge?.fog || opts.challenge?.noisy || opts.challenge?.goal) {
    c.challenge = { fog: !!opts.challenge.fog, noisy: !!opts.challenge.noisy, ...(opts.challenge.goal ? { goal: opts.challenge.goal } : {}) };
  }
  // A career sets its own opening terms first, then lets the leader's past have its say.
  if (!world.rules.career) applyBackstory(c);
  for (const pact of opening.pacts) {
    c.relations[pact.a][pact.b] = c.relations[pact.b][pact.a] = Math.max(c.relations[pact.a][pact.b], ALLIED);
    // Said on the first day, so nobody wonders why a party is missing from most of the ballots.
    const mine = pact.a === c.player || pact.b === c.player;
    c.news.push({
      week: 1, party: mine ? c.player : pact.a, key: mine ? 'news.pact.standing.mine' : 'news.pact.standing',
      vars: { a: ref.party(pact.a), b: ref.party(pact.b), party: ref.party(pact.a === c.player ? pact.b : pact.a), n: Object.keys(opening.standDowns).length },
      tone: 'neutral',
    });
  }
  if (world.rules.kind === 'hung') {
    // The votes are in and they are the last election's: straight to the talks.
    c.drift = emptyDynamics();
    c.election = { rng: rng.state };
    startFormation(world, c, lastElection(world).tally);
    return c;
  }
  openCampaign(world, c);
  publishPublicPoll(world, c);
  return c;
}

/** What a poll costs the player, with whatever their strategist saves them. */
export function playerPollCost(world: World, c: Campaign, scope: PollScope, target: string | null, quality: PollQuality): number {
  return Math.round((pollCost(world, scope, target, quality) * pollDiscount(c)) / 500) * 500;
}

// ---------- news ----------

const push = pushNews;

function playerNews(c: Campaign, r: ActionReport): NewsItem {
  const p = c.player;
  const { id, target, quality } = r;
  const item = (key: string, vars: NewsItem['vars'], tone: NewsItem['tone'] = 'neutral'): NewsItem =>
    ({ week: now(c), party: p, key, vars, tone });
  const crowd = quality === 'great' ? 'good' : quality === 'weak' ? 'bad' : 'neutral';
  switch (id) {
    case 'ceramah': return item(`news.me.ceramah.${quality}`, { seat: ref.seat(target.seat!) }, crowd);
    case 'walkabout': return item('news.me.walkabout', { seat: ref.seat(target.seat!) });
    case 'megarally': return item(`news.me.megarally.${quality}`, { state: ref.state(target.state!) }, crowd);
    case 'canvass': return item('news.me.canvass', { state: ref.state(target.state!) });
    case 'gotv': return item('news.me.gotv', { state: ref.state(target.state!) });
    case 'build': return item('news.me.build', { state: ref.state(target.state!) });
    case 'tv': return item('news.me.tv', {});
    case 'social': return item(`news.me.social.${quality}`, {}, quality === 'flop' ? 'bad' : quality === 'ok' ? 'neutral' : 'good');
    case 'billboards': return item('news.me.billboards', { state: ref.state(target.state!) });
    case 'attack': return item(`news.me.attack.${quality === 'backfire' ? 'backfire' : 'ok'}`, { party: ref.party(target.party!) }, quality === 'backfire' ? 'bad' : 'good');
    case 'dinner': return item('news.me.dinner', { state: ref.state(target.state!), rm: ref.rm(r.raised!) }, 'good');
    case 'crowdfund': return item('news.me.crowdfund', { rm: ref.rm(r.raised!) }, 'good');
    case 'tycoon': return item('news.me.tycoon', { rm: ref.rm(r.raised!) });
    case 'townhall': return item(`news.me.townhall.${quality === 'flop' ? 'flop' : 'ok'}`, { seat: ref.seat(target.seat!) }, quality === 'flop' ? 'bad' : 'good');
    case 'charity': return item(`news.me.charity.${quality === 'backfire' ? 'backfire' : 'ok'}`, { state: ref.state(target.state!) }, quality === 'backfire' ? 'bad' : 'good');
    case 'youth': return item('news.me.youth', { state: ref.state(target.state!) });
    case 'festival': return item('news.me.festival', { state: ref.state(target.state!) }, 'good');
    case 'conference': return item('news.me.conference', {}, 'good');
    case 'debate': return item(`news.me.debate.${quality === 'great' ? 'won' : 'lost'}`, { party: ref.party(target.party!) }, quality === 'great' ? 'good' : 'bad');
    case 'manifesto': return item(`news.me.manifesto.${quality === 'weak' ? 'weak' : 'ok'}`, {}, quality === 'weak' ? 'bad' : 'good');
    case 'radio': return item('news.me.radio', { state: ref.state(target.state!) });
  }
}

/** Turns a rival's week into a few public news lines. Quiet work (canvassing, fundraising) stays unseen. */
function rivalNews(c: Campaign, p: number, reports: ActionReport[]) {
  const party = ref.party(p);
  // A small party's routine ground work is not news; its viral moments and flops are.
  if (isMinor(p)) {
    for (const r of reports) {
      if (r.id === 'social' && r.quality === 'viral') push(c, { party: p, key: 'news.rival.viral', vars: { party }, tone: 'neutral' });
      if (r.id === 'social' && r.quality === 'flop') push(c, { party: p, key: 'news.rival.flop', vars: { party }, tone: 'neutral' });
    }
    return;
  }
  const seats = [...new Set(reports.filter((r) => r.id === 'ceramah' || r.id === 'walkabout').map((r) => r.target.seat!))];
  if (seats.length) push(c, { party: p, key: 'news.rival.ground', vars: { party, seats: `@seats:${seats.join(',')}` }, tone: 'neutral' });
  const rallies = reports.filter((r) => r.id === 'megarally').map((r) => r.target.state!);
  if (rallies.length) push(c, { party: p, key: 'news.rival.megarally', vars: { party, states: `@states:${rallies.join(',')}` }, tone: 'neutral' });
  const boards = reports.filter((r) => r.id === 'billboards').map((r) => r.target.state!);
  if (boards.length) push(c, { party: p, key: 'news.rival.billboards', vars: { party, states: `@states:${boards.join(',')}` }, tone: 'neutral' });
  if (reports.some((r) => r.id === 'tv')) push(c, { party: p, key: 'news.rival.tv', vars: { party }, tone: 'neutral' });
  for (const r of reports) {
    if (r.id === 'social' && r.quality === 'viral') push(c, { party: p, key: 'news.rival.viral', vars: { party }, tone: 'neutral' });
    if (r.id === 'social' && r.quality === 'flop') push(c, { party: p, key: 'news.rival.flop', vars: { party }, tone: 'neutral' });
    if (r.id === 'attack') {
      const atYou = r.target.party === c.player;
      const outcome = r.quality === 'backfire' ? 'backfire' : 'ok';
      push(c, {
        party: p,
        key: `news.rival.${atYou ? 'attackYou' : 'attack'}.${outcome}`,
        vars: { party, target: ref.party(r.target.party!) },
        tone: atYou ? (outcome === 'ok' ? 'bad' : 'good') : 'neutral',
      });
    }
  }
}

/** What the player's chiefs did this week, one line per region. Ceramah are listed with their seat. */
function chiefNews(c: Campaign, work: ChiefReport[]) {
  for (const { state, reports, spent } of work) {
    const actions = reports.map((r) => (r.target.seat ? `${r.id}=${r.target.seat}` : r.id)).join(',');
    push(c, { party: c.player, key: 'news.chief.work', vars: { state: ref.state(state), actions: `@actions:${actions}`, rm: ref.rm(spent) }, tone: 'neutral' });
  }
}

// ---------- player moves ----------

/** What an action does to how leaders and parties feel, beyond its effect on voters. */
function aftermath(c: Campaign, r: ActionReport) {
  if (r.id === 'attack') {
    // Nobody forgets being attacked, and a party resents a leader whose attack blows up.
    shiftRelation(c, r.party, r.target.party!, -12);
    if (r.quality === 'backfire') shiftUnity(c, r.party, -2);
  }
  if (r.id === 'megarally') shiftUnity(c, r.party, r.quality === 'weak' ? 1 : 3);
  // A festival and a party conference are for the party itself; a debate is remembered by the one who lost it.
  if (r.id === 'festival') shiftUnity(c, r.party, EFFECT.festivalUnity);
  if (r.id === 'conference') shiftUnity(c, r.party, EFFECT.conference);
  if (r.id === 'debate') shiftRelation(c, r.party, r.target.party!, -6);
  if (r.id === 'charity' && r.quality === 'backfire') pressReacts(c, r.party, -1, ['viral']);
  // What goes round online is noticed by those who live there.
  if (r.id === 'social' && (r.quality === 'viral' || r.quality === 'flop')) pressReacts(c, r.party, r.quality === 'viral' ? 1 : -1, ['viral']);
  if (r.id === 'attack' && r.quality === 'backfire') pressReacts(c, r.party, -1, ['viral']);
}

export function playerAct(world: World, c: Campaign, id: ActionId, target: ActionTarget): NewsItem | null {
  if (c.phase !== 'campaign' || !canDo(world, c, c.player, id, target).ok) return null;
  const before = standing(world, c);
  const report = doAction(world, c, c.player, id, target);
  aftermath(c, report);
  const item = playerNews(c, report);
  c.news.push(item);
  record(world, c, before, item);
  return item;
}

export function playerPoll(world: World, c: Campaign, scope: PollScope, target: string | null, quality: PollQuality): Poll | null {
  const pc = c.parties[c.player]!;
  const cost = playerPollCost(world, c, scope, target, quality);
  if ((c.phase !== 'campaign' && c.phase !== 'term') || cost > pc.funds) return null;
  pc.funds -= cost;
  if (c.phase === 'campaign') pc.spent += cost;
  const rng = new Rng(c.rng);
  const poll = takePoll(world, c, truth(world, c), rng, scope, target, quality, false, pollPrecision(c));
  c.rng = rng.state;
  c.polls.push(poll);
  return poll;
}

// ---------- chiefs ----------

/**
 * Puts a chief in charge of a region's ground campaign, changes how free a
 * hand they have, or (level 0) takes the region back.
 */
export function setChief(world: World, c: Campaign, st: RegionId, level: ChiefLevel | 0): boolean {
  const pc = c.parties[c.player]!;
  if (c.phase !== 'campaign' || !hasChiefs(world) || !contestsState(world, c, c.player, st)) return false;
  if (level === 0) delete pc.chiefs[st];
  else pc.chiefs[st] = level;
  return true;
}

/** Sets the amount the player's chiefs must leave in the party's funds. */
export function setChiefFloor(c: Campaign, amount: number): void {
  if (c.phase === 'campaign' && Number.isFinite(amount)) c.parties[c.player]!.chiefFloor = Math.max(0, amount);
}

export function publishPublicPoll(world: World, c: Campaign) {
  const rng = new Rng(c.rng);
  const poll = takePoll(world, c, truth(world, c), rng, 'national', null, 'quick', true);
  c.rng = rng.state;
  c.polls.push(poll);
  const order = poll.national!.map((s, p) => ({ s, p })).sort((a, b) => b.s - a.s);
  push(c, {
    party: null,
    key: 'news.poll.public',
    vars: {
      first: ref.party(order[0].p), firstPct: Math.round(order[0].s * 100),
      second: ref.party(order[1].p), secondPct: Math.round(order[1].s * 100),
    },
    tone: 'neutral',
  });
}

// ---------- the weekly turn ----------

function decay(dyn: Dynamics) {
  for (const row of dyn.support.nat) for (let p = 0; p < N_PARTIES; p++) row[p] *= DECAY.nat;
  for (const rows of Object.values(dyn.support.state)) for (const row of rows!) for (let p = 0; p < N_PARTIES; p++) row[p] *= DECAY.state;
  for (const v of Object.values(dyn.support.seat)) for (let p = 0; p < N_PARTIES; p++) v[p] *= DECAY.seat;
  for (let p = 0; p < N_PARTIES; p++) dyn.turnout.party[p] *= DECAY.motivation;
  for (const v of Object.values(dyn.turnout.state)) for (let p = 0; p < N_PARTIES; p++) v![p] *= DECAY.motivation;
  for (const v of Object.values(dyn.turnout.seat)) for (let p = 0; p < N_PARTIES; p++) v[p] *= DECAY.motivation;
}

/** Each week a secret tycoon donation may come out. */
function tycoonExposure(c: Campaign) {
  const rng = new Rng(c.rng);
  c.parties.forEach((pc, p) => {
    if (!pc || pc.tycoon !== 1 || rng.next() >= EFFECT.tycoonExposeChance) return;
    pc.tycoon = 2;
    shiftUnity(c, p, -8);
    pressReacts(c, p, -1);
    for (const row of c.dyn.support.nat) row[p] -= EFFECT.tycoonHit;
    c.dyn.turnout.party[p] -= EFFECT.tycoonMotivationHit;
    const you = p === c.player;
    push(c, { party: p, key: you ? 'news.tycoon.exposedYou' : 'news.tycoon.exposed', vars: { party: ref.party(p) }, tone: you ? 'bad' : 'neutral' });
  });
  c.rng = rng.state;
}

/**
 * Ends the player's week: rivals take their turns, scandals may break, effects
 * fade, donations arrive and a new public poll is published. After the final
 * week, polling day arrives instead.
 */
export function endWeek(world: World, c: Campaign): void {
  if (c.phase !== 'campaign') return;
  const player = c.parties[c.player]!;
  settleInbox(world, c);

  // The player's chiefs work through the week, on what the leader left undone.
  chiefNews(c, runChiefs(world, c, c.player, truth(world, c), CHIEF_NOISE));

  // Rivals all react to the same picture of the race, as it stands after the player's week.
  const now = truth(world, c);
  const watched = [...player.visits];
  c.parties.forEach((pc, p) => {
    if (!pc || p === c.player) return;
    const reports = playWeek(world, c, p, now, watched);
    planChiefs(world, c, p);
    for (const work of runChiefs(world, c, p, now, RIVAL_NOISE[c.difficulty])) reports.push(...work.reports);
    reports.forEach((r) => aftermath(c, r));
    rivalNews(c, p, reports);
  });
  tycoonExposure(c);
  rivalDiplomacy(world, c);
  teamWeek(world, c);
  if (hasDiplomacy(world) && c.week === nominationWeek(c)) {
    push(c, { party: null, key: 'news.nomination', vars: { n: pactSeats(c) }, tone: 'neutral' });
  }

  if (c.week >= c.totalWeeks) {
    c.phase = 'night';
    const rng = new Rng(c.rng);
    c.election = { rng: rng.state };
    rng.next();
    c.rng = rng.state;
    return;
  }

  c.recap = makeRecap(world, c);
  decay(c.dyn);
  c.week++;
  c.parties.forEach((pc, p) => {
    if (!pc) return;
    pc.funds += afterLender(c, pc, Math.round(weeklyIncome(world, p, c) * incomeBoost(c, p)));
    pc.days = pc.capacity + managerDays(c, p);
    pc.used = {};
    pc.visits = [];
  });
  push(c, { party: c.player, key: 'news.income', vars: { rm: ref.rm(Math.round(weeklyIncome(world, c.player, c) * incomeBoost(c, c.player))) }, tone: 'neutral' });
  publishPublicPoll(world, c);
}

/** How much of its money the autoplayer spends on candidates. */
const AUTO_SLATE_SHARE = 0.3;

/** Lets the rival logic play the player's week too. Used for testing balance. */
export function autoPlayWeek(world: World, c: Campaign): void {
  // A party the player made fields what it can afford of the cheapest seats, keeping most of its money for the campaign.
  if (nominationsOpen(c)) fieldWithin(world, c, (c.parties[c.player]?.funds ?? 0) * AUTO_SLATE_SHARE);
  playWeek(world, c, c.player, truth(world, c), []);
  planChiefs(world, c, c.player);
}

// ---------- polling day ----------

export function electionResult(world: World, c: Campaign): ElectionOutcome | null {
  if (!c.election) return null;
  if (world.rules.kind === 'hung') return lastElection(world);
  return runElection(world, effectiveDynamics(c), new Rng(c.election.rng), undefined, c.standDowns);
}

/** Election night is over: on to forming a government, where the contest has one to form. */
export function closeNight(world: World, c: Campaign): void {
  if (c.phase !== 'night') return;
  if (world.rules.formation) startFormation(world, c, electionResult(world, c)!.tally);
  else c.phase = 'done';
}

export { countBatches, declarationOrder, summarise, type Summary, type Verdict } from './night';
export { beforeNomination, effectiveDynamics, latestNationalPoll, truth };
