import { majorityLine, type World } from '../election';
import { clamp } from '../math';
import { Rng } from '../rng';
import { holderOf, houseTally, seatsHeldBy } from './contests';
import { relation } from './diplomacy';
import { applyEffects, type Effect } from './events';
import { pushNews, ref } from './news';
import { PARTY_IDS } from '../types';
import { isPm } from './office';
import { termIncome } from './career';
import { truth } from './turn';
import { MISSION_KINDS, type Campaign, type FinalPart, type Mission, type MissionKind, type MissionRecord, type Missions, type Outcome } from './types';

// Missions give a career something to aim at beyond the next election. The main ones are offered when a parliament
// opens (take any, all or none) and are judged when the votes are counted: seats to take from a rival, seats to
// hold, a government of several parties, a majority. The side ones come now and then during the term and are judged
// week by week: the party's credibility, its unity, its funds. The game sets how hard each looks (a tier of one to
// three) from where the party stands, and the tier sets both what winning brings and what failing costs. What
// failing costs depends on the kind: a mission to hold seats or to win a majority is dear to lose.

export const MAX_TIER = 3;
/** A main mission runs to the next election; a hard one to the one after. */
export const ELECTIONS_FOR = (tier: number) => (tier >= 3 ? 2 : 1);
/** How long a side mission runs, and how long an offer of one waits to be taken, in weeks of a term. */
export const SIDE_WEEKS = [26, 39, 52] as const;
export const SIDE_OFFER_WAIT = 26;
/** How long an offer of a main mission waits to be taken: after this the offer lapses, and the leader is told when it is close. */
export const MAIN_OFFER_WAIT = 26;
/** A side mission that runs out of time without being met is given this share of its first length again, once. */
export const EXTENSION = 0.5;
/** An offer with this many weeks or fewer left is flagged as running out. */
export const OFFER_WARN = 4;
/** The chance each fourth week that a side mission is offered, while fewer than this many are running or on offer. */
export const SIDE_CHANCE = 0.2;
export const SIDE_AT_ONCE = 2;
export const HISTORY = 40;
/** A state's assembly is measured against the country's 222 seats: seats asked for grow with the square root of its size. */
const FEDERAL = 222;

export const missionsOf = (c: Campaign): Missions => (c.career!.missions ??= { active: [], offers: [], seq: 0, done: [], unseen: [] });
export const isMain = (kind: MissionKind): boolean => kind === 'seize' || kind === 'hold' || kind === 'bloc' || kind === 'majority' || kind === 'final';
/** Whether failing a mission of this kind is dear (the other kinds cost little). */
export const dearToLose = (kind: MissionKind): boolean => kind === 'hold' || kind === 'majority' || kind === 'final';

/**
 * The final mission opens once the leader has won a main mission of each of the four kinds, one of them a hard one. It asks
 * all four at once, over two elections, and is the hardest thing the game asks: to win it is to have mastered a career.
 */
export const FINAL_KINDS = ['seize', 'hold', 'bloc', 'majority'] as const;
export const FINAL_ELECTIONS = 2;
export const finalOpen = (m: Missions): boolean => !m.free && !!m.hard && FINAL_KINDS.every((k) => m.firsts?.includes(k));

const sizeFactor = (world: World) => Math.sqrt(world.seats.length / FEDERAL);
const count = (world: World, base: number) => Math.max(1, Math.round(base * sizeFactor(world)));

// ---------- what winning brings and failing costs ----------

/** Money at general-election scale is what `applyEffects` takes: it is scaled to the contest there. */
export function rewardOf(m: Pick<Mission, 'kind' | 'tier' | 'main'>): Effect[] {
  const t = m.tier;
  // The final mission is paid as nothing else is.
  if (m.kind === 'final') return [{ t: 'funds', n: 1_500_000 }, { t: 'cred', n: 10 }, { t: 'mood', blocs: 'all', n: 0.02 }, { t: 'unity', n: 10 }];
  const money: Effect = { t: 'funds', n: [100_000, 250_000, 450_000][t - 1] };
  // A main mission brings money, standing, a better mood in the country and a party pleased with itself.
  if (m.main) return [money, { t: 'cred', n: 2 * t }, { t: 'mood', blocs: 'all', n: 0.003 * t }, { t: 'unity', n: 2 * t }];
  // A side one brings the other thing the party was short of: money, but not for a mission to raise it.
  if (m.kind === 'credibility') return [money, { t: 'unity', n: 2 * t }];
  if (m.kind === 'unity') return [money, { t: 'cred', n: 2 * t }];
  return [{ t: 'cred', n: 2 * t }, { t: 'unity', n: t }];
}

