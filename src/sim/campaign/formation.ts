import { majorityLine, type World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { N_PARTIES, PARTY_IDS } from '../types';
import { scaled } from './actions';
import { AFFINITY, DEMANDS, WANTS, consistent, dealsUnityCost, demandUnityCost, offerUnityCost } from './cast';
import { addScene, inPact, relation, shiftRelation, shiftUnity } from './diplomacy';
import { pushNews, ref } from './news';
import { deliverable, demandsOpen, offerProblem, postsLeft, seniorsFree, signedWith, struck } from './offers';
import type { Campaign, DemandId, Difficulty, Formation, Offer, Outcome, Scene } from './types';

export { demandsBarred, demandsOpen, offerProblem, postsKept, postsLeft, seniorsFree, type OfferProblem } from './offers';

const OTH = PARTY_IDS.indexOf('oth');

/** Meetings the player can fit into one day of talks. */
export const MEETINGS = 3;
/** A party signs when an offer is worth this much to it. */
const AGREE = 1;
/** A leader who wanted the top job needs more than that to settle for less. */
const AGREE_CLAIMANT = 1.2;
/** How much better a new offer must be before a party breaks its word. */
const SWITCH = 0.25;
const SWITCH_INDEP = 0.15;
const HOLDOUT = 0.08;
const RIVAL_PACE: Record<Difficulty, number> = { easy: -0.15, normal: 0, hard: 0.1 };

export const emptyOffer = (): Offer => ({ posts: 0, senior: null, demands: [], cash: 0 });

const rules = (world: World) => world.rules.formation!;

/** Seats a claimant can show the Palace: its own, the parties signed up to it, and independents. */
export function pledged(f: Formation, k: number): number {
  let n = 0;
  f.pledge.forEach((to, p) => { if (to === k && p !== OTH) n += f.seats[p]; });
  for (const i of f.indep) if (i.pledge === k) n++;
  return n;
}

/** Parties that hold seats and so have something to bargain with. Independents come last. */
export const blocs = (f: Formation) => f.seats.map((n, p) => (n > 0 ? p : -1)).filter((p) => p >= 0);

/** The cabinet posts a party would expect for its size, with a premium for those who know they are needed. */
export function fairPosts(world: World, f: Formation, bloc: number): number {
  return Math.max(0.5, (rules(world).cabinet * f.seats[bloc]) / majorityLine(world)) * WANTS[PARTY_IDS[bloc]].premium;
}

/** The size of envelope a party of this size would call generous. */
export function cashRef(world: World, f: Formation, bloc: number): number {
  return scaled(world, 300_000 * clamp(f.seats[bloc] / 10, 0.3, 2));
}

/**
 * What an offer from claimant `k` is worth to a party: 1 or more and they will
 * sign. Posts, the senior post they want, their demands, money, how they get
 * on with the claimant, how far apart their supporters are, and how likely the
 * claimant looks to win all count.
 */
export function offerValue(world: World, c: Campaign, bloc: number, k: number, offer: Offer): number {
  const f = c.formation!;
  const w = WANTS[PARTY_IDS[bloc]];
  let u = w.posts * Math.min(1.5, offer.posts / fairPosts(world, f, bloc));
  if (offer.senior) u += offer.senior === w.senior ? w.seniorWorth : w.seniorWorth / 2;
  for (const d of offer.demands) u += w.demands[d] ?? 0.03;
  u += w.cash * Math.min(1, offer.cash / cashRef(world, f, bloc));
  u += (relation(c, bloc, k) / 100) * 0.5 + AFFINITY[bloc][k] * 0.3;
  u += 0.3 * Math.min(1, pledged(f, k) / majorityLine(world));
  if (k === c.player && c.understandings.includes(bloc)) u += 0.3;
  if (inPact(c, k, bloc)) u += 0.3;
  if (f.unityAdvice) u += 0.1;
  return u;
}

const isClaimant = (f: Formation, p: number) => f.claimants.includes(p);

/** While there is time left, leaders hold out for a better offer: each day in hand raises their price. */
const holdout = (f: Formation) => HOLDOUT * Math.max(0, f.deadline - f.day);

/** What a party needs from an offer before it will sign with claimant `k`. */
function bar(world: World, c: Campaign, bloc: number, k: number): number {
  const f = c.formation!;
  const current = f.pledge[bloc];
  let need = (isClaimant(f, bloc) ? AGREE_CLAIMANT : AGREE) + holdout(f);
  if (current !== null && current !== k && current !== bloc) {
    const held = f.offers[current]?.[bloc];
    if (held) need = Math.max(need, offerValue(world, c, bloc, current, held) + SWITCH);
  }
  return need;
}

/** A leader still in the race will not hear offers until the Palace asks for unity and they are behind. */
export const stillRunning = (f: Formation, bloc: number, k: number) =>
  isClaimant(f, bloc) && !(f.unityAdvice && pledged(f, bloc) < pledged(f, k));

// ---------- parties make up their minds ----------

function drop(c: Campaign, bloc: number, from: number, to: number) {
  shiftRelation(c, bloc, from, -15);
  pushNews(c, {
    party: bloc, key: from === c.player ? 'form.switchedFromYou' : 'form.switched',
    vars: { party: ref.party(bloc), from: ref.party(from), to: ref.party(to) }, tone: from === c.player ? 'bad' : to === c.player ? 'good' : 'neutral',
  });
}

/** A leader gives up their own claim: everyone signed up to them is free again. */
function standAside(f: Formation, p: number) {
  f.claimants = f.claimants.filter((x) => x !== p);
  f.pledge.forEach((to, q) => { if (to === p && q !== p) f.pledge[q] = null; });
  for (const i of f.indep) if (i.pledge === p) i.pledge = null;
}

/** One party weighs the offers on the table and signs, switches or waits. Returns whether anything changed. */
function decide(world: World, c: Campaign, bloc: number): boolean {
  const f = c.formation!;
  // Offers are judged, and signed, for what can actually be delivered.
  for (const k of f.claimants) {
    const offer = f.offers[k]?.[bloc];
    if (offer && k !== bloc && !signedWith(f, bloc, k)) f.offers[k][bloc] = deliverable(world, f, k, bloc, offer);
  }
  const value = (k: number) => (f.offers[k]?.[bloc] && k !== bloc ? offerValue(world, c, bloc, k, f.offers[k][bloc]!) : -Infinity);

  if (bloc === OTH) {
    let changed = false;
    for (const i of f.indep) {
      let best = -1, bestU = -Infinity;
      for (const k of f.claimants) { const u = value(k); if (u > bestU) { bestU = u; best = k; } }
      if (best < 0 || best === i.pledge) continue;
      const held = i.pledge === null ? -Infinity : value(i.pledge) + SWITCH_INDEP;
      if (bestU >= i.bar + holdout(f) && bestU >= held) { i.pledge = best; changed = true; }
    }
    return changed;
  }
  // The player decides for their own party.
  if (bloc === c.player) return false;

  let best = -1, bestU = -Infinity;
  for (const k of f.claimants) {
    if (k === bloc || stillRunning(f, bloc, k)) continue;
    const u = value(k);
    if (u > bestU) { bestU = u; best = k; }
  }
  const current = f.pledge[bloc];
  if (best < 0 || best === current || bestU < bar(world, c, bloc, best)) return false;
  if (isClaimant(f, bloc)) {
    standAside(f, bloc);
    pushNews(c, { party: bloc, key: 'form.concedes', vars: { party: ref.party(bloc), to: ref.party(best) }, tone: best === c.player ? 'good' : 'neutral' });
  } else if (current !== null) drop(c, bloc, current, best);
  else pushNews(c, { party: bloc, key: 'form.signed', vars: { party: ref.party(bloc), to: ref.party(best) }, tone: best === c.player ? 'good' : 'neutral' });
  f.pledge[bloc] = best;
  return true;
}

// ---------- the player's moves ----------

export type Reply = 'accept' | 'tempted' | 'refuse' | 'committed' | 'ambition';
export interface OfferResult { reply: Reply; signed: number }

/** How a party would take an offer from the player, without making it. Only reliable once they have been sounded out. */
export function mood(world: World, c: Campaign, bloc: number, offer: Offer): Reply {
  const f = c.formation!;
  const me = c.player;
  if (bloc !== OTH && stillRunning(f, bloc, me)) return 'ambition';
  const u = offerValue(world, c, bloc, me, offer);
  if (bloc === OTH) {
    const bars = f.indep.map((i) => i.bar + holdout(f)).sort((a, b) => a - b);
    return u >= bars[bars.length - 1] ? 'accept' : u >= bars[0] ? 'tempted' : 'refuse';
  }
  const need = bar(world, c, bloc, me);
  if (u >= need) return 'accept';
  const elsewhere = f.pledge[bloc] !== null && f.pledge[bloc] !== me;
  return u >= need - 0.2 ? 'tempted' : elsewhere && u >= AGREE + holdout(f) - 0.2 ? 'committed' : 'refuse';
}

/** Whether the player is still trying to lead the government. */
export const playerClaims = (c: Campaign) => !!c.formation && c.formation.claimants.includes(c.player);

/** What a government on these terms would cost the player's party in unity. */
export interface UnityBill {
  /** What this offer gives away: its senior post and its concessions, as priced in the offer panel. */
  offer: number;
  /** The whole bill: this offer, every deal already struck, and the cabinet seats the party goes without. */
  total: number;
  /** Where that would leave the party's unity. */
  left: number;
}

/**
 * The unity the player's party would lose if this offer were signed and the
 * government formed on the deals struck so far. It is the sum the appointment
 * settles, worked out before the offer is made. Independents not yet signed
 * are counted as all coming over.
 */
export function unityBill(world: World, c: Campaign, bloc: number, offer: Offer): UnityBill {
  const f = c.formation!;
  const me = c.player;
  const behind = pledged(f, me) + (signedWith(f, bloc, me) ? 0 : f.seats[bloc]);
  const total = dealsUnityCost(me, [...struck(f, me, bloc), offer], rules(world).cabinet, f.seats[me], behind);
  return { offer: offerUnityCost(me, offer), total, left: clamp(Math.round((c.parties[me]?.unity ?? 0) - total), 0, 100) };
}

/** Puts an offer to a party. Costs a meeting. Money changes hands when they sign, and is not returned. */
export function makeOffer(world: World, c: Campaign, bloc: number, offer: Offer): OfferResult | null {
  const f = c.formation;
  const me = c.player;
  if (!f || f.outcome || c.phase !== 'formation' || !playerClaims(c) || f.meetings < 1) return null;
  if (bloc === me || f.seats[bloc] <= 0 || offerProblem(world, c, bloc, offer)) return null;
  const reply = mood(world, c, bloc, offer);
  const wasSigned = signedWith(f, bloc, me);
  const paid = wasSigned ? f.offers[me][bloc]?.cash ?? 0 : 0;
  f.meetings--;
  f.offers[me][bloc] = { ...offer, demands: [...offer.demands] };
  decide(world, c, bloc);
  const signed = bloc === OTH ? f.indep.filter((i) => i.pledge === me).length : f.pledge[bloc] === me ? f.seats[bloc] : 0;
  if (signed > 0) c.parties[me]!.funds -= Math.max(0, offer.cash - paid);
  return { reply: signed > 0 && bloc !== OTH ? 'accept' : reply, signed };
}

/** A quiet conversation to learn what a party really wants. Costs a meeting. */
export function soundOut(c: Campaign, bloc: number): boolean {
  const f = c.formation;
  if (!f || f.outcome || c.phase !== 'formation' || f.meetings < 1 || f.known[bloc] || bloc === c.player || f.seats[bloc] <= 0) return false;
  f.meetings--;
  f.known[bloc] = true;
  if (bloc !== OTH) shiftRelation(c, c.player, bloc, 2);
  return true;
}

/** The player gives up their own claim and takes a rival's offer. Parties signed up to the player are released. */
export function backRival(c: Campaign, k: number): boolean {
  const f = c.formation;
  const me = c.player;
  if (!f || f.outcome || c.phase !== 'formation' || k === me || !f.claimants.includes(k) || !f.offers[k]?.[me]) return false;
  if (playerClaims(c)) standAside(f, me);
  f.pledge[me] = k;
  shiftRelation(c, me, k, 15);
  pushNews(c, { party: me, key: 'form.youBack', vars: { to: ref.party(k) }, tone: 'neutral' });
  return true;
}

/** The player, backing nobody, puts their own name forward again. */
export function claimAgain(c: Campaign): boolean {
  const f = c.formation;
  const me = c.player;
  if (!f || f.outcome || c.phase !== 'formation' || playerClaims(c) || f.pledge[me] !== null) return false;
  f.claimants.push(me);
  f.pledge[me] = me;
  return true;
}

/** Answers a scene from the talks. Unity advice: 0 explore it, 1 press on alone. */
export function resolveFormationScene(c: Campaign, scene: Scene, choice: number): void {
  const f = c.formation;
  if (!f || scene.kind !== 'unityAdvice' || choice !== 0) return;
  for (const k of f.claimants) shiftRelation(c, c.player, k, 10);
}

// ---------- the rivals' moves ----------

/** How open-handed rival claimants are with the offers standing on a given day. They start low and grow anxious. */
function generosity(c: Campaign, day: number): number {
  return clamp(0.65 + 0.18 * (day - 1) + RIVAL_PACE[c.difficulty], 0.4, 1.6);
}

/** Every rival claimant refreshes its offers to the parties it still needs. */
function rivalOffers(world: World, c: Campaign, day: number): void {
  const f = c.formation!;
  const g = generosity(c, day);
  for (const k of f.claimants) {
    if (k === c.player) continue;
    const kc = c.parties[k];
    // What can go to one party only is offered to whoever brings the most seats.
    const promised = new Set<DemandId>();
    for (const b of blocs(f).sort((x, y) => f.seats[y] - f.seats[x])) {
      if (b === k || signedWith(f, b, k) && b !== OTH) continue;
      const w = WANTS[PARTY_IDS[b]];
      const fair = fairPosts(world, f, b);
      const posts = clamp(Math.round(fair * g), f.seats[b] >= 3 ? 1 : 0, Math.max(0, postsLeft(world, f, k, b)));
      const free = seniorsFree(world, f, k, b);
      const big = f.seats[b] >= 0.08 * world.seats.length;
      const senior = big && g >= 1 && free.length ? (w.senior && free.includes(w.senior) ? w.senior : free[0]) : null;
      // A rival swallows the demands that cost it little, and the painful ones only when desperate.
      const stomach = g >= 1.4 ? 8 : 5;
      const open = demandsOpen(world, f, k, b)
        .filter((d) => (w.demands[d] ?? 0) > 0 && demandUnityCost(k, d) <= stomach && !promised.has(d))
        .sort((x, y) => (w.demands[y] ?? 0) - (w.demands[x] ?? 0));
      const demands = consistent(open).slice(0, g < 0.8 ? 0 : g < 1.1 ? 1 : g < 1.4 ? 2 : 3);
      for (const d of demands) if (DEMANDS[d].exclusive) promised.add(d);
      const cash = w.cash >= 0.15 && kc ? Math.round(Math.min(cashRef(world, f, b) * Math.min(1, g * 0.6), kc.funds * 0.3) / 500) * 500 : 0;
      f.offers[k][b] = { posts, senior, demands, cash };
    }
  }
}

/** Everyone with seats reconsiders, biggest first. */
function everyoneDecides(world: World, c: Campaign): void {
  const f = c.formation!;
  for (const b of blocs(f).sort((x, y) => f.seats[y] - f.seats[x])) decide(world, c, b);
}

// ---------- the Palace ----------

const leading = (f: Formation) =>
  [...f.claimants].sort((a, b) => pledged(f, b) - pledged(f, a) || f.seats[b] - f.seats[a])[0];

function advise(c: Campaign): void {
  const f = c.formation!;
  f.unityAdvice = true;
  pushNews(c, { party: null, key: 'form.unityAdvice', tone: 'neutral' });
  if (playerClaims(c)) addScene(c, { kind: 'unityAdvice', from: null });
}

/** The government is settled: work out who is in it and how long it is likely to last. */
function conclude(world: World, c: Campaign, pm: number, minority: boolean): void {
  const f = c.formation!;
  const cabinet = rules(world).cabinet;
  const partners = f.pledge.map((to, p) => (to === pm && p !== pm && p !== OTH ? p : -1)).filter((p) => p >= 0);
  const withIndep = f.indep.some((i) => i.pledge === pm);
  const deals: (Offer | null)[] = f.seats.map((_, p) => (partners.includes(p) || (p === OTH && withIndep) ? f.offers[pm][p] ?? emptyOffer() : null));
  const seats = pledged(f, pm);
  const made = deals.filter((d): d is Offer => d !== null);

  // What the deals cost the leading party's own people, the public's trust and the treasury.
  let trust = 60, treasury = 0;
  for (const d of made) for (const x of d.demands) { trust -= DEMANDS[x].trust; if (DEMANDS[x].treasury) treasury++; }
  // Envelopes come out sooner or later.
  if (made.some((d) => d.cash > 0)) trust -= 10;
  shiftUnity(c, pm, -dealsUnityCost(pm, made, cabinet, f.seats[pm], seats));

  const warmth = partners.length ? partners.reduce((a, p) => a + relation(c, pm, p), 0) / partners.length : 20;
  const unity = c.parties[pm]?.unity ?? 60;
  const stability = clamp(Math.round(
    50 + clamp((seats - majorityLine(world)) * 2, -20, 20) - 4 * Math.max(0, partners.length - 1) +
    warmth / 5 + (unity - 60) / 4 + (clamp(trust, 0, 100) - 60) / 4 - 2 * treasury - (minority ? 25 : 0),
  ), 5, 95);

  f.outcome = { pm, partners, seats, minority, stability, trust: clamp(trust, 0, 100), deals, day: f.day };
  c.phase = 'done';
  c.inbox = [];
  pushNews(c, {
    party: pm, key: minority ? 'form.appointedMinority' : f.day === 0 ? 'form.outright' : 'form.appointed',
    vars: { party: ref.party(pm), n: seats }, tone: pm === c.player ? 'good' : f.pledge[c.player] === pm ? 'neutral' : 'bad',
  });
}

/**
 * Opens the talks after an election. If a party won outright, or a pact did,
 * the Palace has nothing to weigh and the government is settled at once.
 */
export function startFormation(world: World, c: Campaign, tally: number[]): void {
  const r = rules(world);
  const me = c.player;
  const rng = new Rng((c.election?.rng ?? c.seed) ^ 0x2545f491);
  const seats = [...tally];
  const most = Math.max(...seats.filter((_, p) => p !== OTH));
  // Leaders within reach of the largest party try to form the government; the player always may.
  const claimants = seats.map((n, p) => (p !== OTH && n > 0 && (p === me || n >= 0.6 * most) ? p : -1)).filter((p) => p >= 0);
  const f: Formation = {
    day: 1, deadline: r.days, extended: false, meetings: MEETINGS,
    seats, claimants,
    pledge: seats.map((_, p) => (claimants.includes(p) ? p : null)),
    indep: Array.from({ length: seats[OTH] }, () => ({ bar: 0.7 + 0.6 * rng.next(), pledge: null })),
    offers: Array.from({ length: N_PARTIES }, () => new Array<Offer | null>(N_PARTIES).fill(null)),
    known: new Array<boolean>(N_PARTIES).fill(false),
    unityAdvice: false,
    outcome: null,
  };
  c.formation = f;
  c.phase = 'formation';
  c.inbox = [];

  // Pact partners stand by the larger partner, on the usual terms.
  for (const pact of c.pacts) {
    const [big, small] = f.seats[pact.a] >= f.seats[pact.b] ? [pact.a, pact.b] : [pact.b, pact.a];
    if (!f.claimants.includes(big) || f.seats[small] <= 0 || f.pledge[small] === big) continue;
    const w = WANTS[PARTY_IDS[small]];
    const free = seniorsFree(world, f, big, small);
    f.offers[big][small] = {
      posts: clamp(Math.round(fairPosts(world, f, small)), 1, Math.max(1, postsLeft(world, f, big, small))),
      senior: f.seats[small] >= 0.08 * world.seats.length && w.senior && free.includes(w.senior) ? w.senior : null,
      demands: [], cash: 0,
    };
    if (small === me) continue;
    if (f.claimants.includes(small)) standAside(f, small);
    f.pledge[small] = big;
  }

  const winner = f.claimants.find((k) => pledged(f, k) >= majorityLine(world)) ?? seats.findIndex((n, p) => p !== OTH && n >= majorityLine(world));
  if (winner >= 0) {
    if (!f.claimants.includes(winner)) { f.claimants.push(winner); f.pledge[winner] = winner; }
    f.day = 0;
    conclude(world, c, winner, false);
    return;
  }

  pushNews(c, { party: null, key: 'form.start', vars: { n: majorityLine(world), days: f.deadline }, tone: 'neutral' });
  addScene(c, { kind: 'summons', from: null });
  rivalOffers(world, c, 1);
  everyoneDecides(world, c);
}

/**
 * Ends a day of talks. If the player can show a majority the Palace is
 * satisfied there and then. Otherwise the rivals improve their offers, parties
 * reconsider, and the Palace's patience runs down.
 */
export function endDay(world: World, c: Campaign): void {
  const f = c.formation;
  if (!f || f.outcome || c.phase !== 'formation') return;
  const need = majorityLine(world);
  c.inbox = [];
  if (playerClaims(c) && pledged(f, c.player) >= need) return conclude(world, c, c.player, false);

  rivalOffers(world, c, f.day + 1);
  everyoneDecides(world, c);

  // Signatures and parties are not the same thing.
  if (f.day === 2) {
    const rng = new Rng(c.rng);
    const restless = blocs(f).filter((p) => p !== OTH && p !== c.player && !f.claimants.includes(p) && f.seats[p] >= 8 && (c.parties[p]?.unity ?? 100) < 65);
    const rival = f.claimants.find((k) => k !== c.player && restless.some((p) => f.pledge[p] !== k));
    if (restless.length && rival !== undefined) {
      const p = restless.find((x) => f.pledge[x] !== rival)!;
      shiftUnity(c, p, -4);
      pushNews(c, { party: p, key: 'form.rebels', vars: { party: ref.party(p), to: ref.party(rival), n: 3 + rng.int(Math.min(8, f.seats[p] - 2)) }, tone: 'neutral' });
    }
    c.rng = rng.state;
  }

  const ahead = leading(f);
  if (pledged(f, ahead) >= need) return conclude(world, c, ahead, false);

  if (f.day >= f.deadline) {
    if (f.extended) return conclude(world, c, ahead, true);
    f.extended = true;
    f.deadline += 2;
    pushNews(c, { party: null, key: 'form.extended', vars: { days: 2 }, tone: 'neutral' });
    if (!f.unityAdvice) advise(c);
  } else if (!f.unityAdvice && f.day >= Math.ceil(f.deadline / 2)) advise(c);

  f.day++;
  f.meetings = MEETINGS;
}

/** Where the player ended up once the government was formed. */
export type Role = 'pm' | 'partner' | 'opposition';
export function playerRole(c: Campaign, o: Outcome): Role {
  return o.pm === c.player ? 'pm' : o.partners.includes(c.player) ? 'partner' : 'opposition';
}

/** How solid a government looks, in words. */
export const stabilityBand = (s: number) => (s >= 70 ? 'solid' : s >= 50 ? 'steady' : s >= 30 ? 'shaky' : 'doomed');
