import { emptyDynamics } from '../dynamics';
import { projectElection, type World } from '../election';
import { clamp, zeros } from '../math';
import { Rng } from '../rng';
import { STANDS, type StandDowns } from '../transfer';
import { N_PARTIES, PARTY_IDS, type ElectionOutcome } from '../types';
import { EFFECT, contests, effectiveDynamics, scaled, truth } from './actions';
import { AFFINITY, TEMPER } from './cast';
import { record, standing } from './ledger';
import { pushNews, ref } from './news';
import { resolveAgenda } from './agenda';
import type { Campaign, NewsItem, Scene } from './types';

// ---------- basics ----------

export const hasDiplomacy = (world: World) => world.rules.diplomacy;

/** Candidates are locked in at the end of this week. Pacts and defections must happen before. */
export const nominationWeek = (c: Campaign) => Math.max(1, c.totalWeeks - 3);
export const beforeNomination = (c: Campaign) => c.week <= nominationWeek(c);

export const relation = (c: Campaign, a: number, b: number) => c.relations[a][b];

export function shiftRelation(c: Campaign, a: number, b: number, by: number): void {
  if (a === b) return;
  // Between the player and a rival, the rival's temper decides how much of it sticks.
  const other = a === c.player ? b : b === c.player ? a : -1;
  const temper = other >= 0 ? TEMPER[PARTY_IDS[other] as keyof typeof TEMPER] : undefined;
  if (temper) by *= by < 0 ? temper.grudge : temper.warmth;
  const v = clamp(Math.round(c.relations[a][b] + by), -100, 100);
  c.relations[a][b] = v;
  c.relations[b][a] = v;
}

export function shiftUnity(c: Campaign, p: number, by: number): void {
  const pc = c.parties[p];
  if (pc) pc.unity = clamp(Math.round(pc.unity + by), 0, 100);
}

export const inPact = (c: Campaign, a: number, b: number) =>
  c.pacts.some((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));

/** Other parties that campaign and so have a leader to deal with. */
export const others = (c: Campaign, p: number) => c.parties.map((pc, i) => (pc && i !== p ? i : -1)).filter((i) => i >= 0);

export const COST = { meet: 0.5, talks: 1, understanding: 1, joint: 0.5, court: 1, courtMoney: 60_000, keepMoney: 50_000 };
/** Rounds of offer and counter-offer a leader will sit through in one week. */
export const TALK_ROUNDS = 3;

// ---------- seat pacts ----------

/** A pact as its proposer sees it: seats they stand aside in, and seats the other party does. */
export interface PactProposal { give: string[]; get: string[] }

/** Seats where both parties have a candidate. */
export function clashSeats(world: World, c: Campaign, a: number, b: number): number[] {
  const out: number[] = [];
  world.seats.forEach((_, i) => { if (contests(world, c, i, a) && contests(world, c, i, b)) out.push(i); });
  return out;
}

function withProposal(world: World, c: Campaign, a: number, b: number, prop: PactProposal): StandDowns {
  const out: StandDowns = Object.fromEntries(Object.entries(c.standDowns).map(([k, v]) => [k, [...v]]));
  const set = (seat: string, from: number, to: number) => {
    if (!world.seatIndex.has(seat)) return;
    (out[seat] ??= new Array<number>(N_PARTIES).fill(-1))[from] = to;
  };
  for (const seat of prop.give) set(seat, a, b);
  for (const seat of prop.get) set(seat, b, a);
  return out;
}

const shareOf = (o: ElectionOutcome, i: number, p: number) => (o.seats[i].valid > 0 ? o.seats[i].votes[p] / o.seats[i].valid : 0);

/** A party this far ahead of its partner in a seat will not be the one to stand aside. */
const STRONGER = 0.05;
/** Leaders who cannot stand each other do not sign pacts, whatever the arithmetic says. */
const PACT_MIN_RELATION = -10;

/** A lead of this many points of vote share is about an even-money bet either way. */
const WIN_SPREAD = 0.06;