export function penaltyOf(m: Pick<Mission, 'kind' | 'tier'>): Effect[] {
  const t = m.tier;
  if (m.kind === 'final') return [{ t: 'cred', n: -12 }, { t: 'unity', n: -10 }, { t: 'mood', blocs: 'all', n: -0.004 }];
  if (dearToLose(m.kind)) return [{ t: 'cred', n: -(3 + 2 * t) }, { t: 'unity', n: -(2 + 2 * t) }, { t: 'mood', blocs: 'all', n: -0.002 * t }];
  return [{ t: 'cred', n: -(1 + t) }, { t: 'unity', n: -(1 + t) }];
}

/** What an offer left unanswered costs when its time is up: half of what failing it would have cost. Turning it down is an answer and costs nothing. */
export function lapsePenaltyOf(m: Pick<Mission, 'kind' | 'tier'>): Effect[] {
  return penaltyOf(m).map((e) => (e.t === 'mood' ? { ...e, n: e.n / 2 } : e.t === 'cred' || e.t === 'unity' ? { ...e, n: -Math.max(1, Math.round(-e.n / 2)) } : e));
}

// ---------- where a mission stands ----------

/** What the party has and what it needs: seats won or kept, parties in the government, its own seats, or the level of its credibility, unity or funds. */
export function progressOf(world: World, c: Campaign, m: Mission): { have: number; need: number } {
  const k = c.career!, me = c.player;
  const g = k.government;
  switch (m.kind) {
    case 'seize': case 'hold': return { have: (m.seats ?? []).filter((id) => holderOf(world, c, id) === me).length, need: m.need };
    case 'bloc': {
      const inIt = isPm(c) || g.partners.includes(me);
      return m.party !== undefined ? { have: inIt && (g.pm === m.party || g.partners.includes(m.party)) ? 1 : 0, need: 1 } : { have: inIt ? 1 + g.partners.length : 0, need: m.need };
    }
    case 'majority': return { have: houseTally(world, c)[me] ?? 0, need: m.alone ? m.need : majorityLine(world) };
    case 'final': return { have: (m.parts ?? []).filter((p) => p.done).length, need: (m.parts ?? []).length };
    case 'credibility': return { have: Math.round(k.credibility), need: m.need };
    case 'unity': return { have: Math.round(c.parties[me]!.unity), need: m.need };
    case 'funds': return { have: Math.round(c.parties[me]!.funds), need: m.need };
  }
}

/** Whether the government just formed (or the House just counted: `winners`, by seat, who took each) satisfies a main mission. */
function met(world: World, c: Campaign, m: Mission, made: Outcome, winners?: readonly number[]): boolean {
  const me = c.player;
  const mine = (id: string) => (winners ? winners[world.seatIndex.get(id)!] === me : holderOf(world, c, id) === me);
  switch (m.kind) {
    case 'seize': case 'hold': return (m.seats ?? []).filter(mine).length >= m.need;
    case 'bloc': {
      const members = [made.pm, ...made.partners];
      return members.includes(me) && (m.party !== undefined ? members.includes(m.party) : members.length >= m.need);
    }
    case 'majority': return m.alone ? (winners ? winners.filter((w) => w === me).length : houseTally(world, c)[me] ?? 0) >= m.need : made.pm === me && !made.minority;
    default: return false;
  }
}

/** Whether one part of the final mission is met by this election. */
const partMet = (world: World, c: Campaign, p: FinalPart, made: Outcome, winners: readonly number[]): boolean =>
  met(world, c, { id: 0, main: true, tier: 3, ...p }, made, winners);

// ---------- offering ----------

type Offer = Omit<Mission, 'id'>;

/** How strong the party is, from 1 (small) to 3 (it holds a third of the House or more): the missions offered are set by it. */
function standing(world: World, c: Campaign): 1 | 2 | 3 {
  const share = (houseTally(world, c)[c.player] ?? 0) / world.seats.length;
  return share < 0.12 ? 1 : share < 0.3 ? 2 : 3;
}
const tierFor = (base: 1 | 2 | 3, rng: Rng): 1 | 2 | 3 => clamp(base + [-1, 0, 0, 1][rng.int(4)], 1, MAX_TIER) as 1 | 2 | 3;

/** Seats held by a rival where the party's candidate is within reach, the closest first. */
function reachable(world: World, c: Campaign, within: number): { id: string; gap: number }[] {
  const now = truth(world, c);
  const me = c.player;
  return world.seats
    .map((s, i) => ({ id: s.id, i, o: now.seats[i] }))
    .filter(({ id, i, o }) => holderOf(world, c, id) !== me && world.baseline.contesting[i][me] && o.valid > 0)
    .map(({ id, o }) => ({ id, gap: (Math.max(...o.votes) - o.votes[me]) / o.valid }))
    .filter((x) => x.gap < within)
    .sort((a, b) => a.gap - b.gap);
}

function seize(world: World, c: Campaign, tier: 1 | 2 | 3): Offer | null {
  const within = [0.06, 0.1, 0.16][tier - 1];
  const pool = reachable(world, c, within);
  const n = Math.min(pool.length, count(world, [2, 4, 6][tier - 1]));
  if (n < 1) return null;
  return { kind: 'seize', main: true, tier, seats: pool.slice(0, n).map((x) => x.id), need: n === 1 ? 1 : Math.ceil(n * (tier === 1 ? 1 : 0.7)), elections: ELECTIONS_FOR(tier) };
}

function hold(world: World, c: Campaign, tier: 1 | 2 | 3): Offer | null {
  const now = truth(world, c);
  const mine = seatsHeldBy(world, c, c.player)
    .map((id) => ({ id, margin: now.seats[world.seatIndex.get(id)!].margin }))
    .sort((a, b) => a.margin - b.margin);
  if (mine.length < 2) return null;
  const n = Math.min(mine.length, count(world, [3, 5, 7][tier - 1]));
  // The easy ones are among the safer seats; the hard ones are the narrowest.
  const from = Math.floor((mine.length - n) * [0.7, 0.35, 0][tier - 1]);
  const seats = mine.slice(from, from + n);
  return { kind: 'hold', main: true, tier, seats: seats.map((x) => x.id), need: Math.max(1, n - [0, 1, 2][tier - 1]), elections: ELECTIONS_FOR(tier) };
}

function bloc(world: World, c: Campaign, rng: Rng): Offer | null {
  const k = c.career!, me = c.player, g = k.government;
  const inIt = isPm(c) || g.partners.includes(me);
  const here = inIt ? 1 + g.partners.length : 0;
  const tally = houseTally(world, c);
  const other = PARTY_IDS.indexOf('oth');
  // A particular party, the biggest outside the government.
  const wanted = tally.map((n, p) => ({ n, p })).filter(({ n, p }) => p !== me && p !== other && n > 0 && !!c.parties[p] && p !== g.pm && !g.partners.includes(p)).sort((a, b) => b.n - a.n)[0];
  if (wanted && rng.next() < 0.5) {
    const warm = relation(c, me, wanted.p);
    const tier = (warm < 30 ? 3 : warm < 55 ? 2 : 1) as 1 | 2 | 3;
    return { kind: 'bloc', main: true, tier, need: 2, party: wanted.p, elections: ELECTIONS_FOR(tier) };
  }
  const need = clamp(inIt ? here + 1 : 2, 2, 5);
  const tier = clamp(inIt ? need - here : 2, 1, MAX_TIER) as 1 | 2 | 3;
  return { kind: 'bloc', main: true, tier, need, elections: ELECTIONS_FOR(tier) };
}