/** Seats each party can expect, counting a close seat as part of a seat. */
function expectedSeats(o: ElectionOutcome): number[] {
  const e = zeros(N_PARTIES);
  for (const s of o.seats) {
    for (let p = 0; p < N_PARTIES; p++) {
      if (s.votes[p] === 0) continue;
      let best = 0;
      for (let q = 0; q < N_PARTIES; q++) if (q !== p && s.votes[q] > best) best = s.votes[q];
      e[p] += 1 / (1 + Math.exp((-1.7 * (s.votes[p] - best)) / s.valid / WIN_SPREAD));
    }
  }
  return e;
}

/**
 * Drafts a pact between two parties: in each seat where they clash, the weaker
 * stands aside, and an incumbent never does. `targeted` leaves alone seats
 * that are already safe or beyond reach even together; `stronger` covers every
 * clash. Uses the last result (public), or the real race where the drafter can
 * see it.
 */
export function draftPact(world: World, c: Campaign, a: number, b: number, mode: 'targeted' | 'stronger', basis: ElectionOutcome): PactProposal {
  const prop: PactProposal = { give: [], get: [] };
  for (const i of clashSeats(world, c, a, b)) {
    const seat = world.seats[i];
    const sa = shareOf(basis, i, a), sb = shareOf(basis, i, b);
    let third = 0;
    for (let q = 0; q < N_PARTIES; q++) if (q !== a && q !== b) third = Math.max(third, shareOf(basis, i, q));
    if (mode === 'targeted') {
      if (Math.max(sa, sb) - third >= 0.1) continue;
      if (Math.max(sa, sb) + 0.5 * Math.min(sa, sb) < third - 0.03) continue;
    }
    const holder = seat.last.votes.indexOf(Math.max(...seat.last.votes));
    // Where the sitting party has fallen clearly behind its partner, neither will give way: leave it a fight.
    if ((holder === a && sb > sa + STRONGER) || (holder === b && sa > sb + STRONGER)) continue;
    const aStands = holder === a ? true : holder === b ? false : sa >= sb;
    (aStands ? prop.get : prop.give).push(seat.id);
  }
  return prop;
}

/** What a pact would have done to the last election: seats each side would have won, before and after. */
export function pactPreview(world: World, c: Campaign, a: number, b: number, prop: PactProposal) {
  const before = projectElection(world, emptyDynamics(), c.standDowns).tally;
  const after = projectElection(world, emptyDynamics(), withProposal(world, c, a, b, prop)).tally;
  return { a: [before[a], after[a]] as const, b: [before[b], after[b]] as const };
}

export type PactReply = 'ok' | 'late' | 'already' | 'empty' | 'cold' | 'holds' | 'nothing' | 'unfair';
export interface PactVerdict {
  reply: PactReply;
  /** Seats the other side refuses to give up. */
  insist: string[];
  /** Seats the other side would like a clear run in. */
  want: string[];
}

/**
 * How party `b` answers a pact proposed by party `a`. Leaders judge a pact by
 * the seats it is worth to them, how the gains are shared, and how they feel
 * about the proposer.
 */