function majority(world: World, c: Campaign): Offer | null {
  const line = majorityLine(world);
  const own = houseTally(world, c)[c.player] ?? 0;
  // A party that holds the top job asks to win a majority of its own; any other, to head a government.
  if (isPm(c)) {
    const tier = (own >= line ? 1 : own >= 0.8 * line ? 2 : 3) as 1 | 2 | 3;
    return { kind: 'majority', main: true, tier, need: line, alone: true, elections: ELECTIONS_FOR(tier) };
  }
  // Nobody is asked for the impossible: a party with a tenth of what it needs is not offered the top job.
  if (own < 0.25 * line) return null;
  const tier = (own >= 0.7 * line ? 1 : own >= 0.45 * line ? 2 : 3) as 1 | 2 | 3;
  return { kind: 'majority', main: true, tier, need: line, alone: false, elections: ELECTIONS_FOR(tier) };
}

/** The final mission as it stands for this party: the seats it must take and keep, a government of several parties, and a majority of its own. */
function finale(world: World, c: Campaign): Offer | null {
  const g = c.career!.government;
  const inIt = isPm(c) || g.partners.includes(c.player);
  const parts: FinalPart[] = [];
  const pool = reachable(world, c, 0.2);
  const take = Math.min(pool.length, count(world, 8));
  if (take >= 2) parts.push({ kind: 'seize', seats: pool.slice(0, take).map((x) => x.id), need: Math.ceil(take * 0.7), done: false });
  const now = truth(world, c);
  const mine = seatsHeldBy(world, c, c.player).map((id) => ({ id, margin: now.seats[world.seatIndex.get(id)!].margin })).sort((a, b) => a.margin - b.margin);
  const keep = Math.min(mine.length, count(world, 8));
  if (keep >= 2) parts.push({ kind: 'hold', seats: mine.slice(0, keep).map((x) => x.id), need: Math.max(1, keep - 1), done: false });
  parts.push({ kind: 'bloc', need: clamp((inIt ? 1 + g.partners.length : 1) + 2, 3, 5), done: false });
  parts.push({ kind: 'majority', need: majorityLine(world), alone: true, done: false });
  return parts.length < 3 ? null : { kind: 'final', main: true, tier: 3, need: parts.length, parts, elections: FINAL_ELECTIONS };
}

/** What has to be reached, and in how many weeks, for a side mission. */
function side(world: World, c: Campaign, kind: MissionKind, tier: 1 | 2 | 3): Offer | null {
  const k = c.career!, pc = c.parties[c.player]!;
  const weeks = SIDE_WEEKS[tier - 1];
  const base = { kind, main: false, tier, weeks } as const;
  if (kind === 'credibility') { const need = Math.round(k.credibility + [6, 10, 15][tier - 1]); return need > 95 ? null : { ...base, need }; }
  if (kind === 'unity') { const need = Math.round(pc.unity + [8, 14, 20][tier - 1]); return need > 95 ? null : { ...base, need }; }
  if (kind === 'funds') {
    const weekly = termIncome(world, c).total;
    if (weekly <= 0) return null;
    return { ...base, need: Math.round((pc.funds + weekly * weeks * [0.8, 1.1, 1.5][tier - 1]) / 1000) * 1000 };
  }
  return null;
}

const SIDE_KINDS = MISSION_KINDS.filter((k) => !isMain(k));

function give(m: Missions, pick: Offer): Mission {
  const mission = { ...pick, id: ++m.seq, ...(pick.ttl === undefined && pick.main ? { ttl: MAIN_OFFER_WAIT } : {}) } as Mission;
  m.offers.push(mission);
  return mission;
}

/** The main missions for the parliament that is opening: any not taken from the last are withdrawn, and one of each kind that fits is offered. */
export function offerMain(world: World, c: Campaign): void {
  const k = c.career;
  if (!k || c.phase !== 'term') return;
  const m = missionsOf(c);
  if (m.offered === k.term) return;
  m.offered = k.term;
  m.offers = m.offers.filter((o) => !o.main);
  // A leader who has won the final mission is in free play: nothing more is offered.
  if (m.free) return;
  const rng = new Rng(((c.seed ^ 0x3155) + k.term * 977) >>> 0);
  const base = standing(world, c);
  const picks = [seize(world, c, tierFor(base, rng)), hold(world, c, tierFor(base, rng)), bloc(world, c, rng), majority(world, c)];
  // The final mission waits for whoever has earned it, and comes round again at each parliament until it is won.
  if (finalOpen(m) && !m.active.some((a) => a.kind === 'final')) picks.push(finale(world, c));
  const made = picks.filter((p): p is Offer => p !== null).map((p) => give(m, p));
  if (made.length > 0) pushNews(c, { party: c.player, key: 'news.mission.offers', vars: { n: made.length }, tone: 'neutral' });
  if (made.some((x) => x.kind === 'final')) pushNews(c, { party: c.player, key: 'news.mission.final', tone: 'good' });
}

/** Now and then, during a term, a smaller errand comes along. */
function offerSide(world: World, c: Campaign, rng: Rng): void {
  const m = missionsOf(c);
  const busy = [...m.active, ...m.offers].filter((x) => !x.main);
  if (m.free || busy.length >= SIDE_AT_ONCE || c.career!.week % 4 !== 0 || rng.next() >= SIDE_CHANCE) return;
  const free = SIDE_KINDS.filter((kind) => !busy.some((x) => x.kind === kind));
  if (free.length === 0) return;
  const kind = free[rng.int(free.length)];
  const tier = ([1, 1, 2, 2, 3][rng.int(5)]) as 1 | 2 | 3;
  const pick = side(world, c, kind, tier);
  if (!pick) return;
  give(m, { ...pick, ttl: SIDE_OFFER_WAIT });
  pushNews(c, { party: c.player, key: 'news.mission.side', vars: { mission: ref.mission(kind) }, tone: 'neutral' });
}

// ---------- taking one on, and settling it ----------

/** The player takes an offer on. */
export function acceptMission(c: Campaign, id: number): boolean {
  const m = c.career?.missions;
  const at = m?.offers.findIndex((o) => o.id === id) ?? -1;
  if (!m || at < 0) return false;
  const [mission] = m.offers.splice(at, 1);
  delete mission.ttl;
  m.active.push(mission);
  return true;
}

/** The player turns an offer down. */
export function declineMission(c: Campaign, id: number): boolean {
  const m = c.career?.missions;
  const before = m?.offers.length ?? 0;
  if (!m) return false;
  m.offers = m.offers.filter((o) => o.id !== id);
  return m.offers.length < before;
}

/** The player gives up a mission they took: it counts as failed. */
export function abandonMission(world: World, c: Campaign, id: number): boolean {
  const mission = c.career?.missions?.active.find((a) => a.id === id);
  if (!mission) return false;
  settle(world, c, mission, false);
  return true;
}

/** Ends a mission one way or the other: its reward or its price, a line in the news, and a card to show the player. */
function settle(world: World, c: Campaign, mission: Mission, won: boolean, term = c.career!.term): void {
  const m = missionsOf(c);
  m.active = m.active.filter((a) => a.id !== mission.id);
  applyEffects(world, c, won ? rewardOf(mission) : penaltyOf(mission));
  const record: MissionRecord = { kind: mission.kind, main: mission.main, tier: mission.tier, won, term, need: mission.need, ...(mission.parts ? { parts: structuredClone(mission.parts) } : {}), ...(mission.seats ? { seats: mission.seats } : {}), ...(mission.party !== undefined ? { party: mission.party } : {}), ...(mission.alone !== undefined ? { alone: mission.alone } : {}) };
  m.done = [...m.done, record].slice(-HISTORY);
  if (won && mission.main && mission.kind !== 'final') {
    if (!(m.firsts ??= []).includes(mission.kind)) m.firsts.push(mission.kind);
    if (mission.tier === 3) m.hard = true;
  }
  // The final mission won, the career goes on as free play.
  if (won && mission.kind === 'final') { m.free = true; m.offers = []; m.active = []; }
  m.unseen.push(record);
  pushNews(c, { party: c.player, key: won ? 'news.mission.won' : 'news.mission.lost', vars: { mission: ref.mission(mission.kind) }, tone: won ? 'good' : 'bad' });
}

/** The player has seen the cards. */
export function seenMissions(c: Campaign): void {
  if (c.career?.missions) c.career.missions.unseen = [];
}

/** The player has seen the first card. */
export function seenMission(c: Campaign): void {
  c.career?.missions?.unseen.shift();
}

// ---------- the clock ----------