export function assessPact(world: World, c: Campaign, a: number, b: number, prop: PactProposal): PactVerdict {
  const no = (reply: PactReply, insist: string[] = [], want: string[] = []): PactVerdict => ({ reply, insist, want });
  if (!beforeNomination(c)) return no('late');
  if (inPact(c, a, b)) return no('already');
  const clash = new Set(clashSeats(world, c, a, b).map((i) => world.seats[i].id));
  const give = prop.give.filter((s) => clash.has(s)), get = prop.get.filter((s) => clash.has(s) && !prop.give.includes(s));
  if (give.length + get.length === 0) return no('empty');
  const rel = relation(c, a, b);
  if (rel < PACT_MIN_RELATION) return no('cold');

  const now = truth(world, c);
  // Nobody gives up a seat they hold, or one where they are clearly the stronger of the two.
  const insist = get.filter((id) => {
    const i = world.seatIndex.get(id)!;
    const holder = world.seats[i].last.votes.indexOf(Math.max(...world.seats[i].last.votes));
    return holder === b || shareOf(now, i, b) > shareOf(now, i, a) + STRONGER;
  });
  if (insist.length) return no('holds', insist);

  const eNow = expectedSeats(now);
  const eThen = expectedSeats(projectElection(world, effectiveDynamics(c), withProposal(world, c, a, b, { give, get })));
  const gainA = eThen[a] - eNow[a], gainB = eThen[b] - eNow[b];

  // Seats where a clear run would help them most: they trail the leader narrowly and the proposer splits the vote.
  const want = [...clash].filter((id) => !give.includes(id) && !get.includes(id)).map((id) => {
    const i = world.seatIndex.get(id)!;
    const sb = shareOf(now, i, b), sa = shareOf(now, i, a);
    const top = Math.max(...now.seats[i].votes) / now.seats[i].valid;
    return { id, sa, sb, gap: top - sb };
  }).filter((x) => x.sb > x.sa && x.gap < 0.12 && x.sa > 0.04).sort((x, y) => x.gap - y.gap).slice(0, 5).map((x) => x.id);

  const need = clamp(0.5 - rel / 50, 0.2, 1.5);
  if (gainB < need) return no('nothing', [], want);
  const share = clamp(0.45 - rel / 400, 0.3, 0.6);
  if (gainA > 0 && gainB < share * (gainA + gainB)) return no('unfair', [], want);
  return no('ok');
}

/** Puts a pact into effect. The caller has checked that both sides agree. */
export function signPact(world: World, c: Campaign, a: number, b: number, prop: PactProposal): void {
  const before = a === c.player || b === c.player ? standing(world, c) : null;
  c.standDowns = withProposal(world, c, a, b, prop);
  c.pacts.push({ a, b, week: c.week });
  // Candidates who are told to stand aside do not go quietly.
  const cost = (p: number, seats: string[]) => {
    const sore = seats.filter((id) => {
      const s = world.seats[world.seatIndex.get(id)!];
      return s.last.votes[p] / s.last.votes.reduce((x, y) => x + y, 0) >= 0.15;
    }).length;
    // And the grassroots of parties far apart take a pact badly.
    shiftUnity(c, p, -Math.min(20, 0.15 * sore) - 20 * Math.max(0, -AFFINITY[a][b]));
  };
  cost(a, prop.give);
  cost(b, prop.get);
  shiftRelation(c, a, b, 25);
  // Everyone left out draws closer together.
  const outside = c.parties.map((pc, i) => (pc && i !== a && i !== b ? i : -1)).filter((i) => i >= 0);
  for (const x of outside) for (const y of outside) if (x < y) shiftRelation(c, x, y, 6);

  const mine = a === c.player || b === c.player;
  const item = pushNews(c, {
    party: mine ? c.player : a,
    key: mine ? 'news.pact.mine' : 'news.pact.signed',
    vars: { a: ref.party(a), b: ref.party(b), party: ref.party(a === c.player ? b : a), n: prop.give.length + prop.get.length },
    tone: mine ? 'good' : 'neutral',
  });
  if (before) record(world, c, before, item);
}

/** The player tears up a pact: every seat is contested again, and the other leader does not forget. */
export function breakPact(c: Campaign, p: number): boolean {
  const me = c.player;
  if (c.phase !== 'campaign' || !beforeNomination(c) || !inPact(c, me, p)) return false;
  c.pacts = c.pacts.filter((x) => !((x.a === me && x.b === p) || (x.a === p && x.b === me)));
  for (const [seat, stood] of Object.entries(c.standDowns)) {
    if (stood[me] === p) stood[me] = -1;
    if (stood[p] === me) stood[p] = -1;
    if (stood.every((v) => v === STANDS)) delete c.standDowns[seat];
  }
  shiftRelation(c, me, p, -50);
  c.understandings = c.understandings.filter((x) => x !== p);
  pushNews(c, { party: me, key: 'news.pact.broken', vars: { party: ref.party(p) }, tone: 'bad' });
  return true;
}

// ---------- the player's moves ----------

export type DiploRefusal = 'none' | 'late' | 'days' | 'funds' | 'usedThisWeek' | 'cold' | 'ambition' | 'patience' | 'noTarget' | 'already';
type Check = { ok: true } | { ok: false; reason: DiploRefusal };
const yes: Check = { ok: true };
const no = (reason: DiploRefusal): Check => ({ ok: false, reason });

function open(world: World, c: Campaign, p: number, days: number, key: string | null): Check {
  const pc = c.parties[c.player]!;
  if (c.phase !== 'campaign' || !hasDiplomacy(world) || p === c.player || !c.parties[p]) return no('none');
  if (key && (pc.used[key] ?? 0) >= 1) return no('usedThisWeek');
  if (days > pc.days + 1e-9) return no('days');
  return yes;
}

function spend(c: Campaign, days: number, key: string | null, money = 0) {
  const pc = c.parties[c.player]!;
  pc.days -= days;
  pc.funds -= money;
  if (key) pc.used[key] = (pc.used[key] ?? 0) + 1;
}

export const canMeet = (world: World, c: Campaign, p: number) => open(world, c, p, COST.meet, `meet:${p}`);

/** Tea with another leader. The first few meetings warm things up; after that it is just tea. */
export function meetLeader(world: World, c: Campaign, p: number): NewsItem | null {
  if (!canMeet(world, c, p).ok) return null;
  spend(c, COST.meet, `meet:${p}`);
  shiftRelation(c, c.player, p, Math.max(2, 10 - 3 * c.met[p]));
  c.met[p]++;
  return pushNews(c, { party: c.player, key: 'news.meet', vars: { leader: ref.leader(p) }, tone: 'neutral' });
}

/** Whether the player can put a pact proposal to a leader now. The first round of the week costs a day. */
export function canTalk(world: World, c: Campaign, p: number): Check {
  if (!beforeNomination(c)) return no('late');
  if (inPact(c, c.player, p)) return no('already');
  if (relation(c, c.player, p) < PACT_MIN_RELATION) return no('cold');
  const rounds = c.parties[c.player]!.used[`talks:${p}`] ?? 0;
  if (rounds >= TALK_ROUNDS) return no('patience');
  return open(world, c, p, rounds === 0 ? COST.talks : 0, null);
}

/** Puts a pact to another leader. If they agree it is signed on the spot. */
export function proposePact(world: World, c: Campaign, p: number, prop: PactProposal): PactVerdict | null {
  if (!canTalk(world, c, p).ok) return null;
  const key = `talks:${p}`;
  const first = !c.parties[c.player]!.used[key];
  spend(c, first ? COST.talks : 0, key);
  const verdict = assessPact(world, c, c.player, p, prop);
  if (verdict.reply === 'ok') {
    const clash = new Set(clashSeats(world, c, c.player, p).map((i) => world.seats[i].id));
    signPact(world, c, c.player, p, { give: prop.give.filter((s) => clash.has(s)), get: prop.get.filter((s) => clash.has(s) && !prop.give.includes(s)) });
  }
  return verdict;
}

export function canPromise(world: World, c: Campaign, p: number): Check {
  if (c.understandings.includes(p)) return no('already');
  const base = open(world, c, p, COST.understanding, `promise:${p}`);
  if (!base.ok) return base;
  const pact = inPact(c, c.player, p);
  if (relation(c, c.player, p) < (pact ? 10 : 30)) return no('cold');
  // A leader who expects to be the one forming the government promises nothing.
  const seatsOf = (q: number) => world.seats.filter((s) => s.last.votes[q] === Math.max(...s.last.votes)).length;
  if (!pact && seatsOf(p) >= seatsOf(c.player)) return no('ambition');
  return yes;
}

/** A private promise of support once the votes are counted. Nothing is signed, and nothing binds. */
export function seekUnderstanding(world: World, c: Campaign, p: number): NewsItem | null {
  if (!canPromise(world, c, p).ok) return null;
  spend(c, COST.understanding, `promise:${p}`);
  c.understandings.push(p);
  shiftRelation(c, c.player, p, 5);
  return pushNews(c, { party: c.player, key: 'news.understanding', vars: { leader: ref.leader(p) }, tone: 'good' });
}