/** One week of a term: side missions run down and are judged, offers wait, and now and then a new errand comes. */
export function missionsWeek(world: World, c: Campaign, rng: Rng): void {
  if (!c.career) return;
  offerMain(world, c);
  const m = c.career.missions;
  if (m) {
    // A change of government between elections (the talks after a fall) may have made a mission good.
    const g = c.career.government;
    const sig = `${g.pm}:${g.partners.join(',')}`;
    if (m.gov !== undefined && m.gov !== sig) missionsFormed(world, c, g);
    m.gov = sig;
    // An offer left too long lapses; the leader is warned when it is close, and told when it has gone.
    const lapsed: Mission[] = [];
    m.offers = m.offers.filter((o) => {
      if (o.ttl === undefined) return true;
      o.ttl -= 1;
      if (o.ttl > 0) {
        if (o.ttl === OFFER_WARN) pushNews(c, { party: c.player, key: 'news.mission.closing', vars: { mission: ref.mission(o.kind), n: OFFER_WARN }, tone: 'neutral' });
        return true;
      }
      pushNews(c, { party: c.player, key: 'news.mission.lapsed', vars: { mission: ref.mission(o.kind) }, tone: 'bad' });
      lapsed.push(o);
      return false;
    });
    // An offer left unanswered is a choice made by default, and it costs the party something.
    for (const o of lapsed) applyEffects(world, c, lapsePenaltyOf(o));
    for (const a of [...m.active].filter((x) => !x.main)) {
      a.weeks = (a.weeks ?? 0) - 1;
      const { have, need } = progressOf(world, c, a);
      if (have >= need) settle(world, c, a, true);
      else if ((a.weeks ?? 0) <= 0) {
        // The decisions that would help may not have come up in the time: a mission out of time is given a second wind, once, before it is lost.
        if (!a.extended) {
          a.extended = true;
          a.weeks = Math.round(SIDE_WEEKS[a.tier - 1] * EXTENSION);
          pushNews(c, { party: c.player, key: 'news.mission.extended', vars: { mission: ref.mission(a.kind), n: a.weeks }, tone: 'neutral' });
        } else settle(world, c, a, false);
      }
    }
  }
  offerSide(world, c, rng);
}

/** The votes are counted and the government formed: each main mission is judged. A mission to take or win something is won as soon as it is, and lost when its elections are used up; a mission to hold is lost at the first election it is not kept, and won when the last passes. */
export function missionsElection(world: World, c: Campaign, made: Outcome, winners: readonly number[]): void {
  const m = c.career?.missions;
  if (!m) return;
  for (const a of [...m.active].filter((x) => x.main)) {
    // The election was the last parliament's: the career has moved on to the next by the time it is counted.
    const held = c.career!.term - 1;
    if (a.kind === 'final') {
      // Each part but the seats to hold is done once, at any election in the window; the seats to hold must be held at the election that wins it.
      const parts = a.parts ?? [];
      for (const p of parts) if (p.kind !== 'hold' && !p.done && partMet(world, c, p, made, winners)) p.done = true;
      const holding = parts.filter((p) => p.kind === 'hold');
      for (const p of holding) p.done = partMet(world, c, p, made, winners);
      a.elections = (a.elections ?? 1) - 1;
      if (parts.every((p) => p.done)) settle(world, c, a, true, held);
      else if (a.elections <= 0) settle(world, c, a, false, held);
      continue;
    }
    const ok = met(world, c, a, made, winners);
    a.elections = (a.elections ?? 1) - 1;
    if (a.kind === 'hold') {
      if (!ok) settle(world, c, a, false, held);
      else if (a.elections <= 0) settle(world, c, a, true, held);
    } else if (ok) settle(world, c, a, true, held);
    else if (a.elections <= 0) settle(world, c, a, false, held);
  }
}

/** A new government was formed between elections: a mission to govern with others, or to lead, may be won by it (it is never lost by it). */
export function missionsFormed(world: World, c: Campaign, made: Outcome): void {
  const m = c.career?.missions;
  if (!m) return;
  for (const a of [...m.active].filter((x) => x.kind === 'bloc' || (x.kind === 'majority' && !x.alone))) {
    if (met(world, c, a, made)) settle(world, c, a, true);
  }
}