export function canJointAttack(world: World, c: Campaign, ally: number, target: number): Check {
  if (ally === target || target === c.player || !c.parties[target]) return no('noTarget');
  const base = open(world, c, ally, COST.joint, 'joint');
  if (!base.ok) return base;
  if (relation(c, c.player, ally) < 20 || relation(c, ally, target) >= 0) return no('cold');
  return yes;
}

/** Two parties attack a common rival together: it hits harder, and both pay if it goes wrong. */
export function jointAttack(world: World, c: Campaign, ally: number, target: number): NewsItem | null {
  if (!canJointAttack(world, c, ally, target).ok) return null;
  const before = standing(world, c);
  spend(c, COST.joint, 'joint');
  const rng = new Rng(c.rng);
  const me = c.player;
  const backfired = rng.next() < 0.25;
  if (backfired) {
    for (const row of c.dyn.support.nat) { row[me] -= EFFECT.attackBackfire * 0.75; row[ally] -= EFFECT.attackBackfire * 0.75; }
    shiftUnity(c, me, -2);
  } else {
    const hit = EFFECT.attack * 1.6 * (0.6 + 0.8 * rng.next());
    for (const row of c.dyn.support.nat) row[target] -= hit;
    c.dyn.turnout.party[target] -= EFFECT.attackMotivation * 1.3;
  }
  c.rng = rng.state;
  shiftRelation(c, me, ally, 5);
  shiftRelation(c, me, target, -12);
  shiftRelation(c, ally, target, -8);
  const item = pushNews(c, {
    party: me, key: backfired ? 'news.joint.backfire' : 'news.joint.ok',
    vars: { ally: ref.party(ally), target: ref.party(target) }, tone: backfired ? 'bad' : 'good',
  });
  record(world, c, before, item);
  return item;
}

const holder = (world: World, i: number) => world.seats[i].last.votes.indexOf(Math.max(...world.seats[i].last.votes));

/** Moves a sitting member's personal vote from one party to another. It does not fade. */
function defect(c: Campaign, seat: string, from: number, to: number) {
  const s = (c.drift.support.seat[seat] ??= zeros(N_PARTIES));
  s[to] += 0.3;
  s[from] -= 0.25;
  c.katak.push(seat);
  shiftUnity(c, from, -5);
  shiftUnity(c, to, -3);
  shiftRelation(c, from, to, -20);
}

/** How many times the usual sum a member can be offered to cross over. A bigger offer makes it likelier, and louder if it comes out. */
export const STAKES = [1, 2, 4] as const;
export type Stake = (typeof STAKES)[number];
const doublings = (stake: number) => Math.log2(Math.max(1, stake));

export function canCourt(world: World, c: Campaign, seat: string | null, stake: Stake = 1): Check {
  const i = seat === null ? undefined : world.seatIndex.get(seat);
  if (i === undefined) return no('noTarget');
  const h = holder(world, i);
  if (h === c.player || !c.parties[h] || !contests(world, c, i, c.player) || !contests(world, c, i, h)) return no('noTarget');
  if (!beforeNomination(c)) return no('late');
  if (c.katak.includes(seat!)) return no('already');
  const base = open(world, c, h, COST.court, 'court');
  if (!base.ok) return base;
  if (scaled(world, COST.courtMoney) * stake > c.parties[c.player]!.funds) return no('funds');
  return yes;
}

/** The chance a rival's sitting member can be talked into crossing over. */
export function courtChance(world: World, c: Campaign, seat: string, stake: Stake = 1): number {
  const i = world.seatIndex.get(seat)!;
  const s = world.seats[i];
  const mine = s.last.votes[c.player] / s.last.votes.reduce((a, b) => a + b, 0);
  // Money talks: each doubling of the offer adds ten points, up to a ceiling no member is certain at.
  return clamp(0.25 + ((70 - c.parties[holder(world, i)]!.unity) / 100) * 0.5 + (mine - 0.25) * 0.5 + 0.1 * doublings(stake), 0.1, 0.85);
}

/** Tries to bring a rival's sitting member across before nomination day. */
export function courtDefector(world: World, c: Campaign, seat: string, stake: Stake = 1): NewsItem | null {
  if (!(STAKES as readonly number[]).includes(stake) || !canCourt(world, c, seat, stake).ok) return null;
  const before = standing(world, c);
  const from = holder(world, world.seatIndex.get(seat)!);
  const chance = courtChance(world, c, seat, stake);
  spend(c, COST.court, 'court', scaled(world, COST.courtMoney) * stake);
  const rng = new Rng(c.rng);
  const won = rng.next() < chance;
  // A large sum is harder to keep quiet.
  const leaked = !won && rng.next() < 0.3 * (1 + 0.25 * doublings(stake));
  c.rng = rng.state;
  const vars = { seat: ref.seat(seat), party: ref.party(from) };
  const done = (key: string, tone: NewsItem['tone']) => {
    const item = pushNews(c, { party: c.player, key, vars, tone });
    record(world, c, before, item);
    return item;
  };
  if (won) {
    defect(c, seat, from, c.player);
    // Everyone knows what it took, when it took that much: the party that was left pays for it in standing, the buyer too.
    if (stake > 1) { shiftUnity(c, from, -2 * doublings(stake)); for (const row of c.dyn.support.nat) row[c.player] -= 0.004 * doublings(stake); }
    return done(stake > 1 ? 'news.court.bought' : 'news.court.won', 'good');
  }
  if (leaked) {
    for (const row of c.dyn.support.nat) row[c.player] -= 0.01;
    shiftRelation(c, c.player, from, -10);
    return done('news.court.leaked', 'bad');
  }
  return done('news.court.failed', 'neutral');
}

// ---------- scenes ----------

export function addScene(c: Campaign, scene: Omit<Scene, 'id'>): void {
  c.inbox.push({ id: c.nextScene++, ...scene });
}

/**
 * Answers a campaign scene. Pact offers: 0 accept, 1 decline, 2 talk it over
 * (the offer lapses and the player opens talks themselves). Poaching: 0 pay to
 * keep them, 1 appeal to loyalty, 2 let them go.
 */
export function resolveCampaignScene(world: World, c: Campaign, scene: Scene, choice: number): void {
  const me = c.player;
  if (scene.kind === 'agenda') resolveAgenda(world, c, scene, choice);
  else if (scene.kind === 'pactOffer' && scene.from !== null) {
    const prop = { give: scene.give ?? [], get: scene.get ?? [] };
    if (choice === 0 && beforeNomination(c) && !inPact(c, me, scene.from)) signPact(world, c, me, scene.from, prop);
    else if (choice === 1) shiftRelation(c, me, scene.from, -3);
  } else if (scene.kind === 'poach' && scene.from !== null && scene.seat) {
    const pc = c.parties[me]!;
    const price = scaled(world, COST.keepMoney);
    const rng = new Rng(c.rng);
    const stays = choice === 0 && pc.funds >= price ? true : choice === 2 ? false : rng.next() < (pc.unity / 100) * 0.9;
    c.rng = rng.state;
    if (choice === 0 && pc.funds >= price) pc.funds -= price;
    const vars = { seat: ref.seat(scene.seat), party: ref.party(scene.from) };
    if (stays) pushNews(c, { party: me, key: 'news.poach.kept', vars, tone: 'good' });
    else {
      defect(c, scene.seat, me, scene.from);
      pushNews(c, { party: me, key: 'news.poach.lost', vars, tone: 'bad' });
    }
  }
}

// ---------- what the other leaders get up to ----------

/**
 * The rivals' week of politics, before nomination day: pacts among themselves,
 * pact offers to the player, and raids on each other's sitting members.
 */
export function rivalDiplomacy(world: World, c: Campaign): void {
  if (!hasDiplomacy(world) || !beforeNomination(c)) return;
  const me = c.player;
  const rng = new Rng(c.rng);
  const now = truth(world, c);
  const ai = others(c, me);
  const agree = (a: number, b: number, prop: PactProposal) =>
    assessPact(world, c, a, b, prop).reply === 'ok' && assessPact(world, c, b, a, { give: prop.get, get: prop.give }).reply === 'ok';

  // Pacts between rivals who get on and have a common problem.
  for (const a of ai) for (const b of ai) {
    if (a >= b || inPact(c, a, b) || relation(c, a, b) < 15) continue;
    const prop = draftPact(world, c, a, b, 'targeted', now);
    if (prop.give.length + prop.get.length < 2 || !agree(a, b, prop) || rng.next() > 0.5) continue;
    signPact(world, c, a, b, prop);
  }

  // A friendly leader may put a pact to the player. One offer each.
  for (const p of ai) {
    if (c.offered.includes(p) || inPact(c, me, p) || relation(c, me, p) < 15) continue;
    const prop = draftPact(world, c, me, p, 'targeted', now);
    if (prop.give.length + prop.get.length < 2 || !agree(me, p, prop) || rng.next() > 0.6) continue;
    c.offered.push(p);
    addScene(c, { kind: 'pactOffer', from: p, give: prop.give, get: prop.get });
  }

  // Raids on the player's sitting members; a divided party is easier pickings.
  const mine = c.parties[me]!;
  // A rival with a deep purse raids more often: the richest of them adds up to fifteen points.
  const richest = Math.max(0, ...ai.map((p) => c.parties[p]!.funds));
  const purse = Math.min(0.15, 0.075 * (richest / scaled(world, 2_000_000)));
  if (rng.next() < clamp(0.1 + (60 - mine.unity) / 200 + purse, 0.05, 0.5)) {
    // Whoever is closest to taking the seat does the courting.
    const suitor = (i: number) => (now.seats[i].winner !== me ? now.seats[i].winner : now.seats[i].runnerUp);
    const targets = world.seats.map((s, i) => ({ s, i })).filter(({ s, i }) =>
      holder(world, i) === me && !c.katak.includes(s.id) && now.seats[i].margin < 0.12 &&
      suitor(i) >= 0 && !!c.parties[suitor(i)] && contests(world, c, i, suitor(i)) && contests(world, c, i, me));
    if (targets.length) {
      const { s, i } = targets[rng.int(targets.length)];
      addScene(c, { kind: 'poach', from: suitor(i), seat: s.id });
    }
  }

  // Now and then one rival's member crosses to another.
  if (rng.next() < 0.12) {
    const weakest = [...ai].sort((x, y) => c.parties[x]!.unity - c.parties[y]!.unity)[0];
    const seats = world.seats.map((s, i) => ({ s, i })).filter(({ s, i }) => {
      const to = now.seats[i].winner === weakest ? now.seats[i].runnerUp : now.seats[i].winner;
      return holder(world, i) === weakest && !c.katak.includes(s.id) && now.seats[i].margin < 0.1 && to !== me && !!c.parties[to] && contests(world, c, i, weakest);
    });
    if (seats.length) {
      const { s, i } = seats[rng.int(seats.length)];
      const to = now.seats[i].winner === weakest ? now.seats[i].runnerUp : now.seats[i].winner;
      defect(c, s.id, weakest, to);
      pushNews(c, { party: to, key: 'news.katak', vars: { seat: ref.seat(s.id), from: ref.party(weakest), to: ref.party(to) }, tone: 'neutral' });
    }
  }
  c.rng = rng.state;
}

/** Scenes the player left unanswered are settled the cautious way when the week ends. */
export function settleInbox(world: World, c: Campaign): void {
  for (const scene of c.inbox) resolveCampaignScene(world, c, scene, scene.kind === 'pactOffer' || scene.kind === 'agenda' ? 2 : 1);
  c.inbox = [];
}

/** Seats where the line-up differs from last time because of pacts. */
/** Seats where a party stands aside for another under a pact; seats a party made by the player has left unfielded are not pacts. */
export const pactSeats = (c: Campaign) => Object.values(c.standDowns).filter((s) => s.some((v) => v >= 0)).length;

